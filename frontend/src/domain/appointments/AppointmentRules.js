export const AppointmentRules = {
  validateDate(date) {
    if (!date) return 'Data e obrigatoria';
    const isValid = /^\d{2}\/\d{2}\/\d{4}$/.test(String(date));
    return isValid ? null : 'Data deve estar no formato DD/MM/AAAA';
  },

  validateTime(time) {
    if (!time) return 'Horario e obrigatorio';
    const isValid = /^\d{2}:\d{2}$/.test(String(time));
    return isValid ? null : 'Horario deve estar no formato HH:MM';
  },

  validateCreateInput(input) {
    const errors = {};

    if (!input?.clientId) errors.clientId = 'Cliente e obrigatorio';

    const dateError = this.validateDate(input?.date);
    if (dateError) errors.date = dateError;

    const timeError = this.validateTime(input?.time);
    if (timeError) errors.time = timeError;

    if (!input?.serviceType) errors.serviceType = 'Tipo de servico e obrigatorio';

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
};
