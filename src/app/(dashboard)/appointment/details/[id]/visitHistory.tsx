"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Alert,
  Box,
  Chip,
  alpha,
  Button,
} from "@mui/material";
import { format } from "date-fns";
import {
  EventAvailable as AppointmentIcon,
  CalendarMonth,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";

import AppointmentModal from "@/components/common/AppointmentDetails";
import { Utility } from "@/utils";
import { fetcher } from "@/apis/apiClient";

interface Appointment {
  _id: string;
  patientId: string;
  doctorId: string;
  appointmentTime: string;
  status: string;
}

interface VisitsHistoryProps {
  patientId: string;
  onTabChange: (tabKey: string) => void;
}

const VisitsHistory: React.FC<VisitsHistoryProps> = ({
  patientId,
  onTabChange,
}) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const { decodedToken } = Utility();
  const doctorId = decodedToken()?.id;

  const fetchAppointments = React.useCallback(async () => {
    if (patientId) {
      try {
        const response = await fetcher(
          "appointment",
          `get-doctor-patient-appointments/${patientId}/${doctorId}`
        );
        const results = response?.results || [];
        const count = response?.count || 0;
        setAppointments(results);
        setTotalCount(count);
        setError(null);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        setError(error instanceof Error ? error.message : String(error));
        setAppointments([]);
        setTotalCount(0);
      }
    }
  }, [patientId, page, rowsPerPage]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatTimeToIST = (time: string) => {
    const timeParts = time.split(":");

    if (timeParts.length === 2) {
      const date = new Date();
      date.setHours(parseInt(timeParts[0], 10));
      date.setMinutes(parseInt(timeParts[1], 10));

      return new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata", 
        hour: "2-digit",
        minute: "2-digit",
        hour12: true, 
      }).format(date);
    } else {
      return "Invalid time"; 
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "success";
      case "pending":
        return "warning";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const paginatedAppointments = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return appointments.slice(startIndex, startIndex + rowsPerPage);
  }, [appointments, page, rowsPerPage]);

  const handleOpenModal = (appointment: any) => {
    setSelectedAppointment(appointment);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  return (
    <Container maxWidth="lg">
      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 2,
            borderRadius: 2,
          }}
        >
          {error}
        </Alert>
      )}

      <TableContainer
        component={Paper}
        sx={{
          boxShadow: 3,
          borderRadius: 2,
        }}
      >
        <Table>
          <TableHead
            sx={{
              backgroundColor: (theme) =>
                alpha(theme.palette.primary.main, 0.05),
            }}
          >
            <TableRow>
              {["Date", "Time", "Status", "Action"].map((header) => (
                <TableCell
                  key={header}
                  sx={{
                    fontWeight: 600,
                    textTransform: "uppercase",
                    color: "text.secondary",
                    textAlign: "center",
                  }}
                >
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedAppointments.length > 0 ? (
              paginatedAppointments.map((appointment) => (
                <TableRow
                  key={appointment._id}
                  hover
                  sx={{
                    "&:last-child td, &:last-child th": {
                      borderBottom: "1px solid #ddd",
                    },
                    transition: "background-color 0.2s",
                    textAlign: "center",
                  }}
                >
                  <TableCell sx={{ textAlign: "center" }}>
                    {appointment?.appointmentDate
                      ? format(
                          new Date(appointment.appointmentDate),
                          "dd MMM yyyy"
                        )
                      : "N/A"}
                  </TableCell>
                  <TableCell sx={{ textAlign: "center" }}>
                    {appointment?.appointmentTime
                      ? formatTimeToIST(appointment.appointmentTime)
                      : "N/A"}
                  </TableCell>
                  <TableCell sx={{ textAlign: "center" }}>
                    <Chip
                      icon={<AppointmentIcon />}
                      label={appointment?.status || "N/A"}
                      color={getStatusColor(appointment?.status)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell sx={{ textAlign: "center" }}>
                    <Button
                      color="info"
                      variant="contained"
                      onClick={() => handleOpenModal(appointment)}
                      sx={{
                        minWidth: "50px",
                        background:
                          "linear-gradient(45deg, #2196F3 30%, #1976D2 90%)",
                      }}
                    >
                      <VisibilityIcon />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: 0.5,

                      borderRadius: "8px",

                      color: "#20ADA0",
                    }}
                  >
                    <CalendarMonth sx={{ fontSize: 18, color: "#20ADA0" }} />
                    No Appointment Booked
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            "& .MuiTablePagination-selectLabel, & .MuiTablePagination-select": {
              fontWeight: 500,
            },
          }}
        />
      </TableContainer>
      {selectedAppointment && (
        <AppointmentModal
          open={openModal}
          onClose={handleCloseModal}
          appointment={selectedAppointment}
          patientId={selectedAppointment.patientId}
          onTabChange={onTabChange}
          formatTimeToIST={formatTimeToIST}
        />
      )}
    </Container>
  );
};

export default VisitsHistory;
