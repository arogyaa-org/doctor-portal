"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  Divider,
  IconButton,
  Modal,
  Alert,
  Collapse,
  Chip,
  List,
  ListItem,
  ListItemText,
  useTheme,
  useMediaQuery,
  Select,
  MenuItem,
  Menu,
  FormControl,
} from "@mui/material";
import {
  CheckCircle,
  AddCircle,
  HourglassEmpty,
  KeyboardArrowDown,
  KeyboardArrowUp,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Description as DescriptionIcon,
  Category as CategoryIcon,
  Event as EventIcon,
  Photo as PhotoIcon,
  LocalHospital as DiagnosisIcon,
  Medication as MedicationIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";
import { fetcher, modifier } from "@/apis/apiClient";
import { Utility } from "@/utils";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import Toast from "@/components/common/Toast";
import ImagePicker from "@/components/common/ImagePicker";
import CreateTreatmentDialog from "./treatment";

interface Treatment {
  _id: string;
  patientId: string;
  name: string;
  description: string;
  status: string;
  type: string;
  photo: string;
  followUpDate?: string;
  diagnosis?: string;
  treatments: Array<{
    name: string;
    description: string;
    dose?: string;
    frequency?: string;
  }>;
}

interface TreatmentHistoryProps {
  patientId: string;
}

// eslint-disable-next-line react/function-component-definition
const TreatmentHistory: React.FC<TreatmentHistoryProps> = ({ patientId }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [expandedTreatment, setExpandedTreatment] = useState<string | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [selectedTreatmentId, setSelectedTreatmentId] = useState<string | null>(
    null
  );
  const [viewImageModal, setViewImageModal] = useState(false);
  const [viewImageUrl, setViewImageUrl] = useState<string | null>(null);
  const [treatmentImage, setTreatmentImage] = useState<File | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [treatmentImagePreview, setTreatmentImagePreview] = useState<
    string | null
  >(null);
  const treatmentFileInputRef = useRef<HTMLInputElement>(null);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [descriptionModalOpen, setDescriptionModalOpen] = useState(false);
  const [currentTreatment, setCurrentTreatment] = useState<Treatment | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  // New state for tracking status dropdown menus
  const [statusMenuAnchors, setStatusMenuAnchors] = useState<{
    [key: string]: HTMLElement | null;
  }>({});

  // global state for snackbar from Redux
  const { toast } = useSelector((state: RootState) => state.toast);
  const { toastAndNavigate } = Utility();

  const dispatch: AppDispatch = useDispatch();
  const { capitalizeFirstLetter } = Utility();

  // Function to fetch treatment data from API using patientId prop
  const fetchTreatments = useCallback(async () => {
    if (patientId) {
      try {
        setLoading(true);
        const response = await fetcher(
          "treatment",
          `get-treatments-by-patientId/${patientId}`
        );

        if (!response) {
          throw new Error("No response from the API");
        }

        const allTreatments = response.results || [];
        setTreatments(allTreatments);
        setError(null);
      } catch (error) {
        console.error("Error fetching treatments:", error);
        setError(error instanceof Error ? error.message : String(error));
        setTreatments([]);
      } finally {
        setLoading(false);
      }
    }
  }, [patientId]);

  useEffect(() => {
    fetchTreatments();
  }, [fetchTreatments]);

  const handleToggleExpand = (treatmentId: string) => {
    setExpandedTreatment(
      expandedTreatment === treatmentId ? null : treatmentId
    );
  };

  // Open modal for uploading image
  const handleOpenModal = (treatmentId: string) => {
    setSelectedTreatmentId(treatmentId);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedTreatmentId(null);
  };

  const handleOpenDescriptionModal = (treatment: Treatment) => {
    setCurrentTreatment(treatment);
    setDescriptionModalOpen(true);
  };

  const handleCloseDescriptionModal = () => {
    setDescriptionModalOpen(false);
    setCurrentTreatment(null);
  };

  // Upload treatment image
  const handleUpload = useCallback(async () => {
    if (!selectedTreatmentId || !treatmentImage) return;

    try {
      setIsUploading(true);

      const headers = {
        "Content-Type": "multipart/form-data",
      };
      const response = await modifier(
        "treatment",
        "update-treatment",
        {
          _id: selectedTreatmentId,
          photo: treatmentImage,
        },
        headers
      );

      if (!response) {
        throw new Error("No response from the API");
      }
      toastAndNavigate(
        dispatch,
        true,
        "success",
        "Image uploaded successfully"
      );
      handleCloseModal();
      fetchTreatments();
    } catch (error) {
      console.error("Error uploading image:", error);
      toastAndNavigate(dispatch, true, "error", "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  }, [selectedTreatmentId, treatmentImage, toastAndNavigate, dispatch, fetchTreatments]);

  // Open image viewer modal
  const handleOpenViewImageModal = (imageUrl: string) => {
    setViewImageUrl(imageUrl);
    setViewImageModal(true);
  };

  const handleCloseViewImageModal = (event: React.MouseEvent) => {
    event.stopPropagation();
    setViewImageModal(false);
    setViewImageUrl(null);
  };

  // Status menu handling
  const handleStatusMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    treatmentId: string
  ) => {
    event.stopPropagation(); // Prevent treatment expansion when clicking dropdown
    setStatusMenuAnchors((prev) => ({
      ...prev,
      [treatmentId]: event.currentTarget,
    }));
  };

  const handleStatusMenuClose = (
    event: React.MouseEvent | null,
    treatmentId: string
  ) => {
    if (event) event.stopPropagation();
    setStatusMenuAnchors((prev) => ({
      ...prev,
      [treatmentId]: null,
    }));
  };

  // Status change handler
  const handleStatusChange = useCallback(
    async (treatmentId: string, newStatus: string) => {
      if (!treatmentId) return;

      try {
        const response = await modifier("treatment", "update-treatment", {
          _id: treatmentId,
          status: newStatus,
        });
        if (!response) {
          throw new Error("No status changes from the API");
        }
        toastAndNavigate(
          dispatch,
          true,
          "success",
          "Status updated successfully"
        );
        fetchTreatments();
        // Close the menu
        handleStatusMenuClose(null, treatmentId);
      } catch (error) {
        console.error("Error updating status:", error);
        toastAndNavigate(dispatch, true, "error", "Failed to update status");
      }
    },
    [dispatch, fetchTreatments, toastAndNavigate]
  );

  // Helper to get diagnosis from treatment or default to medication names
  const getDiagnosis = (treatment: Treatment) => {
    // If there's an explicit diagnosis field, use that
    if (treatment.diagnosis) {
      return treatment.diagnosis;
    }

    // Otherwise, use the treatment name as a fallback
    return treatment.name;
  };

  // Define status options with their icons and styling
  const statusOptions = [
    {
      value: "in progress",
      label: "In Progress",
      icon: (
        <HourglassEmpty
          sx={{
            fontSize: "1rem",
            color: "#0056b3",
          }}
        />
      ),
      chipStyle: {
        backgroundColor: "#cce5ff",
        color: "#0056b3",
      },
    },
    {
      value: "completed",
      label: "Completed",
      icon: (
        <CheckCircle
          sx={{
            fontSize: "1rem",
            color: "#2D9735",
          }}
        />
      ),
      chipStyle: {
        backgroundColor: "#d4edda",
        color: "#2D9735",
      },
    },
  ];

  const getStatusChip = (treatment: Treatment) => {
    // Find current status in options or use default
    const currentStatus =
      statusOptions.find(
        (option) => option.value === treatment.status.toLowerCase()
      ) || statusOptions[0];

    return (
      <>
        <Chip
          icon={React.cloneElement(currentStatus.icon, {
            sx: {
              ...currentStatus.icon.props.sx,
              fontSize: "1rem !important",
              color: `${currentStatus.chipStyle.color} !important`,
            },
          })}
          label={currentStatus.label}
          onClick={(e) => handleStatusMenuOpen(e, treatment._id)}
          size="medium"
          sx={{
            ...currentStatus.chipStyle,
            fontWeight: 600,
            borderRadius: "20px",
            padding: "4px 8px",
            cursor: "pointer",
            "&:hover": {
              opacity: 0.9,
            },
            "& .MuiChip-label": {
              px: 1.5,
              py: 0.5,
              fontSize: "0.9rem",
            },
          }}
        />
        <Menu
          anchorEl={statusMenuAnchors[treatment._id] || null}
          open={Boolean(statusMenuAnchors[treatment._id])}
          onClose={(e) =>
            handleStatusMenuClose(e as React.MouseEvent, treatment._id)
          }
          onClick={(e) => e.stopPropagation()}
          PaperProps={{
            elevation: 3,
            sx: {
              borderRadius: 2,
              minWidth: 180,
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            },
          }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          {statusOptions.map((option) => (
            <MenuItem
              key={option.value}
              onClick={(e) => {
                e.stopPropagation();
                handleStatusChange(treatment._id, option.value);
              }}
              sx={{
                py: 1.5,
                "&:hover": {
                  backgroundColor: option.chipStyle.backgroundColor,
                },
                ...(option.value === treatment.status.toLowerCase() && {
                  backgroundColor: option.chipStyle.backgroundColor,
                }),
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {option.icon}
                <Typography variant="body2" fontWeight={500}>
                  {option.label}
                </Typography>
              </Box>
            </MenuItem>
          ))}
        </Menu>
      </>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 3, pb: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Button
          onClick={() => setOpenCreateDialog(true)}
          sx={{
            background: "linear-gradient(45deg, #2196F3 30%, #1976D2 90%)",
            color: "white",
            fontWeight: "bold",
            padding: "8px 24px",
            borderRadius: "24px",
            fontSize: "15px",
            boxShadow: "0px 6px 12px rgba(33, 150, 243, 0.3)",
            transition: "all 0.3s ease",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            "&:hover": {
              background: "linear-gradient(45deg, #1976D2 30%, #0D47A1 90%)",
              boxShadow: "0px 8px 16px rgba(33, 150, 243, 0.4)",
              transform: "translateY(-2px)",
            },
          }}
        >
          <AddCircle sx={{ fontSize: 20 }} />
          Add Treatment
        </Button>
      </Box>

      <CreateTreatmentDialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        fetchTreatments={fetchTreatments}
        patientId={patientId}
      />

      {error ? (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      ) : null}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <Typography>Loading treatments...</Typography>
        </Box>
      ) : (
        <Paper
          elevation={3}
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
          }}
        >
          <List disablePadding>
            {treatments.map((treatment) => (
              <React.Fragment key={treatment._id}>
                <ListItem
                  onClick={() => handleToggleExpand(treatment._id)}
                  sx={{
                    py: 2,
                    px: 3,
                    borderBottom: "1px solid #eee",
                    backgroundColor:
                      expandedTreatment === treatment._id ? "#f0f7ff" : "white",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      backgroundColor: "#f5faff",
                    },
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <DiagnosisIcon
                          fontSize="medium"
                          sx={{
                            color: "primary.main",
                            mr: 1.5,
                            fontSize: "1.8rem",
                          }}
                        />
                        <Typography
                          fontWeight={600}
                          fontSize="1.1rem"
                          color="text.primary"
                        >
                          {getDiagnosis(treatment)}
                        </Typography>
                      </Box>
                    }
                  />
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    {/* Replace static status chip with dropdown status */}
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <Select
                        value={treatment.status}
                        onChange={(e) => {
                          handleStatusChange(treatment._id, e.target.value); // Call the status change handler
                        }}
                        IconComponent={KeyboardArrowDown} // Dropdown icon
                        sx={{
                          borderRadius: "20px",
                          fontWeight: 600,
                          backgroundColor:
                            treatment.status.toLowerCase() === "completed"
                              ? "#d4edda"
                              : treatment.status.toLowerCase() === "in progress"
                                ? "#cce5ff"
                                : "#f8f9fa",
                          color:
                            treatment.status.toLowerCase() === "completed"
                              ? "#2D9735"
                              : treatment.status.toLowerCase() === "in progress"
                                ? "#0056b3"
                                : "#333",
                          height: "30px", // Reduced height
                          padding: "0 12px", // Adjust padding for compactness
                          "& .MuiSelect-icon": {
                            color:
                              treatment.status.toLowerCase() === "completed"
                                ? "#2D9735"
                                : treatment.status.toLowerCase() ===
                                    "in progress"
                                  ? "#0056b3"
                                  : "#333",
                          },
                        }}
                      >
                        <MenuItem value="in progress">In Progress</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                      </Select>
                    </FormControl>

                    <IconButton
                      size="medium"
                      edge="end"
                      sx={{
                        backgroundColor:
                          expandedTreatment === treatment._id
                            ? "rgba(25, 118, 210, 0.1)"
                            : "transparent",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          backgroundColor: "rgba(25, 118, 210, 0.2)",
                        },
                      }}
                    >
                      {expandedTreatment === treatment._id ? (
                        <KeyboardArrowUp fontSize="medium" />
                      ) : (
                        <KeyboardArrowDown fontSize="medium" />
                      )}
                    </IconButton>
                  </Box>
                </ListItem>

                <Collapse
                  in={expandedTreatment === treatment._id}
                  timeout="auto"
                  unmountOnExit
                >
                  <Box sx={{ p: 1, bgcolor: "#f9fbff" }}>
                    {/* Diagnosis, Type, Follow Up, Prescription as column list */}
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, 1fr)", // 4 columns side by side
                        gap: 3,
                        p: 2,
                        borderTop: "1px solid #eee",
                        mt: -1,
                      }}
                    >
                      {/* Medications */}
                      <Box>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            mb: 0.5,
                          }}
                        >
                          <Typography variant="subtitle1" fontWeight="bold">
                            Medications
                          </Typography>
                        </Box>

                        {Array.isArray(treatment.treatments) &&
                        treatment.treatments.length > 0 ? (
                          <Box>
                            {treatment.treatments.map((med, index) => (
                              <Box
                                key={index}
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  flexWrap: "wrap",
                                  py: 0.5,
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  fontWeight={600}
                                  sx={{ mr: 1, minWidth: "70px" }}
                                >
                                  {med.name}:
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{ color: "text.secondary" }}
                                >
                                  {med.dose && `${med.frequency}`}
                                  {med.dose && med.frequency && " - "}
                                  {med.frequency && `${med.frequency}`}
                                  {med.quantity && ` (${med.quantity})`}
                                  {!med.dose &&
                                    !med.frequency &&
                                    med.description}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        ) : (
                          <Typography variant="body1">
                            {treatment.name}
                          </Typography>
                        )}
                      </Box>

                      {/* Type */}
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          fontWeight="bold"
                          color="text.primary"
                          mb={1}
                        >
                          Type
                        </Typography>
                        <Chip
                          label={capitalizeFirstLetter(treatment.type)}
                          size="small"
                          sx={{
                            backgroundColor: "rgba(25, 118, 210, 0.1)",
                            color: "primary.dark",
                            fontWeight: 500,
                          }}
                        />
                      </Box>

                      {/* Follow Up Date */}
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          fontWeight="bold"
                          color="text.primary"
                          mb={1}
                        >
                          Follow Up Date
                        </Typography>
                        <Typography variant="body2">
                          {treatment.followUpDate
                            ? dayjs(treatment.followUpDate).format(
                                "DD-MMM-YYYY"
                              )
                            : "No Follow Up Scheduled"}
                        </Typography>
                      </Box>

                      {/* Prescription Photo */}
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          fontWeight="bold"
                          color="text.primary"
                          mb={1}
                        >
                          Prescription
                        </Typography>
                        {treatment.photo ? (
                          <Box display="flex" alignItems="center" gap={1}>
                            <img
                              src={treatment.photo}
                              alt="Prescription"
                              style={{
                                width: 50,
                                height: 50,
                                borderRadius: 6,
                                objectFit: "cover",
                                cursor: "pointer",
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenViewImageModal(treatment.photo);
                              }}
                            />
                          </Box>
                        ) : (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenModal(treatment._id);
                            }}
                            startIcon={<PhotoIcon />}
                            sx={{ borderRadius: "20px", px: 2 }}
                          >
                            Upload
                          </Button>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </Collapse>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}

      {/* Description Modal */}
      <Modal open={descriptionModalOpen} onClose={handleCloseDescriptionModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "white",
            padding: 4,
            borderRadius: 3,
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            width: "90%",
            maxWidth: 550,
            maxHeight: "85vh",
            overflow: "auto",
          }}
        >
          <Typography
            variant="h5"
            sx={{ fontWeight: "bold", mb: 3, color: "primary.main" }}
          >
            Treatment Details
          </Typography>

          {currentTreatment ? (
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="subtitle1"
                fontWeight={600}
                color="text.secondary"
              >
                Diagnosis:
              </Typography>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {getDiagnosis(currentTreatment)}
              </Typography>
            </Box>
          ) : null}

          {currentTreatment &&
          Array.isArray(currentTreatment.treatments) &&
          currentTreatment.treatments.length > 0 ? (
            currentTreatment.treatments.map((t, index) => (
              <Box key={index} sx={{ mb: 3 }}>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: "bold", color: "primary.main" }}
                >
                  {t.name}
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  {t.description}
                </Typography>
                {index < currentTreatment.treatments.length - 1 && (
                  <Divider sx={{ my: 2 }} />
                )}
              </Box>
            ))
          ) : currentTreatment ? (
            <Typography variant="body1">
              {currentTreatment.description}
            </Typography>
          ) : null}

          <Button
            variant="contained"
            color="primary"
            onClick={handleCloseDescriptionModal}
            sx={{
              mt: 3,
              borderRadius: "24px",
              px: 4,
              py: 1,
              boxShadow: "0 4px 12px rgba(33, 150, 243, 0.3)",
            }}
          >
            Close
          </Button>
        </Box>
      </Modal>

      {/* Image Upload Modal */}
      {openModal && selectedTreatmentId ? (
        <ImagePicker
          open={openModal}
          onClose={handleCloseModal}
          handleUpload={handleUpload}
          fileInputRef={treatmentFileInputRef}
          image={treatmentImage}
          setImage={setTreatmentImage}
          isHovering={isHovering}
          setIsHovering={setIsHovering}
          isUploading={isUploading}
          imagePreview={treatmentImagePreview}
          setImagePreview={setTreatmentImagePreview}
        />
      ) : null}

      {/* Image Preview Modal */}
      <Modal
        open={viewImageModal}
        onClose={(event, reason) => {
          if (reason === "backdropClick") return;
          // @ts-ignore - Event handling
          handleCloseViewImageModal(event);
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <Box
            onClick={(e) => e.stopPropagation()}
            sx={{
              position: "relative",
              backgroundColor: "white",
              padding: 2,
              borderRadius: 2,
              outline: "none",
              boxShadow: 24,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Close Button */}
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                handleCloseViewImageModal(e);
              }}
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                color: "black",
                backgroundColor: "rgba(255, 255, 255, 0.6)",
                borderRadius: "50%",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                },
              }}
            >
              <CloseIcon />
            </IconButton>

            {viewImageUrl ? (
              <img
                src={viewImageUrl}
                alt="Preview"
                style={{
                  maxWidth: "90%",
                  maxHeight: "90%",
                  borderRadius: "8px",
                }}
                onClick={(e) => e.stopPropagation()}
              />
            ) : null}
          </Box>
        </Box>
      </Modal>

      <Toast
        alerting={toast.toastAlert}
        severity={toast.toastSeverity}
        message={toast.toastMessage}
      />
    </Container>
  );
};

export default TreatmentHistory;
