const express = require('express');
const crypto = require('crypto');
const { pool } = require('../database/connection');
const { authMiddleware } = require('../middlewares/auth');
const { createCrmAdapter } = require('../crm/CrmFactory');
const logger = require('../utils/logger');

const fs = require('fs');
const path = require('path');

const router = express.Router();

// Mock data path
const mockPath = path.join(__dirname, '../mock_cpf_clients.json');

// POST /api/search
router.post('/', authMiddleware, async (req, res) => {
    const { document } = req.body;

    if (!document) {
        return res.status(400).json({ error: 'Documento (CPF/CNPJ) é obrigatório.' });
    }

    const cleanDoc = document.replace(/\D/g, '');
    const isCpf = cleanDoc.length === 11;

    if (cleanDoc.length !== 11 && cleanDoc.length !== 14) {
        return res.status(400).json({ error: 'Documento inválido. Informe um CPF (11 dígitos) ou CNPJ (14 dígitos).' });
    }

    try {
        // Verifica se é modo teste (Usuário de Acme fazendo consulta CPF)
        const isAcme = req.user.companyName && req.user.companyName.toLowerCase() === 'acme';
        
        if (isAcme && isCpf) {
            let mockData = [];
            try {
                const raw = fs.readFileSync(mockPath, 'utf8');
                mockData = JSON.parse(raw);
            } catch (err) {
                logger.error('Erro ao ler mock data:', err);
                return res.status(500).json({ error: 'Erro ao carregar dados simulados.' });
            }

            // Seleciona 3 aleatórios
            const shuffled = [...mockData].sort(() => 0.5 - Math.random());
            const results = shuffled.slice(0, 3);

            logger.info(`Pesquisa TESTE (Acme): user=${req.user.email} Resultados Fake=3`);
            
            return res.json({ results, isTestMode: true });
        }

        // Busca todas as empresas ativas para consulta real
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
