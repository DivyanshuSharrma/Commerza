import { BrandData } from '@/features/brand/brand-context.resolver';

interface FooterProps {
  brand: BrandData;
}

export function Footer({ brand }: FooterProps) {
  const supportEmail = `support@${brand.subdomain === 'default' ? 'commerza.com' : `${brand.subdomain}.com`}`;

  return (
    <footer className="bg-card border-t border-border mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-foreground/50">
        <div>
          &copy; {new Date().getFullYear()} {brand.name}. All rights reserved.
        </div>
        <div className="flex flex-wrap gap-4 sm:gap-6 justify-center">
          <span className="hover:text-foreground cursor-pointer transition-colors">Privacy Policy</span>
          <span className="hover:text-foreground cursor-pointer transition-colors">Terms of Service</span>
          <span className="hover:text-foreground cursor-pointer transition-colors">Refund Policy</span>
          <a href={`mailto:${supportEmail}`} className="hover:text-foreground transition-colors font-medium text-foreground/75">
            {supportEmail}
          </a>
        </div>
      </div>
    </footer>
  );
}
