# Backend - Carolina Nail Design

API REST Node.js com PostgreSQL para gerenciamento de agendamentos.

## 📋 Requisitos

- Node.js 14+
- PostgreSQL 12+
- npm ou yarn

## 🚀 Como Começar

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Banco de Dados

**Criar banco de dados:**
```sql
CREATE DATABASE carolina_nail_design;
```

**Editar arquivo `.env`:**
```bash
cp .env.example .env
```

**Configurações obrigatórias:**
```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=carolina_nail_design
DB_USER=postgres
DB_PASSWORD=sua_senha

JWT_SECRET=uma_chave_muito_segura_aqui
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d
```

### 3. Executar Servidor

**Desenvolvimento (com auto-reload com Nodemon):**
```bash
npm run dev
```

**Produção:**
```bash
npm start
```

Servidor estará disponível em `http://localhost:3000`

## 📂 Estrutura de Pastas

```
src/
├── controllers/        # Lógica de negócio
│   ├── authController.js
│   ├── clientController.js
│   ├── appointmentController.js
│   ├── serviceController.js
│   ├── notificationController.js
│   └── reportController.js
├── models/             # Modelos Sequelize
│   ├── User.js
│   ├── Client.js
│   ├── Appointment.js
│   ├── Service.js
│   ├── Notification.js
│   ├── NotificationSettings.js
│   ├── Transaction.js
│   └── index.js
├── routes/             # Rotas Express
│   ├── authRoutes.js
│   ├── clientRoutes.js
│   ├── appointmentRoutes.js
│   ├── serviceRoutes.js
│   ├── notificationRoutes.js
│   └── reportRoutes.js
├── middleware/         # Middlewares
│   └── auth.js        # JWT e autorização
├── config/             # Configurações
│   └── database.js    # Conexão Sequelize
├── services/           # Serviços adicionais
├── utils/              # Funções utilitárias
└── server.js           # Arquivo principal
```

## 🔐 Autenticação

Endpoints protegidos requerem token JWT no header:

```
Authorization: Bearer seu_token_jwt
```

**Gerar Token:**
1. POST `/api/auth/register` ou `/api/auth/login`
2. Recebe `{ accessToken, refreshToken }`
3. Usar `accessToken` em requisições

**Renovar Token:**
```
POST /api/auth/refresh
{ "refreshToken": "seu_refresh_token" }
```

## 📊 Modelos de Dados

### User
```javascript
{
  id: UUID,
  name: String,
  email: String (opcional),
  phone: String (obrigatório),
  password: String (hash),
  role: 'admin' | 'professional' | 'client',
  profileImage: String,
  isActive: Boolean,
  lastLogin: Date
}
```

### Appointment
```javascript
{
  id: UUID,
  clientId: UUID,
  professionalId: UUID,
  serviceId: UUID,
  date: Date,
  duration: Number, // em minutos
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled',
  totalPrice: Decimal,
  notes: String
}
```

### Transaction
```javascript
{
  id: UUID,
  appointmentId: UUID (opcional),
  type: 'income' | 'expense',
  amount: Decimal,
  category: String,
  date: Date,
  paymentMethod: String
}
```

## 🔗 Endpoints Principais

### Auth
- `POST /api/auth/register` - Registrar
- `POST /api/auth/login` - Login
- `POST /api/auth/biometric` - Login biométrico
- `POST /api/auth/refresh` - Renovar token

### Clients (autenticado)
- `GET /api/clients` - Listar
- `GET /api/clients/:id` - Detalhes
- `POST /api/clients` - Criar
- `PUT /api/clients/:id` - Atualizar
- `DELETE /api/clients/:id` - Deletar

### Appointments (autenticado)
- `GET /api/appointments` - Listar
- `GET /api/appointments/:id` - Detalhes
- `POST /api/appointments` - Criar
- `PUT /api/appointments/:id` - Atualizar
- `DELETE /api/appointments/:id` - Cancelar

### Reports (admin only)
- `GET /api/reports/financial` - Financeiros
- `GET /api/reports/appointments` - Atendimentos
- `GET /api/reports/clients` - Clientes

## 🔍 Exemplo de Requisição

```bash
# Registrar novo usuário
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Maria Silva",
    "phone": "11987654321",
    "password": "SenhaSegura123"
  }'

# Fazer login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "11987654321",
    "password": "SenhaSegura123"
  }'

# Listar clientes (com token)
curl -X GET http://localhost:3000/api/clients \
  -H "Authorization: Bearer seu_token_aqui"
```

## 📈 Relatórios

### Relatório Financeiro
```bash
GET /api/reports/financial?startDate=2026-01-01&endDate=2026-04-08
```

Retorna:
- Total de receitas
- Total de despesas
- Saldo (receita - despesa)
- Lista de transações

### Relatório de Atendimentos
```bash
GET /api/reports/appointments?startDate=2026-01-01&endDate=2026-04-08
```

Retorna:
- Total de agendamentos
- Agendamentos concluídos
- Agendamentos cancelados
- Taxa de conclusão
- Serviços mais populares

## 🔧 Variáveis de Ambiente

```env
# Servidor
NODE_ENV=development
PORT=3000
API_URL=http://localhost:3000

# Banco de Dados
DB_HOST=localhost
DB_PORT=5432
DB_NAME=carolina_nail_design
DB_USER=postgres
DB_PASSWORD=password

# JWT
JWT_SECRET=sua-chave-secreta-muito-longa-e-segura
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# Email (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASSWORD=sua_senha_app
SMTP_TRANSPORT=auto
SMTP_SECURE=false

Opções de transporte:
- `smtp`: usa seu provedor real de email
- `ethereal`: gera um email de teste com link de pré-visualização
- `stream`: captura a mensagem localmente sem enviar
- `auto`: em desenvolvimento usa Ethereal automaticamente; em produção usa SMTP

Para Gmail, use uma App Password e não a senha normal da conta. Sem SMTP configurado, o backend registra o código apenas no log de desenvolvimento.
SMTP_FROM=noreply@carolinanaildesign.com
```

## 🧪 Testes

```bash
# Rodar testes
npm test

# Modo watch
npm run test:watch
```

## 📦 Deploy

### Heroku
```bash
heroku create carolina-nail-design
git push heroku main
heroku config:set JWT_SECRET=sua-chave
```

## 🐛 Debugging

**Mostrar logs SQL:**
```env
NODE_ENV=development  # Já mostra por padrão
```

**Ver variáveis de ambiente:**
```bash
npm run debug
```

## 📚 Dependências Principais

- `express` - Framework web
- `sequelize` - ORM para banco de dados
- `pg` - Cliente PostgreSQL
- `jsonwebtoken` - JWT
- `bcryptjs` - Hash de senhas
- `dotenv` - Variáveis de ambiente
- `cors` - CORS middleware

## 📝 Notas

- Senhas são hasheadas com bcrypt (salt: 10)
- Tokens expiram em 7 dias (configurável)
- Soft delete em clientes (não remove do BD)
- Validações com Joi
- Erro handler global implementado
