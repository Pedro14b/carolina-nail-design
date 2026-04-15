export class ListClientsUseCase {
  constructor(repository) {
    this.repository = repository;
  }

  async execute(params) {
    return this.repository.list(params);
  }
}
