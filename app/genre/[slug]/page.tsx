import { ClientGenrePage } from './ClientGenrePage';

export default function GenrePage(props: any) {
  return <ClientGenrePage slug={props.params.slug} />;
}

