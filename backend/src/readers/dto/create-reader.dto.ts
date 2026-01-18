import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  MaxLength,
} from 'class-validator';

export class CreateReaderDto {
  @IsNotEmpty()
  @MaxLength(80)
  firstName: string;

  @IsNotEmpty()
  @MaxLength(80)
  lastName: string;

  @IsEmail()
  @MaxLength(120)
  email: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
