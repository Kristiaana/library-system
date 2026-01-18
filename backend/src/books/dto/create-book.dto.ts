import { IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateBookDto {
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsNotEmpty()
  @MaxLength(120)
  author: string;

  @IsOptional()
  @MaxLength(60)
  genre?: string;

  @IsOptional()
  @MaxLength(20)
  isbn?: string;
}
