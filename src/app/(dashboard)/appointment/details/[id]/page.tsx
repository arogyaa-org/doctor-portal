"use client";

import React, { useState, useEffect } from "react";
import {
  Typography,
  Grid,
  Paper,
  Avatar,
  IconButton,
  Button,
  useMediaQuery,
  useTheme,
  Box,
  Select,
  MenuItem,
  Collapse,
  Card,
  CardContent,
  Stack,
  Chip,
  Skeleton,
  Modal,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  Info as InfoIcon,
  MedicalServices as MedicalIcon,
  LocalHospital as HospitalIcon,
  LocationOn as LocationIcon,
  Wc as GenderIcon,
  CalendarMonth as CalendarMonthIcon,
  Assignment as AssignmentIcon,
  Phone as PhoneIcon,
  ArrowBack as ArrowBackIcon,
  Event as EventIcon,
  AccessTime as AccessTimeIcon,
  Mail as MailIcon,
  Cake as CakeIcon,
  AcUnit as AcUnitIcon,
  PersonPinCircle as PersonPinCircleIcon,
  MedicationLiquid as MedicationLiquidIcon,
  AlignHorizontalLeft as AlignHorizontalLeftIcon,
  MonitorWeight as MonitorWeightIcon,
  Bloodtype as BloodtypeIcon,
  LocationCity as LocationCityIcon,
  AllInbox as AllInboxIcon,
  HourglassEmpty,
  Cancel,
  ChevronRight as ChevronRightIcon,
  Videocam as VideocamIcon,
  VideocamOff as VideocamOffIcon,
  ExpandLess,
  ExpandMore,
  CheckCircle as CompletedIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

import Toast from "@/components/common/Toast";
import TreatmentHistory from "./treatmentHistory";
import TestHistory from "./testHistory";
import VisitsHistory from "./visitHistory";

import { useGetAppointment } from "@/hooks/appointment";
import { useGetPatient } from "@/hooks/patient";
import { useRouter, useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { modifier } from "@/apis/apiClient";
import { setAppointment } from "@/redux/features/appointmentSlice";
import { Utility } from "@/utils";

/* --------------------------- Constants & Options -------------------------- */

const statusOptions = [
  {
    value: "scheduled",
    label: "Scheduled",
    color: "#0056b3",
    bgColor: "#e3f2fd",
    icon: <EventIcon fontSize="small" />,
  },
  {
    value: "rescheduled",
    label: "Rescheduled",
    color: "#856404",
    bgColor: "#fff3cd",
    icon: <HourglassEmpty fontSize="small" />,
  },
  {
    value: "rejected",
    label: "Rejected",
    color: "#dc3545",
    bgColor: "#f8d7da",
    icon: <Cancel fontSize="small" />,
  },
  {
    value: "pending",
    label: "Pending",
    color: "#f39c12",
    bgColor: "#fff3cd",
    icon: <HourglassEmpty fontSize="small" />,
  },
  {
    value: "completed",
    label: "Completed",
    color: "#28a745",
    bgColor: "#d4edda",
    icon: <CompletedIcon fontSize="small" />,
  },
];

/* --------------------------------- Styles -------------------------------- */

const MainLayout = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  minHeight: "100vh",
}));

const ContentArea = styled(Box)(({ theme }) => ({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  transition: "all 0.3s ease-in-out",
  overflow: "hidden",
  marginRight: 0,
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 56,
  height: 56,
  fontSize: "1.5rem",
  fontWeight: 600,
}));

const PatientInfoCard = styled(Card)(({ theme }) => ({
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  color: "white",
  borderRadius: theme.spacing(2),
  boxShadow: "0 8px 32px rgba(31, 38, 135, 0.37)",
  backdropFilter: "blur(8px)",
  border: "1px solid rgba(255, 255, 255, 0.18)",
  marginBottom: theme.spacing(3),
}));

const InfoChip = styled(Chip)(({ theme }) => ({
  backgroundColor: "rgba(255, 255, 255, 0.2)",
  color: "white",
  fontWeight: 500,
  "& .MuiChip-icon": { color: "white" },
  margin: theme.spacing(0.5),
}));

const TabContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  overflowX: "auto",
  gap: theme.spacing(1),
  marginBottom: theme.spacing(3),
  padding: theme.spacing(1),
  backgroundColor: "white",
  borderRadius: theme.spacing(1),
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  "&::-webkit-scrollbar": { height: "4px" },
  "&::-webkit-scrollbar-thumb": {
    borderRadius: "2px",
  },
}));

