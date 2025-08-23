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
  TablePagination,
  Card,
  CardContent,
  Stack,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Skeleton,
  Fab,
  Avatar,
} from "@mui/material";
import { styled } from "@mui/material/styles";
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
  ExpandMore as ExpandMoreIcon,
  AccessTime as AccessTimeIcon,
  CalendarToday as CalendarIcon,
  Healing as HealingIcon,
  Assignment as AssignmentIcon,
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

// Styled Components
const StyledContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(1),
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(2),
  },
  [theme.breakpoints.up("md")]: {
    padding: theme.spacing(3),
  },
}));

const HeaderSection = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
  [theme.breakpoints.up("sm")]: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
}));

const StyledFab = styled(Fab)(({ theme }) => ({
  position: "fixed",
  bottom: theme.spacing(2),
  right: theme.spacing(2),
  zIndex: 1000,
  background: "linear-gradient(135deg, #2196F3 0%, #1976D2 100%)",
  color: "white",
  boxShadow: "0 4px 20px rgba(33, 150, 243, 0.4)",
  "&:hover": {
    background: "linear-gradient(135deg, #1976D2 0%, #0D47A1 100%)",
    transform: "scale(1.1)",
  },
  transition: "all 0.3s ease",
}));

const MobileCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: theme.spacing(2),
  boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
  border: `1px solid ${theme.palette.divider}`,
  overflow: "hidden",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
  },
}));

const StatusChip = styled(Chip)(({ theme }) => ({
  fontWeight: 600,
  fontSize: "0.75rem",
  height: "28px",
  borderRadius: "14px",
  "& .MuiChip-icon": {
    fontSize: "16px",
  },
}));

const DetailItem = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  padding: theme.spacing(1, 0),
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: "20px",
  textTransform: "none",
  fontWeight: 600,
  padding: theme.spacing(0.5, 2),
  minWidth: "auto",
  fontSize: "0.875rem",
}));

const EmptyStateContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(6, 2),
  textAlign: "center",
  backgroundColor: "rgba(25, 118, 210, 0.02)",
  borderRadius: theme.spacing(2),
  border: `2px dashed rgba(25, 118, 210, 0.2)`,
}));

