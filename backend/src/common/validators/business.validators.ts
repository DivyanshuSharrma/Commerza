import { ValidationException } from '../exceptions/custom.exceptions';

export class SlugValidator {
  static validate(slug: string): void {
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slug || !slugRegex.test(slug)) {
      throw new ValidationException(`Invalid slug format: '${slug}'. Slug must contain only lowercase letters, numbers, and single hyphens.`);
    }
  }
}

export class PricingValidator {
  static validate(price: number): void {
    if (price === undefined || price === null || isNaN(price) || price < 0) {
      throw new ValidationException(`Invalid price: '${price}'. Price must be a positive number.`);
    }
  }
}

export class SeoValidator {
  static validate(title?: string, description?: string): void {
    if (title && title.length > 70) {
      throw new ValidationException('SEO meta title should not exceed 70 characters.');
    }
    if (description && description.length > 160) {
      throw new ValidationException('SEO meta description should not exceed 160 characters.');
    }
  }
}
