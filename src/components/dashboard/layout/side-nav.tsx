"use client";

import * as React from "react";
import RouterLink from "next/link";
import { usePathname } from "next/navigation";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import type { NavItemConfig } from "@/types/nav";
import { paths } from "@/paths";
import { isNavItemActive } from "@/utils/is-nav-item-active";
import { Logo } from "@/components/core/logo";
import { Utility } from "@/utils";

import { useNavItems } from "./config";
import { navIcons } from "./nav-icons";

export function SideNav(): React.JSX.Element {
  const pathname = usePathname();
  const navItems = useNavItems();
  const role = Utility()?.decodedToken()?.role?.toString?.().toLowerCase?.();

  return (
    <Box
      sx={{
        "--SideNav-background": "var(--mui-palette-neutral-950)",
        "--SideNav-color": "var(--mui-palette-common-white)",
        "--NavItem-color": "var(--mui-palette-neutral-300)",
        "--NavItem-hover-background": "rgba(255, 255, 255, 0.04)",
        "--NavItem-active-background": "rgba(255, 255, 255, 0.1)",
        "--NavItem-active-color": "var(--mui-palette-primary-contrastText)",
        "--NavItem-disabled-color": "var(--mui-palette-neutral-500)",
        "--NavItem-icon-color": "var(--mui-palette-neutral-400)",
        "--NavItem-icon-active-color":
          "var(--mui-palette-primary-contrastText)",
        "--NavItem-icon-disabled-color": "var(--mui-palette-neutral-600)",
        bgcolor: "#090E23 !important",
        color: "var(--SideNav-color)",
        display: { xs: "none", lg: "flex" },
        flexDirection: "column",
        height: "100vh",
        left: 0,
        maxWidth: "100%",
        position: "fixed",
        top: 0,
        width: "var(--SideNav-width)",
        zIndex: "var(--SideNav-zIndex)",
        overflowY: "auto",
        overflowX: "hidden",
        "&::-webkit-scrollbar": { width: "6px" },
        "&::-webkit-scrollbar-track": { background: "#0b1126" },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "#3e4a6a",
          borderRadius: "8px",
        },
        scrollbarWidth: "thin",
        scrollbarColor: "#3e4a6a #0b1126",
      }}
    >
      <Stack sx={{ alignItems: "center" }}>
        <Box
          component={RouterLink}
          href={paths.home}
          sx={{ display: "inline-flex", justifyContent: "center" }}
        >
          <Logo color="light" height={122} width={142} />
        </Box>
      </Stack>

      <Box component="nav" sx={{ flex: "1 1 auto", p: "12px" }}>
        {role === "admin" ? (
          // Admin: divider after "user" and after "activeRooms"
          renderNavItemsWithAdminDividers({ pathname, items: navItems })
        ) : role === "operations" ? (
          // Operations: exactly one divider, after "doctor"
          renderNavItemsWithSingleDivider({
            pathname,
            items: navItems,
            afterKey: "doctor",
          })
        ) : (
          // Others: previous layout (first 4, optional divider if not sub_admin, rest)
          <>
            {renderNavItems({ pathname, items: navItems.slice(0, 4) })}

            {role !== "sub_admin" && (
              <Divider
                sx={{ borderColor: "var(--mui-palette-neutral-700)", my: 2 }}
              />
            )}

            {renderNavItems({ pathname, items: navItems.slice(4) })}
          </>
        )}
      </Box>
    </Box>
  );
}

function renderNavItems({
  items = [],
  pathname,
}: {
  items?: NavItemConfig[];
  pathname: string;
}): React.JSX.Element {
  const children = items.reduce(
    (acc: React.ReactNode[], curr: NavItemConfig): React.ReactNode[] => {
      const { key, ...item } = curr;
      acc.push(<NavItem key={key} pathname={pathname} {...item} />);
      return acc;
    },
    []
  );

  return (
    <Stack component="ul" spacing={1} sx={{ listStyle: "none", m: 0, p: 0 }}>
      {children}
    </Stack>
  );
}

