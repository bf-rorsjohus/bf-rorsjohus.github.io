import type { LinkCard } from '../../data/association';
import styles from './Card.module.css';

export function Card({ card }: { card: LinkCard }) {
  return (
    <section className={styles.card} aria-labelledby={`card-${card.heading}`}>
      <h2 id={`card-${card.heading}`} className={styles.heading}>
        {card.heading}
      </h2>
      {card.title ? <p className={styles.title}>{card.title}</p> : null}
      <p>{card.text}</p>
      <a className={styles.button} href={card.href}>
        {card.linkText}
      </a>
    </section>
  );
}
