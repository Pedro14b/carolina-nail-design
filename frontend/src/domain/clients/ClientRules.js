export const ClientRules = {
  validateName(name) {
    if (!name || name.trim().length < 3) {
      return 'Nome deve ter no minimo 3 caracteres';
    }
    return null;
  },

  validatePhone(phone) {
    const digits = String(phone || '').replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 11) {
      return 'Telefone deve ter de 10 a 11 digitos';
    }
    return null;
  },

  validateCreateInput(input) {
    const errors = {};

    const nameError = this.validateName(input?.name);
    if (nameError) errors.name = nameError;

    const phoneError = this.validatePhone(input?.phone);
    if (phoneError) errors.phone = phoneError;

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
};
