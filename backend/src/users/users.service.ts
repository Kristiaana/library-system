import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';

type CreateUserInput = {
  email: string;
  passwordHash: string;
  role?: UserRole;
  active?: boolean;
};

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  findById(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  async create(input: CreateUserInput) {
    const exists = await this.findByEmail(input.email);
    if (exists) {
      throw new BadRequestException('Lietotājs ar šādu e-pastu jau eksistē');
    }

    const user = this.repo.create({
      email: input.email,
      passwordHash: input.passwordHash,
      role: input.role ?? 'LIBRARIAN',
      active: input.active ?? true,
    });

    return this.repo.save(user);
  }
}
