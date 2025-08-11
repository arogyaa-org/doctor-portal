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
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import VerifiedIcon from "@mui/icons-material/Verified";
import CancelIcon from "@mui/icons-material/Cancel";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
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

  type FilterType = "all" | "verified" | "not_verified" | "arogyaa";
  const [verifiedFilter, setVerifiedFilter] = useState<FilterType>("all");

  // dropdown anchor
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const { doctor, reduxLoading } = useSelector(
    (state: RootState) => state.doctor
  );
  const dispatch: AppDispatch = useDispatch();
  const router = useRouter();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const apiParams = useMemo(() => {
    const isVerified =
      verifiedFilter === "verified"
        ? true
        : verifiedFilter === "not_verified"
          ? false
          : undefined;

    const createdFrom = verifiedFilter === "arogyaa" ? "arogyaa" : undefined;

    return {
      page: currentPage + 1,
      limit: pageSize,
      search: inputValue,
      isVerified,
      createdFrom,
    };
  }, [currentPage, pageSize, inputValue, verifiedFilter]);

  const { value: data, refetch } = useGetDoctor(
    null,
    "get-doctors",
    apiParams.page,
    apiParams.limit,
    apiParams.search,
    apiParams.isVerified,
    apiParams.createdFrom
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

  const handleFilterChange = (next: FilterType | null) => {
    if (!next) return;
    setVerifiedFilter(next);
    setCurrentPage(0);
  };

  const COLOR: Record<FilterType, string> = {
    all: "#1976D2", // blue
    verified: "#2E7D32", // green
    not_verified: "#D32F2F", // red
    arogyaa: "#EF6C00", // amber/orange
  };

  const LABEL: Record<FilterType, string> = {
    all: "All",
    verified: "Verified",
    not_verified: "Not Verified",
    arogyaa: "Arogyaa",
  };

  const ICON: Record<FilterType, React.ReactNode> = {
    all: <PeopleAltIcon fontSize="small" />,
    verified: <VerifiedIcon fontSize="small" />,
    not_verified: <CancelIcon fontSize="small" />,
    arogyaa: <LocalHospitalIcon fontSize="small" />,
  };

  const ActiveIcon = useMemo(() => {
    const el = ICON[verifiedFilter] as React.ReactElement;
    return React.cloneElement(el, {
      sx: { color: COLOR[verifiedFilter] },
      fontSize: "small",
    });
  }, [verifiedFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const FilterButton = (
    <Button
      variant="contained"
      disableElevation
      startIcon={<AssignmentTurnedInOutlinedIcon />}
      endIcon={
        <ArrowDropDownIcon
          sx={{
            transform: open ? "rotate(180deg)" : "none",
            transition: "0.2s",
          }}
        />
      }
      onClick={(e) => setAnchorEl(e.currentTarget)}
      sx={{
        textTransform: "none",
        borderRadius: 2,
        px: 1.5,
        py: 0.5,
        backgroundColor: "#ECECEC",
        color: "#3A3A3A",
        boxShadow: "none",
        "&:hover": { backgroundColor: "#E6E6E6", boxShadow: "none" },
      }}
    >
      <Stack direction="row" spacing={1.25} alignItems="center">
        <Typography fontWeight={600}>Is Verified</Typography>
        <Stack direction="row" spacing={0.75} alignItems="center">
          {ActiveIcon}
          <Typography fontWeight={700} sx={{ color: COLOR[verifiedFilter] }}>
            {LABEL[verifiedFilter]}
          </Typography>
        </Stack>
      </Stack>
    </Button>
  );

  return (
    <Stack spacing={3}>
      {isMobile ? (
        <Stack spacing={2} px={2}>
          <Typography variant="h5" fontWeight={600}>
            Doctor
          </Typography>

          {FilterButton}

          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={() => setAnchorEl(null)}
            PaperProps={{
              elevation: 8,
              sx: { mt: 1, borderRadius: 2, py: 0.5, minWidth: 220 },
            }}
          >
            {(
              ["all", "verified", "not_verified", "arogyaa"] as FilterType[]
            ).map((k) => (
              <MenuItem
                key={k}
                onClick={() => {
                  handleFilterChange(k);
                  setAnchorEl(null);
                }}
                sx={{
                  py: 1,
                  "& .MuiListItemIcon-root": { minWidth: 34 },
                }}
              >
                <ListItemIcon sx={{ color: COLOR[k] }}>{ICON[k]}</ListItemIcon>
                <ListItemText
                  primary={LABEL[k]}
                  primaryTypographyProps={{
                    sx: { color: COLOR[k], fontWeight: 600 },
                  }}
                />
              </MenuItem>
            ))}
          </Menu>

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

          {FilterButton}

          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={() => setAnchorEl(null)}
            PaperProps={{
              elevation: 8,
              sx: { mt: 1, borderRadius: 2, py: 0.5, minWidth: 220 },
            }}
          >
            {(
              ["all", "verified", "not_verified", "arogyaa"] as FilterType[]
            ).map((k) => (
              <MenuItem
                key={k}
                onClick={() => {
                  handleFilterChange(k);
                  setAnchorEl(null);
                }}
                sx={{
                  py: 1,
                  "& .MuiListItemIcon-root": { minWidth: 34 },
                }}
              >
                <ListItemIcon sx={{ color: COLOR[k] }}>{ICON[k]}</ListItemIcon>
                <ListItemText
                  primary={LABEL[k]}
                  primaryTypographyProps={{
                    sx: { color: COLOR[k], fontWeight: 600 },
                  }}
                />
              </MenuItem>
            ))}
          </Menu>

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
