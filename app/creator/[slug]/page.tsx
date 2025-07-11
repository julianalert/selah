import { ClientCreatorPage } from './ClientCreatorPage';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function CreatorPage({ params }: { params: any }) {
  return <ClientCreatorPage slug={params.slug} />;
} 