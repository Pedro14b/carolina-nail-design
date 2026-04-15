# 🧪 Guia de Testes Completo

## 📋 Índice de Testes

- [x] Testes de Configuração
- [x] Testes de Autenticação
- [x] Testes de Funcionalidades Principais
- [x] Testes de Backup
- [x] Testes de Performance
- [x] Testes de Segurança

---

## 1️⃣ Testes de Configuração

### ✅ Verificar Node.js
```bash
node --version
npm --version
```

### ✅ Verificar PostgreSQL
```bash
psql --version

# Ou conectar ao banco
psql -U postgres -d carolina_nail_design
\dt  # Listar tabelas
\q   # Sair
```

### ✅ Verificar Dependências
```bash
# Em backend
npm list | grep -E "express|sequelize|bcryptjs"

# Em frontend  
npm list | grep -E "react-native|axios|expo"
```

---

## 2️⃣ Testes de Autenticação

### 📝 Teste 1: Registrar Novo Usuário

**URL**: http://localhost:3000/api/auth/register

**POST Request**:
```json
{
  "name": "Maria Silva",
  "phone": "11987654321",
  "password": "Senha123!",
  "role": "professional"
}
```

**Esperado**:
```json
{
  "message": "Profissional registrado com sucesso!",
  "user": {
    "id": 1,
    "name": "Maria Silva",
    "phone": "11987654321",
    "role": "professional"
  }
}
```

---

### 🔑 Teste 2: Fazer Login

**URL**: http://localhost:3000/api/auth/login

**POST Request**:
```json
{
  "phone": "11987654321",
  "password": "Senha123!"
}
```

**Esperado**:
```json
{
  "message": "Login realizado com sucesso!",
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Maria Silva",
    "phone": "11987654321"
  }
}
```

---

### 👆 Teste 3: Login com Biometria (Mobile)

**No App**:
1. Ir para tela de Login
2. Clicar em "Usar Impressão Digital"
3. Colocar dedo no sensor/emulador
4. Deve fazer login automaticamente

---

## 3️⃣ Testes de Funcionidades Principais

### 👥 Teste 4: Criar Cliente

**URL**: http://localhost:3000/api/clients

**Headers**:
```
Authorization: Bearer SEU_ACCESS_TOKEN
```

**POST Request**:
```json
{
  "name": "João Pedro",
  "phone": "11998765432",
  "email": "joao@email.com",
  "birthDate": "1990-05-15",
  "address": "Rua das Flores, 123"
}
```

**Esperado**: Cliente criado com ID

---

### 📅 Teste 5: Criar Serviço

**URL**: http://localhost:3000/api/services

**POST Request**:
```json
{
  "name": "Manicure Completa",
  "duration": 60,
  "price": 50.00,
  "category": "unhas"
}
```

---

### 📆 Teste 6: Criar Agendamento

**URL**: http://localhost:3000/api/appointments

**POST Request**:
```json
{
  "clientId": 1,
  "serviceId": 1,
  "date": "2024-04-20",
  "startTime": "14:00",
  "endTime": "15:00"
}
```

**Esperado**: Appointment criado com status "pending"

---

### 🔔 Teste 7: Notificações

**URL**: http://localhost:3000/api/notifications

**GET Request**:

Deve retornar todas as notificações do usuário:
```json
{
  "data": [
    {
      "id": 1,
      "type": "appointment",
      "title": "Novo Agendamento",
      "message": "João Pedro agendou para amanhã",
      "isRead": false
    }
  ]
}
```

---

## 4️⃣ Testes de Backup

### 💾 Teste 8: Criar Backup Manual

**URL**: http://localhost:3000/api/backup/create

**Headers**:
```
Authorization: Bearer ADMIN_TOKEN
```

**POST Request**: (vazio)

**Esperado**:
```json
{
  "success": true,
  "data": {
    "filename": "backup_2024-04-15_150000.json",
    "size": "245.5 KB",
    "timestamp": "2024-04-15T15:00:00Z",
    "records": {
      "users": 5,
      "clients": 12,
      "appointments": 45,
      "services": 8,
      "notifications": 120,
      "transactions": 80
    }
  }
}
```

**Validação**: Arquivo criado em `backend/backups/`

---

### 📋 Teste 9: Listar Backups

**URL**: http://localhost:3000/api/backup/list

**Esperado**:
```json
{
  "data": [
    {
      "filename": "backup_2024-04-15_030000.json",
      "size": "245.5 KB",
      "createdAt": "2024-04-15T03:00:00Z"
    }
  ]
}
```

---

### 📊 Teste 10: Estatísticas Backup

**URL**: http://localhost:3000/api/backup/stats

**Esperado**:
```json
{
  "data": {
    "totalBackups": 5,
    "totalSizeKB": 1227.5,
    "oldestBackup": "2024-04-10T03:00:00Z",
    "lastBackupDate": "2024-04-15T03:00:00Z",
    "automatedBackupTime": "03:00",
    "recentBackups": [
      {
        "filename": "backup_2024-04-15_030000.json",
        "size": "245.5 KB"
      }
    ]
  }
}
```

---

### 📥 Teste 11: Restaurar Backup

**URL**: http://localhost:3000/api/backup/restore/backup_2024-04-15_030000.json

**Headers**:
```
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json
```

**POST Request**:
```json
{
  "password": "ADMIN_PASSWORD",
  "confirmRestore": true
}
```

**Esperado**:
```json
{
  "success": true,
  "message": "Backup restaurado com sucesso",
  "restoredRecords": {
    "users": 5,
    "clients": 12,
    "appointments": 45,
    "services": 8
  }
}
```

---

### 📄 Teste 12: Exportar CSV

