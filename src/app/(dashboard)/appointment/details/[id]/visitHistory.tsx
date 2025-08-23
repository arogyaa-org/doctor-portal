"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  Divider,
  IconButton,
  Modal,
  Collapse,
  Chip,
  List,
  ListItem,
  ListItemText,
  useTheme,
  useMediaQuery,
  TablePagination,
  Card,
  CardContent,
  Stack,
  Grid,
  Skeleton,
  Avatar,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  EventAvailable as AppointmentIcon,
  CalendarMonth,
  Visibility as VisibilityIcon,
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import AppointmentModal from "@/components/common/AppointmentDetails";
import { Utility } from "@/utils";
import { fetcher } from "@/apis/apiClient";

interface Appointment {
  _id: string;
  patientId: string;
  doctorId: string;
  appointmentDate?: string;
  appointmentTime: string;
  status: string;
}

interface VisitsHistoryProps {
  patientId: string;
  doctorID: string;
  onTabChange: (tabKey: string) => void;
}

// Styled Components
const StyledContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(1),
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(2),
  },
  [theme.breakpoints.up("md")]: {
    padding: theme.spacing(3),
  },
}));

const HeaderSection = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
  [theme.breakpoints.up("sm")]: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
}));

const MobileCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: theme.spacing(2),
  boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
  border: `1px solid ${theme.palette.divider}`,
  overflow: "hidden",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
  },
}));

const StatusChip = styled(Chip)(({ theme }) => ({
  fontWeight: 600,
  fontSize: "0.75rem",
  height: "28px",
  borderRadius: "14px",
  "& .MuiChip-icon": {
    fontSize: "16px",
  },
}));

const DetailItem = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  padding: theme.spacing(1, 0),
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: "20px",
  textTransform: "none",
  fontWeight: 600,
  padding: theme.spacing(0.5, 2),
  minWidth: "auto",
  fontSize: "0.875rem",
}));

const EmptyStateContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(6, 2),
  textAlign: "center",
  backgroundColor: "rgba(25, 118, 210, 0.02)",
  borderRadius: theme.spacing(2),
  border: `2px dashed rgba(25, 118, 210, 0.2)`,
}));

