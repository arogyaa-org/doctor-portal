import { Box, Button, Typography } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import { format } from "date-fns";
import { EditRounded } from "@mui/icons-material";

export const symptomDatagridColumns = (handleEditClick: (_id: string, symptom: any) => void): GridColDef[] => {

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Symptom Name",
      headerClassName: "super-app-theme--header",
      headerAlign: "center",
      align: "center",
      flex: 1.5,
    },
    {
      field: "description",
      headerName: "Description",
      headerClassName: "super-app-theme--header",
      headerAlign: "center",
      align: "center",
      flex: 2,
      renderCell: (params) => (
        <Typography>{params.row.description || "N/A"}</Typography>
      ),
    },
    {
      field: "createdAt",
      headerName: "Created At",
      headerClassName: "super-app-theme--header",
      headerAlign: "center",
      align: "center",
      flex: 1,
      renderCell: (params) => (
        <Typography>
          {params.row
            ? format(new Date(params.row.createdAt), "dd-MM-yy hh:mm a")
            : "N/A"}
        </Typography>
      ),
    },
    {
      field: "updatedAt",
      headerName: "Updated At",
      headerClassName: "super-app-theme--header",
      headerAlign: "center",
      align: "center",
      flex: 1,
      renderCell: (params) => (
        <Typography>
          {params.row
            ? format(new Date(params.row.updatedAt), "dd-MM-yy hh:mm a")
            : "N/A"}
        </Typography>
      ),
    },
    {
      field: "action",
      headerName: "Action",
      headerAlign: "center",
      align: "center",
      flex: 1,
      minWidth: 100,
      renderCell: ({ row: { _id, name, description } }) => (
        <Box width="85%" m="0 auto" p="5px" display="flex" justifyContent="space-around">
          <Button
            color="info"
            variant="contained"
            onClick={() => handleEditClick(_id, { name, description })}
            sx={{ minWidth: "50px" }}
          >
            <EditRounded />
          </Button>
        </Box>
      ),
    },
  ];
  return columns;
};
