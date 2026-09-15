'use client';

import { useEffect, useRef, type RefObject } from 'react';
import sequence from '../../public/hero-sequence-v6/manifest.json';

type Props = {
  enabled: boolean;
  track: RefObject<HTMLElement | null>;
  progress: RefObject<HTMLSpanElement | null>;
  chapter: RefObject<HTMLSpanElement | null>;
  className: string;
  onChapterChange?: (chapter: number) => void;
};

const COUNT = sequence.frames;
const CHAPTERS = ['01 / A SEED OF POSSIBILITY', '02 / NURTURING TOMORROW', '03 / A FUTURE IN EVERY HARVEST'];

export default function PlantationSequence({ enabled, track, progress, chapter, className, onChapterChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = track.current;
    if (!enabled || !canvas || !section) return;
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) return;

    let disposed = false;
    let scheduled = 0;
    let active = 0;
    let nearViewport = true;
    let target = 0;
    let rendered = 0;
    let lastPaint = 0;
    let lastChapter = -1;
    let lastImage: HTMLImageElement | undefined;
    let width = 0;
    let height = 0;
    const mobile = window.matchMedia('(max-width: 767px)').matches;
    const frames: Array<HTMLImageElement | undefined> = new Array(COUNT);
    const requested = new Set<number>();
    const pending = new Set<HTMLImageElement>();

    const cover = (image: HTMLImageElement) => {
      if (image === lastImage) return;
      const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
      const drawnWidth = image.naturalWidth * scale;
      const drawnHeight = image.naturalHeight * scale;
      context.globalAlpha = 1;
      context.drawImage(image, (width - drawnWidth) / 2, (height - drawnHeight) / 2, drawnWidth, drawnHeight);
      lastImage = image;
    };

    const paint = (now: number) => {
      scheduled = 0;
      if (disposed || !nearViewport) return;
      const rect = section.getBoundingClientRect();
      const distance = Math.max(1, section.offsetHeight - canvas.clientHeight);
      const amount = Math.min(1, Math.max(0, -rect.top / distance));
      target = amount * (COUNT - 1);
      // Time-based damping softens wheel steps without a long, floating scroll lag.
      const elapsed = lastPaint ? Math.min(Math.max(now - lastPaint, 0), 64) : 16.67;
      lastPaint = now;
      rendered += (target - rendered) * (1 - Math.exp(-elapsed / 70));
      if (Math.abs(target - rendered) < 0.003) rendered = target;
      const displayedProgress = rendered / (COUNT - 1);
      if (progress.current) progress.current.style.transform = `scaleX(${displayedProgress})`;
      const currentChapter = Math.min(CHAPTERS.length - 1, Math.floor(displayedProgress * CHAPTERS.length));
      if (currentChapter !== lastChapter) {
        if (chapter.current) chapter.current.textContent = CHAPTERS[currentChapter];
        onChapterChange?.(currentChapter);
        lastChapter = currentChapter;
      }

      // Show one opaque frame: dissolving moving leaves produces double edges.
      const frame = frames[Math.round(rendered)];
      if (frame) {
        cover(frame);
        canvas.style.opacity = '1';
      } else {
        // Keep a decoded nearby frame on screen while the requested frame loads.
        const closest = frames.reduce<number | undefined>((best, image, index) => image && (best === undefined || Math.abs(index - rendered) < Math.abs(best - rendered)) ? index : best, undefined);
        if (closest !== undefined) { cover(frames[closest]!); canvas.style.opacity = '1'; }
      }
      context.globalAlpha = 1;
      pump();
      if (rendered !== target) schedule();
      else lastPaint = 0;
    };

    const schedule = () => {
      if (!disposed && nearViewport && !scheduled) scheduled = requestAnimationFrame(paint);
    };

    const pump = () => {
      if (disposed || !nearViewport) return;
      // Keep only nearby decoded 4K frames in memory.
      const center = Math.round(target);
      frames.forEach((image, index) => {
        if (image && Math.abs(index - center) > 3) {
          frames[index] = undefined;
          requested.delete(index);
        }
      });
      // Three requests at a time, prioritising the user's current scroll position.
      while (active < 3 && requested.size < COUNT) {
        let index = -1;
        for (let candidate = 0; candidate < COUNT; candidate++) {
          if (Math.abs(candidate - center) > 2) continue;
          if (!requested.has(candidate) && (index < 0 || Math.abs(candidate - target) < Math.abs(index - target))) index = candidate;
        }
        if (index < 0) break;
        requested.add(index);
        active++;
        const image = new Image();
        image.decoding = 'async';
        pending.add(image);
        const finish = (success: boolean) => {
          if (disposed) return;
          if (success && Math.abs(index - Math.round(target)) <= 3) frames[index] = image;
          else if (success) requested.delete(index);
          pending.delete(image);
          active--;
          schedule();
          pump();
        };
        image.onload = () => { image.decode().then(() => finish(true)).catch(() => finish(image.naturalWidth > 0)); };
        image.onerror = () => finish(false);
        image.src = `/hero-sequence-v6/${String(index + 1).padStart(2, '0')}${mobile ? '-mobile' : ''}.webp?v=6`;
      }
    };

    const resize = () => {
      // Render crisply on high-density displays while bounding backing-store memory.
      const area = Math.max(1, canvas.clientWidth * canvas.clientHeight);
      const density = Math.min(window.devicePixelRatio || 1, 2, (mobile ? 2560 : 3840) / Math.max(canvas.clientWidth, canvas.clientHeight, 1), Math.sqrt((mobile ? 4_000_000 : 8_294_400) / area));
      width = Math.max(1, Math.floor(canvas.clientWidth * density));
      height = Math.max(1, Math.floor(canvas.clientHeight * density));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        lastImage = undefined;
      }
      // Changing canvas dimensions resets drawing settings, so restore them here.
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';
      schedule();
    };
    const observer = new IntersectionObserver(([entry]) => {
      nearViewport = entry.isIntersecting;
      if (nearViewport) { schedule(); pump(); }
    }, { rootMargin: '200px' });
    observer.observe(section);
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    window.addEventListener('scroll', schedule, { passive: true });
    resize();

    return () => {
      disposed = true;
      cancelAnimationFrame(scheduled);
      window.removeEventListener('scroll', schedule);
      observer.disconnect();
      resizeObserver.disconnect();
      pending.forEach(image => { image.onload = null; image.onerror = null; image.src = ''; });
      frames.length = 0;
      canvas.style.opacity = '0';
      if (progress.current) progress.current.style.transform = 'scaleX(0)';
      if (chapter.current) chapter.current.textContent = CHAPTERS[0];
    };
  }, [enabled, track, progress, chapter, onChapterChange]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
