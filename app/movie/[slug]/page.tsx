import { ClientMoviePage } from './ClientMoviePage';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function MoviePage({ params }: { params: any }) {
  return <ClientMoviePage slug={params.slug} />;
}