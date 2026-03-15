const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../database/connection');
const logger = require('../utils/logger');

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }

    try {
        const result = await pool.query(
            `SELECT u.id, u.name, u.email, u.password_hash, u.role, u.company_id, c.name as company_name, u.must_change_password, u.active 
             FROM users u 
             LEFT JOIN companies c ON u.company_id = c.id
             WHERE u.email = $1 AND u.deleted_at IS NULL`,
            [email.toLowerCase().trim()]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }

        const user = result.rows[0];

        if (!user.active) {
            return res.status(401).json({ error: 'Usuário inativo. Contate o administrador.' });
        }

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) {
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }

        // Atualiza last_login
        await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

        const token = jwt.sign(
            { id: user.id, name: user.name, email: user.email, role: user.role, companyId: user.company_id, companyName: user.company_name },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
        );

        logger.info(`Login: ${user.email} (${user.role}) - ${user.company_name || 'Global Admin'}`);

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                companyId: user.company_id,
                companyName: user.company_name,
                mustChangePassword: user.must_change_password,
            }
        });

    } catch (err) {
        logger.error('Erro no login:', err);
        res.status(500).json({ error: 'Erro interno.' });
    }
});

// POST /api/auth/change-password
const { authMiddleware } = require('../middlewares/auth');
router.post('/change-password', authMiddleware, async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword || newPassword.length < 8) {
        return res.status(400).json({ error: 'Nova senha deve ter no mínimo 8 caracteres.' });
    }

    try {
        const result = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
        const user = result.rows[0];

        const valid = await bcrypt.compare(currentPassword, user.password_hash);
        if (!valid) {
            return res.status(401).json({ error: 'Senha atual incorreta.' });
        }

        const ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 12;
        const newHash = await bcrypt.hash(newPassword, ROUNDS);

        await pool.query(
            'UPDATE users SET password_hash = $1, must_change_password = false, updated_at = NOW() WHERE id = $2',
            [newHash, req.user.id]
        );

        res.json({ message: 'Senha alterada com sucesso.' });
    } catch (err) {
        logger.error('Erro ao trocar senha:', err);
        res.status(500).json({ error: 'Erro interno.' });
    }
});

module.exports = router;
