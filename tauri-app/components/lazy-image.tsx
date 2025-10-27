'use client';

import { useEffect, useRef, useState } from 'react';
import { Image } from '@heroui/image';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  onLoad?: () => void;
}

export function LazyImage({ src, alt, className = '', onLoad }: LazyImageProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        rootMargin: '50px', // 提前 50px 开始加载
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return (
    <div ref={ref} className={`w-full ${className}`}>
      {isVisible ? (
        <Image
          src={src}
          alt={alt}
          className="w-full h-auto"
          removeWrapper
          isBlurred
          onLoad={() => {
            setIsLoaded(true);
            onLoad?.();
          }}
        />
      ) : (
        // 占位符
        <div className="w-full bg-gray-200 dark:bg-gray-700 aspect-[3/4]" />
      )}
    </div>
  );
}

