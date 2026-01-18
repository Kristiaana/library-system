import { BookCopy } from 'src/book-copies/entities/book-copy.entity';
import { Reader } from 'src/readers/entities/reader.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class Loan {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Reader, { eager: true, onDelete: 'CASCADE' })
  reader: Reader;

  @ManyToOne(() => BookCopy, { eager: true, onDelete: 'CASCADE' })
  copy: BookCopy;

  @CreateDateColumn()
  loanDate: Date;

  @Column({ type: 'datetime' })
  dueDate: Date;

  @Column({ type: 'datetime', nullable: true })
  returnDate?: Date | null;
}
