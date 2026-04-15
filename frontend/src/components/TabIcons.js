import React from 'react';
import Svg, { G, Path, Circle, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';

// Ícone Home com gradiente Rosa/Magenta
export const HomeIcon = ({ color, size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Defs>
      <LinearGradient id="homeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#E91E63" stopOpacity="1" />
        <Stop offset="100%" stopColor="#C2185B" stopOpacity="1" />
      </LinearGradient>
    </Defs>
    <Path
      d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"
      fill={color === 'inactive' ? '#BDBDBD' : 'url(#homeGradient)'}
    />
  </Svg>
);

// Ícone Calendário com gradiente Azul
export const CalendarIcon = ({ color, size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Defs>
      <LinearGradient id="calendarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#2196F3" stopOpacity="1" />
        <Stop offset="100%" stopColor="#1565C0" stopOpacity="1" />
      </LinearGradient>
    </Defs>
    <Path
      d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"
      fill={color === 'inactive' ? '#BDBDBD' : 'url(#calendarGradient)'}
    />
  </Svg>
);

// Ícone Clientes com gradiente Verde
export const ClientsIcon = ({ color, size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Defs>
      <LinearGradient id="clientsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#4CAF50" stopOpacity="1" />
        <Stop offset="100%" stopColor="#2E7D32" stopOpacity="1" />
      </LinearGradient>
    </Defs>
    <G fill={color === 'inactive' ? '#BDBDBD' : 'url(#clientsGradient)'}>
      <Circle cx="9" cy="8" r="4" />
      <Path d="M0 14c0-2 4-3 9-3s9 1 9 3v4H0z" />
      <Circle cx="18" cy="9" r="3" />
      <Path d="M14 15c-1 0-3 1-3 2v3h8v-3c0-1-2-2-3-2" opacity="0.6" />
    </G>
  </Svg>
);

// Ícone Notificações com gradiente Laranja
export const NotificationsIcon = ({ color, size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Defs>
      <LinearGradient id="notifGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#FF9800" stopOpacity="1" />
        <Stop offset="100%" stopColor="#E65100" stopOpacity="1" />
      </LinearGradient>
    </Defs>
    <Path
      d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.93 6 11v5l-2 2v1h16v-1l-2-2z"
      fill={color === 'inactive' ? '#BDBDBD' : 'url(#notifGradient)'}
    />
  </Svg>
);

// Ícone Relatórios com gradiente Roxo
export const ReportsIcon = ({ color, size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Defs>
      <LinearGradient id="reportsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#9C27B0" stopOpacity="1" />
        <Stop offset="100%" stopColor="#6A1B9A" stopOpacity="1" />
      </LinearGradient>
    </Defs>
    <G fill={color === 'inactive' ? '#BDBDBD' : 'url(#reportsGradient)'}>
      <Rect x="4" y="6" width="3" height="10" rx="1" />
      <Rect x="10.5" y="3" width="3" height="13" rx="1" />
      <Rect x="17" y="9" width="3" height="7" rx="1" />
    </G>
  </Svg>
);

// Ícone Backup com gradiente Azul Escuro/Cinza
export const BackupIcon = ({ color, size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Defs>
      <LinearGradient id="backupGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#455A64" stopOpacity="1" />
        <Stop offset="100%" stopColor="#263238" stopOpacity="1" />
      </LinearGradient>
    </Defs>
    <G fill={color === 'inactive' ? '#BDBDBD' : 'url(#backupGradient)'}>
      <Path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
      <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fillOpacity="0.3" />
    </G>
  </Svg>
);

// Ícone Perfil com gradiente Coral
export const ProfileIcon = ({ color, size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Defs>
      <LinearGradient id="profileGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#FF6F61" stopOpacity="1" />
        <Stop offset="100%" stopColor="#D8436E" stopOpacity="1" />
      </LinearGradient>
    </Defs>
    <G fill={color === 'inactive' ? '#BDBDBD' : 'url(#profileGradient)'}>
      <Circle cx="12" cy="8" r="4" />
      <Path d="M4 19c0-3.2 3.6-5 8-5s8 1.8 8 5v1H4v-1z" />
    </G>
  </Svg>
);
