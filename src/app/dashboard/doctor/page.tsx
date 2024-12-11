"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Button, Card, Stack, Typography } from "@mui/material";
import CreateIcon from "@mui/icons-material/Create";
import { useRouter } from "next/navigation"; 

import Search from "@/components/common/Search";
import ServerPaginationGrid from "@/components/common/Datagrid";

import type { AppDispatch, RootState } from "@/redux/store";
import { setDoctor } from "@/redux/features/doctorSlice";
import { useGetDoctor } from "@/hooks/doctor";
import { doctorDatagridColumns } from "./doctorConfig";

const ITEMS_PER_PAGE = 10;

const Page: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const dispatch: AppDispatch = useDispatch();
  const router = useRouter();
  const { doctor, reduxLoading } = useSelector((state: RootState) => state.doctor);

  const { value: data, refetch } = useGetDoctor(
    null,
    "get-doctors",
    currentPage,
    ITEMS_PER_PAGE
  );

  useEffect(() => {
    if (data?.results) {
      dispatch(setDoctor(data));
    }
  }, [data?.results?.length, dispatch]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };
  const handleActionEdit = (doctorId: string) => {
    router.push(`/dashboard/doctor/create?doctorId=${doctorId}`); // This will trigger the form to populate
  };
  

  const handleCreateDoctor = () => {
    router.push("/dashboard/doctor/create");
  };

  return (
    <Stack spacing={3}>
      <Stack spacing={1} sx={{ flex: "1 1 auto" }}>
        <Typography variant="h4">Doctors</Typography>
      </Stack>

      <Card>
        <Stack spacing={2} sx={{ padding: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Search refetchAPI={refetch} />
            <Button
              variant="contained"
              startIcon={<CreateIcon />}
              onClick={handleCreateDoctor} 
            >
              Create Doctor
            </Button>
          </Box>
        </Stack>

        <ServerPaginationGrid
          columns={doctorDatagridColumns(handleActionEdit)} 
          count={doctor?.count || 0}
          rows={doctor?.results || []}
          loading={reduxLoading}
          page={currentPage - 1}
          pageSize={ITEMS_PER_PAGE}
          pageSizeOptions={[10, 15, 20]}
          onPageChange={(params: any) => handlePageChange(params + 1)}
        />
      </Card>
    </Stack>
  );
};

export default Page;
