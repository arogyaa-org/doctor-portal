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

  return (
    <Box sx={{ textAlign: align, mt: 1.5, ...sx }}>
      <Typography
        id={ariaId}
        variant="caption"
        sx={{ color: "text.secondary", lineHeight: 1.6 }}
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
