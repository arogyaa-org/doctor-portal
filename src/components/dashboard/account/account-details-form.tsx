import React from "react";
import {
  Box,
  Button,
  Grid,
  TextField,
  Typography,
  MenuItem,
  IconButton,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";

const states = [
  { value: "uttar-pradesh", label: "Uttar Pradesh" },
  { value: "new-delhi", label: "New Delhi" },
  { value: "noida", label: "Noida" },
  { value: "uttarakhand", label: "Uttarakhand" },
];

interface AccountDetailsFormProps {
  onClose: () => void;
}

export default function AccountDetailsForm({
  onClose,
}: AccountDetailsFormProps): React.JSX.Element {
  const handleSave = () => {
    // Add save logic (e.g., API call)
    alert("Profile details saved");
    onClose();
  };

  return (
    <form>
      {/* Close Icon */}
      <Box display="flex" justifyContent="flex-end">
        <IconButton onClick={onClose} aria-label="close">
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Form Title */}
      <Typography variant="h6" gutterBottom>
        Edit Profile
      </Typography>

      {/* Form Fields */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField fullWidth label="First Name" defaultValue="John" />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField fullWidth label="Last Name" defaultValue="Doe" />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Email"
            defaultValue="doctor@example.com"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField fullWidth label="Phone" defaultValue="+91 9876543210" />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField fullWidth label="Speciality" defaultValue="Cardiology" />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField fullWidth label="Years of Experience" defaultValue="15" />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField fullWidth label="State" select defaultValue="new-delhi">
            {states.map((state) => (
              <MenuItem key={state.value} value={state.value}>
                {state.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField fullWidth label="City" defaultValue="New Delhi" />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Address"
            defaultValue="New Delhi, India"
          />
        </Grid>
      </Grid>

      {/* Save Button */}
      <Box mt={3} display="flex" justifyContent="flex-end">
        <Button
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          onClick={handleSave}
        >
          Save Changes
        </Button>
      </Box>
    </form>
  );
}
