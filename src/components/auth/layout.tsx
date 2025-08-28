import * as React from "react";
import RouterLink from "next/link";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";

import { paths } from "@/paths";

export interface LayoutProps {
  children: React.ReactNode;
  clientRole: string | null;
}

export function Layout({
  children,
  clientRole,
}: LayoutProps): React.JSX.Element {
  const [typingText, setTypingText] = React.useState<string>("");
  const [currentWordIndex, setCurrentWordIndex] = React.useState<number>(0);
  const [isDeleting, setIsDeleting] = React.useState<boolean>(false);

  const words = [
    "Empowering Healthcare",
    "Managing Appointments",
    "Tracking Patients",
    "Analyzing Symptoms",
    "Providing Better Care",
  ];

  React.useEffect(() => {
    const currentWord = words[currentWordIndex];
    const typingSpeed = isDeleting ? 50 : 150;
    const pauseDelay = 2000;

    if (!isDeleting && typingText === currentWord) {
      const timeout = setTimeout(() => {
        setIsDeleting(true);
      }, pauseDelay);
      return () => clearTimeout(timeout);
    } else if (isDeleting && typingText === "") {
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

  const gradientBg =
    clientRole === "admin"
      ? "radial-gradient(50% 50% at 50% 50%, #122647 0%, #0d1030 100%)"
      : "radial-gradient(50% 50% at 50% 50%, #122647 0%, #090E23 100%)";

  const accentColor = clientRole === "admin" ? "#5c6bc0" : "#15b79e";

  return (
    <Box
      sx={{
        display: { xs: "flex", lg: "grid" },
        flexDirection: "column",
        gridTemplateColumns: "1fr 1fr",
        minHeight: "100%",
      }}
    >
      {/* Left side - Form content */}
      <Box
        sx={{
          display: "flex",
          flex: "1 1 auto",
          flexDirection: "column",
          backgroundColor: "var(--mui-palette-background-paper)",
          position: "relative",
        }}
      >
        {/* Logo container */}
        <Box
          sx={{
            p: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box
            component={RouterLink}
            href={paths.home}
            sx={{
              display: "inline-flex",
              alignItems: "center",
              transition: "transform 0.2s",
              "&:hover": {
                transform: "scale(1.05)",
              },
            }}
          >

            <img
              src="/assets/logomain.png"
              style={{
                height: '100px',
                width: '140px',
              }}
            />

          </Box>
        </Box>

        {/* Main content */}
        <Box
          sx={{
            alignItems: "center",
            display: "flex",
            flex: "1 1 auto",
            justifyContent: "center",
            p: { xs: 2, sm: 3 },
          }}
        >
          <Box
            sx={{
              maxWidth: "450px",
              width: "100%",
              animation: "fadeIn 0.6s ease-out",
              "@keyframes fadeIn": {
                "0%": { opacity: 0, transform: "translateY(10px)" },
                "100%": { opacity: 1, transform: "translateY(0)" },
              },
            }}
          >
            {children}
          </Box>
        </Box>

        {/* Footer */}
        <Box
          sx={{
            p: 3,
            textAlign: "center",
            color: "text.secondary",
            fontSize: "0.75rem",
            opacity: 0.7,
            mt: -10,
          }}
        >
          <Typography variant="caption">
            © 2025 Arogyaa Health Systems. All rights
            reserved.
          </Typography>
        </Box>
      </Box>

      {/* Right side - Branding & Animation */}
      <Box
        sx={{
          alignItems: "center",
          background: gradientBg,
          color: "var(--mui-palette-common-white)",
          display: { xs: "none", lg: "flex" },
          justifyContent: "center",
          p: 3,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Enhanced background patterns */}
        <Box
          sx={{
            position: "absolute",
            width: "100%",
            height: "100%",
            opacity: 0.07,
            background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Animated circles with pulses */}
        <Box
          sx={{
            position: "absolute",
            width: "350px",
            height: "350px",
            borderRadius: "50%",
            backgroundColor: `${alpha(accentColor, 0.05)}`,
            top: "10%",
            right: "-80px",
            animation: "pulse 15s infinite alternate ease-in-out",
            "@keyframes pulse": {
              "0%": { transform: "scale(1)" },
              "50%": { transform: "scale(1.1)" },
              "100%": { transform: "scale(1)" },
            },
          }}
        />

        <Box
          sx={{
            position: "absolute",
            width: "250px",
            height: "250px",
            borderRadius: "50%",
            backgroundColor: `${alpha(accentColor, 0.07)}`,
            bottom: "10%",
            left: "-50px",
            animation: "pulse2 18s infinite alternate-reverse ease-in-out",
            "@keyframes pulse2": {
              "0%": { transform: "scale(1)" },
              "50%": { transform: "scale(1.15)" },
              "100%": { transform: "scale(1)" },
            },
          }}
        />

        {/* Content stack */}
        <Stack
          spacing={4}
          sx={{
            position: "relative",
            zIndex: 1,
            maxWidth: "500px",
          }}
        >
          <Stack spacing={1}>
            {clientRole === "admin" ? (
              <Typography
                color="inherit"
                sx={{
                  fontSize: { xs: "26px", sm: "32px" },
                  lineHeight: 1.2,
                  textAlign: "center",
                  fontWeight: 700,
                  letterSpacing: "-0.5px",
                  textShadow: "0 2px 10px rgba(0,0,0,0.2)",
                  mb: 1,
                }}
                variant="h1"
              >
                Admin Management System
              </Typography>
            ) : (
              <Typography
                color="inherit"
                sx={{
                  fontSize: { xs: "20px", sm: "32px" },
                  lineHeight: 1.2,
                  textAlign: "center",
                  fontWeight: 700,
                  letterSpacing: "-0.5px",
                  textShadow: "0 2px 10px rgba(0,0,0,0.2)",
                  mb: 1,
                  whiteSpace: "nowrap",
                }}
                variant="h1"
              >
                Welcome to{" "}
                <Box
                  component="span"
                  sx={{
                    color: accentColor,
                    position: "relative",
                  }}
                >
                  Arogyaa's Doctor Portal
                </Box>
              </Typography>
            )}

            {/* Animated typing text - keeping your implementation */}
            <Box
              sx={{
                height: "40px",
                textAlign: "center",
                mb: 2,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Typography
                variant="h5"
                align="center"
                sx={{
                  display: "inline-block",
                  borderRight: `3px solid ${accentColor}`,
                  paddingRight: "5px",
                  animation: "blink-caret 0.75s step-end infinite",
                  "@keyframes blink-caret": {
                    "from, to": { borderColor: "transparent" },
                    "50%": { borderColor: accentColor },
                  },
                  whiteSpace: "nowrap",
                  minHeight: "32px",
                  fontWeight: 500,
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
                maxWidth: "85%",
                margin: "0 auto",
                lineHeight: 1.7,
                fontSize: "1rem",
                fontWeight: 400,
              }}
            >
              A comprehensive platform for medical professionals and
              administrators to manage patient care efficiently.
            </Typography>
          </Stack>

          {/* Enhanced medical icon with animation */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mt: 4,
            }}
          >
            {/* Medical icon */}
            <Box
              component="svg"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              sx={{
                width: 80,
                height: 80,
                fill: "none",
                stroke: accentColor,
                animation: "pulse3 3s infinite ease-in-out",
                "@keyframes pulse3": {
                  "0%": { transform: "scale(1)" },
                  "50%": { transform: "scale(1.05)" },
                  "100%": { transform: "scale(1)" },
                },
              }}
            >
              <path
                d="M8 2V5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16 2V5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M3.5 9.09H20.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 13.5H12.01"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M15.7 13.5H15.71"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M15.7 16.5H15.71"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 16.5H12.01"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8.3 13.5H8.31"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8.3 16.5H8.31"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Box>
          </Box>

          {/* Feature bullets */}
          <Box
            sx={{
              mt: 2,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Stack
              spacing={1}
              sx={{
                maxWidth: "400px",
                opacity: 0.9,
              }}
            >
              {["Real-time Updates", "Advanced Analytics"].map(
                (feature, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      justifyContent: "center",
                    }}
                  >
                    <Box
                      sx={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        bgcolor: accentColor,
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: "0.875rem",
                        letterSpacing: "0.5px",
                        fontWeight: 500,
                      }}
                    >
                      {feature}
                    </Typography>
                  </Box>
                )
              )}
            </Stack>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
