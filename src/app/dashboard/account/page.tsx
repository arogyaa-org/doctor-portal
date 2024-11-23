"use client"

import React, { useState } from "react";
import { Box, Tabs, Tab, Container } from "@mui/material";
import AccountInfo from "@/components/dashboard/account/account-info";
import TabPanel from "@/components/dashboard/account/tab-panel";
import DoctorAppointmentHistory from "@/components/dashboard/account/appointment-history";
import DoctorRatingsAndReviews from "@/components/dashboard/account/d-rating-reviews";

export default function AccountPage(): React.JSX.Element {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container sx={{ py: 0 }}>
      <AccountInfo />
      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          centered
          TabIndicatorProps={{
            sx: {
              height: 3,
              bgcolor: "primary.main", 
            },
          }}
        >
          {/* Customized Tab Button */}
          <Tab
            label="Appointment History"
            sx={{
              transition: "transform 0.3s, box-shadow 0.3s",
              "&:hover": {
                boxShadow: 2,
                transform: "scale(1.05)",
              },
            }}
          />
          <Tab
            label="Reviews"
            sx={{
              transition: "transform 0.3s, box-shadow 0.3s",
              "&:hover": {
                boxShadow: 2,
                transform: "scale(1.05)",
              },
            }}
          />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        <DoctorAppointmentHistory />
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <DoctorRatingsAndReviews />
      </TabPanel>
    </Container>
  );
}
