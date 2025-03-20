"use client";

import * as React from "react";
import { useCallback } from "react";
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

import Toast from "@/components/common/Toast";
import Search from "@/components/common/Search";
import ServerPaginationGrid from "@/components/common/Datagrid";
import AppointmentModal from "@/app/(dashboard)/appointment/AppointmentModal";
import type { AppDispatch, RootState } from "@/redux/store";
import { datagridColumns } from "./appointmentConfig";
import { modifier, fetcher } from "@/apis/apiClient";
import { useGetAppointment } from "@/hooks/appointment";
import { setAppointment, setLoading } from "@/redux/features/appointmentSlice";
import { Appointment } from "@/types/appointment";
import { Utility } from "@/utils";

const Page: React.FC = () => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
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
    currentPage,
    limit,
    inputValue ||
      (selectedStatus !== "all" ? selectedStatus : selectedDateFilter)
  );

  // Fetch and store appointments in Redux
  const handleDispatch = React.useCallback(() => {
    dispatch(setLoading(true));
    if (data) {
      dispatch(setAppointment(data));
      dispatch(setLoading(false));
    } else {
      dispatch(setLoading(false));
    }
  }, [data?.results?.length, dispatch]);

  React.useEffect(() => {
    handleDispatch();
  }, [handleDispatch]);

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
  };

  const handleStatusChange = useCallback(
    async (appointmentId: string, newStatus: string) => {
      if (!appointmentId) return;

      try {
        // Update appointment status
        await modifier("appointment", "update-appointment", {
          _id: appointmentId,
          status: newStatus,
        });

        // Update Redux state with new status immediately
        const updatedAppointments = appointment.results.map(
          (appointment: Appointment) =>
            appointment._id === appointmentId
              ? { ...appointment, status: newStatus }
              : appointment
        );
        dispatch(
          setAppointment({ ...appointment, results: updatedAppointments })
        );

        // Optionally, refetch the data to sync UI
        refetch();

        toastAndNavigate(
          dispatch,
          true,
          "success",
          "Status updated successfully"
        );
      } catch (error) {
        console.error("Error updating status:", error);
        toastAndNavigate(dispatch, true, "error", "Failed to update status");
      }
    },
    [appointment, dispatch, refetch, toastAndNavigate]
  );

  React.useEffect(() => {
    refetch();
  }, [selectedStatus, selectedDateFilter, inputValue]);

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

          {/* <Button
            variant="contained"
            startIcon={<CreateIcon />}
            onClick={() => handleOpenModal(null)}
            sx={{
              borderRadius: "100px",
              background: "linear-gradient(45deg, #2196F3 30%, #1976D2 90%)",
              px: 3,
              textTransform: "none",
              fontWeight: 600,
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              minHeight: "45px",
              "&:hover": {
                background: "linear-gradient(45deg, #1976D2 30%, #0D47A1 90%)",
                boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
              },
            }}
          >
            Create
          </Button> */}
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
            refetch,
            selectedStatus,
            selectedDateFilter,
            handleStatusChange,
          })}
          count={appointment?.count}
          rows={appointment?.results || []}
          loading={reduxLoading}
          pageSizeOptions={[5, 10, 20]}
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
