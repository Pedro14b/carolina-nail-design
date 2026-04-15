export class GetAppointmentDetailsUseCase {
  constructor(repository) {
    this.repository = repository;
  }

  async execute(id) {
    if (!id) throw new Error('Agendamento invalido');
    return this.repository.getById(id);
  }
}
