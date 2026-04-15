// Tipos de usuários
export enum UserRole {
  ADMIN = 'admin',
  PROFESSIONAL = 'professional',
  CLIENT = 'client'
}

// Interface de usuário
export interface User {
  id: string;
  name: string;
  email?: string;
  phone: string;
  password?: string;
  role: UserRole;
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Interface de cliente
export interface Client extends User {
  birthDate?: Date;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  notes?: string;
  isActive: boolean;
}

// Interface de agendamento
export interface Appointment {
  id: string;
  clientId: string;
  professionalId: string;
  serviceId: string;
  date: Date;
  time: string;
  duration: number; // em minutos
  status: AppointmentStatus;
  notes?: string;
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

// Status de agendamento
export enum AppointmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  RESCHEDULED = 'rescheduled'
}

// Interface de serviço
export interface Service {
  id: string;
  name: string;
  description?: string;
  duration: number; // em minutos
  price: number;
  isActive: boolean;
  createdAt: Date;
}

// Interface de notificação
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: Date;
}

export enum NotificationType {
  APPOINTMENT = 'appointment',
  REMINDER = 'reminder',
  PAYMENT = 'payment',
  SYSTEM = 'system'
}

// Interface de configuração de notificações
export interface NotificationSettings {
  userId: string;
  enableAppointmentNotifications: boolean;
  appointmentReminderMinutes: number;
  enablePaymentNotifications: boolean;
  enableSMSNotifications: boolean;
  enableEmailNotifications: boolean;
  quietHoursStart?: string; // HH:mm
  quietHoursEnd?: string; // HH:mm
}

// Resposta de transação financeira
export interface Transaction {
  id: string;
  appointmentId?: string;
  type: TransactionType;
  description: string;
  amount: number;
  date: Date;
  category: string;
  paymentMethod?: string;
  notes?: string;
}

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense'
}

// Interface de relatório
export interface FinancialReport {
  period: string;
  startDate: Date;
  endDate: Date;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  transactions: Transaction[];
}

export interface AppointmentReport {
  period: string;
  startDate: Date;
  endDate: Date;
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  averageDuration: number;
  topServices: Array<{ serviceId: string; count: number }>;
  topClients: Array<{ clientId: string; count: number }>;
}

// Resposta de API
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  timestamp: Date;
}

// JWT Payload
export interface JWTPayload {
  userId: string;
  role: UserRole;
  email?: string;
  iat?: number;
  exp?: number;
}
