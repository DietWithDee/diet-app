import React, { useState, useEffect } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

/**
 * SafeImage Component
 * Handles 429 (Too Many Requests) errors gracefully and prevents flickering.
 */
const SafeImage = React.memo(({ 
  src, 
  alt, 
  fallback, 
  className = '', 
  wrapperClassName = '',
  effect = 'blur',
  ...props 
}) => {
  const [errorStatus, setErrorStatus] = useState(null); // null, '429', 'other'
  const [imageSrc, setImageSrc] = useState(src);

  useEffect(() => {
    setImageSrc(src);
    setErrorStatus(null);
  }, [src]);

  const handleError = (e) => {
    console.warn(`[SafeImage] Failed to load: ${src}`);
    
    // Check if we can get the status from the error event
    // Note: Standard img onError doesn't always provide the status code directly,
    // but we can assume repeated failures in a short time or certain domains are 429s.
    setErrorStatus('error');
    if (fallback) {
      setImageSrc(fallback);
    }
  };

  // Google User Content (lh3.googleusercontent.com) often needs no-referrer
  const isGoogleImage = src?.includes('googleusercontent.com');

  return (
    <LazyLoadImage
      src={imageSrc}
      alt={alt}
      effect={effect}
      className={`${className} ${errorStatus ? 'opacity-90 grayscale-[0.5]' : ''}`}
      wrapperClassName={wrapperClassName}
      onError={handleError}
      referrerPolicy={isGoogleImage ? 'no-referrer' : 'no-referrer-when-downgrade'}
      {...props}
    />
  );
});

export default SafeImage;
