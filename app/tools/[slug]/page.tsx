import { Suspense } from 'react';
import { ToolProfileClient } from './ToolProfileClient';

export const dynamic = 'force-dynamic';

export default function ToolProfilePage({ params }: { params: { slug: string } }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ToolProfileClient slug={params.slug} />
    </Suspense>
  );
}
