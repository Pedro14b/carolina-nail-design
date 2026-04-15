require('dotenv').config();
require('express-async-errors');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const sequelize = require('./config/database');
const BackupService = require('./services/BackupService');
const AppointmentConfirmationService = require('./services/AppointmentConfirmationService');

const app = express();

const corsOrigin = process.env.CORS_ORIGIN || process.env.FRONTEND_ORIGIN || '*';
const allowedOrigins = corsOrigin
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`Origin não permitida por CORS: ${origin}`));
  }
};

// Middleware de segurança
app.use(helmet());
app.use(cors(corsOptions));
app.use(morgan('dev'));
app.set('trust proxy', 1);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/clients', require('./routes/clientRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/backup', require('./routes/backupRoutes'));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Sincronizar banco de dados e iniciar servidor
const PORT = process.env.PORT || 3000;
const shouldAlterSync = process.env.DB_ALTER_SYNC === 'true';

sequelize.sync({ alter: shouldAlterSync })
  .then(() => {
    // Agendar backups automáticos
    BackupService.scheduleAutoBackup();
    AppointmentConfirmationService.scheduleDailyConfirmationJob();
    
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📅 Backups automáticos agendados para 3 AM diariamente`);
    });
  })
  .catch(err => {
    console.error('Erro ao sincronizar banco de dados:', err);
    process.exit(1);
  });

module.exports = app;
