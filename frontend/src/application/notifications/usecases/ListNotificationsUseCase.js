export class ListNotificationsUseCase {
  constructor(repository) {
    this.repository = repository;
  }

  async execute(page = 1, limit = 50) {
    return this.repository.list(page, limit);
  }
}
