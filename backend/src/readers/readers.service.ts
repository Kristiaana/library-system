import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateReaderDto } from './dto/create-reader.dto';
import { UpdateReaderDto } from './dto/update-reader.dto';
import { Reader } from './entities/reader.entity';

@Injectable()
export class ReadersService {
  constructor(
    @InjectRepository(Reader)
    private readonly repo: Repository<Reader>,
  ) {}

  create(dto: CreateReaderDto) {
    const reader = this.repo.create({ ...dto, active: dto.active ?? true });
    return this.repo.save(reader);
  }

  findAll() {
    return this.repo.find({ order: { id: 'DESC' } });
  }

  async findOne(id: number) {
    const reader = await this.repo.findOne({ where: { id } });
    if (!reader) throw new NotFoundException('Reader not found');
    return reader;
  }

  async update(id: number, dto: UpdateReaderDto) {
    const reader = await this.findOne(id);
    Object.assign(reader, dto);
    return this.repo.save(reader);
  }

  async remove(id: number) {
    const reader = await this.findOne(id);
    await this.repo.remove(reader);
    return { deleted: true };
  }
}
