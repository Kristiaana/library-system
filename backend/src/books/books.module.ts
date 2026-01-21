import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { Book } from './entities/book.entity';
import { Loan } from 'src/loans/entities/loan.entity';
import { BookCopy } from 'src/book-copies/entities/book-copy.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Book, Loan, BookCopy])],
  controllers: [BooksController],
  providers: [BooksService],
})
export class BooksModule {}
