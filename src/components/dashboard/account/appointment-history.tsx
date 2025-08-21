"use client";

import React from "react";
import {
  Card,
  CardContent,
  Stack,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { useGetAppointment } from "@/hooks/appointment";
import { Utility } from "@/utils";

type AnyObj = Record<string, any>;

export default function DoctorAppointmentHistory(): React.JSX.Element {
  const { decodedToken } = Utility();
  const { id: doctorId } = ((decodedToken?.() as AnyObj) || {}) as {
    id?: string;
  };

  const safeDoctorId = doctorId ?? "placeholder";
  const pathKey = `/get-doctors-appointment/${safeDoctorId}`;

  const { value, swrLoading, error } = useGetAppointment(
    null,
    pathKey,
    undefined,
    1,
    10
  );

  const all = (value?.results as AnyObj[]) ?? [];

  // ---- helpers ----
  const getPatientName = (patientData: any[]) =>
    patientData?.length ? patientData[0].username : "Unknown Patient";

  const getSymptoms = (symptomData: any[]) =>
    symptomData?.length
      ? symptomData.map((s) => s.name).join(", ")
      : "No symptoms listed";

  const getDisplayDate = (date: any) => {
    if (!date) return "N/A";
    try {
      const d = new Date(date);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return String(date);
    }
  };

  const statusColor = (status?: string) => {
    switch ((status || "").toLowerCase()) {
      case "completed":
        return "success.main";
      case "scheduled":
      case "rescheduled":
      case "pending":
        return "warning.main";
      case "rejected":
      default:
        return "error.main";
    }
  };

  const parseTime = (timeStr?: string) => {
    if (!timeStr) return { h: 0, m: 0 };
    const m = timeStr.trim().match(/^(\d{1,2}):?(\d{2})?\s*(AM|PM)$/i);
    if (!m) return { h: 0, m: 0 };
    let h = parseInt(m[1], 10);
    const mins = parseInt(m[2] ?? "0", 10);
    const ampm = m[3].toUpperCase();
    if (ampm === "PM" && h !== 12) h += 12;
    if (ampm === "AM" && h === 12) h = 0;
    return { h, m: mins };
  };

  const toDateTime = (a: AnyObj) => {
    if (a.appointmentDateTime) return new Date(a.appointmentDateTime);
    const base = new Date(a.appointmentDate);
    if (isNaN(base.getTime())) return new Date(0);
    const { h, m } = parseTime(a.appointmentTime);
    const dt = new Date(base);
    dt.setHours(h, m, 0, 0);
    return dt;
  };

  const now = new Date();
  const appointments = all
    .filter((a) => toDateTime(a).getTime() < now.getTime())
    .sort((a, b) => toDateTime(b).getTime() - toDateTime(a).getTime());

  // ---- UI states ----
  if (!doctorId) {
    return (
      <Stack alignItems="center" spacing={1} py={6}>
        <Typography variant="h6">No doctor session found</Typography>
        <Typography variant="body2" color="text.secondary">
          Please sign in again or check your token payload.
        </Typography>
      </Stack>
    );
  }

  if (swrLoading) {
    return (
      <Stack alignItems="center" justifyContent="center" height="300px">
        <CircularProgress />
        <Typography mt={2}>Loading appointments...</Typography>
      </Stack>
    );
  }

  if (error) {
    return (
      <Typography color="error">
        Failed to load appointments. Please try again later.
      </Typography>
    );
  }

  // ---- Cards (responsive) ----
  return (
    <Stack spacing={{ xs: 1.5, sm: 2 }}>
      {appointments.length === 0 ? (
        <Typography>No past appointments found.</Typography>
      ) : (
        appointments.map((appointment) => (
          <Card
            key={appointment._id}
            variant="outlined"
            sx={{
              borderRadius: { xs: 2, sm: 3 },
              transition: "transform 0.3s, box-shadow 0.3s",
              "&:hover": {
                boxShadow: { xs: 6, sm: 14 },
                transform: { sm: "scale(1.02)" },
              },
            }}
          >
            <CardContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={{ xs: 1.25, sm: 2 }}
                alignItems={{ xs: "flex-start", sm: "center" }}
                justifyContent="space-between"
              >
                {/* Left: Icon + Info */}
                <Stack
                  direction="row"
                  spacing={{ xs: 1.25, sm: 2 }}
                  alignItems="center"
                  flex={1}
                  sx={{ width: "100%" }}
                >
                  <Box
                    sx={{
                      p: { xs: 0.75, sm: 1 },
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <CalendarMonthIcon
                      sx={{ fontSize: { xs: 22, sm: 26 } }}
                      color="success"
                    />
                  </Box>

                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontSize: { xs: 15.5, sm: 18 },
                        fontWeight: 600,
                        lineHeight: 1.2,
                        mb: { xs: 0.25, sm: 0.4 },
                      }}
                    >
                      {getPatientName(appointment.patientData)}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: { xs: 12.5, sm: 14 } }}
                    >
                      Appointment on{" "}
                      {getDisplayDate(appointment.appointmentDate)} •{" "}
                      {appointment.appointmentTime}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        fontSize: { xs: 12.5, sm: 14 },
                        mt: { xs: 0.25, sm: 0.3 },
                      }}
                    >
                      Symptoms: {getSymptoms(appointment.symptomData)}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        fontSize: { xs: 12.5, sm: 14 },
                        mt: { xs: 0.25, sm: 0.3 },
                      }}
                    >
                      Type: {appointment.appointmentType} | Payment:{" "}
                      {appointment.paymentStatus}
                    </Typography>
                  </Box>
                </Stack>

                {/* Right: Status — centered & consistent */}
                <Box
                  sx={{
                    width: { xs: "100%", sm: "auto" },
                    minWidth: { sm: 140 },
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    mt: { xs: 1, sm: 0 },
                  }}
                >
                  <Typography
                    variant="body1"
                    fontWeight="bold"
                    sx={{
                      textTransform: "capitalize",
                      color: statusColor(appointment.status),
                      textAlign: "center",
                      fontSize: { xs: 13.5, sm: 15 },
                      py: { xs: 0.25, sm: 0.3 },
                      px: { xs: 1, sm: 1.25 },
                    }}
                  >
                    {appointment.status}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        ))
      )}
    </Stack>
  );
}
