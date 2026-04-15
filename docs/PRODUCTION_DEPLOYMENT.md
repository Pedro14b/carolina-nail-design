# 🚀 Guia de Deployment - Produção

## 📋 Índice

1. [Preparação](#preparação)
2. [Deploy Backend](#deploy-backend)
3. [Deploy Banco de Dados](#deploy-banco-de-dados)
4. [Deploy Frontend](#deploy-frontend)
5. [Domínio e SSL](#domínio-e-ssl)
6. [Monitoramento](#monitoramento)
7. [Backup na Nuvem](#backup-na-nuvem)

---

## 🔧 Preparação

### Checklist Pré-Deploy

- [ ] Todos os 20 testes passando
- [ ] `.env` configurado corretamente
- [ ] Backend testado localmente
- [ ] Frontend testado localmente
- [ ] Backups funcionando
- [ ] Senha do admin alterada
- [ ] JWT_SECRET alterado para valor aleatório forte
- [ ] Database.json removido do git
- [ ] Credentials.json não commitado

### Valores a Alterar para Produção

```env
# ❌ Seu local (NUNCA usar em produção)
NODE_ENV=development
JWT_SECRET=sua_chave_secreta_muito_segura_aqui
DB_PASSWORD=password

# ✅ Produção (SEMPRE alterar)
NODE_ENV=production
JWT_SECRET=$(openssl rand -base64 32)  # Gerar valor aleatório
DB_PASSWORD=SenhaForte123!@#ABC
ADMIN_PASSWORD=OutraSenhaForte456!@#DEF
```

---

## 🌐 Deploy Backend

### Opção 1: Render.com (Recomendado - Grátis até 5 apps)

**Vantagens:**
- ✅ Deploy automático via Git
- ✅ Suporta Node.js natively
- ✅ Free tier com 750 horas/mês
- ✅ HTTPS automático
- ✅ Variáveis de ambiente seguras

**Passos:**

#### 1. Preparar repositório
```bash
cd backend

# Criar arquivo render.yaml
touch render.yaml
```

**render.yaml**:
```yaml
services:
  - type: web
    name: carolina-nail-api
    env: node
    plan: free
    buildCommand: npm install
    startCommand: npm run start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3000
      - key: JWT_SECRET
        generateValue: true
      - key: DB_HOST
        value: sua-db-host.c.neon.tech  # Será preenchido depois
      - key: DB_PORT
        value: 5432
      - key: DB_NAME
        value: carolina_nail_design
      - key: DB_USER
        fromDatabase: true  # Database connection
```

#### 2. Deploy
1. Ir para https://render.com
2. Conectar GitHub
3. Clicar "New +" → "Web Service"
4. Selecionar repositório
5. Deixar auto-detect fazer seu trabalho
6. Deploy!

**Resultado**: Seu backend em https://carolina-nail-api.onrender.com

---

### Opção 2: Railway (Alternativo)

```bash
# Instalar CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
railway up

# Ver URL
railway open
```

---

### Opção 3: AWS EC2 (Mais complexo, mais controle)

```bash
# 1. Criar instância EC2 (Ubuntu 20.04)
# 2. SSH para instância
ssh -i sua-chave.pem ubuntu@seu-ip

# 3. Instalar Node
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# 4. Clonar código
git clone seu-repo backend

# 5. Instalar dependências
cd backend && npm install

# 6. Criar .env
cp .env.example .env
nano .env  # Editar com sua conexão ao RDS

# 7. Rodar com PM2 (keep alive)
npm install -g pm2
pm2 start "npm run start" --name "carolina-api"
pm2 save
pm2 startup

# 8. Nginx reverse proxy
sudo apt install nginx
# Configurar /etc/nginx/sites-available/default
# Ouvir na porta 80 e redirecionar para 3000
```

---

## 💾 Deploy Banco de Dados

### Opção 1: Neon (Recomendado - PostgreSQL serverless)

**Vantagens:**
- ✅ PostgreSQL gerenciado
- ✅ Free tier: 3 projects, autosleep
- ✅ Backups automáticos
- ✅ HTTPS nativo
- ✅ Escalável

**Passos:**

1. Ir para https://neon.tech
2. Sign up com GitHub
3. Criar novo projeto
4. Copiar connection string:
   ```
   postgresql://user:password@ec2-xxx.amazonaws.com:5432/carolina?sslmode=require
   ```
5. Adicionar em .env:
   ```env
   DATABASE_URL=postgresql://user:password@...
   DB_HOST=ec2-xxx.amazonaws.com
   DB_USER=user
   DB_PASSWORD=password
   ```

---

### Opção 2: Supabase (Alternativo)

```
1. Ir para https://supabase.com
2. Criar novo projeto
3. Project Settings → Database
4. Copiar "Connection string"
5. Usar em .env como DATABASE_URL
```

---

### Opção 3: AWS RDS

```
1. Ir para AWS Console → RDS
2. Create Database → PostgreSQL
3. db.t2.micro (free tier)
4. Enable backup
5. Criar security group para permitir porta 5432
6. Conexão: postgresql://admin:password@endpoint:5432/carolina
```

---

## 📱 Deploy Frontend

### Opção 1: Expo Go (Mais Rápido)

```bash
cd frontend

# Build para produção
npm run build

# Publicar no Expo
eas build --platform ios --platform android

# Resultado: Links para download APK/IPA
```

**Resultado**: Seu app disponível para download

---

### Opção 2: Play Store / App Store

#### Android (Google Play Store):
1. Gerar APK/AAB:
   ```bash
   eas build --platform android --release
   ```
2. Ir para https://play.google.com/console
3. Criar novo app
4. Upload do arquivo .aab
5. Preencher informações (descrição, screenshots)
6. Submit para review (2-3 horas)

#### iOS (App Store):
1. Gerar IPA:
   ```bash
   eas build --platform ios --release
   ```
2. Ir para https://appstoreconnect.apple.com
3. Criar novo app
4. Upload via Xcode ou Transporter
5. Submit para review (24-48 horas)

---

### Opção 3: Web Hosting (Alternativo)

Se quiser versão web também:

```bash
# Build web
npm run build:web

# Deploy em Vercel (recomendado)
npm install -g vercel
vercel

# Ou Netlify
npm install -g netlify-cli
netlify deploy
```

---

## 🔒 Domínio e SSL

### Registrar Domínio

```
1. Ir para https://www.namecheap.com ou simular.com.br
2. Pesquisar: carolinanaildesign.com.br
3. Registrar por 1 ano (~R$ 50-80)
4. Apontar DNS para Render/Railway/AWS
```

### SSL Automático

**Render**: Automático ✅
**Railway**: Automático ✅
**AWS**: Usar ACM (AWS Certificate Manager)

---

## 🎯 Monitoramento

### Logs em Produção

```bash
# Render
render logs

# Railway
railway logs

# AWS EC2
ssh ... && tail -f /var/log/application.log
```

### Alertas

```bash
# Instalar New Relic (monitoramento)
npm install newrelic

# No início do server.js
require('newrelic');

# Ir para https://newrelic.com
# Criar aplicação
# Receber alertas por email
```

---

## ☁️ Backup na Nuvem

### Google Drive Automático (Já Configurado)

Se você configurou no local:
```env
GOOGLE_DRIVE_ENABLED=true
GOOGLE_DRIVE_CREDENTIALS_PATH=./credentials.json
```

✅ Backups acontecem automaticamente a cada 24h

---

### AWS S3 (Alternativo)

```bash
# Instalar AWS CLI
pip install awscli

# Configure credenciais
aws configure

# Copiar backups
aws s3 cp backend/backups/ s3://seu-bucket/backups/ --recursive
```

---

## 📋 Checklist de Deploy

### Pré-Deploy:
- [ ] .env pronto com senhas fortes
- [ ] JWT_SECRET alterado
- [ ] Admin password alterado
- [ ] Tests passando
- [ ] Código commitado e pusheado

### Backend:
- [ ] Deploy em Render/Railway/AWS
- [ ] Banco de dados em Neon/Supabase
- [ ] Variáveis de ambiente configuradas
- [ ] Teste GET /api/appointments (deve retornar dados)

### Frontend:
- [ ] Build feito com sucesso
- [ ] API_URL apontando para produção
- [ ] Deploy no Expo/Play Store/App Store
- [ ] Testar login com backend remoto

### Pós-Deploy:
- [ ] Testar fluxo completo end-to-end
- [ ] Verificar logs para erros
- [ ] Testar backup na nuvem
- [ ] Testar export CSV
- [ ] Comunicar ao cliente

---

## 🎓 Arquitetura Final (Produção)

```
┌─────────────────────────────────────┐
│     Clientes (Android/iOS/Web)      │
│     via App Store / Play Store       │
└────────────────┬────────────────────┘
                 │
                 │ HTTPS
                 ▼
      ┌──────────────────────┐
      │  Render/Railway/AWS   │
      │   Backend Node.js     │
      │   (Port 443)          │
      └──────────┬───────────┘
                 │
                 │ SQL
                 ▼
      ┌──────────────────────┐
      │  Neon/Supabase/RDS   │
      │   PostgreSQL DB      │
      │   (Backups 24h)      │
      └──────────────────────┘
                 │
                 │ Sync Daily (3 AM)
                 ▼
      ┌──────────────────────┐
      │    Google Drive      │
      │   Backup Automático  │
      │   (15GB grátis)      │
      └──────────────────────┘
```

---

## 💰 Custo Estimado Mensal

| Serviço | Free | Pago | Recomendação |
|---------|------|------|-----------|
| Backend (Render) | $0-13/mês | $7+/mês | Free tier |
| DB (Neon) | $0/mês | $15+/mês | Free tier |
| Google Drive | 15GB | $10/100GB | Free tier |
| Domain | - | R$ 50/ano | Necessário |
| Email SMTP | - | $10-20/mês | Opcional |
| SMS (opcional) | - | R$ 0.25/msg | Conforme uso |
| **TOTAL** | **~R$ 5-10** | **~R$ 50+** | **~R$ 60/ano** |

---

## 🆘 Troubleshooting Produção

| Problema | Causa | Solução |
|----------|-------|---------|
| 502 Bad Gateway | Backend down | SSH e verificar PM2 |
| CORS Error | Frontend em domínio diferente | Adicionar origin em CORS |
| DB Connection Timeout | Firewall bloqueando | Liberar IP em security group |
| Backup falha | Google Drive offline | Verificar credenciais |

---

## 📞 Suporte Pós-Deploy

Criar canais de suporte:
- [ ] Email: dev@carolinanaildesign.com
- [ ] WhatsApp: +55 11 XXXXX-XXXX
- [ ] Telegram: @carolinanailsupport
- [ ] Discord: server exclusivo

---

**Última atualização**: Abril de 2026

---

## ✅ Parabéns! 🎉

Seu app está online e pronto para uso!

**Próximas etapas:**
1. Monitorar durante primeira semana
2. Coletar feedback do cliente
3. Fazer melhorias conforme feedback
4. Expandir com novas features
