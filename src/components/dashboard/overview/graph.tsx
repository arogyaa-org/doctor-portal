"use client";

import * as React from "react";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Divider from "@mui/material/Divider";
import { alpha, useTheme } from "@mui/material/styles";
import type { SxProps } from "@mui/material/styles";
import { ArrowRight as ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import type { ApexOptions } from "apexcharts";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import { CircularProgress, Typography } from "@mui/material";

import { Chart } from "@/components/core/chart";
import { useGetDashboard } from "@/hooks/dashboard";

export interface SalesProps {
  endpoint: string; // New prop for the API endpoint
  title?: string;
  syncButtonText?: string;
  overviewButtonText?: string;
  chartType?: "bar" | "line" | "area";
  height?: number;
  enableStacked?: boolean;
  yAxisSuffix?: string;
  yAxisTicks?: (data: { name: string; data: number[] }[]) => number[]; // Function to calculate ticks
  sx?: SxProps;
  initialYear?: number; // Optional initial year
  selectedYear?: Dayjs; // New prop to control the year from parent
  onYearChange?: (year: Dayjs) => void; // Optional callback for year changes
}

export function Sales({
  endpoint,
  title = "Sales",
  syncButtonText = "Sync",
  overviewButtonText = "Overview",
  chartType = "bar",
  height = 350,
  enableStacked = false,
  yAxisSuffix = "K",
  yAxisTicks,
  sx,
  initialYear = 2025, // Default to 2025
  selectedYear: propSelectedYear, // Controlled prop
  onYearChange, // Callback for year changes
}: SalesProps): React.JSX.Element {
  // Use propSelectedYear if provided, otherwise manage local state
  const [localSelectedYear, setLocalSelectedYear] = React.useState<Dayjs>(
    propSelectedYear || dayjs(`${initialYear}-01-01`)
  );

  // Sync with prop if provided
  React.useEffect(() => {
    if (propSelectedYear) {
      setLocalSelectedYear(propSelectedYear);
    }
  }, [propSelectedYear]);

  // Construct the endpoint with the year query parameter
  const apiEndpoint = `${endpoint}${localSelectedYear ? `?year=${localSelectedYear.year()}` : ""}`;

  // Fetch data using useGetDashboard
  const {
    data: chartDataRaw,
    loading,
    error,
    getAppointments: fetchData,
  } = useGetDashboard(
    null,
    apiEndpoint,
    undefined,
    undefined,
    undefined,
    undefined
  );

  // Process the chart data
  const chartSeries = React.useMemo(() => {
    const data = Array.isArray(chartDataRaw)
      ? chartDataRaw
      : chartDataRaw?.data && Array.isArray(chartDataRaw.data)
        ? chartDataRaw.data
        : [];

    return data.length > 0
      ? data
      : [
          { name: "This year", data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
          { name: "Last year", data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
        ];
  }, [chartDataRaw]);

  // Calculate y-axis ticks based on the chart data
  const ticks = yAxisTicks ? yAxisTicks(chartSeries) : undefined;

  const chartOptions = useChartOptions(enableStacked, yAxisSuffix, ticks);

  // Handle year selection change
  const handleYearChange = (newValue: Dayjs | null) => {
    if (newValue) {
      setLocalSelectedYear(newValue);
      if (onYearChange) {
        onYearChange(newValue);
      }
    }
  };

  return (
    <Card sx={sx}>
      <CardHeader
        action={
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              views={["year"]}
              value={localSelectedYear}
              onChange={handleYearChange}
              slotProps={{
                textField: {
                  size: "small",
                  sx: {
                    width: "100px",
                    "& .MuiInputBase-root": {
                      fontSize: "0.875rem",
                      color: "inherit",
                    },
                    "& .MuiSvgIcon-root": { color: "inherit" },
                  },
                },
              }}
            />
          </LocalizationProvider>
        }
        title={title}
      />
      <CardContent>
        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: height,
            }}
          >
            <CircularProgress />
          </div>
        ) : error ? (
          <Typography color="error" align="center">
            Failed to load data: {error.message}
          </Typography>
        ) : (
          <Chart
            height={height}
            options={chartOptions}
            series={chartSeries}
            type={chartType}
            width="100%"
          />
        )}
      </CardContent>
      <Divider />
      <CardActions sx={{ justifyContent: "flex-end" }}>
        <Button
          color="inherit"
          endIcon={<ArrowRightIcon fontSize="var(--icon-fontSize-md)" />}
          size="small"
        >
          {overviewButtonText}
        </Button>
      </CardActions>
    </Card>
  );
}

function useChartOptions(
  isStacked = false,
  yAxisSuffix = "K",
  yAxisTicks?: number[]
): ApexOptions {
  const theme = useTheme();

  return {
    chart: {
      background: "transparent",
      stacked: isStacked,
      toolbar: { show: false },
    },
    colors: [
      theme.palette.primary.main,
      alpha(theme.palette.primary.main, 0.25),
    ],
    dataLabels: { enabled: false },
    fill: { opacity: 1, type: "solid" },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 2,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    legend: { show: false },
    plotOptions: { bar: { columnWidth: "40px" } },
    stroke: { colors: ["transparent"], show: true, width: 2 },
    theme: { mode: theme.palette.mode },
    xaxis: {
      axisBorder: { color: theme.palette.divider, show: true },
      axisTicks: { color: theme.palette.divider, show: true },
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      labels: { offsetY: 5, style: { colors: theme.palette.text.secondary } },
    },
    yaxis: {
      min: 0,
      max: yAxisTicks ? yAxisTicks[yAxisTicks.length - 1] : undefined,
      tickAmount: yAxisTicks ? yAxisTicks.length - 1 : undefined,
      labels: {
        formatter: (value) =>
          value > 0 ? `${value}${yAxisSuffix}` : `${value}`,
        offsetX: -10,
        style: { colors: theme.palette.text.secondary },
      },
      ...(yAxisTicks && {
        ticks: yAxisTicks,
        labels: {
          formatter: (value) =>
            value > 0 ? `${value}${yAxisSuffix}` : `${value}`,
          offsetX: -10,
          style: { colors: theme.palette.text.secondary },
        },
      }),
    },
  };
}