**URL**: http://localhost:3000/api/backup/export?type=appointments

**Esperado**: Download de arquivo CSV

```csv
id,clientName,serviceName,date,startTime,endTime,status,price
1,João Pedro,Manicure,2024-04-20,14:00,15:00,completed,50.00
2,Maria Silva,Pedicure,2024-04-21,15:00,16:00,pending,45.00
```

---

## 5️⃣ Testes de App Mobile (Frontend)

### 📱 Teste 13: Fluxo Completo no App

**Passo 1**: Abrir app
```bash
npm run web
```

**Passo 2**: Tela de Login
- [ ] Botão "Criar Conta" visível
- [ ] Botão "Usar Impressão Digital" visível (se disponível)

**Passo 3**: Criar Conta
- [ ] Preencher Nome, Telefone, Senha
- [ ] Clicar "Criar Conta"
- [ ] Deve redirecionar para login

**Passo 4**: Fazer Login
- [ ] Preencher Telefone, Senha
- [ ] Clicar "Entrar"
- [ ] Deve mostrar Dashboard

**Passo 5**: Navegar Abas
- [ ] 🏠 Dashboard - Ver estatísticas
- [ ] 📅 Agendamentos - Ver lista
- [ ] 👥 Clientes - Ver lista
- [ ] 🔔 Notificações - Ver notificações
- [ ] 📊 Relatórios - Ver gráficos
- [ ] 💾 Backup - Ver backups

---

### 💾 Teste 14: Tela de Backup no App

**Passo 1**: Ir para aba "Backup"
- [ ] Ver "Backup e Exportação"
- [ ] Ver estatísticas (total, tamanho, último backup)

**Passo 2**: Clicar "Criar Backup Manual"
- [ ] Mostrar loading
- [ ] Mostrar sucesso com arquivo criado
- [ ] Atualizar lista de backups

**Passo 3**: Exportar para CSV
- [ ] Clicar "Exportar Agendamentos"
- [ ] Deve download arquivo .csv
- [ ] Abrir em Excel e verificar dados

**Passo 4**: Ver Lista de Backups
- [ ] Mostrar backup criado
- [ ] Mostrar data e tamanho
- [ ] Botão de deletar funciona

---

## 6️⃣ Testes de Performance

### ⚡ Teste 15: Velocidade de Resposta

**Testar latência da API**:
```bash
# No terminal, instalar curl (se não tiver)
# Depois testar:

curl -w "\nTempo: %{time_total}s\n" http://localhost:3000/api/appointments
```

**Esperado**: Resposta em < 500ms

---

### 💾 Teste 16: Tamanho de Backup

**Verificar tamanho dos backups**:
```bash
# Windows PowerShell
Get-ChildItem "c:\Carolina Nail Design\backend\backups\" | Select-Object Name, @{Label='SizeMB';Expression={[math]::Round($_.Length/1MB,2)}}
```

**Esperado**: Cada backup < 5MB

---

## 7️⃣ Testes de Segurança

### 🔐 Teste 17: Autenticação JWT

**Tentar acessar endpoint sem token**:
```
GET /api/appointments
```

**Esperado**: 401 Unauthorized

---

### 🔐 Teste 18: Token Expirado

**Usar token antigo**:
```
GET /api/appointments
Authorization: Bearer SEU_TOKEN_EXPIRADO
```

**Esperado**: 401 Token expirou

---

### 🔒 Teste 19: Permissão Admin

**Tentar deletar usuário sem ser admin**:
```
DELETE /api/backup/backup_2024-04-15.json
Authorization: Bearer USER_TOKEN
```

**Esperado**: 403 Forbidden

---

### 🔒 Teste 20: SQL Injection

**Tentar injection no search de clientes**:
```
GET /api/clients?search='; DROP TABLE clients; --
```

**Esperado**: Safe, deve retornar 0 resultados (não rodar SQL maligno)

---

## 📊 Checklist de Testes

Marcar conforme executar:

**Autenticação**:
- [ ] Teste 1: Registrar usuário
- [ ] Teste 2: Fazer login
- [ ] Teste 3: Biometria

**Funcionalidades**:
- [ ] Teste 4: Criar cliente
- [ ] Teste 5: Criar serviço
- [ ] Teste 6: Criar agendamento
- [ ] Teste 7: Ver notificações

**Backup**:
- [ ] Teste 8: Backup manual
- [ ] Teste 9: Listar backups
- [ ] Teste 10: Stats
- [ ] Teste 11: Restaurar
- [ ] Teste 12: Exportar CSV

**Mobile**:
- [ ] Teste 13: Fluxo app completo
- [ ] Teste 14: Tela de backup

**Performance**:
- [ ] Teste 15: Latência < 500ms
- [ ] Teste 16: Backup < 5MB

**Segurança**:
- [ ] Teste 17: JWT obrigatório
- [ ] Teste 18: Token expirado
- [ ] Teste 19: Admin only endpoints
- [ ] Teste 20: SQL injection safe

---

## 🎯 Resultado Esperado

✅ **PASS**: Todos os 20 testes passando

Se algum teste falhar:
1. Anotar qual falhou
2. Verificar logs do backend: `npm run dev`
3. Verificar console do browser (F12)
4. Procurar erro no Google

---

## 📞 Problemas Comuns

| Erro | Solução |
|------|---------|
| 401 Unauthorized | Token inválido ou expirado, fazer login de novo |
| 500 Internal Error | Erro no backend, verificar terminal onde rodou `npm run dev` |
| ECONNREFUSED | Backend não está rodando, executar `npm run dev` |
| CORS Error | Frontend usando URL errada, verificar API_URL |

---

**Última atualização**: Abril de 2026
