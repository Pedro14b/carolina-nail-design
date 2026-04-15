# 🎯 Guia de Setup Local - Windows

## 📋 Pré-Requisitos

Antes de começar, você precisa ter:

- [ ] **Node.js** (versão 14+ ou 16+)
- [ ] **PostgreSQL** (versão 12+ ou 15)
- [ ] **Git** (opcional, mas recomendado)
- [ ] **VS Code** (ou seu editor preferido)

---

## 1️⃣ Instalação do Node.js

### Passo 1: Download
1. Acesse: https://nodejs.org/
2. Clique em "LTS" (versão recomendada)
3. Execute o instalador

### Passo 2: Verificar
```bash
node --version
npm --version
```

Deve mostrar algo como:
```
v16.14.0
8.3.1
```

---

## 2️⃣ Instalação do PostgreSQL (Windows)

### Opção A: PostgreSQL Direto (Recomendado)

#### Passo 1: Download
1. Acesse: https://www.postgresql.org/download/windows/
2. Clique em "Download the installer"
3. Escolha versão 15 ou 16

#### Passo 2: Instalar
1. Execute o instalador
2. Deixar porta padrão: **5432**
3. Definir senha do usuário `postgres` (importante!)
4. Marcar: "Add PostgreSQL to PATH"

#### Passo 3: Verificar
Abrir PowerShell e testar:
```powershell
psql --version
```

Deve mostrar:
```
psql (PostgreSQL) 15.2
```

### Opção B: Docker Desktop (Alternativo)

Se preferir usar Docker (mais isolado):

```powershell
# Instalar Docker Desktop
# https://docs.docker.com/desktop/install/windows-install/

# Depois rodar PostgreSQL em container
docker run --name caroline-db ^
  -e POSTGRES_PASSWORD=mysecretpassword ^
  -e POSTGRES_DB=carolina_nail_design ^
  -p 5432:5432 ^
  -d postgres:15
```

---

## 3️⃣ Criar Banco de Dados

### Abrir PostgreSQL
```powershell
# No PowerShell
psql -U postgres
```

Você verá:
```
postgres=#
```

### Criar Banco
```sql
-- Copiar e colar:
CREATE DATABASE carolina_nail_design;

-- Ver se criou
\l

-- Sair
\q
```

---

## 4️⃣ Configurar Backend

### Passo 1: Abrir pasta
```powershell
cd "c:\Carolina Nail Design\backend"
```

### Passo 2: Instalar dependências
```powershell
npm install
```

*(Vai levar 2-5 minutos)*

### Passo 3: Criar arquivo .env
```powershell
# Copiar exemplo
cp .env.example .env

# Abrir no VS Code
code .env
```

### Passo 4: Editar .env
Mudar apenas essas linhas:
```env
# Banco de Dados
DB_HOST=localhost
DB_PORT=5432
DB_NAME=carolina_nail_design
DB_USER=postgres
DB_PASSWORD=MINHA_SENHA_DO_POSTGRES  # ← Use a senha que você definiu

# JWT (pode deixar como está)
JWT_SECRET=sua_chave_secreta_muito_segura_aqui
```

### Passo 5: Testar Backend

```powershell
npm run dev
```

Deve mostrar:
```
✅ Servidor rodando na porta 3000
✅ Conexão com banco de dados estabelecida!
📅 Backups automáticos agendados para 03:00 AM
```

---

## 5️⃣ Configurar Frontend

### Passo 1: Abrir pasta
```powershell
cd "c:\Carolina Nail Design\frontend"
```

### Passo 2: Instalar dependências
```powershell
npm install
```

### Passo 3: Testar Frontend

#### Opção A: Teste no Browser
```powershell
npm run web
```

Deve abrir: http://localhost:19006

#### Opção B: Teste em Emulador Android
```powershell
npm run android
```

(Requer Android Studio + emulador instalado)

---

## 🧪 Testar Fluxo Completo

### 1. Terminal 1: Backend
```powershell
cd "c:\Carolina Nail Design\backend"
npm run dev
```

