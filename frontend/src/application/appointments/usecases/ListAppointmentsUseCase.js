export class ListAppointmentsUseCase {
  constructor(repository) {
    this.repository = repository;
  }

  async execute(filters) {
    return this.repository.list(filters);
  }
}
