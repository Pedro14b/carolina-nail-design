const toNumber = (value) => {
  if (value === null || value === undefined || value === '') return 0;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const formatDateTime = (isoLike) => {
  if (!isoLike) return { date: '', time: '' };
  const dt = new Date(isoLike);
  if (Number.isNaN(dt.getTime())) return { date: '', time: '' };

  const dd = String(dt.getDate()).padStart(2, '0');
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const yyyy = dt.getFullYear();
  const hh = String(dt.getHours()).padStart(2, '0');
  const min = String(dt.getMinutes()).padStart(2, '0');

  return {
    date: `${dd}/${mm}/${yyyy}`,
    time: `${hh}:${min}`
  };
};

export const mapApiAppointmentToDomain = (raw) => {
  const split = formatDateTime(raw?.date);

  return {
    id: raw?.id,
    clientId: raw?.clientId,
    professionalId: raw?.professionalId,
    serviceId: raw?.serviceId,
    serviceType: raw?.Service?.name || raw?.serviceType || 'Servico',
    date: split.date,
    time: split.time,
    status: raw?.status || 'pending',
    confirmationStatus: raw?.confirmationStatus || 'no_response',
    confirmationChannel: raw?.confirmationChannel || 'internal',
    confirmationRequestedAt: raw?.confirmationRequestedAt || null,
    confirmationRespondedAt: raw?.confirmationRespondedAt || null,
    notes: raw?.notes || '',
    totalPrice: toNumber(raw?.totalPrice || raw?.price),
    client: raw?.client
      ? { id: raw.client.id, name: raw.client.name, phone: raw.client.phone }
      : null
  };
};

export const parseDateTimeToIso = (date, time) => {
  const [dd, mm, yyyy] = String(date || '').split('/');
  const [hh, min] = String(time || '').split(':');

  const year = Number(yyyy);
  const month = Number(mm);
  const day = Number(dd);
  const hour = Number(hh);
  const minute = Number(min);

  if ([year, month, day, hour, minute].some((v) => Number.isNaN(v))) {
    return null;
  }

  const dt = new Date(year, month - 1, day, hour, minute, 0, 0);
  if (Number.isNaN(dt.getTime())) return null;
  return dt.toISOString();
};
