import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';

import { CreateBookCopyDto } from './dto/create-book-copy.dto';
import { BookCopy, BookCopyStatus } from './entities/book-copy.entity';
import { Book } from 'src/books/entities/book.entity';
import { Loan } from 'src/loans/entities/loan.entity';

@Injectable()
export class BookCopiesService {
  constructor(
    @InjectRepository(BookCopy)
    private readonly copyRepo: Repository<BookCopy>,

    @InjectRepository(Book)
    private readonly bookRepo: Repository<Book>,

    @InjectRepository(Loan)
    private readonly loanRepo: Repository<Loan>,
  ) {}

  async create(dto: CreateBookCopyDto) {
    const book = await this.bookRepo.findOne({ where: { id: dto.bookId } });
    if (!book) throw new NotFoundException('Grāmata netika atrasta');

    const inv = (dto.inventoryCode ?? '').trim();
    const loc = (dto.location ?? '').trim();

    const exists = await this.copyRepo.exist({
      where: { inventoryCode: inv },
    });

    if (exists) {
      throw new ConflictException(
        'Eksemplārs ar šādu inventāra kodu jau eksistē.',
      );
    }

    const copy = this.copyRepo.create({
      inventoryCode: inv,
      location: loc,
      status: BookCopyStatus.AVAILABLE,
      book,
    });

    return this.copyRepo.save(copy);
  }

  findAll() {
    return this.copyRepo.find({
      order: { id: 'DESC' },
    });
  }

  async remove(id: number) {
    const copy = await this.copyRepo.findOne({
      where: { id },
    });
    if (!copy) throw new NotFoundException('Eksemplārs netika atrasts');

    const activeLoanCount = await this.loanRepo.count({
      where: {
        copy: { id },
        returnDate: IsNull(),
      },
    });

    if (activeLoanCount > 0) {
      throw new BadRequestException(
        'Nevar dzēst eksemplāru, kamēr tam ir izsniegts',
      );
    }

    await this.copyRepo.remove(copy);
    return { deleted: true };
  }
}
