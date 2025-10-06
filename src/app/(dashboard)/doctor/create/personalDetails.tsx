"use client";

import { Field } from "formik";
import {
  Box,
  Button,
  Typography,
  TextField as MuiTextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Card,
  CardContent,
  Chip,
  Stack,
  Paper,
  Fade,
} from "@mui/material";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Password as PasswordIcon,
  Call as CallIcon,
  Language as LanguageIcon,
  Place as PlaceIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
} from "@mui/icons-material";
import WcIcon from "@mui/icons-material/Wc";
import PinDrop from "@mui/icons-material/PinDrop";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AddPhotoAlternate from "@mui/icons-material/AddPhotoAlternate";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { AppDispatch } from "@/redux/store";
import { Utility } from "@/utils";
import { useMemo } from "react";

interface PersonalDetailsProps {
  values: any;
  errors: any;
  touched: any;
  handleChange: any;
  setFieldValue: any;
  langText: string;
  setLangText: (text: string) => void;
  title: string;
  updatePassword: boolean;
  setUpdatePassword: (value: boolean) => void;
  handleUpdatePassword: () => void;
  showPassword: boolean;
  togglePasswordVisibility: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  role: string;
  emailFieldRef: React.RefObject<HTMLInputElement>;
  contactFieldRef: React.RefObject<HTMLInputElement>;
  pwFieldRef: React.RefObject<HTMLInputElement>;
  dispatch: AppDispatch;
  toastAndNavigate: Utility["toastAndNavigate"];
}

// Moved StyledTextField outside to prevent recreation
const StyledTextField = ({ icon, children, ...props }) => {
  const inputProps = useMemo(
    () => ({
      startAdornment: <InputAdornment position="start">{icon}</InputAdornment>,
      sx: {
        borderRadius: 2,
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        "&:hover": {
          backgroundColor: "rgba(255, 255, 255, 0.9)",
        },
        "&.Mui-focused": {
          backgroundColor: "white",
          boxShadow: "0 0 0 3px rgba(25, 118, 210, 0.12)",
        },
      },
      ...props.InputProps,
    }),
    [icon, props.InputProps],
  );

  return (
    <Box sx={{ position: "relative" }}>
      <Field
        as={MuiTextField}
        {...props}
        InputProps={inputProps}
        sx={{
          "& .MuiOutlinedInput-root": {
            transition: "all 0.3s ease",
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "primary.main",
              borderWidth: 2,
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "primary.main",
              borderWidth: 2,
            },
          },
          "& .MuiInputLabel-root": {
            fontWeight: 500,
          },
          ...props.sx,
        }}
      />
    </Box>
  );
};

// Moved StyledFormControl outside to prevent recreation
const StyledFormControl = ({ icon, children, ...props }) => {
  const selectProps = useMemo(
    () => ({
      name: props.selectProps?.name,
      value: props.selectProps?.value,
      onChange: props.selectProps?.onChange,
      startAdornment: <InputAdornment position="start">{icon}</InputAdornment>,
    }),
    [
      icon,
      props.selectProps?.name,
      props.selectProps?.value,
      props.selectProps?.onChange,
    ],
  );

  return (
    <FormControl
      {...props}
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: 2,
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          transition: "all 0.3s ease",
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.9)",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "primary.main",
            borderWidth: 2,
          },
          "&.Mui-focused": {
            backgroundColor: "white",
            boxShadow: "0 0 0 3px rgba(25, 118, 210, 0.12)",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "primary.main",
            borderWidth: 2,
          },
        },
        "& .MuiInputLabel-root": {
          fontWeight: 500,
        },
        ...props.sx,
      }}
    >
      <InputLabel>{props.label}</InputLabel>
      <Select label={props.label} {...selectProps}>
        {children}
      </Select>
      {props.errorText && (
        <Typography color="error" variant="body2" sx={{ mt: 0.5, ml: 1.5 }}>
          {props.errorText}
        </Typography>
      )}
    </FormControl>
  );
};

