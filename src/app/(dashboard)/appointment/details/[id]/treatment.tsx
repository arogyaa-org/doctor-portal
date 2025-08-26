"use client";
import React, { useState, useEffect } from "react";
import {
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  DialogActions,
  Checkbox,
  FormControlLabel,
  Grid,
  Typography,
  IconButton,
  Box,
  TextField,
  Paper,
} from "@mui/material";
import {
  Image as ImageIcon,
  Close,
  CheckCircle,
  ListAlt,
  Description,
  Inventory,
  Repeat,
  Timer,
  Add,
  LocalHospital,
  CalendarToday,
} from "@mui/icons-material";
import { styled } from "@mui/system";
import { creator } from "@/apis/apiClient";
import { Utility } from "@/utils";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";

// Styled components
const StyledTextField = styled(TextField)({
  "& label": {
    color: "black",
  },
  "& label.Mui-focused": {
    color: "black",
  },
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "black",
    },
    "&:hover fieldset": {
      borderColor: "#black",
    },
    "&.Mui-focused fieldset": {
      borderColor: "black",
    },
  },
});

const StyledAutocomplete = styled(Autocomplete)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "black",
    },
    "&:hover fieldset": {
      borderColor: "black",
    },
    "&.Mui-focused fieldset": {
      borderColor: "black",
    },
  },
  "& .MuiInputLabel-root": {
    color: "black",
  },
  "& .Mui-focused .MuiInputLabel-root": {
    color: "black",
  },
}));

const optionsType = [
  { label: "Arogyaa", value: "arogyaa" },
  { label: "Other", value: "other" },
];

const optionsStatus = [
  { label: "In Progress", value: "in progress" },
  { label: "Completed", value: "completed" },
];

interface TreatmentItem {
  _id: string;
  patientId: string;
  name: string;
  description?: string;
  quantity?: string;
  frequency?: string;
  duration?: string;
  isEmptyStomach?: boolean;
  routeOfAdministration?: string;
  startDate?: string;
  isSubstitutionAllowed?: boolean;
  type?: string;
  status: string;
  diagnosis: string;
  isFollowUp: boolean;
  followUpDate?: Date;
}

interface CreateTreatmentDialogProps {
  open: boolean;
  onClose: () => void;
  fetchTreatments: (newTreatment: any) => void;
  patientId: string;
}

// Initial state values
const initialTreatmentItem: TreatmentItem = {
  _id: "",
  patientId: "",
  status: "",
  diagnosis: "",
  isFollowUp: false,
  name: "",
  description: "",
  quantity: "",
  frequency: "",
  duration: "",
  isEmptyStomach: false,
  routeOfAdministration: "",
  startDate: "",
  isSubstitutionAllowed: false,
};

const initialFormData = {
  type: "",
  status: "in progress",
  photo: null,
  diagnosis: "",
  isFollowUp: false,
  followUpDate: "",
};

const initialErrors = {
  name: "",
  description: "",
  quantity: "",
  frequency: "",
  duration: "",
  type: "",
  diagnosis: "",
  routeOfAdministration: "",
  startDate: "",
};

