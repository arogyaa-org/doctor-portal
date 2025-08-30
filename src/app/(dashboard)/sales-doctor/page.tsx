import { Suspense } from "react";
import SalesDoctorClient from "./SalesDoctorClient";

// If you never want SSG/ISR for this route, you can opt-in to full dynamic:
// export const dynamic = "force-dynamic";
// or disable ISR:
// export const revalidate = 0;

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
      <SalesDoctorClient />
    </Suspense>
  );
}
