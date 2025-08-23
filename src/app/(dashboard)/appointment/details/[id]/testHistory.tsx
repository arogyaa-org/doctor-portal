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
  FormControl,
  TablePagination,
  Card,
  CardContent,
  Stack,
  Grid,
  Skeleton,
  Fab,
  Avatar,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  CheckCircle,
  AddCircle,
  HourglassEmpty,
  ExpandMore as ExpandMoreIcon,
  Photo as PhotoIcon,
  LocalHospital as TestIcon,
  Close as CloseIcon,
  Cancel,
  Category as CategoryIcon,
  Event as EventIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";
import { fetcher, modifier } from "@/apis/apiClient";
import { Utility } from "@/utils";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import Toast from "@/components/common/Toast";
import ImagePicker from "@/components/common/ImagePicker";
import CreateTestDialog from "./createTestDialog";

interface Test {
  _id: string;
  patientId: {
    _id: string;
    username: string;
    age: string;
    gender: string;
  };
  tests: Array<{
    name: string;
    description: string;
    category: string;
    isEmptyStomach: boolean;
  }>;
  name?: string;
  description?: string;
  category?: string;
  photo?: string;
  status: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

interface TestHistoryProps {
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
const TestHistory: React.FC<TestHistoryProps> = ({ patientId }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isTablet = useMediaQuery(theme.breakpoints.down("lg"));

  const [tests, setTests] = useState<Test[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalCount, setTotalCount] = useState(0);
  const [expandedTest, setExpandedTest] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  const [viewImageModal, setViewImageModal] = useState(false);
  const [viewImageUrl, setViewImageUrl] = useState<string | null>(null);
  const [testImage, setTestImage] = useState<File | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [testImagePreview, setTestImagePreview] = useState<string | null>(null);
  const testFileInputRef = useRef<HTMLInputElement>(null);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [descriptionModalOpen, setDescriptionModalOpen] = useState(false);
  const [currentTest, setCurrentTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(false);

  const { toast } = useSelector((state: RootState) => state.toast);
  const dispatch: AppDispatch = useDispatch();
  const { toastAndNavigate, capitalizeFirstLetter } = Utility();

  const fetchTests = useCallback(async () => {
    if (patientId) {
      try {
        setLoading(true);
        const response = await fetcher(
          "test",
          `get-tests-by-patientId/${patientId}?page=${page + 1}&limit=${rowsPerPage}`
        );
        const results = response?.results || [];
        const count = response?.count || 0;
        setTests(results);
        setTotalCount(count);
        setError(null);
      } catch (error) {
        console.error("Error fetching tests:", error);
        setError(error instanceof Error ? error.message : String(error));
        setTests([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    }
  }, [patientId, page, rowsPerPage]);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleToggleExpand = (testId: string) => {
    setExpandedTest(expandedTest === testId ? null : testId);
  };

  const handleOpenModal = (testId: string) => {
    setSelectedTestId(testId);
    setTestImagePreview(null);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setTestImagePreview(null);
    setSelectedTestId(null);
  };

  const handleOpenDescriptionModal = (test: Test) => {
    setCurrentTest(test);
    setDescriptionModalOpen(true);
  };

  const handleCloseDescriptionModal = () => {
    setDescriptionModalOpen(false);
    setCurrentTest(null);
  };

  const handleUpload = useCallback(async () => {
    if (!selectedTestId || !testImage) return;

    try {
      setIsUploading(true);
      const headers = {
        "Content-Type": "multipart/form-data",
      };
      const response = await modifier(
        "test",
        "update-test",
        {
          _id: selectedTestId,
          photo: testImage,
        },
        headers
      );
      toastAndNavigate(
        dispatch,
        true,
        "success",
        "Image uploaded successfully"
      );
      handleCloseModal();
      fetchTests();
    } catch (error) {
      console.error("Error uploading image:", error);
      toastAndNavigate(dispatch, true, "error", "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  }, [testImage, selectedTestId, dispatch, fetchTests, toastAndNavigate]);

  const handleOpenViewImageModal = (imageUrl: string) => {
    setViewImageUrl(imageUrl);
    setViewImageModal(true);
  };

  const handleCloseViewImageModal = (event: React.MouseEvent) => {
    event.stopPropagation();
    setViewImageModal(false);
    setViewImageUrl(null);
  };

  const handleStatusChange = useCallback(
    async (testId: string, newStatus: string) => {
      if (!testId) return;
      try {
        const response = await modifier("test", "update-test", {
          _id: testId,
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
        fetchTests();
      } catch (error) {
        console.error("Error updating status:", error);
        toastAndNavigate(dispatch, true, "error", "Failed to update status");
      }
    },
    [dispatch, fetchTests, toastAndNavigate]
  );

  const getTestName = (test: Test) => {
    if (test.name) {
      return test.name;
    }
    if (test.tests && test.tests.length > 0) {
      return test.tests[0].name;
    }
    return "Unnamed Test";
  };

  const getTestDescription = (test: Test) => {
    if (test.description) {
      return test.description;
    }
    if (test.tests && test.tests.length > 0) {
      return test.tests.map((t) => t.description).join(", ");
    }
    return "No description available";
  };

  const getTestCategory = (test: Test) => {
    if (test.category) {
      return test.category;
    }
    if (test.tests && test.tests.length > 0) {
      return test.tests[0].category;
    }
    return "N/A";
  };

  const statusOptions = [
    {
      value: "scheduled",
      label: "Scheduled",
      icon: <HourglassEmpty sx={{ fontSize: "1rem", color: "#B98900" }} />,
      chipStyle: {
        backgroundColor: "#FFF8E5",
        color: "#B98900",
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
    {
      value: "cancelled",
      label: "Cancelled",
      icon: <Cancel sx={{ fontSize: "1rem", color: "#C41E1D" }} />,
      chipStyle: {
        backgroundColor: "#f8d7da",
        color: "#C41E1D",
      },
    },
  ];

  const getStatusConfig = (status: string) => {
    return (
      statusOptions.find((option) => option.value === status.toLowerCase()) ||
      statusOptions[0]
    );
  };

  // Mobile Test Card Component
  const MobileTestCard = ({ test }: { test: Test }) => {
    const statusConfig = getStatusConfig(test.status);
    const isExpanded = expandedTest === test._id;

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
            onClick={() => handleToggleExpand(test._id)}
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
                <TestIcon />
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
                  {getTestName(test)}
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
                {/* Tests */}
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
                      <TestIcon fontSize="small" />
                      Tests
                    </Typography>
                    {Array.isArray(test.tests) && test.tests.length > 0 ? (
                      <Stack spacing={1}>
                        {test.tests.map((t, index) => (
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
                              {t.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {t.description}
                              {t.isEmptyStomach && " (Requires empty stomach)"}
                            </Typography>
                          </Paper>
                        ))}
                      </Stack>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        {getTestName(test)}
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
                        Category
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {capitalizeFirstLetter(getTestCategory(test))}
                      </Typography>
                    </Box>
                  </DetailItem>
                </Grid>

                <Grid item xs={6}>
                  <DetailItem>
                    <EventIcon sx={{ color: "primary.main", fontSize: 18 }} />
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        Created
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {test.createdAt
                          ? dayjs(test.createdAt).format("DD MMM")
                          : "N/A"}
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
                    {test.photo ? (
                      <Box
                        component="img"
                        src={test.photo}
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
                          handleOpenViewImageModal(test.photo);
                        }}
                      />
                    ) : (
                      <ActionButton
                        size="small"
                        variant="outlined"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenModal(test._id);
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
                        value={test.status.toLowerCase()}
                        onChange={(e) =>
                          handleStatusChange(test._id, e.target.value)
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
            Test History
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {totalCount > 0
              ? `${totalCount} test${totalCount > 1 ? "s" : ""} found`
              : "No tests found"}
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
            Add Test
          </Button>
        )}
      </HeaderSection>

      {isMobile && (
        <StyledFab
          onClick={() => setOpenCreateDialog(true)}
          aria-label="add test"
        >
          <AddCircle />
        </StyledFab>
      )}

      <CreateTestDialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        fetchTests={fetchTests}
        patientId={patientId}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <LoadingSkeleton />
      ) : tests.length > 0 ? (
        <>
          {isMobile ? (
            // Mobile View - Cards
            <Box>
              {tests.map((test) => (
                <MobileTestCard key={test._id} test={test} />
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
                {tests.map((test) => {
                  const statusConfig = getStatusConfig(test.status);
                  const isExpanded = expandedTest === test._id;

                  return (
                    <React.Fragment key={test._id}>
                      <ListItem
                        onClick={() => handleToggleExpand(test._id)}
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
                                <TestIcon />
                              </Avatar>
                              <Box>
                                <Typography
                                  variant="h6"
                                  fontWeight="bold"
                                  color="primary"
                                  sx={{ fontSize: "1.1rem" }}
                                >
                                  {getTestName(test)}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  Category:{" "}
                                  {capitalizeFirstLetter(getTestCategory(test))}
                                  {" • Created: "}
                                  {test.createdAt
                                    ? dayjs(test.createdAt).format(
                                        "DD MMM YYYY"
                                      )
                                    : "N/A"}
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
                              value={test.status.toLowerCase()}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleStatusChange(test._id, e.target.value);
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
                            {/* Tests */}
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
                                <TestIcon fontSize="small" />
                                Tests
                              </Typography>
                              {Array.isArray(test.tests) &&
                              test.tests.length > 0 ? (
                                <Stack spacing={1}>
                                  {test.tests.map((t, index) => (
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
                                        {t.name}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                      >
                                        {t.description}
                                        {t.isEmptyStomach &&
                                          " (Requires empty stomach)"}
                                      </Typography>
                                    </Paper>
                                  ))}
                                </Stack>
                              ) : (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {getTestName(test)}
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
                              {test.photo ? (
                                <Box
                                  component="img"
                                  src={test.photo}
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
                                    handleOpenViewImageModal(test.photo);
                                  }}
                                />
                              ) : (
                                <ActionButton
                                  variant="outlined"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenModal(test._id);
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
          <TestIcon
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
            No Tests Found
          </Typography>
          <Typography variant="body2" color="text.secondary" maxWidth="400px">
            No test plans have been created for this patient yet. Click the "Add
            Test" button to create the first test plan.
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
              Add Test
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
              Test Details
            </Typography>
            <IconButton
              onClick={handleCloseDescriptionModal}
              sx={{ color: "text.secondary" }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {currentTest && (
            <>
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="subtitle1"
                  fontWeight={600}
                  color="text.secondary"
                  gutterBottom
                >
                  Name:
                </Typography>
                <Typography variant="h6" color="primary">
                  {getTestName(currentTest)}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              {Array.isArray(currentTest.tests) &&
              currentTest.tests.length > 0 ? (
                <Stack spacing={2}>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    color="primary"
                  >
                    Tests:
                  </Typography>
                  {currentTest.tests.map((t, index) => (
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
                      <Typography
                        variant="body2"
                        color="primary"
                        sx={{ mt: 1, fontWeight: 500 }}
                      >
                        Category: {capitalizeFirstLetter(t.category || "N/A")}
                        {" • "}
                        {t.isEmptyStomach
                          ? "Requires empty stomach"
                          : "No fasting required"}
                      </Typography>
                    </Paper>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body1" color="text.secondary">
                  {getTestDescription(currentTest)}
                </Typography>
              )}

              <Box sx={{ mt: 3 }}>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  color="primary"
                >
                  Patient:
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {currentTest.patientId?.username || "Unknown"}
                  {currentTest.patientId?.age &&
                    ` (${currentTest.patientId.age} years)`}
                  {currentTest.patientId?.gender &&
                    `, ${capitalizeFirstLetter(currentTest.patientId.gender)}`}
                </Typography>
              </Box>

              <Box sx={{ mt: 2 }}>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  color="primary"
                >
                  Dates:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Created: {dayjs(currentTest.createdAt).format("DD MMM YYYY")}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Last Updated:{" "}
                  {dayjs(currentTest.updatedAt).format("DD MMM YYYY")}
                </Typography>
              </Box>
            </>
          )}
        </Box>
      </Modal>

      {/* Image Upload Modal */}
      {openModal && selectedTestId && (
        <ImagePicker
          open={openModal}
          onClose={handleCloseModal}
          handleUpload={handleUpload}
          fileInputRef={testFileInputRef}
          image={testImage}
          setImage={setTestImage}
          isHovering={isHovering}
          setIsHovering={setIsHovering}
          isUploading={isUploading}
          imagePreview={testImagePreview}
          setImagePreview={setTestImagePreview}
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

export default TestHistory;
