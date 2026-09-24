import React from 'react';
import { cn } from '../../utils';
import { FramedPanel } from '../common/FramedPanel';
export { TitleBanner } from '../common/TitleBanner';
export { FramedPanel } from '../common/FramedPanel';

export function Frame({
  children,
  className,
  title,
  subtitle,
  variant = 'card',
}: {
  children: React.ReactNode;
  className?: string;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  variant?: 'default' | 'card' | 'sidebar' | 'compact' | 'gold';
}) {
  return (
    <FramedPanel
      title={title}
      subtitle={subtitle}
      variant={variant}
      className={className}
      cornerSize={28}
    >
      {children}
    </FramedPanel>
  );
}

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <FramedPanel variant="card" className={className} cornerSize={24} insetPadding="p-3 sm:p-4">
      {children}
    </FramedPanel>
  );
}

export function Divider({ className }: { className?: string }) {
  return (
    <div className={cn("flex justify-center my-4", className)}>
      <div className="ornament-divider" />
    </div>
  );
}

export function SectionTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center w-full mb-3 select-none px-1", className)}>
      <h3 className="font-gw2 text-[#161616] tracking-[0.18em] text-xs sm:text-[13px] uppercase font-bold">
        {children}
      </h3>
    </div>
  );
}

export function StatBox({ label, value, subtext }: { label: string; value: React.ReactNode; subtext?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-2">
      <span className="text-[#555555] text-xs font-display tracking-wider uppercase mb-1">{label}</span>
      <span className="text-[#161616] text-2xl font-serif font-bold">{value}</span>
      {subtext && <span className="text-[#777777] text-xs mt-1 font-serif">{subtext}</span>}
    </div>
  );
}

export function DiamondStat({ 
  label, 
  value, 
  subtext,
  src
}: { 
  label: string; 
  value: React.ReactNode; 
  subtext?: string;
  src: string;
}) {
  return (
    <div className="relative flex flex-col items-center justify-center h-[120px] w-full max-w-[160px] mx-auto text-center group">
      <img src={src} className="absolute inset-0 w-full h-full object-contain pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity" alt="" />
      <div className="relative z-10 flex flex-col items-center justify-center pt-2">
        <span className="text-[#555555] text-[10px] font-display tracking-widest uppercase mb-1 font-bold">{label}</span>
        <span className="text-4xl text-[#161616] font-serif group-hover:text-[var(--accent-ink)] transition-colors drop-shadow-sm font-bold">{value}</span>
        {subtext && <span className="text-[#777777] text-[10px] mt-1 uppercase tracking-wider font-semibold">{subtext}</span>}
      </div>
    </div>
  );
}

export function Button({ 
  children, onClick, variant = 'primary', className 
}: { 
  children: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary' | 'ghost'; className?: string;
}) {
  if (variant === 'primary') {
    return (
      <button 
        onClick={onClick} 
        className={cn("sumie-btn-primary", className)}
      >
        {children}
      </button>
    );
  }

  if (variant === 'secondary') {
    return (
      <button 
        onClick={onClick} 
        className={cn("sumie-btn-secondary", className)}
      >
        {children}
      </button>
    );
  }

  return (
    <button 
      onClick={onClick} 
      className={cn("font-display text-xs tracking-wider uppercase px-2 py-1 text-[#555555] hover:text-[#161616] bg-transparent border-transparent cursor-pointer transition-colors active:scale-95", className)}
    >
      {children}
    </button>
  );
}
