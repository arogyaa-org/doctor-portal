"use client";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { Box, Button, Card, Stack, Typography } from "@mui/material";
import CreateIcon from "@mui/icons-material/Create";

import Search from "@/components/common/Search";
import ServerPaginationGrid from "@/components/common/Datagrid";

import type { AppDispatch, RootState } from "@/redux/store";
import { paths } from "@/paths";
import { doctorDatagridColumns } from "./doctorConfig";
import { setDoctor } from "@/redux/features/doctorSlice";
import { useGetDoctor } from "@/hooks/doctor";

const Page: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1); 
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  const { doctor, reduxLoading } = useSelector((state: RootState) => state.doctor);

  const dispatch: AppDispatch = useDispatch();
  const router = useRouter();

  const { value: data, swrLoading, error, refetch } = useGetDoctor(
    null,
    "get-doctors",
    currentPage,
    pageSize,
    searchQuery
  );
console.log(data, "is missing")
  useEffect(() => {
    if (data?.results && data?.results !== doctor?.results) {
      dispatch(setDoctor(data));
    }
  }, [data?.results?.length ||0, dispatch]);
  

  const handlePageChange = (newPage: number) => {
    console.log("next")
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
      <Typography variant="h4">Doctors</Typography>

      <Card>
        <Stack spacing={2} sx={{ padding: 2 }}>
          <Box
            sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
          >
            {/* Search Component */}
            <Search refetchAPI={handleSearch} placeholderText="Search Doctor" />

            {/* Create Button */}
            <Button
              variant="contained"
              startIcon={<CreateIcon />}
              onClick={() => router.push(paths.dashboard.doctorCreate)}
            >
              Create Doctor
            </Button>
          </Box>
        </Stack>

        {/* Data Grid */}
        <ServerPaginationGrid
          columns={doctorDatagridColumns()}
          count={doctor?.count || 0}
          rows={doctor?.results || []}
          loading={reduxLoading || swrLoading}
          page={currentPage - 1}
          pageSize={pageSize} 
          pageSizeOptions={[10, 15, 20]} 
          onPageChange={(page, pageSize) => {
            handlePageChange(page);
            handlePageSizeChange(pageSize);
        }}
        />
      </Card>

      {/* Error Handling */}
      {error && (
        <Typography color="error" align="center">
          Failed to load doctors. Please try again.
        </Typography>
      )}
    </Stack>
  );
};

export default Page;
