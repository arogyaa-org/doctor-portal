"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import PlaceIcon from "@mui/icons-material/Place";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import NotificationsOffIcon from "@mui/icons-material/NotificationsOff";
import DailyIframe from "@daily-co/daily-js";
import io from "socket.io-client";
import { useRouter } from "next/navigation";              // ✅ NEW
import { paths } from "@/paths";                           // ✅ NEW

/* =======================
 * Env / Endpoints
 * ======================= */
const APPT_BASE =
  process.env.NEXT_PUBLIC_APPOINTMENT_URL ||
  "http://localhost:4001/api/v1/appointment-service";

const CHAT_BASE =
  process.env.NEXT_PUBLIC_CHAT_URL ||
  "http://localhost:4009/api/v1/chat-service";

/* --- socket A: appointment-service (/emergency-appointments) --- */
const APPT_SOCKET_BASE =
  process.env.NEXT_PUBLIC_APPOINTMENT_SOCKET_ENDPOINT ||
  "http://localhost:4001" || "https://arogyaa.f2fintech.in/";
const APPT_SOCKET_NS =
  process.env.NEXT_PUBLIC_APPOINTMENT_SOCKET_NS || "/emergency-appointments";
const APPT_SOCKET_PATH =
  process.env.NEXT_PUBLIC_APPOINTMENT_SOCKET_PATH || "/socket.io";

/* --- socket B: doctor-service (/email-appointments) --- */
const DOC_SOCKET_BASE =
  process.env.NEXT_PUBLIC_DOCTOR_SOCKET_ENDPOINT || "http://localhost:4004" || "https://arogyaa.f2fintech.in/";
const DOC_SOCKET_NS =
  process.env.NEXT_PUBLIC_DOCTOR_SOCKET_NS || "/email-appointments";
const DOC_SOCKET_PATH =
  process.env.NEXT_PUBLIC_DOCTOR_SOCKET_PATH || "/socket.io";

/* --- where to navigate on notification click --- */
const EMERGENCY_ROUTE = process.env.NEXT_PUBLIC_EMERGENCY_ROUTE || "/emergency";

/* --- optional filters --- */
const ENV_SPECIALITY_IDS = (process.env.NEXT_PUBLIC_SPECIALITY_IDS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const ENV_DOCTOR_CITY =
  (process.env.NEXT_PUBLIC_DOCTOR_CITY || "").split(",")[0]?.trim() || "";
const ENV_APPT_TYPE = (process.env.NEXT_PUBLIC_EMERGENCY_APPT_TYPE || "") as
  | "online"
  | "in-person"
  | "";

const EMG_DEBUG = true;
const log = (...args: any[]) => {
  if (!EMG_DEBUG) return;
  const ts = new Date().toISOString().split("T")[1]?.replace("Z", "");
  console.log(`[EMG ${ts}]`, ...args);
};

type RawAppt = {
  _id: string;
  appointmentType?: "online" | "in-person";
  location?: string;
  appointmentDateTime?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  status?: string;
  emergency?: boolean;
  videoUrl?: string;
  doctorData?: Array<{ _id?: string; username?: string }>;
  patientId?: { _id?: string; username?: string; email?: string } | string;
  doctorId?: { _id?: string; username?: string } | string | null;
  specialityName?: string;
};

/* ---- token helpers ---- */
function getTokenFromAnywhere(): string | null {
  try {
   
    const util = (window as any)?.Utility?.() || null;
    const utilTok = util?.getToken?.() || util?.token || util?.authToken;
    if (typeof utilTok === "string" && utilTok) return utilTok;
  } catch {}
  const keys = [
    "token",
    "accessToken",
    "access_token",
    "authToken",
    "jwt",
    "id_token",
    "authorization",
  ];
  try {
    for (const k of keys) {
      const v = localStorage.getItem(k);
      if (typeof v === "string" && v) return v;
    }
  } catch {}
  try {
    const parts = (document.cookie || "").split(";").map((s) => s.trim());
    for (const p of parts) {
      for (const k of keys) {
        if (p.startsWith(`${k}=`)) {
          return decodeURIComponent(p.split("=").slice(1).join("="));
        }
      }
    }
  } catch {}
  return null;
}

const b64url = (s: string) =>
  s.replace(/-/g, "+").replace(/_/g, "/") +
  "=".repeat((4 - (s.length % 4)) % 4);

const decodeJwtId = (tok?: string | null) => {
  try {
    if (!tok) return null;
    const [, payload] = tok.split(".");
    const json = JSON.parse(atob(b64url(payload)));
    return json?.id || json?._id || json?.userId || null;
  } catch {
    return null;
  }
};

const fmtIST = (iso?: string) => {
  if (!iso) return "-";
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(d);
  } catch {
    return "-";
  }
};

