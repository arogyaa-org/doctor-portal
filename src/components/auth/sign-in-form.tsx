"use client";

import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircularProgress, Box, Stack, Paper } from "@mui/material";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import Typography from "@mui/material/Typography";
import { Controller, useForm } from "react-hook-form";
import { z as zod } from "zod";
import Toast from "@/components/common/Toast";
import { AppDispatch, RootState } from "@/redux/store";
import { creator } from "@/apis/apiClient";
import { Utility } from "@/utils";

// Icons (using appropriate icons based on what's available in your project)
// If you don't have these specific icons, you can replace them with icons from your current setup
import { ArrowBack, Visibility } from "@mui/icons-material";
import { VisibilityOff } from "@mui/icons-material";
import { MedicalServices } from "@mui/icons-material";
import { AdminPanelSettings } from "@mui/icons-material";
// Fallback if icons import fails
// const EyeIcon = () => <span>👁️</span>;
// const EyeSlashIcon = () => <span>👁️‍🗨️</span>;

interface DoctorResponse {
  statusCode: number;
  message: string;
  token?: string | null;
}

const schema = zod.object({
  email: zod.string().min(1, { message: "Email is required" }).email(),
  password: zod.string().min(8, { message: "Minimum Length should be 8" }),
});

type Values = zod.infer<typeof schema>;

const defaultValues = {
  email: "john.doe@example.com",
  password: "John@123",
} satisfies Values;

interface SignInFormProps {
  clientRole: string | null;
  setClientRole: React.Dispatch<React.SetStateAction<string | null>>;
}

