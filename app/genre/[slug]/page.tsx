import { ClientGenrePage } from './ClientGenrePage';

// No TypeScript type — keep it raw, it just works
export default function GenrePage({ params }: { params: { slug: string } }) {
  return <ClientGenrePage slug={params.slug} />;
}
