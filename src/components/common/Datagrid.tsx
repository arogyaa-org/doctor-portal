/**
 * Copyright © 2023, F2Fintech Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of F2Fintech Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with F2Fintech.
 */

import { useEffect, useState, useMemo } from "react";
import {
  DataGrid,
  GridToolbar,
  GridColDef,
  GridRowId,
  GridPaginationModel,
} from "@mui/x-data-grid";
import LoadingSkeleton from "./LoadingSkeleton";
import NoRows from "./NoRows";

interface ServerPaginationGridProps {
  columns: GridColDef[];
  rows: any[] | undefined;
  count?: number;
  loading: boolean;
  pageSizeOptions: number[];
  noRowsMessage?: string;
}

const ServerPaginationGrid: React.FC<ServerPaginationGridProps> = ({
  columns,
  rows = [],
  count = 0,
  loading,
  pageSizeOptions,
  noRowsMessage = "No data available",
}) => {
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 1,
    pageSize: 10,
  });
  const [rowCountState, setRowCountState] = useState<number>(count);

  const handlePaginationModelChange = (params: GridPaginationModel) => {
    setPaginationModel((prev) => ({
      ...prev,
      page: params.page,
      pageSize: params.pageSize,
    }));
  };

  useEffect(() => {
    setRowCountState(count);
  }, [count]);

  const dataGridStyles = useMemo(
    () => ({
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      "& .super-app-theme--header": {
        fontSize: 17,
        fontWeight: 600,
        alignItems: "center",
      },
      "& .mui-yrdy0g-MuiDataGrid-columnHeaderRow": {
        background: "rgb(11, 101, 190)   !important",
        color: "white",
      },
      "& .MuiDataGrid-cell": {
        fontSize: "14px",
        textAlign: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        whiteSpace: "normal",
        transition: "all 0.3s ease",
      },
      "& .MuiDataGrid-row": {
        backgroundColor: "#ffffff",
        fontWeight: 600,
        fontSize: "14px",
        boxSizing: "border-box",
        transition: "background-color 0.3s ease, transform 0.2s ease",
        "&:hover": {
          backgroundColor: "#e3f2fd",
          transform: "scale(1.001)",
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
        },
      },
    }),
    []
  );

  const CustomNoRowsOverlay = () => (
    <NoRows
      message={noRowsMessage}
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
      }}
    />
  );

  const minHeight = rows.length === 0 ? "400px" : "auto";

  return (
    <div style={{ width: "100%" }}>
      <DataGrid
        sx={{ ...dataGridStyles, minHeight }}
        slots={{
          toolbar: GridToolbar,
          loadingOverlay: LoadingSkeleton,
          noRowsOverlay: CustomNoRowsOverlay,
        }}
        rows={rows}
        columns={columns}
        loading={loading}
        getRowId={(row: { _id: GridRowId }) => row._id}
        paginationMode="server"
        rowCount={rowCountState}
        pageSizeOptions={pageSizeOptions}
        paginationModel={paginationModel}
        onPaginationModelChange={handlePaginationModelChange}
        disableRowSelectionOnClick
        keepNonExistentRowsSelected
        getRowHeight={() => "auto"} 
      />
    </div>
  );
};

export default ServerPaginationGrid;
