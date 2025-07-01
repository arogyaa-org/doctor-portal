import React from "react";
import {
  Box,
  Avatar,
  Typography,
  Tab,
  Tabs,
  IconButton,
  Modal,
  Tooltip,
  Menu,
  MenuItem,
} from "@mui/material";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import HistoryIcon from "@mui/icons-material/History";
import ReviewsIcon from "@mui/icons-material/RateReview";
import InfoIcon from "@mui/icons-material/Info";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { styled } from "@mui/system";
import PersonIcon from "@mui/icons-material/Person";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import SchoolIcon from "@mui/icons-material/School";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ManIcon from "@mui/icons-material/Man";
import WomanIcon from "@mui/icons-material/Woman";
import SickIcon from "@mui/icons-material/Sick";
import WorkIcon from "@mui/icons-material/Work";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import DoctorAppointmentHistory from "./appointment-history";
import DoctorRatingsAndReviews from "./d-rating-reviews";
import { DoctorData } from "@/types/doctor";
import { useGetSpeciality } from "@/hooks/Speciality";
import { useGetQualification } from "@/hooks/qualification";
import { useGetSymptom } from "@/hooks/symptoms";
import dayjs from "dayjs";

const StyledTab = styled(Tab)({
  textTransform: "none",
  fontWeight: "bold",
  "&.Mui-selected": {
    color: "#8F44FD",
  },
});

interface DoctorProfileViewProps {
  doctorProfileData: DoctorData | null;
  selectedTab: string | null;
  handleTabClick: (tab: string) => void;
  handleEditOpen: () => void;
  handleImageClick: () => void;
  handleImageClose: () => void;
  isImageOpen: boolean;
  role: string | undefined;
  isLoading: boolean;
}

