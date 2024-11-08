'use client';

import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Stack } from '@mui/material';
import Typography from '@mui/material/Typography';

import Search from '@/components/common/Search';
import ServerPaginationGrid from '@/components/common/Datagrid';
import type { AppDispatch, RootState } from '@/redux/store';
import type { Appointment } from '@/types/appointment';
import { datagridColumns } from "./appointmentConfig";
import { useGetAppointment } from '@/hooks/appointment';
import { setAppointment, setLoading } from '@/redux/features/appointmentSlice';

const Page: React.FC = () => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const dispatch: AppDispatch = useDispatch();
  const { appointment, reduxLoading } = useSelector((state: RootState) => state.appointment);

  const { value: data, refetch } = useGetAppointment(
    {} as Appointment,
    'appointments/get-doctorsappointment',
    '672a09ea00b25358d17c77a5',
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
  }, [data?.results?.length]);

  React.useEffect(() => {
    handleDispatch();
  }, [handleDispatch]);

  console.log("appointment data:", appointment);
  console.log("total items:", data);

  return (
    <>
      <Stack spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Appointment</Typography>
        </Stack>
        <Card>
          <Search
            refetchAPI={refetch}
          />
          <ServerPaginationGrid
            columns={datagridColumns()}
            count={appointment?.total}
            rows={appointment?.results || []}
            loading={reduxLoading}
            pageSizeOptions={[5, 10, 20]}
          />
        </Card>
      </Stack>
    </>
  );
};

export default Page;
