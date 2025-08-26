"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, useParams } from "next/navigation";
import { Formik, Form, Field } from "formik";

import {
  Box,
  Button,
  Typography,
  TextField as MuiTextField,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Password as PasswordIcon,
  Call as CallIcon,
  Assignment as AssignmentIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from "@mui/icons-material";

import Loader from "@/components/common/Loader";
import Toast from "@/components/common/Toast";
import validationSchema from "./ValidationSchema";
import { AppDispatch, RootState } from "@/redux/store";
import { fetcher } from "@/apis/apiClient";
import { useCreateDoctor, useModifyDoctor } from "@/hooks/doctor";
import { Utility } from "@/utils";
import { DoctorData } from "@/types/doctor";

interface DoctorResponse {
  statusCode: string | number;
  message: string;
  data: DoctorData;
}

const initialValues: Partial<DoctorData> = {
  username: "",
  email: "",
  password: "",
  contact: "",
  bio: "",
};

let editFormValues: Partial<DoctorData>;

// eslint-disable-next-line react/function-component-definition
const DoctorForm: React.FC = () => {
  const [title, setTitle] = useState<"Create Doctor" | "Edit Doctor">();
  const [loading, setLoading] = useState<boolean>(false);
  const [formValues, setFormValues] = useState(initialValues);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [updatePassword, setUpdatePassword] = useState<boolean>(false);
  const pwFieldRef = useRef<HTMLInputElement | null>(null);
  const emailFieldRef = useRef<HTMLInputElement | null>(null);

  const params = useParams();
  const router = useRouter();
  const dispatch: AppDispatch = useDispatch();
  const { toast } = useSelector((state: RootState) => state.toast);
  const { createDoctor } = useCreateDoctor("create-doctor");
  const { modifyDoctor } = useModifyDoctor("update-doctor");
  const { decodedToken, toastAndNavigate } = Utility();
  const doctorId = params?.id;

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
  }, [doctorId]);

  const create = useCallback(
    async (values: Partial<DoctorData>) => {
      setLoading(true);
      try {
        const response = await createDoctor({
          ...values,
          createdBy: decodedToken().id,
        });
        if (response?.statusCode === 409) {
          toastAndNavigate(
            dispatch,
            true,
            "error",
            "Email already exists, please edit the email",
            () => emailFieldRef?.current?.focus()
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
    [createDoctor, decodedToken, dispatch, router, toastAndNavigate]
  );

  const populateData = useCallback(async (doctorId: string | string[]) => {
    setLoading(true);
    try {
      const response: DoctorResponse = await fetcher(
        "doctor",
        `get-doctor-by-id/${doctorId}`
      );
      if (response?.statusCode === 200) {
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
        if (!updatePassword) {
          delete values.password;
        }

        const response = await modifyDoctor(values);
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
    [dispatch, modifyDoctor, router, toastAndNavigate, updatePassword]
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
                inputRef={emailFieldRef}
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
