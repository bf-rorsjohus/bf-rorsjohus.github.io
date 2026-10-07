import type { DriveFile } from '../../lib/drive-index';
import { FILE_SORTS, fileSortHref, type FileSort } from '../../lib/file-sort';
import { FileTable } from '../ui/FileTable';
import { PageIntro } from './PageIntro';
import styles from './DocumentsPage.module.css';

export function DocumentsPage({ files, sort }: { files: DriveFile[]; sort: FileSort }) {
  return (
    <div className="container">
      <PageIntro title="Dokument">
        <p>Föreningens årsredovisningar, stadgar och andra dokument.</p>
      </PageIntro>
      {files.length > 1 ? (
        <nav aria-label="Sortera dokumenten" className={styles.sort}>
          <span className={styles.label}>Sortera:</span>
          <ul>
            {FILE_SORTS.map((s) => (
              <li key={s.key}>
                <a
                  href={fileSortHref(s)}
                  aria-current={s.key === sort.key ? 'page' : undefined}
                  rel="nofollow"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
      <FileTable files={files} caption={`Dokument, sorterade ${sort.caption}`} />
    </div>
  );
}
