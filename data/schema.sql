-- =============================================
-- ms-argos — Schema PostgreSQL
-- Banco: ms_argos
-- Usuário: u_bd_ms_argos
-- =============================================

-- Empresas conveniadas
CREATE TABLE IF NOT EXISTS companies (
    id           SERIAL PRIMARY KEY,
    cnpj         VARCHAR(18)  NOT NULL UNIQUE,
    name         VARCHAR(255) NOT NULL,
    site         VARCHAR(255),
    crm          VARCHAR(50)  NOT NULL DEFAULT 'sgp_tsmx',
    token        VARCHAR(255) NOT NULL,
    token_name   VARCHAR(100) NOT NULL DEFAULT 'chatbot',
    base_url     VARCHAR(500) NOT NULL,
    active       BOOLEAN      NOT NULL DEFAULT true,
    deleted_at   TIMESTAMP,
    created_at   TIMESTAMP    DEFAULT NOW(),
    updated_at   TIMESTAMP    DEFAULT NOW()
);

-- Usuários do sistema
CREATE TABLE IF NOT EXISTS users (
    id                   SERIAL PRIMARY KEY,
    name                 VARCHAR(255) NOT NULL,
    email                VARCHAR(255) NOT NULL UNIQUE,
    password_hash        VARCHAR(255) NOT NULL,
    role                 VARCHAR(20)  NOT NULL DEFAULT 'user', -- user | admin | dev
    company_id           INTEGER REFERENCES companies(id),
    must_change_password BOOLEAN      NOT NULL DEFAULT true,
    active               BOOLEAN      NOT NULL DEFAULT true,
    deleted_at           TIMESTAMP,
    last_login           TIMESTAMP,
    created_at           TIMESTAMP    DEFAULT NOW(),
    updated_at           TIMESTAMP    DEFAULT NOW()
);

-- Log de pesquisas (sem dados pessoais — LGPD compliance)
CREATE TABLE IF NOT EXISTS search_logs (
    id             SERIAL PRIMARY KEY,
    user_id        INTEGER REFERENCES users(id),
    company_id     INTEGER REFERENCES companies(id),
    document_hash  VARCHAR(64)  NOT NULL,   -- SHA-256 do CPF/CNPJ
    document_type  VARCHAR(5)   NOT NULL DEFAULT 'CPF',
    results_count  INTEGER      DEFAULT 0,  -- número de provedores com pendência
    searched_at    TIMESTAMP    DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_search_logs_searched_at ON search_logs(searched_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_logs_company_id  ON search_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_users_email             ON users(email);
CREATE INDEX IF NOT EXISTS idx_companies_cnpj          ON companies(cnpj);
