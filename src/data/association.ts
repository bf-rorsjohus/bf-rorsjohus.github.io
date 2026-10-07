// Fixed facts and the start page's contact cards, copied verbatim from the old SBC site
// (hemsida.sbc.se/bf-rorsjohus-u-p-a, October 2026). The start page's welcome text is NOT here:
// it lives in the Google Doc "Startsida" in the Hemsida folder, so the board can edit it.

export type LinkCard = {
  heading: string;
  title?: string;
  text: string;
  linkText: string;
  href: string;
};

export type Association = {
  name: string;
  orgNumber: string;
  street: string;
  postalCode: string;
  city: string;
  district: string;
  property: string;
  yearBuilt: number;
  apartments: number;
  email: string;
  memberPortal: { label: string; href: string };
  cards: { contact: LinkCard; broker: LinkCard };
};

export const association = {
  name: 'BF Rörsjöhus u p a',
  orgNumber: '746000-2046',
  street: 'Föreningsgatan 43 B',
  postalCode: '211 52',
  city: 'Malmö',
  district: 'Rörsjöstaden',
  property: 'Malmö Judith 7',
  yearBuilt: 1898,
  apartments: 33,
  email: 'bfrorsjohus@gmail.com',
  memberPortal: { label: 'Logga in', href: 'https://hemma.sbc.se/' },
  cards: {
    contact: {
      heading: 'Kontakt',
      title: 'Behöver du hjälp?',
      text: 'Här kan du som medlem skapa ett ärende om du vill kontakta styrelsen eller förvaltaren.',
      linkText: 'Skapa ärende',
      href: 'https://hemma.sbc.se/kundportal/cases',
    },
    broker: {
      heading: 'Mäklare',
      text: 'Vill du som mäklare ta fram mäklarbilder eller få tillgång till digital hantering av medlemskapsansökningar?',
      linkText: 'Till mäklarservice',
      href: 'https://www.sbc.se/kontakt/maklarservice/',
    },
  },
} as const satisfies Association;
