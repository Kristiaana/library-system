import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReadersService } from './readers.service';
import { ReadersController } from './readers.controller';
import { Reader } from './entities/reader.entity';
import { Loan } from 'src/loans/entities/loan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Reader, Loan])],
  controllers: [ReadersController],
  providers: [ReadersService],
})
export class ReadersModule {}
