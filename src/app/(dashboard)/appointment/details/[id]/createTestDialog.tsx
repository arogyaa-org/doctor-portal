"use client";
import React, { useState } from "react";
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
} from "@mui/material";
import {
  Image as ImageIcon,
  AddCircle,
  Close,
  Description,
  ListAlt,
} from "@mui/icons-material";
import { styled } from "@mui/system";
import { creator } from "@/apis/apiClient";
import { Utility } from "@/utils";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import Toast from "@/components/common/Toast";

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& label": {
    color: "black",
  },
  "& label.Mui-focused": {
    color: theme.palette.primary.main,
  },
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "black", // Black border initially
    },
    "&:hover fieldset": {
      borderColor: theme.palette.primary.main,
    },
    "&.Mui-focused fieldset": {
      borderColor: theme.palette.primary.main, // Primary border color on focus
    },
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

interface CreateTestDialogProps {
  open: boolean;
  onClose: () => void;
  fetchTests: () => void;
}

const CreateTestDialog: React.FC<CreateTestDialogProps> = ({
  open,
  onClose,
  fetchTests,
  patientId,
}) => {
  const dispatch: AppDispatch = useDispatch();
  const { toast } = useSelector((state: RootState) => state.toast);
  const { toastAndNavigate } = Utility();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "blood_test",
    emptyStomach: false,
    status: "scheduled",
    type: null,
    photo: null,
  });

  console.log("patientId of dialog:", patientId);
  const [errors, setErrors] = useState({
    name: "",
    description: "",
    category: "blood_test",
    emptyStomach: false,
    status: "scheduled",
    type: null,
    photo: null,
  });

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      name: formData.name ? "" : "Name is required",
      description: formData.description ? "" : "Description is required",
      category: formData.category ? "" : "Category is required",
      status: formData.status ? "" : "Status is required",
      type: formData.type ? "" : "Type is required",
    };

    setErrors(newErrors);
    valid = !Object.values(newErrors).some((error) => error !== "");
    return valid;
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFormData((prevData) => ({
        ...prevData,
        photo: file,
      }));
    }
  };

  const handleCheckboxChange = (e) => {
    setFormData({ ...formData, emptyStomach: e.target.checked });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    try {
      const headers = {
        "Content-Type": "multipart/form-data",
      };
      const response = await creator(
        "test",
        "create-test",
        {
          ...formData,
          patientId,
        },
        headers
      );
      if (response.statusCode == 201) {
        toastAndNavigate(dispatch, true, "success", "Created successfully");
        fetchTests();
        onClose();
      }
    } catch (error) {
      toastAndNavigate(dispatch, true, "error", "Failed to create test");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      sx={{ borderRadius: "50px" }}
    >
      <DialogTitle>
        <Typography variant="h6">Create Test</Typography>
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", top: 6, right: 0 }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ padding: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <StyledTextField
              label="Name"
              name="name"
              fullWidth
              margin="dense"
              value={formData.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
              required
              placeholder="Enter test name"
              InputProps={{
                startAdornment: <ListAlt sx={{ color: "#20ADA0", mr: 2 }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <StyledTextField
              label="Description"
              name="description"
              fullWidth
              margin="dense"
              value={formData.description}
              onChange={handleChange}
              error={!!errors.description}
              helperText={errors.description}
              placeholder="Enter description"
              InputProps={{
                startAdornment: <Description sx={{ color: "black", mr: 2 }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Autocomplete
              options={optionsCategory}
              getOptionLabel={(option) => option.label}
              value={optionsCategory.find(
                (option) => option.value === formData.category
              )}
              onChange={(event, newValue) => {
                setFormData({
                  ...formData,
                  category: newValue ? newValue.value : "",
                });
              }}
              fullWidth
              renderInput={(params) => (
                <TextField {...params} label="Category" variant="outlined" />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.emptyStomach}
                  onChange={handleCheckboxChange}
                  sx={{
                    color: formData.emptyStomach ? "#20ADA0" : "default",
                    "&.Mui-checked": { color: "#20ADA0" },
                  }}
                />
              }
              label="Empty Stomach"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Autocomplete
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
          <Grid item xs={12} sm={4}>
            <Autocomplete
              options={optionsType}
              getOptionLabel={(option) => option.label}
              value={optionsType.find(
                (option) => option.value === formData.type
              )}
              onChange={(event, newValue) => {
                setFormData({
                  ...formData,
                  type: newValue ? newValue.value : null,
                });
              }}
              fullWidth
              renderInput={(params) => <TextField {...params} label="Type" />}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              component="label"
              variant="contained"
              startIcon={<ImageIcon />}
              sx={{
                marginY: 1,
                background:  "#1976D2", 
                borderColor: "#20ADA0",
                color: "#fff",
                "&:hover": {
                  background: "#1976D2",
                  boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
                },
                boxShadow: "none",
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
              <img
                src={URL.createObjectURL(formData.photo)}
                alt="Treatment"
                style={{
                  width: "100%",
                  maxHeight: "200px",
                  objectFit: "cover",
                  marginTop: 8,
                  borderRadius: 8,
                }}
              />
            )}
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center" }}>
        <Button
          onClick={onClose}
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
          startIcon={<AddCircle />}
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
      <Toast
        alerting={toast.toastAlert}
        severity={toast.toastSeverity}
        message={toast.toastMessage}
      />
    </Dialog>
  );
};

export default CreateTestDialog;
