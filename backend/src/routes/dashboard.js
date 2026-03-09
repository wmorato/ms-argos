const express = require('express');
const { pool } = require('../database/connection');
const { authMiddleware } = require('../middlewares/auth');
const logger = require('../utils/logger');

const router = express.Router();

// GET /api/dashboard
router.get('/', authMiddleware, async (req, res) => {
    try {
        const [totalCompanies, totalUsers, totalSearches, recentSearches] = await Promise.all([
            pool.query('SELECT COUNT(*) FROM companies WHERE active = true AND deleted_at IS NULL'),
            pool.query('SELECT COUNT(*) FROM users WHERE active = true AND deleted_at IS NULL'),
            pool.query('SELECT COUNT(*) FROM search_logs'),
            pool.query(`SELECT COUNT(*) FROM search_logs WHERE searched_at >= NOW() - INTERVAL '24 hours'`),
        ]);

        res.json({
            stats: {
                totalCompanies: parseInt(totalCompanies.rows[0].count),
                totalUsers: parseInt(totalUsers.rows[0].count),
                totalSearches: parseInt(totalSearches.rows[0].count),
                searchesLast24h: parseInt(recentSearches.rows[0].count),
            }
        });
    } catch (err) {
        logger.error('Erro no dashboard:', err);
        res.status(500).json({ error: 'Erro interno.' });
    }
});

module.exports = router;
