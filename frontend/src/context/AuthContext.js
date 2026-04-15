import React, { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { authService } from '../services';

const AuthContext = createContext();
const REGISTRATION_LOCK_KEY = 'registrationCompleted';
const SESSION_INACTIVITY_TIMEOUT_MS = 2 * 60 * 1000;

const unwrapAuthResponse = (response) => response?.data?.data ?? response?.data ?? response;
const normalizePhone = (phone) => String(phone || '').replace(/\D/g, '');
const normalizePin = (pin) => String(pin || '').replace(/\D/g, '').slice(0, 6);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [canRegister, setCanRegister] = useState(true);
  const [isSessionLocked, setIsSessionLocked] = useState(false);
  const inactivityTimerRef = useRef(null);
  const lastActivityAtRef = useRef(Date.now());
  const appStateRef = useRef(AppState.currentState);

  const clearInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  }, []);

  const lockSession = useCallback(() => {
    if (!user) return;

    clearInactivityTimer();
    setIsSessionLocked(true);
  }, [clearInactivityTimer, user]);

  const scheduleInactivityLock = useCallback(() => {
    if (!user || isSessionLocked) return;

    clearInactivityTimer();
    inactivityTimerRef.current = setTimeout(() => {
      lockSession();
    }, SESSION_INACTIVITY_TIMEOUT_MS);
  }, [clearInactivityTimer, isSessionLocked, lockSession, user]);

  const markActivity = useCallback(() => {
    if (!user || isSessionLocked) return;

    lastActivityAtRef.current = Date.now();
    scheduleInactivityLock();
  }, [isSessionLocked, scheduleInactivityLock, user]);

  const handleAppStateChange = useCallback((nextAppState) => {
    const previousState = appStateRef.current;
    appStateRef.current = nextAppState;

    if (!user) return;

    if (previousState === 'active' && (nextAppState === 'inactive' || nextAppState === 'background')) {
      clearInactivityTimer();
    }

    if (nextAppState === 'active') {
      const elapsed = Date.now() - lastActivityAtRef.current;

      if (elapsed >= SESSION_INACTIVITY_TIMEOUT_MS) {
        lockSession();
      } else {
        markActivity();
      }
    }
  }, [clearInactivityTimer, lockSession, markActivity, user]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
      clearInactivityTimer();
    };
  }, [clearInactivityTimer, handleAppStateChange]);

  useEffect(() => {
    bootstrapAsync();
    checkBiometricAvailability();
  }, []);

  const bootstrapAsync = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const userData = await AsyncStorage.getItem('user');
      const registrationCompleted = await AsyncStorage.getItem(REGISTRATION_LOCK_KEY);

      setCanRegister(!registrationCompleted);

      if (token && userData) {
        setUser(JSON.parse(userData));
        lastActivityAtRef.current = Date.now();
        scheduleInactivityLock();
      }
    } catch (e) {
      console.error('Erro ao restaurar sessão:', e);
    } finally {
      setIsBootstrapping(false);
    }
  };

  const checkBiometricAvailability = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setIsBiometricAvailable(compatible && enrolled);
    } catch (error) {
      console.error('Erro ao verificar biometria:', error);
    }
  };

  const register = async (name, phone, password) => {
    try {
      if (!canRegister) {
        throw new Error('Cadastro inicial já foi realizado neste dispositivo. Para um novo cadastro, use outra base de dados.');
      }

      const response = await authService.register(name, normalizePhone(phone), password);
      const payload = unwrapAuthResponse(response);

      if (!payload?.accessToken || !payload?.refreshToken || !payload?.user) {
        console.error('Resposta incompleta:', payload);
        throw new Error('Resposta de cadastro inválida');
      }

      await AsyncStorage.setItem('accessToken', payload.accessToken);
      await AsyncStorage.setItem('refreshToken', payload.refreshToken);
      await AsyncStorage.setItem('user', JSON.stringify(payload.user));
      await AsyncStorage.setItem(REGISTRATION_LOCK_KEY, 'true');

      setCanRegister(false);
      setUser(payload.user);
      setIsSessionLocked(false);
      lastActivityAtRef.current = Date.now();
      scheduleInactivityLock();
      return payload;
    } catch (error) {
      console.error('Erro no registro:', error.response?.data || error.message || error);
      throw error;
    }
  };

  const login = async (pin) => {
    try {
      const normalizedPin = normalizePin(pin);
      if (normalizedPin.length < 4) {
        throw new Error('PIN deve ter de 4 a 6 dígitos');
      }

      const response = await authService.login(normalizedPin);
      const payload = unwrapAuthResponse(response);

      if (!payload?.accessToken || !payload?.refreshToken || !payload?.user) {
        console.error('Resposta incompleta:', payload);
        throw new Error('Resposta de login inválida');
      }

      await AsyncStorage.setItem('accessToken', payload.accessToken);
      await AsyncStorage.setItem('refreshToken', payload.refreshToken);
      await AsyncStorage.setItem('user', JSON.stringify(payload.user));

      setUser(payload.user);
      setIsSessionLocked(false);
      lastActivityAtRef.current = Date.now();
      scheduleInactivityLock();
      return payload;
    } catch (error) {
      console.error('Erro no login:', error.response?.data || error.message || error);
      throw error;
    }
  };

  const biometricLogin = async (phone) => {
    try {
      if (!isBiometricAvailable) {
        throw new Error('Biometria não disponível');
      }

      const authenticated = await LocalAuthentication.authenticateAsync({
        disableDeviceFallback: false
      });

      if (!authenticated.success) {
        throw new Error('Autenticação biométrica falhou');
      }

      const response = await authService.biometricLogin(normalizePhone(phone));
      const payload = unwrapAuthResponse(response);

      if (!payload?.accessToken || !payload?.refreshToken || !payload?.user) {
        console.error('Resposta biométrica incompleta:', payload);
        throw new Error('Resposta biométrica inválida');
      }

      await AsyncStorage.setItem('accessToken', payload.accessToken);
      await AsyncStorage.setItem('refreshToken', payload.refreshToken);
      await AsyncStorage.setItem('user', JSON.stringify(payload.user));

      setUser(payload.user);
      setIsSessionLocked(false);
      lastActivityAtRef.current = Date.now();
      scheduleInactivityLock();
      return payload;
    } catch (error) {
      console.error('Erro no login biométrico:', error.response?.data || error.message || error);
      throw error;
    }
  };

  const unlockSession = async (pin) => {
    const response = await authService.login(normalizePin(pin));
    const payload = unwrapAuthResponse(response);

    if (!payload?.accessToken || !payload?.refreshToken || !payload?.user) {
      throw new Error('Resposta de desbloqueio inválida');
    }

    await AsyncStorage.setItem('accessToken', payload.accessToken);
    await AsyncStorage.setItem('refreshToken', payload.refreshToken);
    await AsyncStorage.setItem('user', JSON.stringify(payload.user));

    setUser(payload.user);
    setIsSessionLocked(false);
    lastActivityAtRef.current = Date.now();
    scheduleInactivityLock();

    return payload;
  };

  const unlockWithBiometric = async () => {
    if (!isBiometricAvailable) {
      throw new Error('Biometria não disponível');
    }

    const authenticated = await LocalAuthentication.authenticateAsync({
      disableDeviceFallback: false
    });

    if (!authenticated.success) {
      throw new Error('Autenticação biométrica falhou');
    }

    setIsSessionLocked(false);
    lastActivityAtRef.current = Date.now();
    scheduleInactivityLock();
    return true;
  };

  const logout = async () => {
    try {
      clearInactivityTimer();
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');
      await AsyncStorage.removeItem('user');
      setUser(null);
      setIsSessionLocked(false);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const value = {
    user,
    isLoading: isBootstrapping,
    isBiometricAvailable,
    canRegister,
    isSessionLocked,
    register,
    login,
    biometricLogin,
    unlockSession,
    unlockWithBiometric,
    markActivity,
    lockSession,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
