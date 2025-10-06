import { useRouter } from "next/navigation";
import { Typography, Button, Box, Modal, IconButton } from "@mui/material";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { EditRounded, Visibility } from "@mui/icons-material";
import VerifiedIcon from "@mui/icons-material/Verified";
import CancelIcon from "@mui/icons-material/Cancel";
import { green, red } from "@mui/material/colors";
import React, { useState } from "react";
import { Utility } from "@/utils";
import { paths } from "@/paths";

const BioCell: React.FC<{ rawBio?: string; capitalize: (s: string) => string }> = ({
  rawBio,
  capitalize,
}) => {
  const [open, setOpen] = useState(false);

  const bio = rawBio?.trim?.() || "";
  const content = bio ? capitalize(bio) : "";

  if (!content) {
    return (
      <Typography fontSize="14px" sx={{ textAlign: "center", width: "100%" }}>
        N/A
      </Typography>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <IconButton onClick={() => setOpen(true)} title="View Bio" size="small">
        <Visibility />
      </IconButton>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="bio-modal-title"
        aria-describedby="bio-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 420,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography id="bio-modal-title" variant="h6" component="h2">
            Doctor Bio
          </Typography>
          <Typography id="bio-modal-description" sx={{ mt: 2 }}>
            {content}
          </Typography>
          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={() => setOpen(false)} variant="contained">
              Close
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export const doctorDatagridColumns = (): GridColDef[] => {
  const router = useRouter();
  const { capitalizeFirstLetter, formatDoctorName, decodedToken } = Utility();
  const currentUserRole = decodedToken?.role?.toString?.().toLowerCase?.() ?? "";

  const handleActionEdit = (doctorId: string | number) => {
    router.push(paths.dashboard.doctorUpdate(doctorId));
  };

  const createdByColumn: GridColDef = {
    field: "createdByName",
    headerName: "Created By",
    headerClassName: "super-app-theme--header",
    headerAlign: "center",
    align: "left",
    flex: 1.3,
    renderCell: (params: GridRenderCellParams<any, string>) => {
      const hasAarogyaa =
        typeof params.row.createdFrom === "string" &&
        /(arogyaa)/i.test(params.row.createdFrom);
      const name = params.value ? formatDoctorName(params.value) : "N/A";

      return (
        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
          {hasAarogyaa ? "Arogyaa Public Signup" : name}
        </Typography>
      );
    },
  };

  const columns: GridColDef[] = [
    {
      field: "username",
      headerName: "Name",
      headerClassName: "super-app-theme--header",
      headerAlign: "center",
      align: "left",
      flex: 1.8,
      renderCell: (params: GridRenderCellParams<any, string>) => (
        <Typography fontSize="15px" sx={{ fontWeight: "bold" }}>
          {params.value ? formatDoctorName(params.value) : "N/A"}
        </Typography>
      ),
    },
    {
      field: "email",
      headerName: "Email",
      headerClassName: "super-app-theme--header",
      headerAlign: "center",
      align: "left",
      flex: 1.8,
      renderCell: (params: GridRenderCellParams<any, string>) => (
        <Typography fontSize="14px">{params.value || "N/A"}</Typography>
      ),
    },
    {
      field: "experience",
      headerName: "Experience (Years)",
      headerClassName: "super-app-theme--header",
      headerAlign: "center",
      align: "center",
      flex: 0.7,
      renderCell: (params: GridRenderCellParams<any, number | string>) => (
        <Typography fontSize="14px" sx={{ textAlign: "center", width: "100%" }}>
          {params.value != null && params.value !== "" ? params.value : "N/A"}
        </Typography>
      ),
    },
    {
      field: "bio",
      headerName: "Bio",
      headerClassName: "super-app-theme--header",
      headerAlign: "center",
      align: "center",
      flex: 0.7,
      renderCell: (params: GridRenderCellParams) => (
        <BioCell rawBio={params.row?.bio} capitalize={capitalizeFirstLetter} />
      ),
    },
    {
      field: "isVerified",
      headerName: "Is Verified",
      headerClassName: "super-app-theme--header",
      headerAlign: "center",
      align: "center",
      flex: 0.7,
      renderCell: ({ row: { isVerified } }) => (
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
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
    ...(currentUserRole !== "sales" ? [createdByColumn] : []),
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

  return columns;
};
