"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Bell,
  Video,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Activity,
  Users,
} from "lucide-react";
import io from "socket.io-client";
import { Utility } from "@/utils";
import { creator, fetcher } from "@/apis/apiClient";
import { Pulse } from "@phosphor-icons/react";
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Stack,
  Divider,
  Badge,
  IconButton,
  CircularProgress,
  Paper,
  Tooltip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

// Custom styled components
const GradientCard = styled(Card)(({ theme, gradient }) => ({
  background: gradient,
  borderRadius: theme.shape.borderRadius * 2,
  transition: "transform 0.3s, box-shadow 0.3s",
  "&:hover": {
    transform: "scale(1.02)",
    boxShadow: theme.shadows[8],
  },
}));

const StatusChip = styled(Chip)(({ theme, status }) => {
  const colors = {
    active: {
      bg: theme.palette.success.light,
      text: theme.palette.success.dark,
    },
    scheduled: { bg: theme.palette.info.light, text: theme.palette.info.dark },
    completed: { bg: theme.palette.grey[100], text: theme.palette.grey[700] },
    expired: { bg: theme.palette.error.light, text: theme.palette.error.dark },
  };
  return {
    backgroundColor: colors[status]?.bg || theme.palette.grey[100],
    color: colors[status]?.text || theme.palette.grey[700],
    border: `1px solid ${colors[status]?.bg || theme.palette.grey[200]}`,
    fontWeight: 600,
  };
});

const GradientButton = styled(Button)(({ theme, gradient }) => ({
  background: gradient,
  color: theme.palette.common.white,
  fontWeight: 600,
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(1.5, 3),
  "&:hover": {
    background: gradient.replace("500", "600").replace("600", "700"),
    transform: "scale(1.05)",
  },
}));

