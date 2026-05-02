import { ErrorPage } from '@/components/ui/ErrorPage';

export const metadata = {
  title: 'Page Not Found - LinkShrink',
};

export default function NotFound() {
  return (
    <ErrorPage
      statusCode={404}
      title="Page Not Found"
      description="The page you're looking for doesn't exist or has been moved."
    />
  );
}
