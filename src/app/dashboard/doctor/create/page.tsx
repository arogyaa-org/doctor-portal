"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Formik, Form, Field } from "formik";
import {
  Box,
  Button,
  Grid,
  Typography,
  TextField as MuiTextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  IconButton,
  Autocomplete,
} from "@mui/material";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Password as PasswordIcon,
  Call as CallIcon,
  Language as LanguageIcon,
  Place as PlaceIcon,
  Work as WorkIcon,
  Assignment as AssignmentIcon,
  EventAvailable as EventAvailableIcon,
  Upload as UploadIcon,
  Close as CloseIcon,
  Info as InfoIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from "@mui/icons-material";
import WcIcon from "@mui/icons-material/Wc";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import { fetcher } from "@/apis/apiClient";
import Toast from "@/components/common/Toast";
import { Utility } from "@/utils";
import dayjs from "dayjs";
import { useCreateDoctor, useModifyDoctor } from "@/hooks/doctor";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { useGetSpeciality } from "@/hooks/speciality";
import { useGetQualification } from "@/hooks/qualification";
import { validationSchema } from "./ValidationSchema";

interface DoctorFormValues {
  _id?: string | number;
  username: string;
  email: string;
  password: string;
  contact: string;
  experience: number;
  bio: string;
  gender: string;
  dob: string;
  languageSpoken: string[];
  address: string;
  profilePicture: string;
  consultationFee: number;
  status: string;
  role: string;
  speciality: string[];
  qualification: string[];
  availability: string[];
}

const initialValues: DoctorFormValues = {
  username: "",
  email: "",
  password: "",
  contact: "",
  gender: "",
  dob: "",
  experience: 0,
  bio: "",
  languageSpoken: [],
  address: "",
  profilePicture: "",
  consultationFee: 0,
  status: "",
  role: "",
  speciality: [],
  qualification: [],
  availability: [],
};

