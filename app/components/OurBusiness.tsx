'use client';

import { useCallback, useEffect, useRef, useState, type TouchEvent } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './OurBusiness.module.css';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
const official = 'https://kurunegalaplantations.lk/index.php/';
const photo = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=85`;

type BusinessItem = {
  tag: string;
  title: string;
  subtitle?: string;
  description: string;
  image: string;
  path: string;
  alt: string;
};

const items: BusinessItem[] = [
  {
    tag: '#CoreBusiness',
    title: 'COCONUT',
    subtitle: '– FARMING SYSTEM',
    description: 'Fresh coconuts, oil, copra and seedlings, alongside husk and shell products.',
    image: `${basePath}/hero-sequence-v6/16-mobile.webp?v=6`,
    path: 'coconut/',
    alt: 'Coconut plantation, illustrative image',
  },
  {
    tag: '#AromaticByNature',
    title: 'SPICES',
    subtitle: '– ISLAND AROMA',
    description: 'Cinnamon, nutmeg and pepper, cultivated alongside coconut.',
    image: photo('photo-1506368249639-73a05d6f6488'),
    path: 'spices-2/',
    alt: 'Sri Lankan spices, illustrative image',
  },
  {
    tag: '#TropicalAbundance',
    title: 'FRUITS',
    subtitle: '– TROPICAL HARVEST',
    description: 'TJC mango, rambutan, dragon fruit, durian and guava from fertile estates.',
    image: photo('photo-1619566636858-adf3ef46400b'),
    path: 'fruits-2/',
    alt: 'Tropical fruits, illustrative image',
  },
  {
    tag: '#NormandyJungle',
    title: 'COFFEE',
    subtitle: '– MOUNTAIN GROWN',
    description: 'Coffee with roots in Wijayapura, on the Rantatikanda mountain range.',
    image: photo('photo-1447933601403-0c6688de566e'),
    path: 'coffee/',
    alt: 'Coffee beans, illustrative image',
  },
  {
    tag: '#NaturalResource',
    title: 'RUBBER',
    subtitle: '– RESPONSIBLY GROWN',
    description: 'Natural rubber forms part of our diverse plantation business.',
    image: `${basePath}/business/rubber.png`,
    path: 'rubber/',
    alt: 'Rubber processing, illustrative image',
  },
  {
    tag: '#Intercropping',
    title: 'OTHER CROPS',
    subtitle: '– SAME LAND',
    description: 'Cashew and areca nut add to the diversity of our coconut estates.',
    image: photo('photo-1500382017468-9049fed747ef'),
    path: 'others/',
    alt: 'Intercropped plantation, illustrative image',
  },
];

export default function OurBusiness() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const total = items.length;

  const next = useCallback(() => setCurrentIndex(index => (index + 1) % total), [total]);
  const previous = useCallback(() => setCurrentIndex(index => (index - 1 + total) % total), [total]);

  useEffect(() => {
    if (paused) return;
    const interval = window.setInterval(next, 5000);
    return () => window.clearInterval(interval);
  }, [next, paused]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') previous();
      if (event.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [next, previous]);

  const handleTouchStart = (event: TouchEvent<HTMLElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLElement>) => {
    if (touchStartX.current === null) return;
    const distance = event.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(distance) > 45) distance < 0 ? next() : previous();
  };

  const getOffset = (index: number) => (index - currentIndex + total) % total;

  return (
    <section
      id="business"
      className={`${styles.section} section`}
      aria-labelledby="business-heading"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className={styles.ambient} aria-hidden="true">
        <img src={items[currentIndex].image} alt="" />
      </div>
      <div className={styles.overlay} aria-hidden="true" />
      <div className={styles.content}>
        <div className={`${styles.heading} reveal`}>
          <div>
            <div className={`eyebrow ${styles.eyebrow}`}><span />OUR BUSINESS</div>
            <h2 id="business-heading">One landscape.<br /><em>A world of possibility.</em></h2>
          </div>
          <p>Coconut at our core. A rich variety of crops around it.</p>
        </div>

        <div className={styles.stage} aria-live="polite">
          {items.map((item, index) => {
            const offset = getOffset(index);
            const center = offset === 0;
            const visible = offset <= 2 || offset >= total - 2;
            return (
              <article
                key={item.title}
                className={`${styles.card} ${center ? styles.center : ''} ${visible ? styles.visible : ''}`}
                data-offset={offset}
                onClick={() => !center && setCurrentIndex(index)}
                aria-hidden={!center}
              >
                <img src={item.image} alt={item.alt} />
                <span className={styles.cardShade} aria-hidden="true" />
                <div className={styles.cardContent}>
                  <span className={styles.tag}>{item.tag}</span>
                  <div className={styles.cardBody}>
                    <h3>{item.title}</h3>
                    {item.subtitle && <strong>{item.subtitle}</strong>}
                    <span className={styles.rule} />
                    <p>{item.description}</p>
                    <a
                      href={`${official}${item.path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      tabIndex={center ? 0 : -1}
                      aria-label={`Explore ${item.title.toLowerCase()} on the official KPL website`}
                    >
                      Explore {item.title.toLowerCase()} <ArrowRight size={14} />
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
          <button className={`${styles.arrow} ${styles.previous}`} onClick={previous} aria-label="Previous business category">
            <ChevronLeft size={20} />
          </button>
          <button className={`${styles.arrow} ${styles.next}`} onClick={next} aria-label="Next business category">
            <ChevronRight size={20} />
          </button>
        </div>

        <div className={styles.pagination} aria-label="Business categories">
          {items.map((item, index) => (
            <button
              key={item.title}
              className={index === currentIndex ? styles.activeDot : ''}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Show ${item.title.toLowerCase()}`}
              aria-current={index === currentIndex ? 'true' : undefined}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
