import { ClientMoviePage } from './ClientMoviePage';

type MoviePageProps = {
  params: {
    slug: string;
  };
};

export default function MoviePage({ params }: MoviePageProps) {
  return <ClientMoviePage slug={params.slug} />;
}