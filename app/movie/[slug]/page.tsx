import { ClientMoviePage } from './ClientMoviePage';

type LocalProps = {
  params: {
    slug: string;
  };
};

export default function MoviePage({ params }: LocalProps) {
  return <ClientMoviePage slug={params.slug} />;
}
