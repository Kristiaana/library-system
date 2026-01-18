import { IsDateString, IsNumber } from 'class-validator';

export class CreateLoanDto {
  @IsNumber()
  readerId: number;

  @IsNumber()
  copyId: number;

  @IsDateString()
  dueDate: string;
}
