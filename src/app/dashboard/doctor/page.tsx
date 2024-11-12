'use client';

import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Stack } from '@mui/material';
import Typography from '@mui/material/Typography';

import Search from '@/components/common/Search';
import ServerPaginationGrid from '@/components/common/Datagrid';
import type { AppDispatch, RootState } from '@/redux/store';
import type { DoctorData } from '@/types/doctor';
import { doctorDatagridColumns as datagridColumns } from './doctorConfig';
import { useGetDoctor } from '@/hooks/doctor';
import { setDoctor, setLoading } from '@/redux/features/doctorSlice';

const Page: React.FC = () => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const dispatch: AppDispatch = useDispatch();
  const { doctor, reduxLoading } = useSelector((state: RootState) => state.doctor);

  const { value: data, refetch } = useGetDoctor(
    {} as DoctorData,
    '/doctor/get',
    '672c637fff727fed2ffb3693',
    currentPage,
    limit,
  );

  const handleDispatch = React.useCallback(() => {
    dispatch(setLoading(true));
    if (data) {
      dispatch(setDoctor(data));
      dispatch(setLoading(false));
    } else {
      dispatch(setLoading(false));
    }
  }, [data?.results?.length, dispatch]);

  React.useEffect(() => {
    handleDispatch();
  }, [handleDispatch]);

  console.log("doctor data:", doctor);
  console.log("total items:", data);

  return (
    <Stack spacing={3}>
      <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
        <Typography variant="h4">Doctor</Typography>
      </Stack>
      <Card>
        <Search
          refetchAPI={refetch}
        />
        <ServerPaginationGrid
          columns={datagridColumns()}
          count={doctor?.totalPages}
          rows={doctor?.results || []}
          loading={reduxLoading}
          pageSizeOptions={[5, 10, 20]}
        />
      </Card>
    </Stack>
  );
};

export default Page;
