export interface BrandThemeSettings {
  heroBadge?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  creatorBio?: string;
  creatorRole?: string;
  creatorLocation?: string;
  skills?: string[];
  stats?: Array<{ label: string; value: string }>;
  socialLinks?: {
    github?: string;
    twitter?: string;
    linkedin?: string;
    discord?: string;
    email?: string;
  };
  hireTitle?: string;
  hireSubtitle?: string;
  hireEmail?: string;
}

export interface BrandData {
  id: string;
  name: string;
  subdomain: string;
  customDomain: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  themeSettings: BrandThemeSettings | null;
}

export async function getBrandContext(): Promise<BrandData> {
  const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api') + '/v1';

  try {
    const res = await fetch(`${apiUrl}/brands/subdomain/default`, {
      next: { revalidate: 10 },
    });

    if (!res.ok) {
      throw new Error('Failed to fetch brand');
    }

    const body = await res.json();
    const data = body.data || body;
    return {
      ...data,
      themeSettings: {
        heroBadge: data.themeSettings?.heroBadge || '✦ INDEPENDENT DIGITAL ATELIER & ARTIFACTS',
        heroTitle: data.themeSettings?.heroTitle || 'Architecting Next-Gen Digital Goods & Codecraft',
        heroSubtitle:
          data.themeSettings?.heroSubtitle ||
          'Production-ready SaaS boilerplates, curated design systems, and developer kits crafted with obsessive precision.',
        creatorBio:
          data.themeSettings?.creatorBio ||
          "We build bespoke software foundations, developer tooling, and aesthetic UI kits for builders who refuse to compromise on quality and speed.",
        creatorRole: data.themeSettings?.creatorRole || 'Principal Systems Designer & Open Source Creator',
        creatorLocation: data.themeSettings?.creatorLocation || 'Global / Remote',
        skills: data.themeSettings?.skills || [
          'TypeScript',
          'Next.js 16',
          'NestJS',
          'Architecture',
          'Tailwind CSS',
          'Prisma',
          'Design Systems',
          'Clean APIs',
        ],
        stats: data.themeSettings?.stats || [
          { label: 'Verified Deliveries', value: '4,280+' },
          { label: 'Active Builders', value: '1,950+' },
          { label: 'Customer Rating', value: '4.98 / 5' },
          { label: 'Instant Fulfillment', value: '100%' },
        ],
        socialLinks: {
          github: data.themeSettings?.socialLinks?.github || 'https://github.com/divyanshubochiwal04/Commerza',
          twitter: data.themeSettings?.socialLinks?.twitter || 'https://twitter.com',
          email: data.themeSettings?.socialLinks?.email || 'studio@commerza.com',
        },
        hireTitle: data.themeSettings?.hireTitle || 'Commission Bespoke Architecture or Advisory',
        hireSubtitle:
          data.themeSettings?.hireSubtitle ||
          'Need custom adaptations, architectural reviews, or proprietary system designs? Let’s connect directly.',
        hireEmail: data.themeSettings?.hireEmail || 'hire@commerza.com',
      },
    };
  } catch (err) {
    return {
      id: 'default',
      name: 'Commerza Studio',
      subdomain: 'default',
      customDomain: null,
      logoUrl: null,
      faviconUrl: null,
      primaryColor: '#4f46e5',
      secondaryColor: '#06b6d4',
      themeSettings: {
        heroBadge: '✦ INDEPENDENT DIGITAL ATELIER & ARTIFACTS',
        heroTitle: 'Architecting Next-Gen Digital Goods & Codecraft',
        heroSubtitle:
          'Production-ready SaaS boilerplates, curated design systems, and developer kits crafted with obsessive precision.',
        creatorBio:
          "We build bespoke software foundations, developer tooling, and aesthetic UI kits for builders who refuse to compromise on quality and speed.",
        creatorRole: 'Principal Systems Designer & Open Source Creator',
        creatorLocation: 'Global / Remote',
        skills: ['TypeScript', 'Next.js 16', 'NestJS', 'Architecture', 'Tailwind CSS', 'Prisma'],
        stats: [
          { label: 'Verified Deliveries', value: '4,280+' },
          { label: 'Active Builders', value: '1,950+' },
          { label: 'Customer Rating', value: '4.98 / 5' },
          { label: 'Instant Fulfillment', value: '100%' },
        ],
        socialLinks: {
          github: 'https://github.com/divyanshubochiwal04/Commerza',
          twitter: 'https://twitter.com',
          email: 'studio@commerza.com',
        },
        hireTitle: 'Commission Bespoke Architecture or Advisory',
        hireSubtitle:
          'Need custom adaptations, architectural reviews, or proprietary system designs? Let’s connect directly.',
        hireEmail: 'hire@commerza.com',
      },
    };
  }
}
