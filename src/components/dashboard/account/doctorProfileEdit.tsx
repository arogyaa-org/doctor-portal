import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Box,
  Avatar,
  IconButton,
  Button,
  TextField,
  Autocomplete,
  MenuItem,
  Typography,
  InputAdornment,
  FormControl,
} from "@mui/material";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import PersonIcon from "@mui/icons-material/Person";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import SchoolIcon from "@mui/icons-material/School";
import LockIcon from "@mui/icons-material/Lock";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { useTheme, useMediaQuery } from "@mui/material";
import TodayIcon from "@mui/icons-material/Today";
import WcIcon from "@mui/icons-material/Wc";
import SickIcon from "@mui/icons-material/Sick";
import WorkIcon from "@mui/icons-material/Work";
import HistoryIcon from "@mui/icons-material/History";
import PasswordIcon from "@mui/icons-material/Lock";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { Tabs, Tab } from "@mui/material";
import {
  DatePicker,
  LocalizationProvider,
  TimePicker,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import Toast from "@/components/common/Toast";
import { DoctorData } from "@/types/doctor";
import { useModifyDoctor } from "@/hooks/doctor";
import { useGetSpeciality } from "@/hooks/Speciality";
import { useGetQualification } from "@/hooks/qualification";
import { useGetSymptom } from "@/hooks/symptoms";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/redux/store";
import { Utility } from "@/utils";

import dayjs from "dayjs";
import * as yup from "yup";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

const phoneRegExp =
  /^((\+[1-9]{1,4}[ -]?)|(\([0-9]{2,3}\)[ -]?)|([0-9]{2,4})[ -]?)*?[0-9]{3,4}[ -]?[0-9]{3,4}$/;
const emailRegExp = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

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
  return date.format("h:mm A");
};

interface DoctorProfileEditProps {
  editFields: DoctorData;
  setEditFields: React.Dispatch<React.SetStateAction<DoctorData>>;
  doctorProfileData: DoctorData | null;
  setDoctorProfileData: React.Dispatch<React.SetStateAction<DoctorData | null>>;
  setIsEditOpen: React.Dispatch<React.SetStateAction<boolean>>;
  role: string | undefined;
}

const TabPanel: React.FC<{
  children: React.ReactNode;
  value: number;
  index: number;
}> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      style={{
        display: value === index ? "block" : "none",
        width: "100%",
      }}
    >
      <Box sx={{ pt: 2 }}>{children}</Box>
    </div>
  );
};

