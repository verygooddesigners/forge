import { Suspense } from 'react';
import { ToolsMarketplaceClient } from './ToolsMarketplaceClient';

export const dynamic = 'force-dynamic';

export default function ToolsMarketplacePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ToolsMarketplaceClient />
    </Suspense>
  );
}
