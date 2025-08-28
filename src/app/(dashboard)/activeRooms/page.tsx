"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  Badge,
  IconButton,
  Paper,
  Tooltip,
  Alert,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import { useRouter } from "next/navigation";
import DailyIframe, { DailyCall } from "@daily-co/daily-js";

/* ---------- Styled components ---------- */
const GradientCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== "gradient",
})<{ gradient: string }>(({ theme, gradient }) => ({
  background: gradient,
  borderRadius: theme.shape.borderRadius * 2,
  transition: "transform 0.3s, box-shadow 0.3s",
  "&:hover": {
    transform: "scale(1.02)",
    boxShadow: theme.shadows[8],
  },
}));

const StatusChip = styled(Chip, {
  shouldForwardProp: (prop) => prop !== "status",
})<{ status: string }>(({ theme, status }) => {
  const colors: Record<string, { bg: string; text: string }> = {
    active: {
      bg: theme.palette.success.light,
      text: theme.palette.success.dark,
    },
    scheduled: { bg: theme.palette.info.light, text: theme.palette.info.dark },
    completed: { bg: theme.palette.grey[100], text: theme.palette.grey[700] },
    expired: { bg: theme.palette.error.light, text: theme.palette.error.dark },
  };
  const c = colors[status] || {
    bg: theme.palette.grey[100],
    text: theme.palette.grey[700],
  };
  return {
    backgroundColor: c.bg,
    color: c.text,
    border: `1px solid ${c.bg}`,
    fontWeight: 600,
  };
});

const GradientButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== "gradient",
})<{ gradient: string }>(({ theme, gradient }) => ({
  background: gradient,
  color: theme.palette.common.white,
  fontWeight: 600,
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(1.5, 3),
  "&:hover": {
    transform: "scale(1.05)",
  },
}));

