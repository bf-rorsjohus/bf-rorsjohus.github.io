import type { DriveFile } from '../../lib/drive-index';
import { fileYear } from '../../lib/file-sort';
import { fileTypeLabel, formatFileSize } from '../../lib/format';
import styles from './FileTable.module.css';

export function FileTable({ files, caption }: { files: DriveFile[]; caption: string }) {
  if (files.length === 0) return <p>Det finns inga dokument just nu.</p>;
  return (
    <table className={styles.table}>
      <caption className="visually-hidden">{caption}</caption>
      <thead>
        <tr>
          <th scope="col">Dokument</th>
          <th scope="col">År</th>
          <th scope="col">Typ</th>
          <th scope="col">Storlek</th>
        </tr>
      </thead>
      <tbody>
        {files.map((file) => {
          const type = fileTypeLabel(file.ext);
          const size = formatFileSize(file.size);
          return (
            <tr key={file.slug}>
              <th scope="row" className={styles.name}>
                <a href={file.url}>
                  {file.title}
                  <span className="visually-hidden">
                    {' '}
                    ({type}, {size})
                  </span>
                </a>
              </th>
              <td data-label="År">{fileYear(file)}</td>
              <td data-label="Typ">{type}</td>
              <td data-label="Storlek">{size}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
