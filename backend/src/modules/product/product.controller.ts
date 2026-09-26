import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ProductQueryService } from './product-query.service';
import { ProductCommandService } from './product-command.service';
import { ProductSeoService } from './product-seo.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { RequirePermissions } from '../auth/permissions.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('products')
@Controller('products')
export class ProductController {
  constructor(
    private readonly productQueryService: ProductQueryService,
    private readonly productCommandService: ProductCommandService,
    private readonly productSeoService: ProductSeoService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequirePermissions('product:create')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new digital product' })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productCommandService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all products' })
  @ApiQuery({ name: 'brandId', required: false })
  findAll(@Query('brandId') brandId?: string) {
    return this.productQueryService.findAll(brandId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve product by ID' })
  findOne(@Param('id') id: string) {
    return this.productQueryService.findOne(id);
  }

  @Get('slug/:brandId/:slug')
  @ApiOperation({ summary: 'Retrieve product by brand and slug' })
  findBySlug(@Param('brandId') brandId: string, @Param('slug') slug: string) {
    return this.productQueryService.findBySlug(brandId, slug);
  }

  @Get(':id/seo')
  @ApiOperation({ summary: 'Retrieve product SEO metadata and JSON-LD schema' })
  getSeoMetadata(@Param('id') id: string) {
    return this.productSeoService.generateMetadata(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequirePermissions('product:update')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update product details' })
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productCommandService.update(id, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequirePermissions('product:delete')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a product' })
  remove(@Param('id') id: string) {
    return this.productCommandService.remove(id);
  }
}
