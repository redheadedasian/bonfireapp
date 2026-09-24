import React from 'react';
import bonfireLogoPng from './bonfire logo.png';

interface BonfireLogoProps {
  size?: number;
  height?: number | string;
  className?: string;
  alt?: string;
  showAura?: boolean;
}

export function BonfireLogo({ 
  size, 
  height = 54, 
  className = '', 
  alt = 'Bonfire',
  showAura = true
}: BonfireLogoProps) {
  const actualHeight = size !== undefined ? size : height;

  return (
    <div className="relative inline-flex items-center justify-center shrink-0 group">
      {/* Radiant Golden/Flame Ember Aura Glow */}
      {showAura && (
        <div className="absolute inset-0 -m-1.5 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.28)_0%,rgba(245,158,11,0.14)_45%,transparent_72%)] filter blur-md pointer-events-none opacity-80 group-hover:opacity-100 group-hover:scale-115 transition-all duration-500" />
      )}
      <img
        src={bonfireLogoPng}
        alt={alt}
        style={{ height: actualHeight, width: 'auto' }}
        className={`relative z-10 object-contain select-none shrink-0 transition-all duration-300 group-hover:brightness-125 group-hover:scale-105 drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)] drop-shadow-[0_0_12px_rgba(212,175,55,0.45)] ${className}`}
        draggable={false}
      />
    </div>
  );
}

export default BonfireLogo;

