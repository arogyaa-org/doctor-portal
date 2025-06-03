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
  LocalHospital as TestIcon,
  Close as CloseIcon,
  Cancel,
} from "@mui/icons-material";
import dayjs from "dayjs";
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
      icon: (
        <HourglassEmpty
          sx={{
            fontSize: "1rem",
            color: "#B98900",
          }}
        />
      ),
      chipStyle: {
        backgroundColor: "#FFF8E5",
        color: "#B98900",
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
    {
      value: "cancelled",
      label: "Cancelled",
      icon: (
        <Cancel
          sx={{
            fontSize: "1rem",
            color: "#C41E1D",
          }}
        />
      ),
      chipStyle: {
        backgroundColor: "#f8d7da",
        color: "#C41E1D",
      },
    },
  ];

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
          Create Test
        </Button>
      </Box>

      <CreateTestDialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        fetchTests={fetchTests}
        patientId={patientId}
      />

      {error ? (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      ) : null}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <Typography>Loading tests...</Typography>
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
            {tests.map((test) => (
              <React.Fragment key={test._id}>
                <ListItem
                  onClick={() => handleToggleExpand(test._id)}
                  sx={{
                    py: 2,
                    px: 3,
                    borderBottom: "1px solid #eee",
                    backgroundColor:
                      expandedTest === test._id ? "#f0f7ff" : "white",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      backgroundColor: "#f5faff",
                    },
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <TestIcon
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
                          {capitalizeFirstLetter(getTestName(test))}
                        </Typography>
                      </Box>
                    }
                  />
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <Select
                        value={test.status.toLowerCase()}
                        onChange={(e) =>
                          handleStatusChange(test._id, e.target.value)
                        }
                        IconComponent={KeyboardArrowDown}
                        sx={{
                          borderRadius: "20px",
                          fontWeight: 600,
                          backgroundColor:
                            test.status.toLowerCase() === "completed"
                              ? "#d4edda"
                              : test.status.toLowerCase() === "scheduled"
                                ? "#FFF8E5"
                                : test.status.toLowerCase() === "cancelled"
                                  ? "#f8d7da"
                                  : "#f8f9fa",
                          color:
                            test.status.toLowerCase() === "completed"
                              ? "#2D9735"
                              : test.status.toLowerCase() === "scheduled"
                                ? "#B98900"
                                : test.status.toLowerCase() === "cancelled"
                                  ? "#C41E1D"
                                  : "#333",
                          height: "30px",
                          padding: "0 12px",
                          "& .MuiSelect-icon": {
                            color:
                              test.status.toLowerCase() === "completed"
                                ? "#2D9735"
                                : test.status.toLowerCase() === "scheduled"
                                  ? "#B98900"
                                  : test.status.toLowerCase() === "cancelled"
                                    ? "#C41E1D"
                                    : "#333",
                          },
                        }}
                      >
                        <MenuItem value="scheduled">Scheduled</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                        <MenuItem value="cancelled">Cancelled</MenuItem>
                      </Select>
                    </FormControl>

                    <IconButton
                      size="medium"
                      edge="end"
                      sx={{
                        backgroundColor:
                          expandedTest === test._id
                            ? "rgba(25, 118, 210, 0.1)"
                            : "transparent",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          backgroundColor: "rgba(25, 118, 210, 0.2)",
                        },
                      }}
                    >
                      {expandedTest === test._id ? (
                        <KeyboardArrowUp fontSize="medium" />
                      ) : (
                        <KeyboardArrowDown fontSize="medium" />
                      )}
                    </IconButton>
                  </Box>
                </ListItem>

                <Collapse
                  in={expandedTest === test._id}
                  timeout="auto"
                  unmountOnExit
                >
                  <Box sx={{ p: 1, bgcolor: "#f9fbff" }}>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, 1fr)",
                        gap: 3,
                        p: 2,
                        borderTop: "1px solid #eee",
                        mt: -1,
                      }}
                    >
                      <Box>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            mb: 0.5,
                          }}
                        >
                          <Typography variant="subtitle1" fontWeight="bold">
                            Tests
                          </Typography>
                        </Box>
                        {Array.isArray(test.tests) && test.tests.length > 0 ? (
                          <Box>
                            {test.tests.map((t, index) => (
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
                                  {t.name}:
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{ color: "text.secondary" }}
                                >
                                  {t.description}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        ) : (
                          <Typography variant="body1">
                            {getTestName(test)}
                          </Typography>
                        )}
                      </Box>

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
                          label={capitalizeFirstLetter(test.type || "N/A")}
                          size="small"
                          sx={{
                            backgroundColor: "rgba(25, 118, 210, 0.1)",
                            color: "primary.dark",
                            fontWeight: 500,
                          }}
                        />
                      </Box>

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
                          Created Date
                        </Typography>
                        <Typography variant="body2">
                          {test.createdAt
                            ? dayjs(test.createdAt).format("DD-MMM-YYYY")
                            : "N/A"}
                        </Typography>
                      </Box>

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
                        {test.photo ? (
                          <Box display="flex" alignItems="center" gap={1}>
                            <img
                              src={test.photo}
                              alt="prescription"
                              style={{
                                width: 50,
                                height: 50,
                                borderRadius: 6,
                                objectFit: "cover",
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
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={totalCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{
              "& .MuiTablePagination-selectLabel, & .MuiTablePagination-select":
                {
                  fontWeight: 500,
                },
            }}
          />
        </Paper>
      )}

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
            Test Details
          </Typography>

          {currentTest ? (
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="subtitle1"
                fontWeight={600}
                color="text.secondary"
              >
                Name:
              </Typography>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {getTestName(currentTest)}
              </Typography>
            </Box>
          ) : null}

          {currentTest &&
          Array.isArray(currentTest.tests) &&
          currentTest.tests.length > 0 ? (
            currentTest.tests.map((t, index) => (
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
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Category: {capitalizeFirstLetter(t.category || "N/A")}
                </Typography>
                <Typography variant="body2">
                  {t.isEmptyStomach
                    ? "Requires empty stomach"
                    : "No fasting required"}
                </Typography>
                {index < currentTest.tests.length - 1 && (
                  <Divider sx={{ my: 2 }} />
                )}
              </Box>
            ))
          ) : currentTest ? (
            <Typography variant="body1">
              {currentTest.description || "No description available"}
            </Typography>
          ) : null}

          {currentTest && (
            <>
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

      {openModal && selectedTestId ? (
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
      ) : null}

      <Modal
        open={viewImageModal}
        onClose={(event, reason) => {
          if (reason === "backdropClick") return;
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

export default TestHistory;
