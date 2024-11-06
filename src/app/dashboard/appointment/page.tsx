'use client';

import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { TableRow, TableCell, Checkbox, Avatar, Card, TableBody, Box, Table, TableHead, TablePagination, Button } from '@mui/material';

import { CustomersFilters } from '@/components/dashboard/customer/customers-filters';
import { AppDispatch, RootState } from '@/redux/store';
import { useGetAppointment } from '@/hooks/appointment';
import { setAppointment} from '@/redux/features/appointmentSlice';
import { Utility } from "@/utils";
import Toast from "../../../components/common/Toast";
import { setToast } from '@/redux/features/toastSlice';
import Loader from '@/components/common/Loader';

const Page: React.FC = () => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const dispatch: AppDispatch = useDispatch();
  const { toast } = useSelector((state: RootState) => state.toast);
  const { appointment} = useSelector((state: RootState) => state.appointment); 
  const { toastAndNavigate } = Utility();

  const { data } = useGetAppointment([], `http://localhost:3001/api/appointments/get-doctorsappointment/64fbf8a49b0a7bca5efc8368?page=${currentPage}&limit=${limit}`);

  let dataArray = data.results;
  console.log("data",data);
  console.log("dataarray",dataArray);
  const totalItems=data?.total||0;
  console.log("totalpages:",totalItems);
  console.log(data)
  React.useEffect(() => {
    if (dataArray && dataArray.length > 0) {
      dispatch(setAppointment(dataArray));
      toastAndNavigate(dispatch, true, "success", "Success");
    }
  }, [data,currentPage,limit,dispatch]);
  console.log("appointment", appointment);
  
 const handleToastTest = () => {
    dispatch(
      setToast({
        toastAlert: true,
        toastSeverity: "success",
        toastMessage: "This is a test toast message!",
      })
    );
  };

  return (
    <>
    <Stack spacing={3}>
      <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
        <Typography variant="h4">Appointment</Typography>
      </Stack>
       {/* <Loader/> */}
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
      <Stack alignItems="center" spacing={3}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleToastTest} 
          sx={{ width: '150px' }} 
          size="small"
        >
          Show Test Toast
        </Button>
      </Stack>

      <Toast
        alerting={toast.toastAlert}
        severity={toast.toastSeverity}
        message={toast.toastMessage}
       />
    </Stack><TablePagination
        component="div"
        count={totalItems} // Total items from your API response
        page={currentPage - 1}
        onPageChange={(event, newPage) => setCurrentPage(newPage + 1)}
        rowsPerPage={limit}
        onRowsPerPageChange={(event) => {
          setLimit(parseInt(event.target.value,10));
          setCurrentPage(1); // Reset to the first page
        } }
        labelRowsPerPage="Rows per page" /></>
  );
};

export default Page;
