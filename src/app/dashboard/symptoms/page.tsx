'use client';

import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Stack } from '@mui/material';
import Typography from '@mui/material/Typography';

import Search from '@/components/common/Search';
import ServerPaginationGrid from '@/components/common/Datagrid';
import type { AppDispatch, RootState } from '@/redux/store';
import type { SymptomData, Symptoms } from '@/types/symptoms';
import { symptomDatagridColumns as datagridColumns } from './symptomsConfig';
import { useGetSymptom } from '@/hooks/symptoms';
import { setSymptom, setLoading } from '@/redux/features/symptomsSlice';

const Page: React.FC = () => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const dispatch: AppDispatch = useDispatch();
  const { symptom, reduxLoading } = useSelector((state: RootState) => state.symptoms);

  const { value: data, refetch } = useGetSymptom(
    {} as Symptoms,
    '/symptoms/get-symptoms',
    '672c681f76ab84e9f25f0539',
    currentPage,
    limit,
  );

  const handleDispatch = React.useCallback(() => {
    dispatch(setLoading(true));
    if (data) {
      dispatch(setSymptom(data));
      dispatch(setLoading(false));
    } else {
      dispatch(setLoading(false));
    }
  }, [data?.results?.length, dispatch]);

  React.useEffect(() => {
    handleDispatch();
  }, [handleDispatch]);

  console.log("symptom data:", symptom);
  console.log("total items:", data);

  return (
    <Stack spacing={3}>
      <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
        <Typography variant="h4">Symptoms</Typography>
      </Stack>
      <Card>
        <Search
          refetchAPI={refetch}
        />
        <ServerPaginationGrid
        columns={datagridColumns()}
        count={symptom?.totalPages || 0} 
        rows={symptom?.results || []}    
        loading={reduxLoading}
        pageSizeOptions={[5, 10, 20]}
        />
      </Card>
    </Stack>
  );
};

export default Page;
