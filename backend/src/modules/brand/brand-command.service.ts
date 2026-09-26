import { Injectable } from '@nestjs/common';
import { BrandRepository } from '../../database/repositories/brand.repository';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { BrandQueryService } from './brand-query.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BrandCreatedEvent, BrandUpdatedEvent } from '../../common/events/domain.events';

@Injectable()
export class BrandCommandService {
  constructor(
    private readonly brandRepo: BrandRepository,
    private readonly brandQuery: BrandQueryService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(createBrandDto: CreateBrandDto) {
    const brand = await this.brandRepo.create({
      name: createBrandDto.name,
      subdomain: createBrandDto.subdomain.toLowerCase(),
      customDomain: createBrandDto.customDomain?.toLowerCase(),
      logoUrl: createBrandDto.logoUrl,
      faviconUrl: createBrandDto.faviconUrl,
      primaryColor: createBrandDto.primaryColor || '#4f46e5',
      secondaryColor: createBrandDto.secondaryColor || '#06b6d4',
      themeSettings: createBrandDto.themeSettings || {},
    });

    this.eventEmitter.emit('brand.created', new BrandCreatedEvent(brand.id, brand.name));
    return brand;
  }

  async update(id: string, updateBrandDto: UpdateBrandDto) {
    await this.brandQuery.findOne(id); // ensure it exists
    const brand = await this.brandRepo.update(id, {
      name: updateBrandDto.name,
      subdomain: updateBrandDto.subdomain?.toLowerCase(),
      customDomain: updateBrandDto.customDomain?.toLowerCase(),
      logoUrl: updateBrandDto.logoUrl,
      faviconUrl: updateBrandDto.faviconUrl,
      primaryColor: updateBrandDto.primaryColor,
      secondaryColor: updateBrandDto.secondaryColor,
      themeSettings: updateBrandDto.themeSettings,
      status: updateBrandDto.status,
    });

    this.eventEmitter.emit('brand.updated', new BrandUpdatedEvent(brand.id, brand.name));
    return brand;
  }

  async remove(id: string) {
    await this.brandQuery.findOne(id);
    return this.brandRepo.delete(id);
  }
}
