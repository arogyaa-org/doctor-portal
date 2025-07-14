import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Box,
  Avatar,
  IconButton,
  Button,
  TextField,
  Autocomplete,
  CircularProgress,
  Typography,
  Chip,
} from "@mui/material";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import PersonIcon from "@mui/icons-material/Person";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import SchoolIcon from "@mui/icons-material/School";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ManIcon from "@mui/icons-material/Man";
import WomanIcon from "@mui/icons-material/Woman";
import SickIcon from "@mui/icons-material/Sick";
import WorkIcon from "@mui/icons-material/Work";
import HistoryIcon from "@mui/icons-material/History";

import { DoctorData } from "@/types/doctor";
import { useModifyDoctor } from "@/hooks/doctor";
import { useGetSpeciality } from "@/hooks/Speciality";
import { useGetQualification } from "@/hooks/qualification";
import { useGetSymptom } from "@/hooks/symptoms";
import dayjs from "dayjs";
import * as yup from "yup";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  DatePicker,
  LocalizationProvider,
  TimePicker,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

// Define validation schema
const phoneRegExp =
  /^((\+[1-9]{1,4}[ -]?)|(\([0-9]{2,3}\)[ -]?)|([0-9]{2,4})[ -]?)*?[0-9]{3,4}[ -]?[0-9]{3,4}$/;
const emailRegExp = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

// Define days of the week for dropdown
const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const parseTimeTo12Hour = (date: dayjs.Dayjs | null) => {
  if (!date || !date.isValid()) return "";
  return date.format("h:mm A"); // Outputs "2:30 PM"
};

interface DoctorProfileEditProps {
  editFields: DoctorData;
  setEditFields: React.Dispatch<React.SetStateAction<DoctorData>>;
  doctorProfileData: DoctorData | null;
  setDoctorProfileData: React.Dispatch<React.SetStateAction<DoctorData | null>>;
  setIsEditOpen: React.Dispatch<React.SetStateAction<boolean>>;
  role: string | undefined;
}

