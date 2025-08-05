"use client";

import React from "react";
import { Container } from "@mui/material";
import DoctorProfile from "@/components/dashboard/account/account-info";
import SalesProfile from "@/components/dashboard/account/salesProfile/sales-profile";
import { Utility } from "@/utils";

export default function AccountPage(): React.JSX.Element {
  const { decodedToken } = Utility();
  const role = decodedToken()?.role;

  return (
    <Container
      sx={{
        mt: "-100px",
        py: 4,
        maxWidth: "1200px",
      }}
    >
      {role === "doctor" ? <DoctorProfile /> : <SalesProfile />}
    </Container>
  );
}