/* ==== ID helpers ==== */
function normalizeId(v: any): string | null {
  if (!v) return null;
  if (typeof v === "string") return v;
  if (typeof v === "object") {
    if (v._id) return String(v._id);
    if (v.id) return String(v.id);
  }
  return null;
}
const first = <T,>(arr?: T[]) =>
  Array.isArray(arr) && arr.length ? arr[0] : undefined;

/** Resolve doctorId, patientId, appointmentId safely from RawAppt + JWT */
async function resolveIdsForAppt(r: any, token: string | null) {
  let doctorId =
    (Array.isArray(r.doctorData) && r.doctorData[0]?._id) ||
    normalizeId(r.doctorId) ||
    decodeJwtId(token) ||
    null;

  const p =
    (first((r as any).patientData) as any) ||
    (typeof r.patientId === "object" ? (r.patientId as any) : null);

  let patientId = normalizeId(r.patientId) || (p?._id ? String(p._id) : null);

  const appointmentId = String(r._id);

  if (!doctorId || !patientId) {
    throw new Error("Missing doctor or patient id.");
  }

  return {
    doctorId: String(doctorId),
    patientId: String(patientId),
    appointmentId,
  };
}

function upsertAppt(
  prev: RawAppt[],
  incoming: Partial<RawAppt> & { _id?: string }
) {
  if (!incoming || !incoming._id) return prev;
  const idx = prev.findIndex((r) => String(r._id) === String(incoming._id));
  if (idx >= 0) {
    const merged = { ...prev[idx], ...incoming };
    const next = [...prev];
    next[idx] = merged as RawAppt;
    return next;
  }
  return [incoming as RawAppt, ...prev];
}

type NotifState = "unsupported" | "default" | "granted" | "denied";
function getNotifState(): NotifState {
  if (typeof window === "undefined") return "unsupported";
  if (!("Notification" in window)) return "unsupported";
  return Notification.permission as NotifState;
}

function notifyEmergencyClickable(opts: {
  title: string;
  body: string;
  apptId?: string;
}) {
  if (typeof window === "undefined") return false;
  if (!("Notification" in window)) return false;
  if (Notification.permission !== "granted") return false;

  const n = new Notification(opts.title, { body: opts.body });
  const dest =
    `${EMERGENCY_ROUTE}` +
    (opts.apptId ? `?appt=${encodeURIComponent(opts.apptId)}` : "");

  n.onclick = () => {
    try {
      window.focus?.();
    } catch {}
    try {
      if (document.visibilityState === "hidden") {
        window.open(dest, "_blank");
      } else {
        window.location.assign(dest);
      }
    } catch {
      window.location.href = dest;
    }
    try {
      n.close?.();
    } catch {}
  };

  return true;
}

/* =======================
 * Time-window helpers
 * ======================= */
function getWhenISO(r: RawAppt): string | undefined {
  return (
    r.appointmentDateTime ||
    (r.appointmentDate ? new Date(r.appointmentDate).toISOString() : undefined)
  );
}
function isTimeUp(r: RawAppt, now: number): boolean {
  const whenISO = getWhenISO(r);
  if (!whenISO) return false;
  const end = new Date(whenISO).getTime() + 30 * 60 * 1000;
  return now > end;
}

