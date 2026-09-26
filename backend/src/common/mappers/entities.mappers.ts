export class BrandMapper {
  static toResponse(brand: any) {
    if (!brand) return null;
    return {
      id: brand.id,
      name: brand.name,
      subdomain: brand.subdomain,
      customDomain: brand.customDomain,
      logoUrl: brand.logoUrl,
      faviconUrl: brand.faviconUrl,
      primaryColor: brand.primaryColor,
      secondaryColor: brand.secondaryColor,
      themeSettings: brand.themeSettings,
      status: brand.status,
      createdAt: brand.createdAt,
    };
  }

  static toResponseList(brands: any[]) {
    return brands.map(b => this.toResponse(b));
  }
}

export class ProductMapper {
  static toResponse(product: any) {
    if (!product) return null;
    return {
      id: product.id,
      brandId: product.brandId,
      title: product.title,
      slug: product.slug,
      description: product.description,
      price: parseFloat(product.price as any),
      status: product.status,
      deliveryType: product.deliveryType,
      deliveryConfig: product.deliveryConfig,
      seoTitle: product.seoTitle,
      seoDescription: product.seoDescription,
      seoKeywords: product.seoKeywords,
      seoOgImage: product.seoOgImage,
      categories: product.categories || [],
      media: product.media || [],
      createdAt: product.createdAt,
    };
  }

  static toResponseList(products: any[]) {
    return products.map(p => this.toResponse(p));
  }
}

export class OrderMapper {
  static toResponse(order: any) {
    if (!order) return null;
    return {
      id: order.id,
      brandId: order.brandId,
      customerId: order.customerId,
      productId: order.productId,
      status: order.status,
      amountPaid: parseFloat(order.amountPaid as any),
      paymentProvider: order.paymentProvider,
      paymentId: order.paymentId,
      downloadToken: order.downloadToken,
      downloadLimit: order.downloadLimit,
      downloadCount: order.downloadCount,
      expiresAt: order.expiresAt,
      createdAt: order.createdAt,
      product: ProductMapper.toResponse(order.product),
      customer: order.customer ? {
        id: order.customer.id,
        email: order.customer.email,
        name: order.customer.name,
        status: order.customer.status,
      } : null,
      brand: order.brand ? {
        id: order.brand.id,
        name: order.brand.name,
      } : null,
    };
  }

  static toResponseList(orders: any[]) {
    return orders.map(o => this.toResponse(o));
  }
}
