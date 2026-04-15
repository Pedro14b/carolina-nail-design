import { useCallback, useEffect, useMemo, useState } from 'react';
import { appointmentRepository } from '../../infrastructure/repositories/AppointmentRepository';
import { ListAppointmentsUseCase } from '../../application/appointments/usecases/ListAppointmentsUseCase';

export const useAppointmentsViewModel = () => {
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState('all');
  const [confirmationFilter, setConfirmationFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const listUseCase = useMemo(() => new ListAppointmentsUseCase(appointmentRepository), []);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      const filters = {};
      if (filter !== 'all') filters.status = filter;
      if (confirmationFilter !== 'all') filters.confirmationStatus = confirmationFilter;
      const rows = await listUseCase.execute(filters);
      setAppointments(rows);
    } catch (error) {
      setErrorMessage(error?.response?.data?.error || 'Erro ao carregar agendamentos');
    } finally {
      setIsLoading(false);
    }
  }, [confirmationFilter, filter, listUseCase]);

  useEffect(() => {
    load();
  }, [load]);

  const requestConfirmation = async (appointmentId, channel = 'internal') => {
    try {
      const updated = await appointmentRepository.requestConfirmation(appointmentId, channel);
      setAppointments((prev) => prev.map((item) => (item.id === appointmentId ? updated : item)));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error?.response?.data?.error || 'Não foi possível solicitar confirmação'
      };
    }
  };

  const requestBatchConfirmation = async (date, channel = 'internal', filters = {}) => {
    try {
      const result = await appointmentRepository.requestBatchConfirmation(date, channel, filters);
      await load();
      return { success: true, data: result };
    } catch (error) {
      return {
        success: false,
        error: error?.response?.data?.error || 'Não foi possível solicitar confirmações em lote'
      };
    }
  };

  const previewBatchConfirmation = async (date, channel = 'internal', filters = {}) => {
    try {
      const result = await appointmentRepository.previewBatchConfirmation(date, channel, filters);
      return { success: true, data: result };
    } catch (error) {
      return {
        success: false,
        error: error?.response?.data?.error || 'Não foi possível calcular prévia de confirmações em lote'
      };
    }
  };

  return {
    appointments,
    filter,
    setFilter,
    confirmationFilter,
    setConfirmationFilter,
    requestConfirmation,
    requestBatchConfirmation,
    previewBatchConfirmation,
    isLoading,
    errorMessage,
    refresh: load
  };
};
