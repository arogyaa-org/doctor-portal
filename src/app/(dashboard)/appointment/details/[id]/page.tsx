"use client";

import React, { useState, useEffect } from "react";
import {
  Typography,
  Grid,
  Paper,
  Avatar,
  IconButton,
  LinearProgress,
  Chip,
  Button,
  useMediaQuery,
  useTheme,
  Box,
} from "@mui/material";
import {
  Info as InfoIcon,
  MedicalServices as MedicalIcon,
  LocalHospital as HospitalIcon,
  PlayCircleOutline as PlayIcon,
  CheckCircle as StatusIcon,
  LocationOn as LocationIcon,
  Wc as GenderIcon,
  School as SchoolIcon,
  AirlineSeatFlatAngled as AirlineSeatFlatAngledIcon,
  CalendarMonth as CalendarMonthIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  Phone as PhoneIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";

import TreatmentHistory from "./treatmentHistory";
import TestHistory from "./testHistory";
import { useGetAppointment } from "@/hooks/appointment";
import { useGetDoctor } from "@/hooks/doctor";
import { useGetPatient } from "@/hooks/patient";
import { useGetSymptom } from "@/hooks/symptoms";
import { useRouter, useParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { setSymptom } from "@/redux/features/symptomsSlice";

const AppointmentDetails = () => {
  const [activeTab, setActiveTab] = useState("info");
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const dispatch = useDispatch();
  const router = useRouter();

  const params = useParams();
  const appointmentId = params?.id;

  const { value: appointmentData, swrLoading } = useGetAppointment(
    null,
    `get-appointment-by-id/${appointmentId}`
  );

  const patientId = appointmentData?.data?.patientId._id || null;
  const symptomIds = appointmentData?.data?.symptomIds || [];

  const { value: patientData, swrLoading: patientLoading } = useGetPatient(
    null,
    `get-patient-by-id/${patientId}`,
    1,
    1
  );

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
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: isSmallScreen ? "wrap" : "nowrap",
                marginBottom: 8,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Avatar
                  sx={{
                    width: 54,
                    height: 54,
                    bgcolor: "success.light",
                    border: "2px solid white",
                    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  P
                </Avatar>
                <div>
                  <Typography variant="h6" fontWeight="bold" color="primary">
                    {patientData?.data?.username || "Unknown Patient"}
                  </Typography>
                  <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                    <Chip
                      label="Patient"
                      color="primary"
                      size="small"
                      variant="outlined"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Grid container spacing={0.5} sx={{ marginTop: -0.5 }}>
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
                  icon: <PhoneIcon color="primary" />,
                  label: "phone",
                  value: patientData?.data?.contact || "N/A",
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
            <Grid container spacing={0.5} style={{ marginTop: 8 }}>
              <Grid item xs={12}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    paddingTop: 2,
                    paddingBottom: 2,
                  }}
                >
                  <LocationIcon color="primary" />
                  <div>
                    <Typography variant="caption" color="text.secondary">
                      Address
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight="medium"
                      color="text.primary"
                    >
                      {patientData?.data?.address || "N/A"}
                    </Typography>
                  </div>
                </div>
              </Grid>
            </Grid>
          </>
        ),
    },

    {
      key: "visits",
      icon: <HospitalIcon sx={{ color: "#4CAF50" }} />,
      name: "Visits",
      content: (
        <div>
          <Typography variant="h6" color="Black" gutterBottom>
            Medical Details
          </Typography>
          {[
            { title: "Initial Consultation", progress: 100 },
            { title: "Follow-up Checkup", progress: 75 },
          ].map((visit, index) => (
            <div key={index} style={{ marginBottom: 8 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}
              >
                <Typography variant="subtitle1">{visit.title}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {visit.progress}% Complete
                </Typography>
              </div>
              <LinearProgress
                variant="determinate"
                value={visit.progress}
                color="secondary"
              />
            </div>
          ))}
        </div>
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
    <div
      style={{
        display: "flex",
        flexDirection: isSmallScreen ? "column" : "row",
        height: "100vh",
      }}
    >
      <div
        style={{
          width: isSmallScreen ? "100%" : "62%",
          padding: 8,
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          borderRight: isSmallScreen ? "none" : "1px solid rgba(0,0,0,0.1)",
        }}
      >
        {/* Heading and Back Button in the same row */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            marginBottom: 2,
          }}
        >
          {/* Back Button */}
          <IconButton
            onClick={() => router.back()} // Use router.back() to go back to the previous page
            sx={{
              marginRight: 2, // Add margin between back button and heading
            }}
          >
            <ArrowBackIcon sx={{ color: "primary.main" }} />
          </IconButton>

          {/* Appointment History Heading */}
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
            gap: 8,
            marginBottom: 16,
            backgroundColor: "#f0f4f8",
            borderRadius: 8,
            padding: 8,
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
                padding: "10px 15px",
                minWidth: "100px",
                color: activeTab === tab.key ? "blue" : "black",
                bgcolor: activeTab === tab.key ? "rgba(63,81,181,0.1)" : "none",
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

        <Paper
          elevation={3}
          sx={{
            p: 3,
            borderRadius: 2,
            maxHeight: isSmallScreen ? "auto" : "calc(100vh - 150px)",
            overflowY: "auto",
          }}
        >
          {tabs.find((tab) => tab.key === activeTab)?.content}
        </Paper>
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          padding: isSmallScreen ? "15px" : "30px",
          marginTop:-12,
          justifyContent: "center",
          alignItems: "center",
          background:
            "linear-gradient(to bottom right, #f0f4f8 0%, #e1e5eb 100%)",
        }}
      >
        <Paper
          elevation={6}
          sx={{
            maxWidth: 800,
            width: "100%",
            borderRadius: 3,
            overflow: "hidden",
            position: "relative",
            boxShadow: "0 12px 30px rgba(0,0,0,0.15)",
          }}
        >
          {/* Header with icon and title */}
          <Box
            sx={{
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              gap: 2,
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

          {/* Video thumbnail container with overlay */}
          <Box sx={{ position: "relative", backgroundColor: "#000" }}>
            <video
              poster="/api/placeholder/800/450"
              style={{
                width: "100%",
                height: "auto",
                maxHeight: "450px",
                objectFit: "cover",
                opacity: 0.7,
              }}
            >
              <source src="video.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            {/* Play button overlay */}
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: 2,
              }}
            >
              <IconButton
                sx={{
                  bgcolor: "#FE4F2D",
                  color: "white",
                  "&:hover": {
                    transform: "scale(1.1)",
                  },
                  width: 70,
                  height: 70,
                  transition: "all 0.2s ease",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.3)",
                }}
              >
                <PlayIcon fontSize="large" />
              </IconButton>
              <Typography
                variant="body1"
                sx={{
                  color: "white",
                  fontWeight: "500",
                  textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                }}
              >
                Click to play video
              </Typography>
            </Box>
          </Box>

          {/* Video details and description */}
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
              This video provides a detailed overview of the patient's described
              symptoms, helping with visual diagnosis and treatment planning.
            </Typography>

            {/* Additional metadata - removed "Verified" chip */}
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 2,
                mt: 2,
              }}
            >
              <Chip                           // time spam we can use dynamic which will come with video in the metadata
                icon={<ScheduleIcon />} 
                label="2:34 mins"
                size="small"
                variant="outlined"
              />
              <Chip
                icon={<CalendarMonthIcon />}
                label={`Recorded: ${new Date().toLocaleDateString()}`}
                size="small"
                variant="outlined"
              />
            </Box>
          </Box>
        </Paper>
      </div>
    </div>
  );
};

export default AppointmentDetails;
