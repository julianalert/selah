import { ClientMoviePage } from './ClientMoviePage';

export default function MoviePage(props: Record<string, any>) {
  return <ClientMoviePage slug={props.params.slug} />;
}
