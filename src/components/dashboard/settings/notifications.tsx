"use client";

import { Box, Typography, Tabs, Tab, Button, Popover } from "@mui/material";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Utility } from "@/utils";
import { fetcher, modifier } from "@/apis/apiClient";
import { RootState } from "@/redux/store";
import { setNotifications } from "@/redux/features/notificationSlice";
import { useRouter } from "next/navigation";

interface Notification {
  _id: string;
  message: string;
  status: "read" | "unread";
  appointmentId?: string;
}

interface NotificationPopoverProps {
  open: boolean;
  anchorEl: HTMLButtonElement | null;
  onClose: () => void;
  setUnreadCount?: (count: number) => void;
  setReadCount?: (count: number) => void;
}

export default function DoctorNotificationPopover({
  open,
  anchorEl,
  onClose,
  setUnreadCount,
  setReadCount,
}: NotificationPopoverProps) {
  const [tabValue, setTabValue] = useState(0);
  const [visibleNotifications, setVisibleNotifications] = useState(5);

  const dispatch = useDispatch();
  const router = useRouter();

  const notifications = useSelector(
    (state: RootState) => state.notifications.notifications
  );

  const { decodedToken } = Utility();
  const doctorId = decodedToken()?.id;

  const unreadCount = useSelector(
    (state: RootState) =>
      (state.notifications.notifications || []).filter(
        (n) => n.status === "unread"
      ).length
  );
  const readCount = useSelector(
    (state: RootState) =>
      (state.notifications.notifications || []).filter(
        (n) => n.status === "read"
      ).length
  );

  const fetchNotifications = async () => {
    if (!doctorId) return;

    try {
      const response = await fetcher(
        "notification",
        `get-notifications/${doctorId}`
      );
      dispatch(setNotifications(Array.isArray(response) ? response : []));
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (setUnreadCount) {
      setUnreadCount(unreadCount);
    }
  }, [unreadCount, setUnreadCount]);

  useEffect(() => {
    if (setReadCount) {
      setReadCount(readCount);
    }
  }, [readCount, setReadCount]);

  const markAsRead = async (id: string) => {
    try {
      await modifier("notification", `update-notification/${id}`, {
        status: "read",
      });
      const updated = notifications.map((n) =>
        n._id === id ? { ...n, status: "read" } : n
      );
      dispatch(setNotifications(updated));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const onNotificationClick = async (notification: Notification) => {
    try {
      if (notification.status === "unread") {
        await markAsRead(notification._id);
      }

      if (notification.appointmentId) {
        router.push(`/appointment/details/${notification.appointmentId}`);
        onClose();
      }
    } catch (err) {
      console.error("Notification click error:", err);
    }
  };

  const filteredNotifications = notifications.filter((n) =>
    tabValue === 0 ? n.status === "unread" : n.status === "read"
  );

  const displayedNotifications = filteredNotifications.slice(
    0,
    visibleNotifications
  );

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      PaperProps={{
        sx: {
          width: 360,
          mt: 0.5,
          ml: 10,
          borderRadius: 2,
          boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
          backgroundColor: "#fff",
        },
      }}
    >
      <Tabs
        value={tabValue}
        onChange={(_, newValue) => setTabValue(newValue)}
        variant="fullWidth"
        textColor="primary"
        indicatorColor="primary"
        sx={{
          borderBottom: "1px solid #eee",
          backgroundColor: "#f9f9f9",
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
        }}
      >
        <Tab label={`Unread (${unreadCount})`} />
        <Tab label={`Read (${readCount})`} />
      </Tabs>

      <Box sx={{ maxHeight: 400, overflowY: "auto", px: 2, py: 1 }}>
        {filteredNotifications.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              py: 5,
              opacity: 0.6,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1,
            }}
          >
            <NotificationsNoneIcon sx={{ fontSize: 40, color: "#b0b0b0" }} />
            <Typography variant="body1">
              {tabValue === 0
                ? "No unread notifications"
                : "No read notifications"}
            </Typography>
          </Box>
        ) : (
          <>
            {displayedNotifications.map((notification) => (
              <Box
                key={notification._id}
                onClick={() => onNotificationClick(notification)}
                sx={{
                  p: 2,
                  mb: 1,
                  borderRadius: 2,
                  backgroundColor:
                    notification.status === "unread" ? "#f5f8ff" : "#f9f9f9",
                  border: "1px solid #e0e0e0",
                  cursor: "pointer",
                  transition: "0.2s",
                  "&:hover": {
                    backgroundColor: "#eaf1ff",
                    boxShadow: "0px 2px 8px rgba(0,0,0,0.1)",
                  },
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: "#333",
                    fontWeight: notification.status === "unread" ? 600 : 400,
                    whiteSpace: "normal",
                  }}
                >
                  {notification.message}
                </Typography>
                {notification.appointmentId && (
                  <Typography
                    variant="caption"
                    sx={{ mt: 0.5, color: "#0070f3", display: "block" }}
                  >
                    Click to view appointment
                  </Typography>
                )}
              </Box>
            ))}

            {filteredNotifications.length > visibleNotifications && (
              <Box sx={{ mt: 1, textAlign: "center" }}>
                <Button
                  variant="text"
                  onClick={() => setVisibleNotifications((prev) => prev + 5)}
                >
                  View More
                </Button>
              </Box>
            )}
          </>
        )}
      </Box>
    </Popover>
  );
}
