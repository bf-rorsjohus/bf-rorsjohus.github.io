// Meta description for a "Bra att veta" guide. The Drive summary is the first paragraph of the
// document and is sometimes too short to make a useful search snippet on its own.
const MIN_SUMMARY_LENGTH = 40;
const CONTEXT = 'Bra att veta i BF Rörsjöhus, Föreningsgatan 43 i Malmö';

export function guideDescription(title: string, summary: string): string {
  const text = summary.replace(/\s+/g, ' ').trim();
  if (!text) return `${title}: ${CONTEXT.charAt(0).toLowerCase()}${CONTEXT.slice(1)}.`;
  return text.length < MIN_SUMMARY_LENGTH ? `${CONTEXT}: ${text}` : text;
}
