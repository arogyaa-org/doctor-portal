'use client';

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { Box, Button, Card, Stack} from '@mui/material';
import Typography from '@mui/material/Typography';
import CreateIcon from "@mui/icons-material/Create";
import Search from '@/components/common/Search';
import ServerPaginationGrid from '@/components/common/Datagrid';
import type { AppDispatch, RootState } from '@/redux/store';
import { patientDatagridColumns as patientDatagridColumns } from './patientConfig';
import { useGetPatient } from '@/hooks/patient';
import { setPatient } from '@/redux/features/patientSlice';
import router from "next/router";


const Page: React.FC = () => {
   const [currentPage, setCurrentPage] = useState(1); 
    const [pageSize, setPageSize] = useState(10);
    const [searchQuery, setSearchQuery] = useState("");
  
  const { patient, reduxLoading } = useSelector((state: RootState) => state.patient);
  const dispatch: AppDispatch = useDispatch();

  const { value: data, swrLoading, error, refetch } = useGetPatient(
    null,
    "get-patients",
    currentPage,
    pageSize,
    searchQuery
  );
  console.log("Fetched Patient Data:", data);
  useEffect(() => {
    if (data?.results?.length > 0 && data.results !== patient?.results) {
      console.log("Dispatching valid data to Redux:", data);
      dispatch(setPatient(data));
    }
  }, [data?.results?.length, dispatch]);
  
  
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
    <Stack spacing={3}>
      <Typography variant="h4">Patient</Typography>

      <Card>
        <Stack spacing={2} sx={{ padding: 2 }}>
          <Box
            sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
          >
            {/* Search Component */}
            <Search refetchAPI={handleSearch} placeholderText="Search Patient" />

            {/* Create Button */}
            <Button
              variant="contained"
              startIcon={<CreateIcon />}
              onClick={() => router.push(paths.dashboard.patientCreate)}
            >
              Create Patient
            </Button>
          </Box>
        </Stack>

        {/* Data Grid */}
        <ServerPaginationGrid
          columns={patientDatagridColumns()}
          count={patient?.count || 0}
          rows={patient?.results || []}
          loading={reduxLoading || swrLoading}
          page={currentPage - 1}
          pageSize={pageSize} 
          pageSizeOptions={[10, 15, 20]} 
          onPageChange={(params: number) => handlePageChange(params + 1)}
          onPageSizeChange={(newSize: number) => handlePageSizeChange(newSize)}
        />
      </Card>

      {/* Error Handling */}
      {error && (
        <Typography color="error" align="center">
          Failed to load patient. Please try again.
        </Typography>
      )}
    </Stack>
  );
};

export default Page;