const StyledTab = styled(Button, {
  shouldForwardProp: (prop) => prop !== "active",
})(({ theme, active }: { theme?: any; active?: boolean }) => ({
  minWidth: "120px",
  padding: theme.spacing(1.5, 2),
  borderRadius: theme.spacing(1),
  textTransform: "none",
  fontWeight: 600,
  whiteSpace: "nowrap",
  transition: "all 0.3s ease",
  backgroundColor: active ? theme.palette.primary.main : "transparent",
  color: active ? "white" : theme.palette.text.primary,
  "&:hover": {
    backgroundColor: active
      ? theme.palette.primary.dark
      : theme.palette.action.hover,
  },
}));

const DetailCard = styled(Card)(({ theme }) => ({
  height: "100%",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
  },
}));

const EnhancedVideoButton = styled(Box)(({ theme }) => ({
  position: "fixed",
  bottom: theme.spacing(2),
  right: theme.spacing(2),
  zIndex: 1300,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: theme.palette.primary.main,
  color: "white",
  borderRadius: theme.spacing(4),
  boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  cursor: "pointer",
  overflow: "hidden",
  width: 64,
  height: 64,
  padding: 0,
  
  "&.force-expanded, &:hover": {
    backgroundColor: theme.palette.primary.dark,
    transform: "scale(1.05)",
    height: "auto",
    width: "auto",
    padding: theme.spacing(1),
  },
  
  "& .video-icon": {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 64,
    height: 64,
    flexShrink: 0,
  },
  
  "& .video-text": {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    fontWeight: 600,
    fontSize: "0.875rem",
    opacity: 0,
    transform: "translateY(-10px)",
    transition: "all 0.3s ease 0.1s",
    overflow: "hidden",
    marginTop: 0,
  },
  
  "&.force-expanded .video-text, &:hover .video-text": {
    opacity: 1,
    transform: "translateY(0)",
    marginTop: theme.spacing(0.5),
  },
}));

const StatusSelect = styled(Select, {
  shouldForwardProp: (prop) => prop !== "statuscolor" && prop !== "statusbg",
})(
  ({
    theme,
    statuscolor,
    statusbg,
  }: {
    theme?: any;
    statuscolor?: string;
    statusbg?: string;
  }) => ({
    borderRadius: theme.spacing(3),
    backgroundColor: statusbg || theme.palette.grey[100],
    color: statuscolor || theme.palette.text.primary,
    fontWeight: 600,
    "& .MuiOutlinedInput-notchedOutline": { border: "none" },
    "& .MuiSelect-select": {
      display: "flex",
      alignItems: "center",
      gap: theme.spacing(1),
      padding: theme.spacing(1, 2),
    },
  })
);

// Video Modal Styles
const VideoModal = styled(Modal)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(2),
}));

const VideoModalContent = styled(Paper)(({ theme }) => ({
  position: "relative",
  width: "90vw",
  height: "80vh",
  maxWidth: "1200px",
  backgroundColor: "black",
  borderRadius: theme.spacing(1),
  overflow: "hidden",
  outline: "none",
  display: "flex",
  flexDirection: "column",
}));

const VideoHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: theme.spacing(2),
  backgroundColor: "rgba(0, 0, 0, 0.8)",
  color: "white",
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  zIndex: 10,
}));

const VideoPlayerContainer = styled(Box)({
  flex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "black",
});

/* ------------------------------ Main Component --------------------------- */

