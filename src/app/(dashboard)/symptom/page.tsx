"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Card, Stack, Typography } from "@mui/material";
import CreateIcon from "@mui/icons-material/Create";
import { isEqual } from "lodash";

import FormInModal from "./FormInModal";
import Search from "@/components/common/Search";
import ServerPaginationGrid from "@/components/common/Datagrid";

import type { AppDispatch, RootState } from "@/redux/store";
import { setSymptom } from "@/redux/features/symptomsSlice";
import { useGetSymptom } from "@/hooks/symptoms";
import { symptomDatagridColumns } from "./symptomsConfig";

const ITEMS_PER_PAGE = 10;

const Page: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(ITEMS_PER_PAGE);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSymptomId, setSelectedSymptomId] = useState<string | null>(
    null
  );
  const [inputValue, setInputValue] = React.useState<string>("");
  const [loading, setLoading] = useState(false);

  const dispatch: AppDispatch = useDispatch();
  const { symptom, reduxLoading } = useSelector(
    (state: RootState) => state.symptoms
  );

  const { value: data, refetch } = useGetSymptom(
    null,
    "get-symptoms",
    currentPage + 1,
    pageSize,
    inputValue
  );

  useEffect(() => {
    if (data?.results && !isEqual(data, symptom)) {
      dispatch(setSymptom(data));
    }
  }, [data, symptom, dispatch, data?.results?.length]);

  const handleOpenDialog = (symptomId: string | null = null) => {
    setSelectedSymptomId(symptomId);
    setOpenDialog(!openDialog);
  };

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
    setInputValue(query); // Set the search query
    await refetch(query); // Refetch with the new query, make sure refetch is awaited
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
          Symptom
        </Typography>

        <Stack direction="row" spacing={2} alignItems="center">
          <Search refetchAPI={handleSearch} holderText="Symptom" />

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
          columns={symptomDatagridColumns(handleOpenDialog)}
          count={symptom?.count}
          rows={symptom?.results}
          loading={reduxLoading}
          page={currentPage}
          pageSize={pageSize}
          pageSizeOptions={[5, 10, 20]}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          noRowsMessage="No Symtom Available"
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
