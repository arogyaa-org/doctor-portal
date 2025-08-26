"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  DialogActions,
  Grid,
  TextField,
  FormControlLabel,
  Checkbox,
  Autocomplete,
  IconButton,
  Typography,
  Paper,
  Box,
} from "@mui/material";
import {
  Image as ImageIcon,
  AddCircle,
  Close,
  Description,
  ListAlt,
  Add,
} from "@mui/icons-material";
import { styled } from "@mui/system";
import { creator } from "@/apis/apiClient";
import { Utility } from "@/utils";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import Toast from "@/components/common/Toast";

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& label": { color: "black" },
  "& label.Mui-focused": { color: theme.palette.primary.main },
  "& .MuiOutlinedInput-root": {
    "& fieldset": { borderColor: "black" },
    "&:hover fieldset": { borderColor: theme.palette.primary.main },
    "&.Mui-focused fieldset": { borderColor: theme.palette.primary.main },
  },
}));

const optionsCategory = [
  { label: "Blood Test", value: "blood_test" },
  { label: "X-Ray", value: "x_ray" },
  { label: "Other", value: "other" },
];

const optionsStatus = [
  { label: "Scheduled", value: "scheduled" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

const optionsType = [
  { label: "Self", value: "self" },
  { label: "Doctor", value: "doctor" },
];

interface TestItem {
  name: string;
  description: string;
  category: string;
  isEmptyStomach: boolean;
}

interface CreateTestDialogProps {
  open: boolean;
  onClose: () => void;
  fetchTests: () => void;
  patientId: string;
  doctorId?: string;
}

// eslint-disable-next-line react/function-component-definition
const CreateTestDialog: React.FC<CreateTestDialogProps> = ({
  open,
  onClose,
  fetchTests,
  patientId,
  doctorId,
}) => {
  const dispatch: AppDispatch = useDispatch();
  const { toast } = useSelector((state: RootState) => state.toast);
  const { toastAndNavigate } = Utility();

  const initialTestItem: TestItem = {
    name: "",
    description: "",
    category: "blood_test",
    isEmptyStomach: false,
  };

  const initialFormData = {
    status: "scheduled",
    type: null,
    photo: null,
  };

  const initialErrors = {
    name: "",
    description: "",
    category: "",
    status: "",
    type: "",
  };

  const [testItems, setTestItems] = useState<TestItem[]>([
    { ...initialTestItem },
  ]);
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState(initialErrors);
  const [testSuggestions, setTestSuggestions] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("testSuggestions");
    if (saved) {
      setTestSuggestions(JSON.parse(saved));
    }
  }, []);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open]);

  // Function to reset the form to initial state
  const resetForm = () => {
    setTestItems([{ ...initialTestItem }]);
    setFormData({ ...initialFormData });
    setErrors({ ...initialErrors });
  };

  // Modified onClose handler to reset form
  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateForm = () => {
    const newErrors = {
      name: testItems.some((item) => !item.name) ? "Name is required" : "",
      description: testItems.some((item) => !item.description)
        ? "Description is required"
        : "",
      category: testItems.some((item) => !item.category)
        ? "Category is required"
        : "",
      status: formData.status ? "" : "Status is required",
      type: formData.type ? "" : "Type is required",
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some((e) => e !== "");
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, photo: file }));
    }
  };

  const handleTestItemChange = (
    index: number,
    field: keyof TestItem,
    value: any
  ) => {
    const updatedItems = [...testItems];
    updatedItems[index][field] = value;
    setTestItems(updatedItems);
  };

  const handleAddTest = () =>
    setTestItems([...testItems, { ...initialTestItem }]);

  const handleRemoveTest = (index: number) => {
    if (testItems.length > 1) {
      setTestItems(testItems.filter((_, i) => i !== index));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    try {
      const payload = {
        patientId,
        doctorId,
        tests: testItems.map(
          ({ name, description, category, isEmptyStomach }) => ({
            name,
            description,
            category,
            isEmptyStomach,
          })
        ),
        status: formData.status,
        type: formData.type,
      };

      const formDataInstance = new FormData();
      formDataInstance.append("payload", JSON.stringify(payload));
      if (formData.photo) {
        formDataInstance.append("photo", formData.photo);
      }

      // Debug log (optional)
      for (let pair of formDataInstance.entries()) {
        console.log(pair[0], pair[1]);
      }

      const response = await creator("test", "create-test", formDataInstance, {
        "Content-Type": "multipart/form-data",
      });

      if (response.statusCode === 201) {
        toastAndNavigate(
          dispatch,
          true,
          "success",
          "Test created successfully"
        );
        fetchTests();

        // ✅ Save test names to suggestions
        const newTests = testItems
          .map((item) => item.name.trim())
          .filter((name) => name !== "");

        setTestSuggestions((prev) => {
          const updated = Array.from(new Set([...prev, ...newTests]));
          localStorage.setItem("testSuggestions", JSON.stringify(updated));
          return updated;
        });
        handleClose(); // Use handleClose instead of onClose to reset form
      }
    } catch (err) {
      console.error("Submit Error:", err);
      toastAndNavigate(dispatch, true, "error", "Failed to create test");
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="lg">
      <Box sx={{ backgroundColor: "#f5f5f5", borderRadius: 4, padding: 2 }}>
        <DialogTitle>
          <Typography variant="h6">Create Test</Typography>
          <IconButton
            onClick={handleClose}
            sx={{ position: "absolute", top: 6, right: 0 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ padding: 3 }}>
          {/* Tests Section */}
          <Paper elevation={3} sx={{ padding: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Test Details
            </Typography>

            {testItems.map((item, index) => (
              <Box key={index} sx={{ mb: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Autocomplete
                      freeSolo
                      options={testSuggestions}
                      inputValue={item.name || ""}
                      onInputChange={(_, newValue) =>
                        handleTestItemChange(index, "name", newValue)
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Name"
                          fullWidth
                          error={!!errors.name && !item.name}
                          helperText={!item.name && errors.name}
                          required
                          placeholder="Enter test name"
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <>
                                <ListAlt sx={{ color: "#3f51b5", mr: 2 }} />
                                {params.InputProps.startAdornment}
                              </>
                            ),
                          }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <StyledTextField
                      label="Description"
                      fullWidth
                      value={item.description}
                      onChange={(e) =>
                        handleTestItemChange(
                          index,
                          "description",
                          e.target.value
                        )
                      }
                      error={!!errors.description && !item.description}
                      helperText={!item.description && errors.description}
                      placeholder="Enter description"
                      InputProps={{
                        startAdornment: (
                          <Description sx={{ color: "#3f51b5", mr: 2 }} />
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Autocomplete
                      options={optionsCategory}
                      getOptionLabel={(o) => o.label}
                      value={
                        optionsCategory.find(
                          (opt) => opt.value === item.category
                        ) || null
                      }
                      onChange={(_, newValue) =>
                        handleTestItemChange(
                          index,
                          "category",
                          newValue?.value || ""
                        )
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Category"
                          error={!!errors.category && !item.category}
                          helperText={!item.category && errors.category}
                        />
                      )}
                    />
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    sm={4}
                    sx={{ mt: 1, display: "flex", gap: 2 }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={item.isEmptyStomach}
                          onChange={(e) =>
                            handleTestItemChange(
                              index,
                              "isEmptyStomach",
                              e.target.checked
                            )
                          }
                          sx={{
                            color: "#3f51b5",
                            "&.Mui-checked": { color: "#3f51b5" },
                          }}
                        />
                      }
                      label="Empty Stomach"
                    />
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => handleRemoveTest(index)}
                      disabled={testItems.length === 1}
                    >
                      Remove
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            ))}

            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={handleAddTest}
            >
              Add More Test
            </Button>
          </Paper>

          {/* Status, Type, File Upload */}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <Autocomplete
                options={optionsStatus}
                getOptionLabel={(o) => o.label}
                value={
                  optionsStatus.find((opt) => opt.value === formData.status) ||
                  null
                }
                onChange={(_, newValue) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: newValue?.value || "",
                  }))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Status"
                    error={!!errors.status}
                    helperText={errors.status}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Autocomplete
                options={optionsType}
                getOptionLabel={(o) => o.label}
                value={
                  optionsType.find((opt) => opt.value === formData.type) || null
                }
                onChange={(_, newValue) =>
                  setFormData((prev) => ({
                    ...prev,
                    type: newValue?.value || null,
                  }))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Type"
                    error={!!errors.type}
                    helperText={errors.type}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                component="label"
                variant="contained"
                startIcon={<ImageIcon />}
                sx={{
                  borderRadius: "12px",
                  padding: "10px",
                  width: "100%",
                  mt: 0.6,
                  background:
                    "linear-gradient(45deg, #2196F3 30%, #1976D2 90%)",
                  "&:hover": {
                    background:
                      "linear-gradient(45deg, #1976D2 30%, #0D47A1 90%)",
                    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
                  },
                }}
              >
                Choose File
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </Button>
              {formData.photo && (
                <Box sx={{ position: "relative", mt: 2 }}>
                  <img
                    src={URL.createObjectURL(formData.photo)}
                    alt="Uploaded"
                    style={{
                      width: "100%",
                      borderRadius: 8,
                      maxHeight: 200,
                      objectFit: "cover",
                    }}
                  />
                  <IconButton
                    onClick={() => setFormData({ ...formData, photo: null })}
                    sx={{
                      position: "absolute",
                      top: 4,
                      right: 8,
                      color: "#20ADA0",
                    }}
                  >
                    <Close />
                  </IconButton>
                </Box>
              )}
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ justifyContent: "center" }}>
          <Button
            onClick={handleClose}
            variant="outlined"
            color="error"
            sx={{ borderRadius: 50 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            startIcon={<AddCircle />}
            sx={{
              borderRadius: 50,
              background: "linear-gradient(45deg, #2196F3 30%, #1976D2 90%)",
              "&:hover": {
                background: "linear-gradient(45deg, #1976D2 30%, #0D47A1 90%)",
                boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
              },
            }}
          >
            Create
          </Button>
        </DialogActions>

        <Toast
          alerting={toast.toastAlert}
          severity={toast.toastSeverity}
          message={toast.toastMessage}
        />
      </Box>
    </Dialog>
  );
};

export default CreateTestDialog;
