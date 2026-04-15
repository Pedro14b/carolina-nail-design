# Carolina Nail Design - Aplicativo de Agendamentos

Uma aplicação mobile completa para gerenciamento de salão de unhas, com agendamentos, controle de clientes, notificações e relatórios financeiros.

## 🎯 Funcionalidades

### ✅ Implementadas
- ✅ Autenticação com telefone e senha
- ✅ Autenticação Biométrica (impressão digital)
- ✅ Gerenciamento de Clientes
- ✅ Sistema de Agendamentos
- ✅ Notificações em tempo real (com personalização)
- ✅ Relatórios Financeiros
- ✅ Relatórios de Atendimentos
- ✅ Banco de dados PostgreSQL
- ✅ API RESTful com Node.js/Express
- ✅ Dashboard com estatísticas

### 🚀 Próximas Implementações
- Push Notifications com Expo
- SMS e Email notifications
- Integração com Payment Gateway
- Histórico de atendimentos
- Avaliações de clientes
- Sistema de promoções e descontos
- Backup automático na nuvem

## 📱 Tecnologias

### Frontend
- **React Native** - Framework mobile cross-platform
- **Expo** - Toolchain para React Native
- **React Navigation** - Navegação entre telas
- **Axios** - Cliente HTTP
- **AsyncStorage** - Armazenamento local
- **Expo Local Authentication** - Autenticação biométrica

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **PostgreSQL** - Banco de dados relacional
- **Sequelize** - ORM para Node.js
- **JWT** - Autenticação jwttoken
- **Bcryptjs** - Hash de senhas

## 🏗️ Estrutura do Projeto

```
carolina-nail-design/
├── backend/                    # Servidor Node.js
│   ├── src/
│   │   ├── controllers/       # Controladores de negócio (inc. backupController)
│   │   ├── models/            # Modelos de banco de dados
│   │   ├── routes/            # Rotas da API (inc. backupRoutes)
│   │   ├── middleware/        # Middlewares (autenticação, etc)
│   │   ├── services/          # Serviços de negócio (inc. BackupService)
│   │   ├── config/            # Configurações do banco
│   │   └── utils/             # Funções utilitárias
│   ├── backups/               # Pasta de backups automáticos (criada em runtime)
│   ├── tests/                 # Testes unitários
│   ├── package.json
│   ├── .env.example
│   ├── credentials.example.json  # Template para Google Drive API
│   └── src/server.js          # Arquivo principal
│
├── frontend/                   # App React Native
│   ├── src/
│   │   ├── screens/           # Telas do aplicativo
│   │   ├── components/        # Componentes reutilizáveis
│   │   ├── services/          # Serviços API
│   │   ├── context/           # Context API (autenticação)
│   │   ├── hooks/             # Custom hooks
│   │   ├── navigation/        # Navegação
│   │   ├── utils/             # Funções utilitárias
│   │   └── assets/            # Imagens, fontes, etc
│   ├── App.js
│   ├── app.json
│   └── package.json
│
├── shared/                     # Código compartilhado
│   ├── types/                 # TypeScript/JSDoc types
│   └── constants/             # Constantes globais
│
└── docs/                       # Documentação
```

## ⚙️ Configuração e Instalação

### Pré-requisitos
- Node.js (v14+)
- PostgreSQL (v12+)
- npm ou yarn
- Android Studio (para Android)
- Xcode (para iOS)

### Backend Setup

1. **Navegar à pasta backend**
   ```bash
   cd backend
   ```

2. **Instalar dependências**
   ```bash
   npm install
   ```

3. **Configurar variáveis de ambiente**
   ```bash
   cp .env.example .env
   nano .env  # Editar com suas configurações
   ```

4. **Variáveis necessárias no `.env`:**
   ```
   NODE_ENV=development
   PORT=3000
   
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=carolina_nail_design
   DB_USER=postgres
   DB_PASSWORD=seu_password
   
   JWT_SECRET=sua_chave_secreta_muito_segura
   JWT_EXPIRE=7d
   
   SMTP_HOST=smtp.gmail.com
   SMTP_USER=seu_email@gmail.com
   SMTP_PASSWORD=sua_senha_app
   ```

5. **Executar servidor**
   ```bash
   npm run dev  # Development com auto-reload
   npm start    # Production
   ```

### Frontend Setup

1. **Navegar à pasta frontend**
   ```bash
   cd frontend
   ```

2. **Instalar dependências**
   ```bash
   npm install
   ```

3. **Criar arquivo `.env` (ou editar em App.js)**
   ```javascript
   REACT_APP_API_URL=http://seu_ip:3000/api
   ```

4. **Executar no Android**
   ```bash
   npm run android
   ```

5. **Executar no iOS**
   ```bash
   npm run ios
   ```

6. **Usar web para desenvolvimento**
   ```bash
   npm run web
   ```

### Banco de Dados

1. **Criar banco de dados**
   ```sql
   CREATE DATABASE carolina_nail_design;
   ```

2. **Tabelas serão criadas automaticamente** ao rodar o servidor (Sequelize sync)

## 📝 Principais Endpoints da API

