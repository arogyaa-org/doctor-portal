import { Box, Button, Typography } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import { EditRounded } from "@mui/icons-material";
import React, { useState } from "react";

export const symptomDatagridColumns = (handleOpenDialog): GridColDef[] => {
  const handleActionEdit = (_id: string | number) => {
    handleOpenDialog(_id);
  };

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Name",
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
      align: "left",
      flex: 2,
      renderCell: (params) => {
        const [expanded, setExpanded] = useState(false);

        const toggleExpanded = () => {
          setExpanded(!expanded);
        };

        const content = params.row.description || "N/A";
        const isOverflowing = content.length > 70;

        return (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              whiteSpace: "normal",
              minHeight:47
            }}
          >
            <Typography
              sx={{
                whiteSpace: expanded ? "normal" : "nowrap",
                overflow: expanded ? "visible" : "hidden",
                textOverflow: expanded ? "clip" : "ellipsis",
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
