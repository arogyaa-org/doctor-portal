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
    icon: <AllDatesIcon fontSize="small" color="primary" />,
    color: "primary",
  },
  {
    value: "rescheduled",
    label: "Rescheduled",
    icon: <RescheduledIcon fontSize="small" sx={{ color: "#856404" }} />,
    textColor: "#856404",
  },
  {
    value: "approved",
    label: "Approved",
    icon: <ApprovedIcon fontSize="small" color="success" />,
    color: "success",
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

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(0);
  };

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
    <Stack spacing={3}>
      <Stack
        direction="row"
        spacing={3}
        alignItems="center"
        justifyContent="space-between"
      >
        <Typography
          variant="h4"
          sx={{
            flex: 1,
            fontWeight: 600,
            marginLeft: "11px",
          }}
        >
          Appointments
        </Typography>

        <Stack direction="row" spacing={2} alignItems="center">
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
              minHeight: 40,
              px: 1.5,
              py: 0.5,
              borderRadius: "10px",
              backgroundColor: (() => {
                const opt = statusOptions.find(
                  (o) => o.value === selectedStatus
                );
                if (!opt) return "#f8f9fa";
                return opt.textColor
                  ? opt.textColor + "30"
                  : (theme) => theme.palette[opt.color || "text"]?.main + "30";
              })(),
              "& .MuiOutlinedInput-notchedOutline": { border: "none" },
              "& .MuiSelect-select": {
                display: "flex",
                alignItems: "center",
                gap: 1,
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
                  <Box display="flex" alignItems="center" gap={1}>
                    {React.cloneElement(option?.icon || <></>, {
                      sx: { color: getClr },
                    })}
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      sx={{
                        color: getClr,
                        lineHeight: 1.2,
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
                  <Box display="flex" alignItems="center" gap={1.5}>
                    {React.cloneElement(option.icon, {
                      sx: { color: option.textColor || option.color },
                    })}
                    <Typography
                      variant="body2"
                      fontWeight={500}
                      sx={{
                        color:
                          option.textColor ||
                          ((theme) => theme.palette[option.color]?.main),
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
              minHeight: 40,
              marginRight: 1.5,
              borderRadius: "10px",
              px: 1.5,
              py: 0.5,
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
                gap: 1,
                padding: 0,
              },
            }}
            renderValue={(selected) => {
              const option = dateOptions.find((opt) => opt.value === selected);
              return (
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  height="100%"
                  width="100%"
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    {React.cloneElement(option?.icon || <></>, {
                      sx: { color: option?.color },
                    })}
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      sx={{
                        color: option?.color,
                        lineHeight: 1.2,
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
                    gap={1.5}
                    color={option.color}
                  >
                    {React.cloneElement(option.icon, {
                      sx: { color: option.color },
                    })}
                    <Typography variant="body2" fontWeight={500}>
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
            sx={{ width: 250 }}
          />
        </Stack>
      </Stack>

      <Stack spacing={3}>
        <Toast
          alerting={toast.toastAlert}
          severity={toast.toastSeverity}
          message={toast.toastMessage}
        />
      </Stack>

      <Card sx={{ marginTop: "-25px", boxShadow: 3 }}>
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