/* ---------- Component ---------- */
const DoctorDashboard = () => {
  const { decodedToken, getLocalStorage } = Utility();
  const [doctorId, setDocterId] = useState<string | null>(null);
  const [socket, setSocket] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);

  const [patientNames, setPatientNames] = useState<Record<string, string>>({});
  const [disconnectedRooms, setDisconnectedRooms] = useState<Set<string>>(
    () => {
      const stored = getLocalStorage("disconnectedRooms");
      return stored ? new Set(stored) : new Set();
    }
  );

  const router = useRouter();

  const [rooms, setRooms] = useState<{
    activeRooms: any[];
    scheduledRooms: any[];
    recentRooms: any[];
    expiredRooms: any[];
    summary: {
      totalActive: number;
      totalScheduled: number;
      totalRecent: number;
      totalExpired: number;
    };
  }>({
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

  const [notifications, setNotifications] = useState<any[]>([]);
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>("default");
  const [activeCalls, setActiveCalls] = useState<Set<string>>(new Set());

  const [expanded, setExpanded] = useState(false);
  const [expandedScheduled, setExpandedScheduled] = useState(false);
  const [expandedExpired, setExpandedExpired] = useState(false);

  const visibleRooms = expanded
    ? rooms?.recentRooms
    : rooms?.recentRooms.slice(0, 3);
  const visibleScheduledRooms = expandedScheduled
    ? rooms?.scheduledRooms
    : rooms?.scheduledRooms.slice(0, 3);
  const visibleExpiredRooms = expandedExpired
    ? rooms?.expiredRooms
    : rooms?.expiredRooms.slice(0, 3);

  // Inline call state (Daily)
  const [activeRoom, setActiveRoom] = useState<{
    roomId: string;
    url: string;
  } | null>(null);
  const callContainerRef = useRef<HTMLDivElement | null>(null);
  const callFrameRef = useRef<any>(null);
  const [dailyCall, setDailyCall] = useState<DailyCall | null>(null);

  const [lastPayment, setLastPayment] = useState<{
    appointmentId: string;
    txnid?: string;
    patientId?: string;
    minutes?: number;
  } | null>(null);

  const [justPaidMap, setJustPaidMap] = useState<
    Record<string, { txnid?: string; ts: number }>
  >({});

  /* --- auth --- */
  useEffect(() => {
    const token = decodedToken();
    if (token?.id) setDocterId(token.id);
  }, [decodedToken]);

  /* --- notifications permission --- */
  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission === "default") {
      Notification.requestPermission().then(setNotificationPermission);
    } else {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  /* --- browser notification helper --- */
  const showBrowserNotification = useCallback(
    (title: string, body: string) => {
      if (notificationPermission !== "granted") return;
      const n = new Notification(title, {
        body,
        icon: "/assets/f2Fintechlogo.png",
        tag: "doctor-notification",
        requireInteraction: true,
      });
      n.onclick = () => {
        window.focus();
        n.close();
      };
      setTimeout(() => n.close(), 10000);
    },
    [notificationPermission]
  );

  /* --- fetch rooms --- */
  const fetchRooms = useCallback(async () => {
    if (!doctorId) return;
    try {
      const { data } = await fetcher("chat", `/doctor/${doctorId}/rooms`);
      setRooms(data);
    } catch (e) {
      console.error("Error fetching rooms:", e);
    }
  }, [doctorId]);

  /* --- socket --- */
  useEffect(() => {
    if (!doctorId) return;
    const s = io(`${"https://arogyaa.f2fintech.in/doctor-notifications"}`, {
      path: "/chat-service/socket.io",
      transports: ["websocket"],
      withCredentials: true,
      autoConnect: true,
    });

    s.on("connect", () => {
      setIsConnected(true);
      s.emit("joinDoctorRoom", { doctorId });
    });

    s.on("connect_error", () => setIsConnected(false));
    s.on("disconnect", () => setIsConnected(false));

    s.on("roomStatusUpdate", (data: any) => setRooms(data));

    s.on("roomCreated", (data: any) => {
      showBrowserNotification(
        "New Video Call",
        `video call joined by patient ${data.patientId}`
      );
      fetchRooms();
    });

    s.on("roomScheduled", (data: any) => {
      showBrowserNotification(
        "Appointment Scheduled",
        `call scheduled for ${new Date(data.scheduledAt).toLocaleString()}`
      );
      fetchRooms();
    });

    s.on("roomCompleted", (data: any) => {
      setActiveCalls((prev) => {
        const ns = new Set(prev);
        ns.delete(data.roomId);
        return ns;
      });
      setDisconnectedRooms((prev) => new Set(prev).add(data.roomId));
      fetchRooms();
    });

    s.on("request-extend-call", (data: any) => {
      //data: { doctorId, appointmentId, patientId, extensionMinutes, currentEndTime }
      showBrowserNotification(
        "Patient request to extend-call",
        `extension request by patient ${data.patientId}`
      );
      fetchRooms();
    });

    s.on("extension-payment-success", (payload: any) => {
      if (!payload?.doctorId || payload.doctorId !== doctorId) return;

      setLastPayment({
        appointmentId: String(payload.appointmentId),
        txnid: payload.txnid,
        patientId: payload.patientId,
        minutes: payload.minutes,
      });

      setJustPaidMap((prev) => ({
        ...prev,
        [String(payload.appointmentId)]: {
          txnid: payload.txnid,
          minutes: payload.minutes,
          ts: Date.now(),
        },
      }));

      showBrowserNotification(
        "Extension Amount Paid By Patient",
        `Appointment ${payload.appointmentId} • Txn ${payload.txnid || "N/A"}`
      );

      setJustPaidMap((prev) => ({
        ...prev,
        [String(payload.appointmentId)]: {
          txnid: payload.txnid,
          ts: Date.now(),
        },
      }));

      fetchRooms();

      setTimeout(() => {
        setJustPaidMap((prev) => {
          const copy = { ...prev };
          delete copy[String(payload.appointmentId)];
          return copy;
        });
      }, 30000);
    });

    s.on("payment-success", (payload: any) => {
      if (payload?.purpose !== "EXTENSION") return;
      if (!payload?.doctorId || payload.doctorId !== doctorId) return;

      setLastPayment({
        appointmentId: String(payload.appointmentId),
        txnid: payload.txnid,
        patientId: payload.patientId,
        minutes: payload.minutes,
      });
      setJustPaidMap((prev) => ({
        ...prev,
        [String(payload.appointmentId)]: {
          txnid: payload.txnid,
          minutes: payload.minutes,
          ts: Date.now(),
        },
      }));

      showBrowserNotification(
        "Extension Paid",
        `Appointment ${payload.appointmentId} • Txn ${payload.txnid || "N/A"}`
      );

      setJustPaidMap((prev) => ({
        ...prev,
        [String(payload.appointmentId)]: {
          txnid: payload.txnid,
          ts: Date.now(),
        },
      }));

      fetchRooms();

      setTimeout(() => {
        setJustPaidMap((prev) => {
          const copy = { ...prev };
          delete copy[String(payload.appointmentId)];
          return copy;
        });
      }, 30000);
    });

    setSocket(s);
    const t = setTimeout(fetchRooms, 1500);

    return () => {
      clearTimeout(t);
      s.removeAllListeners();
      s.close();
    };
  }, [doctorId, fetchRooms, showBrowserNotification]);

  const getDurationWithExtension = (room: any) => {
    const base = Number(room?.duration) || 0;
    let extra = 0;

    if (lastPayment && lastPayment.appointmentId === room.appointmentId) {
      extra = Number(lastPayment.minutes) || 0;
    } else if (justPaidMap[room.appointmentId]?.minutes) {
      extra = Number(justPaidMap[room.appointmentId].minutes) || 0;
    }

    return base + extra;
  };

  /* --- map patient names --- */
  useEffect(() => {
    const ids = [
      ...rooms.activeRooms,
      ...rooms.scheduledRooms,
      ...rooms.recentRooms,
      ...rooms.expiredRooms,
    ]
      .map((r: any) => r.patientId)
      .filter(Boolean);

    [...new Set(ids)].forEach(async (id: string) => {
      if (patientNames[id]) return;
      try {
        const res = await fetcher("patient", `get-patient-by-id/${id}`);
        const name = res?.data?.username || "Unknown";
        setPatientNames((p) => ({ ...p, [id]: name }));
      } catch {
        setPatientNames((p) => ({ ...p, [id]: "Unknown" }));
      }
    });
  }, [rooms, patientNames]);

  /* --- Join Call inline (Daily) --- */
  const joinRoom = (roomId: string, url: string) => {
    if (!url) return alert("Room URL not available");

    if (callFrameRef.current) {
      try {
        callFrameRef.current.leave();
      } catch {}
      try {
        callFrameRef.current.destroy();
      } catch {}
      callFrameRef.current = null;
    }
    if (callContainerRef.current) {
      callContainerRef.current.innerHTML = "";
    }

    setActiveCalls((prev) => new Set(prev).add(roomId));
    setActiveRoom({ roomId, url });
  };

  const endCall = useCallback(() => {
    if (callFrameRef.current) {
      try {
        callFrameRef.current.leave();
      } catch {}
      try {
        callFrameRef.current.destroy();
      } catch {}
      callFrameRef.current = null;
    }
    if (callContainerRef.current) {
      callContainerRef.current.innerHTML = "";
    }
    setActiveRoom(null);
  }, []);

  useEffect(() => {
    if (!activeRoom || !callContainerRef.current) return;
    if (callFrameRef.current) return;
    const frame = DailyIframe?.createFrame(callContainerRef.current, {
      iframeStyle: {
        width: "100%",
        height: "520px",
        border: "0",
        borderRadius: "12px",
      },
      showLeaveButton: true,
    });

    callFrameRef.current = frame;

    const onLeft = () => endCall();
    const onError = (e: any) => console.error("Daily error:", e);

    frame.on("left-meeting", onLeft);
    frame.on("error", onError);

    frame
      .join({ url: activeRoom.url })
      .then(() => setDailyCall(frame))
      .catch(onError);

    return () => {
      if (callFrameRef.current) {
        try {
          callFrameRef.current.off("left-meeting", onLeft);
        } catch {}
        try {
          callFrameRef.current.off("error", onError);
        } catch {}
        try {
          callFrameRef.current.destroy();
        } catch {}
        callFrameRef.current = null;
      }
    };
  }, [activeRoom, endCall]);

  /* --- actions --- */
  const completeRoom = async (roomId: string) => {
    try {
      const response = await creator(
        "chat",
        `/room/${roomId}/complete`,
        {},
        { "Content-Type": "application/json" }
      );
      if (response?.success) {
        showBrowserNotification(
          "Room Completed",
          "Video call has been marked as completed"
        );
        fetchRooms();
      }
      return response;
    } catch (error) {
      console.error("Error completing room:", error);
      return null;
    }
  };

  const handleAcceptExtension = async (
    appointmentId: string,
    patientId: string
  ) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_CHAT_URL}/approve-extension/${appointmentId}`,
        { method: "POST" }
      );
      const data = await res.json();

      if (res.ok && data?.success) {
        alert("Accepted. Patient can now pay.");
        if (socket && doctorId && patientId) {
          socket.emit("doctor-approved-extension", {
            doctorId,
            appointmentId,
            patientId,
            extensionMinutes: 20,
          });
        }
        fetchRooms();
      } else {
        alert(data?.message || "Failed to accept extension.");
      }
    } catch (e) {
      console.error("Error accepting extension", e);
    }
  };

  const handleRejectExtension = async (
    appointmentId: string,
    patientId: string
  ) => {
    let done = false;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_CHAT_URL}/reject-extension/${appointmentId}`,
        { method: "POST" }
      );
      if (res.ok) done = true;
    } catch {}

    if (!done && socket && doctorId && patientId) {
      socket.emit("doctor-rejected-extension", {
        doctorId,
        appointmentId,
        patientId,
      });
      done = true;
    }

    if (done) {
      alert("Rejected extension.");
      fetchRooms();
    } else {
      alert("Failed to reject extension.");
    }
  };

  /* --- utils --- */
  const formatTime = (date: string) =>
    new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const getStatusIcon = (status: string) => {
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

  /* ---------- UI ---------- */
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
              Active Calls
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1} mb={4}>
            <Pulse size={20} color="primary.main" />
            <Typography variant="body1" color="text.secondary">
              Manage your video consultations with precision and care
            </Typography>
          </Stack>

          {/* Status + notifications */}
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

          {lastPayment && (
            <Alert
              severity="success"
              onClose={() => setLastPayment(null)}
              sx={{ mt: 2, mb: 2, borderRadius: 2, fontWeight: 600 }}
            >
              Extension amount paid by patient — Appointment{" "}
              <strong>{lastPayment.appointmentId}</strong>
              {typeof lastPayment.minutes === "number" ? (
                <> • +{lastPayment.minutes} min</>
              ) : null}
            </Alert>
          )}
        </Box>

    
        {/* Summary Cards */}
        <Grid container spacing={3} mb={6}>
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
                  {rooms?.summary.totalActive}
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
                  Scheduled Calls
                </Typography>
                <Typography variant="h3" fontWeight="bold" color="text.primary">
                  {rooms?.summary.totalScheduled}
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

            {/* Scheduled Calls List */}
            {rooms?.scheduledRooms.length > 0 && (
              <Box sx={{ mt: 2 }}>
                {/* (kept commented) */}

                {rooms?.scheduledRooms.length > 3 && (
                  <Box sx={{ textAlign: "center", mt: 2 }}>
                    <Button
                      variant="text"
                      onClick={() => setExpandedScheduled(!expandedScheduled)}
                    >
                      {expandedScheduled ? "Show Less" : "Show More"}
                    </Button>
                  </Box>
                )}
              </Box>
            )}
          </Grid>

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
                  {rooms?.summary.totalRecent}
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
                  {rooms?.summary.totalExpired}
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

            {rooms?.expiredRooms.length > 0 && (
              <Box sx={{ mt: 2 }}>
                {/* (kept commented) */}
                {rooms?.expiredRooms.length > 3 && (
                  <Box sx={{ textAlign: "center", mt: 2 }}>
                    <Button
                      variant="text"
                      onClick={() => setExpandedExpired(!expandedExpired)}
                    >
                      {expandedExpired ? "Show Less" : "Show More"}
                    </Button>
                  </Box>
                )}
              </Box>
            )}
          </Grid>
        </Grid>

        {/* Active Rooms */}
        {rooms?.activeRooms.length > 0 && (
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
                {rooms.activeRooms.map((room: any) => (
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
                              <strong>
                                {getDurationWithExtension(room)} min
                              </strong>
                            </Typography>

                            <Typography variant="body2" color="text.secondary">
                              Expires:{" "}
                              <strong style={{ color: "#dc2626" }}>
                                {formatTime(
                                  lastPayment &&
                                    lastPayment.appointmentId ===
                                      room.appointmentId
                                    ? new Date(
                                        new Date(room.expiresAt).getTime() +
                                          (lastPayment.minutes || 20) * 60000
                                      ).toISOString()
                                    : room.expiresAt
                                )}
                              </strong>
                            </Typography>

                            {justPaidMap[room.appointmentId] && (
                              <Chip
                                label={`Extension Paid • Txn ${
                                  justPaidMap[room.appointmentId].txnid || "N/A"
                                }`}
                                color="success"
                                variant="filled"
                                size="small"
                                sx={{ mt: 1, fontWeight: 700 }}
                              />
                            )}
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
                            disabled={activeCalls.has(room.roomId)}
                          >
                            {activeCalls.has(room.roomId)
                              ? "Call In Progress"
                              : disconnectedRooms.has(room.roomId)
                                ? "Rejoin Call"
                                : "Join Call"}
                          </GradientButton>

                          <GradientButton
                            gradient="linear-gradient(#4FC3F7, #4FC3F7)"
                            onClick={() => {
                              if (room.appointmentId) {
                                router.push(
                                  `/appointment/details/${room.appointmentId}`
                                );
                              } else {
                                console.log(
                                  "Appointment ID not found, cannot redirect."
                                );
                              }
                            }}
                          >
                            Patient Details
                          </GradientButton>

                          <GradientButton
                            gradient="linear-gradient(to right, #64748b, #475569)"
                            onClick={async () => {
                              const response = await completeRoom(room.roomId);
                              if (response?.success && room.appointmentId) {
                                router.push(
                                  `/appointment/details/${room.appointmentId}`
                                );
                              }
                            }}
                          >
                            Complete
                          </GradientButton>
                        </Stack>
                      </Stack>

                      {/* Accept / Reject only when pending */}
                      {room.extensionStatus === "pending" && (
                        <Stack direction="row" spacing={1} mt={2}>
                          <Button
                            variant="contained"
                            color="success"
                            onClick={() =>
                              handleAcceptExtension(
                                room.appointmentId,
                                room.patientId
                              )
                            }
                          >
                            Accept Extension Request
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={() =>
                              handleRejectExtension(
                                room.appointmentId,
                                room.patientId
                              )
                            }
                          >
                            Reject Extension Request
                          </Button>
                        </Stack>
                      )}
                    </CardContent>

                  </GradientCard>
                ))}
              </Stack>          
            </Box>
          </Paper>
        )}

        {/* Scheduled Rooms */}
        {rooms?.scheduledRooms.length > 0 && (
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
                {rooms.scheduledRooms.map((room: any) => (
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
                              <strong>
                                {`${formatDate(room.scheduledAt)} at ${formatTime(
                                  room.scheduledAt
                                )}`}
                              </strong>
                            </Typography>
                          </Box>
                        </Stack>

                        <Chip
                          label={`${Math.max(
                            0,
                            Math.round(
                              (new Date(room.scheduledAt).getTime() -
                                Date.now()) /
                                (1000 * 60)
                            )
                          )} min`}
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
        {rooms?.recentRooms.length > 0 && (
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
                {visibleRooms.map((room: any) => (
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
                            <strong>{`${formatDate(
                              room.completedAt || room.createAt
                            )} at ${formatTime(
                              room.completedAt || room.createAt
                            )}`}</strong>
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </GradientCard>
                ))}
              </Stack>

              {rooms.recentRooms.length > 3 && (
                <Box sx={{ textAlign: "center", mt: 2 }}>
                  <Button variant="text" onClick={() => setExpanded(!expanded)}>
                    {expanded ? "Show Less" : "Show More"}
                  </Button>
                </Box>
              )}
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
                {rooms.expiredRooms.map((room: any) => (
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
                            <strong>{`${formatDate(room.expiresAt)} at ${formatTime(
                              room.expiresAt
                            )}`}</strong>
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

        {/* Empty state */}
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
