// Titles, descriptions, canonical URLs and JSON-LD for every page.
import { association } from '../data/association';

export const SITE_URL = 'https://bf-rorsjohus.github.io';
export const SITE_NAME = 'BF Rörsjöhus';

export type Seo = {
  title: string;
  description: string;
  canonical: string | null;
  noindex: boolean;
  jsonLd: object[];
};

/** Indexing is only switched on for the production deploy (INDEXING=true). */
const indexingEnabled = () => process.env.INDEXING === 'true';

export function buildSeo(opts: {
  path: string;
  title: string; // page-specific part; the site name is appended unless isHome
  description: string;
  isHome?: boolean;
  noindex?: boolean;
}): Seo {
  const title = opts.isHome ? opts.title : `${opts.title} – ${SITE_NAME}`;
  const description = clamp(
    opts.description || `${SITE_NAME}, bostadsförening i Rörsjöstaden, Malmö.`,
    155,
  );
  return {
    title,
    description,
    canonical: opts.noindex ? null : new URL(opts.path, SITE_URL).toString(),
    noindex: Boolean(opts.noindex) || !indexingEnabled(),
    jsonLd: opts.isHome ? [organizationJsonLd(), websiteJsonLd()] : [organizationJsonLd()],
  };
}

function clamp(text: string, max: number): string {
  const plain = text.replace(/\s+/g, ' ').trim();
  if (plain.length <= max) return plain;
  const cut = plain.slice(0, max - 1);
  return cut.slice(0, cut.lastIndexOf(' ')).trimEnd() + '…';
}

function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    legalName: association.name,
    url: `${SITE_URL}/`,
    email: association.email,
    identifier: {
      '@type': 'PropertyValue',
      propertyID: 'Organisationsnummer',
      value: association.orgNumber,
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: association.street,
      postalCode: association.postalCode,
      addressLocality: association.city,
      addressCountry: 'SE',
    },
    location: {
      '@type': 'ApartmentComplex',
      name: `${SITE_NAME}, ${association.property}`,
      numberOfAccommodationUnits: association.apartments,
      address: {
        '@type': 'PostalAddress',
        streetAddress: association.street,
        postalCode: association.postalCode,
        addressLocality: association.city,
        addressCountry: 'SE',
      },
    },
  };
}

function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    inLanguage: 'sv',
    publisher: { '@id': `${SITE_URL}/#organization` },
  };
}
