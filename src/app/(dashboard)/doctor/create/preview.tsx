import {
  Box,
  Grid,
  Typography,
  Paper,
  IconButton,
  Avatar,
  Chip,
  Card,
  CardContent,
  Divider,
  Stack,
  Badge,
} from "@mui/material";
import {
  Visibility,
  Person,
  Work,
  Schedule,
  VerifiedUser,
  LocationOn,
  Phone,
  Email,
  CalendarToday,
  Language,
  MedicalServices,
  Assignment,
  LocalHospital,
} from "@mui/icons-material";
import dayjs from "dayjs";

interface PreviewProps {
  values: any;
  specialities: any[];
  qualifications: any[];
  symptoms: any[];
  role: string;
  canManageDocs: boolean;
  viewerOpen: boolean;
  setViewerOpen: (open: boolean) => void;
  viewerTitle: string;
  setViewerTitle: (title: string) => void;
  viewerType: "image" | "pdf" | "doc" | "unknown";
  setViewerType: (type: "image" | "pdf" | "doc" | "unknown") => void;
  viewerSrc: string;
  setViewerSrc: (src: string) => void;
  revokeOnClose: string | null;
  setRevokeOnClose: (src: string | null) => void;
}

// Utility functions for document handling
const inferTypeFromUrl = (url: string): "image" | "pdf" | "doc" | "unknown" => {
  const extension = url.split(".").pop()?.toLowerCase();

  if (
    ["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"].includes(
      extension || ""
    )
  ) {
    return "image";
  }
  if (extension === "pdf") {
    return "pdf";
  }
  if (["doc", "docx", "txt", "rtf"].includes(extension || "")) {
    return "doc";
  }
  return "unknown";
};

const googleDocViewer = (url: string): string => {
  return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
};

