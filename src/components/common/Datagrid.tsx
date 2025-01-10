/**
 * Copyright © 2023, F2Fintech Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of F2Fintech Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with F2Fintech.
 */

import { useEffect, useState, useMemo } from 'react';
import { Box } from '@mui/material';
import { DataGrid, GridToolbar, GridColDef, GridRowId, GridPaginationModel } from '@mui/x-data-grid';
import LoadingSkeleton from './LoadingSkeleton'; 
import NoRows from './NoRows'; 

interface ServerPaginationGridProps {
    columns: GridColDef[];
    rows: any[];
    count?: number;
    loading: boolean;
    pageSizeOptions: number[];
    onPageChange: (page: number, pageSize: number) => void;
}

const ServerPaginationGrid: React.FC<ServerPaginationGridProps> = ({
    columns,
    rows,
    count = 0,
    loading,
    pageSizeOptions,
    onPageChange,
  }) => {
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
      page: 0,
      pageSize: 10,
    }); 

    useEffect(() => {
      setPaginationModel((prev) => ({
    ...prev,
    page: Math.min(prev.page, Math.ceil(count / prev.pageSize) - 1), 
  }));
}, [count]);

const handlePaginationModelChange = (params: GridPaginationModel) => {
  setPaginationModel(params);
  onPageChange(params.page + 1, params.pageSize); 
};

    const dataGridStyles = useMemo(
      () => ({
        "& .super-app-theme--header": {
          fontSize: 17,
          fontWeight: 600,
          alignItems: "center",
        },
        "& .mui-yrdy0g-MuiDataGrid-columnHeaderRow ": {
          background: "#2c3ce3 !important",
          color: "white",
        },
        "& .MuiDataGrid-cell": {
          fontSize: "14",
          textAlign: "center",
          verticalAlign: "middle",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        },
        "& .MuiDataGrid-row": {
          "&:nth-of-type(odd)": {
            backgroundColor: "rgb(46 38 61 / 12%)",
          },
          "&:nth-of-type(even)": {
            backgroundColor: "#ffffff",
          },
          fontWeight: 600,
          fontSize: "14px",
          boxSizing: "border-box",
        },
      }),
      []
    );

    return (
      <Box m="30px 0 0 0">
        <DataGrid
          getRowHeight={() => "auto"}
          sx={dataGridStyles}
          slots={{
            toolbar: GridToolbar,
            loadingOverlay: LoadingSkeleton,
            noRowsOverlay: NoRows,
          }}
          rows={rows}
          columns={columns}
          loading={loading}
          getRowId={(row: { _id: GridRowId }) => row._id}
          paginationMode="server"
          rowCount={count}
          pageSizeOptions={pageSizeOptions}
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationModelChange}
          disableRowSelectionOnClick
          keepNonExistentRowsSelected
        />
      </Box>
    );
  };

  export default ServerPaginationGrid;
