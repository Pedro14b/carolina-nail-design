import { useState } from 'react';
import { useSyncQueue } from '../context/SyncContext';

export { useSyncQueue };

export const useAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const addAppointment = (appointment) => {
    setAppointments([...appointments, appointment]);
  };

  const updateAppointment = (id, updated) => {
    setAppointments(
      appointments.map(apt => apt.id === id ? { ...apt, ...updated } : apt)
    );
  };

  const removeAppointment = (id) => {
    setAppointments(appointments.filter(apt => apt.id !== id));
  };

  return {
    appointments,
    isLoading,
    error,
    addAppointment,
    updateAppointment,
    removeAppointment
  };
};

export const useClients = () => {
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const addClient = (client) => {
    setClients([...clients, client]);
  };

  const updateClient = (id, updated) => {
    setClients(
      clients.map(c => c.id === id ? { ...c, ...updated } : c)
    );
  };

  const removeClient = (id) => {
    setClients(clients.filter(c => c.id !== id));
  };

  return {
    clients,
    isLoading,
    error,
    addClient,
    updateClient,
    removeClient
  };
};
