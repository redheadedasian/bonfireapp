import React from 'react';
import { cn } from '../../utils';
import { ASSET_MAP } from '@/config/assets';

export type FramedPanelVariant = 'default' | 'card' | 'sidebar' | 'compact' | 'gold' | 'magical';

interface FramedPanelProps {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  variant?: FramedPanelVariant;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  headerAction?: React.ReactNode;
  showCrest?: boolean;
  cornerSize?: number;
  insetPadding?: string;
  isScrollable?: boolean;
}

/**
 * Reusable 9-Slice Framed Panel Container
 *
 * Architecture:
 * - Outer Frame Shell: `relative h-full max-h-screen min-h-0 overflow-hidden flex flex-col`
 * - Decorative Frame Chrome: 4 corner caps and border rails positioned `absolute` relative to the non-scrolling outer wrapper with `pointer-events-none z-20`.
 * - Inner Scroll Container: `flex-1 min-h-0 h-full overflow-y-auto overflow-x-hidden custom-scrollbar z-0`
 */
export const FramedPanel: React.FC<FramedPanelProps> = ({
  children,
  className = '',
  contentClassName = '',
  variant = 'default',
  title,
  subtitle,
  headerAction,
  showCrest = false,
  cornerSize,
  insetPadding,
  isScrollable = false,
}) => {
  const isMagical = variant === 'magical';
  const sliceAssets = isMagical ? ASSET_MAP.frames.magicalSlice : ASSET_MAP.frames.slice;

  // Size tuning per variant
  const actualCornerSize = cornerSize ?? (variant === 'compact' ? 24 : variant === 'sidebar' ? 32 : isMagical ? 24 : 28);

  // Background and border styling presets per variant: Unified light washi paper wash + delicate charcoal border & grounding shadow
  const bgStyles = {
    default: 'bg-white/[0.72] backdrop-blur-[2px] shadow-[0_4px_18px_rgba(0,0,0,0.06)] border border-[#141414]/25',
    card: 'bg-white/[0.72] backdrop-blur-[2px] shadow-[0_4px_18px_rgba(0,0,0,0.06)] border border-[#141414]/20',
    sidebar: 'bg-white/[0.72] backdrop-blur-[2px] shadow-[0_4px_18px_rgba(0,0,0,0.06)] border border-[#141414]/25',
    compact: 'bg-white/[0.75] backdrop-blur-[2px] shadow-[0_4px_18px_rgba(0,0,0,0.06)] border border-[#141414]/20',
    gold: 'bg-white/[0.75] backdrop-blur-[2px] shadow-[0_4px_18px_rgba(0,0,0,0.06)] border border-black/20',
    magical: 'bg-white/[0.72] backdrop-blur-[2px] shadow-[0_4px_18px_rgba(0,0,0,0.06)] border border-[#141414]/25',
  }[variant];

  const defaultInsetPadding = {
    default: 'p-4 sm:p-5',
    card: 'p-3 sm:p-4',
    sidebar: 'px-4 pt-4 pb-6',
    compact: 'p-2.5 sm:p-3',
    gold: 'p-4 sm:p-5',
    magical: 'p-3 sm:p-4',
  }[variant];

  const paddingClass = insetPadding ?? defaultInsetPadding;

  return (
    <div className={cn('relative rounded-sm overflow-hidden flex flex-col min-h-0 w-full', bgStyles, className)}>
      {/* ── 9-Slice Decorative Frame Chrome (pinned, non-scrolling, pointer-events-none z-20) ── */}
      <div className="absolute inset-0 pointer-events-none select-none z-20 overflow-hidden" aria-hidden="true">
        {/* Top Rail */}
        <div
          className="absolute top-0 left-0 right-0 pointer-events-none"
          style={{
            marginLeft: actualCornerSize - 1,
            marginRight: actualCornerSize - 1,
            height: actualCornerSize,
          }}
        >
          <img src={sliceAssets.railTop} alt="" className="w-full h-full object-fill pointer-events-none" />
        </div>

        {/* Bottom Rail */}
        <div
          className="absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{
            marginLeft: actualCornerSize - 1,
            marginRight: actualCornerSize - 1,
            height: actualCornerSize,
          }}
        >
          <img src={sliceAssets.railBottom} alt="" className="w-full h-full object-fill pointer-events-none" />
        </div>

        {/* Left Rail */}
        <div
          className="absolute top-0 bottom-0 left-0 pointer-events-none"
          style={{
            marginTop: actualCornerSize - 1,
            marginBottom: actualCornerSize - 1,
            width: actualCornerSize,
          }}
        >
          <img src={sliceAssets.railLeft} alt="" className="w-full h-full object-fill pointer-events-none" />
        </div>

        {/* Right Rail */}
        <div
          className="absolute top-0 bottom-0 right-0 pointer-events-none"
          style={{
            marginTop: actualCornerSize - 1,
            marginBottom: actualCornerSize - 1,
            width: actualCornerSize,
          }}
        >
          <img src={sliceAssets.railRight} alt="" className="w-full h-full object-fill pointer-events-none" />
        </div>

        {/* 4 Corner Caps */}
        <img
          src={sliceAssets.cornerTopLeft}
          alt=""
          className="absolute top-0 left-0 pointer-events-none z-20"
          style={{ width: actualCornerSize, height: actualCornerSize }}
        />
        <img
          src={sliceAssets.cornerTopRight}
          alt=""
          className="absolute top-0 right-0 pointer-events-none z-20"
          style={{ width: actualCornerSize, height: actualCornerSize }}
        />
        <img
          src={sliceAssets.cornerBottomLeft}
          alt=""
          className="absolute bottom-0 left-0 pointer-events-none z-20"
          style={{ width: actualCornerSize, height: actualCornerSize }}
        />
        <img
          src={sliceAssets.cornerBottomRight}
          alt=""
          className="absolute bottom-0 right-0 pointer-events-none z-20"
          style={{ width: actualCornerSize, height: actualCornerSize }}
        />
      </div>

      {/* ── Fixed Header Area (if title/actions provided) ── */}
      {(title || headerAction) && (
        <div
          className="relative z-10 pt-3 pb-2.5 border-b border-[#141414]/15 flex items-center justify-between gap-2 flex-shrink-0"
          style={{
            paddingLeft: Math.max(actualCornerSize + 8, 34),
            paddingRight: Math.max(actualCornerSize + 8, 34),
          }}
        >
          <div className="min-w-0">
            {typeof title === 'string' ? (
              <h2 className="font-gw2 text-xs sm:text-[13px] text-[#1a1a1a] tracking-[0.18em] uppercase font-bold truncate">
                {title}
              </h2>
            ) : (
              title
            )}
            {subtitle && (
              <div className="text-[10px] font-serif text-[#555555] tracking-wide mt-0.5">
                {subtitle}
              </div>
            )}
          </div>
          {headerAction && <div className="flex-shrink-0">{headerAction}</div>}
        </div>
      )}

      {/* ── Inner Content (z-0 scrolls behind the pinned frame corners & rails) ── */}
      <div
        className={cn(
          'relative z-0 min-w-0 w-full',
          isScrollable ? 'flex-1 min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar' : 'h-auto',
          paddingClass,
          contentClassName
        )}
      >
        {children}
      </div>
    </div>
  );
};
