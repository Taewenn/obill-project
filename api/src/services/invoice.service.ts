import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateInvoiceDto, UpdateInvoiceDto } from '../dto/invoice.dto';
import { Category } from '../entities/category.entity';
import { Department } from '../entities/department.entity';
import { Invoice } from '../entities/invoice.entity';

@Injectable()
export class InvoiceService {
  private readonly MISTRAL_API_URL = 'https://api.mistral.ai/v1';

  constructor(
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
  ) {}

  async create(
    createInvoiceDto: CreateInvoiceDto,
    file: Express.Multer.File,
  ): Promise<Invoice> {
    try {
      const extractedData = await this.processWithOCR(file);
      const invoice = this.invoiceRepository.create({
        ...createInvoiceDto,
        fileName: file.originalname,
        amount: extractedData.amount,
        date: extractedData.date,
        category: extractedData.category,
        department: extractedData.department,
      });
      return this.invoiceRepository.save(invoice);
    } catch (error) {
      console.error('OCR processing error:', error);
      throw new BadRequestException('Failed to process invoice with OCR');
    }
  }

  async findAll(): Promise<Invoice[]> {
    return this.invoiceRepository.find({
      relations: ['category', 'department'],
    });
  }

  async findOne(id: string): Promise<Invoice> {
    return this.invoiceRepository.findOne({
      where: { id },
      relations: ['category', 'department'],
    });
  }

  async update(
    id: string,
    updateInvoiceDto: UpdateInvoiceDto,
  ): Promise<Invoice> {
    const invoice = await this.findOne(id);
    Object.assign(invoice, updateInvoiceDto);
    return this.invoiceRepository.save(invoice);
  }

  async remove(id: string): Promise<void> {
    await this.invoiceRepository.delete(id);
  }

  private async processWithOCR(file: Express.Multer.File): Promise<any> {
    try {
      // Convert file to base64
      const base64File = file.buffer.toString('base64');

      // Call Mistral API for OCR
      const response = await fetch(`${this.MISTRAL_API_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'mistral-tiny',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Extract the following information from this invoice: amount, date, category, and department. Return the data in JSON format.',
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:${file.mimetype};base64,${base64File}`,
                  },
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Mistral API error: ${response.statusText}`);
      }

      const result = await response.json();
      const extractedData = JSON.parse(result.choices[0].message.content);

      return {
        amount: extractedData.amount || 0,
        date: new Date(extractedData.date) || new Date(),
        category: extractedData.category || null,
        department: extractedData.department || null,
      };
    } catch (error) {
      console.error('OCR processing error:', error);
      // Return mock data in case of error
      return {
        amount: 0,
        date: new Date(),
        category: null,
        department: null,
      };
    }
  }

  // Analytics methods
  async getTotalAmount(): Promise<number> {
    const result = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .select('SUM(invoice.amount)', 'total')
      .getRawOne();

    return result.total || 0;
  }

  async getAmountByCategory(): Promise<any[]> {
    return this.invoiceRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.category', 'category')
      .select('category.name', 'name')
      .addSelect('SUM(invoice.amount)', 'value')
      .groupBy('category.name')
      .getRawMany();
  }

  async getAmountByDepartment(): Promise<any[]> {
    return this.invoiceRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.department', 'department')
      .select('department.name', 'name')
      .addSelect('SUM(invoice.amount)', 'value')
      .groupBy('department.name')
      .getRawMany();
  }
}
