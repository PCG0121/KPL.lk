'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Sprout } from 'lucide-react';
import styles from './OurBusiness.module.css';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
const official = 'https://kurunegalaplantations.lk/index.php/';
const photo = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=85`;

// Concise summaries of KPL's official What We Offer pages. Photos are illustrative.
const feature = {
  name: 'Coconut',
  tag: 'OUR CORE BUSINESS · COCONUT BASED FARMING SYSTEM',
  description: 'Fresh coconuts, oil, copra and seedlings, alongside husk and shell products.',
  image: `${basePath}/hero-sequence-v6/16-mobile.webp?v=6`,
  path: 'coconut/',
  alt: 'Coconuts growing on a palm, illustrative plantation image',
};

const cards = [
  { name: 'Spices', tag: 'AROMATIC BY NATURE', description: 'Cinnamon, nutmeg and pepper, cultivated alongside coconut.', image: photo('photo-1506368249639-73a05d6f6488'), path: 'spices-2/', alt: 'Spices, illustrative produce photography' },
  { name: 'Fruits', tag: 'TROPICAL ABUNDANCE', description: 'From TJC mango and rambutan to dragon fruit, durian and guava.', image: photo('photo-1619566636858-adf3ef46400b'), path: 'fruits-2/', alt: 'Tropical fruits, illustrative produce photography' },
  { name: 'Coffee', tag: 'NORMANDY JUNGLE COFFEE', description: 'Coffee with roots in Wijayapura, on the Rantatikanda mountain range.', image: photo('photo-1447933601403-0c6688de566e'), path: 'coffee/', alt: 'Coffee, illustrative produce photography' },
  { name: 'Rubber', tag: 'A NATURAL RESOURCE', description: 'Natural rubber forms part of our diverse plantation business.', image: `${basePath}/business/rubber.png`, path: 'rubber/', alt: 'Rubber processing pictured on the official KPL website' },
];

const wide = {
  name: 'Other Intercrops',
  description: 'Cashew and areca nut add to the diversity of our coconut estates.',
  image: photo('photo-1500382017468-9049fed747ef'),
  path: 'others/',
  alt: 'Intercrops, illustrative plantation photography',
};

const ease = [0.22, 1, 0.36, 1] as const;
const total = String(cards.length + 2).padStart(2, '0');

export default function OurBusiness() {
  const reduced = useReducedMotion();
  const reveal = (delay = 0) => ({
    initial: reduced ? false as const : { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.15 },
    transition: { duration: reduced ? 0 : 0.55, delay: reduced ? 0 : delay, ease },
  });
  const link = (item: { name: string; path: string }) => ({
    href: `${official}${item.path}`,
    target: '_blank' as const,
    rel: 'noopener noreferrer',
    'aria-label': `Explore ${item.name} on the official KPL website (opens in a new tab)`,
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
            <span className={styles.chip}>{total} CROP CATEGORIES</span>
            <p>Coconut at our core. A rich variety of crops around it. Explore the produce and natural materials grown across our estates.</p>
          </div>
        </motion.div>
        <div className={styles.bento}>
          <motion.a {...reveal()} {...link(feature)} className={`${styles.tile} ${styles.featureTile}`}>
            <img src={feature.image} alt={feature.alt} loading="lazy" decoding="async" />
            <span className={styles.shade} aria-hidden="true" />
            <span className={styles.index}>01</span>
            <span className={styles.featureBody}>
              <span className={styles.tag}>{feature.tag}</span>
              <span className={styles.featureTitle}>Coconut.<em>So much more than a crop.</em></span>
              <span className={styles.featureDesc}>{feature.description}</span>
              <span className={styles.cta}>Explore coconut products <ArrowUpRight size={17} /></span>
            </span>
          </motion.a>

          {cards.map((item, position) => (
            <motion.a key={item.name} {...reveal(0.05 * (position + 1))} {...link(item)} className={`${styles.tile} ${styles.card}`}>
              <span className={styles.cardMedia}>
                <img src={item.image} alt={item.alt} loading="lazy" decoding="async" />
                <span className={styles.index}>{String(position + 2).padStart(2, '0')}</span>
              </span>
              <span className={styles.cardBody}>
                <span className={styles.tag}>{item.tag}</span>
                <span className={styles.cardTitle}>{item.name}</span>
                <span className={styles.cardDesc}>{item.description}</span>
                <span className={styles.cardArrow}><ArrowUpRight size={16} strokeWidth={1.7} /></span>
              </span>
            </motion.a>
          ))}

          <motion.a {...reveal(0.05)} {...link(wide)} className={`${styles.tile} ${styles.wideTile}`}>
            <img src={wide.image} alt={wide.alt} loading="lazy" decoding="async" />
            <span className={styles.shade} aria-hidden="true" />
            <span className={styles.index}>{total}</span>
            <span className={styles.wideBody}>
              <span className={styles.tag}>MORE FROM THE SAME LAND</span>
              <span className={styles.wideTitle}>Other Intercrops</span>
              <span className={styles.featureDesc}>{wide.description}</span>
            </span>
            <span className={`${styles.cta} ${styles.wideCta}`}><Sprout size={20} strokeWidth={1.3} /><span>Discover more</span><ArrowUpRight size={17} /></span>
          </motion.a>
        </div>
      </div>
    </section>
  );
}
