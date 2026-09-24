import React from 'react'
import type { DiceSkin } from './dice3d'

interface D20SkinBadgeProps {
  skin: DiceSkin
  className?: string
  size?: number
}

/**
 * Dynamic 2D D20 Icon Component representing an isometric/faceted 20-sided die
 * (Hexagonal outer silhouette with internal facet triangles, dynamic body gradients,
 * emissive center glow, edge stroke, and subtle Roman numeral XX / 20 glyph).
 */
export const D20SkinBadge: React.FC<D20SkinBadgeProps> = ({ skin, className = '', size = 26 }) => {
  const hexBody = `#${skin.body.toString(16).padStart(6, '0')}`
  const hexEmissive = `#${skin.emissive.toString(16).padStart(6, '0')}`
  const hexEdge = `#${skin.edge.toString(16).padStart(6, '0')}`
  const idPrefix = `d20-${skin.id}`

  // Mathematical isometric projected d20 vertices (viewBox 0 0 100 100, center 50,50)
  // Outer Hexagon: V0(50, 4), V1(90, 27), V2(90, 73), V3(50, 96), V4(10, 73), V5(10, 27)
  // Inner Inverted Triangle: C0(50, 68), C1(22, 36), C2(78, 36)
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={`inline-block flex-shrink-0 select-none overflow-visible ${className}`}
      aria-hidden="true"
    >
      <defs>
        {/* Subtle top-down facet highlight */}
        <linearGradient id={`${idPrefix}-grad-top`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.05" />
        </linearGradient>
        {/* Right side shadow facet */}
        <linearGradient id={`${idPrefix}-grad-right`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.35" />
        </linearGradient>
        {/* Left side ambient facet */}
        <linearGradient id={`${idPrefix}-grad-left`} x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.2" />
        </linearGradient>
        {/* Emissive Center Radial Glow */}
        <radialGradient id={`${idPrefix}-emissive`} cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor={hexEmissive} stopOpacity="1" />
          <stop offset="65%" stopColor={hexBody} stopOpacity="0.95" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.8" />
        </radialGradient>
      </defs>

      {/* Outer Hexagon Base Background */}
      <polygon
        points="50,4 90,27 90,73 50,96 10,73 10,27"
        fill={hexBody}
      />

      {/* Surrounding Facet Triangles with Light Accents */}
      {/* Top Left: V0(50,4), V5(10,27), C1(22,36) */}
      <polygon
        points="50,4 10,27 22,36"
        fill={hexBody}
      />
      <polygon
        points="50,4 10,27 22,36"
        fill={`url(#${idPrefix}-grad-top)`}
      />

      {/* Top: V0(50,4), C1(22,36), C2(78,36) */}
      <polygon
        points="50,4 22,36 78,36"
        fill={hexBody}
      />
      <polygon
        points="50,4 22,36 78,36"
        fill={`url(#${idPrefix}-grad-top)`}
      />

      {/* Top Right: V0(50,4), C2(78,36), V1(90,27) */}
      <polygon
        points="50,4 78,36 90,27"
        fill={hexBody}
      />
      <polygon
        points="50,4 78,36 90,27"
        fill={`url(#${idPrefix}-grad-top)`}
      />

      {/* Mid Right: V1(90,27), C2(78,36), V2(90,73) */}
      <polygon
        points="90,27 78,36 90,73"
        fill={hexBody}
      />
      <polygon
        points="90,27 78,36 90,73"
        fill={`url(#${idPrefix}-grad-right)`}
      />

      {/* Bottom Right: C2(78,36), C0(50,68), V2(90,73) */}
      <polygon
        points="78,36 50,68 90,73"
        fill={hexBody}
      />
      <polygon
        points="78,36 50,68 90,73"
        fill={`url(#${idPrefix}-grad-right)`}
      />

      {/* Bottom Far-Right: V2(90,73), C0(50,68), V3(50,96) */}
      <polygon
        points="90,73 50,68 50,96"
        fill={hexBody}
      />
      <polygon
        points="90,73 50,68 50,96"
        fill={`url(#${idPrefix}-grad-right)`}
      />

      {/* Bottom Far-Left: V4(10,73), C0(50,68), V3(50,96) */}
      <polygon
        points="10,73 50,68 50,96"
        fill={hexBody}
      />
      <polygon
        points="10,73 50,68 50,96"
        fill={`url(#${idPrefix}-grad-left)`}
      />

      {/* Bottom Left: V4(10,73), C1(22,36), C0(50,68) */}
      <polygon
        points="10,73 22,36 50,68"
        fill={hexBody}
      />
      <polygon
        points="10,73 22,36 50,68"
        fill={`url(#${idPrefix}-grad-left)`}
      />

      {/* Mid Left: V5(10,27), V4(10,73), C1(22,36) */}
      <polygon
        points="10,27 10,73 22,36"
        fill={hexBody}
      />
      <polygon
        points="10,27 10,73 22,36"
        fill={`url(#${idPrefix}-grad-left)`}
      />

      {/* Center Main Facet (Glowing Inner Inverted Triangle): C1(22,36), C2(78,36), C0(50,68) */}
      <polygon
        points="22,36 78,36 50,68"
        fill={`url(#${idPrefix}-emissive)`}
      />

      {/* Facet Edges / Wireframe Lines */}
      <g stroke={hexEdge} strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" fill="none" opacity="0.9">
        {/* Outer Hexagon */}
        <polygon points="50,4 90,27 90,73 50,96 10,73 10,27" />
        {/* Inner Triangle */}
        <polygon points="22,36 78,36 50,68" />
        {/* Radial Facet Connectors */}
        <line x1="50" y1="4" x2="22" y2="36" />
        <line x1="50" y1="4" x2="78" y2="36" />
        <line x1="90" y1="27" x2="78" y2="36" />
        <line x1="90" y1="73" x2="78" y2="36" />
        <line x1="90" y1="73" x2="50" y2="68" />
        <line x1="50" y1="96" x2="50" y2="68" />
        <line x1="10" y1="73" x2="50" y2="68" />
        <line x1="10" y1="73" x2="22" y2="36" />
        <line x1="10" y1="27" x2="22" y2="36" />
      </g>

      {/* Center 20 / Roman 'XX' Numeral Glyphs */}
      <text
        x="50"
        y="51"
        textAnchor="middle"
        dominantBaseline="central"
        fill={skin.numeral}
        fontSize="17"
        fontWeight="bold"
        fontFamily="Cinzel, serif"
        letterSpacing="-0.5"
        style={{
          filter: `drop-shadow(0px 0px 3px ${hexEdge})`,
        }}
      >
        20
      </text>
    </svg>
  )
}
