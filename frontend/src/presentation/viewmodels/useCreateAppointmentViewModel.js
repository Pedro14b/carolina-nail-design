import { useMemo, useState } from 'react';
import { appointmentRepository } from '../../infrastructure/repositories/AppointmentRepository';
import { CreateAppointmentUseCase } from '../../application/appointments/usecases/CreateAppointmentUseCase';

const initialForm = {
  clientId: '',
  date: '',
  time: '',
  serviceType: '',
  notes: ''
};

export const useCreateAppointmentViewModel = (clientIdFromRoute) => {
  const [form, setForm] = useState({ ...initialForm, clientId: clientIdFromRoute || '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const createUseCase = useMemo(() => new CreateAppointmentUseCase(appointmentRepository), []);

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const submit = async () => {
    try {
      setIsLoading(true);
      setErrors({});
      const created = await createUseCase.execute(form);
      setForm((prev) => ({ ...initialForm, clientId: prev.clientId }));
      return { success: true, data: created };
    } catch (error) {
      if (error.validationErrors) {
        setErrors(error.validationErrors);
      }
      return {
        success: false,
        error: error?.response?.data?.error || error?.message || 'Erro ao criar agendamento'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid =
    !!form.clientId &&
    /^\d{2}\/\d{2}\/\d{4}$/.test(form.date) &&
    /^\d{2}:\d{2}$/.test(form.time) &&
    String(form.serviceType || '').trim().length > 0;

  return {
    form,
    errors,
    isLoading,
    isFormValid,
    setField,
    submit
  };
};
