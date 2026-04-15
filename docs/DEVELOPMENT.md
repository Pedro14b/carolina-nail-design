# Guia de Desenvolvimento - Carolina Nail Design

## 🎯 Visão Geral do Projeto

Aplicação mobile completa para gerenciamento de salão de unhas, desenvolvida com **React Native** (frontend) e **Node.js/Express** (backend).

### Status: ✅ MVP Completo
- ✅ Autenticação e biometria
- ✅ CRUD de clientes
- ✅ Sistema de agendamentos
- ✅ Notificações personalizáveis
- ✅ Relatórios financeiros
- ✅ Dashboard com estatísticas

## 🏗️ Arquitetura

### Camadas

```
┌─────────────────────────────────────┐
│   React Native App (Expo)           │
│   - Screens, Components, Context    │
└──────────────┬──────────────────────┘
               │ HTTP/REST
┌──────────────▼──────────────────────┐
│   Node.js/Express Backend           │
│   - Controllers, Middleware, Routes │
└──────────────┬──────────────────────┘
               │ SQL
┌──────────────▼──────────────────────┐
│   PostgreSQL Database               │
│   - Users, Appointments, Reports    │
└─────────────────────────────────────┘
```

## 🚀 Quick Start

### Backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev  # Roda em http://localhost:3000
```

### Frontend
```bash
cd frontend
npm install
npm run web  # Ou android/ios
```

## 📱 Fluxos Principais

### 1. Primeira Vez (Onboarding)
```
Tela Splash
    ↓
LoginScreen (sem conta) → RegisterScreen
    ↓
    Criar Conta (POST /api/auth/register)
    ↓
    DashboardScreen (Início)
```

### 2. Login Subsequente
```
O aplicativo verifica AsyncStorage
    ↓
    Sem token? → LoginScreen
    ↓
    Com token? → Verificar validade
    ↓
    Expirado? → Renovar (POST /api/auth/refresh)
    ↓
    DashboardScreen
```

###‌3. Criar Agendamento
```
AppointmentsScreen
    ↓
    [Novo Agendamento]
    ↓
    AppointmentFormScreen
    (Selecionar cliente, serviço, data/hora)
    ↓
    POST /api/appointments
    ↓
    Notificação ao cliente
    ↓
    Voltar à lista
```

## 🔐 Segurança

### Autenticação
- JWT com expiração de 7 dias
- Refresh token com 30 dias
- Renovação automática via interceptor

### Biometria
- Expo Local Authentication
- Fallback: senha
- Armazenamento seguro em AsyncStorage

### Dados Sensíveis
- Senhas hasheadas com BCrypt
- Tokens armazenados encriptados
- Variáveis sensíveis em `.env`

## 💾 Banco de Dados

### Modelos Principais
1. **User** - Usuário base (admin, professional, client)
2. **Client** - Extensão de User para clientes
3. **Service** - Serviços oferecidos
4. **Appointment** - Agendamentos
5. **Transaction** - Movimentação financeira
6. **Notification** - Notificações do sistema

### Relacionamentos
```
User 1 ─── * Client
User 1 ─── * Appointment (como professional)
User 1 ─── * Appointment (como client)
Service * ─── 1 Appointment
Appointment 1 ─── * Transaction
```

## 📡 API REST

### Authentication Header
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Response Format
```json
{
  "success": true,
  "message": "Operação realizada",
  "data": { /* ... */ },
  "timestamp": "2026-04-08T10:30:00Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Descrição do erro",
  "timestamp": "2026-04-08T10:30:00Z"
}
```

## 🎨 Design System

### Cores
- **Primary**: `#FF1493` (Rosa)
- **Success**: `#4CAF50` (Verde)
- **Error**: `#F44336` (Vermelho)
- **Warning**: `#FFC107` (Amarelo)

### Spacing
- `XS`: 4px
- `SM`: 8px
- `MD`: 16px
- `LG`: 24px
- `XL`: 32px

### Typography
- `XS`: 12px
- `SM`: 14px
- `BASE`: 16px (default)
- `LG`: 18px
- `XL`: 20px
- `XXL`: 24px

## 🔄 State Management

### Context API
- **AuthContext** - Usuário e autenticação
- **AppContext** (em desenvolvimento) - Estado global

### Local State
- useState para estado de componente
- AsyncStorage para persistência

## 📊 Relatórios

### Financeiro
- Filtra transações por período
- Calcula receitas vs despesas
- Mostra saldo final

### Atendimentos
- Conta agendamentos por status
- Taxa de conclusão
- Serviços mais populares

### Clientes
- Total de clientes ativos
- Atendimentos por cliente
- Histórico de gastos

## 🔔 Notificações

### Tipos
1. `appointment` - Confirmação de agendamento
2. `reminder` - Lembrete de agendamento
3. `payment` - Confirmação de pagamento
4. `system` - Mensagens do sistema

### Personalização
- Habilitar/desabilitar tipos
- Horários de silêncio
- Email, SMS, push notifications

## 🧪 Padrões de Código

### Componente React
```javascript
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../../shared/constants';

export const MyComponent = ({ prop1, onPress }) => {
  const [state, setState] = useState(null);

  const handleAction = () => {
    setState(newValue);
  };

  return (
    <View style={styles.container}>
      {/* JSX */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.MD,
    backgroundColor: COLORS.BACKGROUND
  }
});
```

### Controller Express
```javascript
const myController = async (req, res) => {
  try {
    // Validação
    if (!req.body.field) {
      return res.status(400).json({ error: 'Campo obrigatório' });
    }

    // Lógica
    const result = await Model.create(req.body);

    // Resposta
    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
};
```

## 🚦 Guia de Contribuição

### 1. Criar Branch
```bash
git checkout -b feature/nome-da-feature
```

### 2. Commits
```
feat: Adicionar nova feature
fix: Corrigir bug
docs: Atualizar documentação
style: Formatação de código
refactor: Refatorar código
```

### 3. Pull Request
- Descrever mudanças
- Referenciar issues
- Passar em testes

## 📋 Checklist de Deploy

- [ ] Testes passando
- [ ] Variáveis de ambiente configuradas
- [ ] Database migrations executadas
- [ ] Build gerado sem erros
- [ ] APK/IPA assinado
- [ ] Versão atualizada (package.json)
- [ ] README atualizado

## 🐛 Troubleshooting

### Backend não conecta ao banco
```bash
# Verificar PostgreSQL
psql -U postgres -h localhost
# Ou criar banco de novo
createdb carolina_nail_design
```

### Token expirado sempre
```
Verificar JWT_SECRET em .env
Aumentar JWT_EXPIRE se necessário
```

### Biometria não funciona no iOS
```
Adicionar NSFaceIDUsageDescription ao Info.plist
Testar em device real (simulador só emula)
```

## 📚 Referências

- [React Native Docs](https://reactnative.dev)
- [Expo Documentation](https://docs.expo.dev)
- [Express.js Guide](https://expressjs.com)
- [Sequelize ORM](https://sequelize.org)
- [JWT Introduction](https://jwt.io/introduction)

## 📞 Suporte

Para dúvidas técnicas:
- 📧 tech@carolinanaildesign.com
- 💬 Slack #desenvolvimento

---

**Last Updated**: 08/04/2026
**Maintainer**: Dev Team Carolina Nail Design
