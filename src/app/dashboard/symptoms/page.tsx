"use client"
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Button, Card, Stack, Typography } from "@mui/material";
import { symptomDatagridColumns } from "./symptomsConfig";
import Search from '@/components/common/Search';
import { setSymptom } from "@/redux/features/symptomsSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { useModifySymptom } from "@/hooks/symptoms";
import { useGetSymptom } from "@/hooks/symptoms";
import ServerPaginationGrid from "@/components/common/Datagrid";
import FormInModal from "./FormInModal";

const ITEMS_PER_PAGE = 10;
const Page: React.FC = () => {
  const [openModal, setOpenModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [editData, setEditData] = useState<any>(null);
  const [pathKey, setPathKey] = useState<string>("");

  const dispatch: AppDispatch = useDispatch();
  const { symptom, reduxLoading } = useSelector((state: RootState) => state.symptoms);

  const { value: data, refetch } = useGetSymptom(null, "/symptoms/get-symptoms", currentPage, ITEMS_PER_PAGE);

  const { modifySymptom, loading: modifyLoading } = useModifySymptom('/symptoms/update-symptoms');
  
  useEffect(() => {
    if (data) {
      if (JSON.stringify(symptom) !== JSON.stringify(data)) {
        dispatch(setSymptom(data));
      }
    }
  }, [data?.results, dispatch, symptom]);

  const handleEditClick = (id: string, symptomData: any) => { 
    setEditData(symptomData);
    setPathKey(id); 
    setOpenModal(true); 
  };

  const handleModalSubmit = async (formData: { name: string; description: string }) => {
    try {
      if (pathKey) {
        const response = await modifySymptom(`symptoms/update-symptoms`, formData);
        console.log("Updated Symptom Response:", response);
      } else {
        console.error("No pathKey provided to update the symptom.");
        return;
      }

      await refetch(); 
      setOpenModal(false); 
      setEditData(null);
      setPathKey(""); 
    } catch (error) {
      console.error("Error during submission:", error.response?.data || error.message);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  return (
    <Stack spacing={3}>
      {/* Page Header */}
      <Stack spacing={1} sx={{ flex: "1 1 auto" }}>
        <Typography variant="h4">Symptoms</Typography>
      </Stack>

      {/* Data Table and Actions */}
      <Card>
        <Stack spacing={2} sx={{ padding: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
          <Search
          refetchAPI={refetch}
        />
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                setEditData(null); 
                setPathKey(""); 
                setOpenModal(true);
              }}
              sx={{ marginLeft: "auto" }}
            >
              Create Symptom
            </Button>
          </Box>
        </Stack>

        {/* DataGrid for Displaying Symptoms */}
        <ServerPaginationGrid
          columns={symptomDatagridColumns(handleEditClick)}
          count={symptom?.total}
          paginationMode='server'
          rows={symptom?.results}
          loading={reduxLoading || modifyLoading}
          page={currentPage - 1}
          pageSize={ITEMS_PER_PAGE}
          pageSizeOptions={[5, 10, 20]}
          onPageChange={(params) => handlePageChange(params + 1)}
        />
      </Card>

      {/* Modal for Creating/Editing Symptom */}
      <FormInModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSubmit={handleModalSubmit}
        pathKey={pathKey}
        initialData={editData}
      />
    </Stack>
  );
};

export default Page;
