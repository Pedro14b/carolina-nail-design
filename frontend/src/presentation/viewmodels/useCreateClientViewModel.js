import { useMemo, useState } from 'react';
import { clientRepository } from '../../infrastructure/repositories/ClientRepository';
import { CreateClientUseCase } from '../../application/clients/usecases/CreateClientUseCase';
import { UpdateClientUseCase } from '../../application/clients/usecases/UpdateClientUseCase';

const buildInitialForm = (client = {}) => ({
  name: client.name || '',
  phone: client.phone || '',
  email: client.email || '',
  birthDate: client.birthDate || '',
  address: client.address || '',
  city: client.city || '',
  state: client.state || '',
  zipCode: client.zipCode || '',
  notes: client.notes || '',
  allergies: client.allergies || '',
  preferences: client.preferences || '',
  favoriteServices: client.favoriteServices || ''
});

const initialForm = {
  name: '',
  phone: '',
  email: '',
  birthDate: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  notes: '',
  allergies: '',
  preferences: '',
  favoriteServices: ''
};

export const useCreateClientViewModel = (initialClient = null) => {
  const [form, setForm] = useState(initialClient ? buildInitialForm(initialClient) : initialForm);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = Boolean(initialClient?.id);

  const createClientUseCase = useMemo(() => new CreateClientUseCase(clientRepository), []);
  const updateClientUseCase = useMemo(() => new UpdateClientUseCase(clientRepository), []);

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const submit = async () => {
    try {
      setIsLoading(true);
      setErrors({});

      const result = isEditing
        ? await updateClientUseCase.execute(initialClient.id, form)
        : await createClientUseCase.execute(form);

      if (!isEditing) {
        setForm(initialForm);
      }

      return { success: true, data: result };
    } catch (error) {
      if (error.validationErrors) {
        setErrors(error.validationErrors);
      }
      return {
        success: false,
        error: error?.response?.data?.error || error?.message || 'Erro ao criar cliente'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid =
    form.name.trim().length >= 3 && String(form.phone).replace(/\D/g, '').length >= 10;

  return {
    form,
    errors,
    isLoading,
    isFormValid,
    isEditing,
    setField,
    submit
  };
};
