import { ClientGenrePage } from './ClientGenrePage';

type LocalProps = {
  params: {
    slug: string;
  };
};

export default function GenrePage({ params }: LocalProps) {
  return <ClientGenrePage slug={params.slug} />;
}
