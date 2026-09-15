'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Sprout } from 'lucide-react';
import styles from './OurBusiness.module.css';

const official = 'https://kurunegalaplantations.lk/index.php/';
const photo = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=85`;
// Concise summaries of KPL's official What We Offer pages. Photos are illustrative.
const offerings = [
  { name: 'Spices', label: 'AROMATIC BY NATURE', description: 'Cinnamon, nutmeg and pepper, cultivated alongside coconut.', image: photo('photo-1506368249639-73a05d6f6488'), path: 'spices-2/' },
  { name: 'Fruits', label: 'TROPICAL ABUNDANCE', description: 'From TJC mango and rambutan to dragon fruit, durian and guava.', image: photo('photo-1619566636858-adf3ef46400b'), path: 'fruits-2/' },
  { name: 'Coffee', label: 'NORMANDY JUNGLE COFFEE', description: 'Coffee with roots in Wijayapura, on the Rantatikanda mountain range.', image: photo('photo-1447933601403-0c6688de566e'), path: 'coffee/' },
  { name: 'Rubber', label: 'A NATURAL RESOURCE', description: 'Natural rubber forms part of our diverse plantation business.', image: '/business/rubber.png', path: 'rubber/' },
];
const ease = [0.22, 1, 0.36, 1] as const;

export default function OurBusiness() {
  const reduced = useReducedMotion();
  const reveal = (delay = 0) => ({
    initial: reduced ? false as const : { opacity: 0, y: 12 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.12 },
    transition: { duration: reduced ? 0 : 0.48, delay: reduced ? 0 : delay, ease },
  });
  return (
    <section id="business" className={`${styles.section} section`} aria-labelledby="business-heading">
      <div className="wrap">
        <motion.div {...reveal()} className={styles.heading}>
          <div><div className="eyebrow"><span />OUR BUSINESS</div><h2 id="business-heading">One landscape.<br /><em>A world of possibility.</em></h2></div>
          <div className={styles.intro}><span>WHAT WE OFFER</span><p>Coconut at our core. A rich variety of crops around it. Explore the produce and natural materials grown across our estates.</p></div>
        </motion.div>
        <div className={styles.grid}>
          <motion.a {...reveal()} href={`${official}coconut/`} target="_blank" rel="noopener noreferrer" className={styles.feature} aria-label="Explore coconut products on the official KPL website (opens in a new tab)">
            <img src="/hero-sequence-v6/16-mobile.webp?v=6" alt="Coconuts growing on a palm, illustrative plantation image" loading="lazy" />
            <span className={styles.featureTop}><span>01 / OUR CORE BUSINESS</span><ArrowUpRight size={22} /></span>
            <div className={styles.featureCopy}><span>COCONUT BASED FARMING SYSTEM</span><h3>Coconut.<br /><em>So much more<br />than a crop.</em></h3><p>Fresh coconuts, oil, copra and seedlings, alongside husk and shell products.</p><div className={styles.featureLink}>Explore coconut products <ArrowUpRight size={18} /></div></div>
          </motion.a>
          {offerings.map((item, index) => (
            <motion.a {...reveal((index % 2 + 1) * 0.07)} key={item.name} href={`${official}${item.path}`} target="_blank" rel="noopener noreferrer" className={styles.card} aria-label={`Explore ${item.name} on the official KPL website (opens in a new tab)`}>
              <div className={styles.image}><img src={item.image} alt={item.name === 'Rubber' ? 'Rubber processing pictured on the official KPL website' : `${item.name}, illustrative produce photography`} loading="lazy" /><span>0{index + 2}</span><span className={styles.arrow}><ArrowUpRight size={20} /></span></div>
              <div className={styles.cardCopy}><span>{item.label}</span><h3>{item.name}</h3><p>{item.description}</p></div>
            </motion.a>
          ))}
        </div>
        <motion.a {...reveal()} className={styles.intercrops} href={`${official}others/`} target="_blank" rel="noopener noreferrer" aria-label="Explore other intercrops on the official KPL website (opens in a new tab)">
          <div className={styles.intercropTitle}><Sprout size={30} strokeWidth={1.2} /><div><span>06 / OTHER INTERCROPS</span><h3>More from the same land.</h3></div></div><p>Cashew and areca nut add to the diversity of our coconut estates.</p><span className={styles.intercropLink}>Discover more <ArrowUpRight size={20} /></span>
        </motion.a>
      </div>
    </section>
  );
}