export function SignInForm({
  clientRole,
  setClientRole,
}: SignInFormProps): React.JSX.Element {
  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(false);
  const { toast } = useSelector((state: RootState) => state.toast);
  const [typingText, setTypingText] = React.useState<string>("");
  const [currentWordIndex, setCurrentWordIndex] = React.useState<number>(0);
  const [isDeleting, setIsDeleting] = React.useState<boolean>(false);

  const router = useRouter();
  const dispatch: AppDispatch = useDispatch();
  const { capitalizeFirstLetter, decodedToken, toastAndNavigate } = Utility();

  // This effect is used to update the typing text for the Layout component
  // Words to animate on the right side panel
  const words = [
    "Empowering Healthcare...",
    "Managing Appointments...",
    "Tracking Patients...",
    "Analyzing Symptoms...",
    "Providing Better Care...",
  ];

  // Typing animation effect
  React.useEffect(() => {
    // Only run the animation when client role is set (to avoid unnecessary animations)
    if (!clientRole) return;

    const currentWord = words[currentWordIndex];
    const typingSpeed = isDeleting ? 50 : 150;
    const pauseDelay = 2000;

    if (!isDeleting && typingText === currentWord) {
      // Pause at the end of typing
      const timeout = setTimeout(() => {
        setIsDeleting(true);
      }, pauseDelay);
      return () => clearTimeout(timeout);
    } else if (isDeleting && typingText === "") {
      // Move to the next word
      setIsDeleting(false);
      setCurrentWordIndex((prev) => (prev + 1) % words.length);
      const timeout = setTimeout(() => {}, 500);
      return () => clearTimeout(timeout);
    }

    const timeout = setTimeout(() => {
      setTypingText((prev) => {
        if (isDeleting) {
          return prev.substring(0, prev.length - 1);
        } else {
          return currentWord.substring(0, prev.length + 1);
        }
      });
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [typingText, isDeleting, currentWordIndex, words, clientRole]);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isDirty },
  } = useForm<Values>({
    defaultValues,
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const onSubmit = React.useCallback(
    async (values: Values): Promise<void> => {
      console.log(clientRole, "clientrole");
      setLoading(true);

      try {
        const response: DoctorResponse = await creator(
          clientRole === "admin" ? "user" : clientRole,
          "/login",
          {
            email: values.email,
            password: values.password,
          }
        );
        console.log(response, "this is response from login");
        if (response?.statusCode === 200) {
          document.cookie = `token=${response.token}; path=/; max-age=${1 * 24 * 60 * 60}; secure; samesite=strict`;
          router.push("/dashboard");
        } else if (
          response?.statusCode === 409 ||
          response?.statusCode === 404
        ) {
          toastAndNavigate(dispatch, true, "error", "User not found");
          setTimeout(() => {
            setLoading(false);
          }, 2200);
        } else if (response?.statusCode === 400) {
          toastAndNavigate(dispatch, true, "error", "Invalid Password");
          setTimeout(() => {
            setLoading(false);
          }, 2200);
        }
      } catch (error) {
        console.error("Login failed", error);
        toastAndNavigate(
          dispatch,
          true,
          "error",
          "An error occurred. Please Try Again"
        );
        setTimeout(() => {
          setLoading(false);
        }, 2200);
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 12000);
      }
    },
    [decodedToken, clientRole, dispatch, router, toastAndNavigate]
  );

  return (
    <Box
      sx={{
        backgroundColor: "#f9f9f9",
        padding: 4,
        borderRadius: 2,
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
        maxWidth: 450,
        margin: "auto",
        transform: "translateY(-20px)",
      }}
    >
      <Stack spacing={2}>
        {!clientRole ? (
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="h5"
              sx={{ mb: 4, fontWeight: 600, color: "#122647" }}
            >
              Choose your role
            </Typography>

            <Button
              variant="contained"
              sx={{
                px: 4,
                py: 1.5,
                mb: 2,
                borderRadius: 2,
                backgroundColor: "#15b79e",
                "&:hover": { backgroundColor: "#129985" },
                boxShadow: "0 4px 14px 0 rgba(21, 183, 158, 0.4)",
                width: "100%",
                transition: "all 0.3s ease",
              }}
              startIcon={<MedicalServices />}
              onClick={() => setClientRole("doctor")}
            >
              Login as Doctor
            </Button>

            <Button
              variant="contained"
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 2,
                backgroundColor: "#122647",
                "&:hover": { backgroundColor: "#0a1a38" },
                boxShadow: "0 4px 14px 0 rgba(18, 38, 71, 0.4)",
                width: "100%",
                transition: "all 0.3s ease",
              }}
              startIcon={<AdminPanelSettings />}
              onClick={() => setClientRole("admin")}
            >
              Login as Admin
            </Button>
          </Box>
        ) : (
          <Stack spacing={2}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 2,
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontWeight: "bold",
                  color: clientRole === "admin" ? "#122647" : "#15b79e",
                }}
              >
                {capitalizeFirstLetter(clientRole)} Login
              </Typography>

              <Box
                sx={{
                  backgroundColor:
                    clientRole === "admin" ? "#122647" : "#15b79e",
                  borderRadius: "50%",
                  width: 40,
                  height: 40,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                }}
              >
                {clientRole === "admin" ? (
                  <AdminPanelSettings fontSize="small" />
                ) : (
                  <MedicalServices fontSize="small" />
                )}
              </Box>
            </Box>

            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={2.5}>
                <Controller
                  control={control}
                  name="email"
                  render={({ field }) => (
                    <FormControl
                      error={Boolean(errors.email)}
                      variant="outlined"
                    >
                      <InputLabel>*Email Address</InputLabel>
                      <OutlinedInput
                        {...field}
                        label="*Email address"
                        type="email"
                        sx={{ borderRadius: 1.5 }}
                      />
                      {errors.email ? (
                        <FormHelperText>{errors.email.message}</FormHelperText>
                      ) : null}
                    </FormControl>
                  )}
                />

                <Controller
                  control={control}
                  name="password"
                  render={({ field }) => (
                    <FormControl
                      error={Boolean(errors.password)}
                      variant="outlined"
                    >
                      <InputLabel>*Password</InputLabel>
                      <OutlinedInput
                        {...field}
                        endAdornment={
                          showPassword ? (
                            <Visibility
                              style={{ cursor: "pointer" }}
                              onClick={(): void => {
                                setShowPassword(false);
                              }}
                            />
                          ) : (
                            <VisibilityOff
                              style={{ cursor: "pointer" }}
                              onClick={(): void => {
                                setShowPassword(true);
                              }}
                            />
                          )
                        }
                        label="*Password"
                        type={showPassword ? "text" : "password"}
                        sx={{ borderRadius: 1.5 }}
                      />
                      {errors.password ? (
                        <FormHelperText>
                          {errors.password.message}
                        </FormHelperText>
                      ) : null}
                    </FormControl>
                  )}
                />

                <Typography align="right">
                  <Box
                    component="a"
                    href="/reset-password"
                    sx={{
                      textDecoration: "none",
                      color: clientRole === "admin" ? "#122647" : "#15b79e",
                      fontWeight: "bold",
                      fontSize: "0.875rem",
                    }}
                  >
                    Forgot password?
                  </Box>
                </Typography>

                <Button
                  disabled={loading}
                  type="submit"
                  variant="contained"
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    backgroundColor:
                      clientRole === "admin" ? "#122647" : "#15b79e",
                    "&:hover": {
                      backgroundColor:
                        clientRole === "admin" ? "#0a1a38" : "#129985",
                    },
                    boxShadow:
                      clientRole === "admin"
                        ? "0 4px 14px 0 rgba(18, 38, 71, 0.4)"
                        : "0 4px 14px 0 rgba(21, 183, 158, 0.4)",
                    transition: "all 0.3s ease",
                  }}
                >
                  {loading ? (
                    <CircularProgress size={22} color="inherit" />
                  ) : (
                    "Sign in"
                  )}
                </Button>

                <Button
                  variant="text"
                  onClick={() => setClientRole(null)}
                  sx={{
                    color: "#666",
                    "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
                  }}
                >
                  <ArrowBack sx={{ marginRight: 1 }} />
                  Back to Select the Role
                </Button>
              </Stack>
            </form>
          </Stack>
        )}
      </Stack>

      <Toast
        alerting={toast.toastAlert}
        severity={toast.toastSeverity}
        message={toast.toastMessage}
      />
    </Box>
  );
}
