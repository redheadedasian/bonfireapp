import React from 'react';
import { ASSET_MAP } from '@/config/assets';

interface OrnateCardFrameProps {
  variant?: 'standard' | 'magical' | 'gold';
  cornerSize?: number;
  showRails?: boolean;
  showCrest?: boolean;
  className?: string;
}

export function OrnateCardFrame({
  variant = 'standard',
  cornerSize = 22,
  showRails = true,
  showCrest = false,
  className = ''
}: OrnateCardFrameProps) {
  const isMagical = variant === 'magical';
  const slice = isMagical ? ASSET_MAP.frames.magicalSlice : ASSET_MAP.frames.slice;

  return (
    <div
      className={`absolute inset-0 pointer-events-none select-none overflow-hidden z-10 ${className}`}
      aria-hidden="true"
    >
      {/* Top Filigree Rail */}
      {showRails && (
        <div
          className="absolute top-0 left-0 right-0 pointer-events-none"
          style={{
            marginLeft: cornerSize - 1,
            marginRight: cornerSize - 1,
            height: cornerSize,
          }}
        >
          <img src={slice.railTop} alt="" className="w-full h-full object-fill pointer-events-none" />
        </div>
      )}

      {/* Bottom Filigree Rail */}
      {showRails && (
        <div
          className="absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{
            marginLeft: cornerSize - 1,
            marginRight: cornerSize - 1,
            height: cornerSize,
          }}
        >
          <img src={slice.railBottom} alt="" className="w-full h-full object-fill pointer-events-none" />
        </div>
      )}

      {/* 4 Pinned Corner Flourishes */}
      <img
        src={slice.cornerTopLeft}
        alt=""
        className="absolute top-0 left-0"
        style={{ width: cornerSize, height: cornerSize }}
      />
      <img
        src={slice.cornerTopRight}
        alt=""
        className="absolute top-0 right-0"
        style={{ width: cornerSize, height: cornerSize }}
      />
      <img
        src={slice.cornerBottomLeft}
        alt=""
        className="absolute bottom-0 left-0"
        style={{ width: cornerSize, height: cornerSize }}
      />
      <img
        src={slice.cornerBottomRight}
        alt=""
        className="absolute bottom-0 right-0"
        style={{ width: cornerSize, height: cornerSize }}
      />
    </div>
  );
}
