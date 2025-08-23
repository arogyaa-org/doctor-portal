"use client";

import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Card,
  Stack,
  Typography,
  Select,
  MenuItem,
  Button,
  Box,
  Chip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CreateIcon from "@mui/icons-material/Create";
import { isEqual } from "lodash";
import {
  Today as TodayIcon,
  Upcoming as UpcomingIcon,
  History as PreviousIcon,
  Event as AllDatesIcon,
  CheckCircle as ApprovedIcon,
  Pending as PendingIcon,
  Cancel as RejectedIcon,
  Schedule as ScheduledIcon,
  EventRepeat as RescheduledIcon,
  PendingActions as PendingActionsIcon,
  AllInclusive,
  History as HistoryIcon,
  CheckCircle as CompletedIcon,
} from "@mui/icons-material";

import Toast from "@/components/common/Toast";
import Search from "@/components/common/Search";
import ServerPaginationGrid from "@/components/common/Datagrid";
import AppointmentModal from "@/app/(dashboard)/appointment/AppointmentModal";
import type { AppDispatch, RootState } from "@/redux/store";
import { datagridColumns } from "./appointmentConfig";
import { modifier } from "@/apis/apiClient";
import { useGetAppointment } from "@/hooks/appointment";
import { setAppointment, setLoading } from "@/redux/features/appointmentSlice";
import { Appointment } from "@/types/appointment";
import { Utility } from "@/utils";

const statusOptions = [
  {
    value: "all",
    label: "Select Status",
    icon: <PendingActionsIcon fontSize="small" color="secondary" />,
    color: "secondary",
  },
  {
    value: "scheduled",
    label: "Scheduled",
    icon: <ScheduledIcon fontSize="small" color="primary" />,
    color: "primary",
  },
  {
    value: "rescheduled",
    label: "Rescheduled",
    icon: <RescheduledIcon fontSize="small" sx={{ color: "#856404" }} />,
    textColor: "#856404",
  },
  {
    value: "rejected",
    label: "Rejected",
    icon: <RejectedIcon fontSize="small" color="error" />,
    color: "error",
  },
  {
    value: "pending",
    label: "Pending",
    icon: <PendingIcon fontSize="small" color="warning" />,
    color: "warning",
  },
  {
    value: "completed",
    label: "Completed",
    icon: <CompletedIcon fontSize="small" color="success" />,
    color: "success",
  },
];

const dateOptions = [
  {
    value: "all",
    label: "Select Dates",
    color: "primary",
    icon: <AllInclusive fontSize="small" />,
  },
  {
    value: "today",
    label: "Today",
    color: "#2D9735",
    icon: <TodayIcon fontSize="small" />,
  },
  {
    value: "upcoming",
    label: "Upcoming",
    color: "#f39c12",
    icon: <UpcomingIcon fontSize="small" />,
  },
  {
    value: "previous",
    label: "Previous",
    color: "#FF0000",
    icon: <HistoryIcon fontSize="small" />,
  },
];