// eslint-disable-next-line react/function-component-definition
const CreateTreatmentDialog: React.FC<CreateTreatmentDialogProps> = ({
  open,
  onClose,
  fetchTreatments,
  patientId,
}) => {
  const dispatch: AppDispatch = useDispatch();
  const { toastAndNavigate, decodedToken } = Utility();

  const [treatmentItems, setTreatmentItems] = useState<TreatmentItem[]>([
    { ...initialTreatmentItem },
  ]);

  const [formData, setFormData] = useState({ ...initialFormData });
  const [errors, setErrors] = useState({ ...initialErrors });
  const token = decodedToken();
  const [medicineSuggestions, setMedicineSuggestions] = useState<string[]>([]);

  // Reset form when modal opens or closes
  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open]);

  // Function to reset all form state
  const resetForm = () => {
    setTreatmentItems([{ ...initialTreatmentItem }]);
    setFormData({ ...initialFormData });
    setErrors({ ...initialErrors });
  };

  const handleClose = (event: any, reason: string) => {
    if (reason !== "backdropClick") {
      resetForm();
      onClose();
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      name: treatmentItems.some((item) => !item.name) ? "Name is required" : "",
      description: treatmentItems.some((item) => !item.description)
        ? "Description is required"
        : "",
      quantity: treatmentItems.some((item) => !item.quantity)
        ? "Quantity is required"
        : "",
      frequency: treatmentItems.some((item) => !item.frequency)
        ? "Frequency is required"
        : "",
      duration: treatmentItems.some((item) => !item.duration)
        ? "Duration is required"
        : "",
      routeOfAdministration: treatmentItems.some(
        (item) => !item.routeOfAdministration
      )
        ? "Route of Administration is required"
        : "",
      startDate: treatmentItems.some((item) => !item.startDate)
        ? "Start Date is required"
        : "",
      type: formData.type ? "" : "Type is required",
      diagnosis: formData.diagnosis ? "" : "Diagnosis is required",
    };

    setErrors(newErrors);
    valid = !Object.values(newErrors).some((error) => error !== "");
    return valid;
  };

  const handleImageUpload = (event: { target: { files: any[] } }) => {
    const file = event.target.files[0];
    if (file) {
      setFormData((prevData) => ({
        ...prevData,
        photo: file,
      }));
    }
  };

  const handleTreatmentItemChange = (
    index: number,
    field: keyof TreatmentItem,
    value: any
  ) => {
    const updatedItems = [...treatmentItems];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };
    setTreatmentItems(updatedItems);
  };

  const handleAddTreatment = () => {
    setTreatmentItems([...treatmentItems, { ...initialTreatmentItem }]);
  };

  const handleRemoveTreatment = (index: number) => {
    if (treatmentItems.length > 1) {
      const updatedItems = treatmentItems.filter((_, i) => i !== index);
      setTreatmentItems(updatedItems);
    }
  };

  const handleChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    // Decode token freshly on every submit
    const { decodedToken } = Utility();
    const token = decodedToken();

    if (!token || token?.role !== "doctor") {
      console.error("Current user is not a doctor");
      toastAndNavigate(
        dispatch,
        true,
        "error",
        "Unauthorized: Doctor login required"
      );
      return;
    }

    try {
      const payload = {
        doctorId: token.id,
        patientId,
        treatments: treatmentItems.map((item) => ({
          name: item.name,
          description: item.description,
          quantity: item.quantity,
          frequency: item.frequency,
          duration: item.duration,
          isEmptyStomach: item.isEmptyStomach,
          routeOfAdministration: item.routeOfAdministration,
          startDate: item.startDate,
          isSubstitutionAllowed: item.isSubstitutionAllowed,
        })),
        type: formData.type,
        diagnosis: formData.diagnosis,
        isFollowUp: formData.isFollowUp,
        followUpDate: formData.followUpDate,
        status: formData.status,
      };

      const formDataInstance = new FormData();
      formDataInstance.append("payload", JSON.stringify(payload));

      if (formData.photo) {
        formDataInstance.append("photo", formData.photo);
      }

      //Include token in Authorization header
      const response = await creator(
        "treatment",
        "create-treatment",
        formDataInstance,
        {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      );

      if (response.statusCode === 201) {
        toastAndNavigate(
          dispatch,
          true,
          "success",
          "Treatment created successfully"
        );
        fetchTreatments(response.data);

        // ✅ Save new medicines here
        const newMedicines = treatmentItems
          .map((item) => item.name.trim())
          .filter((name) => name !== "");

        setMedicineSuggestions((prev) => {
          const updated = Array.from(new Set([...prev, ...newMedicines]));
          localStorage.setItem("medicineSuggestions", JSON.stringify(updated));
          return updated;
        });
        resetForm();
        onClose();
      }
    } catch (error) {
      toastAndNavigate(dispatch, true, "error", "Failed to create treatment");
    }
  };

  // // Collect unique medicines entered in this form
  // const newMedicines = treatmentItems
  //   .map((item) => item.name.trim())
  //   .filter((name) => name !== "");

  // // Merge with old suggestions (avoid duplicates)
  // setMedicineSuggestions((prev) => {
  //   const updated = Array.from(new Set([...prev, ...newMedicines]));
  //   localStorage.setItem("medicineSuggestions", JSON.stringify(updated)); // optional persistence
  //   return updated;
  // });

  useEffect(() => {
    const saved = localStorage.getItem("medicineSuggestions");
    if (saved) {
      setMedicineSuggestions(JSON.parse(saved));
    }
  }, []);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="lg"
      sx={{ borderRadius: "50px" }}
    >
      <Box sx={{ backgroundColor: "#f5f5f5", borderRadius: 4, padding: 2 }}>
        <DialogTitle sx={{ color: "black" }}>
          <Typography variant="h6">Create Treatment</Typography>
          <IconButton
            onClick={() => {
              resetForm();
              onClose();
            }}
            sx={{
              color: "black",
              position: "absolute",
              top: 6,
              right: 0,
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ padding: 3 }}>
          <Paper elevation={3} sx={{ padding: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Treatment Details
            </Typography>

            {treatmentItems.map((item, index) => (
              <Box key={index} sx={{ mb: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <StyledAutocomplete
                      freeSolo
                      options={medicineSuggestions}
                      inputValue={item.name} // <-- use inputValue for the typed text
                      onInputChange={(event, newValue) => {
                        handleTreatmentItemChange(index, "name", newValue);
                      }}
                      value={item.name || null} // keep value as null unless selecting exact option
                      onChange={(event, newValue) => {
                        handleTreatmentItemChange(
                          index,
                          "name",
                          newValue || ""
                        );
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Medication Name"
                          margin="dense"
                          error={!!errors.name && !item.name}
                          helperText={!item.name && errors.name}
                          placeholder="Medications name (e.g., Paracetamol)"
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
                      margin="dense"
                      value={item.description}
                      onChange={(e) =>
                        handleTreatmentItemChange(
                          index,
                          "description",
                          e.target.value
                        )
                      }
                      error={!!errors.description && !item.description}
                      helperText={!item.description && errors.description}
                      placeholder="Enter description(e.g.,For fever)"
                      InputProps={{
                        startAdornment: (
                          <Description sx={{ color: "#3f51b5", mr: 2 }} />
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <StyledTextField
                      label="Dose"
                      fullWidth
                      margin="dense"
                      value={item.quantity}
                      onChange={(e) =>
                        handleTreatmentItemChange(
                          index,
                          "quantity",
                          e.target.value
                        )
                      }
                      error={!!errors.quantity && !item.quantity}
                      helperText={!item.quantity && errors.quantity}
                      placeholder="Enter quantity(e.g.,1 cap of 500mg)"
                      InputProps={{
                        startAdornment: (
                          <Inventory sx={{ color: "#3f51b5", mr: 2 }} />
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <StyledTextField
                      label="Frequency"
                      fullWidth
                      margin="dense"
                      value={item.frequency}
                      onChange={(e) =>
                        handleTreatmentItemChange(
                          index,
                          "frequency",
                          e.target.value
                        )
                      }
                      error={!!errors.frequency && !item.frequency}
                      helperText={!item.frequency && errors.frequency}
                      placeholder="Enter frequency(e.g.,twice a day)"
                      InputProps={{
                        startAdornment: (
                          <Repeat sx={{ color: "#3f51b5", mr: 2 }} />
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <StyledTextField
                      label="Duration"
                      fullWidth
                      margin="dense"
                      value={item.duration}
                      onChange={(e) =>
                        handleTreatmentItemChange(
                          index,
                          "duration",
                          e.target.value
                        )
                      }
                      error={!!errors.duration && !item.duration}
                      helperText={!item.duration && errors.duration}
                      placeholder="Enter duration(e.g.,7 days)"
                      InputProps={{
                        startAdornment: (
                          <Timer sx={{ color: "#3f51b5", mr: 2 }} />
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <StyledTextField
                      label="Route of Administration"
                      fullWidth
                      margin="dense"
                      value={item.routeOfAdministration}
                      onChange={(e) =>
                        handleTreatmentItemChange(
                          index,
                          "routeOfAdministration",
                          e.target.value
                        )
                      }
                      error={
                        !!errors.routeOfAdministration &&
                        !item.routeOfAdministration
                      }
                      helperText={
                        !item.routeOfAdministration &&
                        errors.routeOfAdministration
                      }
                      placeholder="Enter route (e.g., Oral)"
                      InputProps={{
                        startAdornment: (
                          <LocalHospital sx={{ color: "#3f51b5", mr: 2 }} />
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <StyledTextField
                      label="Start Date"
                      type="date"
                      fullWidth
                      margin="dense"
                      InputLabelProps={{ shrink: true }}
                      value={item.startDate}
                      onChange={(e) =>
                        handleTreatmentItemChange(
                          index,
                          "startDate",
                          e.target.value
                        )
                      }
                      error={!!errors.startDate && !item.startDate}
                      helperText={!item.startDate && errors.startDate}
                      InputProps={{
                        startAdornment: (
                          <CalendarToday sx={{ color: "#3f51b5", mr: 2 }} />
                        ),
                      }}
                    />
                  </Grid>

                  <Grid
                    item
                    xs={12}
                    sm={4}
                    sx={{
                      mt: 1,
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={item.isEmptyStomach}
                          onChange={(e) =>
                            handleTreatmentItemChange(
                              index,
                              "isEmptyStomach",
                              e.target.checked
                            )
                          }
                          sx={{
                            color: item.isEmptyStomach ? "#3f51b5" : "default",
                            "&.Mui-checked": {
                              color: "#3f51b5",
                            },
                          }}
                        />
                      }
                      label="Empty Stomach"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={item.isSubstitutionAllowed}
                          onChange={(e) =>
                            handleTreatmentItemChange(
                              index,
                              "isSubstitutionAllowed",
                              e.target.checked
                            )
                          }
                          sx={{
                            color: item.isSubstitutionAllowed
                              ? "#3f51b5"
                              : "default",
                            "&.Mui-checked": {
                              color: "#3f51b5",
                            },
                          }}
                        />
                      }
                      label="Substitution Allowed"
                    />
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => handleRemoveTreatment(index)}
                      disabled={treatmentItems.length === 1}
                      sx={{
                        height: "36px",
                        borderRadius: "4px",
                        textTransform: "none",
                      }}
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
              onClick={handleAddTreatment}
              sx={{ mt: 1 }}
            >
              Add More Treatment
            </Button>
          </Paper>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <StyledAutocomplete
                options={optionsType}
                getOptionLabel={(option) => option.label}
                value={optionsType.find(
                  (option) => option.value === formData.type
                )}
                onChange={(event, newValue) => {
                  setFormData({
                    ...formData,
                    type: newValue ? newValue.value : "",
                  });
                }}
                fullWidth
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Type"
                    variant="outlined"
                    error={!!errors.type}
                    helperText={errors.type || ""}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={4} marginTop={-1}>
              <StyledTextField
                label="Diagnosis"
                name="diagnosis"
                fullWidth
                margin="dense"
                value={formData.diagnosis}
                onChange={handleChange}
                error={!!errors.diagnosis}
                helperText={errors.diagnosis}
                placeholder="Enter diagnosis"
                InputProps={{
                  startAdornment: (
                    <Description sx={{ color: "#3f51b5", mr: 2 }} />
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <StyledAutocomplete
                options={optionsStatus}
                getOptionLabel={(option) => option.label}
                value={optionsStatus.find(
                  (option) => option.value === formData.status
                )}
                onChange={(event, newValue) => {
                  setFormData({
                    ...formData,
                    status: newValue ? newValue.value : "",
                  });
                }}
                fullWidth
                renderInput={(params) => (
                  <TextField {...params} label="Status" variant="outlined" />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={4} sx={{ mt: 0 }}>
              <Button
                component="label"
                variant="contained"
                startIcon={<ImageIcon />}
                sx={{
                  borderRadius: "12px",
                  padding: "10px",
                  textAlign: "center",
                  background:
                    "linear-gradient(45deg, #2196F3 30%, #1976D2 90%)",
                  cursor: "pointer",
                  width: "100%",
                  marginTop: 0.6,
                  "&:hover": {
                    background:
                      "linear-gradient(45deg, #1976D2 30%, #0D47A1 90%)",
                    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
                  },
                }}
              >
                Upload Prescription
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  id="image-upload"
                  onChange={handleImageUpload}
                />
              </Button>

              {formData.photo && (
                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                    maxHeight: "200px",
                    marginTop: 2,
                    borderRadius: 8,
                    overflow: "hidden",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <img
                    src={URL.createObjectURL(formData.photo)}
                    alt="Uploaded"
                    style={{
                      width: "100%",
                      maxHeight: "200px",
                      objectFit: "cover",
                      borderRadius: 8,
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

            <Grid item xs={3} sm={3} sx={{ mt: 2, ml: 11.5 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.isFollowUp}
                    onChange={(e) =>
                      setFormData({ ...formData, isFollowUp: e.target.checked })
                    }
                    sx={{
                      color: formData.isFollowUp ? "#3f51b5" : "default",
                      "&.Mui-checked": { color: "#3f51b5" },
                    }}
                  />
                }
                label="Is Follow Up?"
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <StyledTextField
                label="Follow Up Date"
                name="followUpDate"
                type="date"
                fullWidth
                margin="dense"
                InputLabelProps={{ shrink: true }}
                value={formData.followUpDate}
                onChange={(e) =>
                  setFormData({ ...formData, followUpDate: e.target.value })
                }
                disabled={!formData.isFollowUp}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center" }}>
          <Button
            onClick={() => {
              resetForm();
              onClose();
            }}
            variant="outlined"
            color="error"
            sx={{ borderRadius: 50, padding: "8px 20px" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            startIcon={<CheckCircle />}
            sx={{
              borderRadius: 50,
              padding: "8px 20px",
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
      </Box>
    </Dialog>
  );
};

export default CreateTreatmentDialog;
