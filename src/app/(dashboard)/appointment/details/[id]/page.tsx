"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  Typography,
  Grid,
  Paper,
  Avatar,
  IconButton,
  Chip,
  Button,
  useMediaQuery,
  useTheme,
  Box,
  styled,
  Select,
  MenuItem,
  Collapse,
} from "@mui/material";
import {
  Info as InfoIcon,
  MedicalServices as MedicalIcon,
  LocalHospital as HospitalIcon,
  PlayCircleOutline as PlayIcon,
  LocationOn as LocationIcon,
  Wc as GenderIcon,
  CalendarMonth as CalendarMonthIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
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
  CheckCircle,
  Cancel,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  CheckCircle as CompletedIcon,
} from "@mui/icons-material";
import { format, parse } from "date-fns";
import { motion } from "framer-motion";
import ReactPlayer from "react-player";

import Toast from "@/components/common/Toast";
import TreatmentHistory from "./treatmentHistory";
import TestHistory from "./testHistory";
import type { AppDispatch, RootState } from "@/redux/store";
import { useGetAppointment } from "@/hooks/appointment";
import { useGetPatient } from "@/hooks/patient";
import { useRouter, useParams } from "next/navigation";
import VisitsHistory from "./visitHistory";
import { useDispatch, useSelector } from "react-redux";
import { modifier } from "@/apis/apiClient";
import { setAppointment, setLoading } from "@/redux/features/appointmentSlice";
import { Utility } from "@/utils";

const statusOptions = [
  {
    value: "scheduled",
    label: "Scheduled",
    color: "#0056b3",
    icon: <EventIcon fontSize="small" />,
  },
  {
    value: "rescheduled",
    label: "Rescheduled",
    color: "#856404",
    icon: <HourglassEmpty fontSize="small" />,
  },
  {
    value: "rejected",
    label: "Rejected",
    color: "red",
    icon: <Cancel fontSize="small" />,
  },
  {
    value: "pending",
    label: "Pending",
    color: "#f39c12",
    icon: <HourglassEmpty fontSize="small" />,
  },
  {
    value: "completed",
    label: "Completed",
    icon: <CompletedIcon fontSize="small" color="success" />,
    color: "success",
  },
];

