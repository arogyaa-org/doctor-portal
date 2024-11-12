'use client';

import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Stack } from '@mui/material';
import Typography from '@mui/material/Typography';

import Search from '@/components/common/Search';
import ServerPaginationGrid from '@/components/common/Datagrid';
import type { AppDispatch, RootState } from '@/redux/store';
import type { Speciality } from '@/types/speciality';

import { specialityDatagridColumns as datagridColumns } from './specialityConfig';
import { useGetSpeciality } from '@/hooks/Speciality';
import { setSpeciality, setLoading } from '@/redux/features/specialitySlice';

const Page: React.FC = () => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const dispatch: AppDispatch = useDispatch();
  const { speciality, reduxLoading } = useSelector((state: RootState) => state.speciality);

  const { value: data, refetch } = useGetSpeciality(
    {} as Speciality,
    '/speciality/get-specialization',
     '672c681f76ab84e9f25f0539',
    currentPage,
    limit,
  );

  const handleDispatch = React.useCallback(() => {
    dispatch(setLoading(true));
    if (data) {
      dispatch(setSpeciality(data));
      dispatch(setLoading(false));
    } else {
      dispatch(setLoading(false));
    }
  }, [data?.results?.length, dispatch]);

  React.useEffect(() => {
    handleDispatch();
  }, [handleDispatch]);

  console.log("speciality data:", speciality);
  console.log("total items:", data);

  return (
    <Stack spacing={3}>
      <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
        <Typography variant="h4">Speciality</Typography>
      </Stack>
      <Card>
        <Search
          refetchAPI={refetch}
        />
        <ServerPaginationGrid
          columns={datagridColumns()}
          count={speciality?.totalPages}
          rows={speciality?.results || []}
          loading={reduxLoading}
          pageSizeOptions={[5, 10, 20]}
        />
      </Card>
    </Stack>
  );
};

export default Page;
