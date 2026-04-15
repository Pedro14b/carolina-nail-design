import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../../services/api';
import { mapAppointmentReportToDomain, mapFinancialReportToDomain, mapRetentionReportToDomain } from '../../domain/reports/ReportMapper';

const REPORT_CACHE_KEY = 'reports_cache_v1';

const readCache = async () => {
  try {
    const raw = await AsyncStorage.getItem(REPORT_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const writeCache = async (cache) => {
  try {
    await AsyncStorage.setItem(REPORT_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // best effort
  }
};

const cacheKeyByRange = (startDate, endDate) => `${startDate}_${endDate}`;

export class ReportRepository {
  async getFinancialReport(startDate, endDate) {
    const key = cacheKeyByRange(startDate, endDate);

    try {
      const response = await apiClient.get('/reports/financial', {
        params: { startDate, endDate }
      });

      const mapped = mapFinancialReportToDomain(response?.data?.data || {});
      const cache = await readCache();
      cache[key] = { ...(cache[key] || {}), financial: mapped };
      await writeCache(cache);
      return mapped;
    } catch (error) {
      const cache = await readCache();
      if (cache[key]?.financial) return cache[key].financial;
      throw error;
    }
  }

  async getAppointmentReport(startDate, endDate) {
    const key = cacheKeyByRange(startDate, endDate);

    try {
      const response = await apiClient.get('/reports/appointments', {
        params: { startDate, endDate }
      });

      const mapped = mapAppointmentReportToDomain(response?.data?.data || {});
      const cache = await readCache();
      cache[key] = { ...(cache[key] || {}), appointments: mapped };
      await writeCache(cache);
      return mapped;
    } catch (error) {
      const cache = await readCache();
      if (cache[key]?.appointments) return cache[key].appointments;
      throw error;
    }
  }

  async getRetentionReport(startDate, endDate) {
    const key = cacheKeyByRange(startDate, endDate);

    try {
      const response = await apiClient.get('/reports/retention', {
        params: { startDate, endDate }
      });

      const mapped = mapRetentionReportToDomain(response?.data?.data || {});
      const cache = await readCache();
      cache[key] = { ...(cache[key] || {}), retention: mapped };
      await writeCache(cache);
      return mapped;
    } catch (error) {
      const cache = await readCache();
      if (cache[key]?.retention) return cache[key].retention;
      throw error;
    }
  }
}

export const reportRepository = new ReportRepository();
