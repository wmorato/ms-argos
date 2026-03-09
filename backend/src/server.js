require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const logger = require('./utils/logger');

const authRoutes = require('./routes/auth');
const searchRoutes = require('./routes/search');
const companiesRoutes = require('./routes/companies');
const usersRoutes = require('./routes/users');
const logsRoutes = require('./routes/logs');
const dashboardRoutes = require('./routes/dashboard');
const providersRoutes = require('./routes/providers');

const { initDb } = require('./database/connection');

const app = express();
const PORT = process.env.BACKEND_PORT || 5040;

app.set('trust proxy', 1);

// ---- Middlewares ----
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS - apenas origens internas
const allowedOrigins = [
    'https://moratosolucoes.com.br',
    'https://www.moratosolucoes.com.br',
    'http://localhost:5173', // Vite dev
    'http://localhost:5040',
];

app.use(cors({
    origin: (origin, cb) => {
        if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
        cb(new Error('Not allowed by CORS'));
    },
    credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Muitas requisições. Tente novamente em 15 minutos.' },
});
app.use(limiter);

// ---- Rotas ----
app.use('/api/auth', authRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/providers', providersRoutes);

// Healthcheck
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'ms-argos-backend', timestamp: new Date().toISOString() });
});

// ---- 404 ----
app.use((req, res) => {
    res.status(404).json({ error: 'Rota não encontrada' });
});

// ---- Error Handler ----
app.use((err, req, res, next) => {
    logger.error('Unhandled error:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
});

// ---- Start ----
(async () => {
    await initDb();
    app.listen(PORT, '0.0.0.0', () => {
        logger.info(`ms-argos backend rodando na porta ${PORT}`);
    });
})();
