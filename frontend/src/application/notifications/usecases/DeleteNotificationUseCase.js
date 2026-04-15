export class DeleteNotificationUseCase {
  constructor(repository) {
    this.repository = repository;
  }

  async execute(id) {
    if (!id) throw new Error('Notificacao invalida');
    return this.repository.deleteById(id);
  }
}
