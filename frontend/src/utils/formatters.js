/**
 * Funções de formatação para inputs
 */

export const formatters = {
  /**
   * Formata telefone para (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
   */
  phone: (value) => {
    if (!value) return '';
    const digits = value.replace(/\D/g, '');
    
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    
    // Decide entre 10 ou 11 dígitos
    if (digits.length <= 10) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  },

  /**
   * Formata CPF para XXX.XXX.XXX-XX
   */
  cpf: (value) => {
    if (!value) return '';
    const digits = value.replace(/\D/g, '');
    
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
  },

  /**
   * Formata data para DD/MM/YYYY
   */
  date: (value) => {
    if (!value) return '';
    const digits = value.replace(/\D/g, '');
    
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
  },

  /**
   * Formata CEP para XXXXX-XXX
   */
  cep: (value) => {
    if (!value) return '';
    const digits = value.replace(/\D/g, '');
    
    if (digits.length <= 5) return digits;
    
    return `${digits.slice(0, 5)}-${digits.slice(5, 8)}`;
  },

  /**
   * Formata cartão de crédito para XXXX XXXX XXXX XXXX
   */
  creditCard: (value) => {
    if (!value) return '';
    const digits = value.replace(/\D/g, '');
    
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ').slice(0, 19);
  },

  /**
   * Formata valor monetário para R$ X.XXX,XX
   */
  currency: (value) => {
    if (!value) return 'R$ 0,00';
    
    const digits = value.replace(/\D/g, '');
    const cents = digits.slice(-2) || '00';
    const reais = digits.slice(0, -2) || '0';
    
    const formatted = reais.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `R$ ${formatted},${cents}`;
  },

  /**
   * Formata percentual
   */
  percentage: (value) => {
    if (!value) return '0%';
    const digits = value.replace(/\D/g, '');
    const num = Math.min(100, parseInt(digits) || 0);
    return `${num}%`;
  }
};

/**
 * Retorna o formatter baseado no tipo
 */
export const getFormatter = (type) => {
  return formatters[type] || ((value) => value);
};

/**
 * Remove formatação e retorna apenas dígitos
 */
export const removeFormatting = (value) => {
  return value.replace(/\D/g, '');
};
