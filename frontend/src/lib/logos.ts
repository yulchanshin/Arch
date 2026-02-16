import type { Provider, Tech } from '@/types/graph';

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

export const TECH_LOGOS: Record<Tech, LogoEntry> = {
  postgres:  { icon: 'simple-icons:postgresql',   color: '#4169E1', label: 'PostgreSQL' },
  mysql:     { icon: 'simple-icons:mysql',        color: '#4479A1', label: 'MySQL' },
  mongodb:   { icon: 'simple-icons:mongodb',      color: '#47A248', label: 'MongoDB' },
  redis:     { icon: 'simple-icons:redis',        color: '#FF4438', label: 'Redis' },
  memcached: { icon: 'simple-icons:ubuntu',       color: '#8BC500', label: 'Memcached' },
  kafka:     { icon: 'simple-icons:apachekafka',  color: '#231F20', label: 'Kafka' },
  rabbitmq:  { icon: 'simple-icons:rabbitmq',     color: '#FF6600', label: 'RabbitMQ' },
  sqs:       { icon: 'simple-icons:amazonsqs',    color: '#FF4F8B', label: 'SQS' },
  python:    { icon: 'simple-icons:python',       color: '#3776AB', label: 'Python' },
  go:        { icon: 'simple-icons:go',           color: '#00ADD8', label: 'Go' },
  node:      { icon: 'simple-icons:nodedotjs',    color: '#5FA04E', label: 'Node.js' },
  rust:      { icon: 'simple-icons:rust',         color: '#CE422B', label: 'Rust' },
  java:      { icon: 'simple-icons:openjdk',      color: '#F89820', label: 'Java' },
  nginx:     { icon: 'simple-icons:nginx',        color: '#009639', label: 'NGINX' },
  envoy:     { icon: 'simple-icons:envoyproxy',   color: '#AC6199', label: 'Envoy' },
  kong:      { icon: 'simple-icons:kong',         color: '#003459', label: 'Kong' },
};

// Dark-mode overrides: some brand colors are too dark on dark backgrounds
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

export function getTechLabel(tech: Tech): string {
  return TECH_LOGOS[tech].label;
}
