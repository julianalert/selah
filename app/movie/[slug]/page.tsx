import { ClientMoviePage } from './ClientMoviePage';

export default function MoviePage({ params }) {
  return <ClientMoviePage slug={params.slug} />;
}
