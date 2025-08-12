"use client";

import { useState, Suspense } from "react";
export const dynamic = "force-dynamic";

import Loader from "@/components/common/Loader";
import { Layout } from "@/components/auth/layout";
import { DoctorSignup } from "@/components/auth/doctor-signup-form";

export default function Page(): React.JSX.Element {
  const [clientRole, setClientRole] = useState<string | null>(null);

  return (
    <Suspense fallback={<Loader />}>
      <Layout clientRole={clientRole}>
        <DoctorSignup clientRole={clientRole} setClientRole={setClientRole} />
      </Layout>
    </Suspense>
  );
}
