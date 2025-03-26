import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from './category.entity';
import { Department } from './department.entity';

export interface LineItem {
  description?: string;
  quantity?: number;
  unitPrice?: number;
  total?: number;
  tax?: number;
  [key: string]: any; // Allow for additional fields
}

export interface OcrData {
  amount: number;
  date: Date;
  description: string;
  category?: string;
  department?: string;
  vendor?: string;
  invoiceNumber?: string;
  currency?: string;
  lineItems?: LineItem[];
  rawContent?: string;
}

@Entity()
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fileName: string;

  @Column()
  filePath: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'date' })
  date: Date;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  vendor: string;

  @Column({ nullable: true })
  invoiceNumber: string;

  @Column({ nullable: true })
  currency: string;

  @Column({ type: 'jsonb', nullable: true })
  ocrData: OcrData;

  @ManyToOne(() => Category, (category) => category.invoices)
  category: Category;

  @ManyToOne(() => Department, (department) => department.invoices)
  department: Department;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
