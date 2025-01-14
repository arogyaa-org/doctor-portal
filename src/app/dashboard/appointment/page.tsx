"use client";

import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, Stack, Typography, Box } from "@mui/material";

import Search from "@/components/common/Search";
import ServerPaginationGrid from "@/components/common/Datagrid";
import type { AppDispatch, RootState } from "@/redux/store";
import type { Appointment } from "@/types/appointment";
import { datagridColumns } from "./appointmentConfig";
import { useGetAppointment } from "@/hooks/appointment";
import { setAppointment, setLoading } from "@/redux/features/appointmentSlice";

const Page: React.FC = () => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
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

  console.log("appointment data:", appointment);
  console.log("total items:", data);

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

        <Box sx={{ maxWidth: "350px", width: "100%", marginRight: "25px" }}>
          <Search refetchAPI={refetch} holderText="Appointment" />
        </Box>
      </Stack>

      <Card>
        <ServerPaginationGrid
          columns={datagridColumns()}
          count={appointment?.count}
          rows={appointment?.results || []}
          loading={reduxLoading}
          pageSizeOptions={[5, 10, 20]}
        />
      </Card>
    </Stack>
  );
};

export default Page;
