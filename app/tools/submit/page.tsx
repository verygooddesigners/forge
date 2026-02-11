import { Suspense } from 'react';
import { ToolSubmissionClient } from './ToolSubmissionClient';

export const dynamic = 'force-dynamic';

export default function ToolSubmissionPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ToolSubmissionClient />
    </Suspense>
  );
}
