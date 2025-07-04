import * as React from "react";
import { Box } from "@mui/system";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { ArrowDownward as ArrowDownIcon } from "@mui/icons-material";
import { ArrowUpward as ArrowUpIcon } from "@mui/icons-material";
import { Stack } from "@mui/material";
import { SxProps } from "@mui/material/styles";

interface StatCardProps {
  value: string;
  diff?: number;
  trend: "up" | "down";
  Icon: React.ComponentType;
  title: string;
  iconColor?: string;
  sx?: SxProps;
}

export function StatCard({
  value,
  diff = 0,
  trend,
  Icon,
  title,
  iconColor = "#14B8A6",
  sx,
}: StatCardProps): React.JSX.Element {
  const arrowColor = trend === "up" ? "rgb(84, 214, 44)" : "rgb(255, 69, 58)";
  const isDoctor = (sx as any)?.isDoctor || false;

  return (
    <Card
      sx={{
        ...sx,
        borderRadius: 3,
        boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "scale(1.02)", 
          boxShadow: "0px 6px 15px rgba(0, 0, 0, 0.08)", 
          zIndex: 10,
        },
      }}
    >
      <CardContent sx={{ padding: 3 }}>
        {title === "PENDING APPOINTMENTS" && isDoctor ? (
          <Typography
            color="text.secondary"
            variant="subtitle2"
            sx={{
              fontWeight: 500,
              mb: 1,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "flex",
              alignItems: "center",
            }}
          >
            Pending Appointments
          </Typography>
        ) : title === "PENDING APPOINTMENTS" ? (
          <>
            <Typography
              color="text.secondary"
              variant="subtitle2"
              sx={{
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              PENDING
            </Typography>
            <Typography
              color="text.secondary"
              variant="subtitle2"
              sx={{
                fontWeight: 500,
                mb: 1,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              APPOINTMENTS
            </Typography>
          </>
        ) : (
          <Typography
            color="text.secondary"
            variant="subtitle2"
            sx={{
              fontWeight: 500,
              mb: 1,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            {title}
          </Typography>
        )}

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 1.5,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              fontSize: "2rem",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                backgroundColor: iconColor,
                borderRadius: "50%",
                width: 48,
                height: 48,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                mr: 1,
              }}
            >
              <Icon sx={{ fontSize: 24 }} />
            </Box>
            {value}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 4 }}>
          {trend === "up" ? (
            <ArrowUpIcon sx={{ color: arrowColor, fontSize: "1.25rem" }} />
          ) : (
            <ArrowDownIcon sx={{ color: arrowColor, fontSize: "1.25rem" }} />
          )}
          <Typography
            component="span"
            sx={{
              color: arrowColor,
              fontWeight: 600,
              fontSize: "0.875rem",
            }}
          >
            {diff}%
          </Typography>
          <Typography
            color="text.secondary"
            sx={{
              fontSize: "0.875rem",
            }}
          >
            Since last month
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