// eslint-disable-next-line react/function-component-definition
const DoctorDashboard = () => {
  const { decodedToken } = Utility();
  const [doctorId, setDocterId] = useState(null);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [rooms, setRooms] = useState({
    activeRooms: [],
    scheduledRooms: [],
    recentRooms: [],
    summary: { totalActive: 0, totalScheduled: 0, totalRecent: 0 },
  });
  const [notifications, setNotifications] = useState([]);
  const [notificationPermission, setNotificationPermission] =
    useState("default");

  useEffect(() => {
    if (!doctorId) {
      setDocterId(decodedToken().id);
    }
  }, [decodedToken().id]);

  // Request notification permission
  useEffect(() => {
    if ("Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission().then((permission) => {
          setNotificationPermission(permission);
        });
      } else {
        setNotificationPermission(Notification.permission);
      }
    }
  }, []);
  console.log(process.env.NEXT_PUBLIC_SOCKET_ENDPOINT, 'socket endpoint')

  // Initialize socket connection
  useEffect(() => {
    console.log('ye call hua?')
    const newSocket = io(`${process.env.NEXT_PUBLIC_SOCKET_ENDPOINT}/doctor-notifications`, {
      transports: ["websocket"],
      autoConnect: true,
    });

    newSocket.on("connect", () => {
      console.log("Connected to WebSocket");
      setIsConnected(true);
      newSocket.emit("joinDoctorRoom", { doctorId });
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from WebSocket");
      setIsConnected(false);
    });

    newSocket.on("joinedDoctorRoom", (data) => {
      console.log("Joined doctor room:", data);
    });

    newSocket.on("roomStatusUpdate", (data) => {
      console.log("Room status update:", data);
      setRooms(data);
    });

    newSocket.on("roomNotification", (notification) => {
      console.log("Room notification:", notification);
      handleRoomNotification(notification);
    });

    newSocket.on("roomCreated", (data) => {
      console.log("New room created:", data);
      showBrowserNotification(
        "New Video Call",
        `New ${data.type} call created for patient ${data.patientId}`
      );
      fetchRooms();
    });

    newSocket.on("roomScheduled", (data) => {
      console.log("Room scheduled:", data);
      showBrowserNotification(
        "Appointment Scheduled",
        `${data.type} call scheduled for ${new Date(data.scheduledAt).toLocaleString()}`
      );
      fetchRooms();
    });

    newSocket.on("roomCompleted", (data) => {
      console.log("Room completed:", data);
      fetchRooms();
    });

    setSocket(newSocket);

    setTimeout(() => {
      fetchRooms();
    }, 1000);

    return () => {
      newSocket.close();
    };
  }, [doctorId]);

  const handleRoomNotification = useCallback(
    (notification) => {
      const { data } = notification;

      if (data.upcomingRooms.length > 0) {
        data.upcomingRooms.forEach((room) => {
          const timeUntil =
            new Date(room.scheduledAt).getTime() - new Date().getTime();
          const minutesUntil = Math.round(timeUntil / (1000 * 60));

          if (minutesUntil <= 5 && minutesUntil > 0) {
            showBrowserNotification(
              "Upcoming Appointment",
              `You have a ${room.type} call in ${minutesUntil} minutes with patient ${room.patientId}`
            );
          }
        });
      }

      setNotifications((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: "room_update",
          message: `${data.activeRooms.length} active rooms, ${data.upcomingRooms.length} upcoming`,
          timestamp: new Date(),
        },
      ]);

      setRooms({
        activeRooms: data.activeRooms,
        scheduledRooms: data.upcomingRooms,
        recentRooms: rooms.recentRooms,
        summary: {
          totalActive: data.activeRooms.length,
          totalScheduled: data.upcomingRooms.length,
          totalRecent: rooms.summary.totalRecent,
        },
      });
    },
    [rooms.recentRooms, rooms.summary.totalRecent]
  );

  const showBrowserNotification = useCallback(
    (title, body) => {
      if (notificationPermission === "granted") {
        const notification = new Notification(title, {
          body,
          icon: "/assets/f2Fintechlogo.png",
          badge: "/assets/logo-dropbox.png",
          tag: "doctor-notification",
          requireInteraction: true,
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };

        setTimeout(() => {
          notification.close();
        }, 10000);
      }
    },
    [notificationPermission]
  );

  const fetchRooms = useCallback(async () => {
    try {
      const { data } = await fetcher("chat", `/doctor/${doctorId}/rooms`);
      console.log(data, 'roomdata')
      setRooms(data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  }, [doctorId]);

  const joinRoom = (roomId, url) => {
    if (url) {
      window.open(url, "_blank");
    } else {
      alert("Room URL not available");
    }
  };

  const completeRoom = async (roomId) => {
    try {
      const response = await creator(
        "chat",
        `/room/${roomId}/complete`,
        {},
        { "Content-Type": "application/json" }
      );

      if (response.success) {
        showBrowserNotification(
          "Room Completed",
          "Video call has been marked as completed"
        );
        fetchRooms();
      }
    } catch (error) {
      console.error("Error completing room:", error);
      alert("Failed to complete room");
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <Video size={16} />;
      case "scheduled":
        return <Calendar size={16} />;
      case "completed":
        return <CheckCircle size={16} />;
      case "expired":
        return <AlertCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50", p: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box mb={6}>
          <Stack direction="row" alignItems="center" spacing={2} mb={2}>
            <Box
              sx={{
                p: 1.5,
                bgcolor: "primary.main",
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
              }}
            >
              <Activity size={24} color="white" />
            </Box>
            <Typography variant="h4" fontWeight="bold" color="text.primary">
              Active Rooms
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1} mb={4}>
            <Pulse size={20} color="primary.main" />
            <Typography variant="body1" color="text.secondary">
              Manage your video consultations with precision and care
            </Typography>
          </Stack>

          {/* Status and Notifications */}
          <Stack direction="row" alignItems="center" spacing={3}>
            <Tooltip
              title={
                isConnected ? "Connected to server" : "Disconnected from server"
              }
            >
              <Chip
                icon={
                  <FiberManualRecordIcon
                    sx={{
                      color: isConnected ? "success.main" : "error.main",
                      animation: isConnected ? "pulse 1.5s infinite" : "none",
                      "@keyframes pulse": {
                        "0%": { opacity: 0.4 },
                        "50%": { opacity: 1 },
                        "100%": { opacity: 0.4 },
                      },
                    }}
                  />
                }
                label={isConnected ? "Connected" : "Disconnected"}
                color={isConnected ? "success" : "error"}
                variant="outlined"
                sx={{ fontWeight: 500 }}
              />
            </Tooltip>
            <Badge
              badgeContent={notifications.length}
              color="error"
              overlap="circular"
            >
              <IconButton
                sx={{
                  bgcolor: "white",
                  border: 1,
                  borderColor: "grey.200",
                  "&:hover": { borderColor: "primary.main" },
                }}
              >
                <Bell size={20} />
              </IconButton>
            </Badge>
            <IconButton
              sx={{ bgcolor: "white", border: 1, borderColor: "grey.200" }}
            >
              <Video size={20} />
            </IconButton>
          </Stack>
        </Box>

        {/* Summary Cards */}
        <Grid container spacing={3} mb={6}>
          {/* Active Rooms Card */}
          <Grid item xs={12} md={4}>
            <GradientCard gradient="linear-gradient(to right, #f0fdf4, #dcfce7)">
              <CardContent>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={2}
                >
                  <Box
                    sx={{ p: 1.5, bgcolor: "success.main", borderRadius: 2 }}
                  >
                    <Video size={24} color="white" />
                  </Box>
                  <FiberManualRecordIcon
                    sx={{
                      color: "success.main",
                      animation: "pulse 1.5s infinite",
                    }}
                  />
                </Stack>
                <Typography
                  variant="overline"
                  color="text.secondary"
                  fontWeight="bold"
                >
                  Active Rooms
                </Typography>
                <Typography variant="h3" fontWeight="bold" color="text.primary">
                  {rooms.summary.totalActive}
                </Typography>
                <Typography
                  variant="body2"
                  color="success.main"
                  fontWeight="medium"
                >
                  Live consultations
                </Typography>
              </CardContent>
            </GradientCard>
          </Grid>

          {/* Scheduled Card */}
          <Grid item xs={12} md={4}>
            <GradientCard gradient="linear-gradient(to right, #eff6ff, #dbeafe)">
              <CardContent>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={2}
                >
                  <Box sx={{ p: 1.5, bgcolor: "info.main", borderRadius: 2 }}>
                    <Calendar size={24} color="white" />
                  </Box>
                  <Clock size={20} color="info.main" />
                </Stack>
                <Typography
                  variant="overline"
                  color="text.secondary"
                  fontWeight="bold"
                >
                  Scheduled
                </Typography>
                <Typography variant="h3" fontWeight="bold" color="text.primary">
                  {rooms.summary.totalScheduled}
                </Typography>
                <Typography
                  variant="body2"
                  color="info.main"
                  fontWeight="medium"
                >
                  Upcoming appointments
                </Typography>
              </CardContent>
            </GradientCard>
          </Grid>

          {/* Recent Calls Card */}
          <Grid item xs={12} md={4}>
            <GradientCard gradient="linear-gradient(to right, #f7f7f7, #e5e5e5)">
              <CardContent>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={2}
                >
                  <Box sx={{ p: 1.5, bgcolor: "grey.600", borderRadius: 2 }}>
                    <Users size={24} color="white" />
                  </Box>
                  <CheckCircle size={20} color="grey.600" />
                </Stack>
                <Typography
                  variant="overline"
                  color="text.secondary"
                  fontWeight="bold"
                >
                  Recent Calls
                </Typography>
                <Typography variant="h3" fontWeight="bold" color="text.primary">
                  {rooms.summary.totalRecent}
                </Typography>
                <Typography
                  variant="body2"
                  color="grey.600"
                  fontWeight="medium"
                >
                  Completed sessions
                </Typography>
              </CardContent>
            </GradientCard>
          </Grid>
        </Grid>

        {/* Active Rooms */}
        {rooms.activeRooms.length > 0 && (
          <Paper
            elevation={3}
            sx={{ mb: 4, borderRadius: 4, overflow: "hidden" }}
          >
            <Box
              sx={{
                p: 4,
                bgcolor: "success.light",
                borderBottom: 1,
                borderColor: "success.main",
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box sx={{ p: 1, bgcolor: "success.main", borderRadius: 2 }}>
                  <Video size={20} color="white" />
                </Box>
                <Box>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Typography
                      variant="h5"
                      fontWeight="bold"
                      color="text.primary"
                    >
                      Active Video Calls
                    </Typography>
                    <Chip
                      label={`${rooms.activeRooms.length} Live`}
                      color="success"
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </Stack>
                  <Typography variant="body2" color="success.dark">
                    Ongoing consultations requiring your attention
                  </Typography>
                </Box>
              </Stack>
            </Box>
            <Box sx={{ p: 4 }}>
              <Stack spacing={2}>
                {rooms.activeRooms.map((room) => (
                  <GradientCard
                    key={room._id}
                    gradient="linear-gradient(to right, #f0fdf4, #dcfce7)"
                    sx={{ p: 3 }}
                  >
                    <CardContent sx={{ p: 0 }}>
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        justifyContent="space-between"
                        spacing={2}
                      >
                        <Stack direction="row" spacing={3}>
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={2}
                          >
                            <Box
                              sx={{
                                p: 1,
                                bgcolor: "success.light",
                                borderRadius: 2,
                              }}
                            >
                              {getStatusIcon(room.status)}
                            </Box>
                            <StatusChip
                              label={room.status}
                              status={room.status}
                              size="small"
                            />
                          </Stack>
                          <Box>
                            <Typography
                              variant="h6"
                              fontWeight="bold"
                              color="text.primary"
                            >
                              Patient: {room.patientId}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Type: <strong>{room.type}</strong> | Duration:{" "}
                              <strong>{room.duration} min</strong>
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Expires:{" "}
                              <strong style={{ color: "#dc2626" }}>
                                {formatTime(room.expiresAt)}
                              </strong>
                            </Typography>
                          </Box>
                        </Stack>
                        <Stack
                          direction={{ xs: "column", sm: "row" }}
                          spacing={2}
                        >
                          <GradientButton
                            gradient="linear-gradient(to right, #10b981, #059669)"
                            onClick={() =>
                              joinRoom(
                                room.roomId,
                                `https://baseerah.daily.co/${room.roomId}`
                              )
                            }
                          >
                            Join Call
                          </GradientButton>
                          <GradientButton
                            gradient="linear-gradient(to right, #64748b, #475569)"
                            onClick={() => completeRoom(room.roomId)}
                          >
                            Complete
                          </GradientButton>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </GradientCard>
                ))}
              </Stack>
            </Box>
          </Paper>
        )}

        {/* Scheduled Rooms */}
        {rooms.scheduledRooms.length > 0 && (
          <Paper
            elevation={3}
            sx={{ mb: 4, borderRadius: 4, overflow: "hidden" }}
          >
            <Box
              sx={{
                p: 4,
                bgcolor: "info.light",
                borderBottom: 1,
                borderColor: "info.main",
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box sx={{ p: 1, bgcolor: "info.main", borderRadius: 2 }}>
                  <Calendar size={20} color="white" />
                </Box>
                <Box>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Typography
                      variant="h5"
                      fontWeight="bold"
                      color="text.primary"
                    >
                      Scheduled Appointments
                    </Typography>
                    <Chip
                      label={`${rooms.scheduledRooms.length} Upcoming`}
                      color="info"
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </Stack>
                  <Typography variant="body2" color="info.dark">
                    Your upcoming patient consultations
                  </Typography>
                </Box>
              </Stack>
            </Box>
            <Box sx={{ p: 4 }}>
              <Stack spacing={2}>
                {rooms.scheduledRooms.map((room) => (
                  <GradientCard
                    key={room._id}
                    gradient="linear-gradient(to right, #eff6ff, #dbeafe)"
                    sx={{ p: 3 }}
                  >
                    <CardContent sx={{ p: 0 }}>
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        justifyContent="space-between"
                        spacing={2}
                      >
                        <Stack direction="row" spacing={3}>
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={2}
                          >
                            <Box
                              sx={{
                                p: 1,
                                bgcolor: "info.light",
                                borderRadius: 2,
                              }}
                            >
                              {getStatusIcon(room.status)}
                            </Box>
                            <StatusChip
                              label={room.status}
                              status={room.status}
                              size="small"
                            />
                          </Stack>
                          <Box>
                            <Typography
                              variant="h6"
                              fontWeight="bold"
                              color="text.primary"
                            >
                              Patient: {room.patientId}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Type: <strong>{room.type}</strong> | Duration:{" "}
                              <strong>{room.duration} min</strong>
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Scheduled:{" "}
                              <strong>{`${formatDate(room.scheduledAt)} at ${formatTime(room.scheduledAt)}`}</strong>
                            </Typography>
                          </Box>
                        </Stack>
                        <Chip
                          label={`${Math.max(0, Math.round((new Date(room.scheduledAt) - new Date()) / (1000 * 60)))} min`}
                          color="info"
                          variant="outlined"
                          sx={{ fontWeight: 600 }}
                        />
                      </Stack>
                    </CardContent>
                  </GradientCard>
                ))}
              </Stack>
            </Box>
          </Paper>
        )}

        {/* Recent Rooms */}
        {rooms.recentRooms.length > 0 && (
          <Paper
            elevation={3}
            sx={{ mb: 4, borderRadius: 4, overflow: "hidden" }}
          >
            <Box
              sx={{
                p: 4,
                bgcolor: "grey.100",
                borderBottom: 1,
                borderColor: "grey.300",
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box sx={{ p: 1, bgcolor: "grey.600", borderRadius: 2 }}>
                  <CheckCircle size={20} color="white" />
                </Box>
                <Box>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Typography
                      variant="h5"
                      fontWeight="bold"
                      color="text.primary"
                    >
                      Recent Calls
                    </Typography>
                    <Chip
                      label={`${rooms.recentRooms.length} Completed`}
                      color="default"
                      size="small"
                      sx={{
                        fontWeight: 600,
                        bgcolor: "grey.600",
                        color: "white",
                      }}
                    />
                  </Stack>
                  <Typography variant="body2" color="grey.700">
                    Your recently completed consultations
                  </Typography>
                </Box>
              </Stack>
            </Box>
            <Box sx={{ p: 4 }}>
              <Stack spacing={2}>
                {rooms.recentRooms.map((room) => (
                  <GradientCard
                    key={room._id}
                    gradient="linear-gradient(to right, #f7f7f7, #e5e5e5)"
                    sx={{ p: 3 }}
                  >
                    <CardContent sx={{ p: 0 }}>
                      <Stack direction="row" spacing={3}>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Box
                            sx={{ p: 1, bgcolor: "grey.200", borderRadius: 2 }}
                          >
                            {getStatusIcon(room.status)}
                          </Box>
                          <StatusChip
                            label={room.status}
                            status={room.status}
                            size="small"
                          />
                        </Stack>
                        <Box>
                          <Typography
                            variant="h6"
                            fontWeight="bold"
                            color="text.primary"
                          >
                            Patient: {room.patientId}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Type: <strong>{room.type}</strong> | Duration:{" "}
                            <strong>{room.duration} min</strong>
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {room.completedAt ? "Completed" : "Created"}:{" "}
                            <strong>{`${formatDate(room.completedAt || room.createAt)} at ${formatTime(room.completedAt || room.createAt)}`}</strong>
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </GradientCard>
                ))}
              </Stack>
            </Box>
          </Paper>
        )}

        {/* No rooms message */}
        {rooms.activeRooms.length === 0 &&
          rooms.scheduledRooms.length === 0 &&
          rooms.recentRooms.length === 0 && (
            <Paper
              elevation={3}
              sx={{ p: 6, textAlign: "center", borderRadius: 4 }}
            >
              <Box sx={{ maxWidth: 400, mx: "auto" }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: "primary.light",
                    borderRadius: 3,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 3,
                  }}
                >
                  <Video size={40} color="white" />
                </Box>
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  color="text.primary"
                  mb={2}
                >
                  No Appointment Calls Found
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Your upcoming and active video consultations will appear here.
                  Ready to connect with your patients whenever they need you.
                </Typography>
              </Box>
            </Paper>
          )}
      </Container>
    </Box>
  );
};

export default DoctorDashboard;
