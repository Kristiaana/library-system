import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Book } from './entities/book.entity';
import { Loan } from 'src/loans/entities/loan.entity';
import { BookCopy } from 'src/book-copies/entities/book-copy.entity';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private readonly repo: Repository<Book>,

    @InjectRepository(Loan)
    private readonly loanRepo: Repository<Loan>,

    @InjectRepository(BookCopy)
    private readonly copyRepo: Repository<BookCopy>,
  ) {}

  create(dto: CreateBookDto) {
    const book = this.repo.create(dto);
    return this.repo.save(book);
  }

  findAll() {
    return this.repo.find({ order: { id: 'DESC' } });
  }

  async findOne(id: number) {
    const book = await this.repo.findOne({ where: { id } });
    if (!book) throw new NotFoundException('Grāmata netika atrasta');
    return book;
  }

  async update(id: number, dto: UpdateBookDto) {
    const book = await this.findOne(id);
    Object.assign(book, dto);
    return this.repo.save(book);
  }

  async remove(id: number) {
    const book = await this.findOne(id);

    const hasAnyCopy = await this.copyRepo.exist({
      where: { book: { id: book.id } },
    });

    if (hasAnyCopy) {
      throw new BadRequestException(
        'Nevar dzēst grāmatu, kurai ir eksemplāri.',
      );
    }

    const activeLoan = await this.loanRepo.findOne({
      where: {
        returnDate: IsNull(),
        copy: { book: { id: book.id } },
      },
      select: { id: true },
    });

    if (activeLoan) {
      throw new BadRequestException(
        'Nevar dzēst grāmatu, kamēr ir izsniegti tās eksemplāri. Vispirms atgrieziet grāmatu.',
      );
    }

    await this.repo.remove(book);
    return { deleted: true };
  }
}
