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
  const [patientNames, setPatientNames] = useState({});
  const [disconnectedRooms, setDisconnectedRooms] = useState(() => {
    const storedRooms = localStorage?.getItem("disconnectedRooms");
    return storedRooms ? new Set(JSON.parse(storedRooms)) : new Set();
  });

  const [rooms, setRooms] = useState({
    activeRooms: [],
    scheduledRooms: [],
    recentRooms: [],
    expiredRooms: [],
    summary: {
      totalActive: 0,
      totalScheduled: 0,
      totalRecent: 0,
      totalExpired: 0,
    },
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
  console.log(process.env.NEXT_PUBLIC_SOCKET_ENDPOINT, "socket endpoint");

  // Initialize socket connection
  useEffect(() => {
    if (!doctorId) {
      console.log("Doctor ID not available, skipping socket connection");
      setIsConnected(false);
      return;
    }

    const newSocket = io(
      `${process.env.NEXT_PUBLIC_SOCKET_ENDPOINT}/doctor-notifications`,
      {
        transports: ["websocket", "polling"], // Add polling as fallback
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        timeout: 20000,
        forceNew: true, // Force new connection
      }
    );

    // Connection event handlers
    newSocket.on("connect", () => {
      console.log("Connected to WebSocket with ID:", newSocket.id);
      setIsConnected(true);

      // Only join doctor room if doctorId is available
      if (doctorId) {
        console.log("Joining doctor room with ID:", doctorId);
        newSocket.emit("joinDoctorRoom", { doctorId });
      }
    });

    newSocket.on("connect_error", (error) => {
      console.error("Connection error:", error);
      setIsConnected(false);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("Disconnected from WebSocket. Reason:", reason);
      setIsConnected(false);

      setDisconnectedRooms((prev) => {
        const newSet = new Set(prev);
        rooms.activeRooms.forEach((room) => {
          newSet.add(room.roomId);
        });
        return newSet;
      });
    });

    newSocket.on("reconnect", (attemptNumber) => {
      console.log("Reconnected after", attemptNumber, "attempts");
      setIsConnected(true);
    });

    newSocket.on("reconnect_error", (error) => {
      console.error("Reconnection error:", error);
    });

    // Room event handlers
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
      setDisconnectedRooms((prev) => new Set(prev).add(data.roomId));
      fetchRooms();
    });

    newSocket.on("disconnectFromRoom", (data) => {
      setDisconnectedRooms((prev) => new Set(prev).add(data.roomId));
    });

    setSocket(newSocket);

    // Fetch rooms after a short delay
    const fetchTimer = setTimeout(() => {
      fetchRooms();
    }, 2000); // Increased delay

    // Cleanup function
    return () => {
      clearTimeout(fetchTimer);
      if (newSocket) {
        console.log("Cleaning up socket connection");
        newSocket.removeAllListeners();
        newSocket.close();
      }
    };
  }, [doctorId]);

  useEffect(() => {
    const allPatientIds = [
      ...rooms.activeRooms,
      ...rooms.scheduledRooms,
      ...rooms.recentRooms,
      ...rooms.expiredRooms,
    ].map((room) => room.patientId);

    [...new Set(allPatientIds)].forEach(fetchPatientName);
  }, [rooms]);

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

  const fetchPatientName = async (patientId) => {
    if (!patientId || patientNames[patientId]) return;

    try {
      const Patientdata = await fetcher(
        "patient",
        `get-patient-by-id/${patientId}`
      );
      const name = Patientdata?.data?.username;

      setPatientNames((prev) => ({ ...prev, [patientId]: name || "Unknown" }));
    } catch (error) {
      console.error("Error fetching patient name:", error);
      setPatientNames((prev) => ({ ...prev, [patientId]: "Unknown" }));
    }
  };

  const fetchRooms = useCallback(async () => {
    try {
      const { data } = await fetcher("chat", `/doctor/${doctorId}/rooms`);
      setRooms(data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  }, [doctorId]);

  const joinRoom = (roomId, url) => {
    if (url) {
      const newWindow = window.open(url, "_blank");
      const roomIdToTrack = roomId;

      const interval = setInterval(() => {
        if (newWindow.closed) {
          console.log("Video tab closed, marking as disconnected");

          setDisconnectedRooms((prev) => {
            const newSet = new Set(prev);
            newSet.add(roomIdToTrack);

            localStorage.setItem(
              "disconnectedRooms",
              JSON.stringify([...newSet])
            );

            return newSet;
          });

          clearInterval(interval);
        }
      }, 500);
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

          {/* Expired Calls Card */}
          <Grid item xs={12} md={4}>
            <GradientCard gradient="linear-gradient(to right, #fef2f2, #fee2e2)">
              <CardContent>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={2}
                >
                  <Box sx={{ p: 1.5, bgcolor: "error.main", borderRadius: 2 }}>
                    <AlertCircle size={24} color="white" />
                  </Box>
                  <AlertCircle size={20} color="error.main" />
                </Stack>
                <Typography
                  variant="overline"
                  color="text.secondary"
                  fontWeight="bold"
                >
                  Expired Calls
                </Typography>
                <Typography variant="h3" fontWeight="bold" color="text.primary">
                  {rooms.summary.totalExpired}
                </Typography>
                <Typography
                  variant="body2"
                  color="error.main"
                  fontWeight="medium"
                >
                  Missed or expired sessions
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
                              Patient:{" "}
                              {patientNames[room.patientId] || room.patientId}
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
                            {disconnectedRooms.has(room.roomId)
                              ? "Rejoin Call"
                              : "Join Call"}
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
                              Patient:{" "}
                              {patientNames[room.patientId] || room.patientId}
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
                            Patient:{" "}
                            {patientNames[room.patientId] || room.patientId}
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

        {/* Expired Rooms */}
        {rooms.expiredRooms?.length > 0 && (
          <Paper
            elevation={3}
            sx={{ mb: 4, borderRadius: 4, overflow: "hidden" }}
          >
            <Box
              sx={{
                p: 4,
                bgcolor: "error.light",
                borderBottom: 1,
                borderColor: "error.main",
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box sx={{ p: 1, bgcolor: "error.main", borderRadius: 2 }}>
                  <AlertCircle size={20} color="white" />
                </Box>
                <Box>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Typography
                      variant="h5"
                      fontWeight="bold"
                      color="text.primary"
                    >
                      Expired Calls
                    </Typography>
                    <Chip
                      label={`${rooms.expiredRooms.length} Expired`}
                      color="error"
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </Stack>
                  <Typography variant="body2" color="error.dark">
                    Missed or expired video consultations
                  </Typography>
                </Box>
              </Stack>
            </Box>
            <Box sx={{ p: 4 }}>
              <Stack spacing={2}>
                {rooms.expiredRooms.map((room) => (
                  <GradientCard
                    key={room._id}
                    gradient="linear-gradient(to right, #fef2f2, #fee2e2)"
                    sx={{ p: 3 }}
                  >
                    <CardContent sx={{ p: 0 }}>
                      <Stack direction="row" spacing={3}>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Box
                            sx={{
                              p: 1,
                              bgcolor: "error.light",
                              borderRadius: 2,
                            }}
                          >
                            <AlertCircle size={20} color="white" />
                          </Box>
                          <StatusChip
                            label={room.status}
                            status="expired"
                            size="small"
                          />
                        </Stack>
                        <Box>
                          <Typography
                            variant="h6"
                            fontWeight="bold"
                            color="text.primary"
                          >
                            Patient:{" "}
                            {patientNames[room.patientId] || room.patientId}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Type: <strong>{room.type}</strong> | Duration:{" "}
                            <strong>{room.duration} min</strong>
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Expired:{" "}
                            <strong>{`${formatDate(room.expiresAt)} at ${formatTime(room.expiresAt)}`}</strong>
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
