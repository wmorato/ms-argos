const express = require('express');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth');
const { pool } = require('../database/connection');

const router = express.Router();

// GET /api/providers - lista CRMs suportados
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
    res.json({
        providers: [
            { id: 'sgp_tsmx', name: 'SGP TSMX', description: 'Sistema de Gerenciamento de Provedores TSMX', status: 'active' },
        ]
    });
});

module.exports = router;
