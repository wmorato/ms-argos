const express = require('express');
const crypto = require('crypto');
const { pool } = require('../database/connection');
const { authMiddleware } = require('../middlewares/auth');
const { createCrmAdapter } = require('../crm/CrmFactory');
const logger = require('../utils/logger');

const router = express.Router();

// POST /api/search
router.post('/', authMiddleware, async (req, res) => {
    const { document } = req.body;

    if (!document) {
        return res.status(400).json({ error: 'Documento (CPF/CNPJ) é obrigatório.' });
    }

    const cleanDoc = document.replace(/\D/g, '');

    if (cleanDoc.length !== 11 && cleanDoc.length !== 14) {
        return res.status(400).json({ error: 'Documento inválido. Informe um CPF (11 dígitos) ou CNPJ (14 dígitos).' });
    }

    try {
        // Busca todas as empresas ativas
        const companiesResult = await pool.query(
            'SELECT id, name, cnpj, crm, token, token_name, base_url FROM companies WHERE active = true AND deleted_at IS NULL'
        );

        const companies = companiesResult.rows;
        if (!companies.length) {
            return res.status(200).json({ results: [], message: 'Nenhuma empresa conveniada cadastrada.' });
        }

        // Executa consultas em paralelo usando o adapter pattern
        const searchPromises = companies.map(company => {
            const adapter = createCrmAdapter(company);
            return adapter.searchClient(cleanDoc);
        });

        const results = await Promise.all(searchPromises);

        // Log da consulta (sem armazenar dado pessoal — apenas hash)
        const docHash = crypto.createHash('sha256').update(cleanDoc).digest('hex');
        const docType = cleanDoc.length === 11 ? 'CPF' : 'CNPJ';
        const totalResults = results.filter(r => r.hasDebt).length;

        await pool.query(
            `INSERT INTO search_logs (user_id, company_id, document_hash, document_type, results_count)
       VALUES ($1, $2, $3, $4, $5)`,
            [req.user.id, req.user.companyId, docHash, docType, totalResults]
        );

        logger.info(`Pesquisa: user=${req.user.email} doc_type=${docType} resultados_com_pendencia=${totalResults}/${companies.length}`);

        res.json({ results });

    } catch (err) {
        logger.error('Erro na pesquisa:', err);
        res.status(500).json({ error: 'Erro ao realizar a pesquisa.' });
    }
});

module.exports = router;
