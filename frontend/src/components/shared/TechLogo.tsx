import { Icon } from '@iconify/react';
import type { Provider, Tech } from '@/types/graph';
import {
  PROVIDER_LOGOS,
  TECH_LOGOS,
  getIconColor,
  getTechLabel,
  getProviderLabel,
} from '@/lib/logos';
import { cn } from '@/lib/utils';

type TechLogoProps = {
  tech: Tech;
  size?: number;
  className?: string;
  showLabel?: boolean;
};

type ProviderLogoProps = {
  provider: Provider;
  size?: number;
  className?: string;
  showLabel?: boolean;
};

export function TechLogo({ tech, size = 16, className, showLabel }: TechLogoProps) {
  const entry = TECH_LOGOS[tech];
  const color = getIconColor(entry);
  const label = getTechLabel(tech);

  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <Icon
        icon={entry.icon}
        width={size}
        height={size}
        color={color}
        className="shrink-0"
      />
      {showLabel && <span className="text-[10px] font-mono text-muted-foreground">{label}</span>}
    </span>
  );
}

export function ProviderLogo({ provider, size = 16, className, showLabel }: ProviderLogoProps) {
  const entry = PROVIDER_LOGOS[provider];
  const color = getIconColor(entry);
  const label = getProviderLabel(provider);

  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <Icon
        icon={entry.icon}
        width={size}
        height={size}
        color={color}
        className="shrink-0"
      />
      {showLabel && <span className="text-[10px] font-mono text-muted-foreground">{label}</span>}
    </span>
  );
}