// eslint-disable-next-line react/function-component-definition
const VisitsHistory: React.FC<VisitsHistoryProps> = ({
  patientId,
  doctorID,
  onTabChange,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [expandedAppointment, setExpandedAppointment] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const { decodedToken } = Utility();
  const token = decodedToken();
  const isDoctor = token?.role === "doctor";
  const doctorId = isDoctor ? token?.id : doctorID;

  const fetchAppointments = useCallback(async () => {
    if (patientId && doctorId) {
      try {
        setLoading(true);
        const response = await fetcher(
          "appointment",
          `get-doctor-patient-appointments/${patientId}/${doctorId}?page=${page + 1}&limit=${rowsPerPage}`
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
      } finally {
        setLoading(false);
      }
    }
  }, [patientId, doctorId, page, rowsPerPage]);

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

  const handleToggleExpand = (appointmentId: string) => {
    setExpandedAppointment(
      expandedAppointment === appointmentId ? null : appointmentId
    );
  };

  const handleOpenModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedAppointment(null);
  };

  const formatTimeToIST = (time: string) => {
    const timeParts = time.split(":");
    if (timeParts.length >= 2) {
      const date = new Date();
      date.setHours(parseInt(timeParts[0], 10));
      date.setMinutes(parseInt(timeParts[1], 10));
      return new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).format(date);
    }
    return "Invalid time";
  };

  const statusOptions = [
    {
      value: "pending",
      label: "Pending",
      icon: <CalendarMonth sx={{ fontSize: "1rem", color: "#B98900" }} />,
      chipStyle: {
        backgroundColor: "#FFF8E5",
        color: "#B98900",
      },
    },
    {
      value: "completed",
      label: "Completed",
      icon: <AppointmentIcon sx={{ fontSize: "1rem", color: "#2D9735" }} />,
      chipStyle: {
        backgroundColor: "#d4edda",
        color: "#2D9735",
      },
    },
    {
      value: "cancelled",
      label: "Cancelled",
      icon: <CloseIcon sx={{ fontSize: "1rem", color: "#C41E1D" }} />,
      chipStyle: {
        backgroundColor: "#f8d7da",
        color: "#C41E1D",
      },
    },
  ];

  const getStatusConfig = (status: string) => {
    return (
      statusOptions.find((option) => option.value === status.toLowerCase()) ||
      statusOptions[0]
    );
  };

  // Mobile Appointment Card Component
  const MobileAppointmentCard = ({
    appointment,
  }: {
    appointment: Appointment;
  }) => {
    const statusConfig = getStatusConfig(appointment.status);
    const isExpanded = expandedAppointment === appointment._id;

    return (
      <MobileCard>
        <CardContent sx={{ p: 0 }}>
          <Box
            sx={{
              p: 2,
              pb: 1,
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              cursor: "pointer",
            }}
            onClick={() => handleToggleExpand(appointment._id)}
          >
            <Box
              sx={{
                flex: 1,
                display: "flex",
                alignItems: "flex-start",
                gap: 1.5,
              }}
            >
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: "primary.main",
                  fontSize: "1.2rem",
                }}
              >
                <AppointmentIcon />
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  color="primary"
                  sx={{
                    fontSize: "1.1rem",
                    lineHeight: 1.2,
                    mb: 0.5,
                  }}
                >
                  {appointment.appointmentDate
                    ? format(
                        new Date(appointment.appointmentDate),
                        "dd MMM yyyy"
                      )
                    : "N/A"}
                </Typography>
                <StatusChip
                  icon={statusConfig.icon}
                  label={statusConfig.label}
                  size="small"
                  sx={{
                    ...statusConfig.chipStyle,
                    fontSize: "0.75rem",
                    height: "24px",
                  }}
                />
              </Box>
            </Box>
            <IconButton
              sx={{
                color: "primary.main",
                transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.3s ease",
              }}
            >
              <ExpandMoreIcon />
            </IconButton>
          </Box>

          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <Divider />
            <Box sx={{ p: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <DetailItem>
                    <CalendarMonth
                      sx={{ color: "primary.main", fontSize: 18 }}
                    />
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        Date
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {appointment.appointmentDate
                          ? format(
                              new Date(appointment.appointmentDate),
                              "dd MMM yyyy"
                            )
                          : "N/A"}
                      </Typography>
                    </Box>
                  </DetailItem>
                </Grid>
                <Grid item xs={6}>
                  <DetailItem>
                    <CalendarMonth
                      sx={{ color: "primary.main", fontSize: 18 }}
                    />
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        Time
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {appointment.appointmentTime
                          ? formatTimeToIST(appointment.appointmentTime)
                          : "N/A"}
                      </Typography>
                    </Box>
                  </DetailItem>
                </Grid>
                <Grid item xs={12}>
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                      justifyContent: "flex-end",
                      mt: 1,
                    }}
                  >
                    <ActionButton
                      variant="contained"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenModal(appointment);
                      }}
                      startIcon={<VisibilityIcon />}
                      sx={{
                        background:
                          "linear-gradient(135deg, #2196F3 0%, #1976D2 100%)",
                      }}
                    >
                      View Details
                    </ActionButton>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Collapse>
        </CardContent>
      </MobileCard>
    );
  };

  // Loading Skeleton
  const LoadingSkeleton = () => (
    <Stack spacing={2}>
      <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2 }} />
      {[1, 2, 3].map((item) => (
        <Skeleton
          key={item}
          variant="rectangular"
          height={isMobile ? 120 : 80}
          sx={{ borderRadius: 2 }}
        />
      ))}
    </Stack>
  );

  return (
    <StyledContainer maxWidth="lg">
      <HeaderSection>
        <Box>
          <Typography
            variant="h5"
            fontWeight="bold"
            color="primary"
            gutterBottom
          >
            Visits History
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {totalCount > 0
              ? `${totalCount} appointment${totalCount > 1 ? "s" : ""} found`
              : "No appointments found"}
          </Typography>
        </Box>
      </HeaderSection>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <LoadingSkeleton />
      ) : appointments.length > 0 ? (
        <>
          {isMobile ? (
            <Box>
              {appointments.map((appointment) => (
                <MobileAppointmentCard
                  key={appointment._id}
                  appointment={appointment}
                />
              ))}
            </Box>
          ) : (
            <Paper
              elevation={2}
              sx={{
                borderRadius: 3,
                overflow: "hidden",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              }}
            >
              <List disablePadding>
                {appointments.map((appointment) => {
                  const statusConfig = getStatusConfig(appointment.status);
                  const isExpanded = expandedAppointment === appointment._id;

                  return (
                    <React.Fragment key={appointment._id}>
                      <ListItem
                        onClick={() => handleToggleExpand(appointment._id)}
                        sx={{
                          py: 2.5,
                          px: 3,
                          backgroundColor: isExpanded
                            ? "rgba(25, 118, 210, 0.02)"
                            : "white",
                          transition: "all 0.3s ease",
                          cursor: "pointer",
                          "&:hover": {
                            backgroundColor: "rgba(25, 118, 210, 0.04)",
                          },
                        }}
                      >
                        <ListItemText
                          primary={
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                              }}
                            >
                              <Avatar
                                sx={{
                                  width: 48,
                                  height: 48,
                                  bgcolor: "primary.main",
                                }}
                              >
                                <AppointmentIcon />
                              </Avatar>
                              <Box>
                                <Typography
                                  variant="h6"
                                  fontWeight="bold"
                                  color="primary"
                                  sx={{ fontSize: "1.1rem" }}
                                >
                                  {appointment.appointmentDate
                                    ? format(
                                        new Date(appointment.appointmentDate),
                                        "dd MMM yyyy"
                                      )
                                    : "N/A"}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  Time:{" "}
                                  {appointment.appointmentTime
                                    ? formatTimeToIST(
                                        appointment.appointmentTime
                                      )
                                    : "N/A"}
                                </Typography>
                              </Box>
                            </Box>
                          }
                        />
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 2 }}
                        >
                          <StatusChip
                            icon={statusConfig.icon}
                            label={statusConfig.label}
                            size="small"
                            sx={{
                              ...statusConfig.chipStyle,
                              fontSize: "0.75rem",
                              height: "24px",
                            }}
                          />
                          <IconButton
                            sx={{
                              color: "primary.main",
                              transform: isExpanded
                                ? "rotate(180deg)"
                                : "rotate(0deg)",
                              transition: "transform 0.3s ease",
                            }}
                          >
                            <ExpandMoreIcon />
                          </IconButton>
                        </Box>
                      </ListItem>

                      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                        <Box
                          sx={{
                            px: 3,
                            pb: 3,
                            bgcolor: "rgba(25, 118, 210, 0.02)",
                          }}
                        >
                          <Grid container spacing={3} sx={{ pt: 2 }}>
                            <Grid item xs={12} md={6}>
                              <Typography
                                variant="subtitle1"
                                fontWeight="bold"
                                color="primary"
                                sx={{
                                  mb: 1,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <CalendarMonth fontSize="small" />
                                Appointment Details
                              </Typography>
                              <Stack spacing={1}>
                                <Box>
                                  <Typography
                                    variant="body2"
                                    fontWeight="600"
                                    color="primary"
                                  >
                                    Date
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {appointment.appointmentDate
                                      ? format(
                                          new Date(appointment.appointmentDate),
                                          "dd MMM yyyy"
                                        )
                                      : "N/A"}
                                  </Typography>
                                </Box>
                                <Box>
                                  <Typography
                                    variant="body2"
                                    fontWeight="600"
                                    color="primary"
                                  >
                                    Time
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {appointment.appointmentTime
                                      ? formatTimeToIST(
                                          appointment.appointmentTime
                                        )
                                      : "N/A"}
                                  </Typography>
                                </Box>
                              </Stack>
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <Typography
                                variant="subtitle1"
                                fontWeight="bold"
                                color="primary"
                                sx={{
                                  mb: 1,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <VisibilityIcon fontSize="small" />
                                Actions
                              </Typography>
                              <ActionButton
                                variant="contained"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenModal(appointment);
                                }}
                                startIcon={<VisibilityIcon />}
                                sx={{
                                  background:
                                    "linear-gradient(135deg, #2196F3 0%, #1976D2 100%)",
                                }}
                              >
                                View Details
                              </ActionButton>
                            </Grid>
                          </Grid>
                        </Box>
                      </Collapse>
                      <Divider />
                    </React.Fragment>
                  );
                })}
              </List>
            </Paper>
          )}

          {totalCount > rowsPerPage && (
            <Box
              sx={{
                mt: 3,
                display: "flex",
                justifyContent: "center",
                backgroundColor: "background.paper",
                borderRadius: 2,
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                p: 1,
              }}
            >
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={totalCount}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={{
                  "& .MuiTablePagination-toolbar": {
                    paddingLeft: isMobile ? 0 : "default",
                    paddingRight: isMobile ? 0 : "default",
                  },
                  "& .MuiTablePagination-selectLabel, & .MuiTablePagination-select":
                    {
                      fontWeight: 600,
                    },
                  "& .MuiTablePagination-displayedRows": {
                    fontWeight: 500,
                  },
                }}
              />
            </Box>
          )}
        </>
      ) : (
        <EmptyStateContainer>
          <CalendarMonth
            sx={{
              fontSize: 64,
              color: "primary.main",
              opacity: 0.5,
              mb: 2,
            }}
          />
          <Typography
            variant="h6"
            gutterBottom
            color="primary"
            fontWeight="bold"
          >
            No Appointments Found
          </Typography>
          <Typography variant="body2" color="text.secondary" maxWidth="400px">
            No appointments have been booked for this patient yet.
          </Typography>
        </EmptyStateContainer>
      )}

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
    </StyledContainer>
  );
};

export default VisitsHistory;