// eslint-disable-next-line react/function-component-definition
const AppointmentDetails = () => {
  const [activeTab, setActiveTab] = useState("info");
  const [showVideo, setShowVideo] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const router = useRouter();
  const { toastAndNavigate } = Utility();
  const [status, setStatus] = useState<string | undefined>(undefined);
  const { toast } = useSelector((state: RootState) => state.toast);
  const dispatch: AppDispatch = useDispatch();

  const params = useParams();
  const appointmentId = params?.id as string;

  const StyledAvatar = styled(Avatar)(({ theme }) => ({
    width: 64,
    height: 64,
    backgroundColor: "#4FC3F7",
    fontSize: "1.5rem",
    marginBottom: theme.spacing(1),
  }));

  const AppointmentInfoChip = styled(Box)(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0.5, 1.5),
    backgroundColor: "#e3f2fd",
    borderRadius: 16,
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(1),
    "& .MuiSvgIcon-root": {
      fontSize: "1rem",
      marginRight: theme.spacing(0.5),
      color: "#1976d2",
    },
  }));

  const VideoToggleButton = styled(IconButton)(({ theme }) => ({
    position: "absolute",
    right: 0,
    top: "50%",
    transform: "translateY(-50%)",
    backgroundColor: theme.palette.primary.main,
    color: "white",
    zIndex: 10,
    width: 20,
    height: 70,
    borderRadius: "6px 0 0 6px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
      width: 25,
    },
  }));

  const getInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : "P";
  };

  const {
    value: appointmentData,
    swrLoading,
    refetch,
  } = useGetAppointment(null, `get-appointment-by-id/${appointmentId}`);

  const patientId = appointmentData?.data?.patientId._id || null;
  const symptomIds = appointmentData?.data?.symptomIds || [];

  const { value: patientData, swrLoading: patientLoading } = useGetPatient(
    null,
    `get-patient-by-id/${patientId}`,
    1,
    1
  );

  useEffect(() => {
    if (appointmentData) {
      setStatus(appointmentData?.data?.status);
      refetch();
    }
  }, [appointmentData, refetch]);

  const toggleVideo = () => {
    setShowVideo(!showVideo);
    if (!showVideo) {
      setIsHovering(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await modifier("appointment", "update-appointment", {
        _id: appointmentId,
        status: newStatus,
      });

      const updatedResults = appointmentData?.data?.results?.map(
        (appointment) =>
          appointment._id === appointmentId
            ? { ...appointment, status: newStatus }
            : appointment
      );

      const updatedAppointment = {
        ...appointmentData,
        results: updatedResults,
      };

      dispatch(setAppointment(updatedAppointment));

      toastAndNavigate(dispatch, true, "success", "Status updated sucessfully");
    } catch (error) {
      console.error("Error updating status:", error);
      toastAndNavigate(dispatch, true, "error", "Failed to update status");
    }
  };

  const handleTabChange = (tabKey: string) => {
    setActiveTab(tabKey);
  };

  const convertHeightToMeters = (height: string) => {
    if (
      height.toLowerCase().includes("feet") ||
      height.toLowerCase().includes("ft")
    ) {
      const parts = height.split(" ");
      const feet = parseInt(parts[0], 10);
      const cm = parseInt(parts[2], 10);
      const totalCm = feet * 30.48 + cm;
      return totalCm / 100;
    }
    if (height.toLowerCase().includes("cm")) {
      return parseFloat(height) / 100;
    }
    if (height.toLowerCase().includes("m")) {
      return parseFloat(height);
    }
    return 0;
  };

  const calculateBMI = (height: string, weight: string) => {
    const heightInMeters = convertHeightToMeters(height);
    const weightInKg = parseFloat(weight);
    if (heightInMeters && weightInKg) {
      return weightInKg / (heightInMeters * heightInMeters);
    }
    return null;
  };

  const getBMICategory = (bmi: number | null) => {
    if (bmi === null) return "N/A";
    if (bmi < 18.5) return "Underweight";
    if (bmi >= 18.5 && bmi <= 24.9) return "Normal weight";
    if (bmi >= 25 && bmi <= 29.9) return "Overweight";
    if (bmi >= 30 && bmi <= 34.9) return "Obesity (Class 1)";
    if (bmi >= 35 && bmi <= 39.9) return "Obesity (Class 2)";
    return "Severe Obesity (Class 3)";
  };

  const patientHeight = patientData?.data?.height || "None";
  const patientWeight = patientData?.data?.weight || "None";
  const bmi = calculateBMI(patientHeight, patientWeight);
  const bmiCategory = getBMICategory(bmi);

  const tabs = [
    {
      key: "info",
      name: "Info",
      icon: <InfoIcon sx={{ color: "#3f51b5" }} />,
      content:
        appointmentData === null ? (
          <Typography variant="h6" color="primary">
            Loading...
          </Typography>
        ) : (
          <>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "auto 1fr",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                {/* Avatar in the first column */}
                <StyledAvatar
                  sx={{
                    width: 75,
                    height: 75,
                    fontSize: "2.5rem",
                  }}
                >
                  {getInitial(patientData?.data?.username)}
                </StyledAvatar>

                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  {/* Name aligned with chip text (not icon) */}
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    sx={{
                      ml: 4,
                      mb: 1,
                      marginLeft: "-7px",
                    }}
                  >
                    {patientData?.data?.username}
                  </Typography>

                  <AppointmentInfoChip
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      width: "fit-content",
                      marginLeft: "-13.5px",
                    }}
                  >
                    <EventIcon sx={{ mr: 0.5, ml: 0.5 }} />
                    <Typography variant="body2" sx={{ mr: 1 }}>
                      {appointmentData?.data?.appointmentDate
                        ? format(
                            new Date(appointmentData?.data?.appointmentDate),
                            "dd MMM yyyy"
                          )
                        : "N/A"}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <AccessTimeIcon sx={{ mr: 0.5 }} />
                      <Typography variant="body2">
                        {appointmentData?.data?.appointmentTime
                          ? (() => {
                              try {
                                const timeString =
                                  appointmentData.data.appointmentTime;
                                if (
                                  !timeString ||
                                  !/^\d{1,2}:\d{2}\s[AP]M$/.test(timeString)
                                ) {
                                  return "N/A";
                                }
                                const parsedTime = parse(
                                  timeString,
                                  "hh:mm a",
                                  new Date()
                                );
                                return format(parsedTime, "hh:mm a");
                              } catch (error) {
                                console.error(
                                  "Error parsing appointment time:",
                                  error
                                );
                                return "Invalid Time";
                              }
                            })()
                          : "N/A"}
                      </Typography>
                    </Box>
                  </AppointmentInfoChip>
                </Box>
              </Box>

              {/* Status */}
              <Box sx={{ display: "flex", gap: 1 }}>
                <Select
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    handleStatusChange(e.target.value);
                  }}
                  variant="outlined"
                  size="small"
                  displayEmpty
                  sx={{
                    borderRadius: "20px",
                    width: "100%",
                    height: "36px",
                    textAlign: "center",
                    backgroundColor: statusOptions.find(
                      (option) => option.value === status
                    )
                      ? statusOptions.find((option) => option.value === status)
                          ?.color + "30"
                      : "#f8f9fa",
                    color:
                      statusOptions.find((option) => option.value === status)
                        ?.color || "#000",
                    fontWeight: "500",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    "& .MuiSelect-select": {
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                    },
                  }}
                  renderValue={() => {
                    const selectedStatusOption = statusOptions.find(
                      (option) => option.value === status
                    );
                    return selectedStatusOption ? (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        {selectedStatusOption.icon}
                        <Typography
                          sx={{
                            fontWeight: 500,
                            color: selectedStatusOption.color,
                          }}
                        >
                          {selectedStatusOption.label}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography sx={{ fontWeight: 500 }}>
                        Select Status
                      </Typography>
                    );
                  }}
                >
                  {statusOptions
                    .filter((option) => option.value !== status)
                    .map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                            color: option.color,
                          }}
                        >
                          {option.icon}
                          {option.label}
                        </Box>
                      </MenuItem>
                    ))}
                </Select>
              </Box>
            </Box>

            {/* Grid container with increased padding-left for better spacing */}
            <Grid container spacing={0.5} sx={{ marginTop: -0.5, pl: 2 }}>
              {[
                {
                  icon: <GenderIcon color="primary" />,
                  label: "Gender",
                  value: patientData?.data?.gender || "N/A",
                },
                {
                  icon: <GenderIcon color="primary" />,
                  label: "Age",
                  value: patientData?.data?.age || "N/A",
                },
                {
                  icon: <MailIcon color="primary" />,
                  label: "Email",
                  value: patientData?.data?.email,
                },
                {
                  icon: <PhoneIcon color="primary" />,
                  label: "phone",
                  value: patientData?.data?.contact || "N/A",
                },
                {
                  icon: <CakeIcon color="primary" />,
                  label: "DOB",
                  value: patientData?.data?.dob
                    ? format(new Date(patientData?.data?.dob), "dd MMM yyyy")
                    : "N/A",
                },
                {
                  icon: <PersonPinCircleIcon color="primary" />,
                  label: "Pincode",
                  value: patientData?.data?.pincode,
                },
                {
                  icon: <LocationCityIcon color="primary" />,
                  label: "City",
                  value: patientData?.data?.city,
                },
                {
                  icon: <AcUnitIcon color="primary" />,
                  label: "Allergies",
                  value: patientData?.data?.allergies?.join(", "),
                },
                {
                  icon: <BloodtypeIcon color="primary" />,
                  label: "Blood Group",
                  value: patientData?.data?.bloodGroup,
                },
                {
                  icon: <AlignHorizontalLeftIcon color="primary" />,
                  label: "Height",
                  value: patientData?.data?.height,
                },
                {
                  icon: <MonitorWeightIcon color="primary" />,
                  label: "Weight",
                  value: patientData?.data?.weight,
                },
                {
                  icon: <AllInboxIcon color="primary" />,
                  label: "BMI Index",
                  value: `${bmi ? bmi.toFixed(2) : "N/A"} - ${bmiCategory}`,
                },
                {
                  icon: <MedicationLiquidIcon color="primary" />,
                  label: "Current Medication",
                  value: patientData?.data?.currentMedication?.join(", "),
                },
                {
                  icon: <LocationIcon color="primary" />,
                  label: "Address",
                  value: patientData?.data?.address,
                },
                {
                  icon: <MedicalIcon color="primary" />,
                  label: "Medical History",
                  value: patientData?.data?.medicalHistory?.join(", "),
                },
              ].map((detail, index) => (
                <Grid item xs={12} sm={4} key={index}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      paddingTop: 2,
                      paddingBottom: 2,
                    }}
                  >
                    {detail.icon}
                    <div>
                      <Typography variant="caption" color="text.secondary">
                        {detail.label}
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight="medium"
                        color="text.primary"
                      >
                        {detail.value}
                      </Typography>
                    </div>
                  </div>
                </Grid>
              ))}
            </Grid>
          </>
        ),
    },
    {
      key: "visits",
      icon: <HospitalIcon sx={{ color: "#4CAF50" }} />,
      name: "Visits",
      content: (
        <VisitsHistory
          patientId={patientId}
          doctorID={appointmentData?.data?.doctorId._id}
          onTabChange={handleTabChange}
        />
      ),
    },
    {
      key: "tests",
      icon: <AssignmentIcon sx={{ color: "#FF9800" }} />,
      name: "Tests",
      content: (
        <div>
          <TestHistory patientId={patientId} />
        </div>
      ),
    },
    {
      key: "treatment",
      icon: <MedicalIcon sx={{ color: "#9C27B0" }} />,
      name: "Treatment",
      content: (
        <div>
          <TreatmentHistory patientId={patientId} />
        </div>
      ),
    },
  ];

  return (
    <Box sx={{ display: "flex", position: "relative", height: "100vh" }}>
      {/* Main content section - will resize when video is shown */}
      <Box
        sx={{
          flex: showVideo ? "0 0 65%" : 1,
          transition: "all 0.00003s ease",
          padding: isSmallScreen ? 0.5 : 1,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: 0,
          }}
        >
          {/* Heading and Back Button in the same row */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              marginBottom: 1,
            }}
          >
            {/* Back Button */}
            <IconButton
              onClick={() => router.back()}
              sx={{
                marginRight: 1,
              }}
            >
              <ArrowBackIcon sx={{ color: "primary.main" }} />
            </IconButton>

            <Typography
              variant="h4"
              sx={{
                fontWeight: 600,
                marginBottom: 0,
              }}
            >
              Appointment Details
            </Typography>
          </Box>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 4,
              marginBottom: 12,
              backgroundColor: "#f0f4f8",
              borderRadius: 6,
              padding: 6,
            }}
          >
            {tabs.map((tab) => (
              <Button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                variant={activeTab === tab.key ? "contained" : "text"}
                color="primary"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  textTransform: "none",
                  padding: "8px 12px",
                  minWidth: "90px",
                  color: activeTab === tab.key ? "blue" : "black",
                  bgcolor:
                    activeTab === tab.key ? "rgba(63,81,181,0.1)" : "none",
                  "&:hover": {
                    bgcolor: "rgba(63,81,181,0.05)",
                  },
                }}
              >
                {tab.icon}
                <Typography variant="body1" fontWeight="medium">
                  {tab.name}
                </Typography>
              </Button>
            ))}
          </div>

          {/* Removed Paper component and now content is displayed directly */}
          <Box
            sx={{
              maxHeight: isSmallScreen ? "auto" : "calc(100vh - 120px)",
              overflowY: "auto",
              mt: 1,
            }}
          >
            {tabs.find((tab) => tab.key === activeTab)?.content}
          </Box>
        </div>
      </Box>

      <Box position="relative">
        <motion.div
          initial={{ x: "100vw" }}
          animate={{ x: 0 }}
          transition={{
            type: "spring",
            stiffness: 50,
            damping: 20,
            duration: 0.8,
          }}
        >
          <VideoToggleButton
            onClick={toggleVideo}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            {showVideo ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </VideoToggleButton>
        </motion.div>

        {isHovering && !showVideo && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
            style={{
              position: "absolute",
              top: "90px",
              right: "30px",
              zIndex: 1000,
            }}
          >
            <Box
              sx={{
                backgroundColor: "white",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                padding: "8px",
                width: "200px",
                height: "120px",
                position: "relative",
              }}
            >
              <ReactPlayer
                url={appointmentData?.data?.videoUrl || ""}
                width="100%"
                height="100%"
                playing={isHovering && !showVideo}
                controls={false}
                muted
                loop
              />
              {/* Overlay message when no video is available */}
              {!appointmentData?.data?.videoUrl && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    color: "white",
                  }}
                >
                  <Typography variant="caption" textAlign="center">
                    No video available
                  </Typography>
                </Box>
              )}
              <Typography
                variant="caption"
                sx={{ mt: 1, display: "block", textAlign: "center" }}
              >
                Symptom Video Preview
              </Typography>
            </Box>
          </motion.div>
        )}
      </Box>

      <Collapse
        in={showVideo}
        orientation="horizontal"
        sx={{
          flex: showVideo ? "0 0 35%" : "0 0 0%",
          position: "relative",
          overflowY: "auto",
          borderLeft: "1px solid rgba(0,0,0,0.12)",
          transition: "all 0.3s spring",
          mt: 7,
        }}
      >
        <Box
          sx={{
            height: "100%",
            width: "100%",
            padding: 2,
            display: "flex",
            flexDirection: "column",
            background:
              "linear-gradient(to bottom right, #f0f4f8 0%, #e1e5eb 100%)",
          }}
        >
          <Paper
            elevation={6}
            sx={{
              width: "100%",
              borderRadius: 2,
              overflow: "hidden",
              position: "relative",
              boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
            }}
          >
            <Box
              sx={{
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                borderBottom: "1px solid rgba(0,0,0,0.08)",
                backgroundColor: theme.palette.primary.main,
                color: "white",
              }}
            >
              <PlayIcon />
              <Typography variant="h6" fontWeight="500">
                Patient Symptom Video
              </Typography>
            </Box>

            <Box
              sx={{
                position: "relative",
                backgroundColor: "#000",
                width: "100%",
              }}
            >
              <video
                controls
                autoPlay
                muted
                poster="/api/placeholder/800/450"
                style={{
                  width: "100%",
                  height: "auto",
                  maxHeight: "450px",
                  objectFit: "cover",
                  opacity: 0.7,
                }}
              >
                <source
                  src={appointmentData?.data?.videoUrl || ""}
                  type="video/mp4"
                />
                Your browser does not support the video tag.
              </video>
              {!appointmentData?.data?.videoUrl && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    color: "white",
                  }}
                >
                  <Typography variant="body2" textAlign="center">
                    No video available
                  </Typography>
                </Box>
              )}
            </Box>

            <Box sx={{ padding: "16px 20px" }}>
              <Typography
                variant="h6"
                color="primary"
                gutterBottom
                sx={{ fontWeight: 500 }}
              >
                Symptom Analysis
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                This video provides a detailed overview of the patient's
                described symptoms, helping with visual diagnosis and treatment
                planning.
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Collapse>
      <Toast
        alerting={toast.toastAlert}
        severity={toast.toastSeverity}
        message={toast.toastMessage}
      />
    </Box>
  );
};

export default AppointmentDetails;
