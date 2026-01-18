import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ReadersModule } from './readers/readers.module';
import { BooksModule } from './books/books.module';
import { BookCopiesModule } from './book-copies/book-copies.module';
import { LoansModule } from './loans/loans.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'data/library.sqlite',
      autoLoadEntities: true,
      synchronize: true,
    }),
    ReadersModule,
    BooksModule,
    BookCopiesModule,
    LoansModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
