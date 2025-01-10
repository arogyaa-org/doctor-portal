"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Button, Card, Stack, Typography } from "@mui/material";
import CreateIcon from '@mui/icons-material/Create';

import FormInModal from "./FormInModal";
import Search from '@/components/common/Search';
import ServerPaginationGrid from "@/components/common/Datagrid";

import type { AppDispatch, RootState } from "@/redux/store";
import { setQualification } from "@/redux/features/qualificationSlice";
import { useGetQualification } from "@/hooks/qualification"; 
import { qualificationDatagridColumns as qualificationDatagridColumns } from "./qualificationConfig";


const Page: React.FC = () => {
 
   const [pageSize, setPageSize] = React.useState(10);
    const [searchQuery, setSearchQuery] = React.useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const dispatch: AppDispatch = useDispatch();
  const { qualification, reduxLoading } = useSelector((state: RootState) => state.qualification);

  const { value: data, swrLoading, error, refetch } = useGetQualification(
    null,
     "get-qualifications",
    currentPage,
    pageSize,
    searchQuery
  );

  console.log(data,"data is:")

  useEffect(() => {
     if (data?.results?.length > 0 && data.results !== qualification?.results) {
       console.log("Dispatching valid data to Redux:", data);
       dispatch(setQualification(data));
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
    <>
      <Stack spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Qualification</Typography>
        </Stack>
        <Card>
          <Search refetchAPI={handleSearch} placeholderText="Search Qualification" />
          <ServerPaginationGrid
            columns={qualificationDatagridColumns()}
            count={qualification?.total || 0}
            rows={qualification?.results || []}
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
            Failed to load qualification. Please try again.
          </Typography>
        )}
      </Stack>
    </>
  );
};

export default Page;
