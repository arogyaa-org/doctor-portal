import * as React from "react";
import RouterLink from "next/link";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { paths } from "@/paths";
import { DynamicLogo } from "@/components/core/logo"; // Correct import for DynamicLogo

export interface LayoutProps {
  children: React.ReactNode;
  clientRole: string | null;
}

export function Layout({
  children,
  clientRole,
}: LayoutProps): React.JSX.Element {
  // Animation states for typing effect
  const [typingText, setTypingText] = React.useState<string>("");
  const [currentWordIndex, setCurrentWordIndex] = React.useState<number>(0);
  const [isDeleting, setIsDeleting] = React.useState<boolean>(false);

  // Words to animate
  const words = [
    "Empowering Healthcare",
    "Managing Appointments",
    "Tracking Patients",
    "Analyzing Symptoms",
    "Providing Better Care",
  ];

  // Typing animation effect
  React.useEffect(() => {
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
      const timeout = setTimeout(() => { }, 500);
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
  }, [typingText, isDeleting, currentWordIndex, words]);

  return (
    <Box
      sx={{
        display: { xs: "flex", lg: "grid" },
        flexDirection: "column",
        gridTemplateColumns: "1fr 1fr",
        minHeight: "100%",
      }}
    >
      <Box sx={{ display: "flex", flex: "1 1 auto", flexDirection: "column" }}>
        <Box sx={{ p: 3 }}>
          <Box
            component={RouterLink}
            href={paths.home}
            sx={{ display: "inline-block", fontSize: 0 }}
          >
            <DynamicLogo
              colorDark="light" // Adjust based on theme (light or dark)
              colorLight="dark" // Adjust based on theme (dark or light)
              height={32}
              width={122}
              priority
            />
          </Box>
        </Box>
        <Box
          sx={{
            alignItems: "center",
            display: "flex",
            flex: "1 1 auto",
            justifyContent: "center",
            p: 3,
          }}
        >
          <Box sx={{ maxWidth: "450px", width: "100%" }}>{children}</Box>
        </Box>
      </Box>
      <Box
        sx={{
          alignItems: "center",
          background:
            "radial-gradient(50% 50% at 50% 50%, #122647 0%, #090E23 100%)",
          color: "var(--mui-palette-common-white)",
          display: { xs: "none", lg: "flex" },
          justifyContent: "center",
          p: 3,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background patterns */}
        <Box
          sx={{
            position: "absolute",
            width: "100%",
            height: "100%",
            opacity: 0.1,
            background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        {/* Animated circles */}
        <Box
          sx={{
            position: "absolute",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            backgroundColor: "rgba(21, 183, 158, 0.05)",
            top: "10%",
            right: "-50px",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            width: "200px",
            height: "200px",
            borderRadius: "50%",
            backgroundColor: "rgba(21, 183, 158, 0.05)",
            bottom: "10%",
            left: "-30px",
          }}
        />
        <Stack spacing={3} sx={{ position: "relative", zIndex: 1 }}>
          <Stack spacing={1}>
            {clientRole === "admin" ? (
              <Typography
                color="inherit"
                sx={{
                  fontSize: "28px",
                  lineHeight: "34px",
                  textAlign: "center",
                  paddingBottom: "10px",
                  fontWeight: 600,
                }}
                variant="h1"
              >
                Admin Management System
              </Typography>
            ) : (
              <Typography
                color="inherit"
                sx={{
                  fontSize: "30px",
                  lineHeight: "34px",
                  textAlign: "center",
                  paddingBottom: "10px",
                  fontWeight: 600,
                }}
                variant="h1"
              >
                Welcome to{" "}
                <Box component="span" sx={{ color: "#15b79e" }}>
                  Arogyaa's Doctor Portal
                </Box>
              </Typography>
            )}

            {/* Animated typing text */}
            <Box sx={{ height: "32px", textAlign: "center", mb: 2 }}>
              <Typography
                variant="h5"
                align="center"
                sx={{
                  display: "inline-block",
                  borderRight: "3px solid #15b79e",
                  paddingRight: "5px",
                  animation: "blink-caret 0.75s step-end infinite",
                  "@keyframes blink-caret": {
                    "from, to": { borderColor: "transparent" },
                    "50%": { borderColor: "#15b79e" },
                  },
                  whiteSpace: "nowrap",
                }}
              >
                {typingText}
              </Typography>
            </Box>

            <Typography
              align="center"
              variant="body1"
              sx={{
                opacity: 0.9,
                maxWidth: "80%",
                margin: "0 auto",
                lineHeight: 1.6,
              }}
            >
              A comprehensive platform for medical professionals and
              administrators to manage patient care efficiently and effectively.
            </Typography>
          </Stack>

          {/* Medical icon or dashboard visualization could go here */}
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <Box
              sx={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                backgroundColor: "rgba(255,255,255,0.03)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 30px rgba(0,0,0,0.1)",
                backdropFilter: "blur(5px)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              {/* You can replace this with an appropriate icon */}
              {/* <Box
                component="svg"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                sx={{ width: 60, height: 60, fill: "#15b79e" }}
              >
                <path
                  d="M8 2V5"
                  stroke="#15b79e"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16 2V5"
                  stroke="#15b79e"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M3.5 9.09H20.5"
                  stroke="#15b79e"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z"
                  stroke="#15b79e"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M15.6947 13.7H15.7037"
                  stroke="#15b79e"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M15.6947 16.7H15.7037"
                  stroke="#15b79e"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Box> */}
            </Box>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
