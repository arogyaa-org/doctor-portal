'use client';

import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { TableRow, TableCell, Checkbox, Avatar, Card, TableBody, Box, Table, TableHead, TablePagination } from '@mui/material';

import type { AppDispatch, RootState } from '@/redux/store';
import { CustomersFilters } from '@/components/dashboard/customer/customers-filters';
import { useGetAppointment } from '@/hooks/appointment';
import { setAppointment, setLoading } from '@/redux/features/appointmentSlice';
import type { Appointment } from '@/types/appointment';

const Page: React.FC = () => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const dispatch: AppDispatch = useDispatch();
  const { appointment } = useSelector((state: RootState) => state.appointment);

  const { value: data, swrLoading } = useGetAppointment(
    {} as Appointment[],
    'appointments/get-doctorsappointment',
    '672a09ea00b25358d17c77a5',
    currentPage,
    limit
  );

  React.useEffect(() => {
    if (data?.results?.length) {
      dispatch(setAppointment(data.results));
    }
  }, [data, dispatch]);

  const totalItems: number = data?.total || 0;

  console.log("appointment data:", appointment);
  console.log("total items:", data);

  return (
    <>
      <Stack spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Appointment</Typography>
        </Stack>
        <Card>
          <CustomersFilters />
          <Box sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: '800px' }}>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox />
                  </TableCell>
                  <TableCell>patientId</TableCell>
                  <TableCell>appointmentTime</TableCell>
                  <TableCell>status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody> {appointment.map((item) => (
                <TableRow hover key={item.patientId}>
                  <TableCell padding="checkbox">
                    <Checkbox />
                  </TableCell>
                  <TableCell>
                    <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
                      <Avatar />
                      <Typography variant="subtitle2">{item.patientId}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>{item.appointmentTime}</TableCell>
                  <TableCell>
                    {item.status}
                  </TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
          </Box>
        </Card>
      </Stack>
      <TablePagination
        component="div"
        count={totalItems} // Total items from your API response
        page={currentPage - 1}
        onPageChange={(event, newPage) => setCurrentPage(newPage + 1)}
        rowsPerPage={limit}
        onRowsPerPageChange={(event) => {
          setLimit(parseInt(event.target.value, 10));
          setCurrentPage(1); // Reset to the first page
        }}
        labelRowsPerPage="Rows per page" />
    </>
  );
};

export default Page;
