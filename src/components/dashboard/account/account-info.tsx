"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Box,
  Avatar,
  Typography,
  Tab,
  Tabs,
  IconButton,
  Modal,
  Tooltip,
  Button,
  InputAdornment,
  TextField,
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
import { Autocomplete } from "@mui/material";
import MuiTextField from "@mui/material/TextField";

import { useModifyDoctor } from "@/hooks/doctor";
import DoctorAppointmentHistory from "./appointment-history";
import DoctorRatingsAndReviews from "./d-rating-reviews";
import { Utility } from "@/utils";
import dayjs from "dayjs";
import { fetcher } from "@/apis/apiClient";
import { DoctorData } from "@/types/doctor";
import { useGetSpeciality } from "@/hooks/Speciality";
import { useGetQualification } from "@/hooks/qualification";
import { useGetSymptom } from "@/hooks/symptoms";
import { Form, Formik } from "formik";
import { setLoading } from "@/redux/features/doctorSlice";

const StyledTab = styled(Tab)({
  textTransform: "none",
  fontWeight: "bold",
  "&.Mui-selected": {
    color: "#8F44FD",
  },
});

interface DoctorResponse {
  statusCode: string | number;
  message: string;
  data: DoctorFormValues;
}

interface DoctorFormValues {
  _id?: string | number;
  username: string;
  email: string;
  password: string;
  contact: string;
  experience: string | number;
  bio: string;
  tags: string[];
  gender: string;
  dob: string;
  languagesSpoken: string[];
  address: string;
  pincode: string | number;
  profilePicture: { file: File; preview: string } | null;
  consultationFee: string | number;
  status: string;
  qualificationIds: any[];
  specializationIds: any[];
  symptomIds: any[];
  availability: { day: string; startTime: string; endTime: string }[];
}

const initialValues: DoctorFormValues = {
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
  address: "",
  pincode: "",
  profilePicture: null,
  consultationFee: "",
  status: "",
  qualificationIds: [],
  specializationIds: [],
  symptomIds: [],
  availability: [],
};

