const toNumber = (value) => {
  const parsed = Number(value || 0);
  return Number.isNaN(parsed) ? 0 : parsed;
};

export const mapFinancialReportToDomain = (raw) => ({
  summary: {
    totalIncome: toNumber(raw?.summary?.totalIncome),
    totalExpenses: toNumber(raw?.summary?.totalExpenses),
    balance: toNumber(raw?.summary?.balance)
  },
  transactions: raw?.transactions || []
});

export const mapAppointmentReportToDomain = (raw) => ({
  summary: {
    total: toNumber(raw?.summary?.total),
    completed: toNumber(raw?.summary?.completed),
    cancelled: toNumber(raw?.summary?.cancelled),
    pending: toNumber(raw?.summary?.pending),
    averageDuration: toNumber(raw?.summary?.averageDuration),
    completionRate: toNumber(raw?.summary?.completionRate)
  },
  topServices: raw?.topServices || [],
  details: raw?.details || []
});

export const mapRetentionReportToDomain = (raw) => ({
  summary: {
    totalTrackedClients: toNumber(raw?.summary?.totalTrackedClients),
    returnCandidates: toNumber(raw?.summary?.returnCandidates),
    topAbsences: toNumber(raw?.summary?.topAbsences)
  },
  returnCandidates: raw?.returnCandidates || [],
  mostAbsent: raw?.mostAbsent || []
});
