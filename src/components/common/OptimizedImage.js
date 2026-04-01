'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

/**
 * Optimized Image Component
 * Features:
 * - Automatic lazy loading
 * - Responsive sizes
 * - Format optimization (WebP)
 * - Error fallbacks
 * - Loading placeholder
 */
export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  quality = 75,
  sizes,
  onError,
  placeholder = 'blur',
  blurDataURL,
}) {
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(!priority);

  useEffect(() => {
    if (!priority) {
      setIsLoading(true);
    }
  }, [priority]);

  const handleError = () => {
    setIsError(true);
    onError?.();
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  if (isError) {
    return (
      <div
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-gray-500 text-sm">Image failed to load</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        quality={quality}
        priority={priority}
        loading={priority ? 'eager' : 'lazy'}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        sizes={sizes}
        className={`object-cover w-full h-full ${
          isLoading ? 'blur-sm' : 'blur-0'
        } transition-all duration-300`}
        onError={handleError}
        onLoad={handleLoad}
      />
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse" />
      )}
    </div>
  );
}
