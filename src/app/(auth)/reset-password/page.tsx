'use client';

import { useState } from 'react';

import { Layout } from '@/components/auth/layout';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';

export default function Page(): React.JSX.Element {
  const [clientRole, setClientRole] = useState<string | null>(null);

  return (
    <Layout clientRole={clientRole}>
      {/* The form itself detects whether it's a Request or Confirm flow */}
      <ResetPasswordForm />
    </Layout>
  );
}
