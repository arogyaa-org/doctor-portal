"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Button, Card, Stack, Typography } from "@mui/material";
import CreateIcon from "@mui/icons-material/Create";

import FormInModal from "./FormInModal";
import Search from "@/components/common/Search";
import ServerPaginationGrid from "@/components/common/Datagrid"; 

import type { AppDispatch, RootState } from "@/redux/store";
import { setSpeciality } from "@/redux/features/specialitySlice";
import { useGetSpeciality } from "@/hooks/Speciality"; 
import { SpecialityDatagridColumns } from "./specialityConfig";

const ITEMS_PER_PAGE = 10;

const Page: React.FC = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSpecialityId, setSelectedSpecialityId] = useState<
    string | null
  >(null);
  const [currentPage, setCurrentPage] = useState(1); 
  const [pageSize, setPageSize] = useState(ITEMS_PER_PAGE); 

  const dispatch: AppDispatch = useDispatch();
  const { Speciality, reduxLoading } = useSelector(
    (state: RootState) => state.speciality
  );

  // Fetch data based on currentPage and pageSize
  const { value: data, refetch } = useGetSpeciality(
    null,
    "speciality/get-speciality",
    currentPage,
    pageSize // Pass current page size here
  );

  useEffect(() => {
    if (data?.results) {
      dispatch(setSpeciality(data)); 
    }
  }, [data?.results?.length, currentPage]);

  const handleOpenDialog = (SpecialityId: string | null = null) => {
    setSelectedSpecialityId(SpecialityId);
    setOpenDialog(!openDialog);
    console.log("open dialog called");
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage); 
  };

  // Handle page size change
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize); // Update the page size when changed
    setCurrentPage(1); // Reset to the first page when page size changes
  };

  return (
    <Stack spacing={3}>
      {/* Page Header */}
      <Stack spacing={1} sx={{ flex: "1 1 auto" }}>
        <Typography variant="h4">Speciality</Typography>
      </Stack>

      {/* Data Table and Actions */}
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

        {/* DataGrid for Displaying Speciality */}
        <ServerPaginationGrid
          columns={SpecialityDatagridColumns(handleOpenDialog)}
          count={Speciality?.total}
          rows={Speciality?.results}
          loading={reduxLoading}
          pageSizeOptions={[10, 15, 20]} // Options for page size
          onPageChange={(params: any) => handlePageChange(params + 1)} // Adjust page (0-based)
          onPageSizeChange={handlePageSizeChange} // Handle page size change
        />
      </Card>
      <FormInModal
        openDialog={openDialog}
        setOpenDialog={setOpenDialog}
        SpecialityId={selectedSpecialityId}
        refetch={refetch}
      />
    </Stack>
  );
};

export default Page;
