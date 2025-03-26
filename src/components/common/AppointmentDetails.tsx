import {
  Dialog,
  DialogTitle,
  Typography,
  Button,
  Divider,
  Box,
  Grid,
  Chip,
  Avatar,
  IconButton,
  styled,
} from "@mui/material";
import { format } from "date-fns";
import {
  MedicalServices as MedicalIcon,
  LocationOn as LocationIcon,
  Wc as GenderIcon,
  CalendarMonth as CalendarMonthIcon,
  Assignment as AssignmentIcon,
  Phone as PhoneIcon,
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
} from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

import { useGetPatient } from "@/hooks/patient";

interface AppointmentModalProps {
  open: boolean;
  onClose: () => void;
  appointment: any;
  patientId: string;
  onTabChange: () => void;
  formatTimeToIST: () => void;
}

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

const StatusChip = ({ status }: { status: string }) => {
  let color:
    | "default"
    | "primary"
    | "secondary"
    | "error"
    | "info"
    | "success"
    | "warning" = "default";
  let icon = <AccessTimeIcon />;

  switch (status.toLowerCase()) {
    case "approved":
    case "scheduled":
      color = "success";
      icon = <CheckCircleIcon />;
      break;
    case "pending":
      color = "warning";
      icon = <HourglassEmptyIcon />;
      break;
    case "cancelled":
      color = "error";
      icon = <CancelIcon />;
      break;
    case "in progress":
      color = "info";
      icon = <AccessTimeIcon />;
      break;
    default:
      color = "default";
  }

  return (
    <Chip
      icon={icon}
      label={status}
      color={color}
      size="small"
      variant="outlined"
    />
  );
};

const AppointmentModal: React.FC<AppointmentModalProps> = ({
  open,
  onClose,
  appointment,
  patientId,
  onTabChange,
  formatTimeToIST,
}) => {
  const patientid = patientId ? patientId._id : null;
  const { value: patientData, swrLoading: patientLoading } = useGetPatient(
    null,
    `get-patient-by-id/${patientid}`,
    1,
    1
  );

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

  const handleTabChange = (tabKey: string) => {
    onTabChange(tabKey);
    onClose();
  };

  if (patientLoading) {
    return <div>Loading...</div>;
  }

  const getInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : "P";
  };
  const getStatus = () => {
    if (!appointment) return "Pending";
    return typeof appointment.status === "string"
      ? appointment.status
      : "Pending";
  };

  const patientHeight = patientData?.data?.height || "None";
  const patientWeight = patientData?.data?.weight || "None";
  const status = getStatus();
  const bmi = calculateBMI(patientHeight, patientWeight);
  const bmiCategory = getBMICategory(bmi);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: 3,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
          backgroundColor: "#f8f9fa",
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          Appointment Details
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider />

      {/* Patient Info Section */}
      <Box sx={{ p: 2, backgroundColor: "#f8f9fa" }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <StyledAvatar sx={{ marginRight: 1 }}>
                  {getInitial(patientData?.data?.username)}
                </StyledAvatar>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  sx={{ marginRight: 1 }}
                >
                  {patientData?.data?.username}
                </Typography>
                <StatusChip status={status} />
              </Box>

              {/* Date and Time section aligned to the right */}
              <Box sx={{ display: "flex", gap: 1 }}>
                <AppointmentInfoChip>
                  <EventIcon />
                  <Typography variant="body2" sx={{ mr: 0.5 }}>
                    Date:
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {appointment?.appointmentDate
                      ? format(
                          new Date(appointment.appointmentDate),
                          "dd MMM yyyy"
                        )
                      : "N/A"}
                  </Typography>
                </AppointmentInfoChip>

                <AppointmentInfoChip>
                  <AccessTimeIcon />
                  <Typography variant="body2" sx={{ mr: 0.5 }}>
                    Time:
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {formatTimeToIST(appointment?.appointmentTime)}
                  </Typography>
                </AppointmentInfoChip>
              </Box>
            </Box>

            <Divider sx={{ mb: 1 }} />

            {/* Patient Basic Info Header */}
            <Grid container spacing={2.5}>
              {[
                {
                  icon: <GenderIcon color="primary" />,
                  label: "Gender",
                  value: patientData?.data?.gender,
                },
                {
                  icon: <CalendarMonthIcon color="primary" />,
                  label: "Age",
                  value: patientData?.data?.age,
                },
                {
                  icon: <PhoneIcon color="primary" />,
                  label: "Phone",
                  value: patientData?.data?.contact,
                },
                {
                  icon: <LocationIcon color="primary" />,
                  label: "Address",
                  value: patientData?.data?.address,
                },
                {
                  icon: <CakeIcon color="primary" />,
                  label: "DOB",
                  value: patientData?.data?.dob,
                },
                {
                  icon: <MailIcon color="primary" />,
                  label: "Email",
                  value: patientData?.data?.email,
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
                  icon: <MedicalIcon color="primary" />,
                  label: "Medical History",
                  value: patientData?.data?.medicalHistory?.join(", "),
                },
                {
                  icon: <MedicationLiquidIcon color="primary" />,
                  label: "Current Medication",
                  value: patientData?.data?.currentMedication?.join(", "),
                },
                {
                  icon: <BloodtypeIcon color="primary" />,
                  label: "Blood Group",
                  value: patientData?.data?.bloodGroup,
                },
                {
                  icon: <MonitorWeightIcon color="primary" />,
                  label: "Weight",
                  value: patientData?.data?.weight,
                },
                {
                  icon: <AlignHorizontalLeftIcon color="primary" />,
                  label: "Height",
                  value: patientData?.data?.height,
                },
                {
                  icon: <AllInboxIcon color="primary" />,
                  label: "BMI Index",
                  value: `${bmi ? bmi.toFixed(2) : "N/A"} - ${bmiCategory}`,
                },
              ].map((detail, index) => (
                <Grid item xs={12} sm={4} key={index}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      py: 0.3,
                      px: 0.3,
                      borderRadius: 1,
                      "&:hover": {
                        backgroundColor: "rgba(25, 118, 210, 0.04)",
                      },
                    }}
                  >
                    {detail.icon}
                    <Box>
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
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Box>

      {/* Footer with action buttons */}
      <Box
        sx={{
          p: 1,
          display: "flex",
          justifyContent: "flex-end",
          gap: 2,
          backgroundColor: "#f8f9fa",
          borderTop: "1px solid rgba(0,0,0,0.08)",
        }}
      >
        <Button
          variant="outlined"
          color="primary"
          startIcon={<AssignmentIcon sx={{ color: "#FF9800" }} />}
          onClick={() => handleTabChange("tests")}
        >
          View Tests
        </Button>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<MedicalIcon sx={{ color: "#9C27B0" }} />}
          onClick={() => handleTabChange("treatment")}
        >
          View Treatments
        </Button>
      </Box>
    </Dialog>
  );
};

export default AppointmentModal;