const StatusChip: React.FC<{ status?: string }> = ({ status }) => {
  const s = (status || "pending").toLowerCase();
  const color =
    s === "picked_up"
      ? "info"
      : s === "scheduled"
      ? "primary"
      : s === "rescheduled"
      ? "info"
      : s === "completed"
      ? "success"
      : s === "rejected"
      ? "error"
      : "warning";
  return <Chip size="small" label={s} color={color as any} />;
};

const STATUS_PICK_OPTIONS: Array<{
  value: "picked_up" | "scheduled";
  label: string;
}> = [
  { value: "picked_up", label: "Picked up" },
  { value: "scheduled", label: "Scheduled" },
];

/* =======================
 * Component
 * ======================= */
export default function EmergencyInbox() {
  const router = useRouter();                         // ✅ NEW

  const [rows, setRows] = useState<RawAppt[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [token, setToken] = useState<string | null>(null);
  const [selection, setSelection] = useState<Record<string, string>>({});

  // sockets
  const [isApptConnected, setIsApptConnected] = useState(false);
  const [isDocConnected, setIsDocConnected] = useState(false);

  // notifications
  const [notifState, setNotifState] = useState<NotifState>("default");

  // Daily inline
  // const [activeRoom, setActiveRoom] = useState<{ roomId: string; url: string } | null>(null);
  const callContainerRef = useRef<HTMLDivElement | null>(null);
  const callFrameRef = useRef<any>(null);


  const [patientOnline, setPatientOnline] = useState<Record<string, boolean>>({});

  const joinedApptIdsRef = useRef<Set<string>>(new Set());
  const getApptSocket = () =>
    (typeof window !== "undefined" && (window as any).__APPT_EMG_SOCKET) || null;

  const autoJoinTriedRef = useRef<Set<string>>(new Set());

  const [nowTs, setNowTs] = useState<number>(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNowTs(Date.now()), 20000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setNotifState(getNotifState());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setToken(getTokenFromAnywhere());
    const onStorage = () => setToken(getTokenFromAnywhere());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const askNotificationPermission = async () => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window)) {
      setNotifState("unsupported");
      return;
    }
    try {
      const res = await Notification.requestPermission();
      setNotifState(res as NotifState);
    } catch {}
  };

  const authHeaders = useMemo(
    () => ({
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { "x-access-token": token, Authorization: `Bearer ${token}` } : {}),
    }),
    [token]
  );

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const qs = new URLSearchParams({
        page: String(page + 1),
        limit: String(limit),
      }).toString();

      const res = await fetch(`${APPT_BASE}/get-emergency-appointments?${qs}`, {
        method: "GET",
        headers: authHeaders,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || res.statusText);

      const list: RawAppt[] = (data?.results || data?.data || []) as RawAppt[];

      const filtered = list.filter(
        (r) =>
          r?.emergency === true &&
          ["pending", "picked_up"].includes(String(r?.status || "").toLowerCase())
      );

      setRows(filtered);
      setCount(data?.count ?? filtered.length ?? 0);

      setPatientOnline((prev) => {
        const next: Record<string, boolean> = {};
        filtered.forEach((r) => (next[String(r._id)] = prev[String(r._id)] ?? false));
        return next;
      });

      log("load -> ok", { items: filtered.length });
    } catch (e: any) {
      setErr(e?.message || "Failed to load emergency requests");
      setRows([]);
      setCount(0);
      setPatientOnline({});
      log("load -> error", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  const pickOrSchedule = async (appt: RawAppt, nextStatus: "picked_up" | "scheduled" = "picked_up") => {
    const t = token || getTokenFromAnywhere();
    if (!t) {
      setErr("Please login to change status.");
      return;
    }

    setSaving((s) => ({ ...s, [appt._id]: true }));
    const prev = appt.status;

    setRows((rs) => rs.map((r) => (String(r._id) === String(appt._id) ? { ...r, status: nextStatus } : r)));

    try {
      log("pickup -> request", { id: appt._id, nextStatus });
      const res = await fetch(`${APPT_BASE}/emergency/${appt._id}/pickup`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || res.statusText);

      const updated = data?.data || data;
      setRows((rs) => rs.map((r) => (String(r._id) === String(appt._id) ? { ...r, ...updated } : r)));

      try {
        const s = getApptSocket();
        if (s && nextStatus === "picked_up") {
          const id = String(appt._id);
          s.emit("appointment:join", { appointmentId: id, as: "doctor" });
          s.emit("appointment:get_state", { appointmentId: id });
          joinedApptIdsRef.current.add(id);
        }
      } catch {}

      log("pickup -> success", { id: appt._id });
    } catch (e: any) {
      setRows((rs) => rs.map((r) => (String(r._id) === String(appt._id) ? { ...r, status: prev } : r)));
      setErr(e?.message || "Failed to update status");
      log("pickup -> error", e);
    } finally {
      setSaving((s) => ({ ...s, [appt._id]: false }));
    }
  };

  const [activeRoom, setActiveRoom] = useState<{ roomId: string; url: string } | null>(null);
  const openDailyInline = (url: string, apptId: string) => {
    if (!url) return;
    if (callFrameRef.current) {
      try { callFrameRef.current.leave(); } catch {}
      try { callFrameRef.current.destroy(); } catch {}
      callFrameRef.current = null;
    }
    if (callContainerRef.current) callContainerRef.current.innerHTML = "";

    const frame = DailyIframe.createFrame(callContainerRef.current!, {
      iframeStyle: { width: "100%", height: "520px", border: "0", borderRadius: "12px" },
      showLeaveButton: true,
    });

    callFrameRef.current = frame;
    frame.on("left-meeting", () => {
      try { frame.destroy(); } catch {}
      callFrameRef.current = null;
      setActiveRoom(null);
    });

    setActiveRoom({ roomId: `appt_${String(apptId)}`, url });
    frame.join({ url }).catch((e: any) => {
      log("daily join error", e);
      alert("Failed to join call.");
    });
  };

  const createRoomAndJoin = async (r: RawAppt) => {
    try {
      const { doctorId, patientId, appointmentId } = await resolveIdsForAppt(r, token);
      const payload = {
        type: "video",
        duration: "20",
        doctorId,
        patientId,
        appointmentId,
        scheduledAt: r.appointmentDateTime || r.appointmentDate || undefined,
        appointmentTime: r.appointmentTime || undefined,
      };

      const res = await fetch(`${CHAT_BASE}/create-room`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to create room");

      const url = data?.url;
      const roomId = data?.roomId;
      if (!url || !roomId) throw new Error("No room URL from server");

      openDailyInline(url, appointmentId);
    } catch (e: any) {
      log("createRoomAndJoin error", e);
      alert(e?.message || "Unable to start the call.");
    }
  };

  useEffect(() => {
    if (!isApptConnected || !rows.length) return;

    rows.forEach((r) => {
      const apptId = String(r._id);
      const status = String(r.status || "").toLowerCase();

      if (
        r.appointmentType === "online" &&
        status === "picked_up" &&
        patientOnline[apptId] === true &&
        !autoJoinTriedRef.current.has(apptId)
      ) {
        autoJoinTriedRef.current.add(apptId);

        try {
          const s = getApptSocket();
          s?.emit("appointment:join", { appointmentId: apptId, as: "doctor" });
          s?.emit("appointment:get_state", { appointmentId: apptId });
          joinedApptIdsRef.current.add(apptId);
        } catch {}

        createRoomAndJoin(r);
      }
    });
  }, [isApptConnected, rows, patientOnline]);

  useEffect(() => {
    return () => {
      if (callFrameRef.current) {
        try { callFrameRef.current.destroy(); } catch {}
        callFrameRef.current = null;
      }
      try {
        const s = getApptSocket();
        if (s) {
          joinedApptIdsRef.current.forEach((id) => {
            s.emit("appointment:leave", { appointmentId: id, as: "doctor" });
          });
          joinedApptIdsRef.current.clear();
        }
      } catch {}
    };
  }, []);

  /* ========== SOCKET A: appointment-service (/emergency-appointments) ========== */
  useEffect(() => {
    if (!APPT_SOCKET_BASE) return;
    const url = `${APPT_SOCKET_BASE}${APPT_SOCKET_NS}`;
    const path = APPT_SOCKET_PATH;
    const rawToken = token || getTokenFromAnywhere();
    const doctorIdFromJWT = decodeJwtId(rawToken);

    const s = io(url, {
      path,
      auth: { userId: doctorIdFromJWT || undefined },
      transports: ["websocket"],
    });

    // @ts-ignore
    (window as any).__APPT_EMG_SOCKET = s;

    s.on("connect", () => {
      setIsApptConnected(true);
      const doctorId = doctorIdFromJWT || decodeJwtId(token);
      s.emit("registerDoctor", String(doctorId || ""));
      if (ENV_SPECIALITY_IDS.length) {
        s.emit("doctor:subscribe", {
          specialityIds: ENV_SPECIALITY_IDS,
          location: ENV_DOCTOR_CITY || undefined,
          appointmentType: (ENV_APPT_TYPE || undefined) as "online" | "in-person" | undefined,
        });
      }
      load();
    });

    s.on("doctor:subscribed", (p) => log("[A] doctor:subscribed", p));

    const setPresence = (id: any, val: boolean) => {
      const apptId = String(id || "");
      if (!apptId) return;
      setPatientOnline((prev) => {
        if (prev[apptId] === val) return prev;
        return { ...prev, [apptId]: val };
      });
    };

    s.on("appointment:state", (payload: any) => {
      const apptId = String(payload?.appointmentId || "");
      if (!apptId) return;
      const direct =
        payload?.patientOnline ??
        payload?.patientJoined ??
        payload?.patient_online ??
        null;

      let online = false;
      if (typeof direct === "boolean") {
        online = direct;
      } else if (Array.isArray(payload?.participants)) {
        online = payload.participants.some(
          (p: any) =>
            String(p?.role || "").toLowerCase() === "patient" &&
            (p?.online === true || p?.connected === true)
        );
      }
      setPresence(apptId, !!online);
      log("[A] appointment:state", { apptId, online: !!online });
    });

    s.on("appointment:patient_joined", (p: any) => {
      setPresence(p?.appointmentId, true);
      log("[A] patient_joined", p);
    });
    s.on("appointment:patient_left", (p: any) => {
      setPresence(p?.appointmentId, false);
      log("[A] patient_left", p);
    });

    s.on("appointment:join", (p: any) => {
      const who = String(p?.as || "patient").toLowerCase();
      if (who === "patient") setPresence(p?.appointmentId, true);
      log("[A] appointment:join", p);
    });
    s.on("appointment:left", (p: any) => {
      const who = String(p?.as || "patient").toLowerCase();
      if (who === "patient") setPresence(p?.appointmentId, false);
      log("[A] appointment:left", p);
    });

    s.on("emergency:new", (appt: RawAppt & any) => {
      log("[A] emergency:new", { id: appt?._id, status: appt?.status });
      const patientName =
        (appt?.patientId && (appt.patientId as any)?.username) || "Patient";
      const speciality =
        appt?.specialityName || appt?.specialityId?.name || "Speciality";
      const mode = appt?.appointmentType || "in-person";
      const city = String(appt?.location || "").split(",")[0] || "";

      notifyEmergencyClickable({
        title: "🚑 New Emergency Appointment",
        body: `${patientName} • ${speciality} • ${mode}${city ? " @ " + city : ""}`,
        apptId: appt?._id,
      });
      load();

      const st = String(appt?.status || "pending").toLowerCase();
      if (!(appt?.emergency && ["pending", "picked_up"].includes(st))) return;

      setRows((prev) => upsertAppt(prev, appt));
      setCount((c) => c + (rows.find((r) => String(r._id) === String(appt._id)) ? 0 : 1));
      setPatientOnline((prev) => ({
        ...prev,
        [String(appt._id)]: prev[String(appt._id)] ?? false,
      }));
    });

    s.on(
      "emergency:picked",
      (p: { id: string; doctorId: string; status: string; pickedUpAt?: string | null }) => {
        log("[A] emergency:picked", p);
        setRows((prev) =>
          prev.map((r) =>
            String(r._id) === String(p.id)
              ? {
                  ...r,
                  status: p.status,
                  doctorId: p.doctorId as any,
                  // @ts-ignore
                  pickedUpAt: p.pickedUpAt || (r as any).pickedUpAt,
                }
              : r
          )
        );

        const id = String(p.id);
        if (!joinedApptIdsRef.current.has(id)) {
          s.emit("appointment:join", { appointmentId: id, as: "doctor" });
          s.emit("appointment:get_state", { appointmentId: id });
          joinedApptIdsRef.current.add(id);
        }
      }
    );

    s.on("disconnect", (reason) => {
      setIsApptConnected(false);
      log("[A] disconnected", { reason });
    });

    s.on("connect_error", (err) => {
      setIsApptConnected(false);
      log("[A] connect_error", { message: err?.message });
    });

    return () => {
      try {
        s.removeAllListeners();
        s.close();
        // @ts-ignore
        if ((window as any).__APPT_EMG_SOCKET === s) (window as any).__APPT_EMG_SOCKET = null;
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (!isApptConnected || !rows.length) return;
    const s = getApptSocket();
    if (!s) return;
    rows.forEach((r) => {
      const st = String(r.status || "").toLowerCase();
      const id = String(r._id);
      if (r.appointmentType === "online" && st === "picked_up") {
        if (!joinedApptIdsRef.current.has(id)) {
          s.emit("appointment:join", { appointmentId: id, as: "doctor" });
          joinedApptIdsRef.current.add(id);
        }
        s.emit("appointment:get_state", { appointmentId: id });
      }
    });
  }, [isApptConnected, rows]);

  /* ========== SOCKET B omitted (unchanged) ========== */
  useEffect(() => {
    if (!DOC_SOCKET_BASE) return;
    const url = `${DOC_SOCKET_BASE}${DOC_SOCKET_NS}`;
    const path = DOC_SOCKET_PATH;
    const rawToken = token || getTokenFromAnywhere();
    const doctorIdFromJWT = decodeJwtId(rawToken);

    const s = io(url, {
      path,
      auth: { userId: doctorIdFromJWT || undefined },
      transports: ["websocket"],
    });

    // @ts-ignore
    (window as any).__DOC_EMG_SOCKET = s;

    s.on("connect", () => {
      setIsDocConnected(true);
      const doctorId = doctorIdFromJWT || decodeJwtId(token);
      s.emit("registerDoctor", String(doctorId || ""));
      if (ENV_SPECIALITY_IDS.length) {
        s.emit("doctor:subscribe", {
          specialityIds: ENV_SPECIALITY_IDS,
          location: ENV_DOCTOR_CITY || undefined,
          appointmentType: (ENV_APPT_TYPE || undefined) as "online" | "in-person" | undefined,
        });
      }
    });

    s.on("doctor:subscribed", (p) => log("[B] doctor:subscribed", p));

    s.on("doctor:emergency-direct", (payload: any) => {
      log("[B] doctor:emergency-direct", payload);

      const patientName = payload?.appt?.patientId?.username || "Patient";
      const speciality = payload?.specialityName || "Speciality";
      const mode = payload?.appointmentType || "in-person";
      const city = String(payload?.location || "").split(",")[0] || "";

      notifyEmergencyClickable({
        title: "🚑 Emergency Request",
        body: `${patientName} • ${speciality} • ${mode}${city ? " @ " + city : ""}`,
        apptId: payload?._id,
      });

      if (!payload?._id) return;
      setRows((prev) =>
        upsertAppt(prev, {
          ...payload,
          emergency: true,
          status: payload?.status || "pending",
        })
      );
      setCount((c) => c + (rows.find((r) => String(r._id) === String(payload._id)) ? 0 : 1));
      setPatientOnline((prev) => ({
        ...prev,
        [String(payload._id)]: prev[String(payload._id)] ?? false,
      }));
    });

    s.on("disconnect", (reason) => {
      setIsDocConnected(false);
      log("[B] disconnected", { reason });
    });

    s.on("connect_error", (err) => {
      setIsDocConnected(false);
      log("[B] connect_error", { message: err?.message });
    });

    return () => {
      try {
        s.removeAllListeners();
        s.close();
        // @ts-ignore
        if ((window as any).__DOC_EMG_SOCKET === s) (window as any).__DOC_EMG_SOCKET = null;
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const empty = !loading && !err && rows.length === 0;

  /* =======================
   * Render
   * ======================= */
  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
        <LocalHospitalIcon sx={{ color: "#7A4D9C" }} />
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#29175E" }}>
          Emergency (Pending & Picked)
        </Typography>

        <Tooltip
          title={
            notifState === "granted"
              ? "Notifications enabled"
              : notifState === "denied"
              ? "Notifications blocked at browser level"
              : notifState === "unsupported"
              ? "Notifications not supported"
              : "Click to enable notifications"
          }
        >
          <Chip
            icon={notifState === "granted" ? <NotificationsActiveIcon /> : <NotificationsOffIcon />}
            label={
              notifState === "granted"
                ? "Notify ON"
                : notifState === "denied"
                ? "Notify BLOCKED"
                : notifState === "unsupported"
                ? "Notify N/A"
                : "Enable Notify"
            }
            color={notifState === "granted" ? "success" : notifState === "denied" ? "error" : "default"}
            variant="outlined"
            onClick={notifState === "default" ? askNotificationPermission : undefined}
            sx={{ ml: 1, fontWeight: 600, cursor: notifState === "default" ? "pointer" : "default" }}
          />
        </Tooltip>

        <Box sx={{ flex: 1 }} />
        <Tooltip title="Refresh">
          <span>
            <IconButton onClick={load} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      <Divider sx={{ my: 1.5 }} />

      {/* Inline Daily Call Area */}
      {activeRoom && (
        <Paper elevation={4} sx={{ mb: 3, p: 2, borderRadius: 3 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
            <Typography variant="subtitle1" fontWeight={700}>
              Video Call • Room: {activeRoom.roomId}
            </Typography>
            <Button
              variant="contained"
              color="error"
              onClick={() => {
                try { callFrameRef.current?.leave(); callFrameRef.current?.destroy(); } catch {}
                callFrameRef.current = null;
                setActiveRoom(null);
              }}
            >
              End Call
            </Button>
          </Stack>
          <Box ref={callContainerRef} sx={{ width: "100%" }} />
        </Paper>
      )}

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Patient</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>When (IST)</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <CircularProgress size={22} />
                </TableCell>
              </TableRow>
            ) : err ? (
              <TableRow>
                <TableCell colSpan={6} align="center" style={{ color: "crimson" }}>
                  <Box sx={{ display: "flex", gap: 1, alignItems: "center", justifyContent: "center" }}>
                    <ErrorOutlineIcon fontSize="small" />
                    {err}
                  </Box>
                </TableCell>
              </TableRow>
            ) : empty ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Box sx={{ py: 3, color: "#555" }}>No pending/picked emergency requests.</Box>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r) => {
                const p = first((r as any).patientData) || (r.patientId as any) || {};
                const patientName = (p as any)?.username || "Patient";

                const whenISO =
                  r.appointmentDateTime ||
                  (r.appointmentDate ? new Date(r.appointmentDate).toISOString() : undefined);

                const isSaving = !!saving[r._id];
                const status = String(r.status || "pending").toLowerCase();

                const canPick = status === "pending";

                const apptId = String(r._id);
                const patientHere = !!patientOnline[apptId];

                const timeUp = isTimeUp(r, nowTs);

                const canJoinNow =
                  r.appointmentType === "online" && status === "picked_up" && patientHere;

                return (
                  <TableRow key={apptId} hover>
                    <TableCell>
                      <Typography sx={{ fontWeight: 600 }}>{patientName}</Typography>
                    </TableCell>

                    <TableCell sx={{ textTransform: "capitalize" }}>
                      <Chip
                        size="small"
                        label={r.appointmentType || "-"}
                        color={r.appointmentType === "online" ? "info" : "default"}
                        sx={{ mr: 0.5 }}
                      />
                      <Chip
                        size="small"
                        label={patientHere ? "Patient online" : "Patient offline"}
                        color={patientHere ? "success" : "default"}
                        variant={patientHere ? "filled" : "outlined"}
                        sx={{ ml: 1 }}
                      />
                    </TableCell>

                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <PlaceIcon fontSize="small" sx={{ color: "#7A4D9C" }} />
                        <Typography>{r.location || "-"}</Typography>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <AccessTimeIcon fontSize="small" sx={{ color: "#7A4D9C" }} />
                        <Typography>{fmtIST(whenISO || undefined)}</Typography>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <StatusChip status={r.status} />
                    </TableCell>

                    <TableCell align="right">
                      <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                        {canPick ? (
                          <>
                            <Button
                              size="small"
                              variant="contained"
                              disabled={isSaving || !token}
                              onClick={() => pickOrSchedule(r, "picked_up")}
                            >
                              {isSaving ? "Picking..." : "Pick up"}
                            </Button>

                            {/* <Select
                              size="small"
                              value={selection[r._id] ?? ""}
                              displayEmpty
                              disabled={isSaving || !token}
                              onChange={(e) => {
                                const v = (e.target.value || "") as "picked_up" | "scheduled" | "";
                                if (!v) return;
                                setSelection((s) => ({ ...s, [r._id]: v }));
                                pickOrSchedule(r, v);
                              }}
                              sx={{ minWidth: 140, ml: 1 }}
                              renderValue={(val) =>
                                val ? String(val).replace("_", " ") : "Set status…"
                              }
                            >
                              <MenuItem value="" disabled>
                                Set status…
                              </MenuItem>
                              {STATUS_PICK_OPTIONS.map((opt) => (
                                <MenuItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </MenuItem>
                              ))}
                            </Select> */}

                            {/* 👁️ View (eye) — ALWAYS visible */}
                            <Tooltip title="View details">
                              <span>
                                <IconButton
                                  size="small"
                                  color="info"
                                  onClick={() =>
                                    router.push(paths.dashboard.appointmentDetails_id(apptId))
                                  }
                                  sx={{ ml: 0.5 }}
                                >
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </>
                        ) : (
                          <>
                            {r.appointmentType === "online" && status === "picked_up" ? (
                              canJoinNow ? (
                                <Button
                                  size="small"
                                  variant="contained"
                                  startIcon={
                                    isSaving ? (
                                      <CircularProgress size={14} color="inherit" />
                                    ) : (
                                      <VideoCallIcon />
                                    )
                                  }
                                  onClick={() => createRoomAndJoin(r)}
                                  disabled={isSaving || !token}
                                  sx={{ textTransform: "none" }}
                                >
                                  {isSaving ? "Joining..." : "Join Call"}
                                </Button>
                              ) : timeUp ? (
                                <Chip size="small" variant="outlined" label="Call window closed" />
                              ) : (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  disabled
                                  startIcon={<CircularProgress size={14} />}
                                  sx={{ textTransform: "none" }}
                                  onClick={() => {
                                    try {
                                      const s = getApptSocket();
                                      s?.emit("appointment:get_state", {
                                        appointmentId: String(r._id),
                                      });
                                    } catch {}
                                  }}
                                >
                                  Waiting for patient…
                                </Button>
                              )
                            ) : null}

                            {/* 👁️ View (eye) — ALSO visible here */}
                            <Tooltip title="View details">
                              <span>
                                <IconButton
                                  size="small"
                                  color="info"
                                  onClick={() =>
                                    router.push(paths.dashboard.appointmentDetails_id(apptId))
                                  }
                                >
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          rowsPerPageOptions={[5, 10, 25]}
          count={count}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={limit}
          onRowsPerPageChange={(e) => {
            setLimit(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </TableContainer>
    </Box>
  );
}
