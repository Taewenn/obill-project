import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateInvoiceDto, UpdateInvoiceDto } from '../dto/invoice.dto';
import { InvoiceService } from '../services/invoice.service';

@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Body() createInvoiceDto: CreateInvoiceDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.invoiceService.create(createInvoiceDto, file);
  }

  @Get()
  findAll() {
    return this.invoiceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.invoiceService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInvoiceDto: UpdateInvoiceDto) {
    return this.invoiceService.update(id, updateInvoiceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.invoiceService.remove(id);
  }

  // Analytics endpoints
  @Get('stats/total')
  getTotalAmount() {
    return this.invoiceService.getTotalAmount();
  }

  @Get('stats/by-category')
  getAmountByCategory() {
    return this.invoiceService.getAmountByCategory();
  }

  @Get('stats/by-department')
  getAmountByDepartment() {
    return this.invoiceService.getAmountByDepartment();
  }
}
