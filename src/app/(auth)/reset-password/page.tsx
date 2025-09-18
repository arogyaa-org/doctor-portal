'use client';

import { useState } from 'react';
import { Suspense } from 'react';             // <-- add this
import { Layout } from '@/components/auth/layout';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';

export default function Page(): React.JSX.Element {
  const [clientRole, setClientRole] = useState<string | null>(null);

  return (
    <Layout clientRole={clientRole}>
      <Suspense fallback={<div style={{padding:16}}>Loading…</div>}>
        <ResetPasswordForm />
      </Suspense>
    </Layout>
  );
}