const DoctorForm = () => {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const [formValues, setFormValues] = useState<DoctorFormValues>(initialValues);
  const [specialityInput, setSpecialityInput] = useState<string>("");
  const [qualificationInput, setQualificationInput] = useState<string>("");

  const [showPasswordField, setShowPasswordField] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const dispatch: AppDispatch = useDispatch();
  const { toast } = useSelector((state: RootState) => state.toast);
  const { toastAndNavigate } = Utility();

  const { createDoctor } = useCreateDoctor("create-doctor");
  const { modifyDoctor } = useModifyDoctor("update-doctor");

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
  const [updatePasswordButtonText, setUpdatePasswordButtonText] =
    useState("Update Password");

  const params = useParams();
  const doctorId = params?.id;
  const isEditMode = !!doctorId;

  const fetchQualificationById = async (id) => {
    try {
      const response = await fetcher(
        `http://localhost:4002/api/v1/qualification-service/get-qualification-by-id/${id}`
      );
      return response?.data?.name || "";
    } catch (err) {
      console.error(`Error fetching qualification by ID (${id}):`, err);
      return "";
    }
  };

  const fetchSpecialityById = async (id) => {
    try {
      const response = await fetcher(
        `http://localhost:4002/api/v1/speciality-service/get-speciality-by-id/${id}`
      );
      return response?.data?.name || "";
    } catch (err) {
      console.error(`Error fetching speciality by ID (${id}):`, err);
      return "";
    }
  };

  const { value: specialities, swrLoading: specialityLoading } =
    useGetSpeciality(
      null,
      "http://localhost:4002/api/v1/speciality-service/get-specialities"
    );

  const { value: qualifications, swrLoading: qualificationLoading } =
    useGetQualification(
      null,
      "http://localhost:4002/api/v1/qualification-service/get-qualifications"
    );

  console.log("doctorId", doctorId);

  const [showUpdatePasswordButton, setShowUpdatePasswordButton] =
    useState(false);

  useEffect(() => {
    if (doctorId) {
      setTitle("Edit");
      setShowUpdatePasswordButton(true);
      setShowPasswordField(false);
      populateData(doctorId);
    } else {
      setFormValues(initialValues);
      setShowUpdatePasswordButton(false);
      setShowPasswordField(true);
      setTitle("Create");
    }
  }, [doctorId]);

  const populateData = useCallback(
    async (doctorId: string | number) => {
      setLoading(true);
      try {
        const response = await fetcher(
          `http://localhost:4004/api/v1/doctor-service/get-doctor-by-id/${doctorId}`
        );

        if (response?.statusCode === 200) {
          const doctorData = response.data;

          const qualifications = await Promise.all(
            doctorData.qualificationIds.map((id) => fetchQualificationById(id))
          );

          const specialities = await Promise.all(
            doctorData.specializationIds.map((id) => fetchSpecialityById(id))
          );

          setFormValues({
            ...doctorData,
            languageSpoken: doctorData.languagesSpoken || [],
            qualification: qualifications,
            speciality: specialities,
          });
          console.log("Populated Form Values:", {
            ...doctorData,
            qualification: qualifications,
            speciality: specialities,
          });
        } else {
          console.log("Doctor not found or server error");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    },
    [doctorId]
  );

  const handleSubmit = async (values, { setSubmitting }) => {
    setLoading(true);
    try {
      const mappedSpecialities = values.speciality.map((name) => {
        const match = specialities.results.find((item) => item.name === name);
        return match ? match._id : name;
      });

      const mappedQualifications = values.qualification.map((name) => {
        const match = qualifications.results.find((item) => item.name === name);
        return match ? match._id : name;
      });

      const updatedValues = {
        ...values,
        speciality: mappedSpecialities,
        qualification: mappedQualifications,
      };

      console.log("Updated Values for Submission: ", updatedValues);

      if (title === "Create") {
        await createDoctor(updatedValues);
        toastAndNavigate(
          dispatch,
          true,
          "success",
          "Doctor created successfully!"
        );
      } else {
        await modifyDoctor({ ...updatedValues, id: doctorId });
        toastAndNavigate(
          dispatch,
          true,
          "info",
          "Doctor updated successfully!"
        );
      }

      router.push("/dashboard/doctor");
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
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
        position: "relative",
      }}
    >
      {showUpdatePasswordButton && (
        <Button
          variant="outlined"
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
          }}
          onClick={() => {
            setShowPasswordField((prev) => !prev);
            setUpdatePasswordButtonText((prev) =>
              prev === "Update Password" ? "Hide Password" : "Update Password"
            );
          }}
        >
          {updatePasswordButtonText}
        </Button>
      )}

      <Typography
        variant="h4"
        gutterBottom
        sx={{ textAlign: "center", color: "#1976d2", fontWeight: "bold" }}
      >
        {title} Doctor
      </Typography>

      <Formik
        initialValues={formValues}
        validationSchema={validationSchema(isEditMode)}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, errors, touched, setFieldValue, isSubmitting }) => (
          <Form>
            <Grid container spacing={3}>
              {/* Username Field */}
              <Grid item xs={12} sm={6}>
                <Field
                  as={MuiTextField}
                  type="text"
                  label="Username *"
                  name="username"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  error={touched.username && Boolean(errors.username)}
                  helperText={touched.username && errors.username}
                />
              </Grid>
              {/* Email Field */}
              <Grid item xs={12} sm={6}>
                <Field
                  as={MuiTextField}
                  label="Email *"
                  name="email"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  error={touched.email && Boolean(errors.email)}
                  helperText={touched.email && errors.email}
                />
              </Grid>

              {/* password */}
              {showPasswordField && (
                <Grid item xs={12} sm={6}>
                  <MuiTextField
                    label="Password *"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    fullWidth
                    value={values.password}
                    onChange={(e) => setFieldValue("password", e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PasswordIcon color="primary" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={togglePasswordVisibility}>
                            {showPassword ? (
                              <VisibilityIcon color="primary" />
                            ) : (
                              <VisibilityOffIcon color="primary" />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    error={touched.password && Boolean(errors.password)}
                    helperText={touched.password && errors.password}
                  />
                </Grid>
              )}

              {/* Contact Field */}
              <Grid item xs={12} sm={6}>
                <Field
                  as={MuiTextField}
                  label="Contact *"
                  name="contact"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CallIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  error={touched.contact && Boolean(errors.contact)}
                  helperText={touched.contact && errors.contact}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <MuiTextField
                  label="Date of Birth *"
                  name="dob"
                  fullWidth
                  type="date"
                  value={
                    values.dob ? dayjs(values.dob).format("YYYY-MM-DD") : ""
                  }
                  onChange={(e) => {
                    const formattedDate = dayjs(e.target.value).format(
                      "YYYY-MM-DD"
                    );
                    setFieldValue("dob", formattedDate);
                  }}
                  InputLabelProps={{ shrink: true }}
                  error={touched.dob && Boolean(errors.dob)}
                  helperText={touched.dob && errors.dob}
                />
              </Grid>

              {/* Gender Field */}
              <Grid item xs={12} sm={6}>
                <FormControl
                  fullWidth
                  error={touched.gender && Boolean(errors.gender)}
                >
                  <InputLabel>Gender </InputLabel>
                  <Select
                    label="Gender "
                    name="gender"
                    value={values.gender}
                    onChange={(e) => setFieldValue("gender", e.target.value)}
                    startAdornment={
                      <InputAdornment position="start">
                        <WcIcon color="primary" />{" "}
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="transgender">Transgender</MenuItem>
                  </Select>
                  {touched.gender && errors.gender && (
                    <Typography color="error" variant="body2">
                      {errors.gender}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              {/* Experience Field */}
              <Grid item xs={12} sm={6}>
                <Field
                  as={MuiTextField}
                  label="Experience "
                  name="experience"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <WorkIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  error={touched.experience && Boolean(errors.experience)}
                  helperText={touched.experience && errors.experience}
                />
              </Grid>

              {/* Languages Spoken Field */}
              <Grid item xs={12} sm={6}>
                <Field
                  as={MuiTextField}
                  type="text"
                  label="Languages Spoken"
                  name="languageSpoken"
                  fullWidth
                  value={values.languageSpoken.join(", ")}
                  onChange={(e) =>
                    setFieldValue(
                      "languageSpoken",
                      e.target.value.split(",").map((item) => item.trim())
                    )
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LanguageIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  error={
                    touched.languageSpoken && Boolean(errors.languageSpoken)
                  }
                  helperText={touched.languageSpoken && errors.languageSpoken}
                />
              </Grid>

              {/* Address Field */}
              <Grid item xs={12} sm={6}>
                <Field
                  as={MuiTextField}
                  label="Address "
                  name="address"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PlaceIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  error={touched.address && Boolean(errors.address)}
                  helperText={touched.address && errors.address}
                />
              </Grid>
              {/* Consultation Fee Field with Rupee Icon */}
              <Grid item xs={12} sm={6}>
                <Field
                  as={MuiTextField}
                  label="Consultation Fee "
                  name="consultationFee"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CurrencyRupeeIcon
                          color="primary"
                          sx={{ fontSize: "1.5rem" }}
                        />
                      </InputAdornment>
                    ),
                  }}
                  error={
                    touched.consultationFee && Boolean(errors.consultationFee)
                  }
                  helperText={touched.consultationFee && errors.consultationFee}
                />
              </Grid>
              {/* Status Field */}
              <Grid item xs={12} sm={6}>
                <FormControl
                  fullWidth
                  error={touched.status && Boolean(errors.status)}
                >
                  <InputLabel>Status </InputLabel>
                  <Select
                    label="Status "
                    name="status"
                    value={values.status}
                    onChange={(e) => setFieldValue("status", e.target.value)}
                    startAdornment={
                      <InputAdornment position="start">
                        <InfoIcon color="primary" />{" "}
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                    <MenuItem value="On Leave">On Leave</MenuItem>
                  </Select>
                  {touched.status && errors.status && (
                    <Typography color="error" variant="body2">
                      {errors.status}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              {/* Role Field */}
              <Grid item xs={12} sm={6}>
                <Field
                  as={MuiTextField}
                  label="Role *"
                  name="role"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <WorkIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  error={touched.role && Boolean(errors.role)}
                  helperText={touched.role && errors.role}
                />
              </Grid>

              {/* Availability Field */}
              <Grid item xs={12} sm={12}>
                <Typography variant="h6" gutterBottom>
                  Availability
                </Typography>
                {values.availability.map((slot, index) => (
                  <Grid
                    container
                    spacing={2}
                    key={index}
                    alignItems="center"
                    sx={{ mb: 2 }}
                  >
                    <Grid item xs={4}>
                      <Autocomplete
                        options={[
                          "Monday",
                          "Tuesday",
                          "Wednesday",
                          "Thursday",
                          "Friday",
                          "Saturday",
                          "Sunday",
                        ]}
                        getOptionLabel={(option) => option}
                        value={slot.day || ""}
                        onChange={(event, newValue) => {
                          const updatedAvailability = [...values.availability];
                          updatedAvailability[index].day = newValue || "";
                          setFieldValue("availability", updatedAvailability);
                        }}
                        renderInput={(params) => (
                          <MuiTextField
                            {...params}
                            label="Day"
                            fullWidth
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <Field
                        as={MuiTextField}
                        label="Start Time"
                        name={`availability[${index}].startTime`}
                        type="time"
                        value={slot.startTime || ""}
                        onChange={(e) => {
                          const updatedAvailability = [...values.availability];
                          updatedAvailability[index].startTime = e.target.value;
                          setFieldValue("availability", updatedAvailability);
                        }}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <Field
                        as={MuiTextField}
                        label="End Time"
                        name={`availability[${index}].endTime`}
                        type="time"
                        value={slot.endTime || ""}
                        onChange={(e) => {
                          const updatedAvailability = [...values.availability];
                          updatedAvailability[index].endTime = e.target.value;
                          setFieldValue("availability", updatedAvailability);
                        }}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={2}>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => {
                          const updatedAvailability =
                            values.availability.filter(
                              (_, idx) => idx !== index
                            );
                          setFieldValue("availability", updatedAvailability);
                        }}
                        fullWidth
                      >
                        Remove
                      </Button>
                    </Grid>
                  </Grid>
                ))}
                <Button
                  variant="outlined"
                  onClick={() =>
                    setFieldValue("availability", [
                      ...values.availability,
                      { day: "", startTime: "", endTime: "" },
                    ])
                  }
                  sx={{ mt: 1 }}
                >
                  Add Slot
                </Button>
              </Grid>

              {/* Speciality Autocomplete */}
              <Grid item xs={12} sm={12}>
                <Autocomplete
                  multiple
                  freeSolo
                  options={specialities?.results || []}
                  getOptionLabel={(option) =>
                    typeof option === "string" ? option : option.name || ""
                  }
                  value={
                    values.speciality && specialities?.results
                      ? values.speciality.map(
                        (name) =>
                          specialities.results.find(
                            (item) => item.name === name
                          ) || { name }
                      )
                      : []
                  }
                  onChange={(event, newValue) => {
                    setFieldValue(
                      "speciality",
                      newValue.map((item) =>
                        typeof item === "string" ? item : item.name
                      )
                    );
                  }}
                  inputValue={specialityInput}
                  onInputChange={(event, newInputValue) => {
                    setSpecialityInput(newInputValue);
                  }}
                  loading={specialityLoading}
                  renderInput={(params) => (
                    <MuiTextField
                      {...params}
                      label="Speciality *"
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <>
                            <InputAdornment position="start">
                              <AssignmentIcon color="primary" />
                            </InputAdornment>
                            {params.InputProps.startAdornment}
                          </>
                        ),
                        endAdornment: (
                          <>
                            {specialityLoading ? (
                              <CircularProgress color="inherit" size={20} />
                            ) : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />
                {touched.speciality && errors.speciality && (
                  <Typography color="error" variant="body2">
                    {errors.speciality}
                  </Typography>
                )}
              </Grid>

              {/* Qualification Autocomplete */}
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  freeSolo
                  options={qualifications?.results || []}
                  getOptionLabel={(option) =>
                    typeof option === "string" ? option : option.name || ""
                  }
                  value={
                    values.qualification && qualifications?.results
                      ? values.qualification.map(
                        (name) =>
                          qualifications.results.find(
                            (item) => item.name === name
                          ) || {
                            name,
                          }
                      )
                      : []
                  }
                  onChange={(event, newValue) => {
                    setFieldValue(
                      "qualification",
                      newValue.map((item) =>
                        typeof item === "string" ? item : item.name
                      )
                    );
                  }}
                  inputValue={qualificationInput}
                  onInputChange={(event, newInputValue) => {
                    setQualificationInput(newInputValue);
                  }}
                  loading={qualificationLoading}
                  renderInput={(params) => (
                    <MuiTextField
                      {...params}
                      label="Qualification"
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <>
                            <InputAdornment position="start">
                              <AssignmentIcon color="primary" />
                            </InputAdornment>
                            {params.InputProps.startAdornment}
                          </>
                        ),
                        endAdornment: (
                          <>
                            {qualificationLoading ? (
                              <CircularProgress color="inherit" size={20} />
                            ) : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />
                {touched.qualification && errors.qualification && (
                  <Typography color="error" variant="body2">
                    {errors.qualification}
                  </Typography>
                )}
              </Grid>

              {/* Bio Field */}
              <Grid item xs={12} sm={12}>
                <Field
                  as={MuiTextField}
                  label="Bio "
                  name="bio"
                  fullWidth
                  multiline
                  minRows={3}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AssignmentIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  error={touched.bio && Boolean(errors.bio)}
                  helperText={touched.bio && errors.bio}
                />
              </Grid>
              {/* Image Upload and Bio Order: Updated */}
              <Grid item xs={12} sm={6}>
                <input
                  accept="image/*"
                  style={{ display: "none" }}
                  id="profilePicture"
                  type="file"
                  onChange={(e) => {
                    const file = e.currentTarget.files[0];
                    if (file) {
                      setFieldValue("profilePicture", file);
                      const previewURL = URL.createObjectURL(file);
                      setFieldValue("previewURL", previewURL);
                    }
                  }}
                />
                <label htmlFor="profilePicture">
                  <Button
                    variant="contained"
                    component="span"
                    startIcon={<UploadIcon />}
                    fullWidth
                    sx={{
                      height: "56px",
                      fontSize: "1rem",
                      justifyContent: "center",
                      paddingLeft: "16px",
                      backgroundColor: "white",
                      color: "black",
                      border: "1px solid #ccc",
                      "&:hover": {
                        backgroundColor: "#f0f0f0",
                      },
                    }}
                  >
                    Upload Profile Picture
                  </Button>
                </label>
                {touched.profilePicture && errors.profilePicture && (
                  <Typography color="error" variant="body2">
                    {errors.profilePicture}
                  </Typography>
                )}
              </Grid>

              {/* Image Preview */}
              {values.previewURL && (
                <Grid item xs={12}>
                  <Box
                    mt={2}
                    sx={{
                      position: "relative",
                      display: "inline-block",
                      textAlign: "center",
                    }}
                  >
                    {/* Cross Icon Button */}
                    <Button
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        backgroundColor: "white",
                        zIndex: 10,
                        minWidth: 0,
                        padding: "4px",
                        borderRadius: "50%",
                        boxShadow: 1,
                        "&:hover": { backgroundColor: "#f0f0f0" },
                      }}
                      onClick={() => {
                        setFieldValue("profilePicture", null);
                        setFieldValue("previewURL", null);
                      }}
                    >
                      <CloseIcon color="error" fontSize="small" />
                    </Button>

                    {/* Image Preview */}
                    <img
                      src={values.previewURL}
                      alt="Profile Preview"
                      style={{
                        maxWidth: "200px",
                        borderRadius: "8px",
                        objectFit: "cover",
                      }}
                    />
                  </Box>
                </Grid>
              )}

              {/* Submit Button */}
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{
                    justifyContent: "center",
                    backgroundColor: "#1976d2",
                    color: "#fff",
                  }}
                  disabled={isSubmitting || loading}
                >
                  {isSubmitting || loading ? "Saving..." : `${title} Doctor`}
                </Button>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>

      <Toast
        alerting={toast.toastAlert}
        severity={toast.toastSeverity}
        message={toast.toastMessage}
      />
    </Box>
  );
};

export default DoctorForm;
