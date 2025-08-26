"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, useParams } from "next/navigation";
import { Formik, Form, Field } from "formik";
import dayjs from "dayjs";
import {
  Box,
  Button,
  Typography,
  TextField as MuiTextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
} from "@mui/material";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Password as PasswordIcon,
  Call as CallIcon,
  Place as PlaceIcon,
  Work as WorkIcon,
  Info as InfoIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from "@mui/icons-material";
import WcIcon from "@mui/icons-material/Wc";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PinDrop from "@mui/icons-material/PinDrop";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import DeleteIcon from "@mui/icons-material/Delete";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import Loader from "@/components/common/Loader";
import Toast from "@/components/common/Toast";
import validationSchema from "./ValidationSchema";
import { AppDispatch, RootState } from "@/redux/store";
import { fetcher } from "@/apis/apiClient";
import { useCreateUser, useModifyUser } from "@/hooks/user";
import { Utility } from "@/utils";
import { Role, Status, UserData } from "@/types/user";

interface UserResponse {
  statusCode: string | number;
  message: string;
  data: UserData;
}

const initialValues: UserData = {
  username: "",
  email: "",
  password: "",
  contact: "",
  designation: "",
  gender: null,
  dob: "",
  pincode: null,
  address: "",
  profilePicture: "",
  status: Status.ACTIVE,
  role: Role.SALES,
};
let editFormValues: UserData;

// eslint-disable-next-line react/function-component-definition
const UserForm: React.FC = () => {
  const [title, setTitle] = useState<"Create User" | "Edit User">();
  const [loading, setLoading] = useState<boolean>(false);
  const [formValues, setFormValues] = useState<UserData>(initialValues);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [updatePassword, setUpdatePassword] = useState<boolean>(false);
  const [creatorId, setCreatorId] = useState<string | undefined>();
  const pwFieldRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [currentRole, setCurrentRole] = useState<Role | undefined>();

  const params = useParams();
  const router = useRouter();
  const dispatch: AppDispatch = useDispatch();
  const { toast } = useSelector((state: RootState) => state.toast);
  const { createUser } = useCreateUser("create-user");
  const { modifyUser } = useModifyUser("update-user");
  const { toastAndNavigate } = Utility();
  const userId = params?.id;
  const { decodedToken } = Utility();

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

  // Create/Edit/Populate User
  useEffect(() => {
    if (userId) {
      setTitle("Edit User");
      populateData(userId);
    } else {
      setFormValues(initialValues);
      setTitle("Create User");
    }
  }, [userId]);

  useEffect(() => {
    const payload = decodedToken(); // auto-reads cookie "token"
    setCreatorId(payload?.id); // may be undefined if no token
  }, []);

  const create = useCallback(
    async (values: UserData) => {
      setLoading(true);
      try {
        const response = await createUser({
          ...values,
          profilePicture: values?.profilePicture?.file || null,
          createdBy: creatorId,
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
          "Error Creating User, please try again.";
        toastAndNavigate(dispatch, true, "error", errorMessage, () =>
          location.reload()
        );
      } finally {
        setLoading(false);
      }
    },
    [creatorId, createUser, dispatch, router, toastAndNavigate]
  );

  const populateData = useCallback(async (userId: string | string[]) => {
    setLoading(true);
    try {
      const response: UserResponse = await fetcher(
        "user",
        `get-user-by-id/${userId}`
      );
      if (response?.statusCode === 200) {
        console.log(response.data, "response user");
        setFormValues(response.data);
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
        const payload = {
          ...values,
          profilePicture: values?.profilePicture?.file || null,
        };
        if (!updatePassword) {
          delete payload.password;
        }

        const response = await modifyUser(payload);
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
    [updatePassword, modifyUser, toastAndNavigate, dispatch, router]
  );

  const designationOptions = [
    "Operations",
    "Team Leader",
    "Manager",
    "Relationship Executive",
  ];

  return (
    <Box margin="0 10px 10px 10px">
      {userId ? (
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
              {title === "Create User" || updatePassword ? (
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
              <FormControl
                fullWidth
                error={touched.status ? Boolean(errors.status) : null}
              >
                <InputLabel>Status</InputLabel>
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
                </Select>
                {touched.status && errors.status ? (
                  <Typography color="error" variant="body2">
                    {errors.status}
                  </Typography>
                ) : null}
              </FormControl>
              <FormControl
                fullWidth
                error={touched.role ? Boolean(errors.role) : null}
              >
                <InputLabel>Role</InputLabel>
                {decodedToken()?.role === "sub_admin" ? (
                  <Select
                    label="Role"
                    name="role"
                    value="sales"
                    disabled
                    startAdornment={
                      <InputAdornment position="start">
                        <InfoIcon color="primary" />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="sales">Sales</MenuItem>
                  </Select>
                ) : (
                  <Select
                    label="Role"
                    name="role"
                    value={values.role}
                    onChange={(e) => setFieldValue("role", e.target.value)}
                    startAdornment={
                      <InputAdornment position="start">
                        <InfoIcon color="primary" />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="sub_admin">Sub Admin</MenuItem>
                    <MenuItem value="sales">Sales</MenuItem>
                    <MenuItem value="operations">Operations</MenuItem>
                  </Select>
                )}
                {touched.role && errors.role ? (
                  <Typography color="error" variant="body2">
                    {errors.role}
                  </Typography>
                ) : null}
              </FormControl>
              <FormControl
                fullWidth
                error={touched.designation ? Boolean(errors.designation) : null}
              >
                <InputLabel>Designation *</InputLabel>
                <Select
                  label="Designation"
                  name="designation"
                  value={values.designation || ""}
                  onChange={(e) => setFieldValue("designation", e.target.value)}
                  startAdornment={
                    <InputAdornment position="start">
                      <WorkIcon color="primary" />
                    </InputAdornment>
                  }
                >
                  {designationOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
                {touched.designation && errors.designation ? (
                  <Typography color="error" variant="body2">
                    {errors.designation}
                  </Typography>
                ) : null}
              </FormControl>
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
                error={touched.address ? Boolean(errors.address) : null}
                helperText={touched.address ? errors.address : null}
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
              </Box>
            </Box>

            <Box display="flex" justifyContent="end" m="20px">
              {title === "Edit User" ? null : (
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
                color={title === "Edit User" ? "info" : "success"}
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

export default UserForm;
