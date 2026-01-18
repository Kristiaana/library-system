import { Book } from 'src/books/entities/book.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';

export enum BookCopyStatus {
  AVAILABLE = 'AVAILABLE',
  LOANED = 'LOANED',
}

@Entity()
export class BookCopy {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  inventoryCode: string;

  @Column({
    type: 'text',
    default: BookCopyStatus.AVAILABLE,
  })
  status: BookCopyStatus;

  @Column({ length: 100 })
  location: string;

  @ManyToOne(() => Book, { eager: true, onDelete: 'CASCADE' })
  book: Book;

  @CreateDateColumn()
  createdAt: Date;
}