// eslint-disable-next-line react/function-component-definition
const PersonalDetails: React.FC<PersonalDetailsProps> = ({
  values,
  errors,
  touched,
  handleChange,
  setFieldValue,
  langText,
  setLangText,
  title,
  updatePassword,
  setUpdatePassword,
  handleUpdatePassword,
  showPassword,
  togglePasswordVisibility,
  fileInputRef,
  role,
  emailFieldRef,
  contactFieldRef,
  pwFieldRef,
  dispatch,
  toastAndNavigate,
}) => {
  // Debug re-renders
  console.log("PersonalDetails rendered");

  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        minHeight: "100vh",
        p: 3,
      }}
    >
      <Card
        elevation={0}
        sx={{
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          borderRadius: 4,
          border: "1px solid rgba(255, 255, 255, 0.2)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
          overflow: "visible",
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ mb: 4, textAlign: "center" }}>
            <Typography
              variant="h4"
              fontWeight={700}
              sx={{
                background: "linear-gradient(45deg, #667eea, #764ba2)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 1,
              }}
            >
              Personal Information
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Please fill in your personal details below
            </Typography>
          </Box>

          <Box
            display="grid"
            gap={3}
            gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))"
            sx={{ mb: 4 }}
          >
            {/* Basic Information Row */}
            <StyledTextField
              icon={<PersonIcon color="primary" />}
              type="text"
              label="Full Name *"
              name="username"
              fullWidth
              InputLabelProps={{ shrink: true }}
              error={touched.username ? Boolean(errors.username) : undefined}
              helperText={touched.username ? errors.username : null}
            />

            <StyledTextField
              icon={<EmailIcon color="primary" />}
              label="Email Address *"
              name="email"
              fullWidth
              inputRef={emailFieldRef}
              error={touched.email ? Boolean(errors.email) : undefined}
              helperText={touched.email ? errors.email : null}
            />

            {title === "Create Doctor" || updatePassword ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <StyledTextField
                  icon={<PasswordIcon color="primary" />}
                  label="Password *"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  fullWidth
                  inputRef={pwFieldRef}
                  value={values.password}
                  onChange={(e) => {
                    console.log("Password changed:", e.target.value);
                    handleChange(e);
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={togglePasswordVisibility}
                          sx={{
                            color: "primary.main",
                            "&:hover": {
                              backgroundColor: "primary.50",
                            },
                          }}
                        >
                          {showPassword ? (
                            <VisibilityIcon />
                          ) : (
                            <VisibilityOffIcon />
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
                {title === "Edit Doctor" && updatePassword && (
                  <Button
                    variant="text"
                    color="error"
                    sx={{ alignSelf: "flex-start", textTransform: "none" }}
                    onClick={() => {
                      console.log("Cancel Update Password clicked");
                      handleUpdatePassword();
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </Box>
            ) : title === "Edit Doctor" ? (
              <Button
                variant="outlined"
                color="primary"
                fullWidth
                sx={{
                  height: 56, // Match TextField height
                  borderRadius: 2,
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    borderColor: "primary.main",
                    borderWidth: 2,
                  },
                  "&.Mui-focused": {
                    backgroundColor: "white",
                    boxShadow: "0 0 0 3px rgba(25, 118, 210, 0.12)",
                    borderColor: "primary.main",
                    borderWidth: 2,
                  },
                  textTransform: "none",
                  fontWeight: 500,
                }}
                onClick={() => {
                  console.log("Update Password button clicked");
                  handleUpdatePassword();
                }}
              >
                Update Password
              </Button>
            ) : null}

            <StyledTextField
              icon={<CallIcon color="primary" />}
              label="Contact Number *"
              name="contact"
              fullWidth
              inputRef={contactFieldRef}
              error={touched.contact ? Boolean(errors.contact) : undefined}
              helperText={touched.contact ? errors.contact : null}
            />

            {/* Date and Gender Row */}
            <Box sx={{ position: "relative" }}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Date of Birth *"
                  value={values.dob ? dayjs(values.dob, "DD/MM/YYYY") : null}
                  onChange={(newValue) => {
                    setFieldValue(
                      "dob",
                      newValue ? newValue.format("DD/MM/YYYY") : "",
                    );
                  }}
                  maxDate={dayjs().subtract(20, "year")}
                  format="DD/MM/YYYY"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: touched.dob && Boolean(errors.dob),
                      helperText: touched.dob && errors.dob,
                      sx: {
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          backgroundColor: "rgba(255, 255, 255, 0.8)",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            backgroundColor: "rgba(255, 255, 255, 0.9)",
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "primary.main",
                            borderWidth: 2,
                          },
                          "&.Mui-focused": {
                            backgroundColor: "white",
                            boxShadow: "0 0 0 3px rgba(25, 118, 210, 0.12)",
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "primary.main",
                            borderWidth: 2,
                          },
                        },
                        "& .MuiInputLabel-root": {
                          fontWeight: 500,
                        },
                      },
                    },
                    inputAdornment: { position: "start" },
                  }}
                  slots={{ openPickerIcon: CalendarMonthIcon }}
                  sx={{
                    "& .MuiIconButton-root": {
                      color: "primary.main",
                      marginRight: "-16px",
                    },
                    "& .MuiInputBase-input": {
                      paddingLeft: "48px !important",
                    },
                    "& .MuiInputAdornment-positionStart": {
                      marginRight: "8px",
                    },
                  }}
                />
              </LocalizationProvider>
              <CalendarMonthIcon
                color="primary"
                sx={{
                  position: "absolute",
                  left: 10,
                  top: 16,
                  zIndex: 1,
                  pointerEvents: "none",
                }}
              />
            </Box>

            <StyledFormControl
              icon={<WcIcon color="primary" />}
              fullWidth
              label="Gender"
              selectProps={{
                name: "gender",
                value: values.gender,
                onChange: (e) => setFieldValue("gender", e.target.value),
              }}
              errorText={touched.gender && errors.gender}
            >
              <MenuItem value="male">Male</MenuItem>
              <MenuItem value="female">Female</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </StyledFormControl>

            {/* Languages Input */}
            <Box sx={{ position: "relative" }}>
              <MuiTextField
                label="Languages Spoken"
                name="languagesSpoken"
                fullWidth
                value={langText}
                onChange={(e) => {
                  console.log("Languages input changed:", e.target.value);
                  setLangText(e.target.value);
                }}
                onBlur={() => {
                  console.log(
                    "Languages input blurred, updating languagesSpoken",
                  );
                  const arr = langText
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean);
                  setFieldValue("languagesSpoken", arr);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    console.log("Enter pressed in languages input");
                    e.preventDefault();
                    const arr = langText
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean);
                    setFieldValue("languagesSpoken", arr);
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LanguageIcon color="primary" />
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: 2,
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                    },
                    "&.Mui-focused": {
                      backgroundColor: "white",
                      boxShadow: "0 0 0 3px rgba(25, 118, 210, 0.12)",
                    },
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "primary.main",
                      borderWidth: 2,
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "primary.main",
                      borderWidth: 2,
                    },
                  },
                  "& .MuiInputLabel-root": {
                    fontWeight: 500,
                  },
                }}
                error={
                  touched.languagesSpoken
                    ? Boolean(errors.languagesSpoken)
                    : undefined
                }
                helperText={
                  touched.languagesSpoken
                    ? errors.languagesSpoken
                    : "Separate multiple languages with commas"
                }
              />
              {values.languagesSpoken && values.languagesSpoken.length > 0 && (
                <Box
                  sx={{ mt: 1, display: "flex", gap: 0.5, flexWrap: "wrap" }}
                >
                  {values.languagesSpoken.map((lang, idx) => (
                    <Chip
                      key={idx}
                      label={lang}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ borderRadius: 2 }}
                    />
                  ))}
                </Box>
              )}
            </Box>

            {/* Address Fields */}
            <StyledTextField
              icon={<PinDrop color="primary" />}
              label="Clinic Address"
              name="clinicAddress"
              fullWidth
              multiline
              maxRows={3}
              error={
                touched.clinicAddress
                  ? Boolean(errors.clinicAddress)
                  : undefined
              }
              helperText={touched.clinicAddress ? errors.clinicAddress : null}
            />

            <StyledTextField
              icon={<PlaceIcon color="primary" />}
              label="Pincode"
              name="pincode"
              fullWidth
              error={touched.pincode ? Boolean(errors.pincode) : undefined}
              helperText={touched.pincode ? errors.pincode : null}
            />
          </Box>

          {/* Profile Picture Section */}
          <Card
            variant="outlined"
            sx={{
              borderRadius: 3,
              border: "2px dashed",
              borderColor: "primary.200",
              backgroundColor: "rgba(25, 118, 210, 0.02)",
              transition: "all 0.3s ease",
              "&:hover": {
                borderColor: "primary.main",
                backgroundColor: "rgba(25, 118, 210, 0.05)",
                transform: "translateY(-2px)",
                boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h6"
                fontWeight={600}
                color="primary.main"
                gutterBottom
              >
                Profile Picture
              </Typography>

              <Stack direction="row" spacing={3} alignItems="center">
                {/* Upload Area */}
                <Box
                  component="label"
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px dashed",
                    borderColor: "primary.300",
                    borderRadius: 3,
                    width: 180,
                    height: 140,
                    cursor: "pointer",
                    textAlign: "center",
                    transition: "all 0.3s ease",
                    backgroundColor: "white",
                    "&:hover": {
                      borderColor: "primary.main",
                      backgroundColor: "primary.50",
                      transform: "scale(1.02)",
                      "& svg": {
                        color: "primary.main",
                        transform: "scale(1.1)",
                      },
                    },
                  }}
                >
                  <CloudUploadIcon
                    sx={{
                      fontSize: 40,
                      color: "primary.main",
                      mb: 1,
                      transition: "all 0.3s ease",
                    }}
                  />
                  <Typography
                    variant="body2"
                    fontWeight={500}
                    color="primary.main"
                  >
                    Choose Photo
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    JPG, PNG, WEBP
                  </Typography>
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
                            "Profile picture must be less than 1MB",
                            () => {},
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

                {/* Preview Area */}
                {(values.profilePicture?.file ||
                  typeof values.profilePicture === "string") && (
                  <Fade in={true}>
                    <Box sx={{ position: "relative" }}>
                      <Paper
                        elevation={3}
                        sx={{
                          borderRadius: 3,
                          overflow: "hidden",
                          border: "3px solid",
                          borderColor: "primary.main",
                        }}
                      >
                        <Box
                          component="img"
                          src={
                            typeof values.profilePicture === "string"
                              ? values.profilePicture
                              : values.profilePicture.preview
                          }
                          alt="Profile Preview"
                          sx={{
                            width: 150,
                            height: 150,
                            objectFit: "cover",
                            display: "block",
                          }}
                        />
                      </Paper>
                      <IconButton
                        onClick={() => {
                          if (values.profilePicture?.preview) {
                            URL.revokeObjectURL(values.profilePicture.preview);
                          }
                          setFieldValue("profilePicture", null);
                        }}
                        sx={{
                          position: "absolute",
                          top: -8,
                          right: -8,
                          backgroundColor: "error.main",
                          color: "white",
                          width: 32,
                          height: 32,
                          boxShadow: 3,
                          "&:hover": {
                            backgroundColor: "error.dark",
                            transform: "scale(1.1)",
                          },
                        }}
                      >
                        <DeleteIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>
                  </Fade>
                )}
              </Stack>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mt: 2 }}
              >
                Maximum file size: 1MB. Recommended dimensions: 400x400px
              </Typography>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PersonalDetails;