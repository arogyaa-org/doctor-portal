"use client";

import * as React from "react";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import {
  CircularProgress,
  Typography,
  Grid,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import {
  Vaccines as VaccinesIcon,
  DateRange as DateRangeIcon,
  CalendarToday as CalendarTodayIcon,
  AllInclusive as AllInclusiveIcon,
} from "@mui/icons-material";

import { Utility } from "@/utils";
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

const SalesDashboard = React.memo(function SalesDashboard(): React.JSX.Element {
  const { decodedToken } = Utility();
  const salesId = decodedToken()?.id;

  const [selectedDate, setSelectedDate] = React.useState<Dayjs | null>(
    dayjs().startOf("month")
  );
  const [filterType, setFilterType] = React.useState<string>("month-year");
  const [selectedYear, setSelectedYear] = React.useState<Dayjs>(
    dayjs(`${dayjs().year()}-01-01`)
  );

  React.useEffect(() => {
    if (selectedDate) {
      setSelectedYear(dayjs(`${selectedDate.year()}-01-01`));
    }
  }, [selectedDate]);

  const doctorOnboardingEndpoint = `/doctor-onboarding-monthly-by-sales-Id/${salesId}`;
  const baseStatsEndpoint = `/get-stats-by-sales-id/${salesId}`;
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

  const getEndpointWithYear = (baseEndpoint: string) => {
    if (filterType === "all") {
      return baseEndpoint;
    }
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

  const currentDate = dayjs().add(6, "hour").add(30, "minute");
  const currentYear = currentDate.year();

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
      <Grid container spacing={3} sx={{ mt: 0.5, pl: 3 }}>
        <Paper
          elevation={1}
          sx={{
            borderRadius: "12px",
            mb: 2,
            p: 2,
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            alignItems: "center",
            justifyContent: { xs: "center", sm: "flex-end" },
          }}
        >
          <FormControl
            sx={{
              width: "200px", // Fixed width
              maxWidth: "100%",
            }}
          >
            <InputLabel>Select Filter Type</InputLabel>
            <Select
              value={filterType}
              label="Select Filter Type"
              onChange={(e) => setFilterType(e.target.value as string)}
            >
              {Object.entries(filterTypeConfig).map(([key, config]) => {
                const IconComponent = config.icon;
                return (
                  <MenuItem key={key} value={key}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <IconComponent
                        sx={{ fontSize: 18, color: config.color }}
                      />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {config.label}
                      </Typography>
                    </Box>
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>

          {filterType !== "all" && (
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label={
                  filterType === "year-only"
                    ? "Choose Year"
                    : "Choose Month & Year"
                }
                views={
                  filterType === "year-only" ? ["year"] : ["year", "month"]
                }
                value={selectedDate}
                onChange={(newValue) => {
                  if (newValue) {
                    if (filterType === "year-only") {
                      setSelectedDate(newValue.startOf("year"));
                    } else {
                      setSelectedDate(newValue.startOf("month"));
                    }
                  }
                }}
                minDate={getMinDate()}
                maxDate={getMaxDate()}
                slotProps={{
                  textField: {
                    sx: {
                      width: "200px", // Fixed width
                      maxWidth: "100%",
                    },
                  },
                }}
              />
            </LocalizationProvider>
          )}
        </Paper>

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