// eslint-disable-next-line react/function-component-definition
const TreatmentHistory: React.FC<TreatmentHistoryProps> = ({ patientId }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isTablet = useMediaQuery(theme.breakpoints.down("lg"));

  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalCount, setTotalCount] = useState(0);
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
  const [statusMenuAnchors, setStatusMenuAnchors] = useState<{
    [key: string]: HTMLElement | null;
  }>({});

  // Global state for snackbar from Redux
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
          `get-treatments-by-patientId/${patientId}?page=${page + 1}&limit=${rowsPerPage}`
        );

        if (!response) {
          throw new Error("No response from the API");
        }

        const allTreatments = response.results || [];
        const count = response.count || 0;
        setTreatments(allTreatments);
        setTotalCount(count);
        setError(null);
      } catch (error) {
        console.error("Error fetching treatments:", error);
        setError(error instanceof Error ? error.message : String(error));
        setTreatments([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    }
  }, [patientId, page, rowsPerPage]);

  useEffect(() => {
    fetchTreatments();
  }, [fetchTreatments]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

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
  }, [
    selectedTreatmentId,
    treatmentImage,
    toastAndNavigate,
    dispatch,
    fetchTreatments,
  ]);

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
    event.stopPropagation();
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
    if (treatment.diagnosis) {
      return treatment.diagnosis;
    }
    return treatment.name;
  };

  // Define status options with their icons and styling
  const statusOptions = [
    {
      value: "in progress",
      label: "In Progress",
      icon: <HourglassEmpty sx={{ fontSize: "1rem", color: "#0056b3" }} />,
      chipStyle: {
        backgroundColor: "#cce5ff",
        color: "#0056b3",
      },
    },
    {
      value: "completed",
      label: "Completed",
      icon: <CheckCircle sx={{ fontSize: "1rem", color: "#2D9735" }} />,
      chipStyle: {
        backgroundColor: "#d4edda",
        color: "#2D9735",
      },
    },
  ];

  const getStatusConfig = (status: string) => {
    return (
      statusOptions.find((option) => option.value === status.toLowerCase()) ||
      statusOptions[0]
    );
  };

  // Mobile Treatment Card Component
  const MobileTreatmentCard = ({ treatment }: { treatment: Treatment }) => {
    const statusConfig = getStatusConfig(treatment.status);
    const isExpanded = expandedTreatment === treatment._id;

    return (
      <MobileCard>
        <CardContent sx={{ p: 0 }}>
          {/* Header */}
          <Box
            sx={{
              p: 2,
              pb: 1,
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              cursor: "pointer",
            }}
            onClick={() => handleToggleExpand(treatment._id)}
          >
            <Box
              sx={{
                flex: 1,
                display: "flex",
                alignItems: "flex-start",
                gap: 1.5,
              }}
            >
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: "primary.main",
                  fontSize: "1.2rem",
                }}
              >
                <HealingIcon />
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  color="primary"
                  sx={{
                    fontSize: "1.1rem",
                    lineHeight: 1.2,
                    mb: 0.5,
                  }}
                >
                  {getDiagnosis(treatment)}
                </Typography>
                <StatusChip
                  icon={statusConfig.icon}
                  label={statusConfig.label}
                  size="small"
                  sx={{
                    ...statusConfig.chipStyle,
                    fontSize: "0.75rem",
                    height: "24px",
                  }}
                />
              </Box>
            </Box>
            <IconButton
              sx={{
                color: "primary.main",
                transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.3s ease",
              }}
            >
              <ExpandMoreIcon />
            </IconButton>
          </Box>

          {/* Expandable Content */}
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <Divider />
            <Box sx={{ p: 2 }}>
              <Grid container spacing={2}>
                {/* Medications */}
                <Grid item xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="subtitle2"
                      fontWeight="bold"
                      color="primary"
                      sx={{
                        mb: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <MedicationIcon fontSize="small" />
                      Medications
                    </Typography>
                    {Array.isArray(treatment.treatments) &&
                    treatment.treatments.length > 0 ? (
                      <Stack spacing={1}>
                        {treatment.treatments.map((med, index) => (
                          <Paper
                            key={index}
                            sx={{
                              p: 1.5,
                              backgroundColor: "rgba(25, 118, 210, 0.05)",
                              border: "1px solid rgba(25, 118, 210, 0.1)",
                            }}
                          >
                            <Typography
                              variant="body2"
                              fontWeight="600"
                              color="primary"
                            >
                              {med.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {med.dose && `${med.dose}`}
                              {med.dose && med.frequency && " - "}
                              {med.frequency && `${med.frequency}`}
                              {!med.dose && !med.frequency && med.description}
                            </Typography>
                          </Paper>
                        ))}
                      </Stack>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        {treatment.name}
                      </Typography>
                    )}
                  </Box>
                </Grid>

                {/* Details Row */}
                <Grid item xs={6}>
                  <DetailItem>
                    <CategoryIcon
                      sx={{ color: "primary.main", fontSize: 18 }}
                    />
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        Type
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {capitalizeFirstLetter(treatment.type)}
                      </Typography>
                    </Box>
                  </DetailItem>
                </Grid>

                <Grid item xs={6}>
                  <DetailItem>
                    <CalendarIcon
                      sx={{ color: "primary.main", fontSize: 18 }}
                    />
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        Follow Up
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {treatment.followUpDate
                          ? dayjs(treatment.followUpDate).format("DD MMM")
                          : "None"}
                      </Typography>
                    </Box>
                  </DetailItem>
                </Grid>

                {/* Prescription */}
                <Grid item xs={12}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      fontWeight="bold"
                      color="primary"
                      sx={{ display: "flex", alignItems: "center", gap: 1 }}
                    >
                      <PhotoIcon fontSize="small" />
                      Prescription
                    </Typography>
                    {treatment.photo ? (
                      <Box
                        component="img"
                        src={treatment.photo}
                        alt="Prescription"
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: 1,
                          objectFit: "cover",
                          cursor: "pointer",
                          border: "2px solid rgba(25, 118, 210, 0.2)",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenViewImageModal(treatment.photo);
                        }}
                      />
                    ) : (
                      <ActionButton
                        size="small"
                        variant="outlined"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenModal(treatment._id);
                        }}
                        startIcon={<PhotoIcon />}
                      >
                        Upload
                      </ActionButton>
                    )}
                  </Box>
                </Grid>

                {/* Actions */}
                <Grid item xs={12}>
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                      justifyContent: "flex-end",
                      mt: 1,
                    }}
                  >
                    <FormControl size="small">
                      <Select
                        value={treatment.status}
                        onChange={(e) =>
                          handleStatusChange(treatment._id, e.target.value)
                        }
                        sx={{
                          borderRadius: "20px",
                          fontWeight: 600,
                          backgroundColor:
                            statusConfig.chipStyle.backgroundColor,
                          color: statusConfig.chipStyle.color,
                          fontSize: "0.875rem",
                          "& .MuiOutlinedInput-notchedOutline": {
                            border: "none",
                          },
                        }}
                      >
                        {statusOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              {option.icon}
                              {option.label}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Collapse>
        </CardContent>
      </MobileCard>
    );
  };

  // Loading Skeleton
  const LoadingSkeleton = () => (
    <Stack spacing={2}>
      <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2 }} />
      {[1, 2, 3].map((item) => (
        <Skeleton
          key={item}
          variant="rectangular"
          height={isMobile ? 120 : 80}
          sx={{ borderRadius: 2 }}
        />
      ))}
    </Stack>
  );

  return (
    <StyledContainer maxWidth="lg">
      <HeaderSection>
        <Box>
          <Typography
            variant="h5"
            fontWeight="bold"
            color="primary"
            gutterBottom
          >
            Treatment History
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {totalCount > 0
              ? `${totalCount} treatment${totalCount > 1 ? "s" : ""} found`
              : "No treatments found"}
          </Typography>
        </Box>

        {!isMobile && (
          <Button
            onClick={() => setOpenCreateDialog(true)}
            sx={{
              background: "linear-gradient(135deg, #2196F3 0%, #1976D2 100%)",
              color: "white",
              fontWeight: "bold",
              padding: "12px 24px",
              borderRadius: "24px",
              fontSize: "15px",
              boxShadow: "0px 4px 16px rgba(33, 150, 243, 0.3)",
              transition: "all 0.3s ease",
              "&:hover": {
                background: "linear-gradient(135deg, #1976D2 0%, #0D47A1 100%)",
                transform: "translateY(-2px)",
                boxShadow: "0px 6px 20px rgba(33, 150, 243, 0.4)",
              },
            }}
            startIcon={<AddCircle />}
          >
            Add Treatment
          </Button>
        )}
      </HeaderSection>

      {/* Mobile FAB */}
      {isMobile && (
        <StyledFab
          onClick={() => setOpenCreateDialog(true)}
          aria-label="add treatment"
        >
          <AddCircle />
        </StyledFab>
      )}

      <CreateTreatmentDialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        fetchTreatments={fetchTreatments}
        patientId={patientId}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <LoadingSkeleton />
      ) : treatments.length > 0 ? (
        <>
          {isMobile ? (
            // Mobile View - Cards
            <Box>
              {treatments.map((treatment) => (
                <MobileTreatmentCard
                  key={treatment._id}
                  treatment={treatment}
                />
              ))}
            </Box>
          ) : (
            // Desktop View - List
            <Paper
              elevation={2}
              sx={{
                borderRadius: 3,
                overflow: "hidden",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              }}
            >
              <List disablePadding>
                {treatments.map((treatment) => {
                  const statusConfig = getStatusConfig(treatment.status);
                  const isExpanded = expandedTreatment === treatment._id;

                  return (
                    <React.Fragment key={treatment._id}>
                      <ListItem
                        onClick={() => handleToggleExpand(treatment._id)}
                        sx={{
                          py: 2.5,
                          px: 3,
                          backgroundColor: isExpanded
                            ? "rgba(25, 118, 210, 0.02)"
                            : "white",
                          transition: "all 0.3s ease",
                          cursor: "pointer",
                          "&:hover": {
                            backgroundColor: "rgba(25, 118, 210, 0.04)",
                          },
                        }}
                      >
                        <ListItemText
                          primary={
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                              }}
                            >
                              <Avatar
                                sx={{
                                  width: 48,
                                  height: 48,
                                  bgcolor: "primary.main",
                                }}
                              >
                                <HealingIcon />
                              </Avatar>
                              <Box>
                                <Typography
                                  variant="h6"
                                  fontWeight="bold"
                                  color="primary"
                                  sx={{ fontSize: "1.1rem" }}
                                >
                                  {getDiagnosis(treatment)}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  Type: {capitalizeFirstLetter(treatment.type)}
                                  {treatment.followUpDate && (
                                    <>
                                      {" "}
                                      • Follow up:{" "}
                                      {dayjs(treatment.followUpDate).format(
                                        "DD MMM YYYY"
                                      )}
                                    </>
                                  )}
                                </Typography>
                              </Box>
                            </Box>
                          }
                        />
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 2 }}
                        >
                          <FormControl size="small">
                            <Select
                              value={treatment.status}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleStatusChange(
                                  treatment._id,
                                  e.target.value
                                );
                              }}
                              sx={{
                                borderRadius: "20px",
                                fontWeight: 600,
                                backgroundColor:
                                  statusConfig.chipStyle.backgroundColor,
                                color: statusConfig.chipStyle.color,
                                "& .MuiOutlinedInput-notchedOutline": {
                                  border: "none",
                                },
                              }}
                            >
                              {statusOptions.map((option) => (
                                <MenuItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                    }}
                                  >
                                    {option.icon}
                                    {option.label}
                                  </Box>
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>

                          <IconButton
                            sx={{
                              color: "primary.main",
                              transform: isExpanded
                                ? "rotate(180deg)"
                                : "rotate(0deg)",
                              transition: "transform 0.3s ease",
                            }}
                          >
                            <ExpandMoreIcon />
                          </IconButton>
                        </Box>
                      </ListItem>

                      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                        <Box
                          sx={{
                            px: 3,
                            pb: 3,
                            bgcolor: "rgba(25, 118, 210, 0.02)",
                          }}
                        >
                          <Grid container spacing={3} sx={{ pt: 2 }}>
                            {/* Medications */}
                            <Grid item xs={12} md={6}>
                              <Typography
                                variant="subtitle1"
                                fontWeight="bold"
                                color="primary"
                                sx={{
                                  mb: 1,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <MedicationIcon fontSize="small" />
                                Medications
                              </Typography>
                              {Array.isArray(treatment.treatments) &&
                              treatment.treatments.length > 0 ? (
                                <Stack spacing={1}>
                                  {treatment.treatments.map((med, index) => (
                                    <Paper
                                      key={index}
                                      sx={{
                                        p: 1.5,
                                        backgroundColor: "white",
                                        border:
                                          "1px solid rgba(25, 118, 210, 0.1)",
                                      }}
                                    >
                                      <Typography
                                        variant="body2"
                                        fontWeight="600"
                                        color="primary"
                                      >
                                        {med.name}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                      >
                                        {med.dose && `${med.dose}`}
                                        {med.dose && med.frequency && " - "}
                                        {med.frequency && `${med.frequency}`}
                                        {!med.dose &&
                                          !med.frequency &&
                                          med.description}
                                      </Typography>
                                    </Paper>
                                  ))}
                                </Stack>
                              ) : (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {treatment.name}
                                </Typography>
                              )}
                            </Grid>

                            {/* Prescription */}
                            <Grid item xs={12} md={6}>
                              <Typography
                                variant="subtitle1"
                                fontWeight="bold"
                                color="primary"
                                sx={{
                                  mb: 1,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <PhotoIcon fontSize="small" />
                                Prescription Photo
                              </Typography>
                              {treatment.photo ? (
                                <Box
                                  component="img"
                                  src={treatment.photo}
                                  alt="Prescription"
                                  sx={{
                                    width: "100%",
                                    maxWidth: 200,
                                    height: 150,
                                    borderRadius: 2,
                                    objectFit: "cover",
                                    cursor: "pointer",
                                    border: "2px solid rgba(25, 118, 210, 0.2)",
                                    transition: "all 0.3s ease",
                                    "&:hover": {
                                      transform: "scale(1.02)",
                                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                                    },
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenViewImageModal(treatment.photo);
                                  }}
                                />
                              ) : (
                                <ActionButton
                                  variant="outlined"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenModal(treatment._id);
                                  }}
                                  startIcon={<PhotoIcon />}
                                  sx={{ mt: 1 }}
                                >
                                  Upload Photo
                                </ActionButton>
                              )}
                            </Grid>
                          </Grid>
                        </Box>
                      </Collapse>
                      <Divider />
                    </React.Fragment>
                  );
                })}
              </List>
            </Paper>
          )}

          {/* Pagination */}
          {totalCount > rowsPerPage && (
            <Box
              sx={{
                mt: 3,
                display: "flex",
                justifyContent: "center",
                backgroundColor: "background.paper",
                borderRadius: 2,
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                p: 1,
              }}
            >
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={totalCount}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={{
                  "& .MuiTablePagination-toolbar": {
                    paddingLeft: isMobile ? 0 : "default",
                    paddingRight: isMobile ? 0 : "default",
                  },
                  "& .MuiTablePagination-selectLabel, & .MuiTablePagination-select":
                    {
                      fontWeight: 600,
                    },
                  "& .MuiTablePagination-displayedRows": {
                    fontWeight: 500,
                  },
                }}
              />
            </Box>
          )}
        </>
      ) : (
        <EmptyStateContainer>
          <HealingIcon
            sx={{
              fontSize: 64,
              color: "primary.main",
              opacity: 0.5,
              mb: 2,
            }}
          />
          <Typography
            variant="h6"
            gutterBottom
            color="primary"
            fontWeight="bold"
          >
            No Treatments Found
          </Typography>
          <Typography variant="body2" color="text.secondary" maxWidth="400px">
            No treatment plans have been created for this patient yet. Click the
            "Add Treatment" button to create the first treatment plan.
          </Typography>
          {isMobile && (
            <Button
              onClick={() => setOpenCreateDialog(true)}
              variant="contained"
              startIcon={<AddCircle />}
              sx={{
                mt: 2,
                borderRadius: "20px",
                background: "linear-gradient(135deg, #2196F3 0%, #1976D2 100%)",
              }}
            >
              Add Treatment
            </Button>
          )}
        </EmptyStateContainer>
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
            padding: { xs: 3, sm: 4 },
            borderRadius: 3,
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            width: { xs: "90%", sm: "80%", md: "60%" },
            maxWidth: 600,
            maxHeight: "85vh",
            overflow: "auto",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 3,
            }}
          >
            <Typography
              variant="h5"
              sx={{ fontWeight: "bold", color: "primary.main" }}
            >
              Treatment Details
            </Typography>
            <IconButton
              onClick={handleCloseDescriptionModal}
              sx={{ color: "text.secondary" }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {currentTreatment && (
            <>
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="subtitle1"
                  fontWeight={600}
                  color="text.secondary"
                  gutterBottom
                >
                  Diagnosis:
                </Typography>
                <Typography variant="h6" color="primary">
                  {getDiagnosis(currentTreatment)}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              {Array.isArray(currentTreatment.treatments) &&
              currentTreatment.treatments.length > 0 ? (
                <Stack spacing={2}>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    color="primary"
                  >
                    Prescribed Medications:
                  </Typography>
                  {currentTreatment.treatments.map((t, index) => (
                    <Paper
                      key={index}
                      sx={{
                        p: 2,
                        backgroundColor: "rgba(25, 118, 210, 0.05)",
                        border: "1px solid rgba(25, 118, 210, 0.1)",
                      }}
                    >
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        color="primary"
                        gutterBottom
                      >
                        {t.name}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {t.description}
                      </Typography>
                      {(t.dose || t.frequency) && (
                        <Typography
                          variant="body2"
                          color="primary"
                          sx={{ mt: 1, fontWeight: 500 }}
                        >
                          {t.dose && `Dose: ${t.dose}`}
                          {t.dose && t.frequency && " • "}
                          {t.frequency && `Frequency: ${t.frequency}`}
                        </Typography>
                      )}
                    </Paper>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body1" color="text.secondary">
                  {currentTreatment.description}
                </Typography>
              )}
            </>
          )}
        </Box>
      </Modal>

      {/* Image Upload Modal */}
      {openModal && selectedTreatmentId && (
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
      )}

      {/* Image Preview Modal */}
      <Modal
        open={viewImageModal}
        onClose={(event, reason) => {
          if (reason === "backdropClick") return;
          handleCloseViewImageModal(event as React.MouseEvent);
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            p: 2,
          }}
        >
          <Box
            onClick={(e) => e.stopPropagation()}
            sx={{
              position: "relative",
              backgroundColor: "white",
              borderRadius: 2,
              overflow: "hidden",
              maxWidth: "90vw",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Close Button */}
            <IconButton
              onClick={handleCloseViewImageModal}
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                color: "white",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                zIndex: 10,
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.7)",
                },
              }}
            >
              <CloseIcon />
            </IconButton>

            {viewImageUrl && (
              <Box
                component="img"
                src={viewImageUrl}
                alt="Prescription Preview"
                sx={{
                  width: "100%",
                  height: "auto",
                  maxHeight: "85vh",
                  objectFit: "contain",
                }}
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </Box>
        </Box>
      </Modal>

      <Toast
        alerting={toast.toastAlert}
        severity={toast.toastSeverity}
        message={toast.toastMessage}
      />
    </StyledContainer>
  );
};

export default TreatmentHistory;
