"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Avatar,
  Typography,
  Tab,
  Tabs,
} from "@mui/material";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import HistoryIcon from "@mui/icons-material/History";
import InfoIcon from "@mui/icons-material/Info";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import { styled } from "@mui/system";
import axios from "axios";

const StyledTab = styled(Tab)({
  textTransform: "none",
  fontWeight: "bold",
  "&.Mui-selected": {
    color: "#8F44FD",
  },
});

interface Patient {
  _id?: string;
  username?: string;
  email?: string;
  phone?: string;
  gender?: string;
  dob?: string;
  city?: string;
  medical_history?: string[];
  createdAt?: string;
  updatedAt?: string;
}

const PatientProfile = () => {
  const [selectedTab, setSelectedTab] = useState<string | null>("info");
  const [profileImage, setProfileImage] = useState<string>(
  );
  const [patient, setPatient] = useState<Patient | null>(null);

  const fetchPatientData = async () => {
    try {
      const response = await axios.get<Patient>(
        "/patient-service/get-patient",
        {
          params: { id: "672c681f76ab84e9f25f0539" },
        }
      );
      setPatient(response.data);
    } catch (error) {
      console.error("Error fetching patient data:", error);
    }
  };

  useEffect(() => {
    fetchPatientData();
  }, []);

  const handleTabClick = (tab: string) => {
    setSelectedTab(tab);
  };

  // Fallback values for patient data
  const fallbackPatient = {
    _id: "P-000-000",
    username: "John Doe",
    email: "johndoe@example.com",
    phone: "+0000000000",
    gender: "Unknown",
    dob: "1990-01-01",
    city: "Unknown",
    medical_history: ["No medical history available"],
  };

  const currentPatient = patient || fallbackPatient;

  return (
    <Box
      sx={{
        backgroundColor: "#F0F4FF",
        borderRadius: "16px",
        p: 4,
        maxWidth: "1000px",
        margin: "auto",
        mt: 4,
        boxShadow: "0px 6px 15px rgba(0, 0, 0, 0.15)",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
          mb: 4,
        }}
      >
        <Box
          sx={{
            position: "relative",
            width: 130,
            height: 130,
          }}
        >
          <Avatar
            src={profileImage}
            sx={{
              width: "100%",
              height: "100%",
              border: "4px solid #FFF",
              boxShadow: "0px 6px 10px rgba(0, 0, 0, 0.25)",
            }}
          />
        </Box>
        <Typography
          variant="h6"
          sx={{ textAlign: "center", fontWeight: "bold", color: "#333", mt: 2 }}
        >
          {currentPatient.username || "John Doe"}
        </Typography>
        <Typography
          variant="body2"
          sx={{ textAlign: "center", color: "#777" }}
        >
          Code: {currentPatient._id || "P-000-000"}
        </Typography>
      </Box>

      {/* Tabs Section */}
      <Tabs
        value={selectedTab}
        onChange={(e, tab) => handleTabClick(tab)}
        indicatorColor="primary"
        textColor="primary"
        centered
        sx={{ mb: 3 }}
      >
        <StyledTab
          icon={<InfoIcon />}
          iconPosition="start"
          label="Patient Info"
          value="info"
        />
        <StyledTab
          icon={<HistoryIcon />}
          iconPosition="start"
          label="Medical History"
          value="history"
        />
        <StyledTab
          icon={<FolderOpenIcon />}
          iconPosition="start"
          label="Medical Records"
          value="records"
        />
      </Tabs>

      {/* Content Sections */}
      {selectedTab === "info" && (
        <Box
          sx={{
            p: 3,
            border: "1px solid #DDD",
            borderRadius: "12px",
            backgroundColor: "#FFF",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              color: "#333",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <InfoIcon sx={{ color: "#8F44FD" }} /> Patient Info
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 3,
              mt: 2,
            }}
          >
            <Box>
              <Typography variant="body1" sx={{ fontWeight: "bold", mb: 0.5 }}>
                Email
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <MailOutlineIcon sx={{ color: "#8F44FD" }} />
                <Typography variant="body2" sx={{ color: "#555" }}>
                  {currentPatient.email || "johndoe@example.com"}
                </Typography>
              </Box>
            </Box>
            <Box>
              <Typography variant="body1" sx={{ fontWeight: "bold", mb: 0.5 }}>
                Phone
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <PhoneOutlinedIcon sx={{ color: "#8F44FD" }} />
                <Typography variant="body2" sx={{ color: "#555" }}>
                  {currentPatient.phone || "+0000000000"}
                </Typography>
              </Box>
            </Box>
            <Box>
              <Typography variant="body1" sx={{ fontWeight: "bold", mb: 0.5 }}>
                City
              </Typography>
              <Typography variant="body2" sx={{ color: "#555" }}>
                {currentPatient.city || "Unknown"}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body1" sx={{ fontWeight: "bold", mb: 0.5 }}>
                Gender
              </Typography>
              <Typography variant="body2" sx={{ color: "#555" }}>
                {currentPatient.gender || "Unknown"}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      {selectedTab === "history" && (
        <Box
          sx={{
            p: 3,
            border: "1px solid #DDD",
            borderRadius: "12px",
            backgroundColor: "#FFF",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              color: "#333",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <HistoryIcon sx={{ color: "#8F44FD" }} /> Medical History
          </Typography>
          <Box sx={{ mt: 2 }}>
            {currentPatient.medical_history &&
            currentPatient.medical_history.length > 0 ? (
              currentPatient.medical_history.map((item, index) => (
                <Typography
                  key={index}
                  variant="body2"
                  sx={{ color: "#555", mb: 1 }}
                >
                  - {item}
                </Typography>
              ))
            ) : (
              <Typography variant="body2" sx={{ color: "#555" }}>
                No medical history available
              </Typography>
            )}
          </Box>
        </Box>
      )}

      {selectedTab === "records" && (
        <Box
          sx={{
            p: 3,
            border: "1px solid #DDD",
            borderRadius: "12px",
            backgroundColor: "#FFF",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              color: "#333",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <FolderOpenIcon sx={{ color: "#8F44FD" }} /> Medical Records
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ color: "#555" }}>
              Medical records will be displayed here.
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default PatientProfile;
