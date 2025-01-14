"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Card, Stack, Typography } from "@mui/material";
import CreateIcon from "@mui/icons-material/Create";

import FormInModal from "./FormInModal";
import Search from "@/components/common/Search";
import ServerPaginationGrid from "@/components/common/Datagrid";

import type { AppDispatch, RootState } from "@/redux/store";
import { setSymptom } from "@/redux/features/symptomsSlice";
import { useGetSymptom } from "@/hooks/symptoms";
import { symptomDatagridColumns } from "./symptomsConfig";

const ITEMS_PER_PAGE = 10;

const Page: React.FC = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSymptomId, setSelectedSymptomId] = useState<string | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);

  const dispatch: AppDispatch = useDispatch();
  const { symptom, reduxLoading } = useSelector(
    (state: RootState) => state.symptoms
  );

  const { value: data, refetch } = useGetSymptom(
    null,
    "get-symptoms",
    currentPage,
    ITEMS_PER_PAGE
  );

  useEffect(() => {
    if (data?.results) {
      dispatch(setSymptom(data));
    }
  }, [data?.results?.length]);

  const handleOpenDialog = (symptomId: string | null = null) => {
    setSelectedSymptomId(symptomId);
    setOpenDialog(!openDialog);
  };

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
          Symptom
        </Typography>

        <Stack direction="row" spacing={2} alignItems="center">
          <Search refetchAPI={refetch} holderText="Symtom"/>

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
          columns={symptomDatagridColumns(handleOpenDialog)}
          count={symptom?.count}
          paginationMode="server"
          rows={symptom?.results}
          loading={reduxLoading}
          page={currentPage - 1}
          pageSize={ITEMS_PER_PAGE}
          pageSizeOptions={[10, 15, 20]}
          onPageChange={(params: any) => handlePageChange(params + 1)}
        />
      </Card>

      <FormInModal
        openDialog={openDialog}
        setOpenDialog={setOpenDialog}
        symptomId={selectedSymptomId}
        refetch={refetch}
      />
    </Stack>
  );
};

export default Page;
