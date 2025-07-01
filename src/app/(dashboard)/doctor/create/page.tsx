"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, useParams } from "next/navigation";
import { Formik, Form, Field } from "formik";
import dayjs from "dayjs";

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
  Paper,
  IconButton,
  Autocomplete,
  Checkbox,
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
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PinDrop from "@mui/icons-material/PinDrop";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  DatePicker,
  LocalizationProvider,
  TimePicker,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import Loader from "@/components/common/Loader";
import Toast from "@/components/common/Toast";
import validationSchema from "./ValidationSchema";
import { AppDispatch, RootState } from "@/redux/store";
import { fetcher } from "@/apis/apiClient";
import { useCreateDoctor, useModifyDoctor } from "@/hooks/doctor";
import { useGetSpeciality } from "@/hooks/Speciality";
import { useGetQualification } from "@/hooks/qualification";
import { useGetSymptom } from "@/hooks/symptoms";
import { Utility } from "@/utils";
import { DoctorData } from "@/types/doctor";

interface DoctorResponse {
  statusCode: string | number;
  message: string;
  data: DoctorData;
}

const parseTimeTo12Hour = (date: dayjs.Dayjs | null) => {
  if (!date || !date.isValid()) return "";
  return date.format("h:mm A");
};

const initializeTime = (time: string) => {
  if (!time) return null;
  if (time.includes("AM") || time.includes("PM")) {
    return dayjs(time, "h:mm A");
  }
  return dayjs(`2023-01-01T${time}`);
};

const initialValues: DoctorData = {
  username: "",
  email: "",
  password: "",
  contact: "",
  gender: "",
  dob: "",
  experience: null,
  bio: "",
  tags: [],
  languagesSpoken: [],
  clinicAddress: "",
  pincode: "",
  profilePicture: null,
  consultationFee: "",
  status: "",
  qualificationIds: [],
  specializationIds: [],
  symptomIds: [],
  availability: [
    {
      day: "",
      startTime: "",
      endTime: "",
      hospital: { name: "", location: "" },
    },
  ],
  isVerified: false,
};
let editFormValues: DoctorData;

