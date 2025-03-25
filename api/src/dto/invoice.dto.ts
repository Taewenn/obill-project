import { Type } from 'class-transformer';
import {
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateInvoiceDto {
  @IsString()
  fileName: string;

  @IsString()
  filePath: string;

  @IsNumber()
  amount: number;

  @Type(() => Date)
  @IsDate()
  date: Date;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsUUID()
  @IsOptional()
  departmentId?: string;
}

export class UpdateInvoiceDto {
  @IsString()
  @IsOptional()
  fileName?: string;

  @IsString()
  @IsOptional()
  filePath?: string;

  @IsNumber()
  @IsOptional()
  amount?: number;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  date?: Date;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsUUID()
  @IsOptional()
  departmentId?: string;
}
