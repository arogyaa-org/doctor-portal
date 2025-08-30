"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Card, Stack, Typography } from "@mui/material";
import CreateIcon from "@mui/icons-material/Create";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { isEqual } from "lodash";

import Search from "@/components/common/Search";
import ServerPaginationGrid from "@/components/common/Datagrid";

import type { AppDispatch, RootState } from "@/redux/store";
import { paths } from "@/paths";
import { doctorDatagridColumns } from "./doctorConfig";
import { setDoctor } from "@/redux/features/doctorSlice";
import { useGetDoctor } from "@/hooks/doctor";
import { Utility } from "@/utils";

const ITEMS_PER_PAGE = 10;

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
  const searchParams = useSearchParams();
  const { decodedToken } = Utility();

  const role = decodedToken()?.role;
  const authedUserId = decodedToken()?.id;

  const createdByParam = searchParams.get("createdBy");
  const cameFromUser = Boolean(createdByParam);
  const createdByNameParam = searchParams.get("name");

  const scopeUserId =
    createdByParam ?? (role === "sales" ? authedUserId : null);

  const endpoint = scopeUserId
    ? `get-doctors-created-by-user-id/${scopeUserId}`
    : "get-doctors";

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
    endpoint,
    apiParams.page,
    apiParams.limit,
    apiParams.search
  );

  useEffect(() => {
    setCurrentPage(0);
    refetch();
  }, [endpoint]);

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
      } finally {
        setLoading(false);
      }
    },
    [loading, refetch]
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

  // Heading bits
  const displayName = cameFromUser
    ? decodeURIComponent(createdByNameParam || "Selected User")
    : null;
  const totalCount = doctor?.count ?? data?.count ?? 0;

  return (
    <Stack spacing={3}>
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        justifyContent="space-between"
      >
        <Stack direction="row" spacing={2} alignItems="center">
          {cameFromUser && (
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => router.back()}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                color: "#1976D2",
                px: 1.5,
              }}
            >
              Back
            </Button>
          )}

          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            {cameFromUser
              ? `Doctors (Created By ${displayName} — ${totalCount})`
              : role === "sales"
                ? "My Doctors"
                : "Doctor"}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={2} alignItems="center">
          <Search refetchAPI={handleSearch} holderText="Doctor" />
          {!cameFromUser && (
            <Button
              variant="contained"
              startIcon={<CreateIcon />}
              onClick={() => router.push(paths.dashboard.salesDoctorCreate)}
              sx={{
                borderRadius: "100px",
                background: "linear-gradient(45deg, #2196F3 30%, #1976D2 90%)",
                px: 3,
                textTransform: "none",
                fontWeight: 600,
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                minHeight: "45px",
                "&:hover": {
                  background:
                    "linear-gradient(45deg, #1976D2 30%, #0D47A1 90%)",
                  boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
                },
              }}
            >
              Create
            </Button>
          )}
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
