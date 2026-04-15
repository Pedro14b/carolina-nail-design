import { useCallback, useEffect, useMemo, useState } from 'react';
import { notificationRepository } from '../../infrastructure/repositories/NotificationRepository';
import { GetNotificationDetailsUseCase } from '../../application/notifications/usecases/GetNotificationDetailsUseCase';
import { MarkNotificationAsReadUseCase } from '../../application/notifications/usecases/MarkNotificationAsReadUseCase';
import { DeleteNotificationUseCase } from '../../application/notifications/usecases/DeleteNotificationUseCase';

export const useNotificationDetailsViewModel = (id) => {
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const getDetailsUseCase = useMemo(
    () => new GetNotificationDetailsUseCase(notificationRepository),
    []
  );
  const markAsReadUseCase = useMemo(
    () => new MarkNotificationAsReadUseCase(notificationRepository),
    []
  );
  const deleteUseCase = useMemo(() => new DeleteNotificationUseCase(notificationRepository), []);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      const details = await getDetailsUseCase.execute(id);
      setNotification(details);
      if (!details?.isRead) {
        await markAsReadUseCase.execute(id);
        setNotification((prev) => (prev ? { ...prev, isRead: true } : prev));
      }
    } catch (error) {
      setErrorMessage(error?.response?.data?.error || 'Nao foi possivel carregar notificacao');
    } finally {
      setIsLoading(false);
    }
  }, [getDetailsUseCase, id, markAsReadUseCase]);

  useEffect(() => {
    load();
  }, [load]);

  const deleteNotification = async () => {
    try {
      await deleteUseCase.execute(id);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error?.response?.data?.error || 'Nao foi possivel deletar'
      };
    }
  };

  return {
    notification,
    isLoading,
    errorMessage,
    deleteNotification
  };
};
