import { Box, Button, Typography } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import { EditRounded } from "@mui/icons-material";

export const SpecialityDatagridColumns = (handleOpenDialog): GridColDef[] => {
  const handleActionEdit = (_id: string | number) => {
    console.log("edit clicked", _id);
    handleOpenDialog(_id);
  };

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Speciality Name",
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
      field: "action",
      headerName: "Action",
      headerAlign: "center",
      align: "center",
      flex: 1,
      minWidth: 100,
      renderCell: ({ row: { _id } }) => (
        <Box
          width="85%"
          m="0 auto"
          p="5px"
          display="flex"
          justifyContent="center"
        >
          <Button
            color="info"
            variant="contained"
            onClick={() => handleActionEdit(_id)}
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
