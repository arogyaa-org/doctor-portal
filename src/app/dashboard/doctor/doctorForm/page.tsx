"use client";
import React, { useState } from "react";
import {
  Box,
  Button,
  Grid,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  InputAdornment,
} from "@mui/material";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Work as WorkIcon,
  CalendarToday as CalendarTodayIcon,
  Info as InfoIcon,
  AssignmentInd as AssignmentIndIcon,
} from "@mui/icons-material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";

const DoctorForm = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    experienceYears: "",
    bio: "",
    availability: [null, null, null], // Holds DateTime values
    role: "",
  });

  const [submittedData, setSubmittedData] = useState<any[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleAvailabilityChange = (index: number, value: any) => {
    setFormData((prevState) => {
      const updatedAvailability = [...prevState.availability];
      updatedAvailability[index] = value;
      return { ...prevState, availability: updatedAvailability };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedData((prevState) => [...prevState, formData]); // Add the submitted data to the list
    setFormData({
      username: "",
      email: "",
      experienceYears: "",
      bio: "",
      availability: [null, null, null],
      role: "",
    }); // Reset the form
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        sx={{
          maxWidth: 800,
          mx: "auto",
          mt: 5,
          p: 4,
          borderRadius: 2,
          boxShadow: 4,
          backgroundColor: "white",
          border: "1px solid #e0e0e0",
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{ textAlign: "center", color: "#1976d2", fontWeight: "bold" }}
        >
          <AssignmentIndIcon sx={{ fontSize: 40, color: "#1976d2", mb: -1 }} />
          Add New Doctor
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Username"
                name="username"
                fullWidth
                value={formData.username}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email"
                name="email"
                fullWidth
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Experience (Years)"
                name="experienceYears"
                fullWidth
                type="number"
                value={formData.experienceYears}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarTodayIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Bio"
                name="bio"
                fullWidth
                multiline
                rows={3}
                value={formData.bio}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <InfoIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
                required
              />
            </Grid>

            {/* Availability Section with DateTime Pickers */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Availability (Select up to 3 slots):
              </Typography>
              <Grid container spacing={2}>
                {formData.availability.map((slot, index) => (
                  <Grid item xs={12} sm={4} key={index}>
                    <DateTimePicker
                      label={`Slot ${index + 1}`}
                      value={slot}
                      onChange={(value) => handleAvailabilityChange(index, value)}
                      renderInput={(params) => (
                        <TextField {...params} fullWidth required={index === 0} />
                      )}
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Role"
                name="role"
                fullWidth
                type="number"
                value={formData.role}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{
                  backgroundColor: "#1976d2",
                  color: "#fff",
                  "&:hover": { backgroundColor: "#005bb5" },
                }}
              >
                Submit
              </Button>
            </Grid>
          </Grid>
        </form>

        {submittedData.length > 0 && (
          <Box sx={{ mt: 5 }}>
            <Typography variant="h5" gutterBottom>
              Submitted Data
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Field</TableCell>
                    <TableCell>Value</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {submittedData.map((data, index) => (
                    <React.Fragment key={index}>
                      {Object.entries(data).map(([key, value]) => (
                        <TableRow key={key}>
                          <TableCell>{key}</TableCell>
                          <TableCell>
                            {Array.isArray(value) ? value.join(", ") : value?.toString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default DoctorForm;
