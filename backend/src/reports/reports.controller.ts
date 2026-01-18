import { Controller, Get } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('active-loans-count')
  async activeLoansCount() {
    return { activeLoans: await this.reportsService.activeLoansCount() };
  }

  @Get('overdue-loans-count')
  async overdueLoansCount() {
    return { overdueLoans: await this.reportsService.overdueLoansCount() };
  }
}
