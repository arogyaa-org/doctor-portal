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
} from "@mui/material";
import CreateIcon from "@mui/icons-material/Create";
import { isEqual } from "lodash";

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

const Page: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [openModal, setOpenModal] = React.useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    React.useState<Appointment | null>(null);
  const { toast } = useSelector((state: RootState) => state.toast);
  const [inputValue, setInputValue] = React.useState<string>("");

  const [selectedStatus, setSelectedStatus] = React.useState<string>("all");
  const [selectedDateFilter, setSelectedDateFilter] =
    React.useState<string>("all");

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
    inputValue ||
      (selectedStatus !== "all" ? selectedStatus : selectedDateFilter)
  );

  // Fetch and store appointments in Redux when data changes
  useEffect(() => {
    if (data?.results && !isEqual(data.results, appointment?.results)) {
      dispatch(setAppointment(data));
    }
  }, [data, dispatch, appointment]);

  // Handle page changes
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Handle page size changes
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
    setInputValue(query);
    await refetch(query);
    setCurrentPage(0);
  };

  // Handle status changes
  const handleStatusChange = useCallback(
    async (appointmentId: string, newStatus: string) => {
      if (!appointmentId) return;

      // Optimistically update the Redux store with the new status
      const updatedAppointments = appointment.results.map(
        (appointment: Appointment) =>
          appointment._id === appointmentId
            ? { ...appointment, status: newStatus }
            : appointment
      );
      dispatch(
        setAppointment({ ...appointment, results: updatedAppointments })
      );

      try {
        // Send the status update request to the backend
        const response = await modifier("appointment", "update-appointment", {
          _id: appointmentId,
          status: newStatus,
        });

        if (response) {
          // Only refetch the data if the backend response confirms the change
          await refetch();

          // Optionally, refetch a specific data set if it's crucial
          toastAndNavigate(
            dispatch,
            true,
            "success",
            "Status updated successfully"
          );
        }
      } catch (error) {
        console.error("Error updating status:", error);

        // Revert the status change if the backend call fails
        const revertedAppointments = appointment.results.map(
          (appointment: Appointment) =>
            appointment._id === appointmentId
              ? { ...appointment, status: appointment.status } // Keep the previous status
              : appointment
        );
        dispatch(
          setAppointment({ ...appointment, results: revertedAppointments })
        );

        toastAndNavigate(dispatch, true, "error", "Failed to update status");
      }
    },
    [appointment, dispatch, toastAndNavigate, refetch]
  );

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
          Appointment
        </Typography>

        <Stack direction="row" spacing={3} alignItems="center">
          <Select
            value={selectedStatus}
            onChange={(event) =>
              setSelectedStatus(event.target.value as string)
            }
            displayEmpty
            variant="outlined"
            size="small"
            sx={{
              minWidth: 144,
              borderRadius: "10px",
              backgroundColor: "#f4f6f8",
              marginRight: "-6px",
            }}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="scheduled">Scheduled</MenuItem>
            <MenuItem value="rescheduled">Rescheduled</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
          </Select>

          <Select
            value={selectedDateFilter}
            onChange={(event) =>
              setSelectedDateFilter(event.target.value as string)
            }
            displayEmpty
            variant="outlined"
            size="small"
            sx={{
              minWidth: 144,
              borderRadius: "10px",
              backgroundColor: "#f4f6f8",
            }}
          >
            <MenuItem value="all">All Dates</MenuItem>
            <MenuItem value="today">Today</MenuItem>
            <MenuItem value="upcoming">Upcoming</MenuItem>
            <MenuItem value="previous">Previous</MenuItem>
          </Select>
        </Stack>

        <Stack direction="row" spacing={2} alignItems="center">
          <Search refetchAPI={handleSearch} holderText="Appointment" />
        </Stack>
      </Stack>

      <Stack spacing={3}>
        <Toast
          alerting={toast.toastAlert}
          severity={toast.toastSeverity}
          message={toast.toastMessage}
        />
      </Stack>

      <Card sx={{ marginTop: "-25px" }}>
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
          noRowsMessage="No Appointment Available"
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
