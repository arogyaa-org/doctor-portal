"use client";

import { Box, Typography, Tabs, Tab, Button, Popover } from "@mui/material";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Utility } from "@/utils";
import { fetcher, modifier } from "@/apis/apiClient";
import { RootState } from "@/redux/store";
import { setNotifications } from "@/redux/features/notificationSlice";

interface Notification {
  _id: string;
  message: string;
  status: "read" | "unread";
}

interface NotificationPopoverProps {
  open: boolean;
  anchorEl: HTMLButtonElement | null;
  onClose: () => void;
  setUnreadCount?: (count: number) => void;
}

export default function DoctorNotificationPopover({
  open,
  anchorEl,
  onClose,
  setUnreadCount,
}: NotificationPopoverProps) {
  const [tabValue, setTabValue] = useState(0);
  const [visibleNotifications, setVisibleNotifications] = useState(5);

  const dispatch = useDispatch();
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

  const fetchNotifications = async () => {
    if (!doctorId) return;

    try {
      const response = await fetcher(
        "notification",
        `get-notifications/${doctorId}`
      );
      console.log("Fetched Notifications:", response);
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
        <Tab label="Read" />
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
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderBottom: "1px solid #f0f0f0",
                  py: 1,
                  gap: 1,
                  cursor: "pointer",
                }}
                onClick={() =>
                  notification.status === "unread" &&
                  markAsRead(notification._id)
                }
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: notification.status === "unread" ? "#111" : "#666",
                    fontWeight: notification.status === "unread" ? 600 : 400,
                  }}
                >
                  {notification.message}
                </Typography>
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
