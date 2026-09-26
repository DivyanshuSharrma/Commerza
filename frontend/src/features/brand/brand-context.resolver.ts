export interface BrandData {
  id: string;
  name: string;
  subdomain: string;
  customDomain: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  themeSettings: {
    heroTitle?: string;
    heroSubtitle?: string;
  } | null;
}

export async function getBrandContext(): Promise<BrandData> {
  const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api') + '/v1';

  try {
    // Fetch the single active brand settings (seeded subdomain is 'default')
    const res = await fetch(`${apiUrl}/brands/subdomain/default`, {
      next: { revalidate: 10 },
    });

    if (!res.ok) {
      throw new Error('Failed to fetch brand');
    }

    const body = await res.json();
    return body.data;
  } catch (err) {
    // Graceful fallback to default brand settings
    return {
      id: 'default',
      name: 'Commerza Digital Store',
      subdomain: 'default',
      customDomain: null,
      logoUrl: null,
      faviconUrl: null,
      primaryColor: '#4f46e5',
      secondaryColor: '#06b6d4',
      themeSettings: {
        heroTitle: 'Premium Digital Marketplace',
        heroSubtitle: 'Buy premium digital products instantly and securely.',
      },
    };
  }
}
