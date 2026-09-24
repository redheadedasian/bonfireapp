import React, { useState } from 'react';

export interface GameAssetImgProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  fallbackSrc?: string;
  alt: string;
  className?: string;
}

/**
 * Resilient image component for RPG character sheet assets.
 * Accepts bundled Vite asset URLs (or fallback URLs).
 */
export function GameAssetImg({
  src,
  fallbackSrc,
  alt,
  className = '',
  ...props
}: GameAssetImgProps) {
  const [currentSrc, setCurrentSrc] = useState<string>(src);
  const [hasErrored, setHasErrored] = useState<boolean>(false);

  // Sync if src prop changes
  React.useEffect(() => {
    setCurrentSrc(src);
    setHasErrored(false);
  }, [src]);

  const handleError = () => {
    if (!hasErrored && fallbackSrc && fallbackSrc !== currentSrc) {
      setCurrentSrc(fallbackSrc);
      setHasErrored(true);
    }
  };

  return (
    <img
      src={currentSrc}
      alt={alt}
      onError={handleError}
      className={className}
      draggable={false}
      {...props}
    />
  );
}
