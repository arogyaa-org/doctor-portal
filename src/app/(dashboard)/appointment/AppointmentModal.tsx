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
  Autocomplete,
} from "@mui/material";
import { Formik, Form } from "formik";
import * as Yup from "yup";

import { Utility } from "@/utils";
import PersonIcon from "@mui/icons-material/Person";
import SchoolIcon from "@mui/icons-material/School";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import EventIcon from "@mui/icons-material/Event";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import NoteIcon from "@mui/icons-material/Note";
import ListAltIcon from "@mui/icons-material/ListAlt";

import { useDispatch } from "react-redux";
import { useGetSymptom } from "@/hooks/symptoms";
import { useGetPatient } from "@/hooks/patient";
import { useCreateAppointment } from "@/hooks/appointment";
import Toast from "@/components/common/Toast";
import { AlertColor } from "@mui/material";

interface AppointmentModalProps {
  open: boolean;
  handleClose: () => void;
  refetch: () => Promise<any>;
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({
  open,
  handleClose,
  refetch,
}) => {
  const dispatch = useDispatch();
  const { toastAndNavigate, decodedToken } = Utility();
  const [loading, setLoading] = useState(false);

  const { role, userName, doctorName, id: doctorId } = decodedToken() || {};
  const displayName = role === "admin" ? userName : doctorName;

  // const [toast, setToast] = useState({
  //   toastAlert: false,
  //   toastMessage: "",
  //   toastSeverity: "success" as AlertColor,
  // }); -- bad me krna hai

  const { value: patientData } = useGetPatient(null, "get-patients");

  const { value: symptomData } = useGetSymptom(null, "get-symptoms", 1, 200);

  const { createAppointment } = useCreateAppointment("create-appointment");

  const validationSchema = Yup.object({
    patientName: Yup.string().required("Patient Name is required"),
    doctorName: Yup.string().required("Doctor Name is required"),
    appointmentDate: Yup.string().required("Appointment date is required"),
    appointmentTime: Yup.string().required("Appointment time is required"),
    symptoms: Yup.array()
      .of(Yup.string().required("A symptom is required"))
      .min(1, "Please select at least one symptom"),
    appointmentType: Yup.string().required("Appointment type is required"),
    status: Yup.string().required("Status is required"),
  });

  const initialValues = {
    patientName: "",
    patientId: "",
    doctorName: displayName || "",
    doctorId: doctorId || "",
    appointmentDate: "",
    appointmentTime: "",
    symptoms: [],
    appointmentType: "",
    status: "",
  };

  const handleCreateAppointment = useCallback(
    async (values: any, { resetForm }) => {
      setLoading(true);
      try {
        const appointmentData = {
          ...values,
          doctorId,
          patientId: values.patientId,
          symptomIds:
            symptomData?.results
              ?.filter((symptom) => values.symptoms.includes(symptom.name))
              .map((symptom) => symptom._id) || [],
        };

        const response = await createAppointment(appointmentData);

        if (response?.statusCode === 201) {
          // Show success toast and refetch data after appointment creation
          toastAndNavigate(
            dispatch,
            true,
            "success",
            response.message || "Appointment Created Successfully",
            null,
            false
          );
          setTimeout(async () => {
            handleClose(); // Close the modal
            resetForm(); // Reset the form
            await refetch(); // Trigger refetch to get the latest data
          });
        } else {
          toastAndNavigate(
            dispatch,
            true,
            "error",
            response?.message || "Error Creating Appointment",
            null,
            false
          );
        }
      } catch (error: any) {
        toastAndNavigate(
          dispatch,
          true,
          "error",
          error?.message || "Error Creating Appointment",
          null,
          false
        );
      } finally {
        setLoading(false);
      }
      console.log(
        "toastfchbvhbv",
        toast.toastAlert,
        toast.toastSeverity,
        toast.toastMessage
      );
    },
    [createAppointment, refetch, handleClose, doctorId, symptomData, dispatch]
  );

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h4" mb={-2}>
            Create Appointment
          </Typography>
        </DialogTitle>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleCreateAppointment}
          enableReinitialize
        >
          {({
            values,
            handleChange,
            setFieldValue,
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
                        label="Doctor Name"
                        name="doctorName"
                        value={values.doctorName}
                        fullWidth
                        required
                        disabled
                        error={touched.doctorName && Boolean(errors.doctorName)}
                        helperText={touched.doctorName && errors.doctorName}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SchoolIcon />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid> 
                    <Grid item xs={6}>
                      <Autocomplete
                        options={patientData?.results || []}
                        getOptionLabel={(option) => option.username || ""}
                        value={
                          patientData?.results.find(
                            (p) => p._id === values.patientId
                          ) || null
                        }
                        onChange={(e, value) => {
                          setFieldValue("patientId", value?._id || "");
                          setFieldValue("patientName", value?.username || "");
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Select Patient"
                            name="patientName"
                            onBlur={handleBlur}
                            fullWidth
                            required
                            error={
                              touched.patientName && Boolean(errors.patientName)
                            }
                            helperText={
                              touched.patientName && errors.patientName
                            }
                            InputProps={{
                              ...params.InputProps,
                              startAdornment: (
                                <>
                                  <InputAdornment position="start">
                                    <PersonIcon />
                                  </InputAdornment>
                                  {params.InputProps.startAdornment}
                                </>
                              ),
                            }}
                          />
                        )}
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
                  <Autocomplete
                    multiple
                    options={
                      symptomData?.results?.map((item) => item.name) || []
                    }
                    value={values.symptoms || []}
                    onChange={(e, value) => setFieldValue("symptoms", value)}
                    filterSelectedOptions
                    getOptionLabel={(option) => option || ""}
                    isOptionEqualToValue={(option, value) => option === value}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Symptoms"
                        name="symptoms"
                        onBlur={handleBlur}
                        error={touched.symptoms && Boolean(errors.symptoms)}
                        helperText={touched.symptoms && errors.symptoms}
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <>
                              <InputAdornment position="start">
                                <MedicalServicesIcon />
                              </InputAdornment>
                              {params.InputProps.startAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                  />
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
      {/* <Toast
        alerting={toast.toastAlert}
        severity={toast.toastSeverity}
        message={toast.toastMessage}
      /> */}
    </>
  );
};

export default AppointmentModal;
