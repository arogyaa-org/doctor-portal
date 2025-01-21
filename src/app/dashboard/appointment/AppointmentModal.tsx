"use client";

import React, { useState, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  TextField,
  MenuItem,
  Button,
  Stack,
  Box,
  Grid,
  InputAdornment,
} from "@mui/material";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Utility } from "@/utils";

import PersonIcon from "@mui/icons-material/Person";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import EventIcon from "@mui/icons-material/Event";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import NoteIcon from "@mui/icons-material/Note";
import ListAltIcon from "@mui/icons-material/ListAlt";

interface AppointmentModalProps {
  open: boolean;
  handleClose: () => void;
  handleSave: (data: any) => Promise<{ statusCode: number; message: string }>;
  refetch: () => Promise<any>;
  symptomsList?: string[];
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({
  open,
  handleClose,
  handleSave,
  refetch,
  symptomsList = [],
}) => {
  const { toastAndNavigate } = Utility(); 
  const [loading, setLoading] = useState(false);

  const validationSchema = Yup.object({
    patientName: Yup.string().required("Patient Name is required"),
    doctorName: Yup.string().required("Doctor Name is required"),
    appointmentDate: Yup.string().required("Appointment date is required"),
    appointmentTime: Yup.string().required("Appointment time is required"),
    symptoms: Yup.string().required("Please select a symptom"),
    appointmentType: Yup.string().required("Appointment type is required"),
    status: Yup.string().required("Status is required"),
  });

  const initialValues = {
    patientName: "",
    doctorName: "",
    appointmentDate: "",
    appointmentTime: "",
    symptoms: "",
    appointmentType: "",
    status: "",
  };

  const createAppointment = useCallback(
    async (values: any) => {
      setLoading(true);
      try {
        const result = await handleSave(values);

        if (result?.statusCode === 201) {
          toastAndNavigate(true, "success", "Created Successfully");
          setTimeout(async () => {
            handleClose();
            const updatedAppointments = await refetch();
            if (updatedAppointments) {
            }
          }, 2200);
        } else {
          toastAndNavigate(
            true,
            "error",
            result.message || "Error creating appointment"
          );
          setTimeout(() => handleClose(), 2200);
        }
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.message ||
          "Error creating appointment, please try again.";
        toastAndNavigate(true, "error", errorMessage);
        setTimeout(() => handleClose(), 2200);
      } finally {
        setLoading(false);
      }
    },
    [handleSave, refetch, handleClose]
  );

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h4" mb={-2}>
          Create Appointment
        </Typography>
      </DialogTitle>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values) => createAppointment(values)}
      >
        {({
          values,
          handleChange,
          handleBlur,
          handleReset,
          isSubmitting,
          dirty,
          errors,
          touched,
        }) => (
          <Form>
            <DialogContent sx={{ paddingBottom: 0 }}>
              <Stack spacing={1.5}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      label="Patient Name"
                      name="patientName"
                      value={values.patientName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      fullWidth
                      required
                      error={touched.patientName && Boolean(errors.patientName)}
                      helperText={touched.patientName && errors.patientName}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Doctor Name"
                      name="doctorName"
                      value={values.doctorName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      fullWidth
                      required
                      error={touched.doctorName && Boolean(errors.doctorName)}
                      helperText={touched.doctorName && errors.doctorName}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <MedicalServicesIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      label="Appointment Date"
                      name="appointmentDate"
                      type="date"
                      value={values.appointmentDate}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                      required
                      error={
                        touched.appointmentDate &&
                        Boolean(errors.appointmentDate)
                      }
                      helperText={
                        touched.appointmentDate && errors.appointmentDate
                      }
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EventIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Appointment Time"
                      name="appointmentTime"
                      type="time"
                      value={values.appointmentTime}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                      required
                      error={
                        touched.appointmentTime &&
                        Boolean(errors.appointmentTime)
                      }
                      helperText={
                        touched.appointmentTime && errors.appointmentTime
                      }
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AccessTimeIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      label="Appointment Type"
                      name="appointmentType"
                      value={values.appointmentType}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      select
                      fullWidth
                      required
                      error={
                        touched.appointmentType &&
                        Boolean(errors.appointmentType)
                      }
                      helperText={
                        touched.appointmentType && errors.appointmentType
                      }
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <NoteIcon />
                          </InputAdornment>
                        ),
                      }}
                    >
                      <MenuItem value="online">Online</MenuItem>
                      <MenuItem value="in-person">In-Person</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Status"
                      name="status"
                      value={values.status}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      select
                      fullWidth
                      required
                      error={touched.status && Boolean(errors.status)}
                      helperText={touched.status && errors.status}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <ListAltIcon />
                          </InputAdornment>
                        ),
                      }}
                    >
                      <MenuItem value="scheduled">Scheduled</MenuItem>
                      <MenuItem value="rescheduled">Rescheduled</MenuItem>
                      <MenuItem value="approved">Approved</MenuItem>
                      <MenuItem value="rejected">Rejected</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>

                <TextField
                  label="Symptoms"
                  name="symptoms"
                  value={values.symptoms}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  select
                  fullWidth
                  required
                  error={touched.symptoms && Boolean(errors.symptoms)}
                  helperText={touched.symptoms && errors.symptoms}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MedicalServicesIcon />
                      </InputAdornment>
                    ),
                  }}
                >
                  <MenuItem value="">Select a Symptom</MenuItem>
                  {symptomsList.map((symptom, index) => (
                    <MenuItem key={index} value={symptom}>
                      {symptom}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Box display="flex" justifyContent="end" width="100%">
                <Button
                  type="reset"
                  color="warning"
                  variant="contained"
                  sx={{ mr: 3 }}
                  disabled={!dirty || isSubmitting}
                  onClick={handleReset}
                >
                  Reset
                </Button>
                <Button
                  color="error"
                  variant="contained"
                  sx={{ mr: 3 }}
                  onClick={handleClose}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={!dirty || isSubmitting || loading}
                  color="success"
                >
                  Submit
                </Button>
              </Box>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default AppointmentModal;
