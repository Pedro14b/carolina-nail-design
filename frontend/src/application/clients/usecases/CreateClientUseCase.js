import { ClientRules } from '../../../domain/clients/ClientRules';

export class CreateClientUseCase {
  constructor(repository) {
    this.repository = repository;
  }

  async execute(input) {
    const validation = ClientRules.validateCreateInput(input);

    if (!validation.isValid) {
      const err = new Error('Dados invalidos');
      err.validationErrors = validation.errors;
      throw err;
    }

    // Remove formatação do telefone e outros campos antes de enviar
    const cleanedInput = {
      ...input,
      phone: input.phone.replace(/\D/g, ''),
      birthDate: input.birthDate.replace(/\D/g, ''),
      zipCode: input.zipCode?.replace(/\D/g, '')
    };

    return this.repository.create(cleanedInput);
  }
}
