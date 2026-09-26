import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { BrandQueryService } from './brand-query.service';
import { BrandCommandService } from './brand-command.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { RequirePermissions } from '../auth/permissions.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('brands')
@Controller('brands')
export class BrandController {
  constructor(
    private readonly brandQueryService: BrandQueryService,
    private readonly brandCommandService: BrandCommandService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequirePermissions('brand:create')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new brand' })
  create(@Body() createBrandDto: CreateBrandDto) {
    return this.brandCommandService.create(createBrandDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all brands' })
  findAll() {
    return this.brandQueryService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve brand by ID' })
  findOne(@Param('id') id: string) {
    return this.brandQueryService.findOne(id);
  }

  @Get('subdomain/:subdomain')
  @ApiOperation({ summary: 'Retrieve brand by subdomain' })
  findBySubdomain(@Param('subdomain') subdomain: string) {
    return this.brandQueryService.findBySubdomain(subdomain);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequirePermissions('brand:update')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update brand details' })
  update(@Param('id') id: string, @Body() updateBrandDto: UpdateBrandDto) {
    return this.brandCommandService.update(id, updateBrandDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequirePermissions('brand:delete')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a brand' })
  remove(@Param('id') id: string) {
    return this.brandCommandService.remove(id);
  }
}
