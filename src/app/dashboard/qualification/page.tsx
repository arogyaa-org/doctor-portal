"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Card, Stack, Typography } from "@mui/material";
import CreateIcon from "@mui/icons-material/Create";

import FormInModal from "./FormInModal";
import Search from "@/components/common/Search";
import ServerPaginationGrid from "@/components/common/Datagrid";

import type { AppDispatch, RootState } from "@/redux/store";
import { setQualification } from "@/redux/features/qualificationSlice";
import { useGetQualification } from "@/hooks/qualification";
import { qualificationDatagridColumns } from "./qualificationConfig";

const ITEMS_PER_PAGE = 10;

const Page: React.FC = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedQualificationId, setSelectedQualificationId] = useState<
    string | null
  >(null);
  const [currentPage, setCurrentPage] = useState(1);

  const dispatch: AppDispatch = useDispatch();
  const { qualification, reduxLoading } = useSelector(
    (state: RootState) => state.qualification
  );

  const { value: data, refetch } = useGetQualification(
    null,
    "get-qualifications",
    currentPage,
    ITEMS_PER_PAGE
  );

  useEffect(() => {
    if (data?.results) {
      dispatch(setQualification(data));
    }
  }, [data?.results?.length]);

  const handleOpenDialog = (qualificationId: string | null = null) => {
    setSelectedQualificationId(qualificationId);
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
          Qualification
        </Typography>

        <Stack direction="row" spacing={2} alignItems="center">
          <Search refetchAPI={refetch} holderText="Qualification" />

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
              minHeight: "45px",
            }}
          >
            Create
          </Button>
        </Stack>
      </Stack>

      <Card>
        <ServerPaginationGrid
          columns={qualificationDatagridColumns(handleOpenDialog)}
          count={qualification?.count || 0}
          paginationMode="server"
          rows={qualification?.results || []}
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
        qualificationId={selectedQualificationId}
        refetch={refetch}
      />
    </Stack>
  );
};

export default Page;
