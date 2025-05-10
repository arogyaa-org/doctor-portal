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
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import {
  CheckCircle,
  Visibility,
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
  Cancel,
} from "@mui/icons-material";
import { fetcher, modifier } from "@/apis/apiClient";
import { Utility } from "@/utils";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import Toast from "@/components/common/Toast";
import ImagePicker from "@/components/common/ImagePicker";
import CreateTestDialog from "./createTestDialog";

// Updated Test interface to match the actual data structure
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

// eslint-disable-next-line react/function-component-definition
const TestHistory: React.FC<TestHistoryProps> = ({ patientId }) => {
  const [tests, setTests] = useState<Test[]>([]);
  const [expandedTest, setExpandedTest] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  const [testImage, setTestImage] = useState<File | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [testImagePreview, setTestImagePreview] = useState<string | null>(null);
  const [viewImageModal, setViewImageModal] = useState(false);
  const [viewImageUrl, setViewImageUrl] = useState<string | null>(null);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [descriptionModalOpen, setDescriptionModalOpen] = useState(false);
  const [currentTest, setCurrentTest] = useState<Test | null>(null);

  const { toast } = useSelector((state: RootState) => state.toast);
  const dispatch: AppDispatch = useDispatch();
  const testFileInputRef = useRef<HTMLInputElement>(null);
  const { toastAndNavigate } = Utility();
  const { capitalizeFirstLetter } = Utility();

  const fetchTests = useCallback(async () => {
    if (patientId) {
      try {
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
      }
    }
  }, [patientId, page, rowsPerPage]);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  const handleToggleExpand = (testId: string) => {
    setExpandedTest(expandedTest === testId ? null : testId);
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
    [dispatch, fetchTests]
  );

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
  }, [testImage, selectedTestId, dispatch, fetchTests]);

  const handleOpenViewImageModal = (imageUrl: string) => {
    setViewImageUrl(imageUrl);
    setViewImageModal(true);
  };

  const handleCloseViewImageModal = (event: React.MouseEvent) => {
    event.stopPropagation();
    setViewImageModal(false);
    setViewImageUrl(null);
  };

  // Helper function to get test name
  const getTestName = (test: Test) => {
    // If test has a name property directly, use it
    if (test.name) {
      return test.name;
    }

    // Otherwise, try to get name from the first test in tests array
    if (test.tests && test.tests.length > 0) {
      return test.tests[0].name;
    }

    // Fallback
    return "Unnamed Test";
  };

  // Helper function to get test description
  const getTestDescription = (test: Test) => {
    // If test has a description property directly, use it
    if (test.description) {
      return test.description;
    }

    // Otherwise, try to get descriptions from the tests array
    if (test.tests && test.tests.length > 0) {
      return test.tests.map((t) => t.description).join(", ");
    }

    // Fallback
    return "No description available";
  };

  // Helper function to get test category
  const getTestCategory = (test: Test) => {
    // If test has a category property directly, use it
    if (test.category) {
      return test.category;
    }

    // Otherwise, try to get category from the first test in tests array
    if (test.tests && test.tests.length > 0) {
      return test.tests[0].category;
    }

    // Fallback
    return "N/A";
  };

  const getStatusChip = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return (
          <Chip
            icon={
              <CheckCircle
                sx={{
                  fontSize: "0.8rem !important",
                  color: "#2D9735 !important",
                }}
              />
            }
            label="Completed"
            size="small"
            sx={{
              backgroundColor: "#d4edda",
              color: "#2D9735",
              fontWeight: 500,
              borderRadius: "16px",
              "& .MuiChip-label": {
                px: 1,
              },
            }}
          />
        );
      case "scheduled":
        return (
          <Chip
            icon={
              <EventIcon
                sx={{
                  fontSize: "0.8rem !important",
                  color: "#B98900 !important",
                }}
              />
            }
            label="Scheduled"
            size="small"
            sx={{
              backgroundColor: "#FFF8E5",
              color: "#B98900",
              fontWeight: 500,
              borderRadius: "16px",
              "& .MuiChip-label": {
                px: 1,
              },
            }}
          />
        );
      case "cancelled":
        return (
          <Chip
            icon={
              <Cancel
                sx={{
                  fontSize: "0.8rem !important",
                  color: "#C41E1D !important",
                }}
              />
            }
            label="Cancelled"
            size="small"
            sx={{
              backgroundColor: "#f8d7da",
              color: "#C41E1D",
              fontWeight: 500,
              borderRadius: "16px",
              "& .MuiChip-label": {
                px: 1,
              },
            }}
          />
        );
      default:
        return (
          <Chip
            label={capitalizeFirstLetter(status)}
            size="small"
            sx={{
              backgroundColor: "#f8f9fa",
              fontWeight: 500,
              borderRadius: "16px",
            }}
          />
        );
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 2, pb: 4 }}>
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
            padding: "6px 20px",
            borderRadius: "20px",
            fontSize: "14px",
            boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.2)",
            transition: "all 0.3s ease",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            "&:hover": {
              background: "linear-gradient(45deg, #1976D2 30%, #0D47A1 90%)",
              boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
            },
          }}
        >
          <AddCircle sx={{ fontSize: 20 }} />
          Create Test
        </Button>
      </Box>

      <CreateTestDialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        fetchTests={fetchTests}
        patientId={patientId}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={2} sx={{ borderRadius: 2, overflow: "hidden" }}>
        <List disablePadding>
          {tests.map((test) => (
            <React.Fragment key={test._id}>
              <ListItem
                button
                onClick={() => handleToggleExpand(test._id)}
                sx={{
                  py: 1.5,
                  borderBottom: "1px solid #eee",
                  backgroundColor:
                    expandedTest === test._id ? "#f5f9ff" : "white",
                  "&:hover": {
                    backgroundColor: "#f0f7ff",
                  },
                }}
              >
                <ListItemText
                  primary={
                    <Typography
                      fontWeight={expandedTest === test._id ? 600 : 400}
                    >
                      {/* Fixed test name display */}
                      {capitalizeFirstLetter(getTestName(test))}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="body2" color="text.secondary">
                      {/* Display patient username */}
                      {test.patientId?.username || "Unknown Patient"}
                    </Typography>
                  }
                />
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {getStatusChip(test.status)}
                  <IconButton size="small" edge="end">
                    {expandedTest === test._id ? (
                      <KeyboardArrowUp />
                    ) : (
                      <KeyboardArrowDown />
                    )}
                  </IconButton>
                </Box>
              </ListItem>

              <Collapse
                in={expandedTest === test._id}
                timeout="auto"
                unmountOnExit
              >
                <Box sx={{ p: 2, bgcolor: "#f9f9f9" }}>
                  <Grid container spacing={2}>
                    {/* Description */}
                    <Grid item xs={12} sm={6}>
                      <Card variant="outlined" sx={{ height: "100%" }}>
                        <CardContent>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mb: 1,
                            }}
                          >
                            <DescriptionIcon
                              fontSize="small"
                              sx={{ color: "primary.main", mr: 1 }}
                            />
                            <Typography variant="subtitle2" fontWeight="bold">
                              Description
                            </Typography>
                          </Box>
                          <Typography variant="body2" noWrap>
                            {/* Show a preview of the description */}
                            {getTestDescription(test).substring(0, 50)}
                            {getTestDescription(test).length > 50 ? "..." : ""}
                          </Typography>
                          <Button
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDescriptionModal(test);
                            }}
                            sx={{ fontSize: "0.75rem", mt: 1 }}
                          >
                            See more
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Type */}
                    <Grid item xs={12} sm={6}>
                      <Card variant="outlined" sx={{ height: "100%" }}>
                        <CardContent>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mb: 1,
                            }}
                          >
                            <CategoryIcon
                              fontSize="small"
                              sx={{ color: "primary.main", mr: 1 }}
                            />
                            <Typography variant="subtitle2" fontWeight="bold">
                              Type
                            </Typography>
                          </Box>
                          <Typography variant="body2">
                            {capitalizeFirstLetter(test.type || "N/A")}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Category */}
                    <Grid item xs={12} sm={6}>
                      <Card variant="outlined" sx={{ height: "100%" }}>
                        <CardContent>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mb: 1,
                            }}
                          >
                            <EventIcon
                              fontSize="small"
                              sx={{ color: "primary.main", mr: 1 }}
                            />
                            <Typography variant="subtitle2" fontWeight="bold">
                              Category
                            </Typography>
                          </Box>
                          <Typography variant="body2">
                            {/* Fixed category display */}
                            {capitalizeFirstLetter(getTestCategory(test))}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Photo */}
                    <Grid item xs={12} sm={6}>
                      <Card variant="outlined" sx={{ height: "100%" }}>
                        <CardContent>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mb: 1,
                            }}
                          >
                            <PhotoIcon
                              fontSize="small"
                              sx={{ color: "primary.main", mr: 1 }}
                            />
                            <Typography variant="subtitle2" fontWeight="bold">
                              Photo
                            </Typography>
                          </Box>
                          {test.photo ? (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                              }}
                            >
                              <img
                                src={test.photo}
                                alt={getTestName(test)}
                                style={{
                                  width: "60px",
                                  height: "60px",
                                  objectFit: "cover",
                                  borderRadius: "4px",
                                  cursor: "pointer",
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenViewImageModal(test.photo);
                                }}
                              />
                            </Box>
                          ) : (
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenModal(test._id);
                              }}
                            >
                              Upload Photo
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  {/* Actions */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      mt: 2,
                      gap: 1,
                    }}
                  >
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Edit test logic here
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Delete test logic here
                      }}
                    >
                      Delete
                    </Button>

                    {test.status.toLowerCase() === "scheduled" && (
                      <>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(test._id, "completed");
                          }}
                        >
                          Mark as Completed
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(test._id, "cancelled");
                          }}
                        >
                          Cancel Test
                        </Button>
                      </>
                    )}

                    {test.status.toLowerCase() === "completed" && (
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(test._id, "scheduled");
                        }}
                      >
                        Mark as Scheduled
                      </Button>
                    )}

                    {test.status.toLowerCase() === "cancelled" && (
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(test._id, "scheduled");
                        }}
                      >
                        Reschedule Test
                      </Button>
                    )}
                  </Box>
                </Box>
              </Collapse>
              <Divider />
            </React.Fragment>
          ))}

          {tests.length === 0 && (
            <ListItem>
              <ListItemText
                primary={
                  <Typography
                    align="center"
                    color="text.secondary"
                    sx={{ py: 3 }}
                  >
                    No tests found
                  </Typography>
                }
              />
            </ListItem>
          )}
        </List>
      </Paper>

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
            borderRadius: 2,
            boxShadow: 3,
            width: "80%",
            maxWidth: 500,
            maxHeight: "80vh",
            overflow: "auto",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
            {currentTest && getTestName(currentTest)} - Details
          </Typography>

          {currentTest && (
            <>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>
                Description:
              </Typography>
              <Typography variant="body1">
                {getTestDescription(currentTest) || "No description available"}
              </Typography>

              <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>
                Category:
              </Typography>
              <Typography variant="body1">
                {capitalizeFirstLetter(getTestCategory(currentTest))}
              </Typography>

              {currentTest.tests && currentTest.tests.length > 0 && (
                <>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    sx={{ mt: 2 }}
                  >
                    Individual Tests:
                  </Typography>
                  <List sx={{ bgcolor: "#f5f5f5", borderRadius: 1, mt: 1 }}>
                    {currentTest.tests.map((test, index) => (
                      <ListItem key={index} sx={{ py: 1 }}>
                        <ListItemText
                          primary={
                            <Typography fontWeight="bold">
                              {test.name}
                            </Typography>
                          }
                          secondary={
                            <>
                              <Typography variant="body2" component="span">
                                {test.description}
                              </Typography>
                              <Typography
                                variant="body2"
                                component="div"
                                sx={{ mt: 1 }}
                              >
                                Category: {capitalizeFirstLetter(test.category)}
                              </Typography>
                              <Typography variant="body2" component="div">
                                {test.isEmptyStomach
                                  ? "Requires empty stomach"
                                  : "No fasting required"}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}

              <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>
                Patient:
              </Typography>
              <Typography variant="body1">
                {currentTest.patientId?.username || "Unknown"}
                {currentTest.patientId?.age &&
                  ` (${currentTest.patientId.age} years)`}
                {currentTest.patientId?.gender &&
                  `, ${capitalizeFirstLetter(currentTest.patientId.gender)}`}
              </Typography>

              <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>
                Dates:
              </Typography>
              <Typography variant="body2">
                Created: {new Date(currentTest.createdAt).toLocaleString()}
              </Typography>
              <Typography variant="body2">
                Last Updated: {new Date(currentTest.updatedAt).toLocaleString()}
              </Typography>
            </>
          )}

          <Button
            variant="contained"
            color="primary"
            onClick={handleCloseDescriptionModal}
            sx={{ mt: 3 }}
          >
            Close
          </Button>
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
            <Button
              onClick={handleCloseViewImageModal}
              sx={{
                position: "absolute",
                top: 10,
                right: 10,
                backgroundColor: "white",
                color: "black",
                borderRadius: "50%",
                minWidth: "40px",
                minHeight: "40px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                "&:hover": {
                  backgroundColor: "#f0f0f0",
                },
              }}
            >
              ✕
            </Button>

            {viewImageUrl && (
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
            )}
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

export default TestHistory;
