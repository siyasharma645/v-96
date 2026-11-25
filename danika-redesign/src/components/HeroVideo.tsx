'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Pause, Play } from 'lucide-react';

/**
 * Full-bleed hero background video.
 *  - The poster (a still from the video) is a priority next/image, so it is the LCP element and paints immediately; the video
 *    fades in over it only once frames are playing. The hero has a fixed min-height, so nothing shifts when the video loads.
 *  - No <source> is rendered on the server: after hydration we pick ONE file (480p on phones, WebM where supported, else MP4),
 *    so phones never download the desktop file. Without JavaScript the poster simply stays.
 *  - Reduced motion or Save-Data: poster only, nothing is downloaded. Autoplay blocked (e.g. Low Power Mode): poster stays.
 *  - Pauses when scrolled out of view or the tab is hidden. A visible pause/play button covers WCAG 2.2.2.
 * Files live in /public/video (encoded without an audio track). The caller layers the dark gradient and text above this.
 */
export function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  const userPaused = useRef(false);
  const [playing, setPlaying] = useState(false); // frames are rendering: fade the video in
  const [paused, setPaused] = useState(false);   // drives the toggle button

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
    if (calm || nav.connection?.saveData) {
      userPaused.current = true;
      setPaused(true);
      return;
    }

    const small = window.matchMedia('(max-width: 700px)').matches;
    const webm = video.canPlayType('video/webm; codecs="vp9"') !== '';
    video.src = small ? '/video/plumbing-hero-mobile.mp4' : webm ? '/video/plumbing-hero.webm' : '/video/plumbing-hero.mp4';
    video.muted = true; // some browsers only honour autoplay when the property (not just the attribute) is set

    const play = () => video.play().catch(() => setPaused(true));
    const onPlaying = () => { setPlaying(true); setPaused(false); };
    video.addEventListener('playing', onPlaying);
    play();

    const io = new IntersectionObserver(([e]) => {
      if (userPaused.current) return;
      if (e.isIntersecting) play(); else video.pause();
    }, { threshold: 0.05 });
    io.observe(video);

    const onVisibility = () => {
      if (userPaused.current) return;
      if (document.hidden) video.pause(); else play();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      video.removeEventListener('playing', onPlaying);
      document.removeEventListener('visibilitychange', onVisibility);
      io.disconnect();
    };
  }, []);

  const toggle = () => {
    const video = ref.current;
    if (!video) return;
    if (!video.paused) {
      userPaused.current = true;
      video.pause();
      setPaused(true);
      return;
    }
    userPaused.current = false;
    if (!video.currentSrc) { // started in poster-only mode: load a file now that the visitor asked for motion
      const small = window.matchMedia('(max-width: 700px)').matches;
      video.src = small ? '/video/plumbing-hero-mobile.mp4' : '/video/plumbing-hero.mp4';
    }
    video.muted = true;
    video.play().then(() => setPaused(false)).catch(() => {});
  };

  return (
    <>
      <div aria-hidden className="absolute inset-0 -z-10 bg-primary-dark">
        <Image
          src="/video/poster.jpg"
          alt=""
          fill
          priority
          quality={72}
          sizes="100vw"
          className="object-cover object-[44%_36%] lg:object-[50%_36%]"
        />
        <video
          ref={ref}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          disablePictureInPicture
          disableRemotePlayback
          tabIndex={-1}
          className={`absolute inset-0 h-full w-full object-cover object-[44%_36%] transition-opacity duration-[900ms] ease-out lg:object-[50%_36%] ${playing ? 'opacity-100' : 'opacity-0'}`}
        />
      </div>

      <button
        type="button"
        onClick={toggle}
        aria-label={paused ? 'Play background video' : 'Pause background video'}
        className="absolute bottom-1.5 right-3 z-20 grid h-10 w-10 place-items-center rounded-full border border-white/60 bg-primary-dark/55 text-white backdrop-blur-sm transition-colors hover:bg-primary-dark/80 sm:right-6 lg:bottom-1.5 lg:right-[max(2rem,calc((100vw-1240px)/2+2rem))]"
      >
        {paused ? <Play className="h-4 w-4 fill-current" aria-hidden /> : <Pause className="h-4 w-4 fill-current" aria-hidden />}
      </button>
    </>
  );
}
