export class UpdateAppointmentUseCase {
  constructor(repository) {
    this.repository = repository;
  }

  async execute({ id, notes }) {
    if (!id) throw new Error('Agendamento invalido');
    return this.repository.update(id, { notes });
  }
}