### Autenticação
- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/login` - Login com telefone/senha
- `POST /api/auth/biometric` - Login com biometria
- `POST /api/auth/refresh` - Renovar token JWT

### Clientes
- `GET /api/clients` - Listar clientes
- `GET /api/clients/:id` - Buscar cliente
- `POST /api/clients` - Criar cliente
- `PUT /api/clients/:id` - Atualizar cliente
- `DELETE /api/clients/:id` - Deletar cliente

### Agendamentos
- `GET /api/appointments` - Listar agendamentos
- `GET /api/appointments/:id` - Buscar agendamento
- `POST /api/appointments` - Criar agendamento
- `PUT /api/appointments/:id` - Atualizar agendamento
- `DELETE /api/appointments/:id` - Cancelar agendamento

### Notificações
- `GET /api/notifications` - Listar notificações
- `PUT /api/notifications/:id/read` - Marcar como lida
- `POST /api/notifications/mark-all-read` - Marcar todas como lidas
- `GET /api/notifications/settings` - Obter configurações
- `POST /api/notifications/settings` - Atualizar configurações

### Relatórios
- `GET /api/reports/financial` - Relatório financeiro
- `GET /api/reports/appointments` - Relatório de atendimentos
- `GET /api/reports/clients` - Relatório de clientes

### Backup e Exportação
- `POST /api/backup/create` - Criar backup manual
- `GET /api/backup/list` - Listar backups
- `GET /api/backup/stats` - Estatísticas de backup
- `GET /api/backup/export` - Exportar para CSV
- `DELETE /api/backup/:filename` - Deletar backup
- `POST /api/backup/restore/:filename` - Restaurar backup

## 📚 Guias de Documentação

### 🌍 Para Começar
- **[LOCAL_SETUP_WINDOWS.md](docs/LOCAL_SETUP_WINDOWS.md)** - Guia passo a passo para Windows
   - Instalar Node.js
   - Instalar PostgreSQL
   - Configurar backend
   - Configurar frontend
   - Testar localmente

### 🧪 Testes
- **[COMPLETE_TESTING_GUIDE.md](docs/COMPLETE_TESTING_GUIDE.md)** - 20 testes práticos
   - Autenticação e login
   - CRUD de clientes, agendamentos, serviços
   - Sistema de backup
   - Fluxo completo da app
   - Testes de segurança

### 💾 Backup e Dados
- **[BACKUP_GUIDE.md](docs/BACKUP_GUIDE.md)** - Guia completo de backups
   - Como o backup automático funciona
   - Como restaurar dados
   - Exemplos de exportação CSV
   - Recuperação de emergência
  
- **[CLOUD_BACKUP_SETUP.md](docs/CLOUD_BACKUP_SETUP.md)** - Configurar backups na nuvem
   - Google Drive automático (Recomendado)
   - AWS S3 (Profissional)
   - Dropbox (Simples)
   - Custo e segurança

### 🚀 Deployment
- **[PRODUCTION_DEPLOYMENT.md](docs/PRODUCTION_DEPLOYMENT.md)** - Deploy para produção
   - Opções de hosting (Render, Railway, AWS)
   - Deploy do banco de dados (Neon, Supabase)
   - Deploy frontend (Play Store, App Store)
   - Domínio e SSL
   - Monitoramento e logs

- **[PRODUCTION_MAIN_STAGE.md](docs/PRODUCTION_MAIN_STAGE.md)** - Etapa principal (sem depender do PC)
   - Backend online com banco em nuvem
   - Configuração da API pública no build
   - Geração de APK para uso real no celular

### 📖 Desenvolvimento
- **[DEVELOPMENT.md](docs/DEVELOPMENT.md)** - Guia técnico detalhado
   - Arquitetura de projeto
   - Convenção de código
   - Como adicionar novas features
   - Estrutura de pastas

## 💾 Sistema de Backup

A aplicação inclui um **sistema automático de backup massivo**:

### ✨ Características:
- ✅ **Backup Automático Diário** - Executa às 3 AM sem envolvimento do usuário
- ✅ **Backup Manual** - Botão no app para fazer backup a qualquer hora
- ✅ **Exportação CSV** - Dados para Excel e planilhas
- ✅ **Restauração de Dados** - Recuperar de qualquer backup anterior
- ✅ **Backup na Nuvem** - Google Drive, AWS S3 ou Dropbox
- ✅ **Histórico Completo** - Todos os backups armazenados e versionados

### 📱 Como Usar (Cliente):
1. Ir para aba **"Backup e Exportação"** no app
2. Ver estatísticas (total de backups, tamanho, próximo backup)
3. Clicar **"Criar Backup Manual"** quando quiser
4. **Exportar dados** em CSV para Excel/análise
5. Ver histórico de todos os backups

### ⏰ Cronograma:
- **Diário 3 AM**: Backup automático completo
- **Manual**: Quando o usuário clicar no botão
- **Google Drive**: Sincronizado automaticamente
- **Retenção**: Mantém últimos 30 dias

## 🔐 Autenticação

O aplicativo usa JWT (JSON Web Tokens) para autenticação:

1. **Fluxo de Login**
   - Usuário entra com telefone e senha
   - Backend valida e gera tokens (access + refresh)
   - Frontend armazena tokens em AsyncStorage
   - Requisições incluem token no header `Authorization: Bearer {token}`

2. **Renovação de Token**
   - Quando token expira, usa refresh token
   - Valida refresh token e gera novo access token
   - Falha na renovação = logout automático

3. **Biometria**
   - Usa Expo Local Authentication
   - Valida impressão digital
   - Autentica com telefone como fallback

## 🎨 Paleta de Cores

- **Primária**: #FF1493 (Rosa Intenso)
- **Secundária**: #FFB6D9 (Rosa Claro)
- **Acento**: #FF69B4 (Hot Pink)
- **Sucesso**: #4CAF50 (Verde)
- **Erro**: #F44336 (Vermelho)
- **Warning**: #FFC107 (Amarelo)

## 📞 Contato e Suporte

Para dúvidas ou sugestões sobre desenvolvimento:
- 📧 Email: contato@carolinanaildesign.com
- 💬 WhatsApp: +55 (11) XXXXX-XXXX

## 📄 Licença

Este projeto é propriedade de Carolina Nail Design. Todos os direitos reservados.

---

**Status do Projeto**: 🚀 Em Desenvolvimento
**Última Atualização**: Abril de 2026
