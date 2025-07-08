import { ClientGenrePage } from './ClientGenrePage';

type GenrePageProps = {
  params: {
    slug: string;
  };
};

export default function GenrePage({ params }: GenrePageProps) {
  return <ClientGenrePage slug={params.slug} />;
}
