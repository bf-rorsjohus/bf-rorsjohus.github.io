import { PageIntro } from './PageIntro';

export function NotFoundPage() {
  return (
    <div className="container">
      <PageIntro title="Sidan finns inte">
        <p>
          Sidan du letar efter finns inte, eller har flyttats. Gå till <a href="/">startsidan</a>{' '}
          eller titta bland <a href="/dokument/">dokumenten</a>.
        </p>
      </PageIntro>
    </div>
  );
}