// Admin renderer: dividers after "user" and "activeRooms"
function renderNavItemsWithAdminDividers({
  items = [],
  pathname,
}: {
  items?: NavItemConfig[];
  pathname: string;
}): React.JSX.Element {
  const children: React.ReactNode[] = [];

  items.forEach((curr, idx) => {
    const { key, ...item } = curr;

    children.push(<NavItem key={key} pathname={pathname} {...item} />);

    if ((key === "user" || key === "activeRooms") && idx < items.length - 1) {
      children.push(
        <Divider
          key={`${key}-divider`}
          sx={{ borderColor: "var(--mui-palette-neutral-700)", my: 2 }}
        />
      );
    }
  });

  return (
    <Stack component="ul" spacing={1} sx={{ listStyle: "none", m: 0, p: 0 }}>
      {children}
    </Stack>
  );
}

// Operations renderer: one divider only, inserted after `afterKey`
function renderNavItemsWithSingleDivider({
  items = [],
  pathname,
  afterKey,
}: {
  items?: NavItemConfig[];
  pathname: string;
  afterKey: string;
}): React.JSX.Element {
  const children: React.ReactNode[] = [];

  items.forEach((curr, idx) => {
    const { key, ...item } = curr;

    children.push(<NavItem key={key} pathname={pathname} {...item} />);

    if (key === afterKey && idx < items.length - 1) {
      children.push(
        <Divider
          key={`${key}-single-divider`}
          sx={{ borderColor: "var(--mui-palette-neutral-700)", my: 2 }}
        />
      );
    }
  });

  return (
    <Stack component="ul" spacing={1} sx={{ listStyle: "none", m: 0, p: 0 }}>
      {children}
    </Stack>
  );
}

interface NavItemProps extends Omit<NavItemConfig, "items"> {
  pathname: string;
}

function NavItem({
  disabled,
  external,
  href,
  icon,
  matcher,
  pathname,
  title,
}: NavItemProps): React.JSX.Element {
  const active = isNavItemActive({
    disabled,
    external,
    href,
    matcher,
    pathname,
  });
  const Icon = icon ? navIcons[icon] : null;

  return (
    <li>
      <Box
        {...(href
          ? {
              component: external ? "a" : RouterLink,
              href:
                paths.dashboard[href as keyof typeof paths.dashboard] || href,
              target: external ? "_blank" : undefined,
              rel: external ? "noreferrer" : undefined,
            }
          : { role: "button" })}
        sx={{
          alignItems: "center",
          borderRadius: 1,
          color: "var(--NavItem-color)",
          cursor: "pointer",
          display: "flex",
          flex: "0 0 auto",
          gap: 1,
          p: "6px 16px",
          position: "relative",
          textDecoration: "none",
          whiteSpace: "nowrap",
          transition: "background-color 0.3s ease, transform 0.3s ease",
          ...(disabled && {
            bgcolor: "var(--NavItem-disabled-background)",
            color: "black",
            cursor: "not-allowed",
          }),
          ...(active && {
            bgcolor: "var(--NavItem-active-background)",
            transform: "scale(1.03)",
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
            color: "var(--NavItem-active-color)",
          }),
          "&:hover": {
            bgcolor: "rgba(255, 255, 255, 0.1)",
            transform: "scale(1.03)",
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
          },
        }}
      >
        <Box
          sx={{
            alignItems: "center",
            display: "flex",
            justifyContent: "center",
            flex: "0 0 auto",
          }}
        >
          {Icon ? (
            <Icon
              fill={
                active
                  ? "var(--NavItem-icon-active-color)"
                  : "var(--NavItem-icon-color)"
              }
              fontSize="var(--icon-fontSize-md)"
              weight={active ? "fill" : undefined}
            />
          ) : null}
        </Box>
        <Box sx={{ flex: "1 1 auto" }}>
          <Typography
            component="span"
            sx={{
              color: "inherit",
              fontSize: "0.875rem",
              fontWeight: 500,
              lineHeight: "28px",
            }}
          >
            {title}
          </Typography>
        </Box>
      </Box>
    </li>
  );
}
