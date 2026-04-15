import { useCallback, useEffect, useMemo, useState } from 'react';
import { appointmentRepository } from '../../infrastructure/repositories/AppointmentRepository';
import { GetAppointmentDetailsUseCase } from '../../application/appointments/usecases/GetAppointmentDetailsUseCase';
import { ChangeAppointmentStatusUseCase } from '../../application/appointments/usecases/ChangeAppointmentStatusUseCase';
import { UpdateAppointmentUseCase } from '../../application/appointments/usecases/UpdateAppointmentUseCase';

export const useAppointmentDetailsViewModel = (appointmentId) => {
  const [appointment, setAppointment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const getUseCase = useMemo(() => new GetAppointmentDetailsUseCase(appointmentRepository), []);
  const changeStatusUseCase = useMemo(
    () => new ChangeAppointmentStatusUseCase(appointmentRepository),
    []
  );
  const updateAppointmentUseCase = useMemo(
    () => new UpdateAppointmentUseCase(appointmentRepository),
    []
  );

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      const details = await getUseCase.execute(appointmentId);
      setAppointment(details);
    } catch (error) {
      setErrorMessage(error?.response?.data?.error || 'Nao foi possivel carregar agendamento');
    } finally {
      setIsLoading(false);
    }
  }, [appointmentId, getUseCase]);

  useEffect(() => {
    load();
  }, [load]);

  const changeStatus = async (status) => {
    try {
      setIsLoading(true);
      const updated = await changeStatusUseCase.execute({ id: appointmentId, status });
      setAppointment(updated);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error?.response?.data?.error || 'Nao foi possivel atualizar status'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const saveNotes = async (notes) => {
    try {
      setIsLoading(true);
      const updated = await updateAppointmentUseCase.execute({ id: appointmentId, notes });
      setAppointment(updated);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error?.response?.data?.error || 'Nao foi possivel salvar observacoes'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const requestConfirmation = async (channel = 'internal') => {
    try {
      setIsLoading(true);
      const updated = await appointmentRepository.requestConfirmation(appointmentId, channel);
      setAppointment(updated);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error?.response?.data?.error || 'Nao foi possivel solicitar confirmacao'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const respondConfirmation = async (responseStatus) => {
    try {
      setIsLoading(true);
      const updated = await appointmentRepository.respondConfirmation(appointmentId, responseStatus);
      setAppointment(updated);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error?.response?.data?.error || 'Nao foi possivel registrar resposta de confirmacao'
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    appointment,
    isLoading,
    errorMessage,
    reload: load,
    changeStatus,
    saveNotes,
    requestConfirmation,
    respondConfirmation
  };
};
