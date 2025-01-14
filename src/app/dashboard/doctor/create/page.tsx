"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
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
  Info as InfoIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from "@mui/icons-material";
import WcIcon from "@mui/icons-material/Wc";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PinDrop from '@mui/icons-material/PinDrop';
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import DeleteIcon from "@mui/icons-material/Delete";
import TagIcon from "@mui/icons-material/Tag";
import dayjs from "dayjs";

import Loader from "@/components/common/Loader";
import Toast from "@/components/common/Toast";
import validationSchema from "./ValidationSchema";
import { AppDispatch, RootState } from "@/redux/store";
import { fetcher } from "@/apis/apiClient";
import { useCreateDoctor, useModifyDoctor } from "@/hooks/doctor";
import { useGetSpeciality } from "@/hooks/speciality";
import { useGetQualification } from "@/hooks/qualification";
import { useGetSymptom } from "@/hooks/symptoms";
import { Utility } from "@/utils";

interface DoctorFormValues {
  _id?: string | number;
  username: string;
  email: string;
  password: string;
  contact: string;
  experience: string | number;
  bio: string;
  tags: string[];
  gender: string;
  dob: string;
  languagesSpoken: string[];
  address: string;
  pincode: string | number;
  profilePicture: any;
  consultationFee: string | number;
  status: string;
  role: string;
  qualificationIds: any[];
  specializationIds: any[];
  symptomIds: any[];
  availability: any[];
}

const initialValues: DoctorFormValues = {
  username: "",
  email: "",
  password: "",
  contact: "",
  gender: "",
  dob: "",
  experience: "",
  bio: "",
  tags: [],
  languagesSpoken: [],
  address: "",
  pincode: "",
  profilePicture: null,
  consultationFee: "",
  status: "",
  role: "",
  qualificationIds: [],
  specializationIds: [],
  symptomIds: [],
  availability: [],
};
let editFormValues: DoctorFormValues;

