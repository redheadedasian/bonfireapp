import React from 'react';
import { cn } from '../../utils';
import { ASSET_MAP } from '@/config/assets';

export interface TitleBannerProps {
  title: string;
  subtitle?: React.ReactNode;
  status?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  compact?: boolean;
}

export function TitleBanner({
  title,
  subtitle,
  status,
  action,
  className,
  icon,
  compact = false,
}: TitleBannerProps) {
  return (
    <div className={cn('relative flex flex-col gap-1 w-full select-none', className)}>
      {/* Clean borderless title header with dynamic ink accent */}
      <div className="relative flex items-center justify-between gap-2 px-1 py-0.5">
        <div className="relative inline-flex items-center gap-2">
          <div
            style={{
              maskImage: `url("${ASSET_MAP.brushStrokes.brush5}")`,
              WebkitMaskImage: `url("${ASSET_MAP.brushStrokes.brush5}")`,
              maskSize: '100% 100%',
              WebkitMaskSize: '100% 100%',
              maskRepeat: 'no-repeat',
              WebkitMaskRepeat: 'no-repeat',
              maskPosition: 'center',
              WebkitMaskPosition: 'center',
              backgroundColor: 'var(--accent-ink)',
              opacity: 0.3,
            }}
            className="absolute -inset-x-3 -inset-y-1 pointer-events-none"
          />
          <div className="relative z-10 flex items-center gap-2">
            {icon && <span className="text-[var(--accent-ink)] shrink-0 text-xs">{icon}</span>}
            <h3 className={cn(
              "font-gw2 text-[#1a1a1a] tracking-[0.18em] uppercase font-bold truncate",
              compact ? "text-[11px] sm:text-xs" : "text-xs sm:text-[13px]"
            )}>
              {title}
            </h3>
          </div>
        </div>

        {action && <div className="relative z-10">{action}</div>}
      </div>

      {/* Keys / Status Sub-bar Placed Under the Banner */}
      {(subtitle || status) && (
        <div className="flex justify-between items-center px-1 text-[10px] font-display uppercase tracking-wider text-[#555555] min-h-[16px]">
          <div className="flex items-center gap-2 text-[#555555]">
            {subtitle}
          </div>
          <div className="flex items-center gap-3">
            {status && <div className="text-[#1a1a1a] font-semibold">{status}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
