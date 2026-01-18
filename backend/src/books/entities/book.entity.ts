import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class Book {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  title: string;

  @Column({ length: 120 })
  author: string;

  @Column({ length: 60, nullable: true })
  genre?: string;

  @Column({ unique: true, length: 20, nullable: true })
  isbn?: string;

  @CreateDateColumn()
  createdAt: Date;
}
