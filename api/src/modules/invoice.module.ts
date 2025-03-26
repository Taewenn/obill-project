import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoiceController } from '../controllers/invoice.controller';
import { Category } from '../entities/category.entity';
import { Department } from '../entities/department.entity';
import { Invoice } from '../entities/invoice.entity';
import { InvoiceService } from '../services/invoice.service';
import { CategoryModule } from './category.module';
import { DepartmentModule } from './department.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invoice, Category, Department]),
    CategoryModule,
    DepartmentModule,
  ],
  controllers: [InvoiceController],
  providers: [InvoiceService],
  exports: [InvoiceService],
})
export class InvoiceModule {}
