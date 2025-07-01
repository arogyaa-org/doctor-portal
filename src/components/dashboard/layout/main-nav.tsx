'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import { Bell as BellIcon } from '@phosphor-icons/react/dist/ssr/Bell';
import { List as ListIcon } from '@phosphor-icons/react/dist/ssr/List';
import { Users as UsersIcon } from '@phosphor-icons/react/dist/ssr/Users';

import { usePopover } from '@/hooks/use-popover';
import { MobileNav } from './mobile-nav';
import { UserPopover } from './user-popover';
import { Utility } from '@/utils';
import { useGetDoctor } from "@/hooks/doctor";
import { useGetuser } from "@/hooks/user";

import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import DoctorNotificationPopover from '../settings/notifications';
export function MainNav(): React.JSX.Element {
  const [openNav, setOpenNav] = React.useState<boolean>(false);

  const userPopover = usePopover<HTMLDivElement>();
  const { decodedToken } = Utility();
  const { role, userName, doctorName, id } = decodedToken() || {};
  const displayName = role === "admin" ? userName : doctorName;

  const { value: doctorData } = useGetDoctor(
    null,
    id && role === "doctor" ? `/get-doctor-by-id/${id}` : "",
    1,
    1
  );

  const { value: userData } = useGetuser(
    null,
    id && role === "admin" ? `/get-user-by-id/${id}` : "",
    1,
    1
  );

  const profileImage =
    role === "doctor"
      ? doctorData?.data?.profilePicture || null
      : role === "admin"
        ? userData?.data?.profilePicture || null
        : null;

  // Notification popover state
  const [notificationAnchorEl, setNotificationAnchorEl] =
    React.useState<null | HTMLElement>(null);
  const handleNotificationOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
  };
  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };
  const isNotificationOpen = Boolean(notificationAnchorEl);

  // Get unread notification count from redux
  const unreadCount = useSelector(
    (state: RootState) =>
      state.notifications.notifications.filter((n) => n.status === 'unread').length
  );

  return (
    <React.Fragment>
      <Box
        component="header"
        sx={{
          borderBottom: '1px solid var(--mui-palette-divider)',
          backgroundColor: 'var(--mui-palette-background-paper)',
          position: 'sticky',
          top: 0,
          zIndex: 'var(--mui-zIndex-appBar)',
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: '64px',
            px: 2,
          }}
        >
          <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
            <IconButton
              onClick={(): void => {
                setOpenNav(true);
              }}
              sx={{ display: { lg: 'none' } }}
            >
              <ListIcon />
            </IconButton>
          </Stack>
          <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
            <Tooltip title="Contacts">
              <IconButton>
                <UsersIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Notifications">
              <Badge
                badgeContent={unreadCount}
                color="success"
                variant={unreadCount > 0 ? 'dot' : 'standard'}
              >
                <IconButton onClick={handleNotificationOpen}>
                  <BellIcon />
                </IconButton>
              </Badge>
            </Tooltip>
            <Avatar
              src={ profileImage }
              onClick={userPopover.handleOpen}
              ref={userPopover.anchorRef}
              sx={{ cursor: "pointer" }}
            >
              {displayName?.[0]?.toUpperCase()}
            </Avatar>
          </Stack>
        </Stack>
      </Box>

      {/* User Dropdown */}
      <UserPopover
        anchorEl={userPopover.anchorRef.current}
        onClose={userPopover.handleClose}
        open={userPopover.open}
      />

      {/* Doctor Notifications */}
      <DoctorNotificationPopover
        open={isNotificationOpen}
        anchorEl={notificationAnchorEl}
        onClose={handleNotificationClose}
      />

      {/* Mobile Navigation */}
      <MobileNav
        onClose={() => {
          setOpenNav(false);
        }}
        open={openNav}
      />
    </React.Fragment>
  );
}
