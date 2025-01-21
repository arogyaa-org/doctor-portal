"use client";

import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, Stack, Typography, Button } from "@mui/material";
import CreateIcon from "@mui/icons-material/Create";

import Search from "@/components/common/Search";
import ServerPaginationGrid from "@/components/common/Datagrid";
import AppointmentModal from "@/app/dashboard/appointment/AppointmentModal";
import type { AppDispatch, RootState } from "@/redux/store";
import type { Appointment } from "@/types/appointment";
import { datagridColumns } from "./appointmentConfig";
import { useGetAppointment } from "@/hooks/appointment";
import { setAppointment, setLoading } from "@/redux/features/appointmentSlice";

const Page: React.FC = () => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [openModal, setOpenModal] = React.useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    React.useState<Appointment | null>(null);

  const dispatch: AppDispatch = useDispatch();
  const { appointment, reduxLoading } = useSelector(
    (state: RootState) => state.appointment
  );

  const { value: data, refetch } = useGetAppointment(
    {} as Appointment,
    "get-doctors-appointment",
    "674eedea9275f96f06a60c95",
    currentPage,
    limit
  );

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

  return (
    <Stack spacing={3}>
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        justifyContent="space-between"
      >
        <Typography
          variant="h4"
          sx={{
            flex: 1,
            fontWeight: 600,
            marginLeft: "25px",
          }}
        >
          Appointment
        </Typography>

        <Stack direction="row" spacing={2} alignItems="center">
          <Search refetchAPI={refetch} holderText="Specialization" />

          <Button
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
          </Button>
        </Stack>
      </Stack>

      <Card>
        <ServerPaginationGrid
          columns={datagridColumns((appointment: Appointment) =>
            handleOpenModal(appointment)
          )}
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
      />
    </Stack>
  );
};

export default Page;
