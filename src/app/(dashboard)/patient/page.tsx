"use client";

import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, Stack, Typography, Box } from "@mui/material";
import { isEqual } from "lodash";

import Search from "@/components/common/Search";
import ServerPaginationGrid from "@/components/common/Datagrid";
import type { AppDispatch, RootState } from "@/redux/store";
import { patientDatagridColumns as datagridColumns } from "./patientConfig";
import { useGetPatient } from "@/hooks/patient";
import { setPatient } from "@/redux/features/patientSlice";
import { Utility } from "@/utils";
import { useEffect } from "react";

const ITEMS_PER_PAGE = 10;

const Page: React.FC = () => {
  const [currentPage, setCurrentPage] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(ITEMS_PER_PAGE);
  const [inputValue, setInputValue] = React.useState("");
  const dispatch = useDispatch<AppDispatch>();
  const { patient } = useSelector((state: RootState) => state.patient);

  const { decodedToken } = Utility();
  const role = decodedToken?.role;
  const doctorId = decodedToken?.id;

  const apiEndpoint =
    role === "doctor" && doctorId
      ? `get-patients-by-doctor-id/${doctorId}`
      : "get-patients";

  const {
    value: data,
    isLoading,
    refetch,
  } = useGetPatient(null, apiEndpoint, currentPage + 1, pageSize, inputValue);

  useEffect(() => {
    if (data?.results && !isEqual(data, patient)) {
      dispatch(setPatient(data));
    }
  }, [data, patient, dispatch, data?.results?.length]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(0);
  };

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
          sx={{ flex: 1, fontWeight: 600, marginLeft: "25px" }}
        >
          Patient
        </Typography>
        <Box sx={{ maxWidth: "350px", width: "100%", marginRight: "25px" }}>
          <Search refetchAPI={handleSearch} holderText="Patient" />
        </Box>
      </Stack>

      <Card>
        <ServerPaginationGrid
          columns={datagridColumns()}
          count={patient?.count || 0}
          rows={patient?.results || []}
          loading={isLoading}
          page={currentPage}
          pageSize={pageSize}
          pageSizeOptions={[5, 10, 20]}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          noRowsMessage="No Patient Available"
        />
      </Card>
    </Stack>
  );
};

export default Page;
