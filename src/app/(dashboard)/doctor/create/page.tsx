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
  Dialog,
  DialogTitle,
  DialogContent,
  Tooltip,
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
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import CloseIcon from "@mui/icons-material/Close";
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

/** ========= New local types for doc fields ========= */
type FileOrUrl = { file: File; name: string; preview?: string } | string;

type DoctorFormValues = DoctorData & {
  medicalCertificates?: FileOrUrl[];
  registrationCertificates?: FileOrUrl[];
  aadhaarDocs?: FileOrUrl[];
  pancardDocs?: FileOrUrl[];
};
/** ================================================= */

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

  // New optional arrays
  medicalCertificates: [],
  registrationCertificates: [],
  aadhaarDocs: [],
  pancardDocs: [],
};

let editFormValues: DoctorFormValues;

const ALLOWED_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

/** Helpers for viewer */
const inferTypeFromUrl = (url: string): "image" | "pdf" | "doc" | "unknown" => {
  const clean = url.split("?")[0].toLowerCase();
  if (/\.(png|jpe?g|webp|gif)$/.test(clean)) return "image";
  if (/\.pdf$/.test(clean)) return "pdf";
  if (/\.(docx?|rtf)$/.test(clean)) return "doc";
  return "unknown";
};
const googleDocViewer = (url: string) =>
  `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(url)}`;

