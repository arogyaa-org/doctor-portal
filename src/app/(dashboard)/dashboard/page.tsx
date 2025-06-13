"use client";

import * as React from "react";
import Grid from "@mui/material/Unstable_Grid2";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);
import {
  Vaccines as VaccinesIcon,
  Person as PersonIcon,
  CurrencyRupee as CurrencyRupeeIcon,
  BookOnline as BookOnlineIcon,
  CalendarMonth as CalendarMonthIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  HourglassEmpty as HourglassEmptyIcon,
} from "@mui/icons-material";
import { config } from "@/config";
import {
  ReusableTable,
  todayAppointmentColumns,
  upcomingAppointmentColumns,
  appointmentStatusMap,
} from "@/components/dashboard/overview/appointments-tables";
import { Sales } from "@/components/dashboard/overview/graph";
import { StatCard } from "@/components/dashboard/overview/statCard";
import { Utility } from "@/utils";
import { useGetDashboard } from "@/hooks/dashboard";
import { DashboardStatData, AppointmentData } from "@/types/dashboard";
import { CircularProgress, Typography } from "@mui/material";

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
  time: Date;
  status: string;
}

interface UpcomingTableAppointmentData {
  id: string;
  patientName: string;
  doctorName: string;
  date: Date;
  time: Date;
  status: string;
}

interface ChartSeriesData {
  name: string;
  data: number[];
}

