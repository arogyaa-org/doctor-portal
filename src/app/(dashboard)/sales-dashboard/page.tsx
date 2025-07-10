"use client";

import * as React from "react";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import { CircularProgress, Typography, Grid } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Vaccines as VaccinesIcon } from "@mui/icons-material";

import { useGetDashboard } from "@/hooks/dashboard";
import { Sales } from "@/components/dashboard/overview/graph";
import { StatCard } from "@/components/dashboard/overview/statCard";
import { DashboardStatData } from "@/types/dashboard";

dayjs.extend(utc);

const cardStyle = {
  height: "100%",
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    transform: "scale(1.01)",
    boxShadow: "0 8px 15px rgba(0, 0, 0, 0.1)",
  },
};

const SalesDashboard = React.memo(function SalesDashboard(): React.JSX.Element {
  const [selectedYear, setSelectedYear] = React.useState<Dayjs>(
    dayjs().startOf("year")
  );

  const doctorOnboardingEndpoint = "/doctor-onboarding-monthly";
  const statsEndpoint = "/get-stats?scope=doctors";

  const getEndpointWithYear = (baseEndpoint: string) => {
    return `${baseEndpoint}?year=${selectedYear.year()}`;
  };

  // Fetch stats data for doctors
  const {
    data: statsData,
    loading: statsLoading,
    error: statsError,
    getStats,
  } = useGetDashboard(null, statsEndpoint, undefined, undefined, undefined);

  // Fetch chart data for doctors onboarded
  const {
    data: chartData,
    loading: chartLoading,
    error: chartError,
  } = useGetDashboard(
    null,
    getEndpointWithYear(doctorOnboardingEndpoint),
    undefined,
    undefined,
    undefined
  );

  const stats: DashboardStatData[] = React.useMemo(() => {
    const rawStats = getStats() || [];
    return rawStats.filter(
      (stat: DashboardStatData) => stat.title === "DOCTORS"
    );
  }, [getStats]);

  const getDoctorTicks = (
    data: { name: string; data: number[] }[]
  ): number[] => {
    const maxValue = Math.max(...data.flatMap((series) => series.data));
    const step = 100;
    const ticksCount = Math.ceil(maxValue / step) + 1;
    return Array.from({ length: ticksCount }, (_, i) => i * step);
  };

  if (statsLoading || chartLoading) {
    return (
      <Grid container spacing={3} justifyContent="center" sx={{ pl: 3 }}>
        <CircularProgress />
      </Grid>
    );
  }

  if (statsError || chartError) {
    return (
      <Grid container spacing={3} sx={{ pl: 3 }}>
        <Typography color="error">
          {statsError?.message || chartError?.message || "Failed to load data"}
        </Typography>
      </Grid>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Grid container spacing={3} sx={{ mt: 3, pl: 3 }}>
        {/* Doctor Stats Card */}
        {stats.map((stat, index) => (
          <Grid
            key={`stat-card-${index}`}
            xs={12}
            sm={12}
            md={12}
            lg={12}
            xl={12}
          >
            <StatCard
              value={stat.value.toString()}
              diff={stat.diff}
              trend={stat.trend}
              Icon={VaccinesIcon}
              title="DOCTORS"
              iconColor="#4CAF50"
              sx={cardStyle}
            />
          </Grid>
        ))}

        {/* Doctors Onboarded Graph */}
        <Grid xs={12} sm={12} md={12} lg={12} xl={12} sx={{ mt: 3 }}>
          <Sales
            endpoint={getEndpointWithYear(doctorOnboardingEndpoint)}
            title="Doctors Onboarded"
            syncButtonText="Refresh"
            overviewButtonText="Details"
            chartType="bar"
            enableStacked={true}
            yAxisSuffix=""
            yAxisTicks={getDoctorTicks}
            sx={cardStyle}
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
          />
        </Grid>
      </Grid>
    </LocalizationProvider>
  );
});

export default SalesDashboard;
