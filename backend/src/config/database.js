const { Sequelize } = require('sequelize');
require('dotenv').config();

const databaseUrl = process.env.DATABASE_URL;
const sslEnabled = process.env.DB_SSL === 'true' || /sslmode=require/i.test(databaseUrl || '');

const commonOptions = {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: sslEnabled
    ? {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
    : {}
};

const sequelize = databaseUrl
  ? new Sequelize(databaseUrl, commonOptions)
  : new Sequelize(
    process.env.DB_NAME || 'carolina_nail_design',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || 'password',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      ...commonOptions
    }
  );

// Testar conexão
sequelize.authenticate()
  .then(() => {
    console.log('✅ Conexão com banco de dados estabelecida com sucesso!');
  })
  .catch(err => {
    console.error('❌ Erro ao conectar ao banco de dados:', err);
    process.exit(1);
  });

module.exports = sequelize;