const AppointmentDetails = () => {
  const [activeTab, setActiveTab] = useState<
    "info" | "visits" | "tests" | "treatment"
  >("info");
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>(
    {}
  );
  const [isVideoButtonExpanded, setIsVideoButtonExpanded] = useState(true);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const router = useRouter();
  const { toastAndNavigate } = Utility();
  const { toast } = useSelector((state: any) => state.toast);
  const dispatch = useDispatch();

  const params = useParams();
  const appointmentId = (params as any)?.id;

  const { value: appointmentData, swrLoading: appointmentLoading } =
    useGetAppointment(null, `get-appointment-by-id/${appointmentId}`);

  const patientId = appointmentData?.data?.patientId?._id || appointmentData?.data?.patientId || null;

  const { value: patientData, swrLoading: patientLoading } = useGetPatient(
    null,
    `get-patient-by-id/${patientId}`,
    1,
    1
  );
console.log(appointmentData,"appointmentData");
  useEffect(() => {
    if (appointmentData?.data?.status) setStatus(appointmentData.data.status);
  }, [appointmentData?.data?.status]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVideoButtonExpanded(false);
    }, 7000);
    return () => clearTimeout(timer);
  }, []);

  const toggleVideoModal = () => setShowVideoModal((v) => !v);

  const toggleCardExpansion = (cardId: string) =>
    setExpandedCards((prev) => ({ ...prev, [cardId]: !prev[cardId] }));

  const handleStatusChange = async (newStatus: string) => {
    try {
      await modifier("appointment", "update-appointment", {
        _id: appointmentId,
        status: newStatus,
      });

      const updatedResults = appointmentData?.data?.results?.map((a: any) =>
        a._id === appointmentId ? { ...a, status: newStatus } : a
      );
      const updatedAppointment = {
        ...appointmentData,
        results: updatedResults,
      };

      dispatch(setAppointment(updatedAppointment));
      toastAndNavigate(
        dispatch,
        true,
        "success",
        "Status updated successfully"
      );
    } catch (error) {
      console.error("Error updating status:", error);
      toastAndNavigate(dispatch, true, "error", "Failed to update status");
    }
  };

  const getInitial = (name?: string) =>
    name ? name.charAt(0).toUpperCase() : "P";

  const convertHeightToMeters = (height?: string) => {
    if (!height || height === "None") return 0;
    const h = height.toLowerCase();
    if (h.includes("feet") || h.includes("ft")) {
      const parts = height.split(" ");
      const feet = parseInt(parts[0], 10);
      const cm = parseInt(parts[2], 10) || 0;
      const totalCm = feet * 30.48 + cm;
      return totalCm / 100;
    }
    if (h.includes("cm")) return parseFloat(height) / 100;
    if (h.includes("m")) return parseFloat(height);
    return 0;
  };

  const calculateBMI = (height?: string, weight?: string) => {
    const heightInMeters = convertHeightToMeters(height);
    const weightInKg = parseFloat(weight || "");
    if (heightInMeters && weightInKg)
      return weightInKg / (heightInMeters * heightInMeters);
    return null;
  };

  const getBMICategory = (bmi: number | null) => {
    if (bmi === null) return "N/A";
    if (bmi < 18.5) return "Underweight";
    if (bmi <= 24.9) return "Normal weight";
    if (bmi <= 29.9) return "Overweight";
    if (bmi <= 34.9) return "Obesity (Class 1)";
    if (bmi <= 39.9) return "Obesity (Class 2)";
    return "Severe Obesity (Class 3)";
  };

  const patientHeight = patientData?.data?.height || "None";
  const patientWeight = patientData?.data?.weight || "None";
  const bmi = calculateBMI(patientHeight, patientWeight);
  const bmiCategory = getBMICategory(bmi);

  const currentStatus = statusOptions.find((o) => o.value === status);

  const patientDetails = [
    {
      category: "Personal Information",
      icon: <GenderIcon />,
      items: [
        {
          icon: <GenderIcon />,
          label: "Gender",
          value: patientData?.data?.gender || "N/A",
        },
        {
          icon: <CakeIcon />,
          label: "Age",
          value: patientData?.data?.age || "N/A",
        },
        {
          icon: <MailIcon />,
          label: "Email",
          value: patientData?.data?.email || "N/A",
        },
        {
          icon: <PhoneIcon />,
          label: "Phone",
          value: patientData?.data?.contact || "N/A",
        },
        {
          icon: <CalendarMonthIcon />,
          label: "DOB",
          value: patientData?.data?.dob
            ? format(new Date(patientData?.data?.dob), "dd MMM yyyy")
            : "N/A",
        },
      ],
    },
    {
      category: "Location Information",
      icon: <LocationIcon />,
      items: [
        {
          icon: <PersonPinCircleIcon />,
          label: "Pincode",
          value: patientData?.data?.pincode || "N/A",
        },
        {
          icon: <LocationCityIcon />,
          label: "City",
          value: patientData?.data?.city || "N/A",
        },
        {
          icon: <LocationIcon />,
          label: "Address",
          value: patientData?.data?.address || "N/A",
        },
      ],
    },
    {
      category: "Medical Information",
      icon: <MedicalIcon />,
      items: [
        {
          icon: <AcUnitIcon />,
          label: "Allergies",
          value: patientData?.data?.allergies?.join(", ") || "None",
        },
        {
          icon: <BloodtypeIcon />,
          label: "Blood Group",
          value: patientData?.data?.bloodGroup || "N/A",
        },
        {
          icon: <AlignHorizontalLeftIcon />,
          label: "Height",
          value: patientData?.data?.height || "N/A",
        },
        {
          icon: <MonitorWeightIcon />,
          label: "Weight",
          value: patientData?.data?.weight || "N/A",
        },
        {
          icon: <AllInboxIcon />,
          label: "BMI Index",
          value: `${bmi ? bmi.toFixed(2) : "N/A"} - ${bmiCategory}`,
        },
        {
          icon: <MedicationLiquidIcon />,
          label: "Current Medication",
          value: patientData?.data?.currentMedication?.join(", ") || "None",
        },
        {
          icon: <MedicalIcon />,
          label: "Medical History",
          value: patientData?.data?.medicalHistory?.join(", ") || "None",
        },
      ],
    },
  ];

  const tabs = [
    {
      key: "info",
      name: "Patient Info",
      icon: <InfoIcon />,
      content: (
        <PatientInfoContent
          patientDetails={patientDetails}
          expandedCards={expandedCards}
          toggleCardExpansion={toggleCardExpansion}
          loading={patientLoading}
        />
      ),
    },
    {
      key: "visits",
      name: "Visit History",
      icon: <HospitalIcon />,
      content: (
        <VisitsHistory
          patientId={patientId}
          doctorID={appointmentData?.data?.doctorId?._id}
          onTabChange={setActiveTab as any}
        />
      ),
    },
    {
      key: "tests",
      name: "Test",
      icon: <AssignmentIcon />,
      content: <TestHistory patientId={patientId} />,
    },
    {
      key: "treatment",
      name: "Treatment Plan",
      icon: <MedicalIcon />,
      content: <TreatmentHistory patientId={patientId} />,
    },
  ] as const;

  if (appointmentLoading) return <LoadingSkeleton />;

  return (
    <>
      <MainLayout>
        <ContentArea>
          {/* Header */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <IconButton onClick={() => router.back()} sx={{ mr: 2 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" fontWeight="bold" color="primary">
              Appointment Details
            </Typography>
          </Box>

          {/* Patient Overview Card */}
          <PatientInfoCard>
            <CardContent sx={{ p: 3 }}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={3}
                alignItems={{ xs: "center", sm: "flex-start" }}
              >
                <StyledAvatar>
                  {getInitial(patientData?.data?.username)}
                </StyledAvatar>

                <Box flex={1} textAlign={{ xs: "center", sm: "left" }}>
                  <Typography variant="h4" fontWeight="bold" gutterBottom>
                    {patientData?.data?.username || "Loading..."}
                  </Typography>

                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1}
                    alignItems="center"
                    justifyContent={{ xs: "center", sm: "flex-start" }}
                    flexWrap="wrap"
                  >
                    <InfoChip
                      icon={<EventIcon />}
                      label={
                        appointmentData?.data?.appointmentDate
                          ? format(
                              new Date(appointmentData.data.appointmentDate),
                              "dd MMM yyyy"
                            )
                          : "N/A"
                      }
                    />
                    <InfoChip
                      icon={<AccessTimeIcon />}
                      label={appointmentData?.data?.appointmentTime || "N/A"}
                    />
                  </Stack>
                </Box>

                <Box>
                  <StatusSelect
                    value={status || ""}
                    onChange={(e: any) => {
                      setStatus(e.target.value);
                      handleStatusChange(e.target.value);
                    }}
                    displayEmpty
                    size="small"
                    statuscolor={currentStatus?.color}
                    statusbg={currentStatus?.bgColor}
                  >
                    {statusOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          {option.icon}
                          {option.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </StatusSelect>
                </Box>
              </Stack>
            </CardContent>
          </PatientInfoCard>

          {/* Tabs */}
          <TabContainer>
            {tabs.map((tab) => (
              <StyledTab
                key={tab.key}
                active={activeTab === tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                startIcon={tab.icon}
              >
                {tab.name}
              </StyledTab>
            ))}
          </TabContainer>

          {/* Tab Content */}
          <Box sx={{ flex: 1, overflow: "auto" }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {tabs.find((t) => t.key === activeTab)?.content}
              </motion.div>
            </AnimatePresence>
          </Box>
        </ContentArea>

        {/* Enhanced Video Toggle Button with Hover Text */}
        <EnhancedVideoButton
          className={isVideoButtonExpanded ? "force-expanded" : ""}
          onClick={toggleVideoModal}
        >
          <Box className="video-icon">
            <VideocamIcon />
          </Box>
          <Box className="video-text">
            {["Patient", "Symptom", "Video"].map((word, wdx) => (
              <Typography
                key={wdx}
                component="span"
                variant="body2"
                sx={{ fontWeight: 600 }}
              >
                {word}
              </Typography>
            ))}
          </Box>
        </EnhancedVideoButton>

        {/* Video Modal */}
        <VideoModal
          open={showVideoModal}
          onClose={() => setShowVideoModal(false)}
          aria-labelledby="video-modal-title"
          aria-describedby="video-modal-description"
        >
          <VideoModalContent>
            <VideoHeader>
              <Typography
                id="video-modal-title"
                variant="h6"
                fontWeight="bold"
                color="white"
              >
                Patient Symptoms Video
              </Typography>
              <IconButton
                onClick={() => setShowVideoModal(false)}
                sx={{ color: "white" }}
              >
                <CloseIcon />
              </IconButton>
            </VideoHeader>

            <VideoPlayerContainer>
              {appointmentData?.data?.videoUrl ? (
                <ReactPlayer
                  url={appointmentData.data.videoUrl}
                  width="100%"
                  height="100%"
                  controls
                  playing={false}
                  volume={1}
                  muted={false}
                  playsinline={false}
                  pip={true}
                  stopOnUnmount={false}
                  config={{
                    file: {
                      attributes: {
                        controlsList: "nodownload",
                        disablePictureInPicture: false,
                      },
                    },
                  }}
                  onContextMenu={(e) => e.preventDefault()}
                  style={{
                    backgroundColor: "black",
                  }}
                />
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    textAlign: "center",
                    p: 4,
                  }}
                >
                  <VideocamOffIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
                  <Typography variant="h6" gutterBottom>
                    No Video Available
                  </Typography>
                  <Typography variant="body2" color="rgba(255,255,255,0.7)">
                    The patient has not uploaded any symptom video for this
                    appointment.
                  </Typography>
                </Box>
              )}
            </VideoPlayerContainer>
          </VideoModalContent>
        </VideoModal>
      </MainLayout>

      <Toast
        alerting={toast.toastAlert}
        severity={toast.toastSeverity}
        message={toast.toastMessage}
      />
    </>
  );
};

/* -------------------------- Helper Subcomponents -------------------------- */

const PatientInfoContent = ({
  patientDetails,
  expandedCards,
  toggleCardExpansion,
  loading,
}: {
  patientDetails: any[];
  expandedCards: Record<string, boolean>;
  toggleCardExpansion: (id: string) => void;
  loading: boolean;
}) => {
  if (loading) return <LoadingSkeleton />;

  return (
    <Grid container spacing={3}>
      {patientDetails.map((category) => (
        <Grid item xs={12} md={6} lg={4} key={category.category}>
          <DetailCard>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 2,
                  cursor: "pointer",
                }}
                onClick={() => toggleCardExpansion(category.category)}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {category.icon}
                  <Typography variant="h6" fontWeight="bold">
                    {category.category}
                  </Typography>
                </Box>
                {expandedCards[category.category] ? (
                  <ExpandLess />
                ) : (
                  <ExpandMore />
                )}
              </Box>

              <Collapse in={expandedCards[category.category] !== false}>
                <Stack spacing={2}>
                  {category.items.map((item: any, idx: number) => (
                    <Box
                      key={idx}
                      sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}
                    >
                      {item.icon}
                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                        >
                          {item.label}
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {item.value}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Collapse>
            </CardContent>
          </DetailCard>
        </Grid>
      ))}
    </Grid>
  );
};

const LoadingSkeleton = () => (
  <Box sx={{ p: 3 }}>
    <Stack spacing={3}>
      <Skeleton variant="rectangular" height={200} />
      <Grid container spacing={2}>
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item}>
            <Skeleton variant="rectangular" height={150} />
          </Grid>
        ))}
      </Grid>
    </Stack>
  </Box>
);

export default AppointmentDetails;
