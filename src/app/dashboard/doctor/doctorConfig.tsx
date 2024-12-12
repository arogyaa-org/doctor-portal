import { useRouter } from "next/navigation";
import { Typography, Button, Box } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import { EditRounded } from "@mui/icons-material";

import { paths } from "@/paths";

export const doctorDatagridColumns = (): GridColDef[] => {
  const router = useRouter();

  const handleActionEdit = (doctorId: string | number) => {
    router.push(paths.dashboard.doctorUpdate(doctorId));
  };

  return [
    {
      field: "username",
      headerName: "Name",
      headerClassName: "super-app-theme--header",
      headerAlign: "center",
      align: "center",
      flex: 1,
    },
    {
      field: "email",
      headerName: "Email",
      headerClassName: "super-app-theme--header",
      headerAlign: "center",
      align: "center",
      flex: 1.5,
    },
    {
      field: "experience",
      headerName: "Experience (Years)",
      headerClassName: "super-app-theme--header",
      headerAlign: "center",
      align: "center",
      flex: 1,
    },
    {
      field: "bio",
      headerName: "Bio",
      headerClassName: "super-app-theme--header",
      headerAlign: "center",
      align: "center",
      flex: 2,
      renderCell: (params) => <Typography>{params.row.bio || "N/A"}</Typography>,
    },
    {
      field: "action",
      headerName: "Action",
      headerClassName: "super-app-theme--header",
      headerAlign: "center",
      align: "center",
      flex: 1,
      renderCell: ({ row: { _id } }) => (
        <Box display="flex" justifyContent="center">
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleActionEdit(_id)}
            startIcon={<EditRounded />}
          >
            Edit
          </Button>
        </Box>
      ),
    }

  ];
};
