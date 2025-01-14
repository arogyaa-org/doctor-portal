"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Card, Stack, Typography } from "@mui/material";
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

  const { value: data, refetch } = useGetSpeciality(
    null,
    "get-specialities",
    currentPage,
    pageSize
  );

  useEffect(() => {
    if (data?.results) {
      dispatch(setSpeciality(data));
    }
  }, [data?.results?.length, currentPage]);

  const handleOpenDialog = (SpecialityId: string | null = null) => {
    setSelectedSpecialityId(SpecialityId);
    setOpenDialog(!openDialog);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
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
          Specialization
        </Typography>

        <Stack direction="row" spacing={2} alignItems="center">
          <Search refetchAPI={refetch} holderText="Specialization" />

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
              minHeight:"45px",
            }}
          >
            Create
          </Button>
        </Stack>
      </Stack>

      <Card>
        <ServerPaginationGrid
          columns={SpecialityDatagridColumns(handleOpenDialog)}
          count={Speciality?.count}
          rows={Speciality?.results}
          loading={reduxLoading}
          pageSizeOptions={[10, 15, 20]}
          onPageChange={(params: any) => handlePageChange(params + 1)}
          onPageSizeChange={handlePageSizeChange}
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
