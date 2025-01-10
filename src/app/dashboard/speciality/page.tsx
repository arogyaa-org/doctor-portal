"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Button, Card, Stack, Typography } from "@mui/material";
import CreateIcon from '@mui/icons-material/Create';

import FormInModal from "./FormInModal";
import Search from '@/components/common/Search';
import ServerPaginationGrid from "@/components/common/Datagrid";

import type { AppDispatch, RootState } from "@/redux/store";
import { setSpeciality } from "@/redux/features/specialitySlice";
import { useGetSpeciality } from "@/hooks/Speciality"; 
import { SpecialityDatagridColumns as SpecialityDatagridColumns } from "./specialityConfig";


const Page: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSpecialityId, setSelectedSpecialityId] = useState<string | null>(null);

  const { speciality, reduxLoading } = useSelector((state: RootState) => state.speciality);
  const dispatch: AppDispatch = useDispatch();

  const { value: data, swrLoading, error, refetch } = useGetSpeciality(
    null,
    "get-specialities",
    currentPage,
    pageSize,
    searchQuery
  );

  console.log("Data fetched:", data);

  useEffect(() => {
    if (data?.results?.length > 0) {
      console.log("Dispatching data to Redux:", data);
      dispatch(setSpeciality(data));
    } else {
      console.log("No data available.");
    }
  }, [data, dispatch]);

  const handleOpenDialog = (specialityId: string | null = null) => {
    setSelectedSpecialityId(specialityId);
    setOpenDialog(!openDialog);
  };

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

  if (error) {
    return <Typography color="error">Failed to fetch data. Please try again later.</Typography>;
  }

  return (
    <Stack spacing={3}>
      {/* Page Header */}
      <Stack spacing={1} sx={{ flex: "1 1 auto" }}>
        <Typography variant="h4">Speciality</Typography>
      </Stack>

      {/* Data Table and Actions */}
      <Card>
        <Stack spacing={2} sx={{ padding: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Search refetchAPI={handleSearch} placeholderText="Search Specialities" />
            <Button
              variant="contained"
              startIcon={<CreateIcon />}
              onClick={() => handleOpenDialog(null)}
              sx={{
                borderRadius: "100px",
                background: "linear-gradient(45deg, #2196F3 30%, #1976D2 90%)",
                px: 3,
                textTransform: "none",
                fontWeight: 600,
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              }}
            >
              Create Speciality
            </Button>
          </Box>
        </Stack>
        {/* DataGrid for Displaying Specialities */}
        <ServerPaginationGrid
          columns={SpecialityDatagridColumns(handleOpenDialog)}
          count={speciality?.count || 0}
          rows={speciality?.results || []}
          loading={reduxLoading || swrLoading}
          page={currentPage - 1}
          pageSize={pageSize}
          pageSizeOptions={[10, 15, 20]}
          onPageChange={(params: any) => handlePageChange(params + 1)}
          onPageSizeChange={(newSize: number) => handlePageSizeChange(newSize)}
        />
      </Card>
      <FormInModal
        openDialog={openDialog}
        setOpenDialog={setOpenDialog}
        specialityId={selectedSpecialityId}
        refetch={refetch}
      />
    </Stack>
  );
};

export default Page;
