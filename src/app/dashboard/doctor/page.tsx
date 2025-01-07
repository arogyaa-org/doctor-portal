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

const ITEMS_PER_PAGE = 10;

const Page: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { doctor, reduxLoading } = useSelector(
    (state: RootState) => state.doctor
  );

  const dispatch: AppDispatch = useDispatch();
  const router = useRouter();

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
  }, [data?.results?.length]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  return (
    <Stack spacing={3}>
      <Stack spacing={1} sx={{ flex: "1 1 auto" }}>
        <Typography variant="h4">Doctors</Typography>
      </Stack>

      <Card>
        <Stack spacing={2} sx={{ padding: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Search refetchAPI={refetch} />
            <Button
              variant="contained"
              startIcon={<CreateIcon />}
              onClick={() => router.push(paths.dashboard.doctorCreate)}
            >
              Create Doctor
            </Button>
          </Box>
        </Stack>

        <ServerPaginationGrid
          columns={doctorDatagridColumns()}
          count={doctor?.count}
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
