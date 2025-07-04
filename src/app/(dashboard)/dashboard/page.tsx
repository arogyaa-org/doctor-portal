"use client";

import * as React from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

import {
  CircularProgress,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Avatar,
  Badge,
  Stack,
} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import {
  Vaccines as VaccinesIcon,
  Person as PersonIcon,
  CurrencyRupee as CurrencyRupeeIcon,
  BookOnline as BookOnlineIcon,
  CalendarMonth as CalendarMonthIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  HourglassEmpty as HourglassEmptyIcon,
  DateRange as DateRangeIcon,
  CalendarToday as CalendarTodayIcon,
  AllInclusive as AllInclusiveIcon,
} from "@mui/icons-material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import { Utility } from "@/utils";
import { useGetDashboard } from "@/hooks/dashboard";
import { useGetDoctor } from "@/hooks/doctor";
import {
  ReusableTable,
  todayAppointmentColumns,
  upcomingAppointmentColumns,
  appointmentStatusMap,
} from "@/components/dashboard/overview/appointments-tables";
import { Sales } from "@/components/dashboard/overview/graph";
import { StatCard } from "@/components/dashboard/overview/statCard";

import { DashboardStatData } from "@/types/dashboard";

dayjs.extend(utc);

const cardStyle = {
  height: "100%",
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    transform: "scale(1.03)",
    boxShadow: "0 8px 15px rgba(0, 0, 0, 0.1)",
  },
};

