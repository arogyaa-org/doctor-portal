"use client";

import Link from "next/link";
import { Box, Typography } from "@mui/material";
import { SxProps } from "@mui/system";

type Props = {
  appName?: string;
  primaryCtaLabel?: string; // "Agree & Join"
  continueLabel?: string; // "Continue with Google"
  termsHref?: string;
  privacyHref?: string;
  cookieHref?: string; // optional
  align?: "left" | "center";
  openInNewTab?: boolean; // default true
  prefetch?: boolean; // default false
  ariaId?: string; // id read by screen readers
  sx?: SxProps; // optional extra styles
};

export default function LegalConsentInline({
  appName = "Arogyaa",
  primaryCtaLabel = "Agree & Join",
  continueLabel = "Continue with Google",
  termsHref = "/legal/terms",
  privacyHref = "/legal/privacy",
  cookieHref,
  align = "left",
  openInNewTab = true,
  prefetch = false,
  ariaId = "legal-consent",
  sx,
}: Props) {
  const target = openInNewTab ? "_blank" : undefined;
  const rel = openInNewTab ? "noopener noreferrer" : undefined;

  const linkStyles = {
    color: "#4ade80", // Light green that pops on dark teal
    textDecoration: "underline",
    textDecorationColor: "rgba(74, 222, 128, 0.5)", // Semi-transparent underline
    fontWeight: 500,
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      color: "#22d3ee", // Bright cyan on hover
      textDecorationColor: "#22d3ee",
      textShadow: "0 0 8px rgba(34, 211, 238, 0.3)", // Subtle glow effect
    },
    "&:focus": {
      outline: "2px solid #22d3ee",
      outlineOffset: "2px",
      borderRadius: "2px",
    },
  };

  return (
    <Box sx={{ textAlign: align, mt: 1.5, ...sx }}>
      <Typography
        id={ariaId}
        variant="caption"
        sx={{
          backgroundColor: "transparent",
          color: "rgba(255, 255, 255, 0.9)", // Slightly transparent white for softer look
          lineHeight: 1.4,
          "& a": linkStyles,
        }}
      >
        By clicking <strong>{primaryCtaLabel}</strong>
        {continueLabel ? (
          <>
            {" "}
            or <strong>{continueLabel}</strong>
          </>
        ) : null}
        , you agree to the {appName}{" "}
        <Link href={termsHref} target={target} rel={rel} prefetch={prefetch}>
          User Agreement
        </Link>
        ,{" "}
        <Link href={privacyHref} target={target} rel={rel} prefetch={prefetch}>
          Privacy Policy
        </Link>
        {cookieHref ? (
          <>
            , and{" "}
            <Link
              href={cookieHref}
              target={target}
              rel={rel}
              prefetch={prefetch}
            >
              Cookie Policy
            </Link>
          </>
        ) : null}
        .
      </Typography>
    </Box>
  );
}
