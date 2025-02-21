/**
 * Copyright © 2024, F2Fintech Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of F2Fintech Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with F2Fintech.
 */

import { Typography, Box, Button } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import { format } from "date-fns";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Utility } from "@/utils";
import { paths } from "@/paths";
import { useRouter } from "next/navigation";

export const datagridColumns = (): GridColDef[] => {
  const { capitalizeFirstLetter } = Utility();

  const router = useRouter();

  const columns: GridColDef[] = [
    {
      field: "patientId",
      headerName: "Patient",
      headerClassName: "super-app-theme--header",
      headerAlign: "center",
      align: "center",
      flex: 1,
      renderCell: ({ row: { patientId } }) => (
        <Typography>
          {capitalizeFirstLetter(patientId?.username) || "N/A"}
        </Typography>
      ),
    },
    {
      field: "doctorId",
      headerName: "Doctor",
      headerClassName: "super-app-theme--header",
      headerAlign: "center",
      align: "center",
      flex: 1,
      renderCell: ({ row: { doctorId } }) => (
        <Typography>
          {capitalizeFirstLetter(doctorId?.username) || "N/A"}
        </Typography>
      ),
    },
    {
      field: "appointmentDate",
      headerName: "Date",
      headerClassName: "super-app-theme--header",
      headerAlign: "center",
      align: "center",
      flex: 1,
      minWidth: 80,
      renderCell: ({ row: { appointmentDate } }) => (
        <Typography>
          {appointmentDate
            ? format(new Date(appointmentDate), "dd-MM-yyyy")
            : "N/A"}
        </Typography>
      ),
    },
    {
      field: "appointmentTime",
      headerName: "Time",
      headerClassName: "super-app-theme--header",
      headerAlign: "center",
      align: "center",
      flex: 1,
      minWidth: 80,
      renderCell: ({ row: { appointmentTime } }) => (
        <Typography>{appointmentTime || "N/A"}</Typography>
      ),
    },
    {
      field: "appointmentType",
      headerName: "Type",
      headerClassName: "super-app-theme--header",
      headerAlign: "center",
      align: "center",
      flex: 1,
      minWidth: 80,
      renderCell: ({ row: { appointmentType } }) => (
        <Typography>
          {capitalizeFirstLetter(appointmentType) || "N/A"}
        </Typography>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      headerClassName: "super-app-theme--header",
      headerAlign: "center",
      align: "center",
      flex: 1.5,
      sortable: false,
      renderCell: ({ row: { status } }) => (
        <Typography>{capitalizeFirstLetter(status) || "N/A"}</Typography>
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
            onClick={() =>
            router.push(paths.dashboard.appointmentDetails_id(_id)) // for dynamic page 
            // router.push(paths.dashboard.appointmentDetails)           // for static page
            }
            sx={{
              minWidth: "50px",
              background: "linear-gradient(45deg, #2196F3 30%, #1976D2 90%)",
            }}
          >
            <VisibilityIcon />
          </Button>
        </Box>
      ),
    },
  ];

  return columns;
};
