"use client";

export const dynamic = "force-dynamic";
import { useState } from "react";
import { Layout } from "@/components/auth/layout";
import { DoctorSignup } from "@/components/auth/doctor-signup-form";

export default function Page(): React.JSX.Element {
  const [clientRole, setClientRole] = useState<string | null>(null);

  return (
    <Layout clientRole={clientRole}>
      <DoctorSignup clientRole={clientRole} setClientRole={setClientRole} />
    </Layout>
  );
}
