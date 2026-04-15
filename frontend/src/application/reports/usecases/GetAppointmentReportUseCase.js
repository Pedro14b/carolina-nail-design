export class GetAppointmentReportUseCase {
  constructor(repository) {
    this.repository = repository;
  }

  async execute({ startDate, endDate }) {
    if (!startDate || !endDate) throw new Error('Periodo invalido');
    return this.repository.getAppointmentReport(startDate, endDate);
  }
}