export default function Page(): React.JSX.Element {
  const { decodedToken } = Utility();
  const role = decodedToken()?.role;
  const doctorId = decodedToken()?.id;

  React.useEffect(() => {
    console.log("Role:", role);
    console.log("DoctorId:", doctorId);
  }, [role, doctorId]);

  const todayAppointmentEndpoint =
    role === "doctor" && doctorId
      ? `/get-todays-appointments-by-id/${doctorId}`
      : "/get-all-todays-appointments";

  const upcomingAppointmentEndpoint =
    role === "doctor" && doctorId
      ? `/get-upcoming-appointments-by-id/${doctorId}`
      : "/get-all-upcoming-appointments";

  const statsEndpoint =
    role === "doctor" && doctorId
      ? `/get-stats-by-id/${doctorId}`
      : "/get-stats";

  const paymentMonthlyEndpoint =
    role === "doctor" && doctorId
      ? `/payment-monthly-by-id/${doctorId}`
      : "/payment-monthly";

  const appointmentsMonthlyEndpoint =
    role === "doctor" && doctorId
      ? `/appointments-monthly-by-id/${doctorId}`
      : "/appointments-monthly";

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
    "all" 
  );

  const {
    data: todayAppointmentData,
    loading: todayAppointmentLoading,
    error: todayAppointmentError,
    getAppointments: getTodayAppointments,
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
    getAppointments: getUpcomingAppointments,
  } = useGetDashboard(
    null,
    upcomingAppointmentEndpoint,
    undefined,
    undefined,
    undefined,
    role === "doctor" ? doctorId : undefined
  );

  const {
    data: doctorOnboardingData,
    loading: doctorOnboardingLoading,
    error: doctorOnboardingError,
    getAppointments: getDoctorOnboardingData,
  } = useGetDashboard(
    null,
    "/doctor-onboarding-monthly",
    undefined,
    undefined,
    undefined,
    undefined
  );

  const {
    data: patientOnboardingData,
    loading: patientOnboardingLoading,
    error: patientOnboardingError,
    getAppointments: getPatientOnboardingData,
  } = useGetDashboard(
    null,
    "/patient-onboarding-monthly",
    undefined,
    undefined,
    undefined,
    undefined
  );

  const {
    data: paymentMonthlyDataRaw,
    loading: paymentMonthlyLoading,
    error: paymentMonthlyError,
    getAppointments: getPaymentMonthlyData,
  } = useGetDashboard(
    null,
    paymentMonthlyEndpoint,
    undefined,
    undefined,
    undefined,
    undefined
  );

  const {
    data: appointmentsMonthlyDataRaw,
    loading: appointmentsMonthlyLoading,
    error: appointmentsMonthlyError,
    getAppointments: getAppointmentsMonthlyData,
  } = useGetDashboard(
    null,
    appointmentsMonthlyEndpoint,
    undefined,
    undefined,
    undefined,
    undefined
  );

  const stats: DashboardStatData[] = getStats();

  const todayAppointments: TableAppointmentData[] = React.useMemo(() => {
    const rawAppointments = todayAppointmentData;

    const appointments = Array.isArray(rawAppointments)
      ? rawAppointments
      : rawAppointments?.data && Array.isArray(rawAppointments.data)
        ? rawAppointments.data
        : [];

    return appointments.map((appt: ApiAppointment) => {
      const [hours, minutes] = appt.appointmentTime.split(":").map(Number);
      const utcDate = dayjs
        .utc(appt.appointmentDate)
        .hour(hours)
        .minute(minutes);
      const istDate = utcDate.add(6, "hour").add(30, "minute").toDate(); 

      return {
        id: appt._id,
        patientName: appt.patientData[0]?.username || "Unknown Patient",
        doctorName: appt.doctorData[0]?.username || "Unknown Doctor",
        time: istDate,
        status: appt.status,
      };
    });
  }, [todayAppointmentData]);

  const upcomingAppointments: UpcomingTableAppointmentData[] =
    React.useMemo(() => {
      const rawAppointments = upcomingAppointmentData;

      const appointments = Array.isArray(rawAppointments)
        ? rawAppointments
        : rawAppointments?.data && Array.isArray(rawAppointments.data)
          ? rawAppointments.data
          : [];

      return appointments.map((appt: ApiAppointment) => {
        const [hours, minutes] = appt.appointmentTime.split(":").map(Number);
        const utcDate = dayjs
          .utc(appt.appointmentDate)
          .hour(hours)
          .minute(minutes);
        const istDate = utcDate.add(6, "hour").add(30, "minute").toDate(); 

        return {
          id: appt._id,
          patientName: appt.patientData[0]?.username || "Unknown Patient",
          doctorName: appt.doctorData[0]?.username || "Unknown Doctor",
          date: dayjs.utc(appt.appointmentDate).toDate(),
          time: istDate,
          status: appt.status,
        };
      });
    }, [upcomingAppointmentData]);

  const doctorData: ChartSeriesData[] = React.useMemo(() => {
    const rawData = doctorOnboardingData;

    const data = Array.isArray(rawData)
      ? rawData
      : rawData?.data && Array.isArray(rawData.data)
        ? rawData.data
        : [];

    return data.length > 0
      ? data
      : [
          { name: "This year", data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
          { name: "Last year", data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
        ];
  }, [doctorOnboardingData]);

  const patientMonthlyData: ChartSeriesData[] = React.useMemo(() => {
    const rawData = patientOnboardingData;

    const data = Array.isArray(rawData)
      ? rawData
      : rawData?.data && Array.isArray(rawData.data)
        ? rawData.data
        : [];

    return data.length > 0
      ? data
      : [
          { name: "This year", data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
          { name: "Last year", data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
        ];
  }, [patientOnboardingData]);

  const paymentMonthlyData: ChartSeriesData[] = React.useMemo(() => {
    const rawData = paymentMonthlyDataRaw;

    const data = Array.isArray(rawData)
      ? rawData
      : rawData?.data && Array.isArray(rawData.data)
        ? rawData.data
        : [];

    return data.length > 0
      ? data
      : [
          { name: "This year", data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
          { name: "Last year", data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
        ];
  }, [paymentMonthlyDataRaw]);

  const appointmentChartData: ChartSeriesData[] = React.useMemo(() => {
    const rawData = appointmentsMonthlyDataRaw;

    const data = Array.isArray(rawData)
      ? rawData
      : rawData?.data && Array.isArray(rawData.data)
        ? rawData.data
        : [];

    return data.length > 0
      ? data
      : [
          { name: "This year", data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
          { name: "Last year", data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
        ];
  }, [appointmentsMonthlyDataRaw]);

  const mapStatToCard = (stat: DashboardStatData) => ({
    value: stat.value.toString(),
    diff: stat.diff,
    trend: stat.trend,
    Icon: iconMap[stat.title] || CheckCircleIcon,
    title: stat.title,
    iconColor: cardColors[titleToColorKey[stat.title]] || "#000000",
  });

  const isDoctor = role === "doctor";

  const statCardsRow1 = stats
    .filter((stat) =>
      isDoctor
        ? ["TOTAL PAYMENTS", "BOOKED APPOINTMENTS"].includes(stat.title)
        : [
            "DOCTORS",
            "PATIENTS",
            "TOTAL PAYMENTS",
            "BOOKED APPOINTMENTS",
          ].includes(stat.title)
    )
    .map(mapStatToCard);

  const statCardsRow2 = stats
    .filter((stat) =>
      [
        "COMPLETED APPOINTMENTS",
        "CANCELLED APPOINTMENTS",
        "PENDING APPOINTMENTS",
        "APPOINTMENTS THIS MONTH",
      ].includes(stat.title)
    )
    .map(mapStatToCard);

  const getStatCardWidth = (cardsInRow: any[]) => ({
    xs: 12,
    sm: 6,
    md: 6,
    lg: 12 / Math.min(cardsInRow.length, 4),
  });

  const cardStyle = {
    height: "100%",
    transition: "all 0.3s ease-in-out",
    "&:hover": {
      transform: "scale(1.03)",
      boxShadow: "0 8px 15px rgba(0, 0, 0, 0.1)",
    },
  };

  if (
    statsLoading ||
    todayAppointmentLoading ||
    upcomingAppointmentLoading ||
    doctorOnboardingLoading ||
    patientOnboardingLoading ||
    paymentMonthlyLoading ||
    appointmentsMonthlyLoading
  ) {
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

  if (todayAppointmentError) {
    return (
      <Grid container spacing={3}>
        <Typography color="error">
          Failed to load today's appointments: {todayAppointmentError.message}
        </Typography>
      </Grid>
    );
  }

  if (upcomingAppointmentError) {
    return (
      <Grid container spacing={3}>
        <Typography color="error">
          Failed to load upcoming appointments:{" "}
          {upcomingAppointmentError.message}
        </Typography>
      </Grid>
    );
  }

  if (doctorOnboardingError) {
    return (
      <Grid container spacing={3}>
        <Typography color="error">
          Failed to load doctor onboarding data: {doctorOnboardingError.message}
        </Typography>
      </Grid>
    );
  }

  if (patientOnboardingError) {
    return (
      <Grid container spacing={3}>
        <Typography color="error">
          Failed to load patient onboarding data:{" "}
          {patientOnboardingError.message}
        </Typography>
      </Grid>
    );
  }

  if (paymentMonthlyError) {
    return (
      <Grid container spacing={3}>
        <Typography color="error">
          Failed to load payment monthly data: {paymentMonthlyError.message}
        </Typography>
      </Grid>
    );
  }

  if (appointmentsMonthlyError) {
    return (
      <Grid container spacing={3}>
        <Typography color="error">
          Failed to load appointments monthly data:{" "}
          {appointmentsMonthlyError.message}
        </Typography>
      </Grid>
    );
  }

  return (
    <Grid container spacing={3}>
      {/* First row of stat cards */}
      {statCardsRow1.length === 0 ? (
        <Grid xs={12}>
          <Typography>No stat cards available for Row 1</Typography>
        </Grid>
      ) : (
        statCardsRow1.map((card, index) => (
          <Grid
            key={`stat-card-1-${index}`}
            {...getStatCardWidth(statCardsRow1)}
          >
            <StatCard
              value={card.value}
              diff={card.diff}
              trend={card.trend}
              Icon={card.Icon}
              title={card.title}
              iconColor={card.iconColor}
              sx={cardStyle}
            />
          </Grid>
        ))
      )}

      {/* Second row of stat cards */}
      {statCardsRow2.length === 0 ? (
        <Grid xs={12}>
          <Typography>No stat cards available for Row 2</Typography>
        </Grid>
      ) : (
        statCardsRow2.map((card, index) => (
          <Grid
            key={`stat-card-2-${index}`}
            {...getStatCardWidth(statCardsRow2)}
          >
            <StatCard
              value={card.value}
              diff={card.diff}
              trend={card.trend}
              Icon={card.Icon}
              title={card.title}
              iconColor={card.iconColor}
              sx={cardStyle}
            />
          </Grid>
        ))
      )}

      {/* Today's Appointments Table */}
      <Grid lg={6} md={12} xs={12}>
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

      {/* Upcoming Appointments Table */}
      <Grid lg={6} md={12} xs={12}>
        <ReusableTable
          items={upcomingAppointments}
          columns={upcomingAppointmentColumns}
          title="Upcoming Appointments"
          statusKey="status"
          statusMap={appointmentStatusMap}
          actionButtonText="Schedule Appointment"
          sx={cardStyle}
        />
      </Grid>

      {/* Charts section */}
      <Grid container item spacing={3} xs={12}>
        {!isDoctor && (
          <Grid lg={6} md={12} xs={12}>
            <Sales
              chartSeries={doctorData}
              title="Doctors Onboarded"
              syncButtonText="Refresh"
              overviewButtonText="Details"
              enableStacked={true}
              chartType="bar"
              sx={cardStyle}
            />
          </Grid>
        )}
        {!isDoctor && (
          <Grid lg={6} md={12} xs={12}>
            <Sales
              chartSeries={patientMonthlyData}
              title="Patients"
              syncButtonText="Update"
              chartType="bar"
              enableStacked={true}
              yAxisSuffix=""
              sx={cardStyle}
            />
          </Grid>
        )}
        <Grid lg={6} md={12} xs={12}>
          <Sales
            chartSeries={paymentMonthlyData}
            title="Payments"
            syncButtonText="Sync"
            overviewButtonText="View All"
            chartType="bar"
            enableStacked={true}
            yAxisSuffix="K"
            sx={cardStyle}
          />
        </Grid>
        <Grid lg={6} md={12} xs={12}>
          <Sales
            chartSeries={appointmentChartData}
            title="Appointments"
            syncButtonText="Update"
            chartType="bar"
            enableStacked={true}
            sx={cardStyle}
          />
        </Grid>
      </Grid>
    </Grid>
  );
}
