"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import VerifiedIcon from "@mui/icons-material/Verified";
import CancelIcon from "@mui/icons-material/Cancel";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
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
  const [inputValue, setInputValue] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [verifiedFilter, setVerifiedFilter] = useState<
    "all" | "verified" | "not_verified"
  >("all");

  const { doctor, reduxLoading } = useSelector(
    (state: RootState) => state.doctor
  );
  const dispatch: AppDispatch = useDispatch();
  const router = useRouter();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const apiParams = useMemo(() => {
    const isVerified =
      verifiedFilter === "all"
        ? undefined
        : verifiedFilter === "verified"
          ? true
          : false;

    return {
      page: currentPage + 1,
      limit: pageSize,
      search: inputValue,
      isVerified,
    };
  }, [currentPage, pageSize, inputValue, verifiedFilter]);

  const { value: data, refetch } = useGetDoctor(
    null,
    "get-doctors",
    apiParams.page,
    apiParams.limit,
    apiParams.search,
    apiParams.isVerified
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

  return (
    <Stack spacing={3}>
      {isMobile ? (
        <Stack spacing={2} px={2}>
          <Typography variant="h5" fontWeight={600}>
            Doctor
          </Typography>

          <ToggleButtonGroup
            value={verifiedFilter}
            exclusive
            onChange={(_event, newValue) => {
              if (newValue !== null) {
                setVerifiedFilter(newValue);
                setCurrentPage(0);
              }
            }}
            size="small"
            fullWidth
            sx={{
              background: "#f5f5f5",
              borderRadius: 2,
              "& .MuiToggleButton-root": {
                textTransform: "none",
                fontWeight: 500,
                px: 2,
                py: 0.8,
                border: 0,
                color: "#333",
                "&.Mui-selected": {
                  color: verifiedFilter === "verified" ? "#2E7D32" : verifiedFilter === "not_verified" ? "#D32F2F" : "#1976D2",
                  backgroundColor: verifiedFilter === "verified" ? "#E8F5E9" : verifiedFilter === "not_verified" ? "#FFEBEE" : "#E3F2FD",
                },
                "&:hover": {
                  backgroundColor: verifiedFilter === "verified" ? "#E8F5E9" : verifiedFilter === "not_verified" ? "#FFEBEE" : "#E3F2FD",
                },
              },
            }}
          >
            <ToggleButton value="all">
              <PeopleAltIcon sx={{ mr: 1 }} fontSize="small" /> All
            </ToggleButton>
            <ToggleButton value="verified">
              <VerifiedIcon sx={{ mr: 1 }} fontSize="small" /> Verified
            </ToggleButton>
            <ToggleButton value="not_verified">
              <CancelIcon sx={{ mr: 1 }} fontSize="small" /> Not Verified
            </ToggleButton>
          </ToggleButtonGroup>

          <Search refetchAPI={handleSearch} holderText="Doctor" />

          <Button
            fullWidth
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
      ) : (
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
          px={3}
        >
          <Typography variant="h4" fontWeight={600}>
            Doctor
          </Typography>

          <ToggleButtonGroup
            value={verifiedFilter}
            exclusive
            onChange={(_event, newValue) => {
              if (newValue !== null) {
                setVerifiedFilter(newValue);
                setCurrentPage(0);
              }
            }}
            size="small"
            sx={{
              background: "#f5f5f5",
              borderRadius: 2,
              "& .MuiToggleButton-root": {
                textTransform: "none",
                fontWeight: 500,
                px: 2,
                py: 0.8,
                border: 0,
                color: "#333",
                "&.Mui-selected": {
                  color: verifiedFilter === "verified" ? "#2E7D32" : verifiedFilter === "not_verified" ? "#D32F2F" : "#1976D2",
                  backgroundColor: verifiedFilter === "verified" ? "#E8F5E9" : verifiedFilter === "not_verified" ? "#FFEBEE" : "#E3F2FD",
                },
                "&:hover": {
                  backgroundColor: verifiedFilter === "verified" ? "#E8F5E9" : verifiedFilter === "not_verified" ? "#FFEBEE" : "#E3F2FD",
                },
              },
            }}
          >
            <ToggleButton value="all">
              <PeopleAltIcon sx={{ mr: 1 }} fontSize="small" /> All
            </ToggleButton>
            <ToggleButton value="verified">
              <VerifiedIcon sx={{ mr: 1 }} fontSize="small" /> Verified
            </ToggleButton>
            <ToggleButton value="not_verified">
              <CancelIcon sx={{ mr: 1 }} fontSize="small" /> Not Verified
            </ToggleButton>
          </ToggleButtonGroup>

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
                  background:
                    "linear-gradient(45deg, #1976D2 30%, #0D47A1 90%)",
                  boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
                },
              }}
            >
              Create
            </Button>
          </Stack>
        </Stack>
      )}

      <Card sx={{ mx: { xs: 1, md: 0 } }}>
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
