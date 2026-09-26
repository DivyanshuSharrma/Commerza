import { Injectable, HttpStatus } from '@nestjs/common';
import { BrandRepository } from '../../database/repositories/brand.repository';
import { BusinessException } from '../../common/exceptions/custom.exceptions';

@Injectable()
export class BrandQueryService {
  constructor(private readonly brandRepo: BrandRepository) {}

  async findAll() {
    return this.brandRepo.findMany();
  }

  async findOne(id: string) {
    const brand = await this.brandRepo.findById(id);
    if (!brand) throw new BusinessException(`Brand with ID '${id}' not found`, HttpStatus.NOT_FOUND);
    return brand;
  }

  async findBySubdomain(subdomain: string) {
    const brand = await this.brandRepo.findBySubdomain(subdomain);
    if (!brand) throw new BusinessException(`Brand with subdomain '${subdomain}' not found`, HttpStatus.NOT_FOUND);
    return brand;
  }
}
