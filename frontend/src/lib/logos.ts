import type { Provider, Tech } from '@/types/graph';
import { getTechEntry, getTechIconColor, getTechLabel as _getTechLabel } from '@/lib/techCatalog';

type LogoEntry = {
  icon: string;      // Iconify icon name (e.g. "simple-icons:postgresql")
  color: string;     // Brand hex color (with #)
  label: string;     // Human-readable label
};

export const PROVIDER_LOGOS: Record<Provider, LogoEntry> = {
  aws:        { icon: 'simple-icons:amazonwebservices', color: '#FF9900', label: 'AWS' },
  gcp:        { icon: 'simple-icons:googlecloud',       color: '#4285F4', label: 'Google Cloud' },
  azure:      { icon: 'simple-icons:microsoftazure',    color: '#0078D4', label: 'Azure' },
  supabase:   { icon: 'simple-icons:supabase',          color: '#3FCF8E', label: 'Supabase' },
  vercel:     { icon: 'simple-icons:vercel',            color: '#ffffff', label: 'Vercel' },
  cloudflare: { icon: 'simple-icons:cloudflare',        color: '#F38020', label: 'Cloudflare' },
};

// Dark-mode overrides for provider icons
const DARK_COLOR_OVERRIDES: Partial<Record<string, string>> = {
  'simple-icons:apachekafka': '#ffffff',
  'simple-icons:kong':        '#4BA0C6',
  'simple-icons:rust':        '#F74C00',
};

export function getIconColor(entry: LogoEntry, darkMode = true): string {
  if (darkMode && DARK_COLOR_OVERRIDES[entry.icon]) {
    return DARK_COLOR_OVERRIDES[entry.icon]!;
  }
  return entry.color;
}

export function getProviderLabel(provider: Provider): string {
  return PROVIDER_LOGOS[provider].label;
}

// Re-export from catalog so existing imports don't break
export function getTechLabel(tech: Tech): string {
  return _getTechLabel(tech);
}

// Re-export for TechLogo component
export { getTechEntry, getTechIconColor } from '@/lib/techCatalog';
