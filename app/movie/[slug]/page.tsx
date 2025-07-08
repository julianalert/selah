import { ClientMoviePage } from './ClientMoviePage';

export default function MoviePage({ params }: { params: { slug: string } }) {
  return <ClientMoviePage slug={params.slug} />;
}
