'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import styles from './OurBusiness.module.css';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
const official = 'https://kurunegalaplantations.lk/index.php/';
const photo = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=85`;

// Concise summaries of KPL's official What We Offer pages. Photos are illustrative.
const offerings = [
  { name: 'Coconut', tag: 'COCONUT BASED FARMING SYSTEM', description: 'Fresh coconuts, oil, copra and seedlings, alongside husk and shell products.', image: `${basePath}/hero-sequence-v6/16-mobile.webp?v=6`, path: 'coconut/', alt: 'Coconuts growing on a palm, illustrative plantation image' },
  { name: 'Spices', tag: 'AROMATIC BY NATURE', description: 'Cinnamon, nutmeg and pepper, cultivated alongside coconut.', image: photo('photo-1506368249639-73a05d6f6488'), path: 'spices-2/', alt: 'Spices, illustrative produce photography' },
  { name: 'Fruits', tag: 'TROPICAL ABUNDANCE', description: 'From TJC mango and rambutan to dragon fruit, durian and guava.', image: photo('photo-1619566636858-adf3ef46400b'), path: 'fruits-2/', alt: 'Tropical fruits, illustrative produce photography' },
  { name: 'Coffee', tag: 'NORMANDY JUNGLE COFFEE', description: 'Coffee with roots in Wijayapura, on the Rantatikanda mountain range.', image: photo('photo-1447933601403-0c6688de566e'), path: 'coffee/', alt: 'Coffee, illustrative produce photography' },
  { name: 'Rubber', tag: 'A NATURAL RESOURCE', description: 'Natural rubber forms part of our diverse plantation business.', image: `${basePath}/business/rubber.png`, path: 'rubber/', alt: 'Rubber processing pictured on the official KPL website' },
  { name: 'Other Intercrops', tag: 'MORE FROM THE SAME LAND', description: 'Cashew and areca nut add to the diversity of our coconut estates.', image: photo('photo-1500382017468-9049fed747ef'), path: 'others/', alt: 'Intercrops, illustrative plantation photography' },
];

const ease = [0.22, 1, 0.36, 1] as const;

export default function OurBusiness() {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);
  const [previewOn, setPreviewOn] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const raf = useRef(0);
  const pos = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });

  const place = useCallback((x: number, y: number) => {
    const el = previewRef.current;
    if (el) el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
  }, []);

  const loop = useCallback(() => {
    pos.current.x += (target.current.x - pos.current.x) * 0.14;
    pos.current.y += (target.current.y - pos.current.y) * 0.14;
    place(pos.current.x, pos.current.y);
    raf.current = requestAnimationFrame(loop);
  }, [place]);

  const stopLoop = useCallback(() => {
    cancelAnimationFrame(raf.current);
    raf.current = 0;
  }, []);

  useEffect(() => stopLoop, [stopLoop]);

  const handleMove = (event: React.PointerEvent) => {
    const list = listRef.current;
    if (!list) return;
    const rect = list.getBoundingClientRect();
    target.current = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    if (!previewOn) {
      pos.current = { ...target.current };
      place(pos.current.x, pos.current.y);
      setPreviewOn(true);
    }
    if (reduced) place(target.current.x, target.current.y);
    else if (!raf.current) raf.current = requestAnimationFrame(loop);
  };

  // Keyboard: park the preview beside the focused row.
  const handleFocus = (index: number) => (event: React.FocusEvent<HTMLAnchorElement>) => {
    setActive(index);
    const list = listRef.current;
    if (!list || window.matchMedia('(hover: none)').matches) return;
    const row = event.currentTarget;
    const y = row.offsetTop + row.offsetHeight / 2;
    const x = list.clientWidth * 0.78;
    pos.current = target.current = { x, y };
    place(x, y);
    setPreviewOn(true);
  };

  const hidePreview = () => {
    stopLoop();
    setPreviewOn(false);
  };

  const reveal = (delay = 0) => ({
    initial: reduced ? false as const : { opacity: 0, y: 14 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: reduced ? 0 : 0.5, delay: reduced ? 0 : delay, ease },
  });

  return (
    <section id="business" className={`${styles.section} section`} aria-labelledby="business-heading">
      <div className="wrap">
        <motion.div {...reveal()} className={styles.head}>
          <div>
            <div className={`eyebrow ${styles.eyebrow}`}><span />OUR BUSINESS</div>
            <h2 id="business-heading">One landscape.<br /><em>A world of possibility.</em></h2>
          </div>
          <div className={styles.intro}>
            <span>WHAT WE OFFER</span>
            <p>Coconut at our core. A rich variety of crops around it. Explore the produce and natural materials grown across our estates.</p>
          </div>
        </motion.div>

        {/* Desktop: editorial index with a cursor-following preview. */}
        <div ref={listRef} className={styles.listWrap} onPointerMove={handleMove} onPointerLeave={hidePreview}>
          <div ref={previewRef} className={`${styles.preview} ${previewOn ? styles.previewOn : ''}`} aria-hidden="true">
            {offerings.map((item, index) => (
              <img key={item.name} src={item.image} alt="" loading="lazy" decoding="async" className={index === active ? styles.previewActive : ''} />
            ))}
            <span className={styles.previewBadge}>EXPLORE <ArrowUpRight size={12} /></span>
          </div>
          <div className={styles.list}>
            {offerings.map((item, index) => (
              <motion.a
                key={item.name}
                {...reveal(index * 0.05)}
                href={`${official}${item.path}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.row} ${index === active ? styles.rowActive : ''}`}
                onPointerEnter={() => setActive(index)}
                onFocus={handleFocus(index)}
                onBlur={hidePreview}
                aria-label={`Explore ${item.name} on the official KPL website (opens in a new tab)`}
              >
                <span className={styles.rowInner}>
                  <span className={styles.index}>{String(index + 1).padStart(2, '0')}</span>
                  <span className={styles.titleWrap}>
                    <span className={styles.name}>{item.name}</span>
                    <span className={styles.tag}>{item.tag}</span>
                  </span>
                  <span className={styles.desc}>{item.description}</span>
                  <span className={styles.arrowCircle}><ArrowUpRight size={17} strokeWidth={1.6} /></span>
                </span>
              </motion.a>
            ))}
          </div>
        </div>

        {/* Touch and small screens: image cards. */}
        <div className={styles.cards}>
          {offerings.map((item, index) => (
            <motion.a
              {...reveal((index % 2) * 0.08)}
              key={item.name}
              href={`${official}${item.path}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.card}
              aria-label={`Explore ${item.name} on the official KPL website (opens in a new tab)`}
            >
              <span className={styles.cardImg}>
                <img src={item.image} alt={item.alt} loading="lazy" decoding="async" />
                <span className={styles.cardNum}>{String(index + 1).padStart(2, '0')}</span>
                <span className={styles.cardArrow}><ArrowUpRight size={16} /></span>
              </span>
              <span className={styles.cardCopy}>
                <span className={styles.tag}>{item.tag}</span>
                <span className={styles.cardName}>{item.name}</span>
                <span className={styles.cardDesc}>{item.description}</span>
              </span>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
