// Fixed facts about the association, copied verbatim from the old SBC site
// (hemsida.sbc.se/bf-rorsjohus-u-p-a, October 2026). The start page's welcome text is NOT here:
// it lives in a Google Doc in Hemsida/startsida, so the board can edit it.

export type Association = {
  name: string;
  orgNumber: string;
  street: string;
  postalCode: string;
  city: string;
  district: string;
  property: string;
  yearBuilt: number;
  apartments: number; // residential units only, from the latest annual report
  email: string;
  memberPortal: { label: string; href: string };
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
  apartments: 28, // plus 3 commercial units; source: Årsredovisning 2025
  email: 'bfrorsjohus@gmail.com',
  memberPortal: { label: 'Logga in', href: 'https://hemma.sbc.se/' },
} as const satisfies Association;