// eslint-disable-next-line react/function-component-definition
const DoctorProfileEdit: React.FC<DoctorProfileEditProps> = ({
  editFields,
  setEditFields,
  doctorProfileData,
  setDoctorProfileData,
  setIsEditOpen,
  role,
}) => {
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const bioInputRef = useRef<HTMLTextAreaElement | null>(null);
  const { modifyDoctor } = useModifyDoctor("update-doctor");
  const { value: specialities, loading: specialitiesLoading } =
    useGetSpeciality(null, "get-specialities", 1, 200, "");
  const { value: qualifications, loading: qualificationsLoading } =
    useGetQualification(null, "get-qualifications", 1, 200, "");
  const { value: symptoms, loading: symptomsLoading } = useGetSymptom(
    null,
    "get-symptoms",
    1,
    200,
    ""
  );

  const validationSchema = yup.object().shape({
    username: yup
      .string()
      .min(2, "Username is Too Short!")
      .max(50, "Username is Too Long!")
      .required("This Field is Required"),
    email: yup
      .string()
      .matches(emailRegExp, "Email Address is Not Valid")
      .required("This Field is Required"),
    contact: yup
      .string()
      .matches(phoneRegExp, "Phone Number Is Not Valid")
      .required("This Field is Required"),
    gender: yup.string().required("Gender is required"),
    status: yup.string().required("Status is required"),
    dob: yup
      .string()
      .required("Date of Birth is required")
      .test("is-valid-date", "Invalid date format", (value) =>
        value ? dayjs(value, "YYYY-MM-DD", true).isValid() : false
      ),
    ...(role === "doctor" && {
      bio: yup.string().max(500, "Bio is too long!"),
      experience: yup
        .number()
        .max(70, "Experience must be less than 70 years")
        .required("Experience is required"),
      consultationFee: yup.string().required("Consultation Fee is required"),
      specializationIds: yup
        .array()
        .min(1, "Select At Least 1 Specialization")
        .max(4, "Maximum 4 Specializations Allowed")
        .required("Specializations are required"),
      symptomIds: yup
        .array()
        .min(1, "Select At Least 1 Symptom")
        .required("Symptoms are required"),
      qualificationIds: yup
        .array()
        .min(1, "Select At Least 1 Qualification")
        .max(4, "Maximum 4 Qualifications Allowed")
        .required("Qualifications are required"),
      availability: yup.array().of(
        yup.object().shape({
          day: yup.string().required("Day is required"),
          startTime: yup
            .string()
            .required("Start time is required")
            .matches(
              /^(1[0-2]|0?[1-9]):[0-5][0-9] (AM|PM)$/,
              "Invalid time format"
            ),
          endTime: yup
            .string()
            .required("End time is required")
            .matches(
              /^(1[0-2]|0?[1-9]):[0-5][0-9] (AM|PM)$/,
              "Invalid time format"
            )
            .test(
              "end-time-after-start",
              "End time must be after start time",
              function (endTime) {
                const { startTime } = this.parent;
                if (!startTime || !endTime) return true;
                return dayjs(endTime, "h:mm A").isAfter(
                  dayjs(startTime, "h:mm A")
                );
              }
            ),
          hospital: yup
            .object()
            .shape({
              name: yup.string().nullable(),
              location: yup.string().nullable(),
            })
            .nullable(),
        })
      ),
    }),
  });

  const [isQualificationEditing, setIsQualificationEditing] = useState(false);
  const [isSpecializationEditing, setIsSpecializationEditing] = useState(false);
  const [isSymptomsEditing, setIsSymptomsEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize react-hook-form with Yup resolver
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    trigger,
    watch,
  } = useForm<DoctorData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      ...editFields,
      dob: editFields.dob ? dayjs(editFields.dob).format("YYYY-MM-DD") : "",
      password: undefined,
      availability: editFields.availability.map((slot) => ({
        ...slot,
        hospital: {
          name: slot.hospital?.name || slot.hospitalName || "",
          location: slot.hospital?.location || slot.hospitalLocation || "",
        },
      })),
    },
  });

  // Watch form values to avoid unnecessary updates
  const watchedValues = watch();

  // Update editFields when doctorProfileData changes to ensure hospital fields are populated
  useEffect(() => {
    if (doctorProfileData) {
      setEditFields({
        ...doctorProfileData,
        availability: doctorProfileData.availability.map((slot) => ({
          ...slot,
          hospital: {
            name: slot.hospital?.name || slot.hospitalName || "",
            location: slot.hospital?.location || slot.hospitalLocation || "",
          },
        })),
      });
    }
  }, [doctorProfileData, setEditFields]);

  // Memoized handleFieldChange to prevent re-creation on every render
  const handleFieldChange = useCallback(
    (
      field: keyof DoctorData,
      value: any,
      index?: number,
      subField?: string
    ) => {
      if (index !== undefined && field === "availability" && subField) {
        const updatedAvailability = [...editFields.availability];
        if (subField.startsWith("hospital.")) {
          const hospitalField = subField.split(".")[1] as "name" | "location";
          updatedAvailability[index] = {
            ...updatedAvailability[index],
            hospital: {
              ...updatedAvailability[index].hospital,
              [hospitalField]: value,
            },
          };
        } else {
          updatedAvailability[index] = {
            ...updatedAvailability[index],
            [subField]: value,
          };
        }
        if (
          JSON.stringify(updatedAvailability) !==
          JSON.stringify(editFields.availability)
        ) {
          setEditFields((prev) => ({ ...prev, [field]: updatedAvailability }));
          setValue("availability", updatedAvailability);
          trigger("availability");
        }
      } else {
        if (
          field === "qualificationIds" ||
          field === "specializationIds" ||
          field === "symptomIds"
        ) {
          const newValue = Array.isArray(value)
            ? value.filter(
                (id) => id && typeof id === "string" && id.length > 0
              )
            : value;
          if (JSON.stringify(newValue) !== JSON.stringify(editFields[field])) {
            setEditFields((prev) => ({ ...prev, [field]: newValue }));
            setValue(field, newValue);
            trigger(field);
          }
        } else if (
          JSON.stringify(value) !== JSON.stringify(editFields[field])
        ) {
          setEditFields((prev) => ({ ...prev, [field]: value }));
          setValue(field, value);
          if (
            ["qualificationIds", "specializationIds", "symptomIds"].includes(
              field
            )
          ) {
            trigger(field);
          }
        }
      }
    },
    [editFields, setValue, trigger]
  );

  useEffect(() => {
    if (nameInputRef.current) {
      nameInputRef.current.focus();
      const length = nameInputRef.current.value.length;
      nameInputRef.current.setSelectionRange(length, length);
    }
  }, []);

  useEffect(() => {
    if (bioInputRef.current) {
      bioInputRef.current.style.height = "auto";
      bioInputRef.current.style.height = `${bioInputRef.current.scrollHeight}px`;
    }
  }, [watchedValues.bio]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    const newProfilePicture = { file, preview: previewUrl };
    if (
      JSON.stringify(newProfilePicture) !==
      JSON.stringify(editFields.profilePicture)
    ) {
      setEditFields((prev) => ({
        ...prev,
        profilePicture: newProfilePicture,
      }));
      setValue("profilePicture", newProfilePicture);
    }
  };

  const handleCancelChanges = () => {
    setIsEditOpen(false);
    setEditFields(doctorProfileData ? { ...doctorProfileData } : editFields);
    setErrorMessage(null);
  };

  const handleSaveChanges = async (data: DoctorData) => {
    try {
      const formData = new FormData();
      formData.append("_id", editFields._id || "");
      formData.append("username", data.username || "");
      formData.append("email", data.email || "");
      formData.append("contact", data.contact || "");
      formData.append("gender", data.gender || "");
      formData.append("dob", data.dob || "");
      formData.append("status", data.status || "");
      if (role === "doctor") {
        formData.append("bio", data.bio || "");
        formData.append("experience", data.experience?.toString() || "");
        formData.append("consultationFee", data.consultationFee || "");
        data.qualificationIds.forEach((qual, index) => {
          const qualId =
            qual && typeof qual === "string" && qual.length > 0 ? qual : "";
          if (qualId) {
            formData.append(`qualificationIds[${index}]`, qualId);
          } else {
            console.warn(`Invalid qualification ID at index ${index} skipped`);
          }
        });
        data.specializationIds.forEach((spec, index) => {
          const specId =
            spec && typeof spec === "string" && spec.length > 0 ? spec : "";
          if (specId) {
            formData.append(`specializationIds[${index}]`, specId);
          } else {
            console.warn(`Invalid specialization ID at index ${index} skipped`);
          }
        });
        data.symptomIds.forEach((sym, index) => {
          const symId =
            sym && typeof sym === "string" && sym.length > 0 ? sym : "";
          if (symId) {
            formData.append(`symptomIds[${index}]`, symId);
          } else {
            console.warn(`Invalid symptom ID at index ${index} skipped`);
          }
        });
        data.availability.forEach((slot, index) => {
          formData.append(`availability[${index}][day]`, slot.day || "");
          formData.append(`availability[${index}][startTime]`, slot.startTime || "");
          formData.append(`availability[${index}][endTime]`, slot.endTime || "");
          if (slot.hospital?.name || slot.hospital?.location) {
            formData.append(`availability[${index}][hospital][name]`, slot.hospital?.name || "");
            formData.append(`availability[${index}][hospital][location]`, slot.hospital?.location || "");
          }
          if (slot._id) {
            formData.append(`availability[${index}][_id]`, slot._id);
          }
        });
      }
      if (data.profilePicture?.file) {
        formData.append("profilePicture", data.profilePicture.file);
      }

      console.log("Payload being sent to backend:", Object.fromEntries(formData));
      const response = await modifyDoctor(formData);
      console.log("Backend response:", response);
      if (response?.statusCode === 200) {
        setDoctorProfileData({
          ...data,
          profilePicture: response.data.profilePicture || editFields.profilePicture,
          _id: editFields._id,
        });
        setIsEditOpen(false);
        setErrorMessage(null);
      } else {
        setErrorMessage(`Save failed: ${response?.message || "Unknown error"}`);
      }
    } catch (error: any) {
      setErrorMessage(error.message || "Error updating profile. Please try again.");
      console.error("Error updating profile:", error);
    }
  };

  const getItemsFromIds = (ids: any[] | undefined, options: any[]) => {
    if (!ids || !options || options.length === 0) return [];
    return ids
      .map((id) => {
        if (typeof id === "object" && id._id) return id;
        const found = options.find((option) => option._id === id);
        if (!found) {
          console.warn(`ID ${id} not found in options`);
          return null;
        }
        return found;
      })
      .filter((item) => item !== null && item !== undefined) as any[];
  };

  const isLoading =
    qualificationsLoading || specialitiesLoading || symptomsLoading;

  if (!doctorProfileData || !editFields._id) {
    return (
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Typography variant="h6" color="error">
          Unable to load profile for editing. Please try again.
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
          mb: 4,
        }}
      >
        <Box sx={{ position: "relative", width: 130, height: 130 }}>
          <Avatar
            src={
              typeof editFields.profilePicture === "string"
                ? editFields.profilePicture
                : editFields.profilePicture?.preview || ""
            }
            sx={{
              width: "100%",
              height: "100%",
              border: "4px solid #FFF",
              boxShadow: "0px 6px 10px rgba(0, 0, 0, 0.25)",
              cursor: "pointer",
            }}
          />
          <IconButton
            sx={{
              position: "absolute",
              bottom: 8,
              right: -3,
              bgcolor: "white",
              boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
              "&:hover": { bgcolor: "grey.100" },
            }}
            component="label"
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              hidden
            />
            <PhotoCamera fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ textAlign: "center", mt: 2, px: 2, width: "auto" }}>
          <Controller
            name="username"
            control={control}
            render={({ field }) => (
              <input
                ref={nameInputRef}
                {...field}
                style={{
                  fontWeight: "bold",
                  fontSize: "32px",
                  color: "#333",
                  textAlign: "center",
                  border: errors.username ? "2px solid red" : "none",
                  outline: "none",
                  background: "transparent",
                  padding: "4px",
                  width: "auto",
                  minWidth: "200px",
                  cursor: "text",
                }}
              />
            )}
          />
          {errors.username && (
            <Typography variant="body2" color="error">
              {errors.username.message}
            </Typography>
          )}
        </Box>

        {(role === "doctor" || role === "admin") && (
          <Box
            sx={{
              textAlign: "center",
              mt: 1,
              px: 2,
              width: "90%",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Controller
              name="bio"
              control={control}
              render={({ field }) => (
                <textarea
                  ref={bioInputRef}
                  {...field}
                  placeholder="Enter your bio..."
                  style={{
                    padding: "8px",
                    borderRadius: "8px",
                    border: errors.bio ? "2px solid red" : "2px solid #8F44FD",
                    fontSize: "16px",
                    textAlign: "center",
                    width: "100%",
                    minHeight: "40px",
                    resize: "none",
                    background: "transparent",
                    outline: "none",
                    cursor: "text",
                    overflow: "hidden",
                  }}
                />
              )}
            />
            {errors.bio && (
              <Typography variant="body2" color="error">
                {errors.bio.message}
              </Typography>
            )}
          </Box>
        )}
      </Box>

      <Box
        sx={{
          p: 3,
          border: "1px solid #DDD",
          borderRadius: "12px",
          backgroundColor: "#FFF",
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
            gap: 3,
            mt: 2,
          }}
        >
          <Box>
            <Typography variant="body1" sx={{ fontWeight: "bold", mb: 0.5 }}>
              Phone
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <PhoneIcon sx={{ color: "#8F44FD" }} />
              <Controller
                name="contact"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    style={{
                      fontSize: "16px",
                      color: "#555",
                      border: errors.contact
                        ? "2px solid red"
                        : "2px solid #8F44FD",
                      borderRadius: "6px",
                      padding: "6px 10px",
                      width: "150px",
                      outline: "none",
                      background: "transparent",
                      transition: "border 0.2s ease-in-out",
                    }}
                  />
                )}
              />
            </Box>
            {errors.contact && (
              <Typography variant="body2" color="error">
                {errors.contact.message}
              </Typography>
            )}
          </Box>

          <Box>
            <Typography variant="body1" sx={{ fontWeight: "bold", mb: 0.5 }}>
              Email
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <EmailIcon sx={{ color: "#8F44FD" }} />
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="email"
                    style={{
                      fontSize: "16px",
                      color: "#555",
                      border: errors.email
                        ? "2px solid red"
                        : "2px solid #8F44FD",
                      borderRadius: "6px",
                      padding: "6px 10px",
                      width: "200px",
                      outline: "none",
                      background: "transparent",
                      transition: "border 0.2s ease-in-out",
                    }}
                  />
                )}
              />
            </Box>
            {errors.email && (
              <Typography variant="body2" color="error">
                {errors.email.message}
              </Typography>
            )}
          </Box>

          <Box>
            <Typography variant="body1" sx={{ fontWeight: "bold", mb: 0.5 }}>
              Gender
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {editFields.gender === "Male" && (
                <ManIcon sx={{ color: "#8F44FD" }} />
              )}
              {editFields.gender === "Female" && (
                <WomanIcon sx={{ color: "#8F44FD" }} />
              )}
              {!editFields.gender || editFields.gender === "Other" ? (
                <PersonIcon sx={{ color: "#8F44FD" }} />
              ) : null}
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    style={{
                      fontSize: "16px",
                      color: "#555",
                      border: errors.gender
                        ? "2px solid red"
                        : "2px solid #8F44FD",
                      borderRadius: "6px",
                      padding: "6px 10px",
                      background: "transparent",
                      cursor: "pointer",
                      width: "200px",
                      outline: "none",
                    }}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                )}
              />
            </Box>
            {errors.gender && (
              <Typography variant="body2" color="error">
                {errors.gender.message}
              </Typography>
            )}
          </Box>

          <Box>
            <Typography variant="body1" sx={{ fontWeight: "bold", mb: 0.5 }}>
              Date of Birth
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Controller
                  name="dob"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      label="Date of Birth *"
                      value={field.value ? dayjs(field.value) : null}
                      onChange={(newValue) => {
                        const formattedDate = newValue
                          ? newValue.format("YYYY-MM-DD")
                          : "";
                        field.onChange(formattedDate);
                        handleFieldChange("dob", formattedDate);
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: false,
                          sx: {
                            width: "200px",
                            "& .MuiOutlinedInput-root": {
                              "& fieldset": {
                                border: errors.dob
                                  ? "2px solid red"
                                  : "2px solid #8F44FD",
                              },
                              "&:hover fieldset": {
                                border: errors.dob
                                  ? "2px solid red"
                                  : "2px solid #8F44FD",
                              },
                              "&.Mui-focused fieldset": {
                                border: errors.dob
                                  ? "2px solid red"
                                  : "2px solid #8F44FD",
                              },
                            },
                          },
                          error: !!errors.dob,
                          helperText: errors.dob?.message,
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
                          color: "#8F44FD",
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
                  )}
                />
              </LocalizationProvider>
            </Box>
          </Box>

          {role === "doctor" && (
            <Box>
              <Typography variant="body1" sx={{ fontWeight: "bold", mb: 0.5 }}>
                Experience
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <HistoryIcon sx={{ color: "#8F44FD" }} />
                <Controller
                  name="experience"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value)}
                      style={{
                        fontSize: "16px",
                        color: "#555",
                        border: errors.experience
                          ? "2px solid red"
                          : "2px solid #8F44FD",
                        borderRadius: "6px",
                        padding: "6px 10px",
                        background: "transparent",
                        cursor: "pointer",
                        width: "100px",
                        outline: "none",
                      }}
                    />
                  )}
                />
              </Box>
              {errors.experience && (
                <Typography variant="body2" color="error">
                  {errors.experience.message}
                </Typography>
              )}
            </Box>
          )}

          {role === "doctor" && (
            <Box>
              <Typography variant="body1" sx={{ fontWeight: "bold", mb: 0.5 }}>
                Consultation Fee
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CurrencyRupeeIcon sx={{ color: "#8F44FD" }} />
                <Controller
                  name="consultationFee"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      style={{
                        fontSize: "16px",
                        color: "#555",
                        border: errors.consultationFee
                          ? "2px solid red"
                          : "2px solid #8F44FD",
                        borderRadius: "6px",
                        padding: "6px 10px",
                        background: "transparent",
                        cursor: "text",
                        width: "100px",
                        outline: "none",
                      }}
                    />
                  )}
                />
              </Box>
              {errors.consultationFee && (
                <Typography variant="body2" color="error">
                  {errors.consultationFee.message}
                </Typography>
              )}
            </Box>
          )}

          <Box>
            <Typography variant="body1" sx={{ fontWeight: "bold", mb: 0.5 }}>
              Status
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {editFields.status === "active" && (
                <CheckCircleIcon sx={{ color: "success.main" }} />
              )}
              {editFields.status === "inactive" && (
                <CancelIcon sx={{ color: "red" }} />
              )}
              {editFields.status === "on leave" && (
                <CancelIcon sx={{ color: "yellow" }} />
              )}
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    style={{
                      fontSize: "16px",
                      color: "#555",
                      border: errors.status
                        ? "2px solid red"
                        : "2px solid #8F44FD",
                      borderRadius: "6px",
                      padding: "6px 10px",
                      background: "transparent",
                      cursor: "pointer",
                      width: "200px",
                      outline: "none",
                    }}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="on leave">On Leave</option>
                  </select>
                )}
              />
            </Box>
            {errors.status && (
              <Typography variant="body2" color="error">
                {errors.status.message}
              </Typography>
            )}
          </Box>

          {role === "doctor" && (
            <Box>
              <Typography variant="body1" sx={{ fontWeight: "bold", mb: 0.5 }}>
                Qualification
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <SchoolIcon sx={{ color: "#8F44FD" }} />
                {qualificationsLoading ? (
                  <CircularProgress size={20} />
                ) : !isQualificationEditing ? (
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 1,
                      width: "220px",
                      border: errors.qualificationIds
                        ? "2px solid red"
                        : "2px solid #8F44FD",
                      borderRadius: "6px",
                      padding: "6px 10px",
                      minHeight: "32px",
                      cursor: "pointer",
                    }}
                    onClick={() => setIsQualificationEditing(true)}
                  >
                    {Array.isArray(editFields?.qualificationIds) &&
                    editFields.qualificationIds.length > 0 ? (
                      getItemsFromIds(
                        editFields.qualificationIds,
                        qualifications?.results || []
                      ).map((qual) => (
                        <Chip
                          key={qual._id}
                          label={qual.name}
                          size="small"
                          sx={{
                            bgcolor: "#E0E7FF",
                            color: "#1E3A8A",
                            "&:hover": { bgcolor: "#C7D2FE" },
                          }}
                        />
                      ))
                    ) : (
                      <Typography
                        variant="body2"
                        sx={{ color: "#555", fontSize: "16px" }}
                      >
                        Not Specified
                      </Typography>
                    )}
                  </Box>
                ) : (
                  <Controller
                    name="qualificationIds"
                    control={control}
                    render={({ field }) => (
                      <Autocomplete
                        multiple
                        options={qualifications?.results || []}
                        getOptionLabel={(option) => option?.name || ""}
                        value={getItemsFromIds(
                          field.value,
                          qualifications?.results || []
                        )}
                        onChange={(event, newValue) => {
                          const newIds = newValue.map(
                            (qualification) => qualification._id
                          );
                          field.onChange(newIds);
                          handleFieldChange("qualificationIds", newIds);
                        }}
                        onBlur={() => setIsQualificationEditing(false)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Select Qualifications"
                            variant="outlined"
                            sx={{ width: "220px" }}
                            error={!!errors.qualificationIds}
                            helperText={errors.qualificationIds?.message}
                          />
                        )}
                      />
                    )}
                  />
                )}
              </Box>
            </Box>
          )}

          {role === "doctor" && (
            <Box>
              <Typography variant="body1" sx={{ fontWeight: "bold", mb: 0.5 }}>
                Specialization
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <WorkIcon sx={{ color: "#8F44FD" }} />
                {specialitiesLoading ? (
                  <CircularProgress size={20} />
                ) : !isSpecializationEditing ? (
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 1,
                      width: "220px",
                      border: errors.specializationIds
                        ? "2px solid red"
                        : "2px solid #8F44FD",
                      borderRadius: "6px",
                      padding: "6px 10px",
                      minHeight: "32px",
                      cursor: "pointer",
                    }}
                    onClick={() => setIsSpecializationEditing(true)}
                  >
                    {Array.isArray(editFields?.specializationIds) &&
                    editFields.specializationIds.length > 0 ? (
                      getItemsFromIds(
                        editFields.specializationIds,
                        specialities?.results || []
                      ).map((spec) => (
                        <Chip
                          key={spec._id}
                          label={spec.name}
                          size="small"
                          sx={{
                            bgcolor: "#E0E7FF",
                            color: "#1E3A8A",
                            "&:hover": { bgcolor: "#C7D2FE" },
                          }}
                        />
                      ))
                    ) : (
                      <Typography
                        variant="body2"
                        sx={{ color: "#555", fontSize: "16px" }}
                      >
                        Not Specified
                      </Typography>
                    )}
                  </Box>
                ) : (
                  <Controller
                    name="specializationIds"
                    control={control}
                    render={({ field }) => (
                      <Autocomplete
                        multiple
                        options={specialities?.results || []}
                        getOptionLabel={(option) => option?.name || ""}
                        value={getItemsFromIds(
                          field.value,
                          specialities?.results || []
                        )}
                        onChange={(event, newValue) => {
                          const newIds = newValue.map((spec) => spec._id);
                          field.onChange(newIds);
                          handleFieldChange("specializationIds", newIds);
                        }}
                        onBlur={() => setIsSpecializationEditing(false)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Select Specializations"
                            variant="outlined"
                            sx={{ width: "220px" }}
                            error={!!errors.specializationIds}
                            helperText={errors.specializationIds?.message}
                          />
                        )}
                      />
                    )}
                  />
                )}
              </Box>
            </Box>
          )}

          {role === "doctor" && (
            <Box>
              <Typography variant="body1" sx={{ fontWeight: "bold", mb: 0.5 }}>
                Symptoms
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <SickIcon sx={{ color: "#8F44FD" }} />
                {symptomsLoading ? (
                  <CircularProgress size={20} />
                ) : !isSymptomsEditing ? (
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 1,
                      width: "220px",
                      border: errors.symptomIds
                        ? "2px solid red"
                        : "2px solid #8F44FD",
                      borderRadius: "6px",
                      padding: "6px 10px",
                      minHeight: "32px",
                      cursor: "pointer",
                    }}
                    onClick={() => setIsSymptomsEditing(true)}
                  >
                    {Array.isArray(editFields?.symptomIds) &&
                    editFields.symptomIds.length > 0 ? (
                      getItemsFromIds(
                        editFields.symptomIds,
                        symptoms?.results || []
                      ).map((sym) => (
                        <Chip
                          key={sym._id}
                          label={sym.name}
                          size="small"
                          sx={{
                            bgcolor: "#E0E7FF",
                            color: "#1E3A8A",
                            "&:hover": { bgcolor: "#C7D2FE" },
                          }}
                        />
                      ))
                    ) : (
                      <Typography
                        variant="body2"
                        sx={{ color: "#555", fontSize: "16px" }}
                      >
                        Not Specified
                      </Typography>
                    )}
                  </Box>
                ) : (
                  <Controller
                    name="symptomIds"
                    control={control}
                    render={({ field }) => (
                      <Autocomplete
                        multiple
                        options={symptoms?.results || []}
                        getOptionLabel={(option) => option?.name || ""}
                        value={getItemsFromIds(
                          field.value,
                          symptoms?.results || []
                        )}
                        onChange={(event, newValue) => {
                          const newIds = newValue.map((sym) => sym._id);
                          field.onChange(newIds);
                          handleFieldChange("symptomIds", newIds);
                        }}
                        onBlur={() => setIsSymptomsEditing(false)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Select Symptoms"
                            variant="outlined"
                            sx={{ width: "220px" }}
                            error={!!errors.symptomIds}
                            helperText={errors.symptomIds?.message}
                          />
                        )}
                      />
                    )}
                  />
                )}
              </Box>
            </Box>
          )}

          {role === "doctor" && (
            <Box>
              <Typography variant="body1" sx={{ fontWeight: "bold", mb: 0.5 }}>
                Availability
              </Typography>
              {Array.isArray(editFields.availability) &&
              editFields.availability.length > 0 ? (
                editFields.availability.map((slot, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 2,
                    }}
                  >
                    <AccessTimeIcon sx={{ color: "#8F44FD" }} />
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        flexDirection: "column",
                      }}
                    >
                      <select
                        value={slot.day || ""}
                        onChange={(e) =>
                          handleFieldChange(
                            "availability",
                            e.target.value,
                            index,
                            "day"
                          )
                        }
                        style={{
                          fontSize: "16px",
                          color: "#555",
                          border: errors.availability?.[index]?.day
                            ? "2px solid red"
                            : "2px solid #8F44FD",
                          borderRadius: "6px",
                          padding: "6px 10px",
                          background: "transparent",
                          cursor: "pointer",
                          width: "200px",
                          outline: "none",
                        }}
                      >
                        <option value="" disabled>
                          Select Day
                        </option>
                        {daysOfWeek.map((day) => (
                          <option key={day} value={day}>
                            {day}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={slot.hospital?.name || ""}
                        onChange={(e) =>
                          handleFieldChange(
                            "availability",
                            e.target.value,
                            index,
                            "hospital.name"
                          )
                        }
                        placeholder="Hospital Name (Optional)"
                        style={{
                          fontSize: "16px",
                          color: "#555",
                          border: errors.availability?.[index]?.hospital?.name
                            ? "2px solid red"
                            : "2px solid #8F44FD",
                          borderRadius: "6px",
                          padding: "6px 10px",
                          background: "transparent",
                          cursor: "pointer",
                          width: "200px",
                          outline: "none",
                        }}
                      />
                      {errors.availability?.[index]?.hospital?.name && (
                        <Typography variant="body2" color="error">
                          {errors.availability[index].hospital?.name?.message}
                        </Typography>
                      )}
                      <input
                        type="text"
                        value={slot.hospital?.location || ""}
                        onChange={(e) =>
                          handleFieldChange(
                            "availability",
                            e.target.value,
                            index,
                            "hospital.location"
                          )
                        }
                        placeholder="Hospital Location (Optional)"
                        style={{
                          fontSize: "16px",
                          color: "#555",
                          border: errors.availability?.[index]?.hospital?.location
                            ? "2px solid red"
                            : "2px solid #8F44FD",
                          borderRadius: "6px",
                          padding: "6px 10px",
                          background: "transparent",
                          cursor: "pointer",
                          width: "200px",
                          outline: "none",
                        }}
                      />
                      {errors.availability?.[index]?.hospital?.location && (
                        <Typography variant="body2" color="error">
                          {errors.availability[index].hospital?.location?.message}
                        </Typography>
                      )}
                      <TimePicker
                        label="Start Time"
                        value={
                          slot.startTime
                            ? dayjs(slot.startTime, "h:mm A")
                            : null
                        }
                        onChange={(newValue) => {
                          const formattedTime = parseTimeTo12Hour(newValue);
                          handleFieldChange(
                            "availability",
                            formattedTime,
                            index,
                            "startTime"
                          );
                        }}
                        ampm
                        slotProps={{
                          textField: {
                            sx: {
                              width: "200px",
                              "& .MuiOutlinedInput-root": {
                                "& fieldset": {
                                  border: errors.availability?.[index]?.startTime
                                    ? "2px solid red"
                                    : "2px solid #8F44FD",
                                },
                                "&:hover fieldset": {
                                  border: errors.availability?.[index]?.startTime
                                    ? "2px solid red"
                                    : "2px solid #8F44FD",
                                },
                                "&.Mui-focused fieldset": {
                                  border: errors.availability?.[index]?.startTime
                                    ? "2px solid red"
                                    : "2px solid #8F44FD",
                                },
                              },
                            },
                            error: !!errors.availability?.[index]?.startTime,
                            helperText:
                              errors.availability?.[index]?.startTime?.message,
                          },
                        }}
                      />
                      <TimePicker
                        label="End Time"
                        value={
                          slot.endTime ? dayjs(slot.endTime, "h:mm A") : null
                        }
                        onChange={(newValue) => {
                          const formattedTime = parseTimeTo12Hour(newValue);
                          handleFieldChange(
                            "availability",
                            formattedTime,
                            index,
                            "endTime"
                          );
                        }}
                        ampm
                        slotProps={{
                          textField: {
                            sx: {
                              width: "200px",
                              "& .MuiOutlinedInput-root": {
                                "& fieldset": {
                                  border: errors.availability?.[index]?.endTime
                                    ? "2px solid red"
                                    : "2px solid #8F44FD",
                                },
                                "&:hover fieldset": {
                                  border: errors.availability?.[index]?.endTime
                                    ? "2px solid red"
                                    : "2px solid #8F44FD",
                                },
                                "&.Mui-focused fieldset": {
                                  border: errors.availability?.[index]?.endTime
                                    ? "2px solid red"
                                    : "2px solid #8F44FD",
                                },
                              },
                            },
                            error: !!errors.availability?.[index]?.endTime,
                            helperText:
                              errors.availability?.[index]?.endTime?.message,
                          },
                        }}
                      />
                      <button
                        onClick={() => {
                          const updatedAvailability =
                            editFields.availability.filter(
                              (_, idx) => idx !== index
                            );
                          handleFieldChange(
                            "availability",
                            updatedAvailability
                          );
                        }}
                        style={{
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          color: "red",
                          marginTop: "8px",
                        }}
                      >
                        Remove
                      </button>
                    </Box>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" sx={{ color: "red" }}>
                  Not Available
                </Typography>
              )}
              <Button
                variant="outlined"
                color="primary"
                sx={{ mt: -4 }}
                onClick={() =>
                  handleFieldChange("availability", [
                    ...editFields.availability,
                    {
                      day: "",
                      hospital: { name: "", location: "" },
                      startTime: "",
                      endTime: "",
                    },
                  ])
                }
              >
                Add
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          position: "absolute",
          top: 70,
          right: -3,
          opacity: 1,
          transform: "translateY(0)",
          transition: "opacity 0.3s ease, transform 0.3s ease",
          width: "auto",
          mr: 1,
        }}
      >
        <Button
          type="button"
          variant="contained"
          color="success"
          onClick={handleSubmit(handleSaveChanges)}
          sx={{ mb: 1, width: "100px" }}
        >
          Save
        </Button>
        <Button
          color="error"
          variant="contained"
          sx={{ mb: 1, width: "100px" }}
          onClick={handleCancelChanges}
        >
          Cancel
        </Button>
      </Box>

      {errorMessage && (
        <Box sx={{ textAlign: "center", mt: 2 }}>
          <Typography variant="body2" color="error">
            {errorMessage}
          </Typography>
        </Box>
      )}
    </>
  );
};

export default DoctorProfileEdit;