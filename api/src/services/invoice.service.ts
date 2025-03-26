import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as FormData from 'form-data';
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

  async processInvoice(file: Express.Multer.File) {
    try {
      if (!file) {
        throw new BadRequestException('No file uploaded');
      }

      // Generate unique filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const filename = `${uniqueSuffix}-${file.originalname}`;
      const filePath = `uploads/${filename}`;

      const extractedData = await this.processWithOCR(file);

      // Create a basic invoice with the extracted data
      const invoice = this.invoiceRepository.create({
        fileName: file.originalname,
        filePath: filePath,
        amount: extractedData.amount,
        date: extractedData.date,
        description: extractedData.description || '',
        vendor: extractedData.vendor || '',
        invoiceNumber: extractedData.invoiceNumber || '',
        currency: extractedData.currency || '',
        ocrData: extractedData, // Store the full OCR data
      });

      // If category is extracted, try to find or create it
      if (extractedData.category) {
        let category = await this.categoryRepository.findOne({
          where: { name: extractedData.category },
        });

        if (!category) {
          category = this.categoryRepository.create({
            name: extractedData.category,
          });
          await this.categoryRepository.save(category);
        }

        invoice.category = category;
      }

      // If department is extracted, try to find or create it
      if (extractedData.department) {
        let department = await this.departmentRepository.findOne({
          where: { name: extractedData.department },
        });

        if (!department) {
          department = this.departmentRepository.create({
            name: extractedData.department,
          });
          await this.departmentRepository.save(department);
        }

        invoice.department = department;
      }

      const savedInvoice = await this.invoiceRepository.save(invoice);

      return {
        success: true,
        message: 'Invoice processed successfully',
        data: extractedData,
        invoice: {
          id: savedInvoice.id,
          fileName: savedInvoice.fileName,
          filePath: savedInvoice.filePath,
          amount: savedInvoice.amount,
          date: savedInvoice.date,
          vendor: savedInvoice.vendor,
          invoiceNumber: savedInvoice.invoiceNumber,
          currency: savedInvoice.currency,
          category: savedInvoice.category?.name,
          department: savedInvoice.department?.name,
          lineItems: extractedData.lineItems || [],
        },
      };
    } catch (error) {
      console.error('Error processing invoice:', error);
      throw new BadRequestException(
        `Failed to process invoice: ${error.message}`,
      );
    }
  }

  async testOcr(file: Express.Multer.File) {
    try {
      if (!file) {
        throw new BadRequestException('No file uploaded');
      }

      const extractedData = await this.processWithOCR(file);

      return {
        success: true,
        message: 'OCR processed successfully',
        rawData: extractedData,
        parsed: {
          amount: extractedData.amount,
          date: extractedData.date,
          category: extractedData.category,
          department: extractedData.department,
          description: extractedData.description,
          vendor: extractedData.vendor,
          invoiceNumber: extractedData.invoiceNumber,
          currency: extractedData.currency,
          lineItems: extractedData.lineItems || [],
        },
      };
    } catch (error) {
      console.error('Error testing OCR:', error);
      throw new BadRequestException(`Failed to process OCR: ${error.message}`);
    }
  }

  async create(
    createInvoiceDto: CreateInvoiceDto,
    file?: Express.Multer.File,
  ): Promise<Invoice> {
    try {
      // If a file is provided, process it with OCR
      if (file) {
        const extractedData = await this.processWithOCR(file);

        // Merge extracted data with provided DTO
        const mergedDto = {
          ...createInvoiceDto,
          fileName: createInvoiceDto.fileName || file.originalname,
          filePath: createInvoiceDto.filePath || `uploads/${file.originalname}`,
          amount: createInvoiceDto.amount || extractedData.amount,
          date: createInvoiceDto.date || extractedData.date,
          description:
            createInvoiceDto.description || extractedData.description || '',
          vendor: createInvoiceDto.vendor || extractedData.vendor || '',
          invoiceNumber:
            createInvoiceDto.invoiceNumber || extractedData.invoiceNumber || '',
          currency: createInvoiceDto.currency || extractedData.currency || '',
          lineItems:
            createInvoiceDto.lineItems || extractedData.lineItems || [],
        };

        const invoice = this.invoiceRepository.create(mergedDto);

        // Store the full OCR data
        invoice.ocrData = extractedData;

        // Handle category
        if (extractedData.category && !createInvoiceDto.categoryId) {
          let category = await this.categoryRepository.findOne({
            where: { name: extractedData.category },
          });

          if (!category) {
            category = this.categoryRepository.create({
              name: extractedData.category,
            });
            await this.categoryRepository.save(category);
          }

          invoice.category = category;
        } else if (createInvoiceDto.categoryId) {
          invoice.category = { id: createInvoiceDto.categoryId } as Category;
        }

        // Handle department
        if (extractedData.department && !createInvoiceDto.departmentId) {
          let department = await this.departmentRepository.findOne({
            where: { name: extractedData.department },
          });

          if (!department) {
            department = this.departmentRepository.create({
              name: extractedData.department,
            });
            await this.departmentRepository.save(department);
          }

          invoice.department = department;
        } else if (createInvoiceDto.departmentId) {
          invoice.department = {
            id: createInvoiceDto.departmentId,
          } as Department;
        }

        return this.invoiceRepository.save(invoice);
      } else {
        // Standard creation without OCR
        const invoice = this.invoiceRepository.create(createInvoiceDto);

        if (createInvoiceDto.categoryId) {
          invoice.category = { id: createInvoiceDto.categoryId } as Category;
        }

        if (createInvoiceDto.departmentId) {
          invoice.department = {
            id: createInvoiceDto.departmentId,
          } as Department;
        }

        return this.invoiceRepository.save(invoice);
      }
    } catch (error) {
      console.error('Invoice creation error:', error);
      throw new BadRequestException(
        `Failed to create invoice: ${error.message}`,
      );
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
      console.log(
        `Processing file: ${file.originalname}, size: ${file.size}, mimetype: ${file.mimetype}`,
      );

      // Setup request body based on file type
      let requestBody;

      if (file.mimetype === 'application/pdf') {
        // For PDFs, use the document_url type with base64 encoding
        requestBody = {
          model: 'mistral-ocr-latest',
          document: {
            type: 'document_url',
            document_url: `data:${file.mimetype};base64,${base64File}`,
            document_name: file.originalname,
          },
        };
      } else if (file.mimetype.startsWith('image/')) {
        // For images, use the image_url type with base64 encoding
        requestBody = {
          model: 'mistral-ocr-latest',
          document: {
            type: 'image_url',
            image_url: `data:${file.mimetype};base64,${base64File}`,
          },
        };
      } else {
        throw new Error(`Unsupported file type: ${file.mimetype}`);
      }

      // Call Mistral OCR API directly - no need for file upload
      const response = await fetch(`${this.MISTRAL_API_URL}/ocr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Mistral OCR API Error:', errorText);
        throw new Error(
          `Mistral OCR API error: ${response.status} - ${response.statusText}`,
        );
      }

      const result = await response.json();
      console.log('Mistral OCR API response structure:', Object.keys(result));

      // Process the OCR result and extract invoice details from the markdown content
      const extractedData = this.extractInvoiceDataFromOCR(result);
      return extractedData;
    } catch (error) {
      console.error('OCR processing error:', error);
      // Return mock data in case of error
      return {
        amount: 0,
        date: new Date(),
        category: null,
        department: null,
        description: `Error processing: ${error.message}`,
      };
    }
  }

  private async uploadFileToMistral(file: Express.Multer.File): Promise<any> {
    // This method is now deprecated as we're using base64 encoding directly
    // Keeping it for backward compatibility if needed
    try {
      const formData = new FormData();

      formData.append('purpose', 'ocr');
      formData.append('file', file.buffer, file.originalname);

      const response = await fetch(`${this.MISTRAL_API_URL}/files`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
          ...formData.getHeaders(),
        },
        body: formData as any,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('File upload error:', errorText);
        throw new Error(
          `Failed to upload file: ${response.status} - ${response.statusText}`,
        );
      }

      const uploadResult = await response.json();
      console.log('File uploaded successfully:', uploadResult);

      // Vérification que le fichier a bien été créé
      if (!uploadResult.id) {
        throw new Error('File upload returned invalid response (missing ID)');
      }

      try {
        // Vérifier que le fichier existe en appelant l'API de récupération de fichier
        const verifyResponse = await fetch(
          `${this.MISTRAL_API_URL}/files/${uploadResult.id}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
            },
          },
        );

        if (!verifyResponse.ok) {
          throw new Error(
            `File verification failed: ${verifyResponse.status} - ${verifyResponse.statusText}`,
          );
        }

        const fileInfo = await verifyResponse.json();
        console.log('File verification successful:', fileInfo);
      } catch (verifyError) {
        console.error('File verification error:', verifyError);
        // On continue malgré l'erreur de vérification
      }

      return uploadResult;
    } catch (error) {
      console.error('Error uploading file to Mistral:', error);
      throw error;
    }
  }

  private extractInvoiceDataFromOCR(ocrResult: any): any {
    try {
      if (!ocrResult.pages || ocrResult.pages.length === 0) {
        throw new Error('No pages in OCR result');
      }

      // Get the markdown content from all pages
      const allMarkdown = ocrResult.pages
        .map((page) => page.markdown || '')
        .join('\n');
      console.log(
        'OCR Markdown content excerpt:',
        allMarkdown.substring(0, 500),
      );

      // Initialize the data structure
      const extractedData = {
        amount: 0,
        date: new Date(),
        category: null,
        department: null,
        description: '',
        vendor: null,
        invoiceNumber: null,
        currency: null,
        lineItems: [],
        rawContent: allMarkdown,
      };

      // Extract vendor information - typically at the top of the invoice
      const vendorRegex =
        /([A-Z][a-zA-Z0-9 ,\.\-&]+(?:Inc\.|LLC|Ltd\.?|Corp\.?|Corporation|Company|GmbH|BV|SRL|S\.A\.))/;
      const vendorMatch = allMarkdown.match(vendorRegex);
      if (vendorMatch) {
        extractedData.vendor = vendorMatch[1].trim();
      }

      // Extract invoice number
      const invoiceNumberRegex =
        /(?:invoice|inv)(?:\.|\s+)(?:no|num|number|#)(?:\.|\s*:|\s+)([A-Za-z0-9\-]+)/i;
      const invoiceNumberMatch = allMarkdown.match(invoiceNumberRegex);
      if (invoiceNumberMatch) {
        extractedData.invoiceNumber = invoiceNumberMatch[1].trim();
      }

      // Extract currency
      const currencyRegex =
        /(?:currency|curr)(?:\.|\s*:|\s+)(USD|EUR|GBP|JPY|CHF|CAD|AUD|NZD)/i;
      const currencyMatch = allMarkdown.match(currencyRegex);
      if (currencyMatch) {
        extractedData.currency = currencyMatch[1].trim();
      }

      // Extract amount - look for currency patterns and total fields in tables
      const amountRegex = /\$([\d,]+\.\d{2}|[\d,]+)/i;
      const eurRegex = /([\d,]+\.\d{2}|[\d,]+)(?:\s*)€/i;
      const generalAmountRegex =
        /(?:[\d,]+\.\d{2}|[\d,]+)(?:\s*)(USD|EUR|GBP|JPY|CHF|CAD|AUD|NZD)/i;
      const amountWithLabelRegex =
        /(?:amount|total|sub\s*total|price|sum|value|invoice\s*total)(?:\s*:\s*|\s+)([\d,]+\.\d{2}|[\d,]+)/i;
      const tableRowTotalRegex =
        /(?:total|amount)(?:\s*)\|(?:\s*)([\d,]+\.\d{2}|[\d,]+)/i;

      const amountMatch =
        allMarkdown.match(amountWithLabelRegex) ||
        allMarkdown.match(tableRowTotalRegex) ||
        allMarkdown.match(amountRegex) ||
        allMarkdown.match(eurRegex) ||
        allMarkdown.match(generalAmountRegex);

      if (amountMatch) {
        if (amountMatch[1]) {
          extractedData.amount = parseFloat(amountMatch[1].replace(/,/g, ''));
        } else if (amountRegex.test(amountMatch[0])) {
          const numericValue = amountMatch[0].replace(/[^\d.,]/g, '');
          extractedData.amount = parseFloat(numericValue.replace(/,/g, ''));
        }
      }

      // Extract date - look for common date formats with priority given to invoice date
      const dateRegex =
        /(\d{1,2}[-\/\.]\d{1,2}[-\/\.]\d{2,4}|\d{4}[-\/\.]\d{1,2}[-\/\.]\d{1,2})/;
      const invoiceDateRegex =
        /(?:invoice\s*date)(?:\s*:\s*|\s+)(\d{1,2}[-\/\.]\d{1,2}[-\/\.]\d{2,4}|\d{4}[-\/\.]\d{1,2}[-\/\.]\d{1,2})/i;
      const genericDateRegex =
        /(?:date|issued|due\s*date)(?:\s*:\s*|\s+)(\d{1,2}[-\/\.]\d{1,2}[-\/\.]\d{2,4}|\d{4}[-\/\.]\d{1,2}[-\/\.]\d{1,2})/i;

      const dateMatch =
        allMarkdown.match(invoiceDateRegex) ||
        allMarkdown.match(genericDateRegex) ||
        allMarkdown.match(dateRegex);

      if (dateMatch) {
        // Try parsing the date directly
        const dateStr = dateMatch[1].trim();
        const parsedDate = new Date(dateStr);

        // If direct parsing doesn't work, try reformatting
        if (isNaN(parsedDate.getTime())) {
          // Try different formats based on the separators
          let separator = '/';
          if (dateStr.includes('-')) {
            separator = '-';
          } else if (dateStr.includes('.')) {
            separator = '.';
          }

          const parts = dateStr.split(separator);
          if (parts.length === 3) {
            // Determine if year is first or last
            let year, month, day;

            if (parts[0].length === 4) {
              // Year is first (YYYY-MM-DD)
              year = parts[0];
              month = parts[1];
              day = parts[2];
            } else {
              // Year is last (DD-MM-YYYY or MM-DD-YYYY)
              day = parts[0];
              month = parts[1];
              year = parts[2];

              // Handle 2-digit years
              if (year.length === 2) {
                year = '20' + year; // Assume 20xx for two-digit years
              }
            }

            // Create standardized date string
            const standardDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            extractedData.date = new Date(standardDate);
          }
        } else {
          extractedData.date = parsedDate;
        }
      }

      // Extract department - look for common department names or codes
      const departmentRegex =
        /(?:department|dept|division|business\s*unit)(?:\s*:\s*|\s+)([a-zA-Z0-9 &\-]+)/i;
      const departmentCodeRegex =
        /dept(?:\.|\s*)(?:code|id|no)(?:\s*:\s*|\s+)([a-zA-Z0-9\-]+)/i;

      const departmentMatch =
        allMarkdown.match(departmentRegex) ||
        allMarkdown.match(departmentCodeRegex);

      if (departmentMatch) {
        extractedData.department = departmentMatch[1].trim();
      }

      // Extract category - look for common category indicators
      const categoryRegex =
        /(?:category|type|class|classification|expense\s*type)(?:\s*:\s*|\s+)([a-zA-Z0-9 &\-]+)/i;
      const categoryMatch = allMarkdown.match(categoryRegex);

      if (categoryMatch) {
        extractedData.category = categoryMatch[1].trim();
      }

      // Extract table data for line items if a table is present
      // Look for markdown tables
      const tableRegex =
        /\|(.+)\|[\r\n]+\|([\s-:]+\|)+[\r\n]+([\s\S]+?)(?:\n\n|\n$|$)/g;
      let tableMatch;

      while ((tableMatch = tableRegex.exec(allMarkdown)) !== null) {
        try {
          // Get the table headers and normalize them
          const headers = tableMatch[1]
            .trim()
            .split('|')
            .map((h) => h.trim().toLowerCase());

          // Get all table rows
          const tableContent = tableMatch[3];
          const rows = tableContent.trim().split('\n');

          // Parse each row
          rows.forEach((row) => {
            const cells = row
              .split('|')
              .filter((cell) => cell.trim().length > 0);
            if (cells.length >= 2) {
              // At least 2 cells to be considered valid
              // Create a line item object
              const lineItem: any = {};

              // Map cells to headers
              cells.forEach((cell, index) => {
                if (index < headers.length) {
                  const header = headers[index];
                  const value = cell.trim();

                  // Map common header names to standardized properties
                  if (/description|item|service|product/.test(header)) {
                    lineItem.description = value;
                  } else if (/price|rate|unit price/.test(header)) {
                    lineItem.unitPrice =
                      parseFloat(
                        value.replace(/[^\d.,]/g, '').replace(/,/g, ''),
                      ) || 0;
                  } else if (/quantity|qty|amount/.test(header)) {
                    lineItem.quantity =
                      parseFloat(
                        value.replace(/[^\d.,]/g, '').replace(/,/g, ''),
                      ) || 0;
                  } else if (/total|subtotal|sum/.test(header)) {
                    lineItem.total =
                      parseFloat(
                        value.replace(/[^\d.,]/g, '').replace(/,/g, ''),
                      ) || 0;
                  } else if (/tax|vat/.test(header)) {
                    lineItem.tax =
                      parseFloat(
                        value.replace(/[^\d.,]/g, '').replace(/,/g, ''),
                      ) || 0;
                  } else {
                    // Store other values with their header name
                    lineItem[header] = value;
                  }
                }
              });

              // Only add non-empty line items
              if (Object.keys(lineItem).length > 0) {
                extractedData.lineItems.push(lineItem);
              }
            }
          });
        } catch (tableError) {
          console.error('Error parsing table data:', tableError);
        }
      }

      // Extract description - look for specific description field or use first table row description
      const descriptionRegex =
        /(?:description|details|item|service|invoice\s*for)(?:\s*:\s*|\s+)([^\n]+)/i;
      const descriptionMatch = allMarkdown.match(descriptionRegex);

      if (descriptionMatch) {
        extractedData.description = descriptionMatch[1].trim();
      } else if (
        extractedData.lineItems.length > 0 &&
        extractedData.lineItems[0].description
      ) {
        // Use the first line item description as a fallback
        extractedData.description = extractedData.lineItems[0].description;
      } else {
        // Use first non-empty line as description
        const firstLine = allMarkdown
          .split('\n')
          .find((line) => line.trim().length > 0);
        if (firstLine) {
          extractedData.description = firstLine.trim();
        }
      }

      console.log('Extracted data:', extractedData);
      return extractedData;
    } catch (error) {
      console.error('Error extracting data from OCR result:', error);
      return {
        amount: 0,
        date: new Date(),
        category: null,
        department: null,
        description: `Error extracting data: ${error.message}`,
        vendor: null,
        invoiceNumber: null,
        currency: null,
        lineItems: [],
        rawContent: ocrResult.pages?.[0]?.markdown || '',
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

  async getOcrData(id: string): Promise<any> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id },
      relations: ['category', 'department'],
    });

    if (!invoice) {
      throw new BadRequestException(`Invoice with id ${id} not found`);
    }

    return {
      invoice: {
        id: invoice.id,
        fileName: invoice.fileName,
        filePath: invoice.filePath,
        amount: invoice.amount,
        date: invoice.date,
        description: invoice.description,
        category: invoice.category?.name,
        department: invoice.department?.name,
      },
      ocrData: invoice.ocrData,
    };
  }
}
