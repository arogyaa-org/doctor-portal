import { useRouter } from "next/navigation";
import { Typography, Button, Box } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import { EditRounded } from "@mui/icons-material";
import VerifiedIcon from "@mui/icons-material/Verified";
import CancelIcon from "@mui/icons-material/Cancel";
import { green, red } from "@mui/material/colors";
import React, { useState } from "react";
import { Utility } from "@/utils";
import { paths } from "@/paths";

export const doctorDatagridColumns = (): GridColDef[] => {
  const router = useRouter();
  const { capitalizeFirstLetter, formatDoctorName } = Utility();

  const handleActionEdit = (doctorId: string | number) => {
    router.push(paths.dashboard.doctorUpdate(doctorId));
  };

  return [
    {
      field: "username",
      headerName: "Name",
      headerClassName: "super-app-theme--header",
      headerAlign: "center",
      align: "left",
      flex: 1.3,
      renderCell: (params) => (
        <Typography fontSize="15px" sx={{ fontWeight: "bold" }}>
          {formatDoctorName(params.value)}
        </Typography>
      ),
    },
    {
      field: "email",
      headerName: "Email",
      headerClassName: "super-app-theme--header",
      headerAlign: "center",
      align: "left",
      flex: 1.5,
    },
    {
      field: "experience",
      headerName: "Experience (Years)",
      headerClassName: "super-app-theme--header",
      headerAlign: "center",
      align: "center",
      flex: 0.7,
      renderCell: (params) => (
        <Typography fontSize="14px" sx={{ textAlign: "center", width: "100%" }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: "bio",
      headerName: "Bio",
      headerClassName: "super-app-theme--header",
      headerAlign: "center",
      align: "left",
      flex: 1.5,
      renderCell: (params) => {
        const [expanded, setExpanded] = useState(false);
        const toggleExpanded = () => setExpanded(!expanded);
        const content = capitalizeFirstLetter(params.row.bio) || "N/A";
        const isOverflowing = content.length > 70;

        return (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              minHeight: 47,
            }}
          >
            <Typography
              sx={{
                whiteSpace: expanded ? "normal" : "nowrap",
                overflow: expanded ? "visible" : "hidden",
                textOverflow: expanded ? "clip" : "ellipsis",
                fontSize: "14px",
              }}
            >
              {content}
            </Typography>
            {isOverflowing && (
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <Typography
                  onClick={toggleExpanded}
                  sx={{
                    cursor: "pointer",
                    color: "#1976D2",
                    fontSize: "14px",
                    textDecoration: "underline",
                  }}
                >
                  {expanded ? "Show Less" : "Read More"}
                </Typography>
              </Box>
            )}
          </Box>
        );
      },
    },
    {
      field: "isVerified",
      headerName: "Verified",
      headerClassName: "super-app-theme--header",
      headerAlign: "center",
      align: "center",
      flex: 0.5,
      renderCell: ({ row: { isVerified } }) => (
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center", // vertical center
            justifyContent: "center", // horizontal center
          }}
        >
          {isVerified ? (
            <VerifiedIcon sx={{ color: green[600] }} titleAccess="Verified" />
          ) : (
            <CancelIcon sx={{ color: red[600] }} titleAccess="Not Verified" />
          )}
        </Box>
      ),
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
