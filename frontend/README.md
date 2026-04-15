# Frontend - Carolina Nail Design

Aplicação React Native para gerenciamento de agendamentos e clientes.

## 📱 Requisitos

- Node.js 14+
- npm ou yarn
- iOS ou Android para testes

## 🚀 Como Começar

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar API URL
Edite o arquivo `src/services/api.js` ou crie um `.env`:
```
REACT_APP_API_URL=http://localhost:3000/api
```

Para build mobile (Expo/EAS), prefira `EXPO_PUBLIC_API_URL`:
```
EXPO_PUBLIC_API_URL=https://seu-backend-publico.com/api
```

### 3. Executar a Aplicação

**No Emulador Android:**
```bash
npm run android
```

**No Simulador iOS:**
```bash
npm run ios
```

**Na Web (desenvolvimento rápido):**
```bash
npm run web
```

**Via Expo Go (no seu celular):**
```bash
npm start
```

## 📂 Estrutura de Pastas

```
src/
├── screens/              # Telas principais
│   ├── LoginScreen
│   ├── RegisterScreen
│   ├── DashboardScreen
│   ├── AppointmentsScreen
│   ├── ClientsScreen
│   ├── NotificationsScreen
│   └── ReportsScreen
├── components/           # Componentes reutilizáveis
│   ├── Button
│   ├── Input
│   ├── Card
│   └── AppointmentItem
├── services/             # API client
│   ├── api.js           # Axiosclient com interceptors
│   └── index.js         # Endpoints
├── context/              # Context API
│   └── AuthContext.js   # Autenticação e usuário
├── hooks/                # Custom React Hooks
│   └── index.js
├── navigation/           # Navegação entre telas
│   └── RootNavigator.js
├── utils/                # Funções utilitárias
│   └── index.js
└── assets/               # Imagens, fonts, etc
```

## 🔧 Principais Componentes

### AuthContext
Gerencia autenticação, login, biometria e logout.

```javascript
const { user, login, logout, biometricLogin } = useAuth();
```

### Services
Acesso à API através de clients específicos:

```javascript
import { appointmentService, clientService } from '../services';
```

### Componentes de UI
- `Button` - Botão customizável
- `Input` - Campo de entrada com validação
- `Card` - Container com sombra
- `AppointmentItem` - Item de agendamento

## 🎨 Customização

Cores e espaçamento estão em `../../shared/constants/index.ts`:

```javascript
COLORS.PRIMARY = '#FF1493'
SPACING.MD = 16
FONT_SIZES.BASE = 16
```

## 📚 Dependências Principais

- `@react-navigation/*` - Navegação
- `axios` - Requisições HTTP
- `expo-local-authentication` - Biometria
- `react-native-calendars` - Calendário
- `react-native-chart-kit` - Gráficos

## 🐛 Debugging

**Verificar logs:**
```bash
npm start  # Pressione 'j' para abrir Chrome DevTools
```

**Expo DevTools:**
```bash
wpeman start --localhost  # Abre interface web
```

## 📦 Build para Produção

**Android APK:**
```bash
eas build --platform android
```

**Android APK com URL pública da API (PowerShell):**
```bash
set EXPO_PUBLIC_API_URL=https://seu-backend-publico.com/api
npm run eas:build:android:preview
```

**iOS IPA:**
```bash
eas build --platform ios
```

Requer configuração com Expo account.
