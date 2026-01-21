import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Loan } from './entities/loan.entity';
import { Reader } from 'src/readers/entities/reader.entity';
import {
  BookCopy,
  BookCopyStatus,
} from 'src/book-copies/entities/book-copy.entity';
import { CreateLoanDto } from './dto/create-loan.dto';

@Injectable()
export class LoansService {
  constructor(
    @InjectRepository(Loan) private readonly loanRepo: Repository<Loan>,
    @InjectRepository(Reader) private readonly readerRepo: Repository<Reader>,
    @InjectRepository(BookCopy) private readonly copyRepo: Repository<BookCopy>,
  ) {}

  async create(dto: CreateLoanDto) {
    const reader = await this.readerRepo.findOne({
      where: { id: dto.readerId },
    });
    if (!reader) throw new NotFoundException('Lasītājs netika atrasts');

    const copy = await this.copyRepo.findOne({ where: { id: dto.copyId } });
    if (!copy) throw new NotFoundException('Eksemplārs netika atrasts');

    if (copy.status !== BookCopyStatus.AVAILABLE) {
      throw new BadRequestException('Eksemplārs nav pieejams izsniegšanai');
    }

    copy.status = BookCopyStatus.LOANED;
    await this.copyRepo.save(copy);

    const loan = this.loanRepo.create({
      reader,
      copy,
      dueDate: new Date(dto.dueDate),
    });

    return this.loanRepo.save(loan);
  }

  findAll() {
    return this.loanRepo.find({ order: { id: 'DESC' } });
  }

  async returnLoan(id: number) {
    const loan = await this.loanRepo.findOne({ where: { id } });
    if (!loan)
      throw new NotFoundException('Izsniegtais eksemplārs netika atrasts');

    if (loan.returnDate)
      throw new BadRequestException('Eksemplārs jau ir atgriezts');

    loan.returnDate = new Date();
    await this.loanRepo.save(loan);

    loan.copy.status = BookCopyStatus.AVAILABLE;
    await this.copyRepo.save(loan.copy);

    return loan;
  }
}
