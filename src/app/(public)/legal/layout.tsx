import type { ReactNode } from "react";
import { Container } from "@mui/material";

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {children}
    </Container>
  );
}
