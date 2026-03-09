const express = require('express');
const bcrypt = require('bcryptjs');
const { pool } = require('../database/connection');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth');
const logger = require('../utils/logger');

const router = express.Router();

// GET /api/users
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT u.id, u.name, u.email, u.role, u.active, u.must_change_password, u.last_login, u.created_at,
              c.name as company_name
       FROM users u
       LEFT JOIN companies c ON u.company_id = c.id
       WHERE u.deleted_at IS NULL
       ORDER BY u.name`
        );
        res.json({ users: result.rows });
    } catch (err) {
        logger.error('Erro ao listar usuários:', err);
        res.status(500).json({ error: 'Erro interno.' });
    }
});

// POST /api/users
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
    const { name, email, password, role, companyId } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios.' });
    }

    try {
        const ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 12;
        const hash = await bcrypt.hash(password, ROUNDS);

        const result = await pool.query(
            `INSERT INTO users (name, email, password_hash, role, company_id, must_change_password)
       VALUES ($1, $2, $3, $4, $5, true) RETURNING id, name, email, role`,
            [name, email.toLowerCase().trim(), hash, role || 'user', companyId || null]
        );

        logger.info(`Usuário criado: ${email}`);
        res.status(201).json({ user: result.rows[0] });
    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({ error: 'E-mail já cadastrado.' });
        }
        logger.error('Erro ao criar usuário:', err);
        res.status(500).json({ error: 'Erro interno.' });
    }
});

// PATCH /api/users/:id
router.patch('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    const { id } = req.params;
    const { name, email, password, role, companyId, active } = req.body;

    try {
        let password_hash = undefined;
        if (password && password.trim().length >= 8) {
            const ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 12;
            password_hash = await bcrypt.hash(password, ROUNDS);
        }

        const result = await pool.query(
            `UPDATE users SET
                name = COALESCE($1, name),
                email = COALESCE($2, email),
                password_hash = COALESCE($3, password_hash),
                role = COALESCE($4, role),
                company_id = CASE WHEN $5 = 'null' THEN NULL WHEN $5 IS NULL THEN company_id ELSE CAST($5 AS INTEGER) END,
                active = COALESCE($6, active),
                updated_at = NOW()
            WHERE id = $7 AND deleted_at IS NULL RETURNING id, name, email`,
            [
                name || null,
                email ? email.toLowerCase().trim() : null,
                password_hash || null,
                role || null,
                companyId === null ? 'null' : (companyId || null),
                active !== undefined ? active : null,
                id
            ]
        );

        if (!result.rows.length) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        res.json({ user: result.rows[0] });
    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({ error: 'E-mail já cadastrado.' });
        }
        logger.error('Erro ao atualizar usuário:', err);
        res.status(500).json({ error: 'Erro interno.' });
    }
});

// DELETE /api/users/:id - soft delete
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        await pool.query('UPDATE users SET deleted_at = NOW(), active = false WHERE id = $1', [req.params.id]);
        res.json({ message: 'Usuário desativado com sucesso.' });
    } catch (err) {
        logger.error('Erro ao desativar usuário:', err);
        res.status(500).json({ error: 'Erro interno.' });
    }
});

module.exports = router;
