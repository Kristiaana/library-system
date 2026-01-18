import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Loan } from 'src/loans/entities/loan.entity';
import { IsNull, LessThan, Repository } from 'typeorm';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Loan)
    private readonly loanRepo: Repository<Loan>,
  ) {}

  async activeLoansCount() {
    return this.loanRepo.count({ where: { returnDate: IsNull() } });
  }

  async overdueLoansCount() {
    const now = new Date();
    return this.loanRepo.count({
      where: { returnDate: IsNull(), dueDate: LessThan(now) },
    });
  }
}
