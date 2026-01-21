import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { CreateReaderDto } from './dto/create-reader.dto';
import { UpdateReaderDto } from './dto/update-reader.dto';
import { Reader } from './entities/reader.entity';
import { Loan } from 'src/loans/entities/loan.entity';

@Injectable()
export class ReadersService {
  constructor(
    @InjectRepository(Reader)
    private readonly repo: Repository<Reader>,

    @InjectRepository(Loan)
    private readonly loanRepo: Repository<Loan>,
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
    if (!reader) throw new NotFoundException('Lasītājs netika atrasts');
    return reader;
  }

  async update(id: number, dto: UpdateReaderDto) {
    const reader = await this.findOne(id);

    if (dto.active === false && reader.active !== false) {
      const activeLoan = await this.loanRepo.findOne({
        where: { reader: { id }, returnDate: IsNull() },
        select: { id: true },
      });

      if (activeLoan) {
        throw new BadRequestException(
          'Nevar deaktivizēt lasītāju, kamēr viņam ir aktīvs aizdevums. Vispirms atgrieziet grāmatu.',
        );
      }
    }

    Object.assign(reader, dto);
    return this.repo.save(reader);
  }

  async remove(id: number) {
    const reader = await this.findOne(id);

    const activeLoan = await this.loanRepo.findOne({
      where: { reader: { id }, returnDate: IsNull() },
      select: { id: true },
    });

    if (activeLoan) {
      throw new BadRequestException(
        'Nevar dzēst lasītāju, kamēr viņam ir aktīvs aizdevums.',
      );
    }

    await this.repo.remove(reader);
    return { deleted: true };
  }
}
