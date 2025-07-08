import { ClientGenrePage } from './ClientGenrePage';

export default function GenrePage({ params }: { params: { slug: string } }) {
  return <ClientGenrePage slug={params.slug} />;
}
