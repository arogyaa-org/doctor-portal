import { useRouter } from "next/navigation";
import { Button, Box } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import { EditRounded } from "@mui/icons-material";
import React from "react";
import VisibilityIcon from "@mui/icons-material/Visibility";

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
      field: "countAction",
      headerName: "Doctors",
      headerClassName: "super-app-theme--header",
      headerAlign: "center",
      align: "center",
      flex: 1,
      renderCell: ({ row }) => {
        const { _id, username } = row;

        return (
          <Box
            width="85%"
            m="0 auto"
            p="5px"
            display="flex"
            justifyContent="center"
          >
            <Button
              color="secondary"
              variant="contained"
              onClick={() =>
                router.push(
                  `${paths.dashboard.salesDoctor}?createdBy=${_id}&name=${encodeURIComponent(username)}`
                )
              }
              sx={{
                minWidth: 50,
                px: 2,
                borderRadius: "50%",
                background: "linear-gradient(45deg, #2196F3 30%, #1976D2 90%)",
              }}
              aria-label={`View doctors created by ${username}`}
            >
              <VisibilityIcon /> {/* 👁 Eye icon */}
            </Button>
          </Box>
        );
      },
    },

    /** 🔹 First Action Button (Edit style like before) */
    {
      field: "editAction",
      headerName: "Edit",
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
