import { ClientMoviePage } from './ClientMoviePage';

// No TypeScript type for PageProps!
export default function MoviePage({ params }: { params: { slug: string } }) {
  return <ClientMoviePage slug={params.slug} />;
}
