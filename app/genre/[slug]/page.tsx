import { ClientGenrePage } from './ClientGenrePage';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function GenrePage({ params }: { params: any }) {
  return <ClientGenrePage slug={params.slug} />;
}