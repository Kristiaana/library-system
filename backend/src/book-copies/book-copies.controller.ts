import { Controller, Get, Post, Body, Delete, Param } from '@nestjs/common';
import { CreateBookCopyDto } from './dto/create-book-copy.dto';
import { BookCopiesService } from './book-copies.service';

@Controller('book-copies')
export class BookCopiesController {
  constructor(private readonly bookCopiesService: BookCopiesService) {}

  @Post()
  create(@Body() dto: CreateBookCopyDto) {
    return this.bookCopiesService.create(dto);
  }

  @Get()
  findAll() {
    return this.bookCopiesService.findAll();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bookCopiesService.remove(+id);
  }
}