### 2. Terminal 2: Frontend
```powershell
cd "c:\Carolina Nail Design\frontend"
npm run web
```

### 3. Browser
- Abrir: http://localhost:19006
- Clicar em "Criar Conta"
- Preencher: Nome, Telefone, Senha
- Criar conta
- Fazer login
- Explorar app

---

## 🔐 Configurar Google Drive Backup (Opcional)

Se quer backups automáticos no Google Drive:

### Passo 1: Credenciais Google
1. Acesse: https://console.cloud.google.com/
2. Criar novo projeto: "Carolina Nail Design"
3. Ativar API: Google Drive API
4. Create credentials → Service Account
5. Download JSON
6. Salvar como: `backend/credentials.json`

### Passo 2: Atualizar .env
```env
GOOGLE_DRIVE_ENABLED=true
GOOGLE_DRIVE_CREDENTIALS_PATH=./credentials.json
GOOGLE_DRIVE_FOLDER_ID=pasta-id-aqui
```

### Passo 3: Reiniciar Backend
```powershell
npm run dev
```

Deve mostrar:
```
✅ Google Drive Backup ativado
```

---

## 🆘 Troubleshooting

### Erro: "Cannot find module 'sequelize'"
```powershell
# Solução:
cd backend
npm install
```

### Erro: "ECONNREFUSED 127.0.0.1:5432"
```
PostgreSQL não está rodando. Abrir Services (Windows):
- Pesquisar "Services"
- Procurar "postgresql-x64-15" (ou sua versão)
- Clicar direito → Start (ou Restart)
```

### Erro: "password authentication failed"
```
Sua senha no .env está errada. Testar:
psql -U postgres -h localhost
# Digitar a senha
```

### Erro: "Port 3000 is already in use"
```powershell
# Encontrar processo
netstat -ano | findstr :3000

# Matar processo
taskkill /PID NUMERO_AQUI /F
```

### Erro: "npm: command not found"
```
Node.js não foi instalado corretamente.
Desinstalar e reinstalar: https://nodejs.org/
```

---

## 📱 Testar Biometria (Opcional)

Para testar impressão digital no seu Windows:

### 1. Habilitar Windows Hello
- Configurações → Accounts → Sign-in options
- Habilitar Windows Hello Fingerprint

### 2. No App
- Login → Clicar "Use Fingerprint"
- Usar seu dedo no sensor

---

## 📊 Arquitetura Local

```
Seu PC (Windows)
│
├─ Backend (Node.js)
│  └─ Porta 3000
│     └─ Conecta ao PostgreSQL
│
├─ Frontend (React Native via Expo)
│  └─ Porta 19006 ou Android Emulator
│     └─ Chama Backend via API
│
└─ PostgreSQL
   └─ Porta 5432
      └─ Armazena dados
```

---

## ✅ Checklist Final

- [ ] Node.js instalado e funcionando
- [ ] PostgreSQL instalado e rodando
- [ ] Banco `carolina_nail_design` criado
- [ ] Backend: `npm install` completo
- [ ] Backend: `.env` configurado
- [ ] Backend: `npm run dev` funcionando
- [ ] Frontend: `npm install` completo
- [ ] Frontend: `npm run web` abrindo
- [ ] Conseguir criar conta no app
- [ ] Conseguir fazer login
- [ ] Backup automático agendado

---

## 🚀 Próximos Passos

Depois que tudo estiver funcionando:

1. **Testes**: Criar alguns appointments e testar fluxo
2. **Backup**: Clicar em "Backup" no app e testar
3. **Exportar**: Testar CSV export
4. **Nuvem** (opcional): Configurar Google Drive se quiser

---

## 💬 Dúvidas?

Se tiver problema em alguma etapa:
- Verificar se não pulou nenhum passo
- Ver o Troubleshooting acima
- Procurar erro no Google (copiar a mensagem de erro)

---

**Tempo total esperado**: 20-30 minutos

**Status**: Ready to code! 🎉