// eslint-disable-next-line react/function-component-definition
const Preview: React.FC<PreviewProps> = ({
  values,
  specialities,
  qualifications,
  symptoms,
  role,
  canManageDocs,
  viewerOpen,
  setViewerOpen,
  viewerTitle,
  setViewerTitle,
  viewerType,
  setViewerType,
  viewerSrc,
  setViewerSrc,
  revokeOnClose,
  setRevokeOnClose,
}) => {
  const openViewer = (item: any) => {
    if (revokeOnClose) {
      URL.revokeObjectURL(revokeOnClose);
      setRevokeOnClose(null);
    }

    if (typeof item === "string") {
      const type = inferTypeFromUrl(item);
      setViewerTitle(item.split("/").pop() || "Document");
      setViewerType(type);
      setViewerSrc(type === "doc" ? googleDocViewer(item) : item);
      setViewerOpen(true);
      return;
    }

    const f = item.file;
    const name = item.name || f.name;
    setViewerTitle(name);

    if (f.type.startsWith("image/")) {
      const src = item.preview ?? URL.createObjectURL(f);
      if (!item.preview) setRevokeOnClose(src);
      setViewerType("image");
      setViewerSrc(src);
      setViewerOpen(true);
      return;
    }

    if (f.type === "application/pdf") {
      const blobUrl = URL.createObjectURL(f);
      setRevokeOnClose(blobUrl);
      setViewerType("pdf");
      setViewerSrc(blobUrl);
      setViewerOpen(true);
      return;
    }

    if (
      f.type === "application/msword" ||
      f.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const blobUrl = URL.createObjectURL(f);
      setRevokeOnClose(blobUrl);
      setViewerType("unknown");
      setViewerSrc(blobUrl);
      setViewerOpen(true);
      return;
    }

    const blobUrl = URL.createObjectURL(f);
    setRevokeOnClose(blobUrl);
    setViewerType("unknown");
    setViewerSrc(blobUrl);
    setViewerOpen(true);
  };

  const getNameById = (ids, list) =>
    ids
      .map((id) => list.find((item) => item._id === id._id)?.name || "")
      .join(", ");

  const InfoItem = ({ icon, label, value, xs = 6 }) => (
    <Grid item xs={xs}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 1,
          minHeight: 40, // Ensure consistent height for alignment
        }}
      >
        {icon}
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          {label}:
        </Typography>
      </Box>
      <Typography
        variant="body1"
        sx={{ pl: 4, wordBreak: "break-word", minHeight: 20 }}
      >
        {value}
      </Typography>
    </Grid>
  );

  const SectionCard = ({ title, icon, children, ...props }) => (
    <Card
      elevation={2}
      sx={{
        borderRadius: 3,
        background: "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
        border: "1px solid",
        borderColor: "divider",
        ...props.sx,
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              backgroundColor: "primary.main",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </Box>
          <Typography variant="h6" fontWeight={600} color="text.primary">
            {title}
          </Typography>
        </Box>
        {children}
      </CardContent>
    </Card>
  );

  return (
    <Box
      sx={{
        maxWidth: 1200,
        mx: "auto",
        p: 3,
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        minHeight: "100vh",
      }}
    >
      <Box
        sx={{
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          borderRadius: 4,
          p: 4,
          backdropFilter: "blur(10px)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
        }}
      >
        {/* Header Section with Profile */}
        <SectionCard title="Doctor Profile" icon={<Person />} sx={{ mb: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={3}>
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  badgeContent={
                    values.isVerified && (
                      <VerifiedUser
                        sx={{
                          color: "success.main",
                          fontSize: 24,
                          backgroundColor: "white",
                          borderRadius: "50%",
                          p: 0.5,
                        }}
                      />
                    )
                  }
                >
                  <Avatar
                    src={
                      values.profilePicture
                        ? typeof values.profilePicture === "string"
                          ? values.profilePicture
                          : values.profilePicture.preview
                        : undefined
                    }
                    sx={{
                      width: 120,
                      height: 120,
                      border: "4px solid",
                      borderColor: "primary.main",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                    }}
                  >
                    {values.username?.charAt(0).toUpperCase()}
                  </Avatar>
                </Badge>
              </Box>
            </Grid>
            <Grid item xs={12} md={9}>
              <Typography
                variant="h4"
                fontWeight={700}
                color="primary.main"
                gutterBottom
              >
                Dr. {values.username}
              </Typography>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {getNameById(values.specializationIds, specialities)}
              </Typography>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
                <Chip
                  icon={<Work />}
                  label={`${values.experience} years experience`}
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  icon={<MedicalServices />}
                  label={`₹${values.consultationFee} consultation`}
                  color="secondary"
                  variant="outlined"
                />
                {role !== "sub_admin" && (
                  <Chip
                    label={values.status}
                    color={values.status === "active" ? "success" : "default"}
                    variant="filled"
                  />
                )}
              </Box>
              {values.bio && (
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ fontStyle: "italic" }}
                >
                  "{values.bio}"
                </Typography>
              )}
            </Grid>
          </Grid>
        </SectionCard>

        {/* Contact Information */}
        <SectionCard
          title="Contact Information"
          icon={<Phone />}
          sx={{ mb: 3 }}
        >
          <Grid container spacing={2} alignItems="center">
            <InfoItem
              icon={<Email color="primary" />}
              label="Email"
              value={values.email}
              xs={6}
            />
            <InfoItem
              icon={<Phone color="primary" />}
              label="Contact"
              value={values.contact}
              xs={6}
            />
            <InfoItem
              icon={<Person color="primary" />}
              label="Gender"
              value={values.gender}
              xs={6}
            />
            <InfoItem
              icon={<CalendarToday color="primary" />}
              label="Date of Birth"
              value={values.dob ? dayjs(values.dob).format("DD/MM/YYYY") : ""}
              xs={6}
            />
            <InfoItem
              icon={<LocationOn color="primary" />}
              label="Clinic Address"
              value={values.clinicAddress}
              xs={6}
            />
            <InfoItem
              icon={<LocationOn color="primary" />}
              label="Pincode"
              value={values.pincode}
              xs={6}
            />
            <InfoItem
              icon={<Language color="primary" />}
              label="Languages"
              value={values.languagesSpoken.join(", ")}
              xs={12}
            />
          </Grid>
        </SectionCard>

        {/* Professional Expertise */}
        <SectionCard
          title="Professional Expertise"
          icon={<MedicalServices />}
          sx={{ mb: 3 }}
        >
          <Stack spacing={3}>
            <Box>
              <Typography
                variant="subtitle1"
                fontWeight={600}
                color="text.primary"
                gutterBottom
              >
                Specializations
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {values.specializationIds.map((spec, idx) => {
                  const name = specialities.find(
                    (item) => item._id === spec._id
                  )?.name;
                  return name ? (
                    <Chip
                      key={idx}
                      label={name}
                      color="primary"
                      variant="filled"
                      sx={{ borderRadius: 2 }}
                    />
                  ) : null;
                })}
              </Box>
            </Box>

            <Divider />

            <Box>
              <Typography
                variant="subtitle1"
                fontWeight={600}
                color="text.primary"
                gutterBottom
              >
                Qualifications
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {values.qualificationIds.map((qual, idx) => {
                  const name = qualifications.find(
                    (item) => item._id === qual._id
                  )?.name;
                  return name ? (
                    <Chip
                      key={idx}
                      label={name}
                      color="secondary"
                      variant="outlined"
                      sx={{ borderRadius: 2 }}
                    />
                  ) : null;
                })}
              </Box>
            </Box>

            <Divider />

            <Box>
              <Typography
                variant="subtitle1"
                fontWeight={600}
                color="text.primary"
                gutterBottom
              >
                Symptoms Treated
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {values.symptomIds.map((symptom, idx) => {
                  const name = symptoms.find(
                    (item) => item._id === symptom._id
                  )?.name;
                  return name ? (
                    <Chip
                      key={idx}
                      label={name}
                      color="info"
                      variant="outlined"
                      size="small"
                      sx={{ borderRadius: 2 }}
                    />
                  ) : null;
                })}
              </Box>
            </Box>

            {values.tags.length > 0 && (
              <>
                <Divider />
                <Box>
                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    color="text.primary"
                    gutterBottom
                  >
                    Tags
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    {values.tags.map((tag, idx) => (
                      <Chip
                        key={idx}
                        label={tag}
                        color="default"
                        variant="filled"
                        size="small"
                        sx={{
                          borderRadius: 2,
                          backgroundColor: "grey.100",
                          color: "text.secondary",
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </>
            )}
          </Stack>
        </SectionCard>

        {/* Availability Schedule */}
        <SectionCard
          title="Availability Schedule"
          icon={<Schedule />}
          sx={{ mb: 3 }}
        >
          <Grid container spacing={2}>
            {values.availability.map((slot, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    backgroundColor: "grey.50",
                    border: "2px solid",
                    borderColor: "primary.100",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      borderColor: "primary.main",
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <CalendarToday color="primary" fontSize="small" />
                      <Typography
                        variant="h6"
                        fontWeight={600}
                        color="primary.main"
                      >
                        {slot.day}
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                      🕐 {slot.startTime} - {slot.endTime}
                    </Typography>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <LocalHospital color="secondary" fontSize="small" />
                      <Typography variant="body2" color="text.secondary">
                        {slot.hospital.name}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      📍 {slot.hospital.location}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </SectionCard>

        {/* Verification Documents */}
        {canManageDocs && (
          <SectionCard title="Verification Documents" icon={<VerifiedUser />}>
            <Box sx={{ mb: 3 }}>
              <Chip
                icon={<VerifiedUser />}
                label={
                  values.isVerified ? "Verified Doctor" : "Pending Verification"
                }
                color={values.isVerified ? "success" : "warning"}
                variant="filled"
                sx={{ borderRadius: 2, fontWeight: 600 }}
              />
            </Box>

            <Grid container spacing={3}>
              {[
                {
                  label: "Medical Certificates",
                  field: values.medicalCertificates,
                  icon: <MedicalServices color="primary" />,
                  color: "primary",
                },
                {
                  label: "Registration Certificates",
                  field: values.registrationCertificates,
                  icon: <Assignment color="secondary" />,
                  color: "secondary",
                },
                {
                  label: "Aadhaar Documents",
                  field: values.aadhaarDocs,
                  icon: <Assignment color="info" />,
                  color: "info",
                },
                {
                  label: "PAN Documents",
                  field: values.pancardDocs,
                  icon: <Assignment color="warning" />,
                  color: "warning",
                },
              ].map(({ label, field, icon, color }) => (
                <Grid item xs={12} md={6} key={label}>
                  <Card
                    variant="outlined"
                    sx={{
                      borderRadius: 2,
                      height: "100%",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                        transform: "translateY(-1px)",
                      },
                    }}
                  >
                    <CardContent>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 2,
                        }}
                      >
                        {icon}
                        <Typography variant="subtitle1" fontWeight={600}>
                          {label}
                        </Typography>
                        <Chip
                          label={`${(field || []).length} files`}
                          size="small"
                          color={color}
                          variant="outlined"
                        />
                      </Box>

                      <Stack spacing={1}>
                        {(field || []).map((item, idx) => {
                          const isFile = typeof item !== "string";
                          const name = isFile ? item.name : item;
                          const preview = isFile && item.preview;

                          return (
                            <Paper
                              key={idx}
                              elevation={1}
                              sx={{
                                p: 1.5,
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                                borderRadius: 2,
                                backgroundColor: "grey.50",
                                transition: "all 0.2s ease",
                                "&:hover": {
                                  backgroundColor: "primary.50",
                                  transform: "scale(1.02)",
                                },
                              }}
                            >
                              {preview && (
                                <Avatar
                                  src={preview}
                                  alt={name}
                                  variant="rounded"
                                  sx={{ width: 40, height: 40 }}
                                />
                              )}
                              <Typography
                                variant="body2"
                                sx={{
                                  flex: 1,
                                  fontWeight: 500,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {name}
                              </Typography>
                              <IconButton
                                onClick={() => openViewer(item)}
                                size="small"
                                sx={{
                                  backgroundColor: "primary.main",
                                  color: "white",
                                  "&:hover": {
                                    backgroundColor: "primary.dark",
                                    transform: "scale(1.1)",
                                  },
                                }}
                              >
                                <Visibility fontSize="small" />
                              </IconButton>
                            </Paper>
                          );
                        })}
                        {(!field || field.length === 0) && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              fontStyle: "italic",
                              textAlign: "center",
                              py: 2,
                            }}
                          >
                            No documents uploaded
                          </Typography>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </SectionCard>
        )}
      </Box>
    </Box>
  );
};

export default Preview;
