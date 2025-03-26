import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { Category } from './entities/category.entity';
import { Department } from './entities/department.entity';
import { Invoice } from './entities/invoice.entity';
import { CategoryModule } from './modules/category.module';
import { DepartmentModule } from './modules/department.module';
import { InvoiceModule } from './modules/invoice.module';

// Ensure uploads directory exists
const uploadDir = './uploads';
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}-${file.originalname}`);
        },
      }),
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [Invoice, Category, Department],
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    InvoiceModule,
    CategoryModule,
    DepartmentModule,
  ],
})
export class AppModule {}
