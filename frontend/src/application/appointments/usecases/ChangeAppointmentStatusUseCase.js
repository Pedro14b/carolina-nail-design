export class ChangeAppointmentStatusUseCase {
  constructor(repository) {
    this.repository = repository;
  }

  async execute({ id, status }) {
    if (!id || !status) throw new Error('Parametros invalidos para atualizar status');
    return this.repository.updateStatus(id, status);
  }
}
