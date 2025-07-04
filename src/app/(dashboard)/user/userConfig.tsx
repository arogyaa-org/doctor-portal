import { useRouter } from "next/navigation";
import { Typography, Button, Box } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import { EditRounded } from "@mui/icons-material";
import React, { useState } from "react";

import { paths } from "@/paths";

export const userDatagridColumns = (): GridColDef[] => {
  const router = useRouter();

  const handleActionEdit = (userId: string | number) => {
    router.push(paths.dashboard.userUpdate(userId));
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
      field: "gender",
      headerName: "Gender",
      headerClassName: "super-app-theme--header",
      headerAlign: "center",
      align: "center",
      flex: 1,
    },
    {
      field: "designation",
      headerName: "Designation",
      headerClassName: "super-app-theme--header",
      headerAlign: "center",
      align: "center",
      flex: 1,
    },
    {
      field: "action",
      headerName: "Action",
      headerClassName: "super-app-theme--header",
      headerAlign: "center",
      align: "center",
      flex: 1,
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
            sx={{
              minWidth: "50px",
              background: "linear-gradient(45deg, #2196F3 30%, #1976D2 90%)",
            }}
          >
            <EditRounded />
          </Button>
        </Box>
      ),
    },
  ];
};
