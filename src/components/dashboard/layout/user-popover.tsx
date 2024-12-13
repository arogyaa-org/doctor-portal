import * as React from "react";
import RouterLink from "next/link";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import ListItemIcon from "@mui/material/ListItemIcon";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import { alpha } from "@mui/material/styles";
import { SignOut as SignOutIcon } from "@phosphor-icons/react/dist/ssr/SignOut";
import { User as UserIcon } from "@phosphor-icons/react/dist/ssr/User";

import { paths } from "@/paths";

export interface UserPopoverProps {
  anchorEl: Element | null;
  onClose: () => void;
  open: boolean;
  user: {
    name: string;
    email: string;
    avatar: string | null;
  };
}

export function UserPopover({
  anchorEl,
  onClose,
  open,
  user,
}: UserPopoverProps): React.JSX.Element {
  const popoverRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (popoverRef.current) {
      const nameLength = user?.name?.length || 0;
      const emailLength = user?.email?.length || 0;
      const longestTextLength = Math.max(nameLength, emailLength);

      // Calculate the required width dynamically based on text length
      const requiredWidth = Math.min(
        400,
        Math.max(230, longestTextLength * 10)
      );
      popoverRef.current.style.width = `${requiredWidth}px`;
    }
  }, [user?.name, user?.email]);

  const handleSignOut = React.useCallback(async (): Promise<void> => {
    try {
      document.cookie = "token=; path=/; max-age=0; secure; samesite=strict";
      location.reload();
    } catch (err) {
      console.log("Sign out error", err);
    }
  }, []);

  return (
    <Popover
      ref={popoverRef}
      anchorEl={anchorEl}
      anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
      onClose={onClose}
      open={open}
      slotProps={{
        paper: {
          sx: {
            maxWidth: "400px",
            minWidth: "230px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            overflow: "visible",
          },
        },
      }}
    >
      {/* Profile Section */}
      <Box
        sx={{
          p: "16px 20px",
          background: (theme) =>
            `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
          borderTopLeftRadius: (theme) => theme.shape.borderRadius * 2,
          borderTopRightRadius: (theme) => theme.shape.borderRadius * 2,
          color: "white",
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        {/* User Avatar */}
        <Avatar
          src={user?.avatar || "/assets/avatar-1.png"}
          alt={user?.name || "Test User"}
          sx={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            backgroundColor: "gray",
          }}
        />

        {/* User Info */}
        <Box>
          {/* User Name */}
          <Typography
            variant="h6"
            fontWeight={600}
            sx={{
              overflowWrap: "break-word",
              wordWrap: "break-word",
              whiteSpace: "normal",
              width: "100%",
            }}
          >
            {user?.name || "Test User"}
          </Typography>

          {/* User Email */}
          <Typography
            variant="body2"
            color="inherit"
            sx={{
              opacity: 0.8,
              overflowWrap: "break-word",
              wordWrap: "break-word",
              whiteSpace: "normal",
              width: "100%",
            }}
          >
            {user?.email || "Test.user@f2fintech.in"}
          </Typography>
        </Box>
      </Box>

      <Divider />
      <MenuList
        disablePadding
        sx={{
          p: "8px",
          "& .MuiMenuItem-root": {
            borderRadius: 1,
            transition: "all 0.2s ease",
            "&:hover": {
              backgroundColor: (theme) =>
                alpha(theme.palette.primary.main, 0.08),
              transform: "translateX(4px)",
            },
          },
        }}
      >
        <MenuItem
          component={RouterLink}
          href={paths.dashboard.account}
          onClick={onClose}
          sx={{
            gap: 2,
            alignItems: "center",
          }}
        >
          <ListItemIcon sx={{ minWidth: "auto" }}>
            <UserIcon
              fontSize="var(--icon-fontSize-md)"
              style={{ color: "currentColor", opacity: 0.7 }}
            />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem
          onClick={handleSignOut}
          sx={{
            gap: 2,
            alignItems: "center",
            color: "error.main",
          }}
        >
          <ListItemIcon sx={{ minWidth: "auto" }}>
            <SignOutIcon
              fontSize="var(--icon-fontSize-md)"
              style={{ color: "currentColor", opacity: 0.7 }}
            />
          </ListItemIcon>
          Sign out
        </MenuItem>
      </MenuList>
    </Popover>
  );
}
