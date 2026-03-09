const { Pool } = require('pg');
const logger = require('../utils/logger');

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'ms_argos',
    user: process.env.DB_USER || 'u_bd_ms_argos',
    password: process.env.DB_PASSWORD,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});

async function initDb() {
    try {
        const client = await pool.connect();
        logger.info('Conexão com PostgreSQL estabelecida com sucesso.');
        client.release();
        await runMigrations();
    } catch (err) {
        logger.error('Erro ao conectar ao banco de dados:', err);
        process.exit(1);
    }
}

async function runMigrations() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Empresas conveniadas
        await client.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id SERIAL PRIMARY KEY,
        cnpj VARCHAR(18) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        site VARCHAR(255),
        crm VARCHAR(50) NOT NULL DEFAULT 'sgp_tsmx',
        token VARCHAR(255) NOT NULL,
        token_name VARCHAR(100) NOT NULL DEFAULT 'chatbot',
        base_url VARCHAR(500) NOT NULL,
        active BOOLEAN NOT NULL DEFAULT true,
        deleted_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

        // Usuários
        await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'user',
        company_id INTEGER REFERENCES companies(id),
        must_change_password BOOLEAN NOT NULL DEFAULT true,
        active BOOLEAN NOT NULL DEFAULT true,
        deleted_at TIMESTAMP,
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

        // Log de consultas (sem dados pessoais do cliente consultado)
        await client.query(`
      CREATE TABLE IF NOT EXISTS search_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        company_id INTEGER REFERENCES companies(id),
        document_hash VARCHAR(64) NOT NULL,
        document_type VARCHAR(5) NOT NULL DEFAULT 'CPF',
        results_count INTEGER DEFAULT 0,
        searched_at TIMESTAMP DEFAULT NOW()
      )
    `);

        await client.query('COMMIT');
        logger.info('Migrações executadas com sucesso.');
        await runSeeds(client);
    } catch (err) {
        await client.query('ROLLBACK');
        logger.error('Erro nas migrações:', err);
    } finally {
        client.release();
    }
}

async function runSeeds(client) {
    try {
        const bcrypt = require('bcryptjs');
        const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 12;

        // Seed: Empresa IcarusNet
        await client.query(`
      INSERT INTO companies (cnpj, name, site, crm, token, token_name, base_url)
      VALUES ('00.000.000/0001-00', 'IcarusNet', 'https://icarusnet.sgp.tsmx.com.br', 'sgp_tsmx',
              $1, 'chatbot', 'https://icarusnet.sgp.tsmx.com.br/')
      ON CONFLICT (cnpj) DO NOTHING
    `, [process.env.PROVIDER_ICARUSNET_TOKEN || '5188d43c-708f-4bac-b0ae-7f30d6e45eaf']);

        // Seed: Empresa Interbyte
        await client.query(`
      INSERT INTO companies (cnpj, name, site, crm, token, token_name, base_url)
      VALUES ('11.111.111/0001-11', 'Interbyte', 'https://interbyte.sgp.tsmx.com.br', 'sgp_tsmx',
              $1, 'chatbot', 'https://interbyte.sgp.tsmx.com.br/')
      ON CONFLICT (cnpj) DO NOTHING
    `, [process.env.PROVIDER_INTERBYTE_TOKEN || 'ba63ab4f-4995-4175-abe9-bb38ae3b3eee']);

        // Seed: Admin
        const adminHash = await bcrypt.hash('@Palmeirascampeao', BCRYPT_ROUNDS);
        await client.query(`
      INSERT INTO users (name, email, password_hash, role, must_change_password)
      VALUES ('Wilson Morato', 'wilsonmorato@hotmail.com', $1, 'admin', false)
      ON CONFLICT (email) DO NOTHING
    `, [adminHash]);

        // Seed: Dev
        const devHash = await bcrypt.hash('@Palmeirascampeao', BCRYPT_ROUNDS);
        await client.query(`
      INSERT INTO users (name, email, password_hash, role, must_change_password)
      VALUES ('Wilson Morato', 'wilsonmorato@gmail.com', $1, 'dev', false)
      ON CONFLICT (email) DO NOTHING
    `, [devHash]);

        logger.info('Seeds executadas com sucesso.');
    } catch (err) {
        logger.error('Erro nas seeds (não crítico):', err.message);
    }
}

module.exports = { pool, initDb };
