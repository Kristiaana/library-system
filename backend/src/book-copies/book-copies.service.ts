import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateBookCopyDto } from './dto/create-book-copy.dto';
import { BookCopy, BookCopyStatus } from './entities/book-copy.entity';
import { Book } from 'src/books/entities/book.entity';

@Injectable()
export class BookCopiesService {
  constructor(
    @InjectRepository(BookCopy)
    private readonly copyRepo: Repository<BookCopy>,
    @InjectRepository(Book)
    private readonly bookRepo: Repository<Book>,
  ) {}

  async create(dto: CreateBookCopyDto) {
    const book = await this.bookRepo.findOne({ where: { id: dto.bookId } });
    if (!book) throw new NotFoundException('Book not found');

    const copy = this.copyRepo.create({
      inventoryCode: dto.inventoryCode,
      location: dto.location,
      status: dto.status ?? BookCopyStatus.AVAILABLE,
      book,
    });

    return this.copyRepo.save(copy);
  }

  findAll() {
    return this.copyRepo.find({ order: { id: 'DESC' } });
  }

  async remove(id: number) {
    const copy = await this.copyRepo.findOne({ where: { id } });
    if (!copy) throw new NotFoundException('Copy not found');
    await this.copyRepo.remove(copy);
    return { deleted: true };
  }
}
