import { AppointmentRules } from '../../../domain/appointments/AppointmentRules';

export class CreateAppointmentUseCase {
  constructor(repository) {
    this.repository = repository;
  }

  async execute(input) {
    const validation = AppointmentRules.validateCreateInput(input);

    if (!validation.isValid) {
      const err = new Error('Dados invalidos');
      err.validationErrors = validation.errors;
      throw err;
    }

    return this.repository.create(input);
  }
}
