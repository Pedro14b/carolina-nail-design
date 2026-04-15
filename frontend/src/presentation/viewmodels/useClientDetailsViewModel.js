import { useEffect, useMemo, useState } from 'react';
import { clientRepository } from '../../infrastructure/repositories/ClientRepository';
import { GetClientDetailsUseCase } from '../../application/clients/usecases/GetClientDetailsUseCase';

export const useClientDetailsViewModel = (clientId) => {
  const [client, setClient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const getClientDetailsUseCase = useMemo(
    () => new GetClientDetailsUseCase(clientRepository),
    []
  );

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');
        const details = await getClientDetailsUseCase.execute(clientId);
        if (active) setClient(details);
      } catch (error) {
        if (active) {
          setErrorMessage(error?.response?.data?.error || 'Nao foi possivel carregar cliente');
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [clientId, getClientDetailsUseCase]);

  return {
    client,
    isLoading,
    errorMessage
  };
};
