import { ClientGenrePage } from './ClientGenrePage';

export default function GenrePage(props: Record<string, any>) {
  return <ClientGenrePage slug={props.params.slug} />;
}