const Page = React.memo(function Page(): React.JSX.Element {
  const { decodedToken } = Utility();
  const role = decodedToken()?.role;
  const doctorId = decodedToken()?.id;
  const rawDoctorName = decodedToken()?.doctorName || "Doctor";
  const doctorName =
    rawDoctorName.charAt(0).toUpperCase() + rawDoctorName.slice(1);

  const isDoctor = role === "doctor";
  const isSubAdmin = role === "sub_admin";

  const [selectedDate, setSelectedDate] = React.useState<dayjs.Dayjs | null>(
    dayjs().startOf("month")
  );
  const [filterType, setFilterType] = React.useState<string>("month-year");
  const [selectedYear, setSelectedYear] = React.useState<dayjs.Dayjs>(
    dayjs(`${dayjs().year()}-01-01`)
  );

  React.useEffect(() => {
    if (selectedDate) {
      setSelectedYear(dayjs(`${selectedDate.year()}-01-01`));
    }
  }, [selectedDate]);

  const todayAppointmentEndpoint =
    role === "doctor" && doctorId
      ? `/get-todays-appointments-by-id/${doctorId}`
      : "/get-all-todays-appointments";

  const upcomingAppointmentEndpoint =
    role === "doctor" && doctorId
      ? `/get-upcoming-appointments-by-id/${doctorId}`
      : "/get-all-upcoming-appointments";

  const paymentMonthlyEndpoint =
    role === "doctor" && doctorId
      ? `/payment-monthly-by-id/${doctorId}`
      : `/payment-monthly`;

  const appointmentsMonthlyEndpoint =
    role === "doctor" && doctorId
      ? `/appointments-monthly-by-id/${doctorId}`
      : `/appointments-monthly`;

  const doctorOnboardingEndpoint = `/doctor-onboarding-monthly`;
  const patientOnboardingEndpoint = `/patient-onboarding-monthly`;

  const getEndpointWithYear = (baseEndpoint: string) => {
    if (selectedDate && filterType !== "all") {
      return `${baseEndpoint}?year=${selectedDate.year()}`;
    }
    return baseEndpoint;
  };

  const {
    data: todayAppointmentData,
    loading: todayAppointmentLoading,
    error: todayAppointmentError,
  } = useGetDashboard(
    null,
    todayAppointmentEndpoint,
    undefined,
    undefined,
    undefined,
    role === "doctor" ? doctorId : undefined
  );

  const {
    data: upcomingAppointmentData,
    loading: upcomingAppointmentLoading,
    error: upcomingAppointmentError,
  } = useGetDashboard(
    null,
    upcomingAppointmentEndpoint,
    undefined,
    undefined,
    undefined,
    role === "doctor" ? doctorId : undefined
  );

  const todayAppointments: TableAppointmentData[] = React.useMemo(() => {
    const rawAppointments = todayAppointmentData;

    const appointments = Array.isArray(rawAppointments)
      ? rawAppointments
      : rawAppointments?.data && Array.isArray(rawAppointments.data)
        ? rawAppointments.data
        : [];

    return appointments.map((appt: ApiAppointment) => ({
      id: appt._id,
      patientName: appt.patientData[0]?.username || "Unknown Patient",
      doctorName: appt.doctorData[0]?.username || "Unknown Doctor",
      time: appt.appointmentTime,
      status: appt.status,
    }));
  }, [todayAppointmentData]);

  const upcomingAppointments: UpcomingTableAppointmentData[] =
    React.useMemo(() => {
      const rawAppointments = upcomingAppointmentData;

      const appointments = Array.isArray(rawAppointments)
        ? rawAppointments
        : rawAppointments?.data && Array.isArray(rawAppointments.data)
          ? rawAppointments.data
          : [];

      return appointments.map((appt: ApiAppointment) => ({
        id: appt._id,
        patientName: appt.patientData[0]?.username || "Unknown Patient",
        doctorName: appt.doctorData[0]?.username || "Unknown Doctor",
        date: appt.appointmentDate,
        time: appt.appointmentTime,
        status: appt.status,
      }));
    }, [upcomingAppointmentData]);

  const getDoctorPatientTicks = (data: ChartSeriesData[]): number[] => {
    const maxValue = Math.max(...data.flatMap((series) => series.data));
    const step = 100;
    const ticksCount = Math.ceil(maxValue / step) + 1;
    return Array.from({ length: ticksCount }, (_, i) => i * step);
  };

  const getPaymentTicks = (data: ChartSeriesData[]): number[] => {
    const maxValue = Math.max(...data.flatMap((series) => series.data));
    const step = 5000;
    const ticksCount = Math.ceil(maxValue / step) + 1;
    return Array.from({ length: ticksCount }, (_, i) => i * step);
  };

  const getAppointmentTicks = (data: ChartSeriesData[]): number[] => {
    const maxValue = Math.max(...data.flatMap((series) => series.data));
    const step = 100;
    const ticksCount = Math.ceil(maxValue / step) + 1;
    return Array.from({ length: ticksCount }, (_, i) => i * step);
  };

  const currentDate = dayjs().add(6, "hour").add(30, "minute");
  const currentYear = currentDate.year();
  const currentMonth = currentDate.month();

  const getMaxDate = () => {
    const maxYear = currentYear;
    if (filterType === "year-only") {
      return dayjs(`${maxYear}-12-31`);
    } else if (filterType === "month-year") {
      if (selectedDate && selectedDate.year() === currentYear) {
        return selectedDate.endOf("month").isBefore(currentDate)
          ? currentDate
          : selectedDate.endOf("month");
      }
      return dayjs(`${maxYear}-12-31`);
    }
    return dayjs(`${maxYear}-12-31`);
  };

  const getMinDate = () => {
    return dayjs("1900-01-01");
  };

  const {
    value: doctorData,
    swrLoading: doctorLoading,
    error: doctorError,
  } = useGetDoctor(null, `/get-doctor-by-id/${doctorId}`, 1, 1);
  const profilePicture =
    doctorData?.data?.profilePicture ||
    (doctorData?.data?.gender === "male"
      ? "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=face"
      : "https://media.istockphoto.com/id/2132087076/photo/asian-woman-doctor-and-happy-in-hospital-with-tablet-for-prescriptions-research-and-results.jpg?s=1024x1024&w=is&k=20&c=yBHF5huhIG9hJUXfyrUfiMz4FCUpCYAezWWXv7DTIzc=");

  if (todayAppointmentLoading || upcomingAppointmentLoading || doctorLoading) {
    return (
      <Grid container spacing={3} justifyContent="center">
        <CircularProgress />
      </Grid>
    );
  }

  if (todayAppointmentError || upcomingAppointmentError || doctorError) {
    return (
      <Grid container spacing={3}>
        <Typography color="error">
          {todayAppointmentError?.message ||
            upcomingAppointmentError?.message ||
            doctorError?.message}
        </Typography>
      </Grid>
    );
  }

  return (
    <Grid container spacing={3} sx={{ mt: !isDoctor ? -3 : -2 }}>
      <Grid xs={12}>
        <Box sx={{ position: "relative", mb: 3 }}>
          <Paper
            elevation={isDoctor ? 0 : 1}
            sx={{
              borderRadius: "12px",
              padding: { xs: "12px 8px", md: "16px 16px" },
              border: isDoctor ? "1px solid rgba(255, 255, 255, 0.2)" : "none",
              background: isDoctor
                ? "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)"
                : "transparent",
              boxShadow: isDoctor
                ? "0 4px 16px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.5)"
                : "none",
              position: "relative",
              overflow: "hidden",
              ...(isDoctor && {
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "1px",
                  background:
                    "linear-gradient(90deg, #667eea 0%, #764ba2 50%, #667eea 100%)",
                },
              }),
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: -40,
                right: -40,
                width: 80,
                height: 80,
                borderRadius: "50%",
                background:
                  "linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))",
                filter: "blur(15px)",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                bottom: -20,
                left: -20,
                width: 40,
                height: 40,
                borderRadius: "50%",
                background:
                  "linear-gradient(135deg, rgba(118, 75, 162, 0.1), rgba(102, 126, 234, 0.1))",
                filter: "blur(10px)",
              }}
            />

            {/* Header with Doctor Profile and Filter Controls */}
            <Grid
              container
              spacing={2}
              alignItems="center"
              sx={{ position: "relative", zIndex: 1 }}
            >
              {isDoctor ? (
                <Grid
                  xs={12}
                  sm={6}
                  md={3}
                  lg={3}
                  xl={3}
                  sx={{
                    display: "flex",
                    justifyContent: { xs: "center", md: "flex-start" },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: { xs: 2, md: 0 },
                    }}
                  >
                    <Badge
                      overlap="circular"
                      anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "right",
                      }}
                      badgeContent={
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            backgroundColor: "#4caf50",
                            border: "2px solid white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                          }}
                        >
                          <Box
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              backgroundColor: "white",
                            }}
                          />
                        </Box>
                      }
                    >
                      <Avatar
                        src={profilePicture}
                        alt={doctorName}
                        sx={{
                          width: 85,
                          height: 85,
                          border: "3px solid white",
                          boxShadow:
                            "0 8px 32px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.05)",
                          background:
                            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          transition:
                            "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                          "&:hover": {
                            transform: "translateY(-6px) scale(1.05)",
                            boxShadow:
                              "0 20px 40px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.1)",
                          },
                        }}
                      />
                    </Badge>
                    <Stack sx={{ display: { xs: "none", md: "block" } }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          fontSize: 27,
                          background:
                            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          backgroundClip: "text",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                        }}
                      >
                        Welcome,
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          fontSize: 22,
                          background:
                            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          backgroundClip: "text",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: "220px",
                        }}
                      >
                        {doctorName}
                      </Typography>
                    </Stack>
                  </Box>
                </Grid>
              ) : null}
              <Grid
                xs={12}
                sm={isDoctor ? 6 : 12}
                md={isDoctor ? 9 : 12}
                lg={isDoctor ? 9 : 12}
                xl={isDoctor ? 9 : 12}
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                }}
              >
                <Grid
                  container
                  spacing={2}
                  alignItems="end"
                  justifyContent="flex-end"
                >
                  <Grid xs={12} sm={6} md={6} lg={6} xl={6}>
                    <FormControl
                      fullWidth
                      size="medium"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "rgba(255, 255, 255, 0.9)",
                          backdropFilter: "blur(10px)",
                          borderRadius: "12px",
                          fontSize: "0.95rem",
                          height: { xs: "48px", sm: "56px" },
                          "& fieldset": {
                            borderColor: "rgba(102, 126, 234, 0.2)",
                            borderWidth: "1.5px",
                          },
                          "&:hover fieldset": {
                            borderColor: "rgba(102, 126, 234, 0.4)",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#667eea",
                            borderWidth: "2px",
                          },
                        },
                        "& .MuiSelect-select": {
                          color: "#2d3748",
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          fontWeight: 500,
                        },
                        "& .MuiInputLabel-root": {
                          color: "#718096",
                          fontWeight: 500,
                          "&.Mui-focused": { color: "#667eea" },
                        },
                      }}
                    >
                      <InputLabel>Select Filter Type</InputLabel>
                      <Select
                        value={filterType}
                        label="Select Filter Type"
                        onChange={(e) =>
                          setFilterType(e.target.value as string)
                        }
                        renderValue={(value) => {
                          const config =
                            filterTypeConfig[
                              value as keyof typeof filterTypeConfig
                            ];
                          const IconComponent = config.icon;
                          return (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                              }}
                            >
                              <Box
                                sx={{
                                  width: 32,
                                  height: "32px",
                                  borderRadius: "8px",
                                  background: `linear-gradient(135deg, ${config.color}15, ${config.color}25)`,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <IconComponent
                                  sx={{
                                    fontSize: 18,
                                    color: config.color,
                                  }}
                                />
                              </Box>
                              <span>{config.label}</span>
                            </Box>
                          );
                        }}
                        MenuProps={{
                          PaperProps: {
                            sx: {
                              borderRadius: "12px",
                              mt: 1,
                              boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
                              border: "1px solid rgba(255,255,255,0.2)",
                              backdropFilter: "blur(20px)",
                              background: "rgba(255, 255, 255, 0.95)",
                            },
                          },
                        }}
                      >
                        {Object.entries(filterTypeConfig).map(
                          ([key, config]) => {
                            const IconComponent = config.icon;
                            return (
                              <MenuItem
                                key={key}
                                value={key}
                                sx={{
                                  py: 2,
                                  px: 2.5,
                                  margin: "4px 8px",
                                  borderRadius: "12px",
                                  transition: "all 0.2s ease",
                                  "&:hover": {
                                    backgroundColor: `${config.color}08`,
                                    transform: "translateX(4px)",
                                  },
                                }}
                              >
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                    width: "100%",
                                  }}
                                >
                                  <Box
                                    sx={{
                                      width: 40,
                                      height: 40,
                                      borderRadius: "12px",
                                      background: `linear-gradient(135deg, ${config.color}15, ${config.color}25)`,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    <IconComponent
                                      sx={{
                                        fontSize: 20,
                                        color: config.color,
                                      }}
                                    />
                                  </Box>
                                  <Box sx={{ flex: 1 }}>
                                    <Typography
                                      variant="subtitle2"
                                      sx={{
                                        fontWeight: 600,
                                        color: "#2d3748",
                                      }}
                                    >
                                      {config.label}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      sx={{ color: "#718096" }}
                                    >
                                      {config.description}
                                    </Typography>
                                  </Box>
                                </Box>
                              </MenuItem>
                            );
                          }
                        )}
                      </Select>
                    </FormControl>
                  </Grid>
                  {filterType !== "all" && (
                    <Grid xs={12} sm={6} md={6} lg={6} xl={6}>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          label={
                            filterType === "year-only"
                              ? "Choose Year"
                              : "Choose Month & Year"
                          }
                          views={
                            filterType === "year-only"
                              ? ["year"]
                              : ["year", "month"]
                          }
                          value={selectedDate}
                          onChange={(newValue) => {
                            if (newValue) {
                              if (filterType === "year-only") {
                                setSelectedDate(newValue.startOf("year"));
                              } else if (filterType === "month-year") {
                                if (
                                  selectedDate &&
                                  newValue.year() !== selectedDate.year()
                                ) {
                                  setSelectedDate(newValue.startOf("year"));
                                } else {
                                  setSelectedDate(newValue.startOf("month"));
                                }
                              }
                            }
                          }}
                          minDate={getMinDate()}
                          maxDate={getMaxDate()}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              size: "medium",
                              sx: {
                                "& .MuiOutlinedInput-root": {
                                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                                  backdropFilter: "blur(10px)",
                                  borderRadius: "12px",
                                  fontSize: "0.95rem",
                                  height: { xs: "48px", sm: "56px" },
                                  "& fieldset": {
                                    borderColor: "rgba(118, 75, 162, 0.2)",
                                    borderWidth: "1.5px",
                                  },
                                  "&:hover fieldset": {
                                    borderColor: "rgba(118, 75, 162, 0.4)",
                                  },
                                  "&.Mui-focused fieldset": {
                                    borderColor: "#764ba2",
                                    borderWidth: "2px",
                                  },
                                },
                                "& .MuiInputBase-input": {
                                  color: "#2d3748",
                                  fontWeight: 500,
                                },
                                "& .MuiInputLabel-root": {
                                  color: "#718096",
                                  fontWeight: 500,
                                  "&.Mui-focused": {
                                    color: "#764ba2",
                                  },
                                },
                              },
                            },
                          }}
                        />
                      </LocalizationProvider>
                    </Grid>
                  )}
                </Grid>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      </Grid>

      <StatCards
        role={role}
        doctorId={doctorId}
        selectedDate={selectedDate}
        filterType={filterType}
        isDoctor={isDoctor}
        isSubAdmin={isSubAdmin}
      />

      {!isSubAdmin && (
        <>
          <Grid xs={12} sm={12} md={6} lg={6} xl={6}>
            <ReusableTable
              items={todayAppointments}
              columns={todayAppointmentColumns}
              title="Today's Appointments"
              statusKey="status"
              statusMap={appointmentStatusMap}
              actionButtonText="View All Appointments"
              sx={cardStyle}
            />
          </Grid>

          <Grid xs={12} sm={12} md={6} lg={6} xl={6}>
            <ReusableTable
              items={upcomingAppointments}
              columns={upcomingAppointmentColumns}
              title="Upcoming Appointments"
              statusKey="status"
              statusMap={appointmentStatusMap}
              actionButtonText="View All Appointments"
              sx={cardStyle}
            />
          </Grid>
        </>
      )}

      <Grid container item spacing={3} xs={12}>
        {(isSubAdmin || !isDoctor) && (
          <Grid
            xs={12}
            sm={12}
            md={isSubAdmin ? 12 : 6}
            lg={isSubAdmin ? 12 : 6}
            xl={isSubAdmin ? 12 : 6}
          >
            <Sales
              endpoint={getEndpointWithYear(doctorOnboardingEndpoint)}
              title="Doctors Onboarded"
              syncButtonText="Refresh"
              overviewButtonText="Details"
              enableStacked={true}
              chartType="bar"
              yAxisSuffix=""
              yAxisTicks={getDoctorPatientTicks}
              sx={cardStyle}
              selectedYear={selectedYear}
            />
          </Grid>
        )}
        {!isSubAdmin && !isDoctor && (
          <Grid xs={12} sm={12} md={6} lg={6} xl={6}>
            <Sales
              endpoint={getEndpointWithYear(patientOnboardingEndpoint)}
              title="Patients"
              syncButtonText="Update"
              chartType="bar"
              enableStacked={true}
              yAxisSuffix=""
              yAxisTicks={getDoctorPatientTicks}
              sx={cardStyle}
              selectedYear={selectedYear}
            />
          </Grid>
        )}
        {!isSubAdmin && (
          <>
            <Grid xs={12} sm={12} md={6} lg={6} xl={6}>
              <Sales
                endpoint={getEndpointWithYear(paymentMonthlyEndpoint)}
                title="Payments"
                syncButtonText="Sync"
                overviewButtonText="View All"
                chartType="bar"
                enableStacked={true}
                yAxisSuffix="K"
                yAxisTicks={getPaymentTicks}
                sx={cardStyle}
                selectedYear={selectedYear}
              />
            </Grid>
            <Grid xs={12} sm={12} md={6} lg={6} xl={6}>
              <Sales
                endpoint={getEndpointWithYear(appointmentsMonthlyEndpoint)}
                title="Appointments"
                syncButtonText="Update"
                chartType="bar"
                enableStacked={true}
                yAxisSuffix=""
                yAxisTicks={getAppointmentTicks}
                sx={cardStyle}
                selectedYear={selectedYear}
              />
            </Grid>
          </>
        )}
      </Grid>
    </Grid>
  );
});

