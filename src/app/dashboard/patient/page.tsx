'use client';

import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Stack } from '@mui/material';
import Typography from '@mui/material/Typography';

import ServerPaginationGrid from '@/components/common/Datagrid';
import type { AppDispatch, RootState } from '@/redux/store';
import { Patient } from '@/types/patient';
import { CustomersFilters } from '@/components/dashboard/customer/customers-filters';
import { patientDatagridColumns as datagridColumns } from './patientConfig';
import { useGetPatient } from '@/hooks/patient';
import { setPatient, setLoading } from '@/redux/features/patientSlice';

const Page: React.FC = () => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);  // Adjusted to a typical page limit
  const dispatch: AppDispatch = useDispatch();
  const { patient, reduxLoading } = useSelector((state: RootState) => state.patient);

  const { value: data } = useGetPatient(
    {} as Patient,
    '/patient-service/get-patient',
    '672c681f76ab84e9f25f0539',
    currentPage,
    limit
  );

  const handleDispatch = React.useCallback(() => {
    dispatch(setLoading(true));
    if (data) {
      dispatch(setPatient(data));
      dispatch(setLoading(false));
    } else {
      dispatch(setLoading(false));
    }
  }, [data?.results?.length, dispatch]);

  React.useEffect(() => {
    handleDispatch();
  }, [handleDispatch]);

  console.log("patient data:", patient);
  console.log("total items:", data);

  return (
    <Stack spacing={3}>
      <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
        <Typography variant="h4">Patient</Typography>
      </Stack>
      <Card>
        <CustomersFilters />
        <ServerPaginationGrid
          columns={datagridColumns()}
          count={patient?.totalPages}
          rows={patient?.results || []}
          loading={reduxLoading}
          pageSizeOptions={[5, 10, 20]}
        />
      </Card>
    </Stack>
  );
};

export default Page;
