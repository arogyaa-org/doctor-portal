"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Avatar,
  Typography,
  Tab,
  Tabs,
  IconButton,
  Modal,
  Tooltip,
} from "@mui/material";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import WorkIcon from "@mui/icons-material/Work";
import HistoryIcon from "@mui/icons-material/History";
import ReviewsIcon from "@mui/icons-material/RateReview";
import InfoIcon from "@mui/icons-material/Info";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import { styled } from "@mui/system";
import AccountDetailsForm from "./account-details-form";
import PersonIcon from "@mui/icons-material/Person";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import SchoolIcon from "@mui/icons-material/School";
import TranslateIcon from "@mui/icons-material/Translate";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ManIcon from "@mui/icons-material/Man";
import WomanIcon from "@mui/icons-material/Woman";
import SickIcon from "@mui/icons-material/Sick";

import { useModifyDoctor } from "@/hooks/doctor";
import DoctorAppointmentHistory from "./appointment-history";
import DoctorRatingsAndReviews from "./d-rating-reviews";
import { Utility } from "@/utils";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import { fetcher } from "@/apis/apiClient";
import { DoctorData } from "@/types/doctor";

const StyledTab = styled(Tab)({
  textTransform: "none",
  fontWeight: "bold",
  "&.Mui-selected": {
    color: "#8F44FD",
  },
});

