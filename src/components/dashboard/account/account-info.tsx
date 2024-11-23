import React, { useState } from "react";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  IconButton,
  Stack,
  Typography,
  Modal,
} from "@mui/material";
import {
  PhotoCamera,
  Edit,
  Phone,
  Mail,
  LocationOn,
  Work,
  AccessTime,
  Close,
} from "@mui/icons-material";
import AccountDetailsForm from "./account-details-form";

const doctorProfileData = {
  name: "Dr. Adarsh Kumar",
  speciality: "Cardiologist",
  experience: "15 Years",
  phone: "+91 9876543210",
  email: "doctor@examplegdhgh.com",
  address: "New Delhi, India",
  rank: "5",
};

export default function AccountInfo(): React.JSX.Element {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isImageOpen, setIsImageOpen] = useState(false); 

  const handleEditOpen = () => setIsEditOpen(true);
  const handleEditClose = () => setIsEditOpen(false);

  const handleImageClick = () => setIsImageOpen(true); 
  const handleImageClose = () => setIsImageOpen(false); 

  return (
    <Card
      sx={{
        maxWidth: 700,
        minWidth: 400,
        mx: "auto",
        mt: -2,
        borderRadius: 4,
        boxShadow: 30,
        bgcolor: "success.light",
        overflow: "visible",
        transition: "transform 0.3s, box-shadow 0.3s",
        "&:hover": {
          boxShadow: 14,
          transform: "scale(1.02)",
        },
      }}
    >
      {/* Edit and Rank Section */}
      <Box sx={{ display: "flex", justifyContent: "space-between", p: 2 }}>
        <Typography variant="h6" fontWeight="bold" color="primary">
          Rank: {doctorProfileData.rank}
        </Typography>
        <IconButton
          onClick={handleEditOpen}
          sx={{
            color: "primary.main",
            "&:hover": { bgcolor: "grey.200" },
          }}
          title="Edit Profile"
        >
          <Edit fontSize="medium" />
        </IconButton>
      </Box>

      {/* Profile Image */}
      <Box
        sx={{
          position: "relative",
          textAlign: "center",
          mb: 2,
        }}
      >
        <Avatar
          src="/api/placeholder/128/128"
          alt="Doctor"
          sx={{
            width: 150,
            height: 150,
            mx: "auto",
            border: "4px solid white",
            boxShadow: 3,
            cursor: "pointer", 
          }}
          onClick={handleImageClick} 
        />
        {/* Camera Icon with File Upload */}
        <IconButton
          sx={{
            position: "absolute",
            top: "70%",
            left: "calc(50% + 60px)",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            color: "primary.main",
            p: 1,
            boxShadow: 3,
            "&:hover": { bgcolor: "grey.200" },
          }}
          component="label"
        >
          <PhotoCamera />
          {/* Hidden File Input */}
          <input type="file" accept="image/*" hidden />
        </IconButton>
      </Box>

      {/* Doctor Details */}
      <CardContent sx={{ textAlign: "center" }}>
        <Typography variant="h5" fontWeight="bold" color="black">
          {doctorProfileData.name}
        </Typography>
        <Stack spacing={2} alignItems="center" mt={2}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              bgcolor: "rgb(179, 200, 207)",
              p: 1,
              borderRadius: 2,
              boxShadow: 2,
            }}
          >
            <Work color="primary" />
            <Typography>{doctorProfileData.speciality}</Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              bgcolor: "rgb(179, 200, 207)",
              p: 1,
              borderRadius: 2,
              boxShadow: 2,
            }}
          >
            <AccessTime color="primary" />
            <Typography>
              {doctorProfileData.experience} of Experience
            </Typography>
          </Box>
        </Stack>
      </CardContent>

     
      <Box sx={{ borderTop: "1px solid", borderColor: "grey.300", mx: 2 }} />

      {/* Contact Information */}
      <CardContent>
        <Stack
          direction="row"
          spacing={2}
          justifyContent="center"
          sx={{ flexWrap: "wrap" }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              bgcolor: "rgb(179, 200, 207)",
              p: 1,
              borderRadius: 2,
              boxShadow: 2,
            }}
          >
            <Phone color="primary" />
            <Typography>{doctorProfileData.phone}</Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              bgcolor: "rgb(179, 200, 207)",
              p: 1,
              borderRadius: 2,
              boxShadow: 2,
            }}
          >
            <Mail color="primary" />
            <Typography>{doctorProfileData.email}</Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              bgcolor: "rgb(179, 200, 207)",
              p: 1,
              borderRadius: 2,
              boxShadow: 2,
            }}
          >
            <LocationOn color="primary" />
            <Typography>{doctorProfileData.address}</Typography>
          </Box>
        </Stack>
      </CardContent>

      {/* Edit Profile Modal */}
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

      {/* Image Modal */}
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
          {/* Close Icon */}
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
            <Close />
          </IconButton>
          <Avatar
            src="/api/placeholder/128/128"
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
    </Card>
  );
}
