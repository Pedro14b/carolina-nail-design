import { useCallback, useEffect, useMemo, useState } from 'react';
import { reportRepository } from '../../infrastructure/repositories/ReportRepository';
import { GetFinancialReportUseCase } from '../../application/reports/usecases/GetFinancialReportUseCase';
import { GetAppointmentReportUseCase } from '../../application/reports/usecases/GetAppointmentReportUseCase';
import { GetRetentionReportUseCase } from '../../application/reports/usecases/GetRetentionReportUseCase';

const getDateRangeByPeriod = (period) => {
  const endDate = new Date();
  const startDate = new Date();

  switch (period) {
    case 'week':
      startDate.setDate(endDate.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(endDate.getMonth() - 1);
      break;
    case 'year':
      startDate.setFullYear(endDate.getFullYear() - 1);
      break;
    default:
      startDate.setMonth(endDate.getMonth() - 1);
      break;
  }

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  };
};

export const useReportsViewModel = () => {
  const [period, setPeriod] = useState('month');
  const [financialReport, setFinancialReport] = useState(null);
  const [appointmentReport, setAppointmentReport] = useState(null);
  const [retentionReport, setRetentionReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const financialUseCase = useMemo(() => new GetFinancialReportUseCase(reportRepository), []);
  const appointmentUseCase = useMemo(
    () => new GetAppointmentReportUseCase(reportRepository),
    []
  );
  const retentionUseCase = useMemo(
    () => new GetRetentionReportUseCase(reportRepository),
    []
  );

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');

      const range = getDateRangeByPeriod(period);

      const [financial, appointments, retention] = await Promise.all([
        financialUseCase.execute(range),
        appointmentUseCase.execute(range),
        retentionUseCase.execute(range)
      ]);

      setFinancialReport(financial);
      setAppointmentReport(appointments);
      setRetentionReport(retention);
    } catch (error) {
      setErrorMessage(error?.response?.data?.error || 'Erro ao carregar relatorios');
    } finally {
      setIsLoading(false);
    }
  }, [appointmentUseCase, financialUseCase, period, retentionUseCase]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    period,
    setPeriod,
    financialReport,
    appointmentReport,
    retentionReport,
    isLoading,
    errorMessage,
    refresh: load
  };
};
