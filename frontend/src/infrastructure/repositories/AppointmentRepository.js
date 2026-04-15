import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import apiClient from '../../services/api';
import { mapApiAppointmentToDomain, parseDateTimeToIso } from '../../domain/appointments/AppointmentMapper';
import { SyncQueueService } from '../services/SyncQueueService';

const APPOINTMENTS_CACHE_KEY = 'appointments_cache_v1';

const readCache = async () => {
  try {
    const raw = await AsyncStorage.getItem(APPOINTMENTS_CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeCache = async (appointments) => {
  try {
    await AsyncStorage.setItem(APPOINTMENTS_CACHE_KEY, JSON.stringify(appointments));
  } catch {
    // best effort
  }
};

const getCurrentUser = async () => {
  try {
    const raw = await AsyncStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const normalize = (rows) => rows.map(mapApiAppointmentToDomain);

export class AppointmentRepository {
  async list(filters = {}) {
    try {
      const response = await apiClient.get('/appointments', { params: filters });
      const rows = response?.data?.data || [];
      const normalized = normalize(rows);
      await writeCache(normalized);
      return normalized;
    } catch (error) {
      const cached = await readCache();
      if (filters?.status && filters.status !== 'all') {
        return cached.filter((a) => a.status === filters.status);
      }
      if (cached.length > 0) return cached;
      throw error;
    }
  }

  async getById(id) {
    const response = await apiClient.get(`/appointments/${id}`);
    return mapApiAppointmentToDomain(response?.data?.data || response?.data);
  }

  async create(input) {
    const currentUser = await getCurrentUser();
    const dateIso = parseDateTimeToIso(input.date, input.time);

    if (!dateIso) {
      throw new Error('Data ou horario invalido');
    }

    // Verificar conectividade
    const state = await NetInfo.fetch();
    const isConnected = state.isConnected !== false && state.isInternetReachable !== false;

    if (!isConnected) {
      // 📝 Modo offline: enfileirar sem fazer lookup de serviço
      const tempId = `temp_apt_${Date.now()}`;
      const optimisticAppointment = {
        id: tempId,
        clientId: input.clientId,
        professionalId: input.professionalId || currentUser?.id,
        serviceType: input.serviceType,
        date: dateIso,
        notes: input.notes || null,
        status: 'pending',
        offline: true,
        syncPending: true
      };

      // Preparar payload para sincronização
      // Nota: serviceId será resolvido no servidor quando online
      const payload = {
        clientId: input.clientId,
        professionalId: input.professionalId || currentUser?.id,
        serviceType: input.serviceType,
        date: dateIso,
        notes: input.notes || null
      };

      // Enfileirar operação
      await SyncQueueService.enqueueOperation({
        type: 'create',
        module: 'appointments',
        endpoint: '/appointments',
        method: 'POST',
        data: payload
      });

      const current = await readCache();
      await writeCache([optimisticAppointment, ...current]);

      console.log(`[sync] Agendamento criado offline: ${input.serviceType} (será sincronizado quando online)`);
      return optimisticAppointment;
    }

    // Online: fazer full workflow com lookup de serviço
    const servicesResponse = await apiClient.get('/services');
    const services = servicesResponse?.data?.data || [];

    let service = services.find(
      (s) => s.name?.toLowerCase() === String(input.serviceType || '').toLowerCase()
    );

    if (!service && currentUser?.role === 'admin') {
      const createdServiceResponse = await apiClient.post('/services', {
        name: input.serviceType,
        description: `Servico criado automaticamente: ${input.serviceType}`,
        duration: 60,
        price: 100,
        category: 'Servico'
      });
      service = createdServiceResponse?.data?.data;
    }

    if (!service?.id) {
      throw new Error('Servico nao encontrado. Crie um servico antes de agendar.');
    }

    const payload = {
      clientId: input.clientId,
      professionalId: input.professionalId || currentUser?.id,
      serviceId: service.id,
      date: dateIso,
      notes: input.notes || null
    };

    const response = await apiClient.post('/appointments', payload);
    const created = mapApiAppointmentToDomain(response?.data?.data || response?.data);

    const current = await readCache();
    await writeCache([created, ...current.filter((a) => a.id !== created.id)]);

    console.log(`[sync] Agendamento criado online: ${created.serviceType}`);
    return created;
  }

  async updateStatus(id, status) {
    // Verificar conectividade
    const state = await NetInfo.fetch();
    const isConnected = state.isConnected !== false && state.isInternetReachable !== false;

    if (!isConnected) {
      // Offline: atualizar cache localmente + enfileirar
      const current = await readCache();
      const toUpdate = current.find((a) => a.id === id);

      if (toUpdate) {
        toUpdate.status = status;
        toUpdate.syncPending = true;
        await writeCache(current);

        // Enfileirar atualização de status
        await SyncQueueService.enqueueOperation({
          type: 'update',
          module: 'appointments',
          endpoint: `/appointments/${id}`,
          method: 'PUT',
          data: { status }
        });

        console.log(`[sync] Status atualizado offline: ${id} -> ${status}`);
        return toUpdate;
      }
    }

    // Online: fazer requisição normal
    const response = await apiClient.put(`/appointments/${id}`, { status });
    const updated = mapApiAppointmentToDomain(response?.data?.data || response?.data);

    const current = await readCache();
    await writeCache(current.map((a) => (a.id === id ? updated : a)));

    console.log(`[sync] Status atualizado online: ${id} -> ${status}`);
    return updated;
  }

  async update(id, input) {
    const response = await apiClient.put(`/appointments/${id}`, input);
    const updated = mapApiAppointmentToDomain(response?.data?.data || response?.data);

    const current = await readCache();
    await writeCache(current.map((appointment) => (appointment.id === id ? updated : appointment)));

    return updated;
  }

  async requestConfirmation(id, channel = 'internal') {
    const response = await apiClient.post(`/appointments/${id}/confirmation/request`, { channel });
    const updated = mapApiAppointmentToDomain(response?.data?.data || response?.data);

    const current = await readCache();
    await writeCache(current.map((appointment) => (appointment.id === id ? updated : appointment)));

    return updated;
  }

  async respondConfirmation(id, responseStatus) {
    const response = await apiClient.post(`/appointments/${id}/confirmation/respond`, {
      response: responseStatus
    });
    const updated = mapApiAppointmentToDomain(response?.data?.data || response?.data);

    const current = await readCache();
    await writeCache(current.map((appointment) => (appointment.id === id ? updated : appointment)));

    return updated;
  }

  async requestBatchConfirmation(date, channel = 'internal', filters = {}) {
    const response = await apiClient.post('/appointments/confirmations/request-batch', {
      date,
      channel,
      ...filters
    });
    return response?.data?.data || response?.data;
  }

  async previewBatchConfirmation(date, channel = 'internal', filters = {}) {
    const response = await apiClient.post('/appointments/confirmations/request-batch', {
      date,
      channel,
      ...filters,
      dryRun: true
    });
    return response?.data?.data || response?.data;
  }
}

export const appointmentRepository = new AppointmentRepository();
