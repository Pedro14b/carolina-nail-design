// URLs da API
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Endpoints
export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    BIOMETRIC: '/auth/biometric'
  },
  CLIENTS: {
    LIST: '/clients',
    GET: '/clients/:id',
    CREATE: '/clients',
    UPDATE: '/clients/:id',
    DELETE: '/clients/:id'
  },
  APPOINTMENTS: {
    LIST: '/appointments',
    GET: '/appointments/:id',
    CREATE: '/appointments',
    UPDATE: '/appointments/:id',
    DELETE: '/appointments/:id',
    RESCHEDULE: '/appointments/:id/reschedule'
  },
  SERVICES: {
    LIST: '/services',
    GET: '/services/:id'
  },
  NOTIFICATIONS: {
    LIST: '/notifications',
    MARK_READ: '/notifications/:id/read',
    SETTINGS: '/notifications/settings'
  },
  REPORTS: {
    FINANCIAL: '/reports/financial',
    APPOINTMENTS: '/reports/appointments'
  }
};

// Cores do aplicativo
export const COLORS = {
  PRIMARY: '#FF1493', // Rosa intenso
  SECONDARY: '#FFB6D9', // Rosa claro
  ACCENT: '#FF69B4', // Hot pink
  BACKGROUND: '#FFFFFF',
  SURFACE: '#F8F8F8',
  TEXT_PRIMARY: '#333333',
  TEXT_SECONDARY: '#666666',
  BORDER: '#CCCCCC',
  SUCCESS: '#4CAF50',
  ERROR: '#F44336',
  WARNING: '#FFC107',
  INFO: '#2196F3'
};

// Tamanhos de fonte
export const FONT_SIZES = {
  XS: 12,
  SM: 14,
  BASE: 16,
  LG: 18,
  XL: 20,
  XXL: 24
};

// Espaçamento
export const SPACING = {
  XS: 4,
  SM: 8,
  MD: 16,
  LG: 24,
  XL: 32
};

// Horários de funcionamento padrão
export const BUSINESS_HOURS = {
  OPEN: '09:00',
  CLOSE: '18:00'
};

// Duração de intervalos de tempo
export const TIME_INTERVALS = [
  { label: '15 minutos', value: 15 },
  { label: '30 minutos', value: 30 },
  { label: '45 minutos', value: 45 },
  { label: '1 hora', value: 60 },
  { label: '1,5 horas', value: 90 },
  { label: '2 horas', value: 120 }
];

// Mensagens padrão
export const MESSAGES = {
  SUCCESS: 'Operação realizada com sucesso!',
  ERROR: 'Ocorreu um erro. Tente novamente.',
  LOADING: 'Carregando...',
  NO_DATA: 'Nenhum dado disponível',
  CONFIRM_DELETE: 'Tem certeza que deseja deletar?'
};

// Limites e validações
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_NAME_LENGTH: 100,
  MIN_NAME_LENGTH: 3,
  PHONE_PATTERN: /^[0-9-()+ ]{10,}$/
};
