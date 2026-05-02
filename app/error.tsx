'use client';

import { useEffect } from 'react';
import { ErrorPage } from '@/components/ui/ErrorPage';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorPage
      statusCode={500}
      title="Something Went Wrong"
      description="An unexpected error occurred. Our team has been notified."
      onRetry={reset}
    />
  );
}
