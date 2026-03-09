const express = require('express');
const { pool } = require('../database/connection');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth');
const logger = require('../utils/logger');

const router = express.Router();

// GET /api/logs - histórico de pesquisas (admin vê tudo, user vê apenas da sua empresa)
router.get('/', authMiddleware, async (req, res) => {
    try {
        let query;
        let params;

        if (req.user.role === 'admin' || req.user.role === 'dev') {
            query = `
        SELECT sl.id, sl.document_type, sl.results_count, sl.searched_at,
               u.name as user_name, u.email as user_email,
               c.name as company_name
        FROM search_logs sl
        LEFT JOIN users u ON sl.user_id = u.id
        LEFT JOIN companies c ON sl.company_id = c.id
        ORDER BY sl.searched_at DESC
        LIMIT 200
      `;
            params = [];
        } else {
            query = `
        SELECT sl.id, sl.document_type, sl.results_count, sl.searched_at,
               u.name as user_name
        FROM search_logs sl
        LEFT JOIN users u ON sl.user_id = u.id
        WHERE sl.company_id = $1
        ORDER BY sl.searched_at DESC
        LIMIT 100
      `;
            params = [req.user.companyId];
        }

        const result = await pool.query(query, params);
        res.json({ logs: result.rows });
    } catch (err) {
        logger.error('Erro ao buscar logs:', err);
        res.status(500).json({ error: 'Erro interno.' });
    }
});

module.exports = router;
