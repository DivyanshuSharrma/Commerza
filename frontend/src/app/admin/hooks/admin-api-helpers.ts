'use client';

export const DEFAULT_BRAND_ID = '3661cbb4-2684-40b0-97d3-ce5fa3d10862';

export const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export async function parseError(res: Response, fallback: string): Promise<string> {
  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('commerza_admin_token');
    }
    return 'Admin session expired or unauthorized. Please sign in again.';
  }
  try {
    const data = await res.json().catch(() => null);
    if (data?.error?.details) {
      if (Array.isArray(data.error.details)) return data.error.details.join(', ');
      if (typeof data.error.details === 'string') return data.error.details;
    }
    if (data?.error?.message) return data.error.message;
    if (data?.message) {
      return Array.isArray(data.message) ? data.message.join(', ') : data.message;
    }
  } catch {}
  return fallback;
}

export function sanitizeBrandPayload(brandForm: any) {
  const skillsArray = brandForm.skills
    ? brandForm.skills.split(',').map((s: string) => s.trim()).filter(Boolean)
    : [];

  const cleanName = brandForm.name?.trim() || 'Commerza Store';
  const primary = HEX_COLOR_REGEX.test(brandForm.primaryColor?.trim() || '')
    ? brandForm.primaryColor.trim()
    : '#4f46e5';
  const secondary = HEX_COLOR_REGEX.test(brandForm.secondaryColor?.trim() || '')
    ? brandForm.secondaryColor.trim()
    : '#06b6d4';

  return {
    name: cleanName,
    logoUrl: brandForm.logoUrl?.trim() || null,
    faviconUrl: brandForm.faviconUrl?.trim() || null,
    primaryColor: primary,
    secondaryColor: secondary,
    themeSettings: {
      heroBadge: brandForm.heroBadge || '',
      heroTitle: brandForm.heroTitle?.trim() || 'Welcome to Commerza',
      heroSubtitle: brandForm.heroSubtitle || '',
      creatorBio: brandForm.creatorBio || '',
      creatorRole: brandForm.creatorRole || '',
      creatorLocation: brandForm.creatorLocation || '',
      skills: skillsArray,
      hireEmail: brandForm.hireEmail || '',
    },
  };
}

export function buildQueryString(params: Record<string, string | number | undefined>): string {
  const q = new URLSearchParams();
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== null && val !== 'ALL' && String(val).trim() !== '') {
      q.set(key, String(val));
    }
  }
  const str = q.toString();
  return str ? `?${str}` : '';
}
