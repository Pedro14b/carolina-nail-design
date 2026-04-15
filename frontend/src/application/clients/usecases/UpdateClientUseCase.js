import { ClientRules } from '../../../domain/clients/ClientRules';

export class UpdateClientUseCase {
  constructor(repository) {
    this.repository = repository;
  }

  async execute(id, input) {
    if (!id) {
      throw new Error('Cliente invalido');
    }

    const validation = ClientRules.validateCreateInput(input);
    if (!validation.isValid) {
      const err = new Error('Dados invalidos');
      err.validationErrors = validation.errors;
      throw err;
    }

    const cleanedInput = {
      ...input,
      phone: input.phone.replace(/\D/g, ''),
      birthDate: input.birthDate.replace(/\D/g, ''),
      zipCode: input.zipCode?.replace(/\D/g, '')
    };

    return this.repository.update(id, cleanedInput);
  }
}