const DoctorProfile = () => {
  const doctorId = Utility().decodedToken()?.id || null;
  const { modifyDoctor } = useModifyDoctor("update-doctor");
  const [formValues, setFormValues] = useState<DoctorFormValues>(initialValues);
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

  // **Extract role and doctorId from decoded token**
  const role = Utility().decodedToken()?.role;

  useEffect(() => {
    const fetchProfile = async () => {
      if (!doctorId) return;

      try {
        let response;
        if (role === "doctor") {
          response = await fetcher("doctor", `get-doctor-by-id/${doctorId}`);
        } else {
          response = await fetcher("user", `get-user-by-id/${doctorId}`);
        }

        if (response?.data) {
          setDoctorProfileData(response.data);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, [doctorId, role]);

  const { value: specialities } = useGetSpeciality(
    null,
    "get-specialities",
    1,
    200
  );
  const { value: qualifications } = useGetQualification(
    null,
    "get-qualifications",
    1,
    200
  );
  const { value: symptoms } = useGetSymptom(null, "get-symptoms", 1, 200);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setEditFields((prev) => ({
      ...prev,
      profilePicture: { file, preview: previewUrl },
    }));
  };

  const [editFields, setEditFields] = useState<DoctorFormValues>(initialValues);

  // Populate edit fields when doctorProfileData is loaded
  useEffect(() => {
    if (doctorProfileData && specialities?.results) {
      setEditFields({
        ...doctorProfileData,
        specializationIds: doctorProfileData?.specializationIds?.map((spec) =>
          typeof spec === "object" ? spec._id : spec
        ),
        qualificationIds: doctorProfileData?.qualificationIds?.map((qual) =>
          typeof qual === "object" ? qual._id : qual
        ),
        symptomIds: doctorProfileData?.symptomIds?.map((sym) =>
          typeof sym === "object" ? sym._id : sym
        ),
      });
    }
  }, [doctorProfileData, specialities]);

  // Handle input field changes
  const handleFieldChange = (
    field: keyof DoctorData,
    value: any,
    index?: number
  ) => {
    if (field === "hospitalAffiliations" && index !== undefined) {
      // Handle updates to individual hospital affiliations when editing
      const updatedHospitalAffiliations = [...editFields.hospitalAffiliations];
      updatedHospitalAffiliations[index] = value;
      setEditFields({
        ...editFields,
        hospitalAffiliations: updatedHospitalAffiliations,
      });
    } else {
      setEditFields({ ...editFields, [field]: value });
    }
  };

  // Handle cancel changes (reset to original values)
  const handleCancelChanges = () => {
    setIsEditOpen(false);
    setEditFields(doctorProfileData ? { ...doctorProfileData } : initialValues);
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
      {/* Edit Button */}
      <Tooltip title="Edit Profile">
        <IconButton
          onClick={handleEditOpen}
          sx={{
            display: "flex",
            flexDirection: "column", // Change to column to align the buttons vertically
            position: "absolute",
            top: 16,
            right: 2,
            bgcolor: "white",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
            "&:hover": { bgcolor: "grey.100" },
            transition: "all 0.3s ease", // Smooth transition when Edit icon is clicked
          }}
        >
          <EditIcon />
        </IconButton>
      </Tooltip>

      {/* Save and Cancel buttons, shown when Edit mode is active */}
      {isEditOpen && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column", // Change to column to align the buttons vertically
            position: "absolute",
            top: 70, // Keep this to align the buttons below the Edit icon
            right: -3,
            opacity: isEditOpen ? 1 : 0,
            transform: isEditOpen ? "translateY(0)" : "translateY(-20px)",
            transition: "opacity 0.3s ease, transform 0.3s ease",
            width: "auto", // Adjust the width to auto so buttons stay in the same space
            mr: 1,
          }}
        >
          <Button
            type="button"
            variant="contained"
            color="success"
            onClick={handleSaveChanges}
            sx={{ mb: 1, width: "15" }} // Adjusted width to fill the container width
            disabled={
              JSON.stringify(editFields) === JSON.stringify(doctorProfileData)
            }
          >
            Save
          </Button>

          <Button
            color="error"
            variant="contained"
            sx={{ mb: 1, width: "20" }} // Adjusted width to fill the container width
            onClick={handleCancelChanges}
          >
            Cancel
          </Button>
        </Box>
      )}

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
              Width: "80%",
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
                width: "auto",
                minWidth: "200px",
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

        {role === "doctor" &&
          (isEditOpen ? (
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
                type="text"
                value={editFields.bio}
                onChange={(e) => {
                  handleFieldChange("bio", e.target.value);

                  // Ensure dynamic width adjustment for bio
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
          ))}
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
        {role === "doctor" && (
          <>
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
          </>
        )}
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

            {role === "doctor" && (
              <Box>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: "bold", mb: 0.5 }}
                >
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
                      {doctorProfileData?.experience || "15"} years
                    </Typography>
                  )}
                </Box>
              </Box>
            )}

            {role === "doctor" && (
              <Box>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: "bold", mb: 0.5 }}
                >
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
            )}

            {/* <Box>
              <Typography variant="body1" sx={{ fontWeight: "bold", mb: 0.5 }}>
                Languages Spoken
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <TranslateIcon sx={{ color: "#8F44FD" }} />
                {isEditOpen ? (
                  <input
                    type="text"
                    value={editFields.languagesSpoken?.join(", ")}
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
                          e.target.value = currentValue?.slice(0, -1);
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
            </Box> */}

            <Box>
              <Typography variant="body1" sx={{ fontWeight: "bold", mb: 0.5 }}>
                Status
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {/* Show icon based on status when edit mode is not active */}
                {!isEditOpen && doctorProfileData?.status === "active" && (
                  <CheckCircleOutlineIcon sx={{ color: "success.main" }} />
                )}
                {!isEditOpen && doctorProfileData?.status === "inactive" && (
                  <HighlightOffIcon sx={{ color: "red" }} />
                )}
                {!isEditOpen && doctorProfileData?.status === "on leave" && (
                  <HighlightOffIcon sx={{ color: "yellow" }} />
                )}

                {/* Show icon corresponding to the selected status when in edit mode */}
                {isEditOpen && editFields.status === "active" && (
                  <CheckCircleOutlineIcon sx={{ color: "success.main" }} />
                )}
                {isEditOpen && editFields.status === "inactive" && (
                  <HighlightOffIcon sx={{ color: "red" }} />
                )}
                {isEditOpen && editFields.status === "on leave" && (
                  <HighlightOffIcon sx={{ color: "yellow" }} />
                )}

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
                  <Typography variant="body2" sx={{ color: "#555" }}>
                    {doctorProfileData?.status || "On leave"}
                  </Typography>
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

            {role === "doctor" && (
              <Box>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: "bold", mb: 0.5 }}
                >
                  Qualification
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <SchoolIcon sx={{ color: "#8F44FD" }} />

                  {isEditOpen ? (
                    <Autocomplete
                      multiple
                      options={qualifications?.results || []}
                      getOptionLabel={(option) => option?.name || ""}
                      value={editFields?.qualificationIds?.map(
                        (id) =>
                          qualifications?.results.find(
                            (qualification) => qualification._id === id
                          ) || {}
                      )}
                      onChange={(event, newValue) => {
                        handleFieldChange(
                          "qualificationIds",
                          newValue.map((qualification) => qualification._id)
                        );
                      }}
                      renderInput={(params) => (
                        <MuiTextField
                          {...params}
                          label="Select Qualifications"
                          variant="outlined"
                          sx={{ width: "220px" }}
                        />
                      )}
                    />
                  ) : (
                    <Typography variant="body2" sx={{ color: "#555" }}>
                      {Array.isArray(doctorProfileData?.qualificationIds) &&
                      doctorProfileData.qualificationIds.length > 0
                        ? doctorProfileData.qualificationIds
                            .map((qualId) => {
                              if (typeof qualId === "object" && qualId._id) {
                                return qualId.name;
                              } else {
                                const qualification =
                                  qualifications?.results.find(
                                    (s) => s._id === qualId
                                  );
                                return qualification
                                  ? qualification.name
                                  : "Unknown";
                              }
                            })
                            .join(", ")
                        : "Not Specified"}
                    </Typography>
                  )}
                </Box>
              </Box>
            )}

            {role === "doctor" && (
              <Box>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: "bold", mb: 0.5 }}
                >
                  Specialization
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <WorkIcon sx={{ color: "#8F44FD" }} />
                  {isEditOpen ? (
                    <Autocomplete
                      multiple
                      options={specialities?.results || []}
                      getOptionLabel={(option) => option?.name || ""}
                      value={editFields?.specializationIds?.map(
                        (id) =>
                          specialities?.results.find(
                            (spec) => spec._id === id
                          ) || {}
                      )}
                      onChange={(event, newValue) => {
                        handleFieldChange(
                          "specializationIds",
                          newValue.map((spec) => spec._id)
                        );
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Specialization"
                          variant="outlined"
                          sx={{ width: "220px" }}
                        />
                      )}
                    />
                  ) : (
                    <Typography variant="body2" sx={{ color: "#555" }}>
                      {Array.isArray(doctorProfileData?.specializationIds) &&
                      doctorProfileData.specializationIds.length > 0
                        ? doctorProfileData.specializationIds
                            .map((spec) => {
                              if (typeof spec === "object" && spec._id) {
                                return spec.name;
                              } else {
                                const specialization =
                                  specialities?.results.find(
                                    (s) => s._id === spec
                                  );
                                return specialization
                                  ? specialization.name
                                  : "Unknown";
                              }
                            })
                            .join(", ")
                        : "Not Specified"}
                    </Typography>
                  )}
                </Box>
              </Box>
            )}

            {role === "doctor" && (
              <Box>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: "bold", mb: 0.5 }}
                >
                  Symptoms
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <SickIcon sx={{ color: "#8F44FD" }} />
                  {isEditOpen ? (
                    <Autocomplete
                      multiple
                      options={symptoms?.results || []}
                      getOptionLabel={(option) => option?.name || ""}
                      value={editFields?.symptomIds?.map(
                        (id) =>
                          symptoms?.results.find((sym) => sym._id === id) || {}
                      )}
                      onChange={(event, newValue) => {
                        handleFieldChange(
                          "symptomIds",
                          newValue.map((sym) => sym._id)
                        );
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Select Symptoms"
                          variant="outlined"
                          sx={{ width: "220px" }}
                        />
                      )}
                    />
                  ) : (
                    <Typography variant="body2" sx={{ color: "#555" }}>
                      {Array.isArray(doctorProfileData?.symptomIds) &&
                      doctorProfileData.symptomIds.length > 0
                        ? doctorProfileData.symptomIds
                            .map((sym) => {
                              if (typeof sym === "object" && sym._id) {
                                return sym.name;
                              } else {
                                const symptom = symptoms?.results.find(
                                  (s) => s._id === sym
                                );
                                return symptom ? symptom.name : "Unknown";
                              }
                            })
                            .join(", ")
                        : "Not Specified"}
                    </Typography>
                  )}
                </Box>
              </Box>
            )}

            {role === "doctor" && (
              <Box>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: "bold", mb: 0.5 }}
                >
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
                    <Button
                      variant="outlined"
                      color="primary"
                      sx={{ mt: -4 }}
                      onClick={() =>
                        handleFieldChange("availability", [
                          ...editFields.availability,
                          { day: "", startTime: "", endTime: "" },
                        ])
                      }
                    >
                      Add
                    </Button>
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
            )}

            {role === "doctor" && (
              <Box>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: "bold", mb: 0.5 }}
                >
                  Hospital Affiliations
                </Typography>

                {isEditOpen ? (
                  <>
                    {editFields?.hospitalAffiliations?.length === 0 ? (
                      <Typography variant="body2" sx={{ color: "#555" }}>
                        No hospital affiliations added yet.
                      </Typography>
                    ) : (
                      editFields?.hospitalAffiliations?.map(
                        (hospital, index) => (
                          <Box
                            key={index}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              mb: 1,
                              flexDirection: "column",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <LocalHospitalIcon sx={{ color: "#8F44FD" }} />
                              <input
                                type="text"
                                value={hospital}
                                onChange={(e) =>
                                  handleFieldChange(
                                    "hospitalAffiliations",
                                    e.target.value,
                                    index
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
                            </Box>
                            <button
                              onClick={() => {
                                const updatedAffiliations =
                                  editFields.hospitalAffiliations.filter(
                                    (_, idx) => idx !== index
                                  );
                                handleFieldChange(
                                  "hospitalAffiliations",
                                  updatedAffiliations
                                );
                              }}
                              style={{
                                background: "transparent",
                                border: "none",
                                cursor: "pointer",
                                color: "red",
                                marginTop: "1px",
                              }}
                            >
                              Remove
                            </button>
                          </Box>
                        )
                      )
                    )}
                    <Button
                      variant="outlined"
                      color="primary"
                      sx={{ mt: -2 }}
                      onClick={() =>
                        setEditFields({
                          ...editFields,
                          hospitalAffiliations: [
                            ...editFields.hospitalAffiliations,
                            "",
                          ],
                        })
                      }
                    >
                      Add
                    </Button>
                  </>
                ) : (
                  <>
                    {Array.isArray(doctorProfileData?.hospitalAffiliations) &&
                    doctorProfileData.hospitalAffiliations.length > 0 ? (
                      doctorProfileData.hospitalAffiliations.map(
                        (hospital, index) => (
                          <Box
                            key={index}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <LocalHospitalIcon sx={{ color: "#8F44FD" }} />
                            <Typography variant="body2" sx={{ color: "#555" }}>
                              {hospital}
                            </Typography>
                          </Box>
                        )
                      )
                    ) : (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <LocalHospitalIcon sx={{ color: "#8F44FD" }} />
                        <Typography variant="body2" sx={{ color: "#555" }}>
                          Apollo Hospital
                        </Typography>
                      </Box>
                    )}
                  </>
                )}
              </Box>
            )}
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
