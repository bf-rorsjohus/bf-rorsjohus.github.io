import type { DriveFile } from '../../lib/drive-index';
import { FileTable } from '../ui/FileTable';
import { PageIntro } from './PageIntro';

export function DocumentsPage({ files }: { files: DriveFile[] }) {
  return (
    <div className="container">
      <PageIntro title="Dokument">
        <p>Föreningens årsredovisningar, stadgar och andra dokument. Nyaste först.</p>
      </PageIntro>
      <FileTable files={files} />
    </div>
  );
}
