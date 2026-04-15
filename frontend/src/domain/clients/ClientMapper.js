const toNumber = (value) => {
  if (value === null || value === undefined || value === '') return 0;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

export const mapApiClientToDomain = (raw) => {
  const clientProfile = raw?.Client || raw?.client || {};
  const stats = raw?.stats || {};
  const history = Array.isArray(raw?.history) ? raw.history : [];

  return {
    id: raw?.id,
    name: raw?.name || '',
    phone: raw?.phone || '',
    email: raw?.email || null,
    birthDate: clientProfile?.birthDate || null,
    address: clientProfile?.address || null,
    city: clientProfile?.city || null,
    state: clientProfile?.state || null,
    zipCode: clientProfile?.zipCode || null,
    notes: clientProfile?.notes || null,
    allergies: clientProfile?.allergies || null,
    preferences: clientProfile?.preferences || null,
    favoriteServices: clientProfile?.favoriteServices || null,
    totalSpent: toNumber(clientProfile?.totalSpent || stats?.totalSpent),
    stats: {
      totalAppointments: toNumber(stats?.totalAppointments),
      totalSpent: toNumber(stats?.totalSpent),
      completedAppointments: toNumber(stats?.completedAppointments),
      lastVisitAt: stats?.lastVisitAt || null,
      nextVisitAt: stats?.nextVisitAt || null
    },
    nextAppointment: raw?.nextAppointment
      ? {
          id: raw.nextAppointment.id,
          date: raw.nextAppointment.date || null,
          status: raw.nextAppointment.status || 'pending',
          notes: raw.nextAppointment.notes || null,
          totalPrice: toNumber(raw.nextAppointment.totalPrice),
          service: raw.nextAppointment.service || raw.nextAppointment.Service || null
        }
      : null,
    history: history.map((appointment) => ({
      id: appointment?.id,
      date: appointment?.date || null,
      status: appointment?.status || 'pending',
      notes: appointment?.notes || null,
      totalPrice: toNumber(appointment?.totalPrice),
      service: appointment?.service || null,
      professional: appointment?.professional || null
    }))
  };
};

export const mapDomainCreateClientToApi = (input) => ({
  name: input.name?.trim(),
  phone: String(input.phone || '').replace(/\D/g, ''),
  email: input.email || null,
  birthDate: input.birthDate || null,
  address: input.address || null,
  city: input.city || null,
  state: input.state || null,
  zipCode: input.zipCode || null,
  notes: input.notes || null,
  allergies: input.allergies || null,
  preferences: input.preferences || null,
  favoriteServices: input.favoriteServices || null
});
