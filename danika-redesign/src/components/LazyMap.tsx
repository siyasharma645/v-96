'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';

/**
 * Click-to-load map. The Google Maps iframe (several hundred KB plus third-party requests) is not rendered until
 * the visitor asks for it, so it costs nothing on first load. The placeholder is pure CSS/SVG and reserves the same
 * responsive box, so nothing shifts when the map appears. Directions stay available as a normal link below.
 */
export function LazyMap({ src, title }: { src: string; title: string }) {
  const [loaded, setLoaded] = useState(false);
  const frameRef = useRef<HTMLIFrameElement>(null);

  // Hand focus to the map once it exists, so keyboard users are not left on a button that just disappeared.
  useEffect(() => { if (loaded) frameRef.current?.focus(); }, [loaded]);

  return (
    <div className="relative aspect-[4/3] w-full bg-cream sm:aspect-[2/1] lg:aspect-[3/1]">
      {loaded ? (
        <iframe
          ref={frameRef}
          title={title}
          src={src}
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 h-full w-full border-0"
          allowFullScreen
        />
      ) : (
        <>
          <svg aria-hidden className="absolute inset-0 h-full w-full text-primary/10" preserveAspectRatio="xMidYMid slice" viewBox="0 0 400 240">
            <defs>
              <pattern id="map-grid" width="32" height="32" patternUnits="userSpaceOnUse">
                <path d="M32 0H0V32" fill="none" stroke="currentColor" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="400" height="240" fill="url(#map-grid)" />
            <path d="M-10 190 C80 150 140 210 230 140 S360 90 420 60" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
            <path d="M120 -10 C140 60 100 120 150 250" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-4 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-primary text-white shadow-lift"><MapPin className="h-6 w-6" aria-hidden /></span>
            <button
              type="button"
              onClick={() => setLoaded(true)}
              className="btn-motion btn-shadow inline-flex min-h-[48px] items-center justify-center rounded-btn border-2 border-primary bg-primary px-6 py-3 text-[0.95rem] font-bold leading-none text-white [@media(hover:hover)]:hover:border-primary-dark [@media(hover:hover)]:hover:bg-primary-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Load interactive map
            </button>
          </div>
        </>
      )}
    </div>
  );
}
