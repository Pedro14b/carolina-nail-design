export class GetClientDetailsUseCase {
  constructor(repository) {
    this.repository = repository;
  }

  async execute(id) {
    if (!id) throw new Error('Cliente invalido');
    return this.repository.getById(id);
  }
}
