import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { BookCopyStatus } from '../entities/book-copy.entity';

export class CreateBookCopyDto {
  @IsNotEmpty()
  inventoryCode: string;

  @IsNotEmpty()
  location: string;

  @IsNumber()
  bookId: number;

  @IsOptional()
  @IsEnum(BookCopyStatus)
  status?: BookCopyStatus;
}
