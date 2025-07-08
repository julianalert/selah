import { ClientMoviePage } from './ClientMoviePage';

export default function MoviePage(props: any) {
  return <ClientMoviePage slug={props.params.slug} />;
}