// eslint-disable-next-line react/function-component-definition
const DoctorForm: React.FC = () => {
  const [title, setTitle] = useState<"Create Doctor" | "Edit Doctor">();
  const [loading, setLoading] = useState<boolean>(false);
  const [formValues, setFormValues] = useState<DoctorFormValues>(initialValues);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [updatePassword, setUpdatePassword] = useState<boolean>(false);
  const pwFieldRef = useRef<HTMLInputElement | null>(null);
  const emailFieldRef = useRef<HTMLInputElement | null>(null);
  const contactFieldRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [langText, setLangText] = useState("");

  /** Viewer state */
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerTitle, setViewerTitle] = useState("");
  const [viewerType, setViewerType] = useState<
    "image" | "pdf" | "doc" | "unknown"
  >("image");
  const [viewerSrc, setViewerSrc] = useState("");
  const [revokeOnClose, setRevokeOnClose] = useState<string | null>(null);

  const params = useParams();
  const router = useRouter();
  const dispatch: AppDispatch = useDispatch();
  const { toast } = useSelector((state: RootState) => state.toast);
  const { createDoctor } = useCreateDoctor("create-doctor");
  const { modifyDoctor } = useModifyDoctor("update-doctor");
  const { decodedToken, getIdsFromObject, toastAndNavigate } = Utility();
  const doctorId = params?.id;

  // role gate for docs
  const role = decodedToken().role;
  const canManageDocs = role === "admin" || role === "operations";

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
  const { value: symptoms } = useGetSymptom(null, "get-symptoms", 1, 200, "");

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

  // Create/Edit/Populate Doctor
  useEffect(() => {
    if (doctorId) {
      setTitle("Edit Doctor");
      populateData(doctorId);
    } else {
      setFormValues(initialValues);
      setTitle("Create Doctor");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorId]);

  // keep it in sync when data loads (edit mode / reinit)
  useEffect(() => {
    setLangText((formValues.languagesSpoken || []).join(", "));
  }, [formValues.languagesSpoken]);

  /** Helpers to manage doc arrays in Formik */
  const handleAddFiles = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: keyof DoctorFormValues,
    values: DoctorFormValues,
    setFieldValue: (field: string, value: any) => void
  ) => {
    const files = e.target.files;
    if (!files) return;

    const toAdd: FileOrUrl[] = Array.from(files)
      .map((f) => {
        if (!ALLOWED_MIME.includes(f.type)) {
          // Optional: toast for unsupported file type
          return null as any;
        }
        return {
          file: f,
          name: f.name,
          preview: f.type.startsWith("image/")
            ? URL.createObjectURL(f)
            : undefined,
        };
      })
      .filter(Boolean);

    const prev = (values[fieldName] as FileOrUrl[]) ?? [];
    const next = [...prev, ...toAdd];

    setFieldValue(fieldName as string, next);
    e.target.value = "";
  };

  const removeAtIndex = (
    fieldName: keyof DoctorFormValues,
    idx: number,
    values: DoctorFormValues,
    setFieldValue: (field: string, value: any) => void
  ) => {
    const arr = (values[fieldName] as FileOrUrl[]) || [];
    const item = arr[idx] as any;
    if (item?.preview) URL.revokeObjectURL(item.preview);
    const next = arr.filter((_, i) => i !== idx);
    setFieldValue(fieldName as string, next);
  };

  /** Open a doc viewer for a list item */
  const openViewer = (item: FileOrUrl) => {
    // Clean up any previous temp blob URL
    if (revokeOnClose) {
      URL.revokeObjectURL(revokeOnClose);
      setRevokeOnClose(null);
    }

    if (typeof item === "string") {
      const type = inferTypeFromUrl(item);
      setViewerTitle(item.split("/").pop() || "Document");
      setViewerType(type);
      setViewerSrc(type === "doc" ? googleDocViewer(item) : item);
      setViewerOpen(true);
      return;
    }

    const f = item.file;
    const name = item.name || f.name;
    setViewerTitle(name);

    if (f.type.startsWith("image/")) {
      const src = item.preview ?? URL.createObjectURL(f);
      if (!item.preview) setRevokeOnClose(src);
      setViewerType("image");
      setViewerSrc(src);
      setViewerOpen(true);
      return;
    }

    if (f.type === "application/pdf") {
      const blobUrl = URL.createObjectURL(f);
      setRevokeOnClose(blobUrl);
      setViewerType("pdf");
      setViewerSrc(blobUrl);
      setViewerOpen(true);
      return;
    }

    if (
      f.type === "application/msword" ||
      f.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      // Blob URLs can't be shown in Google Viewer. Offer a download/new tab.
      const blobUrl = URL.createObjectURL(f);
      setRevokeOnClose(blobUrl);
      setViewerType("unknown");
      setViewerSrc(blobUrl);
      setViewerOpen(true);
      return;
    }

    // Fallback
    const blobUrl = URL.createObjectURL(f);
    setRevokeOnClose(blobUrl);
    setViewerType("unknown");
    setViewerSrc(blobUrl);
    setViewerOpen(true);
  };

  const closeViewer = () => {
    setViewerOpen(false);
    if (revokeOnClose) {
      URL.revokeObjectURL(revokeOnClose);
      setRevokeOnClose(null);
    }
  };

  const populateData = useCallback(async (doctorId: string | string[]) => {
    setLoading(true);
    try {
      const response: DoctorResponse = await fetcher(
        "doctor",
        `get-doctor-by-id/${doctorId}`
      );
      if (response?.statusCode === 200) {
        const formattedData: DoctorFormValues = {
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
          medicalCertificates: (response.data as any).medicalCertificates ?? [],
          registrationCertificates:
            (response.data as any).registrationCertificates ?? [],
          aadhaarDocs: (response.data as any).aadhaarDocs ?? [],
          pancardDocs: (response.data as any).pancardDocs ?? [],
        };
        setFormValues(formattedData);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  /** Utils to split files vs. urls */
  const extractFiles = (arr?: FileOrUrl[]) =>
    (arr || [])
      .filter((x: any) => x && (x as any).file)
      .map((x: any) => (x as any).file as File);

  const extractUrls = (arr?: FileOrUrl[]) =>
    (arr || []).filter((x: any) => typeof x === "string") as string[];

  const create = useCallback(
    async (values: DoctorFormValues) => {
      setLoading(true);
      try {
        const formattedAvailability = values.availability.map((slot) => ({
          ...slot,
          startTime: slot.startTime,
          endTime: slot.endTime,
        }));

        const payload: any = {
          ...values,
          gender: values.gender || null,
          status: values.status || null,
          profilePicture: (values as any)?.profilePicture?.file || null,
          qualificationIds: getIdsFromObject(values?.qualificationIds),
          specializationIds: getIdsFromObject(values?.specializationIds),
          symptomIds: getIdsFromObject(values?.symptomIds),
          availability: formattedAvailability,
          createdBy: decodedToken().id,

          // Send Files if present, else URLs
          medicalCertificates: extractFiles(values.medicalCertificates).length
            ? extractFiles(values.medicalCertificates)
            : extractUrls(values.medicalCertificates),
          registrationCertificates: extractFiles(
            values.registrationCertificates
          ).length
            ? extractFiles(values.registrationCertificates)
            : extractUrls(values.registrationCertificates),
          aadhaarDocs: extractFiles(values.aadhaarDocs).length
            ? extractFiles(values.aadhaarDocs)
            : extractUrls(values.aadhaarDocs),
          pancardDocs: extractFiles(values.pancardDocs).length
            ? extractFiles(values.pancardDocs)
            : extractUrls(values.pancardDocs),
        };

        const response = await createDoctor(payload);

        if (response?.statusCode === 409) {
          const errorMessage = response?.message?.toLowerCase() || "";
          if (errorMessage.includes("email")) {
            toastAndNavigate(
              dispatch,
              true,
              "error",
              "Email already exists, please edit the email",
              () => emailFieldRef?.current?.focus()
            );
          } else if (errorMessage.includes("phone number")) {
            toastAndNavigate(
              dispatch,
              true,
              "error",
              "Phone number already exists, please edit the phone number",
              () => contactFieldRef?.current?.focus()
            );
          } else {
            toastAndNavigate(
              dispatch,
              true,
              "error",
              "Email or phone number already exists, please edit the fields",
              () => emailFieldRef?.current?.focus()
            );
          }
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
    [createDoctor, dispatch, router, toastAndNavigate]
  );

  const update = useCallback(
    async (values: DoctorFormValues) => {
      setLoading(true);
      try {
        const formattedAvailability = values.availability.map((slot: any) => ({
          ...slot,
          startTime: slot.startTime,
          endTime: slot.endTime,
        }));

        const payload: any = {
          ...values,
          gender: values.gender || null,
          status: values.status || null,
          profilePicture: (values as any)?.profilePicture?.file || null,
          qualificationIds: getIdsFromObject(values?.qualificationIds),
          specializationIds: getIdsFromObject(values?.specializationIds),
          symptomIds: getIdsFromObject(values?.symptomIds),
          availability: formattedAvailability,
          updatedBy: decodedToken().id,

          medicalCertificates: extractFiles(values.medicalCertificates).length
            ? extractFiles(values.medicalCertificates)
            : extractUrls(values.medicalCertificates),
          registrationCertificates: extractFiles(
            values.registrationCertificates
          ).length
            ? extractFiles(values.registrationCertificates)
            : extractUrls(values.registrationCertificates),
          aadhaarDocs: extractFiles(values.aadhaarDocs).length
            ? extractFiles(values.aadhaarDocs)
            : extractUrls(values.aadhaarDocs),
          pancardDocs: extractFiles(values.pancardDocs).length
            ? extractFiles(values.pancardDocs)
            : extractUrls(values.pancardDocs),
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
    [modifyDoctor, toastAndNavigate, dispatch, router, updatePassword]
  );

  return (
    <Box margin="0 10px 10px 10px">
      {doctorId ? (
        <Button
          type="button"
          color={updatePassword ? "error" : "info"}
          variant="contained"
          sx={{ position: "absolute", right: 30 }}
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
        initialValues={
          !doctorId && role === "sub_admin" && !formValues.status
            ? { ...formValues, status: "pending" } // default for sub_admin on create
            : formValues
        }
        validationSchema={validationSchema}
        onSubmit={(values) => {
          (values as any)._id ? update(values) : create(values);
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
                InputLabelProps={{ shrink: true }}
                error={touched.username ? Boolean(errors.username) : undefined}
                helperText={touched.username ? errors.username : null}
              />
              <Field
                as={MuiTextField}
                label="Email *"
                name="email"
                fullWidth
                inputRef={emailFieldRef}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
                error={touched.email ? Boolean(errors.email) : undefined}
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
                  value={(values as any).password}
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
                  error={
                    touched.password ? Boolean(errors.password) : undefined
                  }
                  helperText={touched.password ? errors.password : null}
                />
              ) : null}
              <Field
                as={MuiTextField}
                label="Contact *"
                name="contact"
                fullWidth
                inputRef={contactFieldRef}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CallIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
                error={touched.contact ? Boolean(errors.contact) : undefined}
                helperText={touched.contact ? errors.contact : null}
              />

              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Date of Birth *"
                  value={
                    (values as any).dob ? dayjs((values as any).dob) : null
                  }
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
                    inputAdornment: { position: "start" },
                  }}
                  slots={{ openPickerIcon: CalendarMonthIcon }}
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
                error={touched.gender ? Boolean(errors.gender) : undefined}
              >
                <InputLabel>Gender</InputLabel>
                <Select
                  label="Gender"
                  name="gender"
                  value={(values as any).gender}
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
                    {errors.gender as any}
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
                error={
                  touched.experience ? Boolean(errors.experience) : undefined
                }
                helperText={
                  touched.experience ? (errors as any).experience : null
                }
              />

              <MuiTextField
                label="Languages Spoken"
                name="languagesSpoken"
                fullWidth
                value={langText}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  // just update local text; no splitting here
                  setLangText(e.target.value);
                }}
                onBlur={() => {
                  // commit to Formik only when user leaves the field
                  const arr = langText
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean);
                  setFieldValue("languagesSpoken", arr);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const arr = langText
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean);
                    setFieldValue("languagesSpoken", arr);
                    // (optional) blur after commit
                    (e.target as HTMLInputElement).blur();
                  }
                }}
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
                    : undefined
                }
                helperText={
                  touched.languagesSpoken
                    ? (errors as any).languagesSpoken
                    : null
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
                    : undefined
                }
                helperText={
                  touched.consultationFee
                    ? (errors as any).consultationFee
                    : null
                }
              />

              {role !== "sub_admin" && (
                <FormControl
                  fullWidth
                  error={touched.status ? Boolean(errors.status) : undefined}
                >
                  <InputLabel> Status </InputLabel>
                  <Select
                    label="Status"
                    name="status"
                    value={(values as any).status}
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
                      {errors.status as any}
                    </Typography>
                  ) : null}
                </FormControl>
              )}

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
                  touched.clinicAddress
                    ? Boolean(errors.clinicAddress)
                    : undefined
                }
                helperText={
                  touched.clinicAddress ? (errors as any).clinicAddress : null
                }
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
                error={touched.pincode ? Boolean(errors.pincode) : undefined}
                helperText={touched.pincode ? (errors as any).pincode : null}
              />

              <Autocomplete
                multiple
                disableCloseOnSelect
                options={specialities?.results || []}
                getOptionLabel={(option) => option.name}
                isOptionEqualToValue={(option, value) =>
                  option._id === value._id
                }
                value={(values as any).specializationIds || []}
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
                        ? (errors.specializationIds as string)
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
                value={(values as any).symptomIds || []}
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
                        ? (errors.symptomIds as string)
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
                value={(values as any).qualificationIds || []}
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
                        ? (errors.qualificationIds as string)
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
                value={(values.tags || []).join(",")}
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
                error={touched.tags ? Boolean(errors.tags) : undefined}
                helperText={touched.tags ? (errors as any).tags : null}
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
                error={touched.bio ? Boolean(errors.bio) : undefined}
                helperText={touched.bio ? (errors as any).bio : null}
              />

              {/* Profile Picture */}
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
                    accept="image/jpeg,image/png,image/webp"
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
                {(values as any).profilePicture?.file ||
                typeof (values as any).profilePicture === "string" ? (
                  <Box
                    sx={{
                      position: "relative",
                      width: "150px",
                      height: "106px",
                    }}
                  >
                    <IconButton
                      onClick={() => {
                        if ((values as any).profilePicture?.preview) {
                          URL.revokeObjectURL(
                            (values as any).profilePicture.preview
                          );
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
                    {(values as any).profilePicture?.preview ||
                    typeof (values as any).profilePicture === "string" ? (
                      <Box
                        component="img"
                        src={
                          typeof (values as any).profilePicture === "string"
                            ? (values as any).profilePicture
                            : (values as any).profilePicture.preview
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

                {role !== "sub_admin" && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      whiteSpace: "nowrap",
                      ml: 1,
                    }}
                  >
                    <Checkbox
                      checked={(values as any).isVerified}
                      onChange={(event) =>
                        setFieldValue("isVerified", event.target.checked)
                      }
                      sx={{
                        color: (values as any).isVerified
                          ? "#3f51b5"
                          : "default",
                        "&.Mui-checked": { color: "#3f51b5" },
                        padding: "4px 4px 4px 0",
                      }}
                    />
                    <Typography variant="body2">Is Verified</Typography>
                  </Box>
                )}
              </Box>
            </Box>

            {/* ===== Documents (role-gated) ===== */}
            {canManageDocs && (
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
                  sx={{ color: "rgb(102, 112, 133)", fontSize: "1rem", mb: 2 }}
                >
                  Documents (Images/PDF/DOC/DOCX)
                </Typography>

                {[
                  {
                    label: "Medical Certificates",
                    field: "medicalCertificates" as const,
                  },
                  {
                    label: "Registration Certificates",
                    field: "registrationCertificates" as const,
                  },
                  { label: "Aadhaar Docs", field: "aadhaarDocs" as const },
                  { label: "PAN Docs", field: "pancardDocs" as const },
                ].map(({ label, field }) => (
                  <Paper key={field} variant="outlined" sx={{ p: 2, mb: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} md={3}>
                        <Typography sx={{ fontWeight: 600 }}>
                          {label}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={9}>
                        <Button
                          variant="outlined"
                          component="label"
                          startIcon={<AddPhotoAlternateIcon />}
                        >
                          Upload files
                          <input
                            hidden
                            type="file"
                            multiple
                            accept={ALLOWED_MIME.join(",")}
                            onChange={(e) =>
                              handleAddFiles(
                                e,
                                field,
                                values as DoctorFormValues,
                                setFieldValue
                              )
                            }
                          />
                        </Button>

                        <Box
                          sx={{
                            mt: 2,
                            display: "flex",
                            gap: 1,
                            flexWrap: "wrap",
                          }}
                        >
                          {(Array.isArray((values as any)[field])
                            ? ((values as any)[field] as FileOrUrl[])
                            : []
                          ).map((item, idx) => {
                            const isFile = typeof item !== "string";
                            const name = isFile
                              ? (item as any).name
                              : (item as string);
                            const preview = isFile && (item as any).preview;

                            return (
                              <Box
                                key={idx}
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                  border: "1px solid #ddd",
                                  borderRadius: 1,
                                  p: 0.5,
                                }}
                              >
                                {preview ? (
                                  <Box
                                    component="img"
                                    src={preview as string}
                                    alt={name}
                                    sx={{
                                      width: 36,
                                      height: 36,
                                      borderRadius: 0.5,
                                      objectFit: "cover",
                                    }}
                                  />
                                ) : null}

                                <Tooltip title="View">
                                  <IconButton
                                    size="small"
                                    onClick={() => openViewer(item)}
                                    sx={{ mr: 0.5 }}
                                  >
                                    <VisibilityIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>

                                <Typography
                                  variant="caption"
                                  sx={{ maxWidth: 220 }}
                                  noWrap
                                  title={name}
                                >
                                  {name}
                                </Typography>

                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    removeAtIndex(
                                      field,
                                      idx,
                                      values as DoctorFormValues,
                                      setFieldValue
                                    )
                                  }
                                  aria-label="remove"
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            );
                          })}
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                ))}

                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Note: Uploading new files for a section will replace the saved
                  list for that section on update.
                </Typography>
              </Box>
            )}

            {/* ===== Availability block ===== */}
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
              {(values as any).availability.map((slot: any, index: number) => (
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
                          const updatedAvailability = [
                            ...(values as any).availability,
                          ];
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
                          const updatedAvailability = [
                            ...(values as any).availability,
                          ];
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
                          const updatedAvailability = [
                            ...(values as any).availability,
                          ];
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
                              ...(values as any).availability,
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
                                !!touched?.availability?.[index]?.startTime &&
                                !!(errors as any)?.availability?.[index]
                                  ?.startTime,
                              helperText:
                                touched?.availability?.[index]?.startTime &&
                                (errors as any)?.availability?.[index]
                                  ?.startTime,
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
                              ...(values as any).availability,
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
                                !!touched?.availability?.[index]?.endTime &&
                                !!(errors as any)?.availability?.[index]
                                  ?.endTime,
                              helperText:
                                touched?.availability?.[index]?.endTime &&
                                (errors as any)?.availability?.[index]?.endTime,
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
                          const updatedAvailability = (
                            values as any
                          ).availability.filter(
                            (_: any, idx: number) => idx !== index
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
                          ...(values as any).availability,
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
                        (values as any).availability.length > 1
                          ? "warning"
                          : "primary"
                      }
                      fullWidth
                      disabled={
                        (values as any).availability.length === 0 ||
                        !(values as any).availability[0]?.day ||
                        !(values as any).availability[0]?.startTime ||
                        !(values as any).availability[0]?.endTime
                      }
                      onClick={() => {
                        if ((values as any).availability.length > 0) {
                          if ((values as any).availability.length > 1) {
                            setFieldValue("availability", [
                              (values as any).availability[0],
                            ]);
                          } else {
                            const firstSlot = (values as any).availability[0];
                            const allDays = [
                              "Monday",
                              "Tuesday",
                              "Wednesday",
                              "Thursday",
                              "Friday",
                              "Saturday",
                              "Sunday",
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

      {/* ===== Viewer Dialog ===== */}
      <Dialog open={viewerOpen} onClose={closeViewer} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <VisibilityIcon fontSize="small" />
          <span style={{ flex: 1 }}>{viewerTitle}</span>
          <Tooltip title="Open in new tab">
            <span>
              <IconButton
                onClick={() => {
                  if (viewerSrc) window.open(viewerSrc, "_blank");
                }}
                disabled={!viewerSrc}
              >
                <OpenInNewIcon />
              </IconButton>
            </span>
          </Tooltip>
          <IconButton onClick={closeViewer}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ height: "80vh", p: 0 }}>
          {viewerType === "image" && (
            <Box
              component="img"
              src={viewerSrc}
              alt={viewerTitle}
              sx={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          )}
          {viewerType === "pdf" && (
            <iframe
              src={viewerSrc}
              style={{ width: "100%", height: "100%", border: 0 }}
              title={viewerTitle}
            />
          )}
          {viewerType === "doc" && (
            <iframe
              src={viewerSrc /* google viewer url */}
              style={{ width: "100%", height: "100%", border: 0 }}
              title={viewerTitle}
            />
          )}
          {viewerType === "unknown" && (
            <Box
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                p: 3,
                textAlign: "center",
              }}
            >
              <Typography variant="body1" sx={{ mb: 2 }}>
                This file type can’t be previewed inline. You can open it in a
                new tab or download it.
              </Typography>
              <Button
                variant="contained"
                onClick={() => window.open(viewerSrc, "_blank")}
                startIcon={<OpenInNewIcon />}
              >
                Open in new tab
              </Button>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default DoctorForm;
