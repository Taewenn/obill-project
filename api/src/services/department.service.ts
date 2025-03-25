import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateDepartmentDto } from '../dto/department.dto';
import { Department } from '../entities/department.entity';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
  ) {}

  async findAll(): Promise<Department[]> {
    return this.departmentRepository.find();
  }

  async findOne(id: string): Promise<Department> {
    return this.departmentRepository.findOne({ where: { id } });
  }

  async create(name: string): Promise<Department> {
    const department = this.departmentRepository.create({ name });
    return this.departmentRepository.save(department);
  }

  async remove(id: string): Promise<void> {
    await this.departmentRepository.delete(id);
  }

  async update(
    id: string,
    updateDepartmentDto: UpdateDepartmentDto,
  ): Promise<Department> {
    await this.departmentRepository.update(id, updateDepartmentDto);
    return this.findOne(id);
  }
}