// eslint-disable-next-line react/function-component-definition
const DoctorProfileView: React.FC<DoctorProfileViewProps> = ({
  doctorProfileData,
  selectedTab,
  handleTabClick,
  handleEditOpen,
  handleImageClick,
  handleImageClose,
  isImageOpen,
  role,
  isLoading,
}) => {
  const { value: specialities } = useGetSpeciality(
    null,
    "get-specialities",
    1,
    200,
    ""
  );
  const { value: qualifications } = useGetQualification(
    null,
    "get-qualifications",
    1,
    200,
    ""
  );
  const { value: symptoms } = useGetSymptom(null, "get-symptoms", 1, 200, "");
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const onEditClick = () => {
    console.log(
      "DoctorProfileView - doctorProfileData on Edit click:",
      doctorProfileData
    );
    handleEditOpen();
  };

  return (
    <>
      <Tooltip title="Edit Profile">
        <IconButton
          onClick={onEditClick}
          disabled={isLoading || !doctorProfileData}
          sx={{
            display: "flex",
            flexDirection: "column",
            position: "absolute",
            top: 16,
            right: 2,
            bgcolor: "white",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
            "&:hover": { bgcolor: "grey.100" },
            transition: "all 0.3s ease",
            opacity: isLoading || !doctorProfileData ? 0.5 : 1,
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
            src={doctorProfileData?.profilePicture || ""}
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
            <input type="file" accept="image/*" hidden />
            <PhotoCamera fontSize="small" />
          </IconButton>
        </Box>

        <Typography
          variant="h4"
          sx={{
            textAlign: "center",
            fontWeight: "bold",
            color: "#333",
            mt: 2,
            cursor: "pointer",
          }}
          onClick={onEditClick}
        >
          {doctorProfileData?.username || "Not Available"}
        </Typography>

        {(role === "doctor" || role === "admin") && (
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
        {role === "doctor" && [
          <StyledTab
            key="history"
            icon={<HistoryIcon />}
            iconPosition="start"
            label="Appointment History"
            value="history"
          />,
          <StyledTab
            key="reviews"
            icon={<ReviewsIcon />}
            iconPosition="start"
            label="Rating and Reviews"
            value="reviews"
          />,
        ]}
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
                <PhoneIcon sx={{ color: "#8F44FD" }} />
                <Typography variant="body2" sx={{ color: "#555" }}>
                  {doctorProfileData?.contact || "No Contact Available"}
                </Typography>
              </Box>
            </Box>

            <Box>
              <Typography variant="body1" sx={{ fontWeight: "bold", mb: 0.5 }}>
                Email
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <EmailIcon sx={{ color: "#8F44FD" }} />
                <Typography variant="body2" sx={{ color: "#555" }}>
                  {doctorProfileData?.email || "No Email Available"}
                </Typography>
              </Box>
            </Box>

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
                <Typography variant="body2" sx={{ color: "#555" }}>
                  {doctorProfileData?.gender || "Not Specified"}
                </Typography>
              </Box>
            </Box>

            <Box>
              <Typography variant="body1" sx={{ fontWeight: "bold", mb: 0.5 }}>
                Date of Birth
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CalendarMonthIcon sx={{ color: "#8F44FD" }} />
                <Typography variant="body2" sx={{ color: "#555" }}>
                  {doctorProfileData?.dob
                    ? dayjs(doctorProfileData.dob).format("DD/MM/YYYY")
                    : "Not Available"}
                </Typography>
              </Box>
            </Box>

            <Box>
              <Typography variant="body1" sx={{ fontWeight: "bold", mb: 0.5 }}>
                Status
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {doctorProfileData?.status === "active" && (
                  <CheckCircleOutlineIcon sx={{ color: "success.main" }} />
                )}
                {doctorProfileData?.status === "inactive" && (
                  <HighlightOffIcon sx={{ color: "red" }} />
                )}
                {doctorProfileData?.status === "on leave" && (
                  <HighlightOffIcon sx={{ color: "yellow" }} />
                )}
                <Typography variant="body2" sx={{ color: "#555" }}>
                  {doctorProfileData?.status || "Not Available"}
                </Typography>
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
                  <Typography variant="body2" sx={{ color: "#555" }}>
                    {doctorProfileData?.experience
                      ? `${doctorProfileData.experience} years`
                      : "Not Available"}
                  </Typography>
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
                  <Typography variant="body2" sx={{ color: "#555" }}>
                    {doctorProfileData?.consultationFee || "Not Available"}
                  </Typography>
                </Box>
              </Box>
            )}

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
                  <Typography variant="body2" sx={{ color: "#555" }}>
                    {doctorProfileData?.qualificationIds?.length > 0
                      ? doctorProfileData.qualificationIds
                          .map((qualId) => {
                            const qualification = qualifications?.results?.find(
                              (q) =>
                                q._id ===
                                (typeof qualId === "object"
                                  ? qualId._id
                                  : qualId)
                            );
                            return qualification?.name || "Unknown";
                          })
                          .filter((name) => name !== "Unknown")
                          .join(", ") || "Not Available"
                      : "Not Available"}
                  </Typography>
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
                  <Typography variant="body2" sx={{ color: "#555" }}>
                    {doctorProfileData?.specializationIds?.length > 0
                      ? doctorProfileData.specializationIds
                          .map((specId) => {
                            const specialization = specialities?.results?.find(
                              (s) =>
                                s._id ===
                                (typeof specId === "object"
                                  ? specId._id
                                  : specId)
                            );
                            return specialization?.name || "Unknown";
                          })
                          .filter((name) => name !== "Unknown")
                          .join(", ") || "Not Available"
                      : "Not Available"}
                  </Typography>
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
                  <Typography variant="body2" sx={{ color: "#555" }}>
                    {doctorProfileData?.symptomIds?.length > 0
                      ? doctorProfileData.symptomIds
                          .map((symId) => {
                            const symptom = symptoms?.results?.find(
                              (s) =>
                                s._id ===
                                (typeof symId === "object" ? symId._id : symId)
                            );
                            return symptom?.name || "Unknown";
                          })
                          .filter((name) => name !== "Unknown")
                          .join(", ") || "Not Available"
                      : "Not Available"}
                  </Typography>
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
                {doctorProfileData?.availability?.length > 0 ? (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        flexDirection: "column",
                        alignItems: "flex-start",
                        mb: 1,
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <LocalHospitalIcon sx={{ color: "#8F44FD" }} />
                        <Typography variant="body2" sx={{ color: "#555" }}>
                          {doctorProfileData.availability[0].hospitalName &&
                          doctorProfileData.availability[0].hospitalLocation
                            ? `${doctorProfileData.availability[0].hospitalName} - ${doctorProfileData.availability[0].hospitalLocation}`
                            : "Hospital Not Specified"}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          ml: 4,
                        }}
                      >
                        <AccessTimeIcon sx={{ color: "#8F44FD" }} />
                        <Typography variant="body2" sx={{ color: "#555" }}>
                          {doctorProfileData.availability[0].day}:{" "}
                          {doctorProfileData.availability[0].startTime} -{" "}
                          {doctorProfileData.availability[0].endTime}
                        </Typography>
                      </Box>
                    </Box>
                    {doctorProfileData.availability.length > 1 && (
                      <>
                        <IconButton
                          onClick={handleMenuClick}
                          sx={{ alignSelf: "flex-start" }}
                        >
                          <ArrowDropDownIcon sx={{ color: "#8F44FD" }} />
                        </IconButton>
                        <Menu
                          anchorEl={anchorEl}
                          open={Boolean(anchorEl)}
                          onClose={handleMenuClose}
                        >
                          {doctorProfileData.availability
                            .slice(1)
                            .map((slot, index) => (
                              <MenuItem key={index} onClick={handleMenuClose}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 1,
                                  }}
                                >
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                    }}
                                  >
                                    <LocalHospitalIcon
                                      sx={{ color: "#8F44FD" }}
                                    />
                                    <Typography
                                      variant="body2"
                                      sx={{ color: "#555" }}
                                    >
                                      {slot.hospitalName &&
                                      slot.hospitalLocation
                                        ? `${slot.hospitalName} - ${slot.hospitalLocation}`
                                        : "Hospital Not Specified"}
                                    </Typography>
                                  </Box>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                      ml: 4,
                                    }}
                                  >
                                    <AccessTimeIcon sx={{ color: "#8F44FD" }} />
                                    <Typography
                                      variant="body2"
                                      sx={{ color: "#555" }}
                                    >
                                      {slot.day}: {slot.startTime} -{" "}
                                      {slot.endTime}
                                    </Typography>
                                  </Box>
                                </Box>
                              </MenuItem>
                            ))}
                        </Menu>
                      </>
                    )}
                  </Box>
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
            alt="Doctor"
            src={doctorProfileData?.profilePicture || ""}
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
    </>
  );
};

export default DoctorProfileView;
