import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookCopiesService } from './book-copies.service';
import { BookCopiesController } from './book-copies.controller';
import { BookCopy } from './entities/book-copy.entity';
import { Book } from 'src/books/entities/book.entity';
import { Loan } from 'src/loans/entities/loan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BookCopy, Book, Loan])],
  controllers: [BookCopiesController],
  providers: [BookCopiesService],
})
export class BookCopiesModule {}
