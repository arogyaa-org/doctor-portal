"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { Button, Card, Stack, Typography } from "@mui/material";
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
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        justifyContent="space-between"
      >
        <Typography
          variant="h4"
          sx={{
            flex: 1,
            fontWeight: 600,
            marginLeft: "25px", 
          }}
        >
          Doctor
        </Typography>

        <Stack direction="row" spacing={2} alignItems="center">
          <Search refetchAPI={refetch} holderText="Doctor"/>

          <Button
            variant="contained"
            startIcon={<CreateIcon />}
            onClick={() => router.push(paths.dashboard.doctorCreate)}
            sx={{
              borderRadius: "100px",
              background: "linear-gradient(45deg, #2196F3 30%, #1976D2 90%)",
              px: 3,
              textTransform: "none",
              fontWeight: 600,
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              minHeight:"45px",
            }}
          >
            Create
          </Button>
        </Stack>
      </Stack>

      <Card>
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
