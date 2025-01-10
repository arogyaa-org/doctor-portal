"use client";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { Card, Box, Stack } from '@mui/material';
import Typography from '@mui/material/Typography';

import Search from '@/components/common/Search';
import ServerPaginationGrid from '@/components/common/Datagrid';
import type { AppDispatch, RootState } from '@/redux/store';
import { datagridColumns } from "./appointmentConfig";
import { useGetAppointment } from '@/hooks/appointment';
import { setAppointment, setLoading } from '@/redux/features/appointmentSlice';

const Page: React.FC = () => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [searchQuery, setSearchQuery] = React.useState("");
  const { appointment, reduxLoading } = useSelector((state: RootState) => state.appointment);

  const dispatch: AppDispatch = useDispatch();

  const { value: data, swrLoading, error, refetch } = useGetAppointment(
    null,
    "get-appointment",
    currentPage,
    pageSize,
    searchQuery
  );

 useEffect(() => {
    if (data?.results && data?.results !== appointment?.results) {
      dispatch(setAppointment(data));
    }
  }, [data?.results?.length || 0, dispatch]);


  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); 
  
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);  
    await refetch(query);
  };

  return (
    <>
      <Stack spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Appointment</Typography>
        </Stack>
        <Card>
          <Search refetchAPI={handleSearch} placeholderText="Search Appointment" />
          <ServerPaginationGrid
            columns={datagridColumns()}
            count={appointment?.total || 0}
            rows={appointment?.results || []}
            loading={reduxLoading || swrLoading}
            page={currentPage - 1}
            pageSize={pageSize} 
            pageSizeOptions={[5, 10, 20]} 
            onPageChange={(params: number) => handlePageChange(params + 1)}
            onPageSizeChange={(newSize: number) => handlePageSizeChange(newSize)}
          />
        </Card>

        {error && (
          <Typography color="error" align="center">
            Failed to load appointment. Please try again.
          </Typography>
        )}
      </Stack>
    </>
  );
};

export default Page;
