'use client';

import { useState } from 'react';

import { Layout } from '@/components/auth/layout';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';

// export const metadata = { title: `Reset password | Auth | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  const [clientRole, setClientRole] = useState<string | null>(null);

  return (
    <Layout clientRole={clientRole}>
      <ResetPasswordForm />
    </Layout>
  );
}
