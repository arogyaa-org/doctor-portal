"use client";

import React, { useEffect, useState } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { DoctorData } from "@/types/doctor";
import { fetcher } from "@/apis/apiClient";
import { Utility } from "@/utils";
import DoctorProfileView from "./doctorProfileView";
import DoctorProfileEdit from "./doctorProfileEdit";

interface getApiResponse {
  statusCode: number;
  message: string;
  data: DoctorData;
}

const initialValues: DoctorData = {
  username: "",
  email: "",
  password: "",
  contact: "",
  gender: "",
  dob: "",
  experience: "",
  bio: "",
  tags: [],
  languagesSpoken: [],
  clinicAddress: "",
  pincode: "",
  profilePicture: null,
  consultationFee: "",
  status: "",
  qualificationIds: [],
  specializationIds: [],
  symptomIds: [],
  availability: [],
  isVerified: false,
};

// eslint-disable-next-line react/function-component-definition
const DoctorProfile = () => {
  const [selectedTab, setSelectedTab] = useState<string | null>("info");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [doctorProfileData, setDoctorProfileData] = useState<DoctorData | null>(
    null
  );
  const [editFields, setEditFields] = useState<DoctorData>(initialValues);
  const [isLoading, setIsLoading] = useState(true);

  const { decodedToken } = Utility();
  const RoleId = decodedToken()?.id || null;
  const role = decodedToken()?.role;

  useEffect(() => {
    const fetchProfile = async () => {
      if (!RoleId) {
        setIsLoading(false);
        return;
      }

      try {
        let response: undefined | getApiResponse;
        if (role === "doctor") {
          response = await fetcher("doctor", `get-doctor-by-id/${RoleId}`);
        } else if (role === "admin") {
          response = await fetcher("user", `get-user-by-id/${RoleId}`);
        }

        if (response?.data) {
          const mappedData = {
            ...response.data,
            availability:
              role === "doctor" && response.data.availability
                ? response.data.availability.map((slot: any) => ({
                    day: slot.day,
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                    hospitalName: slot.hospital?.name || "",
                    hospitalLocation: slot.hospital?.location || "",
                    _id: slot._id,
                  }))
                : [],
          };
          setDoctorProfileData(mappedData);
          setEditFields(mappedData);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [RoleId, role]);

  const handleTabClick = (tab: string) => setSelectedTab(tab);

  const handleEditOpen = () => {
    if (doctorProfileData) {
      setIsEditOpen(true);
    }
  };

  const handleImageClick = () => setIsImageOpen(true);
  const handleImageClose = () => setIsImageOpen(false);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!doctorProfileData) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Typography variant="h6" color="error">
          Failed to load profile data.
        </Typography>
      </Box>
    );
  }

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
      {isEditOpen ? (
        <DoctorProfileEdit
          editFields={editFields}
          setEditFields={setEditFields}
          doctorProfileData={doctorProfileData}
          setDoctorProfileData={setDoctorProfileData}
          setIsEditOpen={setIsEditOpen}
          role={role}
        />
      ) : (
        <DoctorProfileView
          doctorProfileData={doctorProfileData}
          selectedTab={selectedTab}
          handleTabClick={handleTabClick}
          handleEditOpen={handleEditOpen}
          handleImageClick={handleImageClick}
          handleImageClose={handleImageClose}
          isImageOpen={isImageOpen}
          role={role}
          isLoading={isLoading}
        />
      )}
    </Box>
  );
};

export default DoctorProfile;
