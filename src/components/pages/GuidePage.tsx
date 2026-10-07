import { RichText } from '../ui/RichText';
import { PageIntro } from './PageIntro';

export function GuidePage({ title, html }: { title: string; html: string }) {
  return (
    <div className="container">
      <PageIntro title={title} back={{ href: '/bra-att-veta/', label: 'Bra att veta' }} />
      <RichText html={html} />
    </div>
  );
}
