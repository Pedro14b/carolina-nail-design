export class MarkNotificationAsReadUseCase {
  constructor(repository) {
    this.repository = repository;
  }

  async execute(id) {
    if (!id) throw new Error('Notificacao invalida');
    return this.repository.markAsRead(id);
  }
}
