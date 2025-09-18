"use client";

import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircularProgress, Box, Stack } from "@mui/material";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import { Controller, useForm } from "react-hook-form";
import { z as zod } from "zod";
import Toast from "@/components/common/Toast";
import { AppDispatch, RootState } from "@/redux/store";
import { creator, fetcher } from "@/apis/apiClient";
import { Utility } from "@/utils";
import { ArrowBack, Visibility } from "@mui/icons-material";
import { VisibilityOff } from "@mui/icons-material";
import LegalConsentInline from "@/components/common/LegalConsentInline";

function HeaderStripe({ bg }: { bg: string }) {
  return (
    <Box
      sx={{
        bgcolor: bg,
        mx: -4, 
        mt: -4, 
        px: 4,
        py: 3,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <img
        src="/assets/logomain.png"
        alt="Arogyaa"
        style={{ height: 80, width: "auto", objectFit: "contain" }}
      />
    </Box>
  );
}

const resetSchema = zod.object({
  email: zod.string().min(1, { message: "Email is required" }).email(),
});
type ResetValues = zod.infer<typeof resetSchema>;

type ServiceKey = "doctor" | "user";

function ResetPasswordFormInline({
  onBack,
  accentColor = "#15b79e",
  service, 
}: {
  onBack: () => void;
  accentColor?: string;
  service: ServiceKey;
}): React.JSX.Element {
  const [isPending, setIsPending] = React.useState<boolean>(false);
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ResetValues>({
    defaultValues: { email: "" },
    resolver: zodResolver(resetSchema),
  });

  const dispatch: AppDispatch = useDispatch();
  const { toast } = useSelector((state: RootState) => state.toast);
  const { toastAndNavigate } = Utility();

  const onSubmit = React.useCallback(
    async (values: ResetValues): Promise<void> => {
      setIsPending(true);
      try {
        const path =
          service === "doctor"
            ? "/doctor/reset-password/request"
            : "/reset-password/request";

        await creator(service, path, { email: values.email });

        toastAndNavigate(
          dispatch,
          true,
          "success",
          "Recovery link has been sent to your email."
        );
      } catch {
        setError("root", {
          type: "server",
          message: "Failed to send recovery link. Try again.",
        });
        toastAndNavigate(
          dispatch,
          true,
          "error",
          "Failed to send recovery link. Try again."
        );
      } finally {
        setIsPending(false);
      }
    },
    [dispatch, setError, toastAndNavigate, service]
  );

  return (
    <Box sx={{ mt: 1 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Enter your registered email to receive a reset link.
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack spacing={2}>
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <FormControl error={Boolean(errors.email)}>
                <InputLabel>Email address</InputLabel>
                <OutlinedInput {...field} label="Email address" type="email" />
                {errors.email ? (
                  <FormHelperText>{errors.email.message}</FormHelperText>
                ) : null}
              </FormControl>
            )}
          />
          {errors.root?.message ? (
            <Alert severity="error">{errors.root?.message}</Alert>
          ) : null}

          <Stack direction="row" spacing={1.5} alignItems="center">
            <Button
              onClick={onBack}
              variant="text"
              sx={{
                color: "#666",
                "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
              }}
              startIcon={<ArrowBack />}
              type="button"
            >
              Back to Sign in
            </Button>
            <Box sx={{ flex: 1 }} />
            <Button
              disabled={isPending}
              type="submit"
              variant="contained"
              sx={{ backgroundColor: accentColor }}
            >
              {isPending ? "Sending…" : "Send recovery link"}
            </Button>
          </Stack>
        </Stack>
      </form>

      <Toast
        alerting={toast.toastAlert}
        severity={toast.toastSeverity}
        message={toast.toastMessage}
      />
    </Box>
  );
}

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

interface SignInFormProps {
  clientRole: string | null;
  setClientRole: React.Dispatch<React.SetStateAction<string | null>>;
}

type ConsentCheckRes = {
  exists: boolean;
  requireConsent: boolean;
  termsVersion?: string;
  privacyVersion?: string;
};

export function SignInForm({
  clientRole,
  setClientRole,
}: SignInFormProps): React.JSX.Element {
  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [needsConsent, setNeedsConsent] = React.useState<boolean>(false);
  const [showResetForm, setShowResetForm] = React.useState<boolean>(false);

  const { toast } = useSelector((state: RootState) => state.toast);

  const router = useRouter();
  const dispatch: AppDispatch = useDispatch();
  const { capitalizeFirstLetter, decodedToken, toastAndNavigate } = Utility();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const serviceKey: ServiceKey =
    clientRole === "admin" ||
    clientRole === "sub_admin" ||
    clientRole === "sales"
      ? "user"
      : "doctor";

  const doLogin = React.useCallback(
    async (values: Values) => {
      const response: DoctorResponse = await creator(serviceKey, "/login", {
        email: values.email,
        password: values.password,
      });

      const { role } = decodedToken(response.token);
      if (response?.statusCode === 200) {
        document.cookie = `token=${response.token}; path=/; max-age=${
          24 * 60 * 60
        }; secure; samesite=strict`;
        if (role === "sales") router.push("/sales-dashboard");
        else router.push("/dashboard");
      } else if (response?.statusCode === 409 || response?.statusCode === 404) {
        toastAndNavigate(dispatch, true, "error", "User not found");
      } else if (response?.statusCode === 400) {
        toastAndNavigate(dispatch, true, "error", "Invalid Password");
      } else {
        toastAndNavigate(
          dispatch,
          true,
          "error",
          "An error occurred. Please Try Again"
        );
      }
    },
    [serviceKey, decodedToken, dispatch, router, toastAndNavigate]
  );

  const onSubmit = React.useCallback(
    async (values: Values): Promise<void> => {
      setLoading(true);
      try {
        // Consent gate applies only to doctor
        if (serviceKey === "doctor") {
          if (!needsConsent) {
            const data = await fetcher<ConsentCheckRes>(
              "doctor",
              `/doctor/consent-required?email=${encodeURIComponent(values.email)}`
            );
            if (data?.exists && data?.requireConsent) {
              setNeedsConsent(true);
              toastAndNavigate(
                dispatch,
                true,
                "info",
                "Please agree to the latest Terms & Privacy to continue."
              );
              return;
            }
          } else {
            await creator("doctor", "/doctor/accept-consent", {
              email: values.email,
            } as any);
          }
        }
        await doLogin(values);
      } catch (error) {
        console.error("Login failed", error);
        toastAndNavigate(
          dispatch,
          true,
          "error",
          "An error occurred. Please Try Again"
        );
      } finally {
        setLoading(false);
      }
    },
    [
      serviceKey,
      creator,
      fetcher,
      needsConsent,
      doLogin,
      dispatch,
      toastAndNavigate,
    ]
  );

  const accent = clientRole === "admin" ? "#122647" : "#15b79e";

  return (
    <Box
      sx={{
        backgroundColor: "#fff",
        padding: 4,
        borderRadius: 2,
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
        maxWidth: 450,
        margin: "auto",
        transform: "translateY(-20px)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Stack spacing={2}>
        {!clientRole ? (
          <Box sx={{ textAlign: "center", mb: 2 }}>
            <HeaderStripe bg="#122647" />
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                color: "#122647",
                mt: 1.5,
                mb: 2,
                textAlign: "center",
              }}
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
              onClick={() => setClientRole("admin")}
            >
              Login as User
            </Button>
          </Box>
        ) : (
          <Stack spacing={2}>
            <HeaderStripe bg={accent} />

            <Typography
              variant="h4"
              sx={{
                fontWeight: "bold",
                color: accent,
                textAlign: "center",
                mb: 1,
              }}
            >
              {showResetForm
                ? "Reset password"
                : (clientRole !== "doctor"
                    ? "User"
                    : capitalizeFirstLetter(clientRole)) + " Login"}
            </Typography>

            {showResetForm ? (
              <ResetPasswordFormInline
                onBack={() => setShowResetForm(false)}
                accentColor={accent}
                service={serviceKey}
              />
            ) : (
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
                          <FormHelperText>
                            {errors.email.message}
                          </FormHelperText>
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
                                onClick={() => setShowPassword(false)}
                              />
                            ) : (
                              <VisibilityOff
                                style={{ cursor: "pointer" }}
                                onClick={() => setShowPassword(true)}
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
                      component="button"
                      onClick={() => setShowResetForm(true)}
                      type="button"
                      sx={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: accent,
                        fontWeight: "bold",
                        fontSize: "0.875rem",
                        p: 0,
                      }}
                    >
                      Forgot password?
                    </Box>
                  </Typography>

                  {serviceKey === "doctor" && needsConsent ? (
                  <Stack
                    direction="row"
                    justifyContent="center"    
                    alignItems="center"
                    sx={{
                     mt: -4,
                     typography: "caption",
                     color: "text.secondary",
                     "& *": { lineHeight: 1.4 },
                     "& a": {
                     display: "inline-block",
                     textDecoration: "none",
                     color: "inherit",
                     mx: 0.75,
                     "&:hover": { textDecoration: "underline" },
                     },
                     "& a + a::before": {
                     content: '"•"',
                     marginRight: "0.5rem",
                color: "divider",
              },
              }}
              >
                <LegalConsentInline
                   primaryCtaLabel="Agree & Sign in"
                   continueLabel=""
                   termsHref="/legal/terms"
                   privacyHref="/legal/privacy"
                   align="left"
                />
              </Stack>
                ) : null}
                  <Button
                    disabled={loading}
                    type="submit"
                    variant="contained"
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      backgroundColor: accent,
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
                    ) : needsConsent && serviceKey === "doctor" ? (
                      "Agree & Sign in"
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
            )}
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
