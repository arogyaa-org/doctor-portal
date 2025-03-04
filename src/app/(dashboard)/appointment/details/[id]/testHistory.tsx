"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import {
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Alert,
  Box,
  alpha,
  Button,
  Select,
  MenuItem,
  Modal,
} from "@mui/material";

import { CheckCircle, Event, Cancel } from "@mui/icons-material";
import { fetcher, modifier } from "@/apis/apiClient";
import { Utility } from "@/utils";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import Toast from "@/components/common/Toast";
import ImagePicker from "@/components/common/ImagePicker";
import { AddCircle } from "@mui/icons-material";
import CreateTestDialog from "./createTestDialog";
// import CreateTestDialog from "./CreateTestDialog";

interface Test {
  _id: string;
  patientId: string;
  doctorId: string;
  name: string;
  description: string;
  category: string;
  photo: string;
  status: string;
  type: string;
}

interface TestHistoryProps {
  patientId: string;
}

const TestHistory: React.FC<TestHistoryProps> = ({ patientId }) => {
  const [tests, setTests] = useState<Test[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);

  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  const [testImage, setTestImage] = useState<File | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [viewImageModal, setViewImageModal] = useState(false);
  const [viewImageUrl, setViewImageUrl] = useState<string | null>(null);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);

  const [testImagePreview, setTestImagePreview] = useState<string | null>(null);
  const { toast } = useSelector((state: RootState) => state.toast);
  const dispatch: AppDispatch = useDispatch();
  const testFileInputRef = useRef<HTMLInputElement>(null);
  const { toastAndNavigate } = Utility();
  const { capitalizeFirstLetter } = Utility();
  const fetchTests = React.useCallback(async () => {
    if (patientId) {
      try {
        const response = await fetcher(
          "test",
          `get-tests-by-patientId/${patientId}?page=${
            page + 1
          }&limit=${rowsPerPage}`
        );
        const results = response?.results || [];
        const count = response?.count || 0;
        const updatedResults = results.map((test: Test) => ({
          ...test,
          type: test.type || "N/A", // Default value
        }));
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

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedTests = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return tests.slice(startIndex, startIndex + rowsPerPage);
  }, [tests, page, rowsPerPage]);

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

      // Update the specific test with the new photo URL
      const imageUrl = URL.createObjectURL(testImage); // Generate URL for preview
      setTests((prevTests) =>
        prevTests.map((test) =>
          test._id === selectedTestId ? { ...test, photo: imageUrl } : test
        )
      );
      toastAndNavigate(
        dispatch,
        true,
        "success",
        "Image uploaded successfully"
      );

      // Close modal after successful upload
      handleCloseModal();
    } catch (error) {
      console.error("Error uploading image:", error);
      toastAndNavigate(dispatch, true, "error", "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  }, [testImage, selectedTestId]);

  const handleOpenViewImageModal = (imageUrl: string) => {
    setViewImageUrl(imageUrl);
    setViewImageModal(true);
  };

  const handleCloseViewImageModal = () => {
    setViewImageUrl(null);
    setViewImageModal(false);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button
          onClick={() => setOpenCreateDialog(true)}
          sx={{
            background: "linear-gradient(45deg, #2196F3 30%, #1976D2 90%)",
            color: "white",
            fontWeight: "bold",
            padding: "6px 20px",
            marginLeft: "4px",
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
          Create
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

      <TableContainer
        component={Paper}
        sx={{
          boxShadow: 3,
          borderRadius: 2,
          width: "600px",
          margin: "0 auto",
          marginLeft: "-23px",
        }}
      >
        <Table>
          <TableHead
            sx={{
              backgroundColor: (theme) =>
                alpha(theme.palette.primary.main, 0.05),
            }}
          >
            <TableRow>
              {["Name", "Description", "Status", "Type", "Action"].map(
                (header) => (
                  <TableCell
                    key={header}
                    sx={{
                      fontWeight: 600,
                      textTransform: "uppercase",
                      color: "text.secondary",
                      textAlign: "center",
                    }}
                  >
                    {header}
                  </TableCell>
                )
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedTests.map((test) => (
              <TableRow
                key={test._id}
                hover
                sx={{
                  "&:last-child td, &:last-child th": { border: 0 },
                  transition: "background-color 0.2s",
                }}
              >
                <TableCell sx={{ textAlign: "center" }}>
                  {capitalizeFirstLetter(test.name)}
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  {capitalizeFirstLetter(test.description)}
                </TableCell>
                {/* Status Column (Moved before Type) */}
                <TableCell sx={{ textAlign: "center" }}>
                  <Select
                    value={test.status}
                    onChange={(e) =>
                      handleStatusChange(test._id, e.target.value)
                    }
                    variant="outlined"
                    size="small"
                    displayEmpty
                    sx={{
                      borderRadius: "20px",
                      width: "100%",
                      height: "36px",
                      textAlign: "center",
                      "& .MuiOutlinedInput-notchedOutline": {
                        border: "none",
                      },
                      "& .MuiSelect-select": {
                        borderRadius: "20px",
                        padding: "6px 40px 6px 14px !important",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        boxSizing: "border-box",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                      },
                      "& .MuiSelect-icon": {
                        fontSize: "1.2rem",
                        right: 12,
                      },
                      backgroundColor: () => {
                        switch (test.status.toLowerCase()) {
                          case "completed":
                            return "#E7F7E8";
                          case "scheduled":
                            return "#FFF8E5";
                          case "cancelled":
                            return "#F0F4FF";
                          default:
                            return "#F5F5F5";
                        }
                      },
                      color: () => {
                        switch (test.status.toLowerCase()) {
                          case "completed":
                            return "#2D9735";
                          case "scheduled":
                            return "#B98900";
                          case "cancelled":
                            return "#C41E1D";
                          default:
                            return "#000";
                        }
                      },
                    }}
                  >
                    <MenuItem value="scheduled">
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          color: "#B98900",
                        }}
                      >
                        <Event fontSize="small" />
                        Scheduled
                      </Box>
                    </MenuItem>
                    <MenuItem value="completed">
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          color: "#2D9735",
                        }}
                      >
                        <CheckCircle fontSize="small" />
                        Completed
                      </Box>
                    </MenuItem>
                    <MenuItem value="cancelled">
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          color: "#C41E1D",
                        }}
                      >
                        <Cancel fontSize="small" />
                        Cancelled
                      </Box>
                    </MenuItem>
                  </Select>
                </TableCell>
                {/* Type Column (Moved after Status) */}
                <TableCell sx={{ textAlign: "center" }}>
                  {capitalizeFirstLetter(test.type || "N/A")}
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  {test.photo ? (
                    <img
                      src={test.photo}
                      alt={test.name}
                      style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "4px",
                      }}
                      onClick={() => handleOpenViewImageModal(test.photo)}
                    />
                  ) : (
                    <Button
                      onClick={() => handleOpenModal(test._id)}
                      sx={{ display: "block", margin: "0 auto" }}
                    >
                      Upload
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            "& .MuiTablePagination-selectLabel, & .MuiTablePagination-select": {
              fontWeight: 500,
            },
          }}
        />
      </TableContainer>

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
      <Modal open={viewImageModal} onClose={handleCloseViewImageModal}>
        <Box
          onClick={handleCloseViewImageModal}
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <Button
            onClick={handleCloseViewImageModal}
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
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
              style={{ maxWidth: "90%", maxHeight: "90%" }}
              onClick={(e) => e.stopPropagation()}
            />
          )}
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
