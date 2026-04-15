const ENV_API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || process.env.REACT_APP_API_URL;
const DEV_FALLBACK_API_URL = 'http://192.168.15.14:3000/api';
const PROD_FALLBACK_API_URL = 'https://api.carolinanaildesign.com/api';

export const API_BASE_URL = ENV_API_BASE_URL || (__DEV__ ? DEV_FALLBACK_API_URL : PROD_FALLBACK_API_URL);

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

export const COLORS = {
  PRIMARY: '#C97C7C',
  SECONDARY: '#E8A9A9',
  ACCENT: '#DAAF8C',
  BACKGROUND: '#FAF7F5',
  SURFACE: '#FFFDFB',
  TEXT_PRIMARY: '#4A2E2E',
  TEXT_SECONDARY: '#8C7A7A',
  BORDER: '#F3E4DE',
  SUCCESS: '#7F9D7C',
  ERROR: '#B85C5C',
  WARNING: '#DAAF8C',
  INFO: '#8C7A7A'
};

export const FONT_SIZES = {
  XS: 12,
  SM: 14,
  BASE: 16,
  LG: 18,
  XL: 20,
  XXL: 24
};

export const SPACING = {
  XS: 4,
  SM: 8,
  MD: 16,
  LG: 24,
  XL: 32
};

export const BUSINESS_HOURS = {
  OPEN: '09:00',
  CLOSE: '18:00'
};

export const TIME_INTERVALS = [
  { label: '15 minutos', value: 15 },
  { label: '30 minutos', value: 30 },
  { label: '45 minutos', value: 45 },
  { label: '1 hora', value: 60 },
  { label: '1,5 horas', value: 90 },
  { label: '2 horas', value: 120 }
];

export const MESSAGES = {
  SUCCESS: 'Operacao realizada com sucesso!',
  ERROR: 'Ocorreu um erro. Tente novamente.',
  LOADING: 'Carregando...',
  NO_DATA: 'Nenhum dado disponivel',
  CONFIRM_DELETE: 'Tem certeza que deseja deletar?'
};

export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_NAME_LENGTH: 100,
  MIN_NAME_LENGTH: 3,
  PHONE_PATTERN: /^[0-9-()+ ]{10,}$/
};
