import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoansService } from './loans.service';
import { LoansController } from './loans.controller';
import { BookCopy } from 'src/book-copies/entities/book-copy.entity';
import { Reader } from 'src/readers/entities/reader.entity';
import { Loan } from './entities/loan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Loan, Reader, BookCopy])],
  controllers: [LoansController],
  providers: [LoansService],
})
export class LoansModule {}