const DoctorForm = () => {
  const [title, setTitle] = useState<"Create" | "Edit">("Create");
  const [loading, setLoading] = useState<boolean>(false);
  const [formValues, setFormValues] = useState<DoctorFormValues>(initialValues);
  const [showPassword, setShowPassword] = useState(false);
  const [updatePassword, setUpdatePassword] = useState<boolean>(false);
  const pwFieldRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const params = useParams();
  const router = useRouter();
  const dispatch: AppDispatch = useDispatch();
  const { toast } = useSelector((state: RootState) => state.toast);
  const { getIdsFromObject, toastAndNavigate } = Utility();
  const doctorId = params?.id;

  const { createDoctor } = useCreateDoctor("create-doctor");
  const { modifyDoctor } = useModifyDoctor("update-doctor");

  const { value: specialities, swrLoading: specialityLoading } =
    useGetSpeciality(
      null,
      "get-specialities",
      1,
      200
    );
  const { value: qualifications, swrLoading: qualificationLoading } =
    useGetQualification(
      null,
      "get-qualifications",
      1,
      200
    );
  const { value: symptoms, swrLoading: symptomLoading } =
    useGetSymptom(
      null,
      "get-symptoms",
      1,
      200
    );
  console.log("doctorId", doctorId);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const handleUpdatePassword = useCallback(() => {
    if (formValues.password) {
      editFormValues = { ...formValues }
    }
    if (!updatePassword) {
      setFormValues((prev) => ({
        ...prev,
        password: "",
      }));
      pwFieldRef?.current?.focus();
    } else {
      setFormValues((prev) => ({
        ...prev,
        password: editFormValues.password,
      }));
    }
    setUpdatePassword(!updatePassword);
  }, [updatePassword, formValues]);

  //Create/Edit/Populate Doctor
  useEffect(() => {
    if (doctorId) {
      setTitle("Edit");
      populateData(doctorId);
    } else {
      setFormValues(initialValues);
      setTitle("Create");
    }
  }, [doctorId]);

  const create = useCallback(async (values: DoctorFormValues) => {
    setLoading(true);
    try {
      const response = await createDoctor({
        ...values,
        gender: values.gender || null,
        role: values.role || null,
        status: values.status || null,
        profilePicture: values?.profilePicture?.file || null,
        qualificationIds: getIdsFromObject(values?.qualificationIds),
        specializationIds: getIdsFromObject(values?.specializationIds),
        symptomIds: getIdsFromObject(values?.symptomIds)
      });
      if (response?.statusCode === 201) {
        toastAndNavigate(dispatch, true, "success", "Created Successfully", () => router.back());
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        "Error creating Doctor, please try again.";
      toastAndNavigate(dispatch, true, "error", errorMessage, () => router.back());
    } finally {
      setLoading(false);
    }
  }, []);

  const populateData = useCallback(
    async (doctorId: string | string[]) => {
      setLoading(true);
      try {
        const response = await fetcher(
          'doctor',
          `get-doctor-by-id/${doctorId}`
        );
        if (response?.statusCode === 200) {
          setFormValues(response.data);
          console.log(response.data, 'this is response')
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

  const update = useCallback(
    async (values: any) => {
      setLoading(true);
      try {
        const payload = {
          ...values,
          gender: values.gender || null,
          role: values.role || null,
          status: values.status || null,
          profilePicture: values?.profilePicture?.file || null,
          qualificationIds: getIdsFromObject(values?.qualificationIds),
          specializationIds: getIdsFromObject(values?.specializationIds),
          symptomIds: getIdsFromObject(values?.symptomIds),
        };
        if (!updatePassword) {
          delete payload.password;
        }

        const response = await modifyDoctor(payload);
        if (response?.statusCode === 200) {
          toastAndNavigate(dispatch, true, "info", "Updated Successfully", () => router.back());
        }
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || "Error Occurred. Please Try Again";
        toastAndNavigate(dispatch, true, "error", errorMessage, () => router.back());
      } finally {
        setLoading(false);
      }
    },
    [updatePassword, formValues]
  );

  return (
    <Box margin='0 10px 10px 10px'>
      {doctorId && (
        <Button
          type="button"
          color={updatePassword ? "error" : "info"}
          variant="contained"
          sx={{
            position: 'absolute',
            right: 30
          }}
          onClick={handleUpdatePassword}
        >
          {updatePassword ? "Cancel Update Password" : "Update Password"}
        </Button>
      )}
      <Typography
        variant="h4"
        gutterBottom
        sx={{ color: "rgb(7, 135, 179)", fontWeight: "bold", mb: '20px' }}
      >
        {title}
      </Typography>

      <Formik
        enableReinitialize
        initialValues={formValues}
        validationSchema={validationSchema}
        onSubmit={(values) => {
          values._id ? update(values) : create(values);
        }}
      >
        {({
          dirty,
          errors,
          values,
          touched,
          handleChange,
          resetForm,
          setFieldValue,
          isSubmitting
        }) => (
          <Form encType="multipart/form-data">
            <Box
              display="grid"
              gap="30px"
              gridTemplateColumns="repeat(4, minmax(0, 1fr))"
            >
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
              {/* password */}
              {(title === "Create" || updatePassword) && (
                <Field
                  fullWidth
                  as={MuiTextField}
                  label="Password *"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  inputRef={pwFieldRef}
                  value={values.password}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PasswordIcon color="primary" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={togglePasswordVisibility}>
                          {showPassword ?
                            <VisibilityIcon color="primary" />
                            :
                            <VisibilityOffIcon color="primary" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  error={touched.password && Boolean(errors.password)}
                  helperText={touched.password && errors.password}
                />
              )}
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
              <Field
                as={MuiTextField}
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
                  <MenuItem value="other">Other</MenuItem>
                </Select>
                {touched.gender && errors.gender && (
                  <Typography color="error" variant="body2">
                    {errors.gender}
                  </Typography>
                )}
              </FormControl>
              <Field
                as={MuiTextField}
                label="Experience (in years)"
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
              <Field
                as={MuiTextField}
                type="text"
                label="Languages Spoken"
                name="languagesSpoken"
                fullWidth
                value={values.languagesSpoken.join(", ")}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFieldValue(
                    "languagesSpoken",
                    e.target.value.split(",").map((val: string) => val.trim())
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
                  touched.languagesSpoken && Boolean(errors.languagesSpoken)
                }
                helperText={touched.languagesSpoken && errors.languagesSpoken}
              />
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
              <FormControl
                fullWidth
                error={touched.status && Boolean(errors.status)}
              >
                <InputLabel> Status </InputLabel>
                <Select
                  label="Status "
                  name="status"
                  value={values.status}
                  onChange={(e) => setFieldValue("status", e.target.value)}
                  startAdornment={
                    <InputAdornment position="start">
                      <InfoIcon color="primary" />
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
              <Field
                as={MuiTextField}
                label="Role"
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
              <Field
                as={MuiTextField}
                label="Address"
                name="address"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PinDrop color="primary" />
                    </InputAdornment>
                  ),
                }}
                error={touched.address && Boolean(errors.address)}
                helperText={touched.address && errors.address}
              />
              <Field
                as={MuiTextField}
                label="Pincode"
                name="pincode"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PlaceIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
                error={touched.pincode && Boolean(errors.pincode)}
                helperText={touched.pincode && errors.pincode}
              />
              <Autocomplete
                multiple
                disableCloseOnSelect
                options={specialities?.results || []}
                getOptionLabel={option => option.name}
                isOptionEqualToValue={(option, value) => option._id === value._id}    // populate ke time mismatch error na aye islye
                value={values.specializationIds || undefined}
                onChange={(event, value) => {
                  console.log(value, 'on change')
                  setFieldValue("specializationIds", value)
                }}
                sx={{ gridColumn: "span 2" }}
                renderInput={(params) => (
                  <MuiTextField
                    {...params}
                    label="Specialization *"
                    name="specializationIds"
                    type="text"
                    error={!!touched.specializationIds && !!errors.specializationIds}
                    helperText={touched.specializationIds && errors.specializationIds}
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
                    }}
                  />
                )}
              />
              <Autocomplete
                multiple
                disableCloseOnSelect
                options={symptoms?.results || []}
                getOptionLabel={option => option.name}
                isOptionEqualToValue={(option, value) => option._id === value._id}
                value={values.symptomIds || undefined}
                onChange={(event, value) => setFieldValue("symptomIds", value)}
                sx={{ gridColumn: "span 2" }}
                renderInput={(params) => (
                  <MuiTextField
                    {...params}
                    label="Symptom *"
                    name="symptomIds"
                    type="text"
                    error={!!touched.symptomIds && !!errors.symptomIds}
                    helperText={touched.symptomIds && errors.symptomIds}
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
                    }}
                  />
                )}
              />
              <Autocomplete
                multiple
                disableCloseOnSelect
                options={qualifications?.results || []}
                getOptionLabel={option => option.name}
                isOptionEqualToValue={(option, value) => option._id === value._id}
                value={values.qualificationIds || undefined}
                onChange={(event, value) => setFieldValue("qualificationIds", value)}
                sx={{ gridColumn: "span 2" }}
                renderInput={(params) => (
                  <MuiTextField
                    {...params}
                    label="Qualification *"
                    name="qualificationIds"
                    type="text"
                    error={!!touched.qualificationIds && !!errors.qualificationIds}
                    helperText={touched.qualificationIds && errors.qualificationIds}
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
                    }}
                  />
                )}
              />
              <Field
                as={MuiTextField}
                label="Bio "
                name="bio"
                fullWidth
                multiline
                minRows={3}
                sx={{ gridColumn: "span 2" }}
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
              <Field
                as={MuiTextField}
                label="Tags "
                name="tags"
                fullWidth
                multiline
                minRows={3}
                value={values.tags.join(", ")}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFieldValue(
                    "tags",
                    e.target.value.split(",").map((val: string) => val.trim())
                  )
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <TagIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
                error={touched.tags && Boolean(errors.tags)}
                helperText={touched.tags && errors.tags}
              />

              {/* File input and display */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: "16px",
                  alignItems: "center",
                }}
              >
                {/* Upload Icon with Label */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid #ccc",
                    borderRadius: "8%",
                    width: "146px",
                    height: "104px",
                    cursor: "pointer",
                    textAlign: "center",
                    transition: "border-color 0.3s ease, color 0.3s ease",
                    "&:hover": {
                      borderColor: 'rgb(33, 38, 54)',
                      "& svg": {
                        color: 'rgb(33, 38, 54)', // Darker icon color on hover
                      },
                    },
                  }}
                  component="label"
                >
                  <AddPhotoAlternateIcon
                    sx={{
                      fontSize: "32px",
                      color: '#aaa',
                      mb: 1,
                      transition: "color 0.3s ease"
                    }} />
                  <Typography variant="body2">Upload Photo</Typography>
                  <input
                    ref={fileInputRef}
                    hidden
                    type="file"
                    accept=".jpg, .gif, .png, .jpeg, .svg, .webp"
                    onChange={(event) => {
                      const file = event.target.files[0];
                      if (file) {
                        // Check file size (1MB = 1,048,576 bytes)
                        if (file.size > 1048576) {
                          toastAndNavigate(
                            dispatch,
                            true,
                            "error",
                            `${file.name} exceeds 1MB limit`
                          );
                          return;
                        }

                        // Set file to Formik field and create a preview
                        const fileUrl = URL.createObjectURL(file);
                        setFieldValue("profilePicture", { file, preview: fileUrl });
                      }
                    }}
                  />
                </Box>

                {/* Display Selected File Preview */}
                {(values.profilePicture?.file || values.profilePicture) && (
                  <Box
                    sx={{
                      position: "relative",
                      width: "150px",
                      height: "106px",
                    }}
                  >
                    {/* Delete Icon */}
                    <IconButton
                      onClick={() => {
                        // Clean up preview URL and remove the file
                        URL.revokeObjectURL(values.profilePicture?.preview);
                        setFieldValue("profilePicture", null);
                      }}
                      sx={{
                        position: "absolute",
                        top: "-6px",
                        right: "-6px",
                        backgroundColor: "white",
                        zIndex: 1,
                        p: "4px",
                        "&:hover": {
                          color: "rgb(255, 102, 94)",
                        },
                      }}
                    >
                      <DeleteIcon sx={{ fontSize: "18px" }} />
                    </IconButton>

                    {/* Image Preview */}
                    {(values.profilePicture?.preview || values.profilePicture) && (
                      <Box
                        component="img"
                        src={values.profilePicture?.preview || values.profilePicture}
                        alt="Profile Preview"
                        sx={{
                          width: "100%",
                          height: "100%",
                          borderRadius: "8px",
                          border: "1px solid #aaa",
                        }}
                      />
                    )}
                  </Box>
                )}
              </Box>
            </Box>

            <Box
              component="fieldset"
              sx={{
                border: '2px solid #BADFE7',
                borderRadius: '12px',
                p: 2,
                m: '40px 10px',
              }}
            >
              <Typography
                component="legend"
                sx={{ color: 'rgb(102, 112, 133)', fontSize: '1rem', mb: 1 }}
              > Availability
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
                      value={slot.day}
                      onChange={(event, newValue) => {
                        const updatedAvailability = [...values.availability];
                        updatedAvailability[index].day = newValue;
                        setFieldValue("availability", updatedAvailability);
                      }}
                      renderInput={(params) => (
                        <MuiTextField
                          {...params}
                          label="Day"
                          type="text"
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <>
                                {/* The icon at the start */}
                                <InputAdornment position="start">
                                  <CalendarMonthIcon />
                                </InputAdornment>
                                {params.InputProps.startAdornment}
                              </>
                            ),
                          }}
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
                      variant="outlined"
                      fullWidth
                      InputLabelProps={{
                        shrink: true, // ensures the label stays on top
                      }}
                      value={slot.startTime || ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const updatedAvailability = [...values.availability];
                        updatedAvailability[index].startTime = e.target.value;
                        setFieldValue("availability", updatedAvailability);
                      }}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <Field
                      as={MuiTextField}
                      label="End Time"
                      name={`availability[${index}].endTime`}
                      type="time"
                      variant="outlined"
                      fullWidth
                      InputLabelProps={{
                        shrink: true
                      }}
                      value={slot.endTime || ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const updatedAvailability = [...values.availability];
                        updatedAvailability[index].endTime = e.target.value;
                        setFieldValue("availability", updatedAvailability);
                      }}
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
              <Box mt={2}>
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
              </Box>
            </Box>

            <Box display="flex" justifyContent="end" m="20px">
              {   //hide reset button on edit
                title === "Edit" ? null :
                  <Button type="reset" color="warning" variant="contained" sx={{ mr: 3 }}
                    disabled={!dirty || isSubmitting}
                    onClick={() => {
                      if (window.confirm("Do You Really Want To Reset?")) {
                        resetForm();
                      }
                    }}
                  >
                    Reset
                  </Button>
              }
              <Button color="error" variant="contained" sx={{ mr: 3 }}
                onClick={() => router.back()}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant='contained'
                disabled={!dirty || isSubmitting}
                color={title === "Edit" ? "info" : "success"}
              >
                Submit
              </Button>
            </Box>
            {loading === true ? <Loader /> : null}
          </Form>
        )}
      </Formik>
      <Toast
        alerting={toast.toastAlert}
        severity={toast.toastSeverity}
        message={toast.toastMessage}
      />
    </Box >
  );
};

export default DoctorForm;