const StatCards = React.memo(function StatCards({
  role,
  doctorId,
  selectedDate,
  filterType,
  isDoctor,
  isSubAdmin,
}: {
  role?: string;
  doctorId?: string;
  selectedDate: dayjs.Dayjs | null;
  filterType: string;
  isDoctor: boolean;
  isSubAdmin: boolean;
}) {
  const baseStatsEndpoint =
    role === "doctor" && doctorId
      ? `/get-stats-by-id/${doctorId}`
      : "/get-stats";
  const statsEndpoint = React.useMemo(() => {
    if (filterType === "all") {
      return `${baseStatsEndpoint}?scope=all`;
    }
    if (!selectedDate) {
      return baseStatsEndpoint;
    }
    if (filterType === "year-only") {
      return `${baseStatsEndpoint}?year=${selectedDate.year()}`;
    }
    return `${baseStatsEndpoint}?month=${selectedDate.month() + 1}&year=${selectedDate.year()}`;
  }, [baseStatsEndpoint, filterType, selectedDate]);

  const {
    data: statsData,
    loading: statsLoading,
    error: statsError,
    getStats,
  } = useGetDashboard(
    null,
    statsEndpoint,
    undefined,
    undefined,
    undefined,
    filterType === "all" ? undefined : role === "doctor" ? doctorId : undefined
  );

  const stats: DashboardStatData[] = getStats() || [];

  const iconMap: Record<string, React.ElementType> = {
    DOCTORS: VaccinesIcon,
    PATIENTS: PersonIcon,
    "TOTAL PAYMENTS": CurrencyRupeeIcon,
    "BOOKED APPOINTMENTS": BookOnlineIcon,
    "COMPLETED APPOINTMENTS": CheckCircleIcon,
    "CANCELLED APPOINTMENTS": CancelIcon,
    "PENDING APPOINTMENTS": HourglassEmptyIcon,
    "APPOINTMENTS THIS MONTH": CalendarMonthIcon,
  };

  const cardColors = {
    doctors: "#4CAF50",
    patients: "#2196F3",
    payments: "#5CB338",
    appointments: "#9C27B0",
    monthly: "#3F51B5",
    completed: "#00BCD4",
    dropped: "#F44336",
    pending: "#FF9800",
  };

  const titleToColorKey: Record<string, keyof typeof cardColors> = {
    DOCTORS: "doctors",
    PATIENTS: "patients",
    "TOTAL PAYMENTS": "payments",
    "BOOKED APPOINTMENTS": "appointments",
    "COMPLETED APPOINTMENTS": "completed",
    "CANCELLED APPOINTMENTS": "dropped",
    "PENDING APPOINTMENTS": "pending",
    "APPOINTMENTS THIS MONTH": "monthly",
  };

  const mapStatToCard = (stat: DashboardStatData) => ({
    value: stat.value.toString(),
    diff: stat.diff,
    trend: stat.trend,
    Icon: iconMap[stat.title] || CheckCircleIcon,
    title: stat.title,
    iconColor: cardColors[titleToColorKey[stat.title]] || "#000000",
  });

  // Deduplicate and filter stats for sub_admin to ensure only one "DOCTORS" stat
  const filteredStats = React.useMemo(() => {
    if (isSubAdmin) {
      const doctorStats = stats.filter((stat) => stat.title === "DOCTORS");
      return doctorStats.length > 0 ? [doctorStats[0]] : [];
    }
    return stats;
  }, [stats, isSubAdmin]);

  const statCardsRow1 = filteredStats
    .filter((stat) =>
      isSubAdmin
        ? stat.title === "DOCTORS"
        : isDoctor
          ? [
              "TOTAL PAYMENTS",
              "BOOKED APPOINTMENTS",
              "COMPLETED APPOINTMENTS",
            ].includes(stat.title)
          : [
              "DOCTORS",
              "PATIENTS",
              "TOTAL PAYMENTS",
              "BOOKED APPOINTMENTS",
            ].includes(stat.title)
    )
    .map(mapStatToCard);

  // Explicitly empty for sub_admin to prevent any cards in row 2
  const statCardsRow2 = isSubAdmin
    ? []
    : filteredStats
        .filter((stat) =>
          isDoctor
            ? [
                "CANCELLED APPOINTMENTS",
                "PENDING APPOINTMENTS",
                "APPOINTMENTS THIS MONTH",
              ].includes(stat.title)
            : [
                "COMPLETED APPOINTMENTS",
                "CANCELLED APPOINTMENTS",
                "PENDING APPOINTMENTS",
                "APPOINTMENTS THIS MONTH",
              ].includes(stat.title)
        )
        .map(mapStatToCard);

  const getStatCardWidth = (cardsInRow: any[]) => ({
    xs: 12,
    sm: isSubAdmin ? 12 : 6,
    md: isSubAdmin ? 12 : 6,
    lg: isSubAdmin ? 12 : isDoctor ? 4 : 12 / Math.min(cardsInRow.length, 4),
    xl: isSubAdmin ? 12 : isDoctor ? 4 : 12 / Math.min(cardsInRow.length, 4),
  });

  if (statsLoading) {
    return (
      <Grid container spacing={3} justifyContent="center">
        <CircularProgress />
      </Grid>
    );
  }

  if (statsError) {
    return (
      <Grid container spacing={3}>
        <Typography color="error">
          Failed to load dashboard stats: {statsError.message}
        </Typography>
      </Grid>
    );
  }

  return (
    <>
      {statCardsRow1.length === 0 ? (
        <Grid xs={12}>
          <Typography>No stat cards available for Row 1</Typography>
        </Grid>
      ) : (
        statCardsRow1.map((card, index) => (
          <Grid
            key={`stat-card-1-${index}`}
            {...getStatCardWidth(statCardsRow1)}
            sx={{ mt: -4, position: "relative" }}
          >
            <StatCard
              value={card.value}
              diff={card.diff}
              trend={card.trend}
              Icon={card.Icon}
              title={card.title}
              iconColor={card.iconColor}
              sx={{ position: "relative", isDoctor }}
            />
          </Grid>
        ))
      )}

      {statCardsRow2.length === 0
        ? null
        : statCardsRow2.map((card, index) => (
            <Grid
              key={`stat-card-2-${index}`}
              {...getStatCardWidth(statCardsRow2)}
              sx={{ mt: 1, position: "relative" }}
            >
              <StatCard
                value={card.value}
                diff={card.diff}
                trend={card.trend}
                Icon={card.Icon}
                title={card.title}
                iconColor={card.iconColor}
                sx={
                  card.title === "PENDING APPOINTMENTS" && isDoctor
                    ? { isDoctor: true, position: "relative" }
                    : { position: "relative" }
                }
              />
            </Grid>
          ))}
    </>
  );
});

// Type definitions
interface ApiAppointment {
  _id: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentType: string;
  status: string;
  updatedAt: string;
  patientData: { _id: string; username: string; email: string }[];
  doctorData: { _id: string; username: string }[];
}

interface TableAppointmentData {
  id: string;
  patientName: string;
  doctorName: string;
  time: string;
  status: string;
}

interface UpcomingTableAppointmentData {
  id: string;
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
  status: string;
}

interface ChartSeriesData {
  name: string;
  data: number[];
}

const filterTypeConfig = {
  "month-year": {
    icon: DateRangeIcon,
    color: "#667eea",
    label: "Month & Year",
    description: "Filter by specific month and year",
  },
  "year-only": {
    icon: CalendarTodayIcon,
    color: "#764ba2",
    label: "Year Only",
    description: "Filter by year",
  },
  all: {
    icon: AllInclusiveIcon,
    color: "#4caf50",
    label: "All Time",
    description: "Show all data",
  },
};

export default Page;
