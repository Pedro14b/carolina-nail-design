export class MarkAllNotificationsAsReadUseCase {
  constructor(repository) {
    this.repository = repository;
  }

  async execute() {
    return this.repository.markAllAsRead();
  }
}
