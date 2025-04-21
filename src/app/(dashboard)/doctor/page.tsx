"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { Button, Card, Stack, Typography } from "@mui/material";
import CreateIcon from "@mui/icons-material/Create";
import { isEqual } from "lodash";

import Search from "@/components/common/Search";
import ServerPaginationGrid from "@/components/common/Datagrid";

import type { AppDispatch, RootState } from "@/redux/store";
import { paths } from "@/paths";
import { doctorDatagridColumns } from "./doctorConfig";
import { setDoctor } from "@/redux/features/doctorSlice";
import { useGetDoctor } from "@/hooks/doctor";

const ITEMS_PER_PAGE = 10;

// eslint-disable-next-line react/function-component-definition
const Page: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(ITEMS_PER_PAGE);
  const { doctor, reduxLoading } = useSelector(
    (state: RootState) => state.doctor
  );
  const [inputValue, setInputValue] = useState<string>("");
  const [loading, setLoading] = useState(false); 
  const dispatch: AppDispatch = useDispatch();
  const router = useRouter();

  const apiParams = useMemo(
    () => ({
      page: currentPage + 1,
      limit: pageSize,
      search: inputValue,
    }),
    [currentPage, pageSize, inputValue]
  );

  const { value: data, refetch } = useGetDoctor(
    null,
    "get-doctors",
    apiParams.page,
    apiParams.limit,
    apiParams.search
  );

  useEffect(() => {
    if (data?.results && !isEqual(data, doctor)) {
      dispatch(setDoctor(data));
    }
  }, [data, doctor, dispatch, data?.results?.length]);

  const handlePageChange = useCallback(
    async (newPage: number) => {
      if (loading) return; 

      setLoading(true); 
      setCurrentPage(newPage); 

      try {
        await refetch();
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false); 
      }
    },
    [loading, pageSize, refetch]
  );

  const handlePageSizeChange = useCallback(
    (newPageSize: number) => {
      if (pageSize !== newPageSize) {
        setPageSize(newPageSize);
        setCurrentPage(0); 
      }
    },
    [pageSize]
  );

  const handleSearch = async (query: string): Promise<void> => {
    setInputValue(query);
    await refetch(query);
    setCurrentPage(0);
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
          <Search refetchAPI={handleSearch} holderText="Doctor" />

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
              minHeight: "45px",
              "&:hover": {
                background: "linear-gradient(45deg, #1976D2 30%, #0D47A1 90%)",
                boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
              },
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
          page={currentPage}
          pageSize={pageSize}
          pageSizeOptions={[5, 10, 15, 20]}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          noRowsMessage="No Doctor Available"
        />
      </Card>
    </Stack>
  );
};

export default Page;
