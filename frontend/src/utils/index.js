export const dateUtils = {
  formatDate: (date) => {
    return new Date(date).toLocaleDateString('pt-BR');
  },

  formatTime: (date) => {
    return new Date(date).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  formatDateTime: (date) => {
    return new Date(date).toLocaleString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  getNextAppointmentDate: (currentDate = new Date()) => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 1);
    return next;
  }
};

export const currencyUtils = {
  format: (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  },

  parse: (valueStr) => {
    return parseFloat(valueStr.replace(/[^\d,-]/g, '').replace(',', '.'));
  }
};

export const validationUtils = {
  isValidPhone: (phone) => {
    const phoneRegex = /^(\+55\s?)?(\(?\d{2}\)?)\s?9?\d{4}-?\d{4}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  },

  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isValidPassword: (password) => {
    return password && password.length >= 8;
  }
};
