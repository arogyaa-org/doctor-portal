"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Box,
  Typography,
  IconButton,
  Paper,
  Fade,
  LinearProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import Toast from "./Toast";
import { Utility } from "@/utils";
import { AppDispatch, RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";

interface ImagePickerProps {
  open: boolean;
  onClose: () => void;
  handleUpload: any;
  fileInputRef: any;
  image: any;
  setImage: any;
  isHovering: boolean;
  setIsHovering: any;
  isUploading: boolean;
  imagePreview: any;
  setImagePreview: any;
}

const ImagePicker: React.FC<ImagePickerProps> = ({
  open,
  onClose,
  handleUpload,
  fileInputRef,
  image,
  setImage,
  isHovering,
  setIsHovering,
  isUploading,
  imagePreview,
  setImagePreview,
}) => {
  const { toast } = useSelector((state: RootState) => state.toast);
  const dispatch: AppDispatch = useDispatch();
  const { toastAndNavigate } = Utility();
  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        if (reason !== "backdropClick") {
          onClose();
        }
      }}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        elevation: 24,
        sx: {
          borderRadius: 3,
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          textAlign: "center",
          bgcolor: "#20ADA0 ",
          color: "white",
          py: 2.5,
        }}
      >
        <Typography variant="h5" fontWeight="500">
          Upload Image
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ p: 4 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
            marginTop: {
              xs: "1rem",
              sm: "1rem",
              md: "1rem",
              lg: "1rem",
            },
          }}
        >
          {!imagePreview ? (
            <Paper
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              onClick={() => fileInputRef.current?.click()}
              sx={{
                width: 280,
                height: 260,
                display: "flex",
                marginTop: {
                  xs: "1rem",
                  sm: "1rem",
                  md: "1rem",
                  lg: "1rem",
                },
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                border: "2px dashed",
                borderColor: isHovering ? "#82CBC6" : "grey.300",
                borderRadius: 4,
                transition: "all 0.3s ease",
                bgcolor: isHovering ? "primary.50" : "background.paper",
                "&:hover": {
                  transform: "scale(1.02)",
                },
              }}
            >
              <Fade in={true}>
                <Box sx={{ textAlign: "center", p: 3 }}>
                  <CloudUploadIcon
                    sx={{
                      fontSize: 64,
                      color: isHovering ? "#20ADA0" : "grey.400",
                      mb: 2,
                      transition: "color 0.3s ease",
                    }}
                  />
                  <Typography
                    variant="h6"
                    color={isHovering ? "#20ADA0" : "text.secondary"}
                    gutterBottom
                  >
                    Drop your image here
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mt={1}>
                    or click to browse
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    mt={2}
                  >
                    Supported: JPG, PNG, GIF, SVG, WEBP
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Max size: 1MB
                  </Typography>
                </Box>
              </Fade>
            </Paper>
          ) : (
            <Fade in={true}>
              <Paper
                elevation={8}
                sx={{
                  position: "relative",
                  width: 280,
                  height: 280,
                  borderRadius: 4,
                  overflow: "hidden",
                }}
              >
                <IconButton
                  onClick={() => {
                    if (imagePreview) {
                      URL.revokeObjectURL(imagePreview);
                    }
                    setImage(null);
                    setImagePreview(null);
                  }}
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    bgcolor: "white",
                    boxShadow: 2,

                    "&:hover": {
                      bgcolor: "error.light",
                      color: "white",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  <DeleteIcon />
                </IconButton>
                <Box
                  component="img"
                  src={imagePreview}
                  alt="Selected Preview"
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </Paper>
            </Fade>
          )}

          <input
            ref={fileInputRef}
            hidden
            type="file"
            accept=".jpg, .gif, .png, .jpeg, .svg, .webp"
            onChange={(event) => {
              const imgfiles = event.target.files;
              if (imgfiles && imgfiles[0]) {
                const file = imgfiles[0];
                if (file.size > 1048576) {
                  toastAndNavigate(
                    dispatch,
                    true,
                    "error",
                    `${file.name} exceeds 1MB limit`
                  );
                  return;
                }
                const fileUrl = URL.createObjectURL(file);
                setImage(file);
                setImagePreview(fileUrl);
              }
            }}
          />
        </Box>
      </DialogContent>

      {isUploading && (
        <LinearProgress
          sx={{
            height: 6,
            bgcolor: "primary.50",
          }}
        />
      )}

      <DialogActions
        sx={{
          p: 3,
          bgcolor: "grey.50",
          gap: 2,
          justifyContent: "center",
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            px: 4,
            py: 1.2,
            borderRadius: 2,
            textTransform: "none",
            color: "#000",
            fontWeight: "500",
            minWidth: 120,
            borderColor: "#c75146", // Change outline color
            "&:hover": {
              color: "black",
              bgcolor: "#f4845f",
              borderColor: "#c75146", // Keep outline color on hover
            },
          }}
        >
          Cancel
        </Button>

        {/* cmplt  */}
        <Button
          onClick={handleUpload}
          //   variant="contained"
          disabled={!image || isUploading}
          sx={{
            px: 4,
            py: 1,
            borderRadius: 2,
            textTransform: "none",
            color: "white",
            bgcolor: "#20ADA0",

            fontWeight: "500",
            minWidth: 120,
            boxShadow: 2,
            "&:hover": {
              color: "#fff",
              bgcolor: "#198A80        ",
            },
          }}
        >
          {isUploading ? "Uploading..." : "Upload"}
        </Button>
      </DialogActions>
      <Toast
        alerting={toast.toastAlert}
        severity={toast.toastSeverity}
        message={toast.toastMessage}
      />
    </Dialog>
  );
};

export default ImagePicker;
