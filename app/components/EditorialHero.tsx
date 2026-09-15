'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState, type RefObject } from 'react';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import PlantationSequence from './PlantationSequence';
import styles from './EditorialHero.module.css';

const ease = [0.22, 1, 0.36, 1] as const;
const titles = [
  ['Our Core Business', 'Coconut Based Farming System'],
  ['Growing for a', 'Better Tomorrow'],
  ['Nature Grown,', 'Quality Delivered'],
];

export default function EditorialHero({ headerMarker }: { headerMarker: RefObject<HTMLSpanElement | null> }) {
  const reduced = useReducedMotion();
  const track = useRef<HTMLElement>(null);
  const progress = useRef<HTMLSpanElement>(null);
  const chapter = useRef<HTMLSpanElement>(null);
  const [scrubEnabled, setScrubEnabled] = useState(false);
  const [activeChapter, setActiveChapter] = useState(0);
  const visibleChapter = scrubEnabled ? activeChapter : 0;
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce), (max-height: 540px)');
    const connection = (navigator as Navigator & { connection?: EventTarget & { saveData?: boolean } }).connection;
    const update = () => setScrubEnabled(!media.matches && !connection?.saveData);
    update();
    media.addEventListener('change', update);
    connection?.addEventListener('change', update);
    return () => { media.removeEventListener('change', update); connection?.removeEventListener('change', update); };
  }, []);
  const entrance = (delay = 0) => ({ type: 'tween' as const, duration: reduced ? 0 : 0.75, delay: reduced ? 0 : delay, ease });

  return (
    <section id="home" ref={track} data-scrub={scrubEnabled} className={styles.sequence} aria-labelledby="hero-heading">
      <span ref={headerMarker} className={styles.headerMarker} aria-hidden="true" />
      <div className={styles.hero}>
      <div className={styles.background}>
        <picture><source media="(max-width: 767px)" srcSet="/hero-sequence-v6/01-mobile.webp?v=6" /><img src="/hero-sequence-v6/01.webp?v=6" alt="A coconut seedling growing in rich plantation soil" className={styles.landscape} fetchPriority="high" decoding="async" /></picture>
        <PlantationSequence enabled={scrubEnabled} track={track} progress={progress} chapter={chapter} className={styles.canvas} onChapterChange={setActiveChapter} />
      </div>
      <div className={styles.shade} aria-hidden="true" />
      <div className={styles.inner}>
        <div className={styles.content}>
          <motion.p className={styles.overline} initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={entrance(0.05)}>
            <span aria-hidden="true" />ROOTED IN SRI LANKA. GROWING WITH PURPOSE.
          </motion.p>
          <h1 id="hero-heading" className={styles.headline} aria-label={titles[visibleChapter].join(' ')}>
            {titles.map(([line, emphasis], index) => (
              <motion.span key={line} className={styles.titleSlide} aria-hidden="true"
                initial={false}
                animate={{ opacity: visibleChapter === index ? 1 : 0, y: reduced ? 0 : visibleChapter === index ? 0 : 10 }}
                transition={{ duration: reduced ? 0 : visibleChapter === index ? 0.42 : 0.18, delay: reduced || visibleChapter !== index ? 0 : 0.12, ease }}>
                <span>{line}</span><em>{emphasis}</em>
              </motion.span>
            ))}
          </h1>
          <motion.div initial={reduced ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={entrance(0.34)}>
            <p className={styles.description}>Cultivating value through responsible plantation management, innovation and sustainable agriculture.</p>
            <div className={styles.actions}>
              <a className={styles.primaryLink} href="#estates">Explore Our Estates<span><ArrowUpRight size={18} strokeWidth={1.5} /></span></a>
              <a className={styles.secondaryLink} href="#business">Discover Our Business<ArrowUpRight size={17} strokeWidth={1.4} /></a>
            </div>
          </motion.div>
        </div>
        <div className={styles.storyNote}><span ref={chapter} aria-hidden="true">01 / A SEED OF POSSIBILITY</span><p>Great things grow<br />from <em>small beginnings.</em></p><small>FROM SEED TO HARVEST</small></div>
        <div className={styles.bottom}>
          <div className={styles.scrollPrompt}><span className={styles.scrollCircle}><ArrowDown size={18} strokeWidth={1.25} /></span><span>{scrubEnabled ? 'SCROLL TO WATCH' : 'ROOTED IN SRI LANKA'}<br /><strong>{scrubEnabled ? 'OUR STORY GROW' : 'GROWING WITH PURPOSE'}</strong></span></div>
          <div className={styles.timeline} aria-hidden="true"><span>SEED</span><span className={styles.track}><span ref={progress} /></span><span>HARVEST</span></div>
          <a href="#about" className={styles.skipLink}>Explore KPL <ArrowUpRight size={16} /></a>
        </div>
      </div>
      <span className={styles.sideNote} aria-hidden="true">NATURE. NURTURED.</span>
      </div>
    </section>
  );
}
