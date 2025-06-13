"use client";

import * as React from "react";
import Grid from "@mui/material/Unstable_Grid2";
import dayjs from "dayjs";
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

export default function Page(): React.JSX.Element {
  const { decodedToken } = Utility();
  const role = decodedToken()?.role;

  React.useEffect(() => {
    console.log("Role:", role);
  }, [role]);

  const cardColors = {
    doctors: "#4CAF50",
    patients: "#2196F3",
    payments: "#FF9800",
    appointments: "#9C27B0",
    monthly: "#3F51B5",
    completed: "#00BCD4",
    dropped: "#F44336",
    pending: "#FF5722",
  };

  const cardStyle = {
    height: "100%",
    transition: "all 0.3s ease-in-out",
    "&:hover": {
      transform: "scale(1.03)",
      boxShadow: "0 8px 15px rgba(0, 0, 0, 0.1)",
    },
  };

  const upcomingAppointments = [
    {
      id: "APT-013",
      patientName: "David Thompson",
      doctorName: "Dr. James Miller",
      date: dayjs().add(1, "day").toDate(),
      time: dayjs().add(1, "day").set("hour", 10).set("minute", 30).toDate(),
      status: "scheduled",
    },
    {
      id: "APT-014",
      patientName: "Jessica White",
      doctorName: "Dr. Elizabeth Taylor",
      date: dayjs().add(1, "day").toDate(),
      time: dayjs().add(1, "day").set("hour", 14).set("minute", 45).toDate(),
      status: "scheduled",
    },
    {
      id: "APT-015",
      patientName: "Thomas Harris",
      doctorName: "Dr. Sarah Johnson",
      date: dayjs().add(2, "day").toDate(),
      time: dayjs().add(2, "day").set("hour", 9).set("minute", 15).toDate(),
      status: "scheduled",
    },
    {
      id: "APT-016",
      patientName: "Emma Clark",
      doctorName: "Dr. Michael Lee",
      date: dayjs().add(2, "day").toDate(),
      time: dayjs().add(2, "day").set("hour", 11).set("minute", 30).toDate(),
      status: "scheduled",
    },
    {
      id: "APT-017",
      patientName: "Daniel Lewis",
      doctorName: "Dr. James Miller",
      date: dayjs().add(3, "day").toDate(),
      time: dayjs().add(3, "day").set("hour", 13).set("minute", 0).toDate(),
      status: "scheduled",
    },
    {
      id: "APT-018",
      patientName: "Sophia Walker",
      doctorName: "Dr. Elizabeth Taylor",
      date: dayjs().add(3, "day").toDate(),
      time: dayjs().add(3, "day").set("hour", 15).set("minute", 45).toDate(),
      status: "scheduled",
    },
  ];

  const todayAppointments = [
    {
      id: "APT-007",
      patientName: "John Smith",
      doctorName: "Dr. Sarah Johnson",
      time: dayjs().set("hour", 9).set("minute", 30).toDate(),
      status: "completed",
    },
    {
      id: "APT-008",
      patientName: "Emma Davis",
      doctorName: "Dr. Michael Lee",
      time: dayjs().set("hour", 10).set("minute", 15).toDate(),
      status: "completed",
    },
    {
      id: "APT-009",
      patientName: "Robert Wilson",
      doctorName: "Dr. Elizabeth Taylor",
      time: dayjs().set("hour", 11).set("minute", 0).toDate(),
      status: "ongoing",
    },
    {
      id: "APT-010",
      patientName: "Sophie Brown",
      doctorName: "Dr. James Miller",
      time: dayjs().set("hour", 13).set("minute", 45).toDate(),
      status: "scheduled",
    },
    {
      id: "APT-011",
      patientName: "William Johnson",
      doctorName: "Dr. Sarah Johnson",
      time: dayjs().set("hour", 14).set("minute", 30).toDate(),
      status: "scheduled",
    },
    {
      id: "APT-012",
      patientName: "Olivia Martin",
      doctorName: "Dr. Michael Lee",
      time: dayjs().set("hour", 16).set("minute", 0).toDate(),
      status: "cancelled",
    },
  ];

  const doctorData = [
    {
      name: "This year",
      data: [18, 16, 5, 8, 3, 14, 14, 16, 17, 19, 18, 20],
    },
    {
      name: "Last year",
      data: [12, 11, 4, 6, 2, 9, 9, 10, 11, 12, 13, 13],
    },
  ];

  const patientMonthlyData = [
    {
      name: "This year",
      data: [45, 52, 38, 24, 33, 26, 21, 20, 6, 8, 15, 10],
    },
    {
      name: "Last year",
      data: [35, 41, 62, 42, 13, 18, 29, 37, 36, 51, 32, 35],
    },
  ];

  const paymentMonthlyData = [
    {
      name: "This year",
      data: [128, 156, 142, 105, 98, 112, 135, 142, 115, 132, 147, 121],
    },
    {
      name: "Last year",
      data: [95, 102, 87, 93, 101, 99, 105, 112, 98, 103, 110, 105],
    },
  ];

  const appointmentData = [
    {
      name: "This year",
      data: [180, 167, 154, 132, 145, 162, 173, 188, 143, 152, 163, 177],
    },
    {
      name: "Last year",
      data: [120, 132, 145, 138, 126, 135, 148, 152, 135, 142, 149, 157],
    },
  ];

  // Determine which stat cards to show based on role
  const isDoctor = role === "doctor";

  // Create dynamic stat card arrays for better organization
  const statCardsRow1 = [
    ...(isDoctor
      ? []
      : [
        {
          value: "360",
          diff: 12,
          trend: "up",
          Icon: VaccinesIcon,
          title: "DOCTORS",
          iconColor: cardColors.doctors,
        },
        {
          value: "200",
          diff: 16,
          trend: "down",
          Icon: PersonIcon,
          title: "PATIENTS",
          iconColor: cardColors.patients,
        },
      ]),
    {
      value: "15000",
      diff: 16,
      trend: "up",
      Icon: CurrencyRupeeIcon,
      title: "TOTAL PAYMENTS",
      iconColor: cardColors.payments,
    },
    {
      value: "5000",
      diff: 16,
      trend: "down",
      Icon: BookOnlineIcon,
      title: "BOOKED APPOINTMENTS",
      iconColor: cardColors.appointments,
    },
  ];

  const statCardsRow2 = [
    {
      value: "4500",
      diff: 16,
      trend: "down",
      Icon: CheckCircleIcon,
      title: "COMPLETED APPOINTMENTS",
      iconColor: cardColors.completed,
    },
    {
      value: "500",
      diff: 16,
      trend: "down",
      Icon: CancelIcon,
      title: "CANCELLED APPOINTMENTS",
      iconColor: cardColors.dropped,
    },
    {
      value: "500",
      diff: 16,
      trend: "down",
      Icon: HourglassEmptyIcon,
      title: "PENDING APPOINTMENTS",
      iconColor: cardColors.pending,
    },
    {
      value: "200",
      diff: 16,
      trend: "down",
      Icon: CalendarMonthIcon,
      title: "APPOINTMENTS THIS MONTH",
      iconColor: cardColors.monthly,
    },
  ];

  // Calculate column width for stat cards based on number of cards
  const getStatCardWidth = (cardsInRow: string | any[]) => {
    // For small screens, always use full width
    // For medium screens, use half width
    // For large screens, distribute evenly
    return {
      xs: 12,
      sm: 6,
      md: 6,
      lg: 12 / Math.min(cardsInRow.length, 4),
    };
  };

  return (
    <Grid container spacing={3}>
      {/* First row of stat cards - dynamically sized */}
      {statCardsRow1.map((card, index) => (
        <Grid key={`stat-card-1-${index}`} {...getStatCardWidth(statCardsRow1)}>
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
      ))}

      {/* Second row of stat cards - dynamically sized */}
      {statCardsRow2.map((card, index) => (
        <Grid key={`stat-card-2-${index}`} {...getStatCardWidth(statCardsRow2)}>
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
      ))}

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

      {/* Charts section - adaptive layout */}
      <Grid container item spacing={3} xs={12}>
        {/* Doctor Onboarded Chart - only shown for non-doctors */}
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

        {/* Patient Monthly Chart - will expand to full width for doctors */}
        <Grid lg={isDoctor ? 12 : 6} md={12} xs={12}>
          <Sales
            chartSeries={patientMonthlyData}
            title="Patient Monthly"
            syncButtonText="Update"
            chartType="bar"
            enableStacked={true}
            yAxisSuffix=""
            sx={cardStyle}
          />
        </Grid>

        {/* Payment Monthly Chart */}
        <Grid lg={6} md={12} xs={12}>
          <Sales
            chartSeries={paymentMonthlyData}
            title="Payment Monthly"
            syncButtonText="Sync"
            overviewButtonText="View All"
            chartType="bar"
            enableStacked={true}
            yAxisSuffix="K"
            sx={cardStyle}
          />
        </Grid>

        {/* Appointment Chart */}
        <Grid lg={6} md={12} xs={12}>
          <Sales
            chartSeries={appointmentData}
            title="Patient Appointments"
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
