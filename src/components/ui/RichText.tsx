import styles from './RichText.module.css';

/**
 * Renders HTML that Astro produced from Markdown exported from Google Docs.
 * The Markdown was cleaned in scripts/sync-drive.ts (raw HTML and images removed),
 * so this only adds typography.
 */
export function RichText({ html }: { html: string }) {
  return <div className={styles.prose} dangerouslySetInnerHTML={{ __html: html }} />;
}
