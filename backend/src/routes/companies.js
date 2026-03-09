const express = require('express');
const { pool } = require('../database/connection');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth');
const logger = require('../utils/logger');

const router = express.Router();

// GET /api/companies - lista todas (admin)
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, cnpj, name, site, crm, token, token_name, base_url, active, created_at FROM companies WHERE deleted_at IS NULL ORDER BY name'
        );
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.json({ companies: result.rows });
    } catch (err) {
        logger.error('Erro ao listar empresas:', err);
        res.status(500).json({ error: 'Erro interno.' });
    }
});

// POST /api/companies - cria nova empresa (admin)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
    const { cnpj, name, site, crm, token, tokenName, baseUrl } = req.body;

    if (!cnpj || !name || !crm || !token || !baseUrl) {
        return res.status(400).json({ error: 'CNPJ, nome, CRM, token e URL base são obrigatórios.' });
    }

    try {
        const result = await pool.query(
            `INSERT INTO companies (cnpj, name, site, crm, token, token_name, base_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, name, cnpj`,
            [cnpj, name, site || null, crm, token, tokenName || 'chatbot', baseUrl]
        );
        logger.info(`Empresa cadastrada: ${name} (${cnpj})`);
        res.status(201).json({ company: result.rows[0] });
    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({ error: 'CNPJ já cadastrado.' });
        }
        logger.error('Erro ao cadastrar empresa:', err);
        res.status(500).json({ error: 'Erro interno.' });
    }
});

// PATCH /api/companies/:id - atualiza empresa
router.patch('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    const { id } = req.params;
    const { cnpj, name, site, crm, token, tokenName, baseUrl, active } = req.body;

    try {
        // Garantir que undefined vire null para o COALESCE funcionar no Postgres
        const params = [
            cnpj !== undefined ? cnpj : null,
            name !== undefined ? name : null,
            site !== undefined ? site : null,
            crm !== undefined ? crm : null,
            token !== undefined ? token : null,
            tokenName !== undefined ? tokenName : null,
            baseUrl !== undefined ? baseUrl : null,
            active !== undefined ? active : null,
            id
        ];

        logger.info(`PATCH Company ${id}: params=${JSON.stringify(params.map(p => p && typeof p === 'string' && p.length > 20 ? '***' : p))}`);

        const result = await pool.query(
            `UPDATE companies SET
        cnpj = COALESCE($1, cnpj),
        name = COALESCE($2, name),
        site = COALESCE($3, site),
        crm = COALESCE($4, crm),
        token = COALESCE($5, token),
        token_name = COALESCE($6, token_name),
        base_url = COALESCE($7, base_url),
        active = COALESCE($8, active),
        updated_at = NOW()
       WHERE id = $9 AND deleted_at IS NULL RETURNING id, name, cnpj`,
            params
        );

        if (!result.rows.length) {
            return res.status(404).json({ error: 'Empresa não encontrada.' });
        }

        res.json({ company: result.rows[0] });
    } catch (err) {
        logger.error('Erro ao atualizar empresa:', err);
        res.status(500).json({ error: 'Erro interno.' });
    }
});

// DELETE /api/companies/:id - soft delete
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        await pool.query('UPDATE companies SET deleted_at = NOW(), active = false WHERE id = $1', [req.params.id]);
        res.json({ message: 'Empresa desativada com sucesso.' });
    } catch (err) {
        logger.error('Erro ao desativar empresa:', err);
        res.status(500).json({ error: 'Erro interno.' });
    }
});

module.exports = router;
