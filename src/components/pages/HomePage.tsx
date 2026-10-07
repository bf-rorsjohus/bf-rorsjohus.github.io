import { association } from '../../data/association';
import type { DrivePage } from '../../lib/drive-index';
import type { ResponsiveImage } from '../../lib/images';
import { ResponsiveImg } from '../ui/ResponsiveImg';
import { RichText } from '../ui/RichText';
import styles from './HomePage.module.css';

export function HomePage({
  welcomeHtml,
  startImage,
  pages,
  documentCount,
}: {
  welcomeHtml: string;
  startImage: ResponsiveImage | null;
  pages: DrivePage[];
  documentCount: number;
}) {
  const links = [
    {
      href: '/bra-att-veta/',
      number: '01',
      title: 'Livet i huset',
      description: 'Praktisk information för en enklare vardag.',
      label: 'Bra att veta',
    },
    {
      href: '/dokument/',
      number: '02',
      title: 'Föreningens dokument',
      description: 'Årsredovisningar, stadgar och andra viktiga handlingar.',
      label: `Visa dokument (${documentCount})`,
    },
    {
      href: '/bilder/',
      number: '03',
      title: 'En närmare titt',
      description: 'Upptäck fastigheten och vår innergård i bilder.',
      label: 'Till bildgalleriet',
    },
  ];
  return (
    <>
      <div className="container">
        <section className={styles.hero} aria-labelledby="welcome">
          <div className={styles.intro}>
            <p className="eyebrow">Ett hem i Rörsjöstaden · Sedan {association.yearBuilt}</p>
            <h1 id="welcome">
              Ett hus med historia.
              <br />
              <em>En plats att kalla hem.</em>
            </h1>
            <p className={styles.lead}>
              Välkommen till BF Rörsjöhus, mitt i hjärtat av {association.district} i{' '}
              {association.city}.
            </p>
            <a className={styles.button} href="#foreningen">
              Lär känna föreningen <span aria-hidden="true">↓</span>
            </a>
          </div>
          {startImage ? (
            <figure className={styles.visual}>
              <div className={styles.imageFrame}>
                <ResponsiveImg image={startImage} className={styles.image} eager />
              </div>
              <figcaption>
                <span>{association.street}</span>
                <span>
                  {association.yearBuilt} · {association.city}
                </span>
              </figcaption>
            </figure>
          ) : (
            <div className={styles.yearMark} aria-hidden="true">
              <span>Anno</span>
              {association.yearBuilt}
              <span>Rörsjöstaden, Malmö</span>
            </div>
          )}
        </section>
        <div className={styles.facts} aria-label="Om fastigheten">
          <p>
            <span>Byggnadsår</span>
            <strong>{association.yearBuilt}</strong>
          </p>
          <p>
            <span>Vår förening</span>
            <strong>{association.apartments} lägenheter</strong>
          </p>
          <p>
            <span>Vårt kvarter</span>
            <strong>{association.district}</strong>
          </p>
          <p>
            <span>Vår adress</span>
            <strong>{association.street}</strong>
          </p>
        </div>
        <section className={styles.welcome} id="foreningen" aria-labelledby="about">
          <div>
            <h2 id="about">
              Sekelskiftescharm.
              <br />
              <em>Omtanke om det gemensamma.</em>
            </h2>
          </div>
          <RichText html={welcomeHtml} />
        </section>
      </div>
      <section className={styles.explore} aria-labelledby="discover">
        <div className="container">
          <div className={styles.sectionHeading}>
            <div>
              <p className="eyebrow">För boende & nyfikna</p>
              <h2 id="discover">Hemma i Rörsjöhus</h2>
            </div>
            <span className={styles.flourish} aria-hidden="true">
              ❧
            </span>
          </div>
          <div className={styles.cards}>
            {links.map((link) => (
              <a className={styles.card} href={link.href} key={link.href}>
                <span className={styles.cardNumber}>{link.number}</span>
                <h3>{link.title}</h3>
                <p>{link.description}</p>
                <span className={styles.cardLink}>
                  {link.label}
                  <span aria-hidden="true">↗</span>
                </span>
              </a>
            ))}
          </div>
          {pages.length > 0 ? (
            <div className={styles.shortcuts}>
              <span>Genvägar</span>
              {pages.map((page) => (
                <a key={page.slug} href={`/bra-att-veta/${page.slug}/`}>
                  {page.title}
                  <span aria-hidden="true"> ↗</span>
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
