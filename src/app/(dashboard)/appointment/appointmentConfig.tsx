/**
 * Copyright © 2024, F2Fintech Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of F2Fintech Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with F2Fintech.
 */

import { Typography, Box, Button, Select, MenuItem } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import { format } from "date-fns";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Utility } from "@/utils";
import { paths } from "@/paths";
import {
  CheckCircle,
  HourglassEmpty,
  Event,
  Cancel,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";

export const datagridColumns = ({
  handleStatusChange,
}: {
  refetch: () => void;
  selectedStatus: string;
  selectedDateFilter: string;
  handleStatusChange: (appointmentId: string, newStatus: string) => void;
}): GridColDef[] => {
  const { capitalizeFirstLetter } = Utility();
  const role = Utility().decodedToken()?.role;
  const router = useRouter();

  const doctorColumn: GridColDef = {
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
  };

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
      headerAlign: "center",
      align: "center",
      flex: 1.5,
      sortable: false,
      renderCell: ({ row: { _id, status } }) => {
        const statusOptions = [
          {
            value: "scheduled",
            label: "Scheduled",
            color: "#0056b3",
            icon: <Event fontSize="small" />,
          },
          {
            value: "rescheduled",
            label: "Rescheduled",
            color: "#856404",
            icon: <HourglassEmpty fontSize="small" />,
          },
          {
            value: "approved",
            label: "Approved",
            color: "#2D9735",
            icon: <CheckCircle fontSize="small" />,
          },
          {
            value: "rejected",
            label: "Rejected",
            color: "red",
            icon: <Cancel fontSize="small" />,
          },
          {
            value: "pending",
            label: "Pending",
            color: "#f39c12",
            icon: <HourglassEmpty fontSize="small" />,
          },
        ];

        const selectedStatus = statusOptions.find(
          (option) => option.value === status
        );

        return (
          <Select
            value={status}
            onChange={(e) => handleStatusChange(_id, e.target.value)}
            variant="outlined"
            size="small"
            displayEmpty
            sx={{
              borderRadius: "20px",
              width: "100%",
              height: "36px",
              textAlign: "center",
              backgroundColor: selectedStatus
                ? selectedStatus.color + "30"
                : "#f8f9fa",
              color: selectedStatus?.color || "#000",
              fontWeight: "500",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              "& .MuiSelect-select": {
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px", // Adds spacing between icon and text
              },
            }}
            renderValue={() => (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                }}
              >
                {selectedStatus?.icon}
                <Typography
                  sx={{ fontWeight: 500, color: selectedStatus?.color }}
                >
                  {selectedStatus?.label}
                </Typography>
              </Box>
            )}
          >
            {statusOptions
              .filter((option) => option.value !== status)
              .map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 1.5,
                      color: option.color,
                    }}
                  >
                    {option.icon}
                    {option.label}
                  </Box>
                </MenuItem>
              ))}
          </Select>
        );
      },
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
              router.push(paths.dashboard.appointmentDetails_id(_id))
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

  if (role !== "doctor") {
    columns.splice(1, 0, doctorColumn);
  }

  return columns;
};
