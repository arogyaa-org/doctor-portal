"use client";

import React from "react";
import { Container } from "@mui/material";
import DoctorProfile from "@/components/dashboard/account/account-info";

export default function AccountPage(): React.JSX.Element {
  return (
    <Container
      sx={{
        mt:"-100px",
        py: 4,
        maxWidth: "1200px",
      }}
    >
      <DoctorProfile />
    </Container>
  );
}
