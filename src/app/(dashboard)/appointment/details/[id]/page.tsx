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

  const params = useParams();
  const appointmentId = params?.id;

  const { value: appointmentData, swrLoading } = useGetAppointment(
    null,
    `get-appointment-by-id/${appointmentId}`
  );

  const patientId = appointmentData?.data?.patientId || null;
  const doctorId = appointmentData?.data?.doctorId || null;
  const symptomIds = appointmentData?.data?.symptomIds || [];
  const [matchingSymptoms, setMatchingSymptoms] = useState([]);

  const { value: patientData, swrLoading: patientLoading } = useGetPatient(
    null,
    `get-patient-by-id/${patientId}`,
    1,
    1
  );

  const { value: doctorData, swrLoading: doctorLoading } = useGetDoctor(
    null,
    `get-doctor-by-id/${doctorId}`,
    1,
    1
  );

  const { value: allSymptoms, swrLoading: symptomsLoading } = useGetSymptom(
    null,
    "get-symptoms",
    1,
    100
  );


  useEffect(() => {
    if (symptomIds.length > 0 && allSymptoms?.results?.length > 0) {
      const filteredSymptoms = allSymptoms.results.filter((symptom) => {
        const symptomId =
          typeof symptom._id === "string"
            ? symptom._id
            : symptom._id?.["$oid"]?.toString().trim();

        const isMatch = symptomIds.some(
          (id) => id.toString().trim() === symptomId
        );
        return isMatch;
      });

      setMatchingSymptoms(filteredSymptoms);
      dispatch(setSymptom(filteredSymptoms));
    }
  }, [symptomIds, allSymptoms, dispatch]);

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
            <Typography
              variant="h6"
              color="primary"
              gutterBottom
              sx={{ marginTop: -2 }}
              padding={"2px"}
              marginLeft={"4px"}
            >
              Appointment
            </Typography>
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
                    <Chip
                      label={appointmentData?.status || "Unknown"}
                      color="success"
                      size="small"
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
            <hr
              style={{ margin: "8px 0", borderColor: "rgba(0, 0, 0, 0.1)" }}
            />
            <Grid container spacing={0.5}>
              {[
                {
                  icon: <SchoolIcon color="primary" />,
                  label: "Doctor",
                  value: doctorData?.data?.username || "Unknown Doctor",
                },
                {
                  icon: <MedicalIcon color="primary" />,
                  label: "Specialization",
                  value: (
                    <Typography
                      variant="body2"
                      fontWeight="medium"
                      color="text.primary"
                    >
                      {Array.isArray(doctorData?.data?.specializationIds) &&
                      doctorData.data.specializationIds.length > 0
                        ? doctorData.data.specializationIds
                            .map((spec) =>
                              typeof spec === "object"
                                ? spec.name
                                : "Unknown Specialization"
                            )
                            .join(", ")
                        : "Not Specified"}
                    </Typography>
                  ),
                },
                {
                  icon: <CalendarMonthIcon color="primary" />,
                  label: "Appointment Date",
                  value:
                    new Date(
                      appointmentData?.data?.appointmentDate
                    ).toLocaleDateString() || "N/A",
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
            <Grid container spacing={0.5} style={{ marginTop: 1 }}>
              {[
                {
                  icon: <ScheduleIcon color="primary" />,
                  label: "Appointment Time",
                  value: appointmentData?.data?.appointmentTime || "N/A",
                },
                {
                  icon: <StatusIcon color="primary" />,
                  label: "Appointment Status",
                  value: appointmentData?.data?.status || "N/A",
                },
                {
                  icon: <HospitalIcon color="success" />,
                  label: "Appointment Type",
                  value: appointmentData?.data?.appointmentType || "N/A",
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
                  <AirlineSeatFlatAngledIcon color="success" />
                  <div>
                    <Typography variant="caption" color="text.secondary">
                      Symptoms
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight="medium"
                      color="text.primary"
                    >
                      {matchingSymptoms.length > 0
                        ? matchingSymptoms
                            .map((symptom) => symptom.name)
                            .join(", ")
                        : "N/A"}
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
          <Typography variant="h6" color="primary" gutterBottom>
            Medical History
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
          <Typography variant="h6" color="primary" gutterBottom>
            Test Plan
          </Typography>
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
          <Typography variant="h6" color="primary" gutterBottom>
            Treatment Plan
          </Typography>
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
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(to right, #e0e4e8 0%, #d7dde5 100%)",
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
            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
          }}
        >
          <video
            controls
            style={{
              width: "100%",
              height: "auto",
            }}
          >
            <source src="video.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <IconButton
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              bgcolor: "rgba(255,255,255,0.2)",
              color: "white",
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.3)",
              },
              width: 80,
              height: 80,
            }}
          >
            <PlayIcon fontSize="large" />
          </IconButton>
        </Paper>
      </div>
    </div>
  );
};

export default AppointmentDetails;
