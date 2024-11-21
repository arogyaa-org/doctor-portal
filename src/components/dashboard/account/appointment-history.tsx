import React from "react";
import { Card, CardContent, Stack, Typography, Box } from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

const appointments = [
  {
    patient: "John Smith",
    date: "Nov 12, 2024",
    time: "10:00 AM",
    status: "Completed",
  },
  {
    patient: "Sarah Connor",
    date: "Nov 14, 2024",
    time: "1:00 PM",
    status: "Scheduled",
  },
  {
    patient: "Robert Brown",
    date: "Nov 15, 2024",
    time: "11:00 AM",
    status: "Cancelled",
  },
];

export default function DoctorAppointmentHistory(): React.JSX.Element {
  return (
    <Stack spacing={2}>
      {appointments.map((appointment, index) => (
        <Card
          key={index}
          variant="outlined"
          sx={{
            transition: "transform 0.3s, box-shadow 0.3s",
            "&:hover": {
              boxShadow: 14,
              transform: "scale(1.02)",
            },
          }}
        >
          <CardContent>
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              justifyContent="space-between"
            >
              {/* Icon and Appointment Info */}
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    p: 1,
                    borderRadius: "50%",
                  }}
                >
                  <CalendarMonthIcon color="success" />
                </Box>
                <Box>
                  <Typography variant="h6">{appointment.patient}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Appointment on {appointment.date} • {appointment.time}
                  </Typography>
                </Box>
              </Stack>

              {/* Appointment Status */}
              <Typography
                variant="body1"
                fontWeight="bold"
                sx={{
                  color:
                    appointment.status === "Completed"
                      ? "success.main"
                      : appointment.status === "Scheduled"
                        ? "warning.main"
                        : "error.main",
                }}
              >
                {appointment.status}
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}
