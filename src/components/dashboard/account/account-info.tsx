"use client";

import React, { useState } from "react";
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
import DoctorAppointmentHistory from "./appointment-history";
import DoctorRatingsAndReviews from "./d-rating-reviews";

const StyledTab = styled(Tab)({
  textTransform: "none",
  fontWeight: "bold",
  "&.Mui-selected": {
    color: "#8F44FD",
  },
});

const doctorProfileData = {
  name: "Dr. Adarsh Kumar",
  speciality: "Cardiologist",
  experience: "15 Years",
  phone: "+91 9876543210",
  email: "doctor@example.com",
  address: "New Delhi, India",
  rank: "5",
};

const DoctorProfile = () => {
  const [selectedTab, setSelectedTab] = useState<string | null>("info");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [profileImage, setProfileImage] = useState<string>(
    "/api/placeholder/128/128"
  );

  const handleTabClick = (tab: string) => {
    setSelectedTab(tab);
  };

  const handleEditOpen = () => setIsEditOpen(true);
  const handleEditClose = () => setIsEditOpen(false);

  const handleImageClick = () => setIsImageOpen(true);
  const handleImageClose = () => setIsImageOpen(false);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
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
        mt: 4,
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
        <Typography
          variant="h4"
          sx={{ textAlign: "center", fontWeight: "bold", color: "#333", mt: 2 }}
        >
          {doctorProfileData.name}
        </Typography>
        <Typography
          variant="h6"
          sx={{ fontWeight: "bold", textAlign: "center", color: "#777" }}
        >
          Rank: {doctorProfileData.rank}
        </Typography>
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
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 3,
              mt: 2,
            }}
          >
            <Box>
              <Typography variant="body1" sx={{ fontWeight: "bold", mb: 0.5 }}>
                Speciality
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <WorkIcon sx={{ color: "#8F44FD" }} />
                <Typography variant="body2" sx={{ color: "#555" }}>
                  {doctorProfileData.speciality}
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
                  {doctorProfileData.phone}
                </Typography>
              </Box>
            </Box>
            <Box>
              <Typography variant="body1" sx={{ fontWeight: "bold", mb: 0.5 }}>
                Address
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <LocationOnIcon sx={{ color: "#8F44FD" }} />
                <Typography variant="body2" sx={{ color: "#555" }}>
                  {doctorProfileData.address}
                </Typography>
              </Box>
            </Box>
            <Box>
              <Typography variant="body1" sx={{ fontWeight: "bold", mb: 0.5 }}>
                Email
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <MailOutlineIcon sx={{ color: "#8F44FD" }} />
                <Typography variant="body2" sx={{ color: "#555" }}>
                  {doctorProfileData.email}
                </Typography>
              </Box>
            </Box>
            <Box>
              <Typography variant="body1" sx={{ fontWeight: "bold", mb: 0.5 }}>
                Experience
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <InfoIcon sx={{ color: "#8F44FD" }} />
                <Typography variant="body2" sx={{ color: "#555" }}>
                  {doctorProfileData.experience}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      {selectedTab === "history" && <DoctorAppointmentHistory />}
      {selectedTab === "reviews" && <DoctorRatingsAndReviews />}

      <Modal open={isEditOpen} onClose={handleEditClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", sm: "70%", md: "50%" },
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
          }}
        >
          <AccountDetailsForm onClose={handleEditClose} />
        </Box>
      </Modal>

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
            src={profileImage}
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
