import { useCallback, useEffect, useMemo, useState } from 'react';
import { notificationRepository } from '../../infrastructure/repositories/NotificationRepository';
import { ListNotificationsUseCase } from '../../application/notifications/usecases/ListNotificationsUseCase';
import { MarkNotificationAsReadUseCase } from '../../application/notifications/usecases/MarkNotificationAsReadUseCase';
import { MarkAllNotificationsAsReadUseCase } from '../../application/notifications/usecases/MarkAllNotificationsAsReadUseCase';

export const useNotificationsViewModel = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const listUseCase = useMemo(() => new ListNotificationsUseCase(notificationRepository), []);
  const markAsReadUseCase = useMemo(
    () => new MarkNotificationAsReadUseCase(notificationRepository),
    []
  );
  const markAllUseCase = useMemo(
    () => new MarkAllNotificationsAsReadUseCase(notificationRepository),
    []
  );

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      const rows = await listUseCase.execute(1, 50);
      setNotifications(rows);
    } catch (error) {
      setErrorMessage(error?.response?.data?.error || 'Erro ao carregar notificacoes');
    } finally {
      setIsLoading(false);
    }
  }, [listUseCase]);

  useEffect(() => {
    load();
  }, [load]);

  const markAsRead = async (id, isRead) => {
    if (isRead) return;
    try {
      await markAsReadUseCase.execute(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch {
      // silent, keeps UX fluid
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllUseCase.execute();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      setErrorMessage(error?.response?.data?.error || 'Erro ao marcar notificacoes');
    }
  };

  return {
    notifications,
    isLoading,
    errorMessage,
    markAsRead,
    markAllAsRead,
    refresh: load
  };
};
