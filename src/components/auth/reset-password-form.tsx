"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box, Stack, Button, FormControl, FormHelperText, InputLabel, OutlinedInput,
  Typography, Alert, CircularProgress, ToggleButton, ToggleButtonGroup
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { z as zod } from "zod";
import { creator } from "@/apis/apiClient";
import { ArrowBack, Visibility, VisibilityOff } from "@mui/icons-material";
import Toast from "@/components/common/Toast";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { Utility } from "@/utils";

type ServiceKey = "doctor" | "user";

/* ---------------- UI bits ---------------- */
function HeaderStripe({ bg }: { bg: string }) {
  return (
    <Box sx={{
      bgcolor: bg, mx: -4, mt: -4, px: 4, py: 3,
      borderTopLeftRadius: 8, borderTopRightRadius: 8,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <img src="/assets/logomain.png" alt="Arogyaa" style={{ height: 80, width: "auto", objectFit: "contain" }} />
    </Box>
  );
}

/* ---------------- Schemas ---------------- */
const requestSchema = zod.object({
  email: zod.string().min(1, { message: "Email is required" }).email(),
  role: zod.enum(["doctor", "user"]),
});
type RequestValues = zod.infer<typeof requestSchema>;

const confirmSchema = zod.object({
  newPassword: zod.string().min(8, "Minimum length is 8 characters"),
  confirmPassword: zod.string().min(8, "Minimum length is 8 characters"),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});
type ConfirmValues = zod.infer<typeof confirmSchema>;

const sanitizeRole = (raw: string | null | undefined): ServiceKey =>
  raw?.toLowerCase() === "doctor" ? "doctor" : "user";

export function ResetPasswordForm(): React.JSX.Element {
  const sp = useSearchParams();
  const router = useRouter();
  const dispatch: AppDispatch = useDispatch();
  const { toast } = useSelector((state: RootState) => state.toast);

  const [initial, setInitial] = React.useState<{
    email: string; token: string; role: ServiceKey;
  } | null>(null);

  React.useEffect(() => {
    const email = sp.get("email") || "";
    const token = sp.get("token") || "";
    const role = sanitizeRole(sp.get("role"));
    setInitial({ email, token, role });

    if (typeof window !== "undefined") {
      window.history.replaceState({}, "", "/reset-password");
    }
  }, []);

  if (!initial) {
    return <Box sx={{ p: 4, textAlign: "center" }}>Loading…</Box>;
  }

  const isConfirmFlow = Boolean(initial.email && initial.token);
  const accent = initial.role === "doctor" ? "#15b79e" : "#122647";

  return (
    <Box sx={{
      backgroundColor: "#fff", p: 4, borderRadius: 2,
      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
      maxWidth: 450, m: "auto", transform: "translateY(-20px)",
      position: "relative", overflow: "hidden",
    }}>
      <Stack spacing={2}>
        <HeaderStripe bg={accent} />
        {isConfirmFlow ? (
          <ConfirmReset
            email={initial.email}
            token={initial.token}
            role={initial.role}
            onDone={() => router.push("/login")}
            accentColor={accent}
          />
        ) : (
          <RequestReset role={initial.role} accentColor={accent} />
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

/* ---------------- Request form ---------------- */
function RequestReset({ role, accentColor }: { role: ServiceKey; accentColor: string }) {
  const [isPending, setIsPending] = React.useState(false);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);
  const dispatch: AppDispatch = useDispatch();
  const { toastAndNavigate } = Utility();

  const { control, handleSubmit, formState: { errors } } = useForm<RequestValues>({
    defaultValues: { email: "", role },
    resolver: zodResolver(requestSchema),
  });

  const onSubmit = React.useCallback(async (values: RequestValues) => {
    setIsPending(true);
    setSuccessMsg(null);
    try {
      const path = values.role === "doctor"
        ? "/doctor/reset-password/request"
        : "/reset-password/request";
      await creator(values.role, path, { email: values.email });

      // Always generic to avoid email enumeration
      setSuccessMsg("If this email exists, a recovery link has been sent. Please check your inbox.");
      toastAndNavigate(dispatch, true, "success", "Recovery link has been sent to your email.");
    } finally {
      setIsPending(false);
    }
  }, [dispatch, toastAndNavigate]);

  return (
    <Stack spacing={2}>
      <Typography variant="h4" sx={{ fontWeight: "bold", color: accentColor, textAlign: "center", mb: 1 }}>
        Reset password
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Enter your registered email to receive a reset link.
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack spacing={2}>
          <Controller
            control={control}
            name="role"
            render={({ field }) => (
              <ToggleButtonGroup
                exclusive value={field.value} onChange={(_, v) => v && field.onChange(v)}
                size="small" aria-label="account type" color="primary" sx={{ justifyContent: "center" }}
              >
                <ToggleButton value="user" sx={{
                  borderRadius: 1.5,
                  "&.Mui-selected": { backgroundColor: accentColor, color: "#fff", "&:hover": { backgroundColor: accentColor } },
                }}>User</ToggleButton>
                <ToggleButton value="doctor" sx={{
                  borderRadius: 1.5,
                  "&.Mui-selected": { backgroundColor: accentColor, color: "#fff", "&:hover": { backgroundColor: accentColor } },
                }}>Doctor</ToggleButton>
              </ToggleButtonGroup>
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <FormControl error={Boolean(errors.email)}>
                <InputLabel>Email address</InputLabel>
                <OutlinedInput {...field} label="Email address" type="email" sx={{ borderRadius: 1.5 }} />
                <FormHelperText>{errors.email?.message}</FormHelperText>
              </FormControl>
            )}
          />

          {successMsg ? <Alert severity="success">{successMsg}</Alert> : null}

          <Stack direction="row" spacing={1.5} alignItems="center">
            <Button
              href="/login" variant="text"
              sx={{ color: "#666", "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" } }}
              startIcon={<ArrowBack />} type="button"
            >
              Back to Sign in
            </Button>
            <Box sx={{ flex: 1 }} />
            <Button
              disabled={isPending} type="submit" variant="contained"
              sx={{
                py: 1.5, borderRadius: 2, backgroundColor: accentColor,
                "&:hover": { backgroundColor: role === "user" ? "#0a1a38" : "#129985" },
                boxShadow: role === "user"
                  ? "0 4px 14px 0 rgba(18, 38, 71, 0.4)"
                  : "0 4px 14px 0 rgba(21, 183, 158, 0.4)",
                transition: "all 0.3s ease",
              }}
            >
              {isPending ? <CircularProgress size={22} color="inherit" /> : "Send recovery link"}
            </Button>
          </Stack>
        </Stack>
      </form>
    </Stack>
  );
}

/* ---------------- Confirm form ---------------- */
function ConfirmReset({
  email, token, role, onDone, accentColor,
}: {
  email: string; token: string; role: ServiceKey; onDone: () => void; accentColor: string;
}) {
  const [isPending, setIsPending] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const dispatch: AppDispatch = useDispatch();
  const { toastAndNavigate } = Utility();

  const { control, handleSubmit, formState: { errors } } = useForm<ConfirmValues>({
    resolver: zodResolver(confirmSchema),
  });

  const onSubmit = React.useCallback(async (values: ConfirmValues) => {
    setIsPending(true);
    setServerError(null);
    setSuccessMsg(null);
    try {
      const path = role === "doctor"
        ? "/doctor/reset-password/confirm"
        : "/reset-password/confirm";

      const res = await creator(role, path, { email, token, newPassword: values.newPassword });

      if (res?.statusCode === 200) {
        setSuccessMsg("Password updated successfully. Redirecting to sign in…");
        toastAndNavigate(dispatch, true, "success", "Password updated successfully.");
        setTimeout(onDone, 2000);
      } else {
        setServerError(res?.message || "Failed to reset password. Link may be invalid or expired.");
        toastAndNavigate(dispatch, true, "error", "Failed to reset password. Link may be invalid or expired.");
      }
    } catch {
      setServerError("Error resetting password. Please request a new link.");
      toastAndNavigate(dispatch, true, "error", "Error resetting password. Please request a new link.");
    } finally {
      setIsPending(false);
    }
  }, [email, token, role, onDone, dispatch, toastAndNavigate]);

  const labelRole = role === "doctor" ? "Doctor" : "User";

  return (
    <Stack spacing={2}>
      <Typography variant="h4" sx={{ fontWeight: "bold", color: accentColor, textAlign: "center", mb: 1 }}>
        Set a new password
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {labelRole} account • {email}
      </Typography>

      {serverError ? <Alert severity="error">{serverError}</Alert> : null}
      {successMsg ? <Alert severity="success">{successMsg}</Alert> : null}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack spacing={2.5}>
          <Controller
            name="newPassword"
            control={control}
            render={({ field }) => (
              <FormControl error={!!errors.newPassword}>
                <InputLabel>New password</InputLabel>
                <OutlinedInput
                  {...field}
                  type={showNewPassword ? "text" : "password"}
                  label="New password"
                  sx={{ borderRadius: 1.5 }}
                  endAdornment={
                    showNewPassword ? (
                      <Visibility style={{ cursor: "pointer" }} onClick={() => setShowNewPassword(false)} />
                    ) : (
                      <VisibilityOff style={{ cursor: "pointer" }} onClick={() => setShowNewPassword(true)} />
                    )
                  }
                />
                <FormHelperText>{errors.newPassword?.message}</FormHelperText>
              </FormControl>
            )}
          />

          <Controller
            name="confirmPassword"
            control={control}
            render={({ field }) => (
              <FormControl error={!!errors.confirmPassword}>
                <InputLabel>Confirm password</InputLabel>
                <OutlinedInput
                  {...field}
                  type={showConfirmPassword ? "text" : "password"}
                  label="Confirm password"
                  sx={{ borderRadius: 1.5 }}
                  endAdornment={
                    showConfirmPassword ? (
                      <Visibility style={{ cursor: "pointer" }} onClick={() => setShowConfirmPassword(false)} />
                    ) : (
                      <VisibilityOff style={{ cursor: "pointer" }} onClick={() => setShowConfirmPassword(true)} />
                    )
                  }
                />
                <FormHelperText>{errors.confirmPassword?.message}</FormHelperText>
              </FormControl>
            )}
          />

          <Stack direction="row" spacing={1.5} alignItems="center">
            <Button
              href="/login" variant="text"
              sx={{ color: "#666", "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" } }}
              startIcon={<ArrowBack />} type="button"
            >
              Back to Sign in
            </Button>
            <Box sx={{ flex: 1 }} />
            <Button
              disabled={isPending} type="submit" variant="contained"
              sx={{
                py: 1.5, borderRadius: 2, backgroundColor: accentColor,
                "&:hover": { backgroundColor: role === "user" ? "#0a1a38" : "#129985" },
                boxShadow: role === "user"
                  ? "0 4px 14px 0 rgba(18, 38, 71, 0.4)"
                  : "0 4px 14px 0 rgba(21, 183, 158, 0.4)",
                transition: "all 0.3s ease",
              }}
            >
              {isPending ? <CircularProgress size={22} color="inherit" /> : "Update password"}
            </Button>
          </Stack>
        </Stack>
      </form>
    </Stack>
  );
}