"use client";

import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircularProgress, Box, Link, Stack } from "@mui/material";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import Typography from "@mui/material/Typography";
import { Eye as EyeIcon } from "@phosphor-icons/react/dist/ssr/Eye";
import { EyeSlash as EyeSlashIcon } from "@phosphor-icons/react/dist/ssr/EyeSlash";
import { Controller, useForm } from "react-hook-form";
import { z as zod } from "zod";

import Toast from "@/components/common/Toast";
import { AppDispatch, RootState } from "@/redux/store";
import { useCreateDoctor } from "@/hooks/doctor";
import { Utility } from "@/utils";

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
  email: "john.doe@examplle.com",
  password: "John@123",
} satisfies Values;

export function SignInForm(): React.JSX.Element {
  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [toastAlert, setToastAlert] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState("");
  const [toastSeverity, setToastSeverity] = React.useState<"success" | "error">(
    "success"
  );

  const router = useRouter();
  const dispatch: AppDispatch = useDispatch();
  const { decodedToken } = Utility();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    defaultValues,
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const { createDoctor } = useCreateDoctor("/login");
  const onSubmit = React.useCallback(
    async (values: Values): Promise<void> => {
      setLoading(true);
      setToastAlert(false);
      try {
        const response: DoctorResponse | undefined = await createDoctor({
          email: values.email,
          password: values.password,
        });
        if (response?.statusCode === 200) {
          document.cookie = `token=${response.token}; path=/; max-age=${1 * 24 * 60 * 60}; secure; samesite=strict`;

          const role = decodedToken(response.token)?.role;
          if (role === "admin") {
            router.push("/dashboard");
          } else if (role === "doctor") {
            router.push("/dashboard/account");
          }
        } else if (response?.statusCode === 409) {
          setToastMessage("Doctor not found. Please check your email.");
          setToastSeverity("error");
          setToastAlert(true);
        } else if (
          response?.statusCode === 400 &&
          response.message === "Invalid id and password"
        ) {
          setToastMessage("Invalid id and password. Please try again.");
          setToastSeverity("error");
          setToastAlert(true);
        } else if (response?.statusCode === 400) {
          setToastMessage("Invalid password. Please try again.");
          setToastSeverity("error");
          setToastAlert(true);
        }
      } catch (error) {
        console.error("Login failed", error);
        setToastMessage("An unexpected error occurred. Please try again.");
        setToastSeverity("error");
        setToastAlert(true);
      } finally {
        setLoading(false);
      }
    },
    [decodedToken]
  );

  return (
    <>
      <Toast
        alerting={toastAlert}
        message={toastMessage}
        severity={toastSeverity}
      />

      <Box
        sx={{
          backgroundColor: "#f9f9f9",
          padding: 4,
          borderRadius: 2,
          boxShadow: 1,
          maxWidth: 500,
          margin: "auto",
          marginTop: 4,
          transform: "translateY(-30px)",
        }}
      >
        <Stack spacing={2}>
          <Typography variant="h4" align="center" sx={{ fontWeight: "bold" }}>
            Sign In
          </Typography>
          <Typography
            variant="h5"
            align="center"
            sx={{ fontWeight: "medium", color: "gray" }}
          >
            Welcome Back
          </Typography>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={2}>
              <Controller
                control={control}
                name="email"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.email)}>
                    <InputLabel>Email address</InputLabel>
                    <OutlinedInput
                      {...field}
                      label="Email address"
                      type="email"
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
                  <FormControl error={Boolean(errors.password)}>
                    <InputLabel>Password</InputLabel>
                    <OutlinedInput
                      {...field}
                      endAdornment={
                        showPassword ? (
                          <EyeIcon
                            cursor="pointer"
                            fontSize="var(--icon-fontSize-md)"
                            onClick={(): void => {
                              setShowPassword(false);
                            }}
                          />
                        ) : (
                          <EyeSlashIcon
                            cursor="pointer"
                            fontSize="var(--icon-fontSize-md)"
                            onClick={(): void => {
                              setShowPassword(true);
                            }}
                          />
                        )
                      }
                      label="Password"
                      type={showPassword ? "text" : "password"}
                    />
                    {errors.password ? (
                      <FormHelperText>{errors.password.message}</FormHelperText>
                    ) : null}
                  </FormControl>
                )}
              />
              {/* <Typography align="right">
                <Link
                  href="/reset-password"
                  variant="body2"
                  sx={{
                    textDecoration: "none",
                    color: "primary.main",
                    fontWeight: "bold",
                  }}
                >
                  Forgot password?
                </Link>
              </Typography> */}
              <Button disabled={loading} type="submit" variant="contained">
                {loading ? <CircularProgress size={22} /> : "Sign in"}
              </Button>
            </Stack>
          </form>
          <Alert color="warning">
            Use{" "}
            <Typography
              component="span"
              sx={{ fontWeight: 700 }}
              variant="inherit"
            >
              john.doe@examplle.com
            </Typography>{" "}
            with password{" "}
            <Typography
              component="span"
              sx={{ fontWeight: 700 }}
              variant="inherit"
            >
              John@123
            </Typography>
          </Alert>
        </Stack>
      </Box>
    </>
  );
}
