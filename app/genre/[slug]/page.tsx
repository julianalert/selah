import { ClientGenrePage } from './ClientGenrePage';

export default function GenrePage({ params }) {
  return <ClientGenrePage slug={params.slug} />;
}
