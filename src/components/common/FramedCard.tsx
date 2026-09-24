import React from 'react';
import { cn } from '../../utils';
import { ASSET_MAP } from '@/config/assets';

export type FramedCardVariant = 'magical' | 'default' | 'gold' | 'empty' | 'faded';

export interface FramedCardProps {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  variant?: FramedCardVariant;
  cornerSize?: number;
  interactive?: boolean;
  active?: boolean;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  title?: string;
  id?: string;
}

/**
 * FramedCard
 * 
 * Reusable 9-slice framed card component with absolute corner pinning,
 * seamlessly stretched rails, and an inset background that prevents corner bleeding.
 * 
 * Slices are calibrated for both the 'magical' jewel/filigree frame and standard panels.
 */
export const FramedCard: React.FC<FramedCardProps> = ({
  children,
  className = '',
  contentClassName = '',
  variant = 'magical',
  cornerSize,
  interactive = false,
  active = false,
  onClick,
  title,
  id,
}) => {
  const isMagical = variant === 'magical';
  const isEmpty = variant === 'empty';
  
  // Corner sizing: calibrated default is 22px for compact cards
  const actualCornerSize = cornerSize ?? (isMagical ? 22 : 20);

  const sliceAssets = isMagical || isEmpty
    ? ASSET_MAP.frames.magicalSlice
    : ASSET_MAP.frames.slice;

  // Outer container styling (handling glow, layout, interaction)
  const outerStyles = {
    magical: cn(
      'shadow-[0_0_12px_rgba(168,85,247,0.18)]',
      interactive && 'hover:shadow-[0_0_18px_rgba(168,85,247,0.32)]',
      active && 'shadow-[0_0_22px_rgba(168,85,247,0.45)]'
    ),
    default: 'shadow-md',
    gold: 'shadow-[0_0_14px_rgba(201,150,61,0.25)] hover:shadow-[0_0_18px_rgba(201,150,61,0.4)]',
    empty: 'shadow-sm',
    faded: 'opacity-75',
  }[variant];

  // Inset background styling strictly within the inner frame bounds
  const innerBgStyles = {
    magical: cn(
      'bg-white/[0.75] backdrop-blur-[2px] border border-[#a855f7]/30 shadow-[0_4px_18px_rgba(0,0,0,0.06)]',
      active && 'border-[var(--accent-ink)] shadow-[0_0_16px_rgba(168,85,247,0.25)]'
    ),
    default: 'bg-white/[0.72] backdrop-blur-[2px] border border-[#141414]/20 shadow-[0_4px_18px_rgba(0,0,0,0.06)]',
    gold: 'bg-white/[0.75] backdrop-blur-[2px] border border-black/20 shadow-[0_4px_18px_rgba(0,0,0,0.06)]',
    empty: 'bg-white/40 border border-dashed border-[#141414]/20 hover:border-black/40',
    faded: 'bg-white/50 border border-[#141414]/15',
  }[variant];

  const interactiveStyles = interactive
    ? 'cursor-pointer transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] group'
    : '';

  return (
    <div
      id={id}
      title={title}
      onClick={onClick}
      className={cn(
        'relative flex flex-col w-full select-none transition-shadow duration-200',
        outerStyles,
        interactiveStyles,
        className
      )}
    >
      {/* 1. Inset Background Layer (stays strictly within inner bounds to avoid corner bleed) */}
      <div
        className={cn(
          'absolute inset-[3px] rounded-sm overflow-hidden pointer-events-none transition-colors duration-200',
          innerBgStyles
        )}
        aria-hidden="true"
      />

      {/* 2. 9-Slice Decorative Chrome Layer (brightened bronze/gems, pointer-events-none z-10) */}
      {!isEmpty && (
        <div
          className="absolute inset-0 pointer-events-none select-none z-10 overflow-visible"
          style={{
            filter: isMagical
              ? 'brightness(1.35) contrast(1.1) saturate(1.15)'
              : undefined,
          }}
          aria-hidden="true"
        >
          {/* Top Rail (stretched between left and right corners) */}
          <div
            className="absolute top-0 left-0 right-0"
            style={{
              left: actualCornerSize - 2,
              right: actualCornerSize - 2,
              height: actualCornerSize,
            }}
          >
            <img
              src={sliceAssets.railTop}
              alt=""
              className={cn(
                'w-full h-full object-fill pointer-events-none',
                variant === 'faded' && 'opacity-50'
              )}
            />
          </div>

          {/* Bottom Rail */}
          <div
            className="absolute bottom-0 left-0 right-0"
            style={{
              left: actualCornerSize - 2,
              right: actualCornerSize - 2,
              height: actualCornerSize,
            }}
          >
            <img
              src={sliceAssets.railBottom}
              alt=""
              className={cn(
                'w-full h-full object-fill pointer-events-none',
                variant === 'faded' && 'opacity-50'
              )}
            />
          </div>

          {/* Left Rail */}
          <div
            className="absolute top-0 bottom-0 left-0"
            style={{
              top: actualCornerSize - 2,
              bottom: actualCornerSize - 2,
              width: actualCornerSize,
            }}
          >
            <img
              src={sliceAssets.railLeft}
              alt=""
              className={cn(
                'w-full h-full object-fill pointer-events-none',
                variant === 'faded' && 'opacity-50'
              )}
            />
          </div>

          {/* Right Rail */}
          <div
            className="absolute top-0 bottom-0 right-0"
            style={{
              top: actualCornerSize - 2,
              bottom: actualCornerSize - 2,
              width: actualCornerSize,
            }}
          >
            <img
              src={sliceAssets.railRight}
              alt=""
              className={cn(
                'w-full h-full object-fill pointer-events-none',
                variant === 'faded' && 'opacity-50'
              )}
            />
          </div>

          {/* 4 Pinned Corners */}
          <img
            src={sliceAssets.cornerTopLeft}
            alt=""
            className={cn(
              'absolute top-0 left-0 pointer-events-none z-20',
              variant === 'faded' && 'opacity-60'
            )}
            style={{ width: actualCornerSize, height: actualCornerSize }}
          />
          <img
            src={sliceAssets.cornerTopRight}
            alt=""
            className={cn(
              'absolute top-0 right-0 pointer-events-none z-20',
              variant === 'faded' && 'opacity-60'
            )}
            style={{ width: actualCornerSize, height: actualCornerSize }}
          />
          <img
            src={sliceAssets.cornerBottomLeft}
            alt=""
            className={cn(
              'absolute bottom-0 left-0 pointer-events-none z-20',
              variant === 'faded' && 'opacity-60'
            )}
            style={{ width: actualCornerSize, height: actualCornerSize }}
          />
          <img
            src={sliceAssets.cornerBottomRight}
            alt=""
            className={cn(
              'absolute bottom-0 right-0 pointer-events-none z-20',
              variant === 'faded' && 'opacity-60'
            )}
            style={{ width: actualCornerSize, height: actualCornerSize }}
          />
        </div>
      )}

      {/* 3. Card Content Layer */}
      <div className={cn('relative z-20 flex-1 min-w-0 p-2.5 sm:p-3', contentClassName)}>
        {children}
      </div>
    </div>
  );
};

export default FramedCard;
