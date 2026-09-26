import { Injectable, HttpStatus } from '@nestjs/common';
import { CategoryRepository } from '../../database/repositories/category.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { BusinessException } from '../../common/exceptions/custom.exceptions';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepo: CategoryRepository) {}

  async findAll(brandId?: string) {
    return this.categoryRepo.findMany(brandId);
  }

  async findOne(id: string) {
    const cat = await this.categoryRepo.findById(id);
    if (!cat) {
      throw new BusinessException('Category not found', HttpStatus.NOT_FOUND);
    }
    return cat;
  }

  async create(dto: CreateCategoryDto) {
    const slug = dto.slug || dto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const existing = await this.categoryRepo.findBySlug(dto.brandId, slug);
    if (existing) {
      throw new BusinessException('Category with this slug already exists for this brand', HttpStatus.CONFLICT);
    }
    return this.categoryRepo.create({
      brandId: dto.brandId,
      name: dto.name,
      slug,
      description: dto.description,
    });
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.findOne(id);
    return this.categoryRepo.update(id, dto);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.categoryRepo.delete(id);
    return { success: true, message: 'Category removed successfully' };
  }
}