// eslint-disable-next-line react/function-component-definition
const DoctorProfileEdit: React.FC<DoctorProfileEditProps> = ({
  editFields,
  setEditFields,
  doctorProfileData,
  setDoctorProfileData,
  setIsEditOpen,
  role,
}) => {
  const dispatch: AppDispatch = useDispatch();
  const { toastAndNavigate } = Utility();
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const bioInputRef = useRef<HTMLTextAreaElement | null>(null);
  const pwFieldRef = useRef<HTMLInputElement | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [isApplyToAllActive, setIsApplyToAllActive] = useState(false);
  const originalAvailabilityRef = useRef<DoctorData["availability"]>([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setTimeout(() => {
      const firstInput = document.querySelector(`#tabpanel-${newValue} input`);
      if (firstInput) {
        (firstInput as HTMLInputElement).focus();
      }
    }, 0);
  };

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
    password: yup.string().when("updatePassword", {
      is: true,
      then: (schema) =>
        schema
          .min(8, "Password Must Be 8 Characters Long")
          .matches(/[A-Z]/, "Password Must Contain At Least 1 Uppercase Letter")
          .matches(/[a-z]/, "Password Must Contain At Least 1 Lowercase Letter")
          .matches(/[0-9]/, "Password Must Contain At Least 1 Number")
          .matches(
            /[^\w]/,
            "Password Must Contain At Least 1 Special Character"
          )
          .required("This Field is Required"),
      otherwise: (schema) => schema.optional(),
    }),
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

  const [updatePassword, setUpdatePassword] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const { toast } = useSelector((state: RootState) => state.toast);

  const handleApplyToAll = () => {
    const first = editFields.availability?.[0];
    if (!first) return;

    // Backup original availability
    originalAvailabilityRef.current = [...editFields.availability];

    const appliedSlots = daysOfWeek.map((day) => ({
      day,
      startTime: first.startTime,
      endTime: first.endTime,
      hospital: {
        name: first.hospital?.name || "",
        location: first.hospital?.location || "",
      },
    }));

    handleFieldChange("availability", appliedSlots);
    setIsApplyToAllActive(true);
  };

  const handleCancelApplyToAll = () => {
    handleFieldChange("availability", originalAvailabilityRef.current);
    setIsApplyToAllActive(false);
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    trigger,
    watch,
  } = useForm<DoctorData & { updatePassword?: boolean }>({
    resolver: yupResolver(validationSchema),
    mode: "onChange",
    context: { updatePassword },
    defaultValues: {
      ...editFields,
      dob: editFields.dob ? dayjs(editFields.dob).format("YYYY-MM-DD") : "",
      password: "",
      availability: editFields.availability.map((slot) => ({
        ...slot,
        hospital: {
          name: slot.hospital?.name || slot.hospitalName || "",
          location: slot.hospital?.location || slot.hospitalLocation || "",
        },
      })),
      updatePassword: false,
    },
  });
  const watchedValues = watch();
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const handleUpdatePasswordToggle = useCallback(() => {
    setUpdatePassword((prev) => {
      const newValue = !prev;
      if (newValue) {
        setValue("password", "");
        setValue("updatePassword", true);
        pwFieldRef.current?.focus();
      } else {
        setValue("password", "");
        setValue("updatePassword", false);
      }
      trigger("password");
      return newValue;
    });
  }, [setValue, trigger]);

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

  // Memoized handleFieldChange
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
    setUpdatePassword(false);
    setValue("password", "");
    setValue("updatePassword", false);
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
      if (updatePassword && data.password) {
        formData.append("password", data.password);
      }
      if (role === "doctor") {
        formData.append("bio", data.bio || "");
        formData.append("experience", data.experience?.toString() || "");
        formData.append("consultationFee", data.consultationFee || "");

        data.qualificationIds.forEach((qual, index) => {
          const qualId = typeof qual === "string" ? qual : qual?._id || "";
          if (qualId) {
            formData.append(`qualificationIds[${index}]`, qualId);
          }
        });

        data.specializationIds.forEach((spec, index) => {
          const specId = typeof spec === "string" ? spec : spec?._id || "";
          if (specId) {
            formData.append(`specializationIds[${index}]`, specId);
          }
        });

        data.symptomIds.forEach((sym, index) => {
          const symId = typeof sym === "string" ? sym : sym?._id || "";
          if (symId) {
            formData.append(`symptomIds[${index}]`, symId);
          }
        });

        data.availability.forEach((slot, index) => {
          formData.append(`availability[${index}][day]`, slot.day || "");
          formData.append(
            `availability[${index}][startTime]`,
            slot.startTime || ""
          );
          formData.append(
            `availability[${index}][endTime]`,
            slot.endTime || ""
          );

          if (slot.hospital?.name || slot.hospital?.location) {
            formData.append(
              `availability[${index}][hospital][name]`,
              slot.hospital?.name || ""
            );
            formData.append(
              `availability[${index}][hospital][location]`,
              slot.hospital?.location || ""
            );
          }

          if (slot._id) {
            formData.append(`availability[${index}][_id]`, slot._id);
          }
        });
      }

      if (data.profilePicture?.file) {
        formData.append("profilePicture", data.profilePicture.file);
      }

      const response = await modifyDoctor(formData);

      if (response?.statusCode === 200) {
        toastAndNavigate(
          dispatch,
          true,
          "success",
          "Profile updated successfully!"
        );

        const updatedData: DoctorData = {
          ...response.data,
          password: undefined,
          updatePassword: undefined,
          profilePicture:
            response.data.profilePicture || editFields.profilePicture,
          _id: editFields._id,
        };

        setDoctorProfileData(updatedData);
        setEditFields(updatedData);

        setTimeout(() => {
          setIsEditOpen(false);
          setUpdatePassword(false);
          setValue("password", "");
          setValue("updatePassword", false);
        }, 1000);
      } else {
        toastAndNavigate(
          dispatch,
          true,
          "error",
          `Save failed: ${response?.message || "Unknown error"}`
        );
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toastAndNavigate(
        dispatch,
        true,
        "error",
        error.message || "Error updating profile. Please try again."
      );
    }
  };

  const getItemsFromIds = (ids: any[] | undefined, options: any[]) => {
    if (!ids || !options || options.length === 0) return [];
    const seen = new Set();
    return ids
      .map((id) => {
        let idVal = typeof id === "object" && id._id ? id._id : id;
        if (!idVal || seen.has(idVal)) return null;
        const found = options.find((option) => option._id === idVal);
        if (!found) {
          console.warn(`ID ${idVal} not found in options`);
          return null;
        }
        seen.add(idVal);
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
        </Box>

        {(role === "doctor" || role === "admin") && (
          <Box
            sx={{
              width: "100%",
              px: { xs: 2, sm: 4 },
              mt: 1,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Box sx={{ width: "100%", maxWidth: 600 }}>
              <Controller
                name="bio"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Bio"
                    placeholder="Enter your bio..."
                    fullWidth
                    multiline
                    minRows={3}
                    maxRows={6}
                    error={!!errors.bio}
                    helperText={errors.bio?.message}
                  />
                )}
              />
            </Box>
          </Box>
        )}
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant={isMobile ? "scrollable" : "fullWidth"}
          scrollButtons={isMobile ? "auto" : false}
          centered // <--- Always center, regardless of screen size
          textColor="primary"
          indicatorColor="primary"
          sx={{
            width: "100%",
            justifyContent: "center",
            "& .MuiTabs-flexContainer": {
              justifyContent: "center",
            },
          }}
        >
          <Tab
            label={
              <Box
                display="flex"
                flexDirection={isMobile ? "column" : "row"}
                alignItems="center"
                justifyContent="center"
                gap={1}
                textAlign="center"
              >
                <PersonIcon color="primary" fontSize="small" />
                <span style={{ fontSize: isMobile ? 12 : 14 }}>Personal</span>
              </Box>
            }
          />
          <Tab
            label={
              <Box
                display="flex"
                flexDirection={isMobile ? "column" : "row"}
                alignItems="center"
                justifyContent="center"
                gap={1}
                textAlign="center"
              >
                <AccessTimeIcon color="primary" fontSize="small" />
                <span style={{ fontSize: isMobile ? 12 : 14 }}>
                  Availability
                </span>
              </Box>
            }
          />
          <Tab
            label={
              <Box
                display="flex"
                flexDirection={isMobile ? "column" : "row"}
                alignItems="center"
                justifyContent="center"
                gap={1}
                textAlign="center"
              >
                <WorkIcon color="primary" fontSize="small" />
                <span style={{ fontSize: isMobile ? 12 : 14 }}>
                  Professional
                </span>
              </Box>
            }
          />
        </Tabs>
      </Box>

      <TabPanel value={activeTab} index={0}>
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
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(auto-fit, minmax(240px, 1fr))",
              },
              gap: 3,
            }}
          >
            <Controller
              name="contact"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Phone"
                  onChange={(e) => {
                    field.onChange(e);
                    trigger("contact");
                  }}
                  error={!!errors.contact}
                  helperText={errors.contact?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />

            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Email"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />

            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  select
                  label="Gender"
                  error={!!errors.gender}
                  helperText={errors.gender?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <WcIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                >
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </TextField>
              )}
            />

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Controller
                name="dob"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="Date of Birth"
                    value={field.value ? dayjs(field.value) : null}
                    onChange={(newValue) => {
                      const formattedDate = newValue
                        ? newValue.format("YYYY-MM-DD")
                        : "";
                      field.onChange(formattedDate);
                      handleFieldChange("dob", formattedDate);
                    }}
                    format="DD/MM/YYYY"
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors.dob,
                        helperText: errors.dob?.message,
                        InputProps: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <TodayIcon color="primary" />
                            </InputAdornment>
                          ),
                        },
                      },
                    }}
                  />
                )}
              />
            </LocalizationProvider>

            <Box mb={3}>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    select
                    label="Status"
                    error={!!errors.status}
                    helperText={errors.status?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                    <MenuItem value="on leave">On Leave</MenuItem>
                  </TextField>
                )}
              />
            </Box>

            <Box>
              {!updatePassword ? (
                <Button
                  fullWidth
                  variant="outlined"
                  color="info"
                  onClick={handleUpdatePasswordToggle}
                  sx={{
                    height: "56px", // Match other input heights
                    textTransform: "none",
                  }}
                >
                  Update Password
                </Button>
              ) : (
                <Box>
                  <Controller
                    name="password"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        placeholder="Enter new password"
                        onChange={(e) => {
                          field.onChange(e);
                          trigger("password"); // Force validation update
                        }}
                        fullWidth
                        type={showPassword ? "text" : "password"}
                        label="New Password"
                        inputRef={pwFieldRef}
                        error={!!errors.password}
                        helperText={errors.password?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PasswordIcon color="primary" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={togglePasswordVisibility}
                                edge="end"
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
                      />
                    )}
                  />
                  <Box sx={{ textAlign: "right", mt: 1 }}>
                    <Button
                      color="error"
                      variant="text"
                      size="small"
                      onClick={handleUpdatePasswordToggle}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <Box
          sx={{
            p: 3,
            border: "1px solid #DDD",
            borderRadius: "12px",
            backgroundColor: "#FFF",
          }}
        >
          {role === "doctor" && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                Availability
              </Typography>

              {Array.isArray(editFields.availability) &&
              editFields.availability.length > 0 ? (
                editFields.availability.map((slot, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      mb: 3,
                      p: 2,
                      border: "1px solid #E0E0E0",
                      borderRadius: "12px",
                      backgroundColor: "#FAFAFA",
                    }}
                  >
                    {/* Two-column layout */}
                    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                      {/* Column 1: Day + Hospital Location */}
                      <Box
                        sx={{
                          flex: "1 1 100%",
                          display: "flex",
                          flexDirection: "column",
                          gap: 2,
                        }}
                      >
                        <FormControl sx={{ flex: 1 }}>
                          <TextField
                            select
                            label="Day"
                            value={slot.day || ""}
                            onChange={(e) =>
                              handleFieldChange(
                                "availability",
                                e.target.value,
                                index,
                                "day"
                              )
                            }
                            error={!!errors.availability?.[index]?.day}
                            helperText={
                              errors.availability?.[index]?.day?.message
                            }
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <TodayIcon color="primary" />
                                </InputAdornment>
                              ),
                            }}
                          >
                            <MenuItem value="" disabled>
                              Select Day
                            </MenuItem>
                            {daysOfWeek.map((day) => (
                              <MenuItem key={day} value={day}>
                                {day}
                              </MenuItem>
                            ))}
                          </TextField>
                        </FormControl>

                        <TextField
                          label="Hospital Name"
                          value={slot.hospital?.name || ""}
                          onChange={(e) =>
                            handleFieldChange(
                              "availability",
                              e.target.value,
                              index,
                              "hospital.name"
                            )
                          }
                          sx={{ flex: 1 }}
                          error={!!errors.availability?.[index]?.hospital?.name}
                          helperText={
                            errors.availability?.[index]?.hospital?.name
                              ?.message
                          }
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <WorkIcon color="primary" />
                              </InputAdornment>
                            ),
                          }}
                        />

                        <TextField
                          label="Hospital Location"
                          value={slot.hospital?.location || ""}
                          onChange={(e) =>
                            handleFieldChange(
                              "availability",
                              e.target.value,
                              index,
                              "hospital.location"
                            )
                          }
                          sx={{ flex: 1 }}
                          error={
                            !!errors.availability?.[index]?.hospital?.location
                          }
                          helperText={
                            errors.availability?.[index]?.hospital?.location
                              ?.message
                          }
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <LocationOnIcon color="primary" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Box>

                      {/* Column 2: Hospital Name + (Start Time + End Time) */}
                      <Box
                        sx={{
                          flex: "1 1 100%",
                          display: "flex",
                          flexDirection: "column",
                          gap: 2,
                        }}
                      >
                        {/* Row for Start Time and End Time */}
                        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <TimePicker
                              label="Start Time"
                              ampm
                              value={
                                slot.startTime
                                  ? dayjs(slot.startTime, "h:mm A")
                                  : null
                              }
                              onChange={(newValue) => {
                                const formatted = parseTimeTo12Hour(newValue);
                                handleFieldChange(
                                  "availability",
                                  formatted,
                                  index,
                                  "startTime"
                                );
                              }}
                              slotProps={{
                                textField: {
                                  sx: { flex: 1, minWidth: "150px" },
                                  error:
                                    !!errors.availability?.[index]?.startTime,
                                  helperText:
                                    errors.availability?.[index]?.startTime
                                      ?.message,
                                  InputProps: {
                                    startAdornment: (
                                      <InputAdornment position="start">
                                        <AccessTimeIcon color="primary" />
                                      </InputAdornment>
                                    ),
                                  },
                                },
                              }}
                            />
                          </LocalizationProvider>

                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <TimePicker
                              label="End Time"
                              ampm
                              value={
                                slot.endTime
                                  ? dayjs(slot.endTime, "h:mm A")
                                  : null
                              }
                              onChange={(newValue) => {
                                const formatted = parseTimeTo12Hour(newValue);
                                handleFieldChange(
                                  "availability",
                                  formatted,
                                  index,
                                  "endTime"
                                );
                              }}
                              slotProps={{
                                textField: {
                                  sx: { flex: 1, minWidth: "150px" },
                                  error:
                                    !!errors.availability?.[index]?.endTime,
                                  helperText:
                                    errors.availability?.[index]?.endTime
                                      ?.message,
                                  InputProps: {
                                    startAdornment: (
                                      <InputAdornment position="start">
                                        <AccessTimeIcon color="primary" />
                                      </InputAdornment>
                                    ),
                                  },
                                },
                              }}
                            />
                          </LocalizationProvider>
                        </Box>
                      </Box>
                    </Box>

                    {/* Buttons */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 2,
                        flexWrap: "wrap",
                        mt: 1,
                      }}
                    >
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => {
                          const updated = editFields.availability.filter(
                            (_, idx) => idx !== index
                          );
                          handleFieldChange("availability", updated);
                        }}
                      >
                        Remove
                      </Button>

                      {isApplyToAllActive ? (
                        <Button
                          variant="outlined"
                          color="warning"
                          onClick={handleCancelApplyToAll}
                        >
                          Cancel Apply to All
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          color="secondary"
                          disabled={!editFields.availability?.[0]}
                          onClick={handleApplyToAll}
                        >
                          Apply Entry to All Days
                        </Button>
                      )}
                    </Box>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="textSecondary">
                  No availability slots added.
                </Typography>
              )}

              <Button
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
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
                Add Availability
              </Button>
            </Box>
          )}
        </Box>
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <Box
          sx={{
            p: 3,
            mb: 2,
            border: "1px solid #DDD",
            borderRadius: "12px",
            backgroundColor: "#FFF",
          }}
        >
          {role === "doctor" && (
            <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
              <Box sx={{ flex: 1 }}>
                <Controller
                  name="experience"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      label="Experience (in years)"
                      error={!!errors.experience}
                      helperText={errors.experience?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <HistoryIcon color="primary" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Controller
                  name="consultationFee"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Consultation Fee"
                      type="text"
                      error={!!errors.consultationFee}
                      helperText={errors.consultationFee?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CurrencyRupeeIcon color="primary" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Box>
            </Box>
          )}

          {role === "doctor" && (
            <Box mb={3}>
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
                      const newIds = newValue.map((q) => q._id);
                      field.onChange(newIds);
                      handleFieldChange("qualificationIds", newIds);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        label="Select Qualifications"
                        error={!!errors.qualificationIds}
                        helperText={errors.qualificationIds?.message}
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <>
                              <InputAdornment position="start">
                                <SchoolIcon color="primary" />
                              </InputAdornment>
                              {params.InputProps.startAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                  />
                )}
              />
            </Box>
          )}

          {role === "doctor" && (
            <Box mb={3}>
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
                      const newIds = newValue.map((s) => s._id);
                      field.onChange(newIds);
                      handleFieldChange("specializationIds", newIds);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        label="Select Specializations"
                        error={!!errors.specializationIds}
                        helperText={errors.specializationIds?.message}
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <>
                              <InputAdornment position="start">
                                <WorkIcon color="primary" />
                              </InputAdornment>
                              {params.InputProps.startAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                  />
                )}
              />
            </Box>
          )}

          {role === "doctor" && (
            <Box mb={2}>
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
                      const newIds = newValue.map((s) => s._id);
                      field.onChange(newIds);
                      handleFieldChange("symptomIds", newIds);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        label="Select Symptoms"
                        error={!!errors.symptomIds}
                        helperText={errors.symptomIds?.message}
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <>
                              <InputAdornment position="start">
                                <SickIcon color="primary" />
                              </InputAdornment>
                              {params.InputProps.startAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                  />
                )}
              />
            </Box>
          )}
        </Box>
      </TabPanel>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "row", sm: "column" },
          flexWrap: "wrap",
          gap: 1,
          position: { xs: "static", sm: "absolute" },
          top: { sm: 20 },
          right: { sm: -3 },
          alignItems: "center",
          justifyContent: "center",
          mt: { xs: 2, sm: 0 },
        }}
      >
        <Button
          type="button"
          variant="contained"
          color="success"
          onClick={handleSubmit(handleSaveChanges)}
          sx={{
            minWidth: { xs: "80px", sm: "100px" },
            flex: 1,
          }}
        >
          Save
        </Button>
        <Button
          color="error"
          variant="contained"
          onClick={handleCancelChanges}
          sx={{
            minWidth: { xs: "80px", sm: "100px" },
            flex: 1,
          }}
        >
          Cancel
        </Button>
      </Box>

      <Toast
        alerting={toast.toastAlert}
        severity={toast.toastSeverity}
        message={toast.toastMessage}
      />
    </>
  );
};

export default DoctorProfileEdit;
