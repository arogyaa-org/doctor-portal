"use client";

import React, { useState, useEffect, useRef } from "react";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Box,
  Avatar,
  Typography,
  IconButton,
  Tooltip,
  Modal,
  useMediaQuery,
  TextField,
  Button,
  Grid,
  InputAdornment,
  MenuItem,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import WorkIcon from "@mui/icons-material/Work";
import TodayIcon from "@mui/icons-material/Today";
import WcIcon from "@mui/icons-material/Wc";
import LockIcon from "@mui/icons-material/Lock";
import PersonIcon from "@mui/icons-material/Person";
import PasswordIcon from "@mui/icons-material/LockOutlined";
import { useTheme } from "@mui/material/styles";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useGetUser, useModifyUser } from "@/hooks/user";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import Toast from "@/components/common/Toast";
import { Utility } from "@/utils";
import { useForm } from "react-hook-form";

// eslint-disable-next-line react/function-component-definition
const SalesProfilePage = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const dispatch = useDispatch();
  const toast = useSelector((state: any) => state.toast);
  const { toastAndNavigate } = Utility();

  const { decodedToken } = Utility();
  const userId = decodedToken()?.id || null;
  const role = decodedToken()?.role;


  const { value, refetch } = useGetUser(null, `/get-user-by-id/${userId}`);
  const { modifyUser, loading } = useModifyUser("/update-user");

  const phoneRegExp =
    /^((\+[1-9]{1,4}[ -]?)|(\([0-9]{2,3}\)[ -]?)|([0-9]{2,4})[ -]?)*?[0-9]{3,4}[ -]?[0-9]{3,4}$/;

  const emailRegExp = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

  const validationSchema = yup.object().shape({
    email: yup
      .string()
      .matches(emailRegExp, "Email Address is Not Valid")
      .required("Email is required"),
    contact: yup
      .string()
      .matches(phoneRegExp, "Phone Number is Not Valid")
      .required("Phone is required")
      .test(
        "len",
        "Phone number must be exactly 10 digits",
        (val) => val && val.replace(/\D/g, "").length === 10
      ),
    newPassword: yup.string().when([], {
      is: () => showPasswordFields,
      then: (schema) =>
        schema
          .required("Password is required")
          .min(8, "Password must be at least 8 characters")
          .matches(/[A-Z]/, "Must contain at least 1 uppercase letter")
          .matches(/[a-z]/, "Must contain at least 1 lowercase letter")
          .matches(/[0-9]/, "Must contain at least 1 number")
          .matches(/[^\w]/, "Must contain at least 1 special character"),
      otherwise: (schema) => schema.notRequired(),
    }),
  });

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      email: "",
      contact: "",
      newPassword: "",
    },
  });

  const [form, setForm] = useState({
    username: "",
    email: "",
    contact: "",
    dob: "",
    gender: "",
    status: "",
    designation: "",
    address: "",
    pincode: "",
    profilePicture: "",
    newPassword: "",
  });

  useEffect(() => {
    if (value?.data) {
      setForm({
        username: value.data.username || "",
        email: value.data.email || "",
        contact: value.data.contact || "",
        dob: value.data.dob || "",
        gender: value.data.gender || "",
        status: value.data.status || "",
        designation: value.data.designation || "",
        address: value.data.address || "",
        pincode: value.data.pincode || "",
        profilePicture: value.data.profilePicture || "",
        newPassword: "",
      });

      reset({
        email: value.data.email || "",
        contact: value.data.contact || "",
        newPassword: "",
      });
    }
  }, [value, reset]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((prev) => ({ ...prev, profilePicture: file }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (dataFromForm: any) => {
    const formData = new FormData();
    formData.append("_id", userId);
    formData.append("username", form.username);
    formData.append("email", dataFromForm.email);
    formData.append("contact", dataFromForm.contact);
    formData.append("dob", form.dob);
    formData.append("gender", form.gender);
    formData.append("status", form.status);
    formData.append("address", form.address);
    formData.append("pincode", form.pincode);

    if (typeof File !== "undefined" && form.profilePicture instanceof File) {
      formData.append("profilePicture", form.profilePicture);
    }

    if (showPasswordFields && dataFromForm.newPassword) {
      formData.append("password", dataFromForm.newPassword);
    }

    try {
      await modifyUser(formData);
      await refetch();
      setEditMode(false);
      setShowPasswordFields(false);
      toastAndNavigate(
        dispatch,
        true,
        "success",
        "Profile updated successfully"
      );
    } catch (err) {
      console.error("Update failed", err);
      toastAndNavigate(dispatch, true, "error", "Update failed");
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setShowPasswordFields(false);
    if (value?.data) {
      setForm({
        username: value.data.username || "",
        email: value.data.email || "",
        contact: value.data.contact || "",
        dob: value.data.dob || "",
        gender: value.data.gender || "",
        status: value.data.status || "",
        designation: value.data.designation || "",
        address: value.data.address || "",
        pincode: value.data.pincode || "",
        profilePicture: value.data.profilePicture || "",
        newPassword: "",
      });
      reset({
        email: value.data.email || "",
        contact: value.data.contact || "",
        newPassword: "",
      });
    }
  };

  const handleImageClick = () => imageInputRef.current?.click();
  const handleImageClose = () => setIsImageOpen(false);

  return (
    <>
      <Box
        sx={{
          backgroundColor: "#F0F4FF",
          borderRadius: "16px",
          p: 4,
          maxWidth: "1000px",
          margin: "auto",
          mt: "80px",
          boxShadow: "0px 6px 15px rgba(0, 0, 0, 0.15)",
          position: "relative",
        }}
      >
        {!editMode ? (
          <Tooltip title="Edit Profile">
            <IconButton
              onClick={() => setEditMode(true)}
              sx={{
                position: "absolute",
                top: 16,
                right: 2,
                bgcolor: "white",
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                "&:hover": { bgcolor: "grey.100" },
              }}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
        ) : (
          !isSmallScreen && (
            <Box
              sx={{
                position: "absolute",
                top: 16,
                right: 2,
                display: "flex",
                flexDirection: "column",
                gap: 1,
                alignItems: "flex-end",
              }}
            >
              <Button
                variant="contained"
                size="small"
                onClick={handleSubmit(handleSave)}
                disabled={loading}
                sx={{ width: 160, height: 36 }}
              >
                Save
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  const willShow = !showPasswordFields;
                  setShowPasswordFields(willShow);
                  setValue("newPassword", "");
                  setForm((prev) => ({ ...prev, newPassword: "" }));
                }}
                sx={{
                  width: 160,
                  height: 36,
                  borderColor: "#6366F1",
                  color: "#6366F1",
                  "&:hover": {
                    backgroundColor: "rgba(99, 102, 241, 0.08)",
                    borderColor: "#4F46E5",
                    color: "#4F46E5",
                  },
                }}
              >
                {showPasswordFields ? "Cancel Update" : "Update Password"}
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={handleCancel}
                sx={{
                  width: 160,
                  height: 36,
                  borderColor: "#EF4444",
                  color: "#EF4444",
                  "&:hover": {
                    backgroundColor: "rgba(239, 68, 68, 0.08)",
                    borderColor: "#DC2626",
                    color: "#DC2626",
                  },
                }}
              >
                Cancel
              </Button>
            </Box>
          )
        )}

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mb: 4,
          }}
        >
          <Box sx={{ position: "relative", width: 130, height: 130 }}>
            <Avatar
              src={
                typeof File !== "undefined" && form.profilePicture instanceof File
                  ? URL.createObjectURL(form.profilePicture)
                  : form.profilePicture
              }
              sx={{
                width: "100%",
                height: "100%",
                border: "4px solid #FFF",
                boxShadow: "0px 6px 10px rgba(0, 0, 0, 0.25)",
                cursor: "pointer",
              }}
              onClick={handleImageClick}
            />
            {editMode && (
              <>
                <IconButton
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    bgcolor: "#fff",
                    border: "1px solid #ccc",
                  }}
                  onClick={handleImageClick}
                >
                  <PhotoCamera fontSize="small" />
                </IconButton>
                <input
                  type="file"
                  accept="image/*"
                  ref={imageInputRef}
                  onChange={handleImageUpload}
                  style={{ display: "none" }}
                />
              </>
            )}
          </Box>
          {editMode ? (
            <TextField
              name="username"
              label="Name"
              value={form.username}
              onChange={handleChange}
              sx={{ mt: 2, width: 300 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            />
          ) : (
            <Typography
              variant="h4"
              sx={{
                textAlign: "center",
                fontWeight: "bold",
                color: "#333",
                mt: 2,
              }}
            >
              {form.username || "-"}
            </Typography>
          )}
        </Box>

        <Box
          sx={{
            p: 4,
            border: "1px solid #e0e0e0",
            borderRadius: "16px",
            backgroundColor: "#fff",
            maxWidth: "900px",
            mx: "auto",
            mt: 4,
            boxShadow: "0px 4px 12px rgba(0,0,0,0.04)",
          }}
        >
          <Grid container spacing={3}>
            {[
              {
                name: "email",
                label: "Email",
                icon: <EmailIcon color="primary" />,
              },
              {
                name: "contact",
                label: "Phone",
                icon: <PhoneIcon color="primary" />,
              },
              {
                name: "address",
                label: "Address",
                icon: <LocationOnIcon color="primary" />,
              },
              {
                name: "pincode",
                label: "Pincode",
                icon: <LocationOnIcon color="primary" />,
              },
            ].map((field) => (
              <Grid item xs={12} sm={4} key={field.name}>
                {editMode ? (
                  <TextField
                    fullWidth
                    label={field.label}
                    name={field.name}
                    {...(["email", "contact"].includes(field.name)
                      ? register(field.name)
                      : {})}
                    {...(["email", "contact"].includes(field.name)
                      ? {}
                      : {
                        value: form[
                          field.name as keyof typeof form
                        ] as string,
                        onChange: handleChange,
                      })}
                    error={!!errors[field.name as "email" | "contact"]}
                    helperText={
                      errors[field.name as "email" | "contact"]?.message
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          {field.icon}
                        </InputAdornment>
                      ),
                    }}
                  />
                ) : (
                  <Box>
                    <Typography fontWeight="bold">{field.label}</Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      {field.icon}
                      <Typography>
                        {value?.data?.[field.name] || "-"}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Grid>
            ))}

            <Grid item xs={12} sm={4}>
              {editMode ? (
                <DatePicker
                  label="Date of Birth"
                  value={dayjs(form.dob)}
                  onChange={(date) =>
                    setForm((prev) => ({
                      ...prev,
                      dob: dayjs(date).format("YYYY-MM-DD"),
                    }))
                  }
                  format="DD/MM/YYYY"
                  slotProps={{
                    textField: {
                      fullWidth: true,
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
              ) : (
                <Box>
                  <Typography fontWeight="bold">Date of Birth</Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <TodayIcon color="primary" />
                    <Typography>
                      {form.dob ? dayjs(form.dob).format("DD/MM/YYYY") : "-"}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Grid>

            <Grid item xs={12} sm={4}>
              {editMode ? (
                <TextField
                  fullWidth
                  select
                  label="Gender"
                  name="gender"
                  value={form.gender}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, gender: e.target.value }))
                  }
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
                  <MenuItem value="Others">Others</MenuItem>
                </TextField>
              ) : (
                <Box>
                  <Typography fontWeight="bold">Gender</Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <WcIcon color="primary" />
                    <Typography>{form.gender || "-"}</Typography>
                  </Box>
                </Box>
              )}
            </Grid>

            <Grid item xs={12} sm={4}>
              {editMode && role === "admin" ? (
                <TextField
                  fullWidth
                  label="Status"
                  name="status"
                  value={form.status}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, status: e.target.value }))
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
              ) : (
                <Box>
                  <Typography fontWeight="bold">Status</Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <LockIcon color="primary" />
                    <Typography>{form.status || "-"}</Typography>
                  </Box>
                </Box>
              )}
            </Grid>

            <Grid item xs={12} sm={4}>
              <Box>
                <Typography fontWeight="bold">Designation</Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <WorkIcon color="primary" />
                  <Typography>{form.designation || "-"}</Typography>
                </Box>
              </Box>
            </Grid>

            {editMode && showPasswordFields && (
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="New Password"
                  name="newPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  {...register("newPassword")}
                  value={form.newPassword}
                  onChange={handleChange}
                  error={!!errors.newPassword}
                  helperText={errors.newPassword?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PasswordIcon color="primary" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword((prev) => !prev)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            )}
          </Grid>

          {editMode && isSmallScreen && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                mt: 3,
                alignItems: "center",
              }}
            >
              <Button
                variant="contained"
                fullWidth
                onClick={handleSave}
                disabled={loading}
              >
                Save
              </Button>
              <Button variant="outlined" fullWidth onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                variant="text"
                fullWidth
                onClick={() => {
                  setShowPasswordFields(!showPasswordFields);
                  setForm((prev) => ({ ...prev, newPassword: "" }));
                }}
              >
                {showPasswordFields
                  ? "Cancel Password Update"
                  : "Update Password"}
              </Button>
            </Box>
          )}
        </Box>

        <Modal open={isImageOpen} onClose={handleImageClose}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              bgcolor: "background.paper",
              borderRadius: 2,
              boxShadow: 24,
              p: 4,
              textAlign: "center",
            }}
          >
            <IconButton
              onClick={handleImageClose}
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                color: "grey.600",
                "&:hover": { color: "grey.900" },
              }}
            >
              <CloseIcon />
            </IconButton>
            <Avatar
              alt="User"
              src={
                typeof File !== "undefined" && form.profilePicture instanceof File
                  ? URL.createObjectURL(form.profilePicture)
                  : form.profilePicture
              }
              sx={{
                width: 300,
                height: 300,
                mx: "auto",
                border: "4px solid white",
                boxShadow: 3,
              }}
            />
          </Box>
        </Modal>
      </Box>
      <Toast
        alerting={toast.toastAlert}
        severity={toast.toastSeverity}
        message={toast.toastMessage}
      />
    </>
  );
};

export default SalesProfilePage;
