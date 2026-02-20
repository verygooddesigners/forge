'use client';

import dynamic from 'next/dynamic';

const PasswordResetHandler = dynamic(
  () => import('./PasswordResetHandler').then((m) => ({ default: m.PasswordResetHandler })),
  { ssr: false }
);

const DynamicToaster = dynamic(
  () => import('sonner').then((m) => ({ default: m.Toaster })),
  { ssr: false }
);

export function ClientInit() {
  return (
    <>
      <PasswordResetHandler />
      <DynamicToaster theme="dark" position="bottom-right" richColors />
    </>
  );
}
