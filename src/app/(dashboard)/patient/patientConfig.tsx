import { Utility } from "@/utils";
import { Typography, Box } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import { format } from "date-fns";
import React from "react";

export const patientDatagridColumns = (): GridColDef[] => {
  const { capitalizeFirstLetter } = Utility();

  const columns: GridColDef[] = [
    {
      field: "username",
      headerName: "Name",
      headerClassName: "super-app-theme--header",
      headerAlign: "left",
      align: "center",
      flex: 1,
      minWidth: 150,
      renderCell: ({ row: { username } }) => (
        <Typography>{capitalizeFirstLetter(username) || "N/A"}</Typography>
      ),
    },
    {
      field: "email",
      headerName: "Email",
      headerClassName: "super-app-theme--header",
      headerAlign: "left",
      align: "center",
      flex: 1.5,
      minWidth: 200,
      renderCell: ({ row: { email } }) => (
        <Typography>{capitalizeFirstLetter(email) || "N/A"}</Typography>
      ),
    },
    {
      field: "contact",
      headerName: "Phone",
      headerClassName: "super-app-theme--header",
      headerAlign: "center",
      align: "center",
      flex: 1,
      minWidth: 150,
      renderCell: ({ row: { contact } }) => (
        <Typography
          sx={{
            width: "100%",
            textAlign: "center",
            fontSize: "14px",
          }}
        >
          {contact || "N/A"}
        </Typography>
      ),
    },
    {
      field: "medical_history",
      headerName: "Medical History",
      headerClassName: "super-app-theme--header",
      headerAlign: "center",
      align: "left",
      flex: 2,
      minWidth: 250,
      renderCell: (params) => {
        const content = params.row.medical_history
          ? params.row.medical_history.join(", ")
          : "N/A";
        const isOverflowing = content.length > 70;
        const [expanded, setExpanded] = React.useState(false);

        const toggleExpanded = () => setExpanded(!expanded);

        return (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center", // center horizontally
              width: "100%",
              minHeight: 47,
            }}
          >
            <Typography
              sx={{
                whiteSpace: expanded ? "normal" : "nowrap",
                overflow: expanded ? "visible" : "hidden",
                textOverflow: "ellipsis",
                textAlign: "center", // center text
                width: "100%",
                fontSize: "14px",
              }}
            >
              {content}
            </Typography>
            {isOverflowing && (
              <Typography
                onClick={toggleExpanded}
                sx={{
                  marginTop: "4px",
                  cursor: "pointer",
                  color: "#1976D2",
                  fontSize: "14px",
                  textDecoration: "underline",
                  textAlign: "center",
                  width: "100%",
                }}
              >
                {expanded ? "Show Less" : "Read More"}
              </Typography>
            )}
          </Box>
        );
      },
    },
    {
      field: "createdAt",
      headerName: "Created At",
      headerClassName: "super-app-theme--header",
      headerAlign: "center",
      align: "center",
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <Typography>
          {params.row
            ? format(new Date(params.row.createdAt), "dd-MM-yy hh:mm a")
            : "N/A"}
        </Typography>
      ),
    },
  ];

  return columns;
};