const DoctorProfile = () => {
  const doctorId = Utility().decodedToken()?.id || null;
  const { modifyDoctor } = useModifyDoctor("update-doctor");

  const [selectedTab, setSelectedTab] = useState<string | null>("info");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [doctorProfileData, setDoctorProfileData] = useState<DoctorData | null>(
    null
  );

  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const bioInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isEditOpen && nameInputRef.current) {
      nameInputRef.current.focus();
      const length = nameInputRef.current.value.length;
      nameInputRef.current.setSelectionRange(length, length);
    }
  }, [isEditOpen]);

  const handleTabClick = (tab: string) => setSelectedTab(tab);
  const handleEditOpen = () => {
    if (doctorProfileData) {
      setEditFields({ ...doctorProfileData });
    }
    setIsEditOpen(true);
  };

  const handleImageClick = () => setIsImageOpen(true);
  const handleImageClose = () => setIsImageOpen(false);

  useEffect(() => {
    const getDoctorProfile = async () => {
      if (!doctorId) return;
      try {
        const response = await fetcher(
          "doctor",
          `get-doctor-by-id/${doctorId}`
        );
        if (response?.data) {
          setDoctorProfileData(response.data);
        }
      } catch (error) {
        console.error("Error fetching doctor profile:", error);
      }
    };
    getDoctorProfile();
  }, [doctorId]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setEditFields((prev) => ({
      ...prev,
      profilePicture: { file, preview: previewUrl },
    }));
  };

  // Editable fields
  const [editFields, setEditFields] = useState<DoctorData>({
    _id: "",
    username: "",
    email: "",
    password: "",
    contact: "",
    experience: "",
    bio: "",
    tags: [],
    gender: null,
    dob: "",
    languageSpoken: [],
    address: "",
    pincode: "",
    profilePicture: null,
    consultationFee: "",
    status: null,
    role: null,
    specializationIds: [],
    symptomIds: [],
    qualificationIds: [],
    availability: [],
    createdAt: "",
    updatedAt: "",
    __v: 0,
  });

  // Populate edit fields when doctorProfileData is loaded
  useEffect(() => {
    if (doctorProfileData) {
      setEditFields({
        ...doctorProfileData,
      });
    }
  }, [doctorProfileData]);

  // Handle input field changes
  const handleFieldChange = (field: keyof DoctorData, value: any) => {
    setEditFields((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Save changes to API
  const handleSaveChanges = async () => {
    try {
      await modifyDoctor(editFields);
      setDoctorProfileData(editFields); // Update local state
      setIsEditOpen(false);
    } catch (error) {
      console.error("Error updating doctor profile:", error);
    }
  };
  

  return (
    <Box
      sx={{
        backgroundColor: "#F0F4FF",
        borderRadius: "16px",
        p: 4,
        maxWidth: "1000px",
        margin: "auto",
        mt: "80px",
        boxShadow: "0px 6px 15px rgba(0, 0, 0, 0.15)",
        position: "relative",
      }}
    >
      <Tooltip title="Edit Profile">
        <IconButton
          onClick={handleEditOpen}
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            bgcolor: "white",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
            "&:hover": { bgcolor: "grey.100" },
          }}
        >
          <EditIcon />
        </IconButton>
      </Tooltip>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
          mb: 4,
        }}
      >
        {/* Profile Avatar */}
        <Box
          sx={{
            position: "relative",
            width: 130,
            height: 130,
          }}
        >
          <Avatar
            sx={{
              width: "100%",
              height: "100%",
              border: "4px solid #FFF",
              boxShadow: "0px 6px 10px rgba(0, 0, 0, 0.25)",
              cursor: "pointer",
            }}
            onClick={handleImageClick}
          />
          <IconButton
            sx={{
              position: "absolute",
              bottom: 8,
              right: -3,
              bgcolor: "white",
              boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
              "&:hover": { bgcolor: "grey.100" },
            }}
            component="label"
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              hidden
            />
            <PhotoCamera fontSize="small" />
          </IconButton>
        </Box>

        {/* Doctor Name Section */}
        {isEditOpen ? (
          <Box
            sx={{
              textAlign: "center",
              mt: 2,
              px: 2,
              maxWidth: "80%",
            }}
          >
            <input
              ref={nameInputRef}
              type="text"
              value={editFields.username}
              onChange={(e) => handleFieldChange("username", e.target.value)}
              style={{
                fontWeight: "bold",
                fontSize: "32px",
                color: "#333",
                textAlign: "center",
                border: "none", 
                outline: "none", 
                background: "transparent", 
                padding: "4px",
                width: "100%",
                cursor: "text",
              }}
            />
          </Box>
        ) : (
          <Typography
            variant="h4"
            sx={{
              textAlign: "center",
              fontWeight: "bold",
              color: "#333",
              mt: 2,
              cursor: "pointer",
            }}
            onClick={handleEditOpen}
          >
            {doctorProfileData?.username || "Dr. Adarsh Kumar"}
          </Typography>
        )}

        {isEditOpen ? (
          <Box
            sx={{
              textAlign: "center",
              mt: 1,
              px: 2,
              maxWidth: "80%",
              display: "flex",
              justifyContent: "center",
            }}
          >
            {/* Hidden span to measure text width dynamically */}
            <span
              ref={bioInputRef}
              style={{
                visibility: "hidden",
                whiteSpace: "nowrap",
                fontSize: "16px",
                fontFamily: "inherit",
                position: "absolute",
                padding: "8px",
              }}
            >
              {editFields.bio || " "}
            </span>

            <input
              ref={bioInputRef}
              type="text"
              value={editFields.bio}
              onChange={(e) => {
                handleFieldChange("bio", e.target.value);

                // Ensure dynamic width adjustment
                const textMeasureSpan = bioInputRef.current;
                if (textMeasureSpan) {
                  textMeasureSpan.innerText = e.target.value || " ";
                  e.target.style.width = `${textMeasureSpan.offsetWidth + 20}px`;
                }
              }}
              style={{
                padding: "8px",
                borderRadius: "8px",
                border: "none",
                fontSize: "16px",
                textAlign: "center",
                width: "auto", 
                minWidth: "50px", 
                maxWidth: "100%", 
                overflow: "hidden",
                background: "transparent",
                outline: "none",
                cursor: "text",
                transition: "width 0.2s ease-in-out", 
              }}
            />
          </Box>
        ) : (
          <Typography
            variant="body1"
            sx={{
              textAlign: "center",
              color: "#555",
              mt: 1,
              px: 2,
              maxWidth: "80%",
            }}
          >
            {doctorProfileData?.bio ||
              "Experienced doctor specializing in healthcare and patient well-being."}
          </Typography>
        )}
      </Box>

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
          label="Profile Info"
          value="info"
        />
        <StyledTab
          icon={<HistoryIcon />}
          iconPosition="start"
          label="Appointment History"
          value="history"
        />
        <StyledTab
          icon={<ReviewsIcon />}
          iconPosition="start"
          label="Rating and Reviews"
          value="reviews"
        />
      </Tabs>

      {selectedTab === "info" && (
        <Box
          sx={{
            p: 3,
            border: "1px solid #DDD",
            borderRadius: "12px",
            backgroundColor: "#FFF",
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
              gap: 3,
              mt: 2,
            }}
          >
            <Box>
              <Typography variant="body1" sx={{ fontWeight: "bold", mb: 0.5 }}>
                Phone
              </Typography>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <PhoneOutlinedIcon sx={{ color: "#8F44FD" }} />

                {isEditOpen ? (
                  <input
                    type="text"
                    value={editFields.contact}
                    onChange={(e) =>
                      handleFieldChange("contact", e.target.value)
                    }
                    style={{
                      fontSize: "16px",
                      color: "#555",
                      border: "2px solid #8F44FD", 
                      borderRadius: "6px",
                      padding: "6px 10px",
                      width: "150px",
                      outline: "none",
                      background: "transparent",
                      transition: "border 0.2s ease-in-out",
                    }}
                  />
                ) : (
                  <Typography variant="body2" sx={{ color: "#555" }}>
                    {doctorProfileData?.contact || "+91 9876543210"}
                  </Typography>
                )}
              </Box>
            </Box>

            <Box>
              <Typography variant="body1" sx={{ fontWeight: "bold", mb: 0.5 }}>
                Email
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <MailOutlineIcon sx={{ color: "#8F44FD" }} />
                {isEditOpen ? (
                  <input
                    type="email"
                    value={editFields.email}
                    onChange={(e) => handleFieldChange("email", e.target.value)}
                    style={{
                      fontSize: "16px",
                      color: "#555",
                      border: "2px solid #8F44FD", 
                      borderRadius: "6px",
                      padding: "6px 10px",
                      width: "200px", 
                      outline: "none",
                      background: "transparent",
                      transition: "border 0.2s ease-in-out",
                    }}
                  />
                ) : (
                  <Typography variant="body2" sx={{ color: "#555" }}>
                    {doctorProfileData?.email || "doctor@example.com"}
                  </Typography>
                )}
              </Box>
            </Box>

            {/* GENDER FIELD */}
            <Box>
              <Typography variant="body1" sx={{ fontWeight: "bold", mb: 0.5 }}>
                Gender
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {doctorProfileData?.gender === "Male" ? (
                  <ManIcon sx={{ color: "#8F44FD" }} />
                ) : doctorProfileData?.gender === "Female" ? (
                  <WomanIcon sx={{ color: "#8F44FD" }} />
                ) : (
                  <PersonIcon sx={{ color: "#8F44FD" }} />
                )}
                {isEditOpen ? (
                  <select
                    value={editFields.gender}
                    onChange={(e) =>
                      handleFieldChange("gender", e.target.value)
                    }
                    style={{
                      fontSize: "16px",
                      color: "#555",
                      border: "2px solid #8F44FD",
                      borderRadius: "6px",
                      padding: "6px 10px",
                      background: "transparent",
                      cursor: "pointer",
                      width: "200px",
                    }}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <Typography variant="body2" sx={{ color: "#555" }}>
                    {doctorProfileData?.gender || "Not Specified"}
                  </Typography>
                )}
              </Box>
            </Box>

            <Box>
              <Typography variant="body1" sx={{ fontWeight: "bold", mb: 0.5 }}>
                Date of Birth
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CalendarTodayIcon sx={{ color: "#8F44FD" }} />
                {isEditOpen ? (
                  <input
                    type="date"
                    value={
                      editFields.dob
                        ? dayjs(editFields.dob).format("YYYY-MM-DD")
                        : ""
                    }
                    onChange={(e) => handleFieldChange("dob", e.target.value)}
                    style={{
                      fontSize: "16px",
                      color: "#555",
                      border: "2px solid #8F44FD", 
                      borderRadius: "6px",
                      padding: "6px 10px",
                      background: "transparent",
                      cursor: "pointer",
                      width: "200px", 
                      outline: "none",
                    }}
                  />
                ) : (
                  <Typography variant="body2" sx={{ color: "#555" }}>
                    {doctorProfileData?.dob
                      ? dayjs(doctorProfileData.dob).format("YYYY-MM-DD")
                      : "1980-01-01"}
                  </Typography>
                )}
              </Box>
            </Box>

            <Box>
              <Typography variant="body1" sx={{ fontWeight: "bold", mb: 0.5 }}>
                Experience
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <HistoryIcon sx={{ color: "#8F44FD" }} />
                {isEditOpen ? (
                  <input
                    type="number"
                    value={editFields.experience || ""}
                    onChange={(e) =>
                      handleFieldChange("experience", e.target.value)
                    }
                    style={{
                      fontSize: "16px",
                      color: "#555",
                      border: "2px solid #8F44FD", 
                      borderRadius: "6px",
                      padding: "6px 10px",
                      background: "transparent",
                      cursor: "pointer",
                      width: "100px",
                      outline: "none",
                    }}
                  />
                ) : (
                  <Typography variant="body2" sx={{ color: "#555" }}>
                    {doctorProfileData?.experience || "15 Years"} years
                  </Typography>
                )}
              </Box>
            </Box>

            <Box>
              <Typography variant="body1" sx={{ fontWeight: "bold", mb: 0.5 }}>
                Consultation Fee
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CurrencyRupeeIcon sx={{ color: "#8F44FD" }} />
                {isEditOpen ? (
                  <input
                    type="text" 
                    value={editFields.consultationFee || ""}
                    onChange={(e) =>
                      handleFieldChange("consultationFee", e.target.value)
                    }
                    style={{
                      fontSize: "16px",
                      color: "#555",
                      border: "2px solid #8F44FD", 
                      borderRadius: "6px",
                      padding: "6px 10px",
                      background: "transparent",
                      cursor: "text",
                      width: "100px", 
                      outline: "none",
                    }}
                  />
                ) : (
                  <Typography variant="body2" sx={{ color: "#555" }}>
                    {doctorProfileData?.consultationFee || "50"}
                  </Typography>
                )}
              </Box>
            </Box>

            <Box>
              <Typography variant="body1" sx={{ fontWeight: "bold", mb: 0.5 }}>
                Languages Spoken
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <TranslateIcon sx={{ color: "#8F44FD" }} />
                {isEditOpen ? (
                  <input
                    type="text"
                    value={editFields.languagesSpoken.join(", ")} 
                    onChange={(e) => {
                      const updatedLanguages = e.target.value
                        .split(",") 
                        .map((lang) => lang.trim())
                        .filter((lang) => lang.length > 0); 
                      handleFieldChange("languagesSpoken", updatedLanguages);
                    }}
                    onKeyDown={(e) => {
                      // Prevent spaces from being added at the start or end of the languages
                      if (e.key === "Backspace") {
                        const currentValue = e.target.value.trim(); 
                        if (currentValue.endsWith(",")) {
                          e.target.value = currentValue.slice(0, -1); 
                        }
                      }
                    }}
                    style={{
                      fontSize: "16px",
                      color: "#555",
                      border: "2px solid #8F44FD",
                      borderRadius: "6px",
                      padding: "6px 10px",
                      background: "transparent",
                      cursor: "text",
                      width: "100%", 
                      outline: "none",
                    }}
                  />
                ) : (
                  <Typography variant="body2" sx={{ color: "#555" }}>
                    {doctorProfileData?.languagesSpoken.length > 0
                      ? doctorProfileData.languagesSpoken.join(", ") 
                      : "English, Hindi"}
                  </Typography>
                )}
              </Box>
            </Box>

            <Box>
              <Typography variant="body1" sx={{ fontWeight: "bold", mb: 0.5 }}>
                Status
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {isEditOpen ? (
                  <select
                    value={editFields.status}
                    onChange={(e) =>
                      handleFieldChange("status", e.target.value)
                    }
                    style={{
                      fontSize: "16px",
                      color: "#555",
                      border: "2px solid #8F44FD", 
                      borderRadius: "6px",
                      padding: "6px 10px",
                      background: "transparent",
                      cursor: "pointer",
                      width: "200px", 
                      outline: "none",
                    }}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="on leave">On Leave</option>
                  </select>
                ) : (
                  <>
                    {doctorProfileData?.status === "active" ? (
                      <CheckCircleOutlineIcon sx={{ color: "success.main" }} />
                    ) : doctorProfileData?.status === "inactive" ? (
                      <HighlightOffIcon sx={{ color: "yellow" }} />
                    ) : (
                      <HighlightOffIcon sx={{ color: "red" }} />
                    )}
                    <Typography variant="body2" sx={{ color: "#555" }}>
                      {doctorProfileData?.status || "On leave"}
                    </Typography>
                  </>
                )}
              </Box>
            </Box>

            <Box>
              <Typography variant="body1" sx={{ fontWeight: "bold", mb: 0.5 }}>
                Role
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <AssignmentIndIcon sx={{ color: "#8F44FD" }} />
                {isEditOpen ? (
                  <select
                    value={editFields.role}
                    onChange={(e) => handleFieldChange("role", e.target.value)}
                    style={{
                      fontSize: "16px",
                      color: "#555",
                      border: "2px solid #8F44FD", 
                      borderRadius: "6px",
                      padding: "6px 10px",
                      background: "transparent",
                      cursor: "pointer",
                      width: "200px",
                      outline: "none",
                    }}
                  >
                    <option value="Doctor">Doctor</option>
                    <option value="Admin">Admin</option>
                  </select>
                ) : (
                  <Typography variant="body2" sx={{ color: "#555" }}>
                    {doctorProfileData?.role || "Doctor"}
                  </Typography>
                )}
              </Box>
            </Box>

            <Box>
              <Typography variant="body1" sx={{ fontWeight: "bold", mb: 0.5 }}>
                Qualification
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <SchoolIcon sx={{ color: "#8F44FD" }} />
                <Typography variant="body2" sx={{ color: "#555" }}>
                  {Array.isArray(doctorProfileData?.qualificationIds) &&
                  doctorProfileData.qualificationIds.length > 0
                    ? doctorProfileData.qualificationIds
                        .map((qual) =>
                          typeof qual === "object"
                            ? qual.name
                            : "Unknown Qualification"
                        )
                        .join(", ")
                    : "MBBS, MD"}
                </Typography>
              </Box>
            </Box>

            <Box>
              <Typography variant="body1" sx={{ fontWeight: "bold", mb: 0.5 }}>
                specialization
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <WorkIcon sx={{ color: "#8F44FD" }} />
                {Array.isArray(doctorProfileData?.specializationIds) &&
                doctorProfileData.specializationIds.length > 0
                  ? doctorProfileData.specializationIds
                      .map((spec) =>
                        typeof spec === "object"
                          ? spec.name
                          : "Unknown Specialization"
                      )
                      .join(", ")
                  : "Not Specified"}
              </Box>
            </Box>

            <Box>
              <Typography variant="body1" sx={{ fontWeight: "bold", mb: 0.5 }}>
                HospitalAffiliations
              </Typography>
              {isEditOpen ? (
                <input
                  type="text"
                  value={editFields.hospitalAffiliations.join(", ")}
                  onChange={(e) =>
                    handleFieldChange(
                      "hospitalAffiliations",
                      e.target.value
                        .split(",")
                        .map((hospital) => hospital.trim())
                    )
                  }
                  style={{
                    fontSize: "16px",
                    color: "#555",
                    border: "2px solid #8F44FD", 
                    borderRadius: "6px",
                    padding: "6px 10px",
                    width: "300px", 
                    outline: "none",
                    background: "transparent",
                    transition: "border 0.2s ease-in-out",
                  }}
                />
              ) : Array.isArray(doctorProfileData?.hospitalAffiliations) &&
                doctorProfileData.hospitalAffiliations.length > 0 ? (
                doctorProfileData.hospitalAffiliations.map(
                  (hospital, index) => (
                    <Box
                      key={index}
                      sx={{ display: "flex", alignItems: "center", gap: 1 }}
                    >
                      <LocalHospitalIcon sx={{ color: "#8F44FD" }} />
                      <Typography
                        variant="body2"
                        sx={{ color: "#555", display: "block" }}
                      >
                        {hospital}
                      </Typography>
                    </Box>
                  )
                )
              ) : (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <LocalHospitalIcon sx={{ color: "#8F44FD" }} />
                  <Typography variant="body2" sx={{ color: "#555" }}>
                    Apollo Hospital
                  </Typography>
                </Box>
              )}
            </Box>

            <Box>
              <Typography variant="body1" sx={{ fontWeight: "bold", mb: 0.5 }}>
                Availability
              </Typography>
              {isEditOpen ? (
                <>
                  {Array.isArray(editFields.availability) &&
                  editFields.availability.length > 0 ? (
                    editFields.availability.map((slot, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 2,
                        }}
                      >
                        <AccessTimeIcon sx={{ color: "#8F44FD" }} />
                        <Box
                          sx={{
                            display: "flex",
                            gap: 1,
                            flexDirection: "column",
                          }}
                        >
                          <input
                            type="text"
                            value={slot.day}
                            onChange={(e) =>
                              handleFieldChange("availability", [
                                ...editFields.availability.slice(0, index),
                                {
                                  ...slot,
                                  day: e.target.value,
                                },
                                ...editFields.availability.slice(index + 1),
                              ])
                            }
                            placeholder="Day"
                            style={{
                              fontSize: "16px",
                              color: "#555",
                              border: "2px solid #8F44FD",
                              borderRadius: "6px",
                              padding: "6px 10px",
                              background: "transparent",
                              cursor: "pointer",
                              width: "100%", 
                              outline: "none",
                            }}
                          />
                          <input
                            type="time"
                            value={slot.startTime}
                            onChange={(e) =>
                              handleFieldChange("availability", [
                                ...editFields.availability.slice(0, index),
                                {
                                  ...slot,
                                  startTime: e.target.value,
                                },
                                ...editFields.availability.slice(index + 1),
                              ])
                            }
                            style={{
                              fontSize: "16px",
                              color: "#555",
                              border: "2px solid #8F44FD",
                              borderRadius: "6px",
                              padding: "6px 10px",
                              background: "transparent",
                              cursor: "pointer",
                              width: "100%", 
                              outline: "none",
                            }}
                          />
                          <input
                            type="time"
                            value={slot.endTime}
                            onChange={(e) =>
                              handleFieldChange("availability", [
                                ...editFields.availability.slice(0, index),
                                {
                                  ...slot,
                                  endTime: e.target.value,
                                },
                                ...editFields.availability.slice(index + 1),
                              ])
                            }
                            style={{
                              fontSize: "16px",
                              color: "#555",
                              border: "2px solid #8F44FD",
                              borderRadius: "6px",
                              padding: "6px 10px",
                              background: "transparent",
                              cursor: "pointer",
                              width: "100%", 
                              outline: "none",
                            }}
                          />
                          <button
                            onClick={() => {
                              const updatedAvailability =
                                editFields.availability.filter(
                                  (_, idx) => idx !== index
                                );
                              handleFieldChange(
                                "availability",
                                updatedAvailability
                              );
                            }}
                            style={{
                              background: "transparent",
                              border: "none",
                              cursor: "pointer",
                              color: "red",
                              marginTop: "8px", 
                            }}
                          >
                            Remove
                          </button>
                        </Box>
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2" sx={{ color: "#555" }}>
                      Not Available
                    </Typography>
                  )}
                  <button
                    onClick={() =>
                      handleFieldChange("availability", [
                        ...editFields.availability,
                        { day: "", startTime: "", endTime: "" },
                      ])
                    }
                    style={{
                      background: "transparent",
                      border: "2px dashed #8F44FD",
                      borderRadius: "6px",
                      padding: "6px 12px",
                      cursor: "pointer",
                      color: "#8F44FD",
                      marginTop: "10px", 
                    }}
                  >
                    Add Slot
                  </button>
                </>
              ) : Array.isArray(doctorProfileData?.availability) &&
                doctorProfileData.availability.length > 0 ? (
                doctorProfileData.availability.map((slot, index) => (
                  <Box
                    key={index}
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    <AccessTimeIcon sx={{ color: "#8F44FD" }} />
                    <Typography variant="body2" sx={{ color: "#555" }}>
                      {slot.day}: {slot.startTime} - {slot.endTime}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <AccessTimeIcon sx={{ color: "#8F44FD" }} />
                  <Typography variant="body2" sx={{ color: "#555" }}>
                    Not Available
                  </Typography>
                </Box>
              )}
            </Box>

            <Box>
              <Typography variant="body1" sx={{ fontWeight: "bold", mb: 0.5 }}>
                Symptoms
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <SickIcon sx={{ color: "#8F44FD" }} />
                {Array.isArray(doctorProfileData?.symptomIds) &&
                doctorProfileData.symptomIds.length > 0
                  ? doctorProfileData.symptomIds
                      .map((symptom) =>
                        typeof symptom === "object"
                          ? symptom.name
                          : "Unknown Symptom"
                      )
                      .join(", ")
                  : "Not Specified"}
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      {selectedTab === "history" && <DoctorAppointmentHistory />}
      {selectedTab === "reviews" && <DoctorRatingsAndReviews />}

      <Modal open={isImageOpen} onClose={handleImageClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
            textAlign: "center",
          }}
        >
          <IconButton
            onClick={handleImageClose}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              color: "grey.600",
              "&:hover": { color: "grey.900" },
            }}
          >
            <CloseIcon />
          </IconButton>
          <Avatar
            // src={profileImage}
            alt="Doctor"
            sx={{
              width: 300,
              height: 300,
              mx: "auto",
              border: "4px solid white",
              boxShadow: 3,
            }}
          />
        </Box>
      </Modal>
    </Box>
  );
};

export default DoctorProfile;