// eslint-disable-next-line react/function-component-definition
const DoctorForm: React.FC = () => {
  const [title, setTitle] = useState<"Create Doctor" | "Edit Doctor">();
  const [loading, setLoading] = useState<boolean>(false);
  const [formValues, setFormValues] = useState<DoctorData>(initialValues);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [updatePassword, setUpdatePassword] = useState<boolean>(false);
  const pwFieldRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const params = useParams();
  const router = useRouter();
  const dispatch: AppDispatch = useDispatch();
  const { toast } = useSelector((state: RootState) => state.toast);
  const { createDoctor } = useCreateDoctor("create-doctor");
  const { modifyDoctor } = useModifyDoctor("update-doctor");
  const { getIdsFromObject, toastAndNavigate } = Utility();
  const doctorId = params?.id;

  const { value: specialities } = useGetSpeciality(
    null,
    "get-specialities",
    1,
    200,
    ""
  );

  const { value: qualifications } = useGetQualification(
    null,
    "get-qualifications",
    1,
    200,
    ""
  );
  const { value: symptoms, swrLoading: symptomLoading } = useGetSymptom(
    null,
    "get-symptoms",
    1,
    200,
    ""
  );

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const handleUpdatePassword = useCallback(() => {
    if (formValues.password) {
      editFormValues = { ...formValues };
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
      setTitle("Edit Doctor");
      populateData(doctorId);
    } else {
      setFormValues(initialValues);
      setTitle("Create Doctor");
    }
  }, [doctorId]);

  const create = useCallback(
    async (values: DoctorData) => {
      setLoading(true);
      try {
        const formattedAvailability = values.availability.map((slot) => ({
          ...slot,
          startTime: slot.startTime,
          endTime: slot.endTime,
        }));

        const response = await createDoctor({
          ...values,
          gender: values.gender || null,
          status: values.status || null,
          profilePicture: values?.profilePicture?.file || null,
          qualificationIds: getIdsFromObject(values?.qualificationIds),
          specializationIds: getIdsFromObject(values?.specializationIds),
          symptomIds: getIdsFromObject(values?.symptomIds),
          availability: formattedAvailability,
        });
        if (response?.statusCode === 409) {
          toastAndNavigate(
            dispatch,
            true,
            "error",
            "Email already exists",
            () => location.reload()
          );
        }
        if (response?.statusCode === 201) {
          toastAndNavigate(
            dispatch,
            true,
            "success",
            "Created Successfully",
            () => router.back()
          );
        }
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.message ||
          "Error creating Doctor, please try again.";
        toastAndNavigate(dispatch, true, "error", errorMessage, () =>
          location.reload()
        );
      } finally {
        setLoading(false);
      }
    },
    [createDoctor, dispatch, getIdsFromObject, router, toastAndNavigate]
  );

  const populateData = useCallback(async (doctorId: string | string[]) => {
    setLoading(true);
    try {
      const response: DoctorResponse = await fetcher(
        "doctor",
        `get-doctor-by-id/${doctorId}`
      );
      if (response?.statusCode === 200) {
        const formattedData = {
          ...response.data,
          availability: response.data.availability.map((slot) => ({
            ...slot,
            startTime: slot.startTime
              ? initializeTime(slot.startTime).format("h:mm A")
              : "",
            endTime: slot.endTime
              ? initializeTime(slot.endTime).format("h:mm A")
              : "",
          })),
        };
        setFormValues(formattedData);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(
    async (values: any) => {
      setLoading(true);
      try {
        const formattedAvailability = values.availability.map((slot: any) => ({
          ...slot,
          startTime: slot.startTime, 
          endTime: slot.endTime, 
        }));

        const payload = {
          ...values,
          gender: values.gender || null,
          status: values.status || null,
          profilePicture: values?.profilePicture?.file || null,
          qualificationIds: getIdsFromObject(values?.qualificationIds),
          specializationIds: getIdsFromObject(values?.specializationIds),
          symptomIds: getIdsFromObject(values?.symptomIds),
          availability: formattedAvailability,
        };
        if (!updatePassword) {
          delete payload.password;
        }

        const response = await modifyDoctor(payload);
        if (response?.statusCode === 200) {
          toastAndNavigate(dispatch, true, "info", "Updated Successfully", () =>
            router.back()
          );
        }
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || "Error Occurred. Please Try Again";
        toastAndNavigate(dispatch, true, "error", errorMessage, () =>
          location.reload()
        );
      } finally {
        setLoading(false);
      }
    },
    [
      getIdsFromObject,
      updatePassword,
      modifyDoctor,
      toastAndNavigate,
      dispatch,
      router,
    ]
  );

  return (
    <Box margin="0 10px 10px 10px">
      {doctorId ? (
        <Button
          type="button"
          color={updatePassword ? "error" : "info"}
          variant="contained"
          sx={{
            position: "absolute",
            right: 30,
          }}
          onClick={handleUpdatePassword}
        >
          {updatePassword ? "Cancel Update Password" : "Update Password"}
        </Button>
      ) : null}
      <Typography
        variant="h4"
        gutterBottom
        sx={{ color: "rgb(7, 135, 179)", fontWeight: "bold", mb: "20px" }}
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
          isSubmitting,
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
                label="Fullname *"
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
                error={touched.username ? Boolean(errors.username) : null}
                helperText={touched.username ? errors.username : null}
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
                error={touched.email ? Boolean(errors.email) : null}
                helperText={touched.email ? errors.email : null}
              />
              {title === "Create Doctor" || updatePassword ? (
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
                          onClick={togglePasswordVisibility}
                        >
                          {showPassword ? (
                            <VisibilityIcon color="primary" />
                          ) : (
                            <VisibilityOffIcon color="primary" />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  error={touched.password ? Boolean(errors.password) : null}
                  helperText={touched.password ? errors.password : null}
                />
              ) : null}
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
                error={touched.contact ? Boolean(errors.contact) : null}
                helperText={touched.contact ? errors.contact : null}
              />
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Date of Birth *"
                  value={values.dob ? dayjs(values.dob) : null}
                  onChange={(newValue) => {
                    setFieldValue(
                      "dob",
                      newValue ? newValue.format("YYYY-MM-DD") : ""
                    );
                  }}
                  maxDate={dayjs().subtract(20, "year")}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: touched.dob && Boolean(errors.dob),
                      helperText: touched.dob && errors.dob,
                    },
                    inputAdornment: {
                      position: "start",
                    },
                  }}
                  slots={{
                    openPickerIcon: CalendarMonthIcon,
                  }}
                  sx={{
                    "& .MuiIconButton-root": {
                      color: (theme) => theme.palette.primary.main,
                      marginRight: "-16px",
                    },
                    "& .MuiInputBase-input": {
                      paddingLeft: "32px !important",
                      marginLeft: "-4px",
                    },
                    "& .MuiInputAdornment-positionStart": {
                      marginRight: "0px",
                    },
                  }}
                />
              </LocalizationProvider>

              <FormControl
                fullWidth
                error={touched.gender ? Boolean(errors.gender) : null}
              >
                <InputLabel>Gender</InputLabel>
                <Select
                  label="Gender"
                  name="gender"
                  value={values.gender}
                  onChange={(e) => setFieldValue("gender", e.target.value)}
                  startAdornment={
                    <InputAdornment position="start">
                      <WcIcon color="primary" />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
                {touched.gender && errors.gender ? (
                  <Typography color="error" variant="body2">
                    {errors.gender}
                  </Typography>
                ) : null}
              </FormControl>
              <Field
                as={MuiTextField}
                label="Experience (in years)"
                name="experience"
                type="number"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <WorkIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
                error={touched.experience ? Boolean(errors.experience) : null}
                helperText={touched.experience ? errors.experience : null}
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
                  touched.languagesSpoken
                    ? Boolean(errors.languagesSpoken)
                    : null
                }
                helperText={
                  touched.languagesSpoken ? errors.languagesSpoken : null
                }
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
                  touched.consultationFee
                    ? Boolean(errors.consultationFee)
                    : null
                }
                helperText={
                  touched.consultationFee ? errors.consultationFee : null
                }
              />
              <FormControl
                fullWidth
                error={touched.status ? Boolean(errors.status) : null}
              >
                <InputLabel> Status </InputLabel>
                <Select
                  label="Status"
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
                  <MenuItem value="on leave">On Leave</MenuItem>
                </Select>
                {touched.status && errors.status ? (
                  <Typography color="error" variant="body2">
                    {errors.status}
                  </Typography>
                ) : null}
              </FormControl>

              <Field
                as={MuiTextField}
                label="Clinic Address"
                name="clinicAddress"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PinDrop color="primary" />
                    </InputAdornment>
                  ),
                }}
                error={
                  touched.clinicAddress ? Boolean(errors.clinicAddress) : null
                }
                helperText={touched.clinicAddress ? errors.clinicAddress : null}
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
                error={touched.pincode ? Boolean(errors.pincode) : null}
                helperText={touched.pincode ? errors.pincode : null}
              />
              <Autocomplete
                multiple
                disableCloseOnSelect
                options={specialities?.results || []}
                getOptionLabel={(option) => option.name}
                isOptionEqualToValue={(option, value) =>
                  option._id === value._id
                }
                value={values.specializationIds || []}
                onChange={(event, value) => {
                  setFieldValue("specializationIds", value);
                  const selectedSpecializationTags = value.map(
                    (item) => item.name
                  );
                  const updatedTags = [
                    ...new Set([
                      ...values.tags.filter(
                        (tag) => !selectedSpecializationTags.includes(tag)
                      ),
                      ...selectedSpecializationTags,
                    ]),
                  ];

                  setFieldValue("tags", updatedTags);
                }}
                sx={{ gridColumn: "span 2" }}
                renderInput={(params) => (
                  <MuiTextField
                    {...params}
                    label="Specialization *"
                    name="specializationIds"
                    type="text"
                    error={
                      !!touched.specializationIds && !!errors.specializationIds
                    }
                    helperText={
                      touched.specializationIds &&
                      typeof errors.specializationIds === "string"
                        ? errors.specializationIds
                        : ""
                    }
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
                getOptionLabel={(option) => option.name}
                isOptionEqualToValue={(option, value) =>
                  option._id === value._id
                }
                value={values.symptomIds || []}
                onChange={(event, value) => {
                  setFieldValue("symptomIds", value);
                  const selectedSymptomTags = value.map((item) => item.name);
                  const updatedTags = [
                    ...new Set([
                      ...values.tags.filter(
                        (tag) => !selectedSymptomTags.includes(tag)
                      ),
                      ...selectedSymptomTags,
                    ]),
                  ];
                  setFieldValue("tags", updatedTags);
                }}
                sx={{ gridColumn: "span 2" }}
                renderInput={(params) => (
                  <MuiTextField
                    {...params}
                    label="Symptom *"
                    name="symptomIds"
                    type="text"
                    error={!!touched.symptomIds && !!errors.symptomIds}
                    helperText={
                      touched.symptomIds &&
                      typeof errors.symptomIds === "string"
                        ? errors.symptomIds
                        : ""
                    }
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
                getOptionLabel={(option) => option.name}
                isOptionEqualToValue={(option, value) =>
                  option._id === value._id
                }
                value={values.qualificationIds || []}
                onChange={(event, value) => {
                  setFieldValue("qualificationIds", value);
                  const selectedQualificationTags = value.map(
                    (item) => item.name
                  );
                  const updatedTags = [
                    ...new Set([
                      ...values.tags.filter(
                        (tag) => !selectedQualificationTags.includes(tag)
                      ),
                      ...selectedQualificationTags,
                    ]),
                  ];
                  setFieldValue("tags", updatedTags);
                }}
                sx={{ gridColumn: "span 2" }}
                renderInput={(params) => (
                  <MuiTextField
                    {...params}
                    label="Qualification *"
                    name="qualificationIds"
                    type="text"
                    error={
                      !!touched.qualificationIds && !!errors.qualificationIds
                    }
                    helperText={
                      touched.qualificationIds &&
                      typeof errors.qualificationIds === "string"
                        ? errors.qualificationIds
                        : ""
                    }
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
                label="Tags"
                name="tags"
                fullWidth
                multiline
                minRows={1}
                maxRows={10}
                sx={{ gridColumn: "span 2" }}
                value={values.tags?.join(",")}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFieldValue(
                    "tags",
                    e.target.value.split(",").map((val: string) => val.trim())
                  )
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AssignmentIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
                error={touched.tags ? Boolean(errors.tags) : null}
                helperText={touched.tags ? errors.tags : null}
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
                error={touched.bio ? Boolean(errors.bio) : null}
                helperText={touched.bio ? errors.bio : null}
              />

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto auto",
                  gap: "16px",
                  alignItems: "center",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid #ccc",
                    borderRadius: "8%",
                    width: "150px",
                    height: "103px",
                    cursor: "pointer",
                    textAlign: "center",
                    transition: "border-color 0.3s ease, color 0.3s ease",
                    "&:hover": {
                      borderColor: "rgb(33, 38, 54)",
                      "& svg": { color: "rgb(33, 38, 54)" },
                    },
                  }}
                  component="label"
                >
                  <AddPhotoAlternateIcon
                    sx={{
                      fontSize: "32px",
                      color: "#4D55CC",
                      mb: 1,
                      transition: "color 0.3s ease",
                    }}
                  />
                  <Typography variant="body2">Upload Photo</Typography>
                  <input
                    ref={fileInputRef}
                    hidden
                    type="file"
                    onChange={(event) => {
                      const imgfiles = event.target.files;
                      if (imgfiles && imgfiles[0]) {
                        const file = imgfiles[0];
                        if (file.size > 1048576) {
                          toastAndNavigate(
                            dispatch,
                            true,
                            "error",
                            `${file.name} exceeds 1MB limit`
                          );
                          return;
                        }
                        const fileUrl = URL.createObjectURL(file);
                        setFieldValue("profilePicture", {
                          file,
                          preview: fileUrl,
                        });
                      }
                    }}
                  />
                </Box>
                {values.profilePicture?.file || values.profilePicture ? (
                  <Box
                    sx={{
                      position: "relative",
                      width: "150px",
                      height: "106px",
                    }}
                  >
                    <IconButton
                      onClick={() => {
                        if (values.profilePicture?.preview) {
                          URL.revokeObjectURL(values.profilePicture.preview);
                        }
                        setFieldValue("profilePicture", null);
                      }}
                      sx={{
                        position: "absolute",
                        top: "-6px",
                        right: "-6px",
                        backgroundColor: "white",
                        zIndex: 1,
                        p: "4px",
                        "&:hover": { color: "rgb(255, 102, 94)" },
                      }}
                    >
                      <DeleteIcon sx={{ fontSize: "18px" }} />
                    </IconButton>
                    {values.profilePicture?.preview ||
                    typeof values.profilePicture === "string" ? (
                      <Box
                        component="img"
                        src={
                          typeof values.profilePicture === "string"
                            ? values.profilePicture
                            : values.profilePicture.preview
                        }
                        alt="Profile Preview"
                        sx={{
                          width: "100%",
                          height: "100%",
                          borderRadius: "8px",
                          border: "1px solid #aaa",
                        }}
                      />
                    ) : null}
                  </Box>
                ) : null}

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    whiteSpace: "nowrap",
                    ml: 1,
                  }}
                >
                  <Checkbox
                    checked={values.isVerified}
                    onChange={(event) =>
                      setFieldValue("isVerified", event.target.checked)
                    }
                    sx={{
                      color: values.isVerified ? "#3f51b5" : "default",
                      "&.Mui-checked": { color: "#3f51b5" },
                      padding: "4px 4px 4px 0",
                    }}
                  />
                  <Typography variant="body2">Is Verified</Typography>
                </Box>
              </Box>
            </Box>
            <Box
              component="fieldset"
              sx={{
                border: "2px solid #BADFE7",
                borderRadius: "12px",
                p: 2,
                m: "40px 10px",
              }}
            >
              <Typography
                component="legend"
                sx={{ color: "rgb(102, 112, 133)", fontSize: "1rem", mb: 1 }}
              >
                Availability
              </Typography>
              {values.availability.map((slot, index) => (
                <Paper variant="outlined" sx={{ p: 2, mb: 3 }} key={index}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={4}>
                      <Field
                        as={MuiTextField}
                        label="Hospital / Clinic Name"
                        name={`availability[${index}].hospital.name`}
                        fullWidth
                        value={slot.hospital?.name || ""}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const updatedAvailability = [...values.availability];
                          updatedAvailability[index].hospital = {
                            ...updatedAvailability[index].hospital,
                            name: e.target.value,
                          };
                          setFieldValue("availability", updatedAvailability);
                          setFieldValue("dirty", true);
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <AssignmentIcon color="primary" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <Field
                        as={MuiTextField}
                        label="Hospital Location"
                        name={`availability[${index}].hospital.location`}
                        fullWidth
                        value={slot.hospital?.location || ""}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const updatedAvailability = [...values.availability];
                          updatedAvailability[index].hospital = {
                            ...updatedAvailability[index].hospital,
                            location: e.target.value,
                          };
                          setFieldValue("availability", updatedAvailability);
                          setFieldValue("dirty", true);
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PlaceIcon color="primary" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
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
                          setFieldValue("dirty", true);
                        }}
                        renderInput={(params) => (
                          <MuiTextField
                            {...params}
                            label="Day"
                            type="text"
                            InputProps={{
                              ...params.InputProps,
                              startAdornment: (
                                <InputAdornment position="start">
                                  <CalendarMonthIcon color="primary" />
                                </InputAdornment>
                              ),
                            }}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <TimePicker
                          label="Start Time"
                          value={initializeTime(slot.startTime)}
                          onChange={(newValue) => {
                            const updatedAvailability = [
                              ...values.availability,
                            ];
                            updatedAvailability[index].startTime =
                              parseTimeTo12Hour(newValue);
                            setFieldValue("availability", updatedAvailability);
                            setFieldValue("dirty", true);
                          }}
                          ampm
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              error:
                                !!touched.availability?.[index]?.startTime &&
                                !!errors.availability?.[index]?.startTime,
                              helperText:
                                touched.availability?.[index]?.startTime &&
                                errors.availability?.[index]?.startTime,
                            },
                          }}
                        />
                      </LocalizationProvider>
                    </Grid>
                    <Grid item xs={4}>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <TimePicker
                          label="End Time"
                          value={initializeTime(slot.endTime)}
                          onChange={(newValue) => {
                            const updatedAvailability = [
                              ...values.availability,
                            ];
                            updatedAvailability[index].endTime =
                              parseTimeTo12Hour(newValue);
                            setFieldValue("availability", updatedAvailability);
                            setFieldValue("dirty", true);
                          }}
                          ampm
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              error:
                                !!touched.availability?.[index]?.endTime &&
                                !!errors.availability?.[index]?.endTime,
                              helperText:
                                touched.availability?.[index]?.endTime &&
                                errors.availability?.[index]?.endTime,
                            },
                          }}
                        />
                      </LocalizationProvider>
                    </Grid>

                    <Grid item xs={2} sx={{ display: "flex", gap: 1 }}>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => {
                          const updatedAvailability =
                            values.availability.filter(
                              (_, idx) => idx !== index
                            );
                          setFieldValue("availability", updatedAvailability);
                          setFieldValue("dirty", true);
                        }}
                        fullWidth
                      >
                        Remove
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>
              ))}
              <Box mt={2}>
                <Grid container spacing={2}>
                  <Grid item sx={{ display: "flex", alignItems: "center" }}>
                    <Button
                      variant="outlined"
                      onClick={() =>
                        setFieldValue("availability", [
                          ...values.availability,
                          {
                            day: "",
                            startTime: "",
                            endTime: "",
                            hospital: { name: "", location: "" },
                          },
                        ])
                      }
                      sx={{ mt: 1 }}
                    >
                      Add Slot
                    </Button>
                  </Grid>
                  <Grid item sx={{ display: "flex", alignItems: "center" }}>
                    <Button
                      variant="outlined"
                      color={
                        values.availability.length > 1 ? "warning" : "primary"
                      }
                      fullWidth
                      disabled={
                        values.availability.length === 0 ||
                        !values.availability[0]?.day ||
                        !values.availability[0]?.startTime ||
                        !values.availability[0]?.endTime
                      }
                      onClick={() => {
                        if (values.availability.length > 0) {
                          if (values.availability.length > 1) {
                            setFieldValue("availability", [
                              values.availability[0],
                            ]);
                          } else {
                            const firstSlot = values.availability[0];
                            const allDays = [
                              "Monday",
                              "Tuesday",
                              "Wednesday",
                              "Thursday",
                              "Friday",
                              "Saturday",
                            ];
                            const newAvailability = allDays.map((day) => ({
                              day,
                              startTime: firstSlot.startTime,
                              endTime: firstSlot.endTime,
                              hospital: {
                                name: firstSlot.hospital?.name || "",
                                location: firstSlot.hospital?.location || "",
                              },
                            }));
                            setFieldValue("availability", newAvailability);
                            setFieldValue("dirty", true);
                          }
                        }
                      }}
                      sx={{ mt: 1 }}
                    >
                      {values.availability.length > 1
                        ? "Remove all"
                        : "Apply for all days"}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Box>

            <Box display="flex" justifyContent="end" m="20px">
              {title === "Edit Doctor" ? null : (
                <Button
                  type="reset"
                  color="warning"
                  variant="contained"
                  sx={{ mr: 3 }}
                  disabled={!dirty || isSubmitting}
                  onClick={() => {
                    if (window.confirm("Do You Really Want To Reset?")) {
                      resetForm();
                    }
                  }}
                >
                  Reset
                </Button>
              )}
              <Button
                color="error"
                variant="contained"
                sx={{ mr: 3 }}
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color={title === "Edit Doctor" ? "info" : "success"}
              >
                Submit
              </Button>
            </Box>
            {loading === true ? <Loader /> : null}
            <Toast
              alerting={toast.toastAlert}
              severity={toast.toastSeverity}
              message={toast.toastMessage}
            />
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default DoctorForm;
