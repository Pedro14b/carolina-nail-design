import { useCallback, useEffect, useMemo, useState } from 'react';
import { clientRepository } from '../../infrastructure/repositories/ClientRepository';
import { ListClientsUseCase } from '../../application/clients/usecases/ListClientsUseCase';

export const useClientsViewModel = () => {
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [search, setSearch] = useState('');

  const listClientsUseCase = useMemo(() => new ListClientsUseCase(clientRepository), []);

  const loadClients = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      const rows = await listClientsUseCase.execute({ page: 1, limit: 50, search });
      setClients(rows);
    } catch (error) {
      setErrorMessage(error?.response?.data?.error || 'Erro ao carregar clientes');
    } finally {
      setIsLoading(false);
    }
  }, [listClientsUseCase, search]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  return {
    clients,
    search,
    isLoading,
    errorMessage,
    setSearch,
    refresh: loadClients
  };
};