// eslint-disable-next-line react/function-component-definition
const Page: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = React.useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    React.useState<Appointment | null>(null);
  const { toast } = useSelector((state: RootState) => state.toast);

  // State for filters
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [selectedStatus, setSelectedStatus] = React.useState<string>("all");
  const [selectedDateFilter, setSelectedDateFilter] =
    React.useState<string>("all");
  const [locallyUpdatedIds, setLocallyUpdatedIds] = useState<Set<string>>(
    new Set()
  );

  const dispatch: AppDispatch = useDispatch();
  const { appointment, reduxLoading } = useSelector(
    (state: RootState) => state.appointment
  );
  const { toastAndNavigate } = Utility();
  const { decodedToken } = Utility();
  const role = decodedToken()?.role;
  const doctorId = decodedToken()?.id;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  const apiEndpoint =
    role === "doctor" && doctorId
      ? `get-doctors-appointment/${doctorId}`
      : "get-appointments";

  const { value: data, refetch } = useGetAppointment(
    null,
    apiEndpoint,
    undefined,
    currentPage + 1,
    pageSize,
    {
      dateFilter: selectedDateFilter !== "all" ? selectedDateFilter : undefined,
      statusFilter: selectedStatus !== "all" ? selectedStatus : undefined,
      search: searchQuery,
    }
  );

  useEffect(() => {
    if (!data?.results) return;

    if (locallyUpdatedIds.size > 0) {
      const mergedResults = data.results.map((item) => {
        if (locallyUpdatedIds.has(item._id)) {
          const localVersion = appointment?.results?.find(
            (a) => a._id === item._id
          );
          return localVersion || item;
        }
        return item;
      });

      dispatch(
        setAppointment({
          ...data,
          results: mergedResults,
        })
      );
      setLocallyUpdatedIds(new Set());
    } else if (!isEqual(data.results, appointment?.results)) {
      dispatch(setAppointment(data));
    }
  }, [data]);

  // Refetch data when filters change
  useEffect(() => {
    refetch({
      dateFilter: selectedDateFilter !== "all" ? selectedDateFilter : undefined,
      statusFilter: selectedStatus !== "all" ? selectedStatus : undefined,
      search: searchQuery,
    });
    setCurrentPage(0);
  }, [selectedStatus, selectedDateFilter]);

  const handleStatusChange = useCallback(
    async (appointmentId: string, newStatus: string) => {
      if (!appointmentId) return;

      setLocallyUpdatedIds((prev) => new Set(prev).add(appointmentId));

      const updatedAppointments = appointment?.results?.map((appt) =>
        appt._id === appointmentId ? { ...appt, status: newStatus } : appt
      );

      dispatch(
        setAppointment({
          ...appointment,
          results: updatedAppointments,
        })
      );

      try {
        await modifier("appointment", "update-appointment", {
          _id: appointmentId,
          status: newStatus,
        });

        toastAndNavigate(
          dispatch,
          true,
          "success",
          "Status updated successfully"
        );
      } catch (error) {
        console.error("Error updating status:", error);
        setLocallyUpdatedIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(appointmentId);
          return newSet;
        });
        toastAndNavigate(dispatch, true, "error", "Failed to update status");
      }
    },
    [appointment, dispatch, toastAndNavigate]
  );

  const handlePageChange = useCallback(
    async (newPage: number) => {
      if (loading) return;

      setLoading(true);
      setCurrentPage(newPage);

      try {
        await refetch({
          page: newPage + 1,
          limit: pageSize,
          dateFilter:
            selectedDateFilter !== "all" ? selectedDateFilter : undefined,
          statusFilter: selectedStatus !== "all" ? selectedStatus : undefined,
          search: searchQuery,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    },
    [
      loading,
      pageSize,
      selectedDateFilter,
      selectedStatus,
      searchQuery,
      refetch,
    ]
  );

  const handlePageSizeChange = useCallback(
    (newPageSize: number) => {
      if (pageSize !== newPageSize) {
        setPageSize(newPageSize);
        setCurrentPage(0);
      }
    },
    [pageSize]
  );

  const handleOpenModal = (appointment: Appointment | null) => {
    setSelectedAppointment(appointment || null);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedAppointment(null);
  };

  const handleSaveAppointment = (formData: any) => {
    if (selectedAppointment) {
      console.log("Edit Appointment:", formData);
    } else {
      console.log("Create Appointment:", formData);
    }
    refetch();
  };

  const handleSearch = async (query: string): Promise<void> => {
    setSearchQuery(query);
    await refetch({
      dateFilter: selectedDateFilter !== "all" ? selectedDateFilter : undefined,
      statusFilter: selectedStatus !== "all" ? selectedStatus : undefined,
      search: query,
    });
    setCurrentPage(0);
  };

  return (
    <Stack spacing={isMobile ? 2 : 3} sx={{ padding: isMobile ? 1 : 2 }}>
      <Stack
        direction={isMobile ? "column" : "row"}
        spacing={isMobile ? 1 : 3}
        alignItems={isMobile ? "stretch" : "center"}
        justifyContent="space-between"
        flexWrap="wrap"
      >
        <Typography
          variant={isMobile ? "h5" : "h4"}
          sx={{
            flex: 1,
            fontWeight: 600,
            marginLeft: isMobile ? 0 : "11px",
            textAlign: isMobile ? "center" : "left",
          }}
        >
          Appointments
        </Typography>

        {isMobile ? (
          <Stack
            direction="column"
            spacing={1}
            sx={{ width: "100%", maxWidth: "100%" }}
          >
            {/* Search Bar */}
            <Search
              refetchAPI={handleSearch}
              holderText="Appointments..."
              sx={{
                width: "100%",
                maxWidth: "100%",
              }}
            />
            {/* Filters */}
            <Stack
              direction="row"
              spacing={0.5}
              alignItems="center"
              sx={{
                width: "100%",
                flexWrap: "wrap",
                gap: 0.5,
                justifyContent: "space-between",
              }}
            >
              {/* Status Filter */}
              <Select
                value={selectedStatus}
                onChange={(event) =>
                  setSelectedStatus(event.target.value as string)
                }
                variant="outlined"
                size="small"
                sx={{
                  flex: 1,
                  minWidth: 90,
                  minHeight: 32,
                  px: 0.5,
                  py: 0.25,
                  borderRadius: "8px",
                  backgroundColor: (() => {
                    const opt = statusOptions.find(
                      (o) => o.value === selectedStatus
                    );
                    if (!opt) return "#f8f9fa";
                    return opt.textColor
                      ? opt.textColor + "30"
                      : (theme) =>
                          theme.palette[opt.color || "text"]?.main + "30";
                  })(),
                  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                  "& .MuiSelect-select": {
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    padding: 0,
                  },
                }}
                renderValue={(selected) => {
                  const option = statusOptions.find(
                    (opt) => opt.value === selected
                  );
                  const getClr = (theme) =>
                    option?.textColor ||
                    (option?.color
                      ? theme.palette[option.color]?.main
                      : theme.palette.text.primary);

                  return (
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      height="100%"
                      width="100%"
                    >
                      <Box display="flex" alignItems="center" gap={0.5}>
                        {React.cloneElement(option?.icon || <></>, {
                          sx: { color: getClr, fontSize: 14 },
                        })}
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          sx={{
                            color: getClr,
                            lineHeight: 1.2,
                            fontSize: "0.65rem",
                          }}
                        >
                          {option?.label}
                        </Typography>
                      </Box>
                    </Box>
                  );
                }}
              >
                {statusOptions
                  .filter((opt) => opt.value !== selectedStatus)
                  .map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      <Box display="flex" alignItems="center" gap={1}>
                        {React.cloneElement(option.icon, {
                          sx: {
                            color: option.textColor || option.color,
                            fontSize: 14,
                          },
                        })}
                        <Typography
                          variant="body2"
                          fontWeight={500}
                          sx={{
                            color:
                              option.textColor ||
                              ((theme) => theme.palette[option.color]?.main),
                            fontSize: "0.65rem",
                          }}
                        >
                          {option.label}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
              </Select>

              {/* Date Filter */}
              <Select
                value={selectedDateFilter}
                onChange={(event) =>
                  setSelectedDateFilter(event.target.value as string)
                }
                variant="outlined"
                size="small"
                sx={{
                  flex: 1,
                  minWidth: 90,
                  minHeight: 32,
                  px: 0.5,
                  py: 0.25,
                  borderRadius: "8px",
                  backgroundColor: (() => {
                    const opt = dateOptions.find(
                      (o) => o.value === selectedDateFilter
                    );
                    return opt?.color
                      ? opt.color.startsWith("#")
                        ? opt.color + "30"
                        : (theme) => theme.palette[opt.color].main + "30"
                      : "#f8f9fa";
                  })(),
                  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                  "& .MuiSelect-select": {
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    padding: 0,
                  },
                }}
                renderValue={(selected) => {
                  const option = dateOptions.find(
                    (opt) => opt.value === selected
                  );
                  return (
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      height="100%"
                      width="100%"
                    >
                      <Box display="flex" alignItems="center" gap={0.5}>
                        {React.cloneElement(option?.icon || <></>, {
                          sx: { color: option?.color, fontSize: 14 },
                        })}
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          sx={{
                            color: option?.color,
                            lineHeight: 1.2,
                            fontSize: "0.65rem",
                          }}
                        >
                          {option?.label}
                        </Typography>
                      </Box>
                    </Box>
                  );
                }}
              >
                {dateOptions
                  .filter((opt) => opt.value !== selectedDateFilter)
                  .map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      <Box
                        display="flex"
                        alignItems="center"
                        gap={1}
                        color={option.color}
                      >
                        {React.cloneElement(option.icon, {
                          sx: { color: option.color, fontSize: 14 },
                        })}
                        <Typography
                          variant="body2"
                          fontWeight={500}
                          sx={{
                            fontSize: "0.65rem",
                          }}
                        >
                          {option.label}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
              </Select>
            </Stack>
          </Stack>
        ) : (
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            sx={{
              width: "auto",
              flexWrap: "wrap",
              gap: 2,
              justifyContent: "flex-end",
            }}
          >
            {/* Status Filter */}
            <Select
              value={selectedStatus}
              onChange={(event) =>
                setSelectedStatus(event.target.value as string)
              }
              variant="outlined"
              size="small"
              sx={{
                minWidth: 160,
                minHeight: 32,
                px: 1.5,
                py: 0.25,
                borderRadius: "8px",
                backgroundColor: (() => {
                  const opt = statusOptions.find(
                    (o) => o.value === selectedStatus
                  );
                  if (!opt) return "#f8f9fa";
                  return opt.textColor
                    ? opt.textColor + "30"
                    : (theme) =>
                        theme.palette[opt.color || "text"]?.main + "30";
                })(),
                "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                "& .MuiSelect-select": {
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  padding: 0,
                },
              }}
              renderValue={(selected) => {
                const option = statusOptions.find(
                  (opt) => opt.value === selected
                );
                const getClr = (theme) =>
                  option?.textColor ||
                  (option?.color
                    ? theme.palette[option.color]?.main
                    : theme.palette.text.primary);

                return (
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    height="100%"
                    width="100%"
                  >
                    <Box display="flex" alignItems="center" gap={0.5}>
                      {React.cloneElement(option?.icon || <></>, {
                        sx: { color: getClr, fontSize: 20 },
                      })}
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{
                          color: getClr,
                          lineHeight: 1.2,
                          fontSize: "0.875rem",
                        }}
                      >
                        {option?.label}
                      </Typography>
                    </Box>
                  </Box>
                );
              }}
            >
              {statusOptions
                .filter((opt) => opt.value !== selectedStatus)
                .map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Box display="flex" alignItems="center" gap={1}>
                      {React.cloneElement(option.icon, {
                        sx: {
                          color: option.textColor || option.color,
                          fontSize: 20,
                        },
                      })}
                      <Typography
                        variant="body2"
                        fontWeight={500}
                        sx={{
                          color:
                            option.textColor ||
                            ((theme) => theme.palette[option.color]?.main),
                          fontSize: "0.875rem",
                        }}
                      >
                        {option.label}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
            </Select>

            {/* Date Filter */}
            <Select
              value={selectedDateFilter}
              onChange={(event) =>
                setSelectedDateFilter(event.target.value as string)
              }
              variant="outlined"
              size="small"
              sx={{
                minWidth: 150,
                minHeight: 32,
                marginRight: 1.5,
                px: 1.5,
                py: 0.25,
                borderRadius: "8px",
                backgroundColor: (() => {
                  const opt = dateOptions.find(
                    (o) => o.value === selectedDateFilter
                  );
                  return opt?.color
                    ? opt.color.startsWith("#")
                      ? opt.color + "30"
                      : (theme) => theme.palette[opt.color].main + "30"
                    : "#f8f9fa";
                })(),
                "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                "& .MuiSelect-select": {
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  padding: 0,
                },
              }}
              renderValue={(selected) => {
                const option = dateOptions.find(
                  (opt) => opt.value === selected
                );
                return (
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    height="100%"
                    width="100%"
                  >
                    <Box display="flex" alignItems="center" gap={0.5}>
                      {React.cloneElement(option?.icon || <></>, {
                        sx: { color: option?.color, fontSize: 20 },
                      })}
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{
                          color: option?.color,
                          lineHeight: 1.2,
                          fontSize: "0.875rem",
                        }}
                      >
                        {option?.label}
                      </Typography>
                    </Box>
                  </Box>
                );
              }}
            >
              {dateOptions
                .filter((opt) => opt.value !== selectedDateFilter)
                .map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Box
                      display="flex"
                      alignItems="center"
                      gap={1}
                      color={option.color}
                    >
                      {React.cloneElement(option.icon, {
                        sx: { color: option.color, fontSize: 20 },
                      })}
                      <Typography
                        variant="body2"
                        fontWeight={500}
                        sx={{
                          fontSize: "0.875rem",
                        }}
                      >
                        {option.label}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
            </Select>

            {/* Search */}
            <Search
              refetchAPI={handleSearch}
              holderText="Appointments..."
              sx={{
                minWidth: isTablet ? 225 : 250,
              }}
            />
          </Stack>
        )}
      </Stack>

      <Stack spacing={isMobile ? 2 : 3}>
        <Toast
          alerting={toast.toastAlert}
          severity={toast.toastSeverity}
          message={toast.toastMessage}
        />
      </Stack>

      <Card
        sx={{
          marginTop: isMobile ? "-15px" : "-25px",
          boxShadow: 3,
          overflowX: "auto",
        }}
      >
        <ServerPaginationGrid
          columns={datagridColumns({
            handleStatusChange,
          })}
          count={appointment?.count}
          rows={appointment?.results || []}
          loading={reduxLoading}
          page={currentPage}
          pageSize={pageSize}
          pageSizeOptions={[5, 10, 20]}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          noRowsMessage="No appointments found"
          sx={{
            "& .MuiDataGrid-root": {
              fontSize: isMobile ? "0.75rem" : "0.875rem",
            },
            "& .MuiDataGrid-cell": {
              padding: isMobile ? "4px" : "8px",
            },
            "& .MuiDataGrid-columnHeaderTitle": {
              fontSize: isMobile ? "0.7rem" : "0.875rem",
            },
          }}
        />
      </Card>

      <AppointmentModal
        open={openModal}
        handleClose={handleCloseModal}
        handleSave={handleSaveAppointment}
        initialData={selectedAppointment}
        refetch={refetch}
      />
    </Stack>
  );
};

export default Page;
