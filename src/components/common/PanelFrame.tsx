import React from 'react';
import { cn } from '../../utils';

interface PanelFrameProps {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  title?: string;
  titleIcon?: React.ReactNode;
  id?: string;
  headerAction?: React.ReactNode;
  noBackground?: boolean;
}

export function PanelFrame({
  children,
  className,
  contentClassName,
  title,
  titleIcon,
  id,
  headerAction,
  noBackground = false,
}: PanelFrameProps) {
  return (
    <div
      id={id}
      className={cn(
        'relative flex flex-col rounded-sm select-none border border-[#141414]/20 shadow-[0_4px_16px_rgba(0,0,0,0.05)]',
        !noBackground && 'bg-white/75 backdrop-blur-xs',
        className
      )}
    >
      {/* Optional Top Panel Header Plaque */}
      {title && (
        <div className="relative z-20 pt-3 px-5 flex items-center justify-between border-b border-[#141414]/15">
          <div className="flex items-center gap-2">
            {titleIcon && <span className="text-[var(--accent-ink)]">{titleIcon}</span>}
            <h3 className="font-display text-xs sm:text-sm text-[#161616] tracking-[0.18em] uppercase font-bold">
              {title}
            </h3>
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}

      {/* Panel Inner Content Container */}
      <div className={cn('relative z-10 flex-1 p-4 sm:p-5 text-[#161616]', contentClassName)}>
        {children}
      </div>
    </div>
  );
}
