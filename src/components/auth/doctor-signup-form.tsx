"use client";

import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CircularProgress,
  Box,
  Stack,
  Button,
  Typography,
  Paper,
  Container,
  Fade,
  TextField,
  useTheme,
  alpha,
  InputAdornment,
  Chip,
  Avatar,
  Stepper,
  Step,
  StepLabel,
  Grid,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { z as zod } from "zod";
import Toast from "@/components/common/Toast";
import { AppDispatch, RootState } from "@/redux/store";
import { Utility } from "@/utils";
import {
  Phone,
  Email,
  Person,
  Description,
  CheckCircle,
  Security,
  Timer,
  LocalHospital,
} from "@mui/icons-material";
import { useEffect, useState, useRef } from "react";
import { auth, RecaptchaVerifier } from "@/utils/firebase";
import { signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import { usePublicDoctorSignup } from "@/hooks/doctor";

declare global {
  interface Window {
    recaptchaVerifier: import("firebase/auth").RecaptchaVerifier;
    confirmationResult: import("firebase/auth").ConfirmationResult;
  }
}

const otpSchema = zod.object({
  contact: zod
    .string()
    .min(10, { message: "Contact is required (10 digits)" })
    .regex(/^\d{10}$/, { message: "Enter a valid 10-digit phone number" }),
});

const signupSchema = zod.object({
  username: zod.string().min(1, { message: "Username is required" }),
  email: zod.string().min(1, { message: "Email is required" }).email(),
  contact: zod
    .string()
    .min(10, { message: "Contact is required (10 digits)" })
    .regex(/^\d{10}$/, { message: "Enter a valid 10-digit phone number" }),
  bio: zod.string().optional(),
});

type OtpValues = zod.infer<typeof otpSchema>;
type SignupValues = zod.infer<typeof signupSchema>;

interface DoctorSignupProps {
  clientRole: string | null;
  setClientRole: React.Dispatch<React.SetStateAction<string | null>>;
}

export function DoctorSignup({
  clientRole,
  setClientRole,
}: DoctorSignupProps): React.JSX.Element {
  const [step, setStep] = useState<
    "otpRequest" | "otpVerify" | "signupForm" | "verificationPending"
  >("otpRequest");
  const [contact, setContact] = useState<string>("");
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState<number>(120);
  const { toast } = useSelector((state: RootState) => state.toast);

  const theme = useTheme();
  const router = useRouter();
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [signupSubmitting, setSignupSubmitting] = useState(false);
  const dispatch: AppDispatch = useDispatch();
  const { toastAndNavigate } = Utility();
  const { signupDoctor, loading, error } = usePublicDoctorSignup(
    "public-signup-doctor"
  );

  const otpRefs = useRef<HTMLInputElement[]>([]);

  const {
    control: otpControl,
    handleSubmit: handleOtpSubmit,
    formState: { errors: otpErrors },
  } = useForm<OtpValues>({
    defaultValues: { contact: "" },
    resolver: zodResolver(otpSchema),
    mode: "onChange",
  });

  const {
    control: signupControl,
    handleSubmit: handleSignupSubmit,
    formState: { errors: signupErrors },
    reset,
  } = useForm<SignupValues>({
    defaultValues: { username: "", email: "", contact: "", bio: "" },
    resolver: zodResolver(signupSchema),
    mode: "onChange",
  });

  useEffect(() => {
    if (step === "signupForm" && contact) {
      reset({ username: "", email: "", contact, bio: "" });
    }
  }, [step, contact, reset]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === "otpVerify" && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else if (timer === 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  useEffect(() => {
    if (step === "otpRequest") {
      setTimer(120);
      if (window.confirmationResult) delete window.confirmationResult;
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        delete window.recaptchaVerifier;
      }
    }
  }, [step]);

  const setUpRecaptcha = async (phone: string): Promise<ConfirmationResult> => {
    // 🧼 Fully remove and recreate the container element
    const oldContainer = document.getElementById("recaptcha-container");
    if (oldContainer) {
      oldContainer.remove();
      const newContainer = document.createElement("div");
      newContainer.id = "recaptcha-container";
      newContainer.style.display = "none";
      document.body.appendChild(newContainer); // Append outside React control
    }

    // ✅ Create verifier
    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      {
        size: "invisible",
        callback: () => {},
        "expired-callback": () => {
          toastAndNavigate(
            dispatch,
            true,
            "error",
            "reCAPTCHA expired. Please try again."
          );
        },
      }
    );

    await window.recaptchaVerifier.render();

    return await signInWithPhoneNumber(
      auth,
      `+91${phone}`,
      window.recaptchaVerifier
    );
  };

  const handleOtpRequest = async (data: OtpValues) => {
    setOtpSending(true);
    try {
      const confirmationResult = await setUpRecaptcha(data.contact);
      window.confirmationResult = confirmationResult;
      setContact(data.contact);
      setStep("otpVerify");
      toastAndNavigate(
        dispatch,
        true,
        "success",
        "OTP sent to " + data.contact
      );
    } catch (err: any) {
      toastAndNavigate(
        dispatch,
        true,
        "error",
        err.message || "Failed to send OTP"
      );
    } finally {
      setOtpSending(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpVerifying(true);
    try {
      const otpString = otp.join("");
      const result = await window.confirmationResult.confirm(otpString);
      const idToken = await result.user.getIdToken();
      sessionStorage.setItem("firebase_id_token", idToken);
      setStep("signupForm");
      setContact(result.user.phoneNumber?.replace("+91", "") || "");
      toastAndNavigate(dispatch, true, "success", "OTP verified successfully");
    } catch (error: any) {
      toastAndNavigate(
        dispatch,
        true,
        "error",
        error.message || "OTP verification failed"
      );
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleSignup = async (data: SignupValues) => {
    setSignupSubmitting(true);
    try {
      const idToken = sessionStorage.getItem("firebase_id_token");
      if (!idToken) throw new Error("Missing Firebase ID token");

      await signupDoctor({ ...data, firebaseIdToken: idToken });
      toastAndNavigate(
        dispatch,
        true,
        "success",
        "Details submitted successfully"
      );
      setStep("verificationPending");
    } catch (error: any) {
      console.error("Signup Error:", error);
      let errorMessage = "An error occurred during signup";
      if (error.name === "HTTP409") {
        errorMessage =
          error.message || "Doctor with this phone number already exists";
      } else if (error.message) {
        errorMessage = error.message;
      }
      toastAndNavigate(dispatch, true, "error", errorMessage);
    } finally {
      setSignupSubmitting(false);
    }
  };

  const getActiveStep = () => {
    switch (step) {
      case "otpRequest":
        return 0;
      case "otpVerify":
        return 1;
      case "signupForm":
        return 2;
      case "verificationPending":
        return 3;
      default:
        return 0;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const steps = ["Phone", "Verify", "Details", "Done"];

  return (
    <Box sx={{ mt: -4, mb: 6 }}>
      <Fade in timeout={800}>
        <Paper
          elevation={24}
          sx={{
            borderRadius: 6,
            overflow: "hidden",
            background: "white",
            border: `1px solid ${alpha(theme.palette.grey[200], 0.5)}`,
            boxShadow: "0 32px 64px rgba(0, 0, 0, 0.1)",
          }}
        >
          {/* Header with Gradient */}
          <Box
            sx={{
              background: "linear-gradient(135deg, #14b8a6 0%, #0891b2 100%)",
              px: 1,
              py: 0.5,
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background:
                  "linear-gradient(135deg, rgba(20, 184, 166, 0.2) 0%, rgba(8, 145, 178, 0.2) 100%)",
                animation: "pulse 2s ease-in-out infinite alternate",
              },
            }}
          >
            <Box sx={{ position: "relative", zIndex: 1 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: "rgba(255, 255, 255, 0.2)",
                  backdropFilter: "blur(10px)",
                  borderRadius: 4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 2,
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                }}
              >
                <LocalHospital sx={{ fontSize: 40, color: "white" }} />
              </Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: "white",
                  mb: 1,
                }}
              >
                Doctor Signup
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "rgba(255, 255, 255, 0.9)",
                  fontSize: "0.875rem",
                }}
              >
                Join our healthcare network
              </Typography>
            </Box>
          </Box>

          {/* Progress Stepper */}
          <Box
            sx={{
              px: 1,
              py: 1,
              bgcolor: alpha(theme.palette.grey[50], 0.8),
              borderBottom: `1px solid ${alpha(theme.palette.grey[200], 0.5)}`,
            }}
          >
            <Stepper activeStep={getActiveStep()} alternativeLabel>
              {steps.map((label, index) => (
                <Step key={label}>
                  <StepLabel
                    sx={{
                      "& .MuiStepIcon-root": {
                        color:
                          index <= getActiveStep()
                            ? "#14b8a6"
                            : theme.palette.grey[300],
                        "&.Mui-active": {
                          color: "#14b8a6",
                        },
                        "&.Mui-completed": {
                          color: "#14b8a6",
                        },
                      },
                      "& .MuiStepLabel-label": {
                        fontSize: "0.75rem",
                        fontWeight: 500,
                        color:
                          index <= getActiveStep()
                            ? "#14b8a6"
                            : theme.palette.grey[500],
                        "&.Mui-active": {
                          color: "#14b8a6",
                        },
                        "&.Mui-completed": {
                          color: "#14b8a6",
                        },
                      },
                    }}
                  >
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          {/* Form Content */}
          <Box sx={{ px: 2, py: 1 }}>
            {/* OTP Request Form */}
            {step === "otpRequest" && (
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: "text.primary",
                    mb: 1,
                  }}
                >
                  Enter Phone Number
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    mb: 4,
                  }}
                >
                  We'll send you a verification code
                </Typography>

                <form onSubmit={handleOtpSubmit(handleOtpRequest)}>
                  <Stack spacing={3}>
                    <Controller
                      control={otpControl}
                      name="contact"
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Phone Number"
                          placeholder="Enter 10-digit phone number"
                          type="tel"
                          fullWidth
                          error={Boolean(otpErrors.contact)}
                          helperText={
                            otpErrors.contact?.message ||
                            "Format: 10 digits without country code"
                          }
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Phone sx={{ color: "text.secondary" }} />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 4,
                              py: 0.2,
                              fontSize: "1.125rem",
                              fontWeight: 500,
                              "& fieldset": {
                                borderWidth: 2,
                              },
                              "&:hover fieldset": {
                                borderColor: "#14b8a6",
                              },
                              "&.Mui-focused fieldset": {
                                borderColor: "#14b8a6",
                              },
                            },
                          }}
                        />
                      )}
                    />

                    <Button
                      disabled={loading}
                      type="submit"
                      variant="contained"
                      size="large"
                      sx={{
                        py: 2,
                        borderRadius: 4,
                        fontSize: "1.125rem",
                        fontWeight: 600,
                        background:
                          "linear-gradient(135deg, #14b8a6 0%, #0891b2 100%)",
                        boxShadow: "0 8px 32px rgba(20, 184, 166, 0.3)",
                        "&:hover": {
                          background:
                            "linear-gradient(135deg, #0d9488 0%, #0e7490 100%)",
                          transform: "translateY(-2px)",
                          boxShadow: "0 12px 40px rgba(20, 184, 166, 0.4)",
                        },
                        "&:disabled": {
                          opacity: 0.5,
                        },
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                    >
                      {otpSending ? (
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <CircularProgress size={20} color="inherit" />
                          <span>Sending OTP...</span>
                        </Box>
                      ) : (
                        "Send OTP"
                      )}
                    </Button>
                  </Stack>
                </form>
              </Box>
            )}

            {/* OTP Verification Form */}
            {step === "otpVerify" && (
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 600,
                    color: "text.primary",
                    mb: 1,
                  }}
                >
                  Verify OTP
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    mb: 4,
                  }}
                >
                  Enter the 6-digit code sent to +91 {contact}
                </Typography>

                <form onSubmit={handleOtpVerify}>
                  <Stack spacing={3}>
                    {/* OTP Input Boxes */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        gap: 1.5,
                        mb: 3,
                      }}
                    >
                      {otp.map((digit, index) => (
                        <TextField
                          key={index}
                          inputRef={(el) => (otpRefs.current[index] = el)}
                          value={digit}
                          onChange={(e) =>
                            handleOtpChange(index, e.target.value)
                          }
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          inputProps={{
                            maxLength: 1,
                            style: {
                              textAlign: "center",
                              fontSize: "1.5rem",
                              fontWeight: 700,
                              padding: "16px 8px",
                            },
                          }}
                          sx={{
                            width: 56,
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 3,
                              backgroundColor: alpha(
                                theme.palette.grey[50],
                                0.8
                              ),
                              "& fieldset": {
                                borderWidth: 2,
                              },
                              "&:hover fieldset": {
                                borderColor: "#14b8a6",
                              },
                              "&.Mui-focused": {
                                backgroundColor: "white",
                                "& fieldset": {
                                  borderColor: "#14b8a6",
                                },
                              },
                            },
                          }}
                        />
                      ))}
                    </Box>

                    {/* Timer */}
                    <Box
                      sx={{ display: "flex", justifyContent: "center", mb: 3 }}
                    >
                      <Chip
                        icon={<Timer />}
                        label={`Time remaining: ${formatTime(timer)}`}
                        color={timer > 30 ? "success" : "warning"}
                        variant="outlined"
                        sx={{
                          borderRadius: 3,
                          px: 2,
                          py: 1,
                          fontWeight: 500,
                        }}
                      />
                    </Box>

                    <Button
                      disabled={
                        loading || otp.join("").length !== 6 || timer === 0
                      }
                      type="submit"
                      variant="contained"
                      size="large"
                      sx={{
                        py: 2,
                        borderRadius: 4,
                        fontSize: "1.125rem",
                        fontWeight: 600,
                        background:
                          "linear-gradient(135deg, #14b8a6 0%, #0891b2 100%)",
                        boxShadow: "0 8px 32px rgba(20, 184, 166, 0.3)",
                        "&:hover": {
                          background:
                            "linear-gradient(135deg, #0d9488 0%, #0e7490 100%)",
                          transform: "translateY(-2px)",
                          boxShadow: "0 12px 40px rgba(20, 184, 166, 0.4)",
                        },
                        "&:disabled": {
                          opacity: 0.5,
                        },
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                    >
                      {otpVerifying ? (
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <CircularProgress size={20} color="inherit" />
                          <span>Verifying...</span>
                        </Box>
                      ) : (
                        "Verify OTP"
                      )}
                    </Button>

                    <Button
                      onClick={() => {
                        setStep("otpRequest");
                        setOtp(["", "", "", "", "", ""]);
                      }}
                      sx={{
                        color: "#14b8a6",
                        fontWeight: 500,
                        "&:hover": {
                          color: "#0d9488",
                        },
                      }}
                    >
                      Change Phone Number
                    </Button>
                  </Stack>
                </form>
              </Box>
            )}

            {/* Signup Form */}
            {step === "signupForm" && (
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 600,
                    color: "text.primary",
                    mb: 2,
                  }}
                >
                  Complete Profile
                </Typography>

                <form onSubmit={handleSignupSubmit(handleSignup)}>
                  <Stack spacing={3}>
                    <Controller
                      control={signupControl}
                      name="username"
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Full Name"
                          placeholder="Dr. John Doe"
                          fullWidth
                          required
                          error={Boolean(signupErrors.username)}
                          helperText={signupErrors.username?.message}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Person sx={{ color: "text.secondary" }} />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 3,
                              "& fieldset": {
                                borderWidth: 2,
                              },
                              "&:hover fieldset": {
                                borderColor: "#14b8a6",
                              },
                              "&.Mui-focused fieldset": {
                                borderColor: "#14b8a6",
                              },
                            },
                          }}
                        />
                      )}
                    />

                    <Controller
                      control={signupControl}
                      name="email"
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Email Address"
                          placeholder="doctor@example.com"
                          type="email"
                          fullWidth
                          required
                          error={Boolean(signupErrors.email)}
                          helperText={signupErrors.email?.message}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Email sx={{ color: "text.secondary" }} />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 3,
                              "& fieldset": {
                                borderWidth: 2,
                              },
                              "&:hover fieldset": {
                                borderColor: "#14b8a6",
                              },
                              "&.Mui-focused fieldset": {
                                borderColor: "#14b8a6",
                              },
                            },
                          }}
                        />
                      )}
                    />

                    <Controller
                      control={signupControl}
                      name="contact"
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Phone Number"
                          value={contact}
                          disabled
                          fullWidth
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Phone sx={{ color: "text.secondary" }} />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 3,
                              backgroundColor: alpha(
                                theme.palette.grey[50],
                                0.8
                              ),
                              "& fieldset": {
                                borderWidth: 2,
                              },
                            },
                          }}
                        />
                      )}
                    />

                    <Controller
                      control={signupControl}
                      name="bio"
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Bio (Optional)"
                          placeholder="Tell us about your specialization and experience..."
                          multiline
                          rows={4}
                          fullWidth
                          error={Boolean(signupErrors.bio)}
                          helperText={signupErrors.bio?.message}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment
                                position="start"
                                sx={{ alignSelf: "flex-start", mt: 1 }}
                              >
                                <Description sx={{ color: "text.secondary" }} />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 3,
                              "& fieldset": {
                                borderWidth: 2,
                              },
                              "&:hover fieldset": {
                                borderColor: "#14b8a6",
                              },
                              "&.Mui-focused fieldset": {
                                borderColor: "#14b8a6",
                              },
                            },
                          }}
                        />
                      )}
                    />

                    <Button
                      disabled={loading}
                      type="submit"
                      variant="contained"
                      size="large"
                      sx={{
                        py: 2,
                        borderRadius: 4,
                        fontSize: "1.125rem",
                        fontWeight: 600,
                        background:
                          "linear-gradient(135deg, #14b8a6 0%, #0891b2 100%)",
                        boxShadow: "0 8px 32px rgba(20, 184, 166, 0.3)",
                        "&:hover": {
                          background:
                            "linear-gradient(135deg, #0d9488 0%, #0e7490 100%)",
                          transform: "translateY(-2px)",
                          boxShadow: "0 12px 40px rgba(20, 184, 166, 0.4)",
                        },
                        "&:disabled": {
                          opacity: 0.5,
                        },
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                    >
                      {signupSubmitting ? (
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <CircularProgress size={20} color="inherit" />
                          <span>Creating Account...</span>
                        </Box>
                      ) : (
                        "Complete Signup"
                      )}
                    </Button>
                  </Stack>
                </form>
              </Box>
            )}

            {/* Verification Pending */}
            {step === "verificationPending" && (
              <Box sx={{ textAlign: "center" }}>
                <Avatar
                  sx={{
                    width: 96,
                    height: 96,
                    backgroundColor: "success.main",
                    mx: "auto",
                    mb: 3,
                    boxShadow: "0 8px 32px rgba(34, 197, 94, 0.3)",
                  }}
                >
                  <CheckCircle sx={{ fontSize: 48 }} />
                </Avatar>

                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 600,
                    color: "text.primary",
                    mb: 2,
                  }}
                >
                  Thank You!
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    color: "text.secondary",
                    mb: 4,
                    maxWidth: 400,
                    mx: "auto",
                  }}
                >
                  Your registration has been submitted successfully. Our team
                  will review your details and notify you via email within 24-48
                  hours.
                </Typography>

                <Paper
                  sx={{
                    p: 3,
                    backgroundColor: alpha(theme.palette.info.main, 0.1),
                    border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                    borderRadius: 3,
                    textAlign: "left",
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 600,
                      color: "info.main",
                      mb: 1,
                    }}
                  >
                    What's Next?
                  </Typography>
                  <Box component="ul" sx={{ m: 0, pl: 2, color: "info.main" }}>
                    <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                      Document verification by our team
                    </Typography>
                    <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                      Email confirmation with login credentials
                    </Typography>
                    <Typography component="li" variant="body2">
                      Access to your doctor dashboard
                    </Typography>
                  </Box>
                </Paper>

                <Button
                  onClick={() => {
                    setStep("otpRequest");
                    setContact("");
                    setOtp(["", "", "", "", "", ""]);
                    reset({ username: "", email: "", contact: "", bio: "" });
                  }}
                  sx={{
                    mt: 3,
                    color: "#14b8a6",
                    fontWeight: 500,
                    "&:hover": {
                      color: "#0d9488",
                    },
                  }}
                >
                  Register Another Doctor
                </Button>
              </Box>
            )}
          </Box>
        </Paper>
      </Fade>

      {/* Footer */}
      <Box sx={{ textAlign: "center", mt: 3 }}>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Already have an account?{" "}
          <Button
            variant="text"
            sx={{
              color: "#14b8a6",
              fontWeight: 600,
              textTransform: "none",
              "&:hover": {
                color: "#0d9488",
                backgroundColor: "transparent",
              },
            }}
          >
            Sign In
          </Button>
        </Typography>
      </Box>

      {/* Hidden reCAPTCHA container */}
      <div
        id="recaptcha-container"
        style={{ display: step === "otpRequest" ? "block" : "none" }}
      />

      {/* Toast Container */}
      <Box
        sx={{
          position: "fixed",
          top: 20,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1300,
          width: "auto",
          maxWidth: "90%",
        }}
      >
        <Toast
          alerting={toast.toastAlert}
          severity={toast.toastSeverity}
          message={toast.toastMessage}
        />
      </Box>
    </Box>
  );
}
