import { Field } from "formik";
import {
  Box,
  Grid,
  Typography,
  TextField as MuiTextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Paper,
  Card,
  CardContent,
  Chip,
  Stack,
  IconButton,
  Fade,
  Button,
  OutlinedInput,
} from "@mui/material";
import {
  Work as WorkIcon,
  Assignment as AssignmentIcon,
  Info as InfoIcon,
  LocalHospital as HospitalIcon,
  AccessTime as TimeIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Schedule as ScheduleIcon,
  CalendarToday as CalendarIcon,
  AutoAwesome as TagIcon,
  Description as BioIcon,
} from "@mui/icons-material";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useMemo } from "react";

interface ProfessionalDetailsProps {
  values: any;
  errors: any;
  touched: any;
  handleChange: any;
  setFieldValue: any;
  setFieldTouched: (
    field: string,
    isTouched?: boolean,
    shouldValidate?: boolean
  ) => void;
  specialities: any[];
  qualifications: any[];
  symptoms: any[];
  role: string;
}

const parseTimeTo12Hour = (date: dayjs.Dayjs | null) => {
  if (!date || !date.isValid()) return "";
  return date.format("h:mm A");
};

const initializeTime = (time: string) => {
  if (!time) return null;
  if (time.includes("AM") || time.includes("PM")) {
    return dayjs(time, "h:mm A");
  }
  return dayjs(`2023-01-01T${time}`);
};

const StyledTextField = ({ icon, children, ...props }: any) => {
  const inputProps = useMemo(
    () => ({
      startAdornment: <InputAdornment position="start">{icon}</InputAdornment>,
      sx: {
        borderRadius: 2,
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        transition: "all 0.3s ease",
        "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.9)" },
        "&.Mui-focused": {
          backgroundColor: "white",
          boxShadow: "0 0 0 3px rgba(25, 118, 210, 0.12)",
        },
      },
      ...props.InputProps,
    }),
    [icon, props.InputProps]
  );

  return (
    <Field
      as={MuiTextField}
      {...props}
      InputProps={inputProps}
      sx={{
        "& .MuiOutlinedInput-root": {
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "primary.main",
            borderWidth: 2,
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "primary.main",
            borderWidth: 2,
          },
        },
        "& .MuiInputLabel-root": { fontWeight: 500 },
        ...props.sx,
      }}
    />
  );
};

const StyledAutocomplete = (props: any) => {
  const {
    icon,
    label,
    options,
    value,
    onChange,
    name,
    touched,
    errors,
    ...rest // <- do NOT include touched/errors/name in the spread to Autocomplete root
  } = props;

  const renderInputProps = useMemo(
    () => ({
      label,
      name,
      type: "text",
      error: !!touched && !!errors,
      helperText: touched && errors,
      InputProps: {
        startAdornment: (
          <InputAdornment position="start">{icon}</InputAdornment>
        ),
        sx: {
          borderRadius: 2,
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          transition: "all 0.3s ease",
          "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.9)" },
          "&.Mui-focused": {
            backgroundColor: "white",
            boxShadow: "0 0 0 3px rgba(25, 118, 210, 0.12)",
          },
        },
      },
      sx: {
        "& .MuiOutlinedInput-root": {
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "primary.main",
            borderWidth: 2,
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "primary.main",
            borderWidth: 2,
          },
        },
        "& .MuiInputLabel-root": { fontWeight: 500 },
      },
    }),
    [icon, label, name, touched, errors]
  );

  return (
    <Autocomplete
      multiple
      disableCloseOnSelect
      options={options}
      getOptionLabel={(option) => option.name || ""}
      isOptionEqualToValue={(option, v) => option._id === v._id}
      value={value}
      onChange={onChange}
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option, index) => (
          <Chip
            variant="outlined"
            label={option.name}
            {...getTagProps({ index })}
            key={option._id}
            sx={{ borderRadius: 2, fontWeight: 500 }}
          />
        ))
      }
      renderInput={(params) => (
        <MuiTextField
          {...params}
          {...renderInputProps}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <>
                {renderInputProps.InputProps.startAdornment}
                {params.InputProps.startAdornment}
              </>
            ),
            sx: { ...params.InputProps.sx, ...renderInputProps.InputProps.sx },
          }}
          sx={{ ...params.sx, ...renderInputProps.sx }}
        />
      )}
      {...rest}
    />
  );
};

const ProfessionalDetails: React.FC<ProfessionalDetailsProps> = ({
  values,
  errors,
  touched,
  setFieldValue,
  setFieldTouched,
  specialities = [],
  qualifications = [],
  symptoms = [],
  role,
}) => {
  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        minHeight: "100vh",
        p: 3,
      }}
    >
      <Card
        elevation={0}
        sx={{
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          borderRadius: 4,
          border: "1px solid rgba(255, 255, 255, 0.2)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
          overflow: "visible",
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ mb: 4, textAlign: "center" }}>
            <Typography
              variant="h4"
              fontWeight={700}
              sx={{
                background: "linear-gradient(45deg, #667eea, #764ba2)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 1,
              }}
            >
              Professional Details
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Configure your medical practice information
            </Typography>
          </Box>

          <Box
            display="grid"
            gap={3}
            gridTemplateColumns="repeat(auto-fit, minmax(280px, 1fr))"
            sx={{ mb: 4 }}
          >
            <StyledTextField
              icon={<WorkIcon color="primary" />}
              label="Experience (in years)"
              name="experience"
              type="number"
              fullWidth
              error={touched.experience && Boolean(errors.experience)}
              helperText={touched.experience && errors.experience}
            />

            <StyledTextField
              icon={
                <CurrencyRupeeIcon
                  color="primary"
                  sx={{ fontSize: "1.5rem" }}
                />
              }
              label="Consultation Fee"
              name="consultationFee"
              fullWidth
              error={touched.consultationFee && Boolean(errors.consultationFee)}
              helperText={touched.consultationFee && errors.consultationFee}
            />

            {role !== "sub_admin" && (
              <FormControl
                fullWidth
                error={touched.status && Boolean(errors.status)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                    transition: "all 0.3s ease",
                    "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.9)" },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "primary.main",
                      borderWidth: 2,
                    },
                    "&.Mui-focused": {
                      backgroundColor: "white",
                      boxShadow: "0 0 0 3px rgba(25, 118, 210, 0.12)",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "primary.main",
                      borderWidth: 2,
                    },
                  },
                  "& .MuiInputLabel-root": { fontWeight: 500 },
                }}
              >
                <InputLabel>Status</InputLabel>
                <Select
                  label="Status"
                  name="status"
                  value={values.status}
                  onChange={(e) => setFieldValue("status", e.target.value)}
                  input={
                    <OutlinedInput
                      label="Status"
                      startAdornment={
                        <InputAdornment position="start">
                          <InfoIcon color="primary" />
                        </InputAdornment>
                      }
                    />
                  }
                >
                  <MenuItem value="active">
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          backgroundColor: "success.main",
                        }}
                      />
                      Active
                    </Box>
                  </MenuItem>
                  <MenuItem value="inactive">
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          backgroundColor: "error.main",
                        }}
                      />
                      Inactive
                    </Box>
                  </MenuItem>
                  <MenuItem value="on leave">
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          backgroundColor: "warning.main",
                        }}
                      />
                      On Leave
                    </Box>
                  </MenuItem>
                  <MenuItem value="pending">
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          backgroundColor: "info.main",
                        }}
                      />
                      Pending
                    </Box>
                  </MenuItem>
                </Select>
                {touched.status && errors.status ? (
                  <Typography
                    color="error"
                    variant="body2"
                    sx={{ mt: 0.5, ml: 1.5 }}
                  >
                    {errors.status}
                  </Typography>
                ) : null}
              </FormControl>
            )}
          </Box>

          <Card
            variant="outlined"
            sx={{
              borderRadius: 3,
              backgroundColor: "rgba(25, 118, 210, 0.02)",
              border: "2px solid",
              borderColor: "primary.100",
              mb: 4,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h6"
                fontWeight={600}
                color="primary.main"
                gutterBottom
              >
                Medical Expertise
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <StyledAutocomplete
                    icon={<AssignmentIcon color="primary" />}
                    label="Specializations *"
                    name="specializationIds"
                    options={specialities}
                    value={values.specializationIds || []}
                    onChange={(event: any, value: any[]) => {
                      setFieldValue("specializationIds", value);
                      const selectedSpecializationTags = value.map(
                        (item) => item.name
                      );
                      const updatedTags = [
                        ...new Set([
                          ...values.tags.filter(
                            (tag: string) =>
                              !selectedSpecializationTags.includes(tag)
                          ),
                          ...selectedSpecializationTags,
                        ]),
                      ];
                      setFieldValue("tags", updatedTags);
                    }}
                    touched={touched.specializationIds}
                    errors={errors.specializationIds}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <StyledAutocomplete
                    icon={<AssignmentIcon color="secondary" />}
                    label="Symptoms Treated *"
                    name="symptomIds"
                    options={symptoms}
                    value={values.symptomIds || []}
                    onChange={(event: any, value: any[]) => {
                      setFieldValue("symptomIds", value);
                      const selectedSymptomTags = value.map(
                        (item) => item.name
                      );
                      const updatedTags = [
                        ...new Set([
                          ...values.tags.filter(
                            (tag: string) => !selectedSymptomTags.includes(tag)
                          ),
                          ...selectedSymptomTags,
                        ]),
                      ];
                      setFieldValue("tags", updatedTags);
                    }}
                    touched={touched.symptomIds}
                    errors={errors.symptomIds}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <StyledAutocomplete
                    icon={<AssignmentIcon color="info" />}
                    label="Qualifications *"
                    name="qualificationIds"
                    options={qualifications}
                    value={values.qualificationIds || []}
                    onChange={(event: any, value: any[]) => {
                      setFieldValue("qualificationIds", value);
                      const selectedQualificationTags = value.map(
                        (item) => item.name
                      );
                      const updatedTags = [
                        ...new Set([
                          ...values.tags.filter(
                            (tag: string) =>
                              !selectedQualificationTags.includes(tag)
                          ),
                          ...selectedQualificationTags,
                        ]),
                      ];
                      setFieldValue("tags", updatedTags);
                    }}
                    touched={touched.qualificationIds}
                    errors={errors.qualificationIds}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <StyledTextField
                icon={<TagIcon color="warning" />}
                label="Tags"
                name="tags"
                fullWidth
                multiline
                minRows={2}
                maxRows={4}
                value={(values.tags || []).join(",")}
                onChange={(e: any) => {
                  setFieldValue(
                    "tags",
                    e.target.value.split(",").map((val: string) => val.trim())
                  );
                }}
                onKeyDown={(e: any) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const arr = e.target.value
                      .split(",")
                      .map((val: string) => val.trim())
                      .filter(Boolean);
                    setFieldValue("tags", arr);
                  }
                }}
                error={touched.tags && Boolean(errors.tags)}
                helperText={
                  touched.tags ? errors.tags : "Separate tags with commas"
                }
              />
              {values.tags && values.tags.length > 0 && (
                <Box
                  sx={{ mt: 1, display: "flex", gap: 0.5, flexWrap: "wrap" }}
                >
                  {values.tags.map((tag: string, idx: number) => (
                    <Chip
                      key={idx}
                      label={tag}
                      size="small"
                      color="warning"
                      variant="outlined"
                      sx={{ borderRadius: 2 }}
                    />
                  ))}
                </Box>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <StyledTextField
                icon={<BioIcon color="success" />}
                label="Professional Bio"
                name="bio"
                fullWidth
                multiline
                minRows={2}
                maxRows={4}
                error={touched.bio && Boolean(errors.bio)}
                helperText={
                  touched.bio
                    ? errors.bio
                    : "Brief description of your practice"
                }
              />
            </Grid>
          </Grid>

          <Card
            variant="outlined"
            sx={{
              borderRadius: 3,
              backgroundColor: "rgba(46, 125, 50, 0.02)",
              border: "2px solid",
              borderColor: "success.100",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 3,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <ScheduleIcon color="success" sx={{ fontSize: 28 }} />
                  <Typography
                    variant="h6"
                    fontWeight={600}
                    color="success.main"
                  >
                    Availability Schedule
                  </Typography>
                </Box>
                <Chip
                  label={`${values.availability.length} slots`}
                  color="success"
                  variant="outlined"
                  size="small"
                />
              </Box>

              <Stack spacing={3}>
                {values.availability.map((slot: any, index: number) => (
                  <Fade in={true} key={index}>
                    <Paper
                      elevation={2}
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        border: "1px solid",
                        borderColor: "success.200",
                        backgroundColor: "white",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                          transform: "translateY(-2px)",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          mb: 2,
                        }}
                      >
                        <Typography
                          variant="h6"
                          fontWeight={600}
                          color="text.primary"
                        >
                          Schedule #{index + 1}
                        </Typography>
                        <IconButton
                          onClick={() => {
                            const updatedAvailability =
                              values.availability.filter(
                                (_: any, idx: number) => idx !== index
                              );
                            setFieldValue("availability", updatedAvailability);
                          }}
                          sx={{
                            backgroundColor: "error.50",
                            color: "error.main",
                            "&:hover": {
                              backgroundColor: "error.100",
                              transform: "scale(1.1)",
                            },
                          }}
                        >
                          <RemoveIcon />
                        </IconButton>
                      </Box>

                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <StyledTextField
                            icon={<HospitalIcon color="primary" />}
                            label="Hospital / Clinic Name"
                            name={`availability[${index}].hospital.name`}
                            fullWidth
                            value={slot.hospital?.name || ""}
                            onChange={(e: any) => {
                              const updated = [...values.availability];
                              updated[index].hospital = {
                                ...updated[index].hospital,
                                name: e.target.value,
                              };
                              setFieldValue("availability", updated);
                            }}
                            onBlur={() =>
                              setFieldTouched(
                                `availability[${index}].hospital.name`,
                                true,
                                true
                              )
                            }
                            error={
                              touched.availability?.[index]?.hospital?.name &&
                              Boolean(
                                errors.availability?.[index]?.hospital?.name
                              )
                            }
                            helperText={
                              touched.availability?.[index]?.hospital?.name &&
                              errors.availability?.[index]?.hospital?.name
                            }
                          />
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <StyledTextField
                            icon={<HospitalIcon color="secondary" />}
                            label="Hospital Location"
                            name={`availability[${index}].hospital.location`}
                            fullWidth
                            value={slot.hospital?.location || ""}
                            onChange={(e: any) => {
                              const updated = [...values.availability];
                              updated[index].hospital = {
                                ...updated[index].hospital,
                                location: e.target.value,
                              };
                              setFieldValue("availability", updated);
                            }}
                            onBlur={() =>
                              setFieldTouched(
                                `availability[${index}].hospital.location`,
                                true,
                                true
                              )
                            }
                            error={
                              touched.availability?.[index]?.hospital
                                ?.location &&
                              Boolean(
                                errors.availability?.[index]?.hospital?.location
                              )
                            }
                            helperText={
                              touched.availability?.[index]?.hospital
                                ?.location &&
                              errors.availability?.[index]?.hospital?.location
                            }
                          />
                        </Grid>

                        <Grid item xs={12} md={4}>
                          <Autocomplete
                            options={[
                              "Monday",
                              "Tuesday",
                              "Wednesday",
                              "Thursday",
                              "Friday",
                              "Saturday",
                              "Sunday",
                            ]}
                            getOptionLabel={(option) => option}
                            value={slot.day || ""}
                            onChange={(_event, newValue) => {
                              const updated = [...values.availability];
                              updated[index].day = newValue || "";
                              setFieldValue("availability", updated);
                            }}
                            onClose={() =>
                              setFieldTouched(
                                `availability[${index}].day`,
                                true,
                                true
                              )
                            }
                            renderInput={(params) => (
                              <MuiTextField
                                {...params}
                                label="Day"
                                type="text"
                                onBlur={() =>
                                  setFieldTouched(
                                    `availability[${index}].day`,
                                    true,
                                    true
                                  )
                                }
                                error={
                                  touched.availability?.[index]?.day &&
                                  Boolean(errors.availability?.[index]?.day)
                                }
                                helperText={
                                  touched.availability?.[index]?.day &&
                                  errors.availability?.[index]?.day
                                }
                                InputProps={{
                                  ...params.InputProps,
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <CalendarIcon color="primary" />
                                    </InputAdornment>
                                  ),
                                  sx: {
                                    borderRadius: 2,
                                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                                    transition: "all 0.3s ease",
                                    "&:hover": {
                                      backgroundColor:
                                        "rgba(255, 255, 255, 0.9)",
                                    },
                                    "&.Mui-focused": {
                                      backgroundColor: "white",
                                      boxShadow:
                                        "0 0 0 3px rgba(25, 118, 210, 0.12)",
                                    },
                                  },
                                }}
                                sx={{
                                  "& .MuiOutlinedInput-root": {
                                    "&:hover .MuiOutlinedInput-notchedOutline":
                                      {
                                        borderColor: "primary.main",
                                        borderWidth: 2,
                                      },
                                    "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                      {
                                        borderColor: "primary.main",
                                        borderWidth: 2,
                                      },
                                  },
                                  "& .MuiInputLabel-root": { fontWeight: 500 },
                                }}
                              />
                            )}
                          />
                        </Grid>

                        <Grid item xs={12} md={4}>
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <TimePicker
                              label="Start Time"
                              value={initializeTime(slot.startTime)}
                              onChange={(newValue) => {
                                const updated = [...values.availability];
                                updated[index].startTime =
                                  parseTimeTo12Hour(newValue);
                                setFieldValue("availability", updated);
                              }}
                              ampm
                              slotProps={{
                                textField: {
                                  fullWidth: true,
                                  onBlur: () =>
                                    setFieldTouched(
                                      `availability[${index}].startTime`,
                                      true,
                                      true
                                    ),
                                  error:
                                    !!touched?.availability?.[index]
                                      ?.startTime &&
                                    !!errors?.availability?.[index]?.startTime,
                                  helperText:
                                    touched?.availability?.[index]?.startTime &&
                                    errors?.availability?.[index]?.startTime,
                                  InputProps: {
                                    startAdornment: (
                                      <InputAdornment position="start">
                                        <TimeIcon color="success" />
                                      </InputAdornment>
                                    ),
                                    sx: {
                                      borderRadius: 2,
                                      backgroundColor:
                                        "rgba(255, 255, 255, 0.8)",
                                      transition: "all 0.3s ease",
                                      "&:hover": {
                                        backgroundColor:
                                          "rgba(255, 255, 255, 0.9)",
                                      },
                                      "&.Mui-focused": {
                                        backgroundColor: "white",
                                        boxShadow:
                                          "0 0 0 3px rgba(46, 125, 50, 0.12)",
                                      },
                                    },
                                  },
                                  sx: {
                                    "& .MuiOutlinedInput-root": {
                                      "&:hover .MuiOutlinedInput-notchedOutline":
                                        {
                                          borderColor: "success.main",
                                          borderWidth: 2,
                                        },
                                      "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                        {
                                          borderColor: "success.main",
                                          borderWidth: 2,
                                        },
                                    },
                                    "& .MuiInputLabel-root": {
                                      fontWeight: 500,
                                    },
                                  },
                                },
                              }}
                            />
                          </LocalizationProvider>
                        </Grid>

                        <Grid item xs={12} md={4}>
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <TimePicker
                              label="End Time"
                              value={initializeTime(slot.endTime)}
                              onChange={(newValue) => {
                                const updated = [...values.availability];
                                updated[index].endTime =
                                  parseTimeTo12Hour(newValue);
                                setFieldValue("availability", updated);
                              }}
                              ampm
                              slotProps={{
                                textField: {
                                  fullWidth: true,
                                  onBlur: () =>
                                    setFieldTouched(
                                      `availability[${index}].endTime`,
                                      true,
                                      true
                                    ),
                                  error:
                                    !!touched?.availability?.[index]?.endTime &&
                                    !!errors?.availability?.[index]?.endTime,
                                  helperText:
                                    touched?.availability?.[index]?.endTime &&
                                    errors?.availability?.[index]?.endTime,
                                  InputProps: {
                                    startAdornment: (
                                      <InputAdornment position="start">
                                        <TimeIcon color="warning" />
                                      </InputAdornment>
                                    ),
                                    sx: {
                                      borderRadius: 2,
                                      backgroundColor:
                                        "rgba(255, 255, 255, 0.8)",
                                      transition: "all 0.3s ease",
                                      "&:hover": {
                                        backgroundColor:
                                          "rgba(255, 255, 255, 0.9)",
                                      },
                                      "&.Mui-focused": {
                                        backgroundColor: "white",
                                        boxShadow:
                                          "0 0 0 3px rgba(237, 108, 2, 0.12)",
                                      },
                                    },
                                  },
                                  sx: {
                                    "& .MuiOutlinedInput-root": {
                                      "&:hover .MuiOutlinedInput-notchedOutline":
                                        {
                                          borderColor: "warning.main",
                                          borderWidth: 2,
                                        },
                                      "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                        {
                                          borderColor: "warning.main",
                                          borderWidth: 2,
                                        },
                                    },
                                    "& .MuiInputLabel-root": {
                                      fontWeight: 500,
                                    },
                                  },
                                },
                              }}
                            />
                          </LocalizationProvider>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Fade>
                ))}

                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    justifyContent: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() =>
                      setFieldValue("availability", [
                        ...values.availability,
                        {
                          day: "",
                          startTime: "",
                          endTime: "",
                          hospital: { name: "", location: "" },
                        },
                      ])
                    }
                    sx={{
                      borderRadius: 2,
                      px: 3,
                      py: 1,
                      fontWeight: 600,
                      textTransform: "none",
                      boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "0 6px 16px rgba(25, 118, 210, 0.4)",
                      },
                    }}
                  >
                    Add Time Slot
                  </Button>

                  <Button
                    variant="outlined"
                    color={
                      values.availability.length > 1 ? "warning" : "success"
                    }
                    disabled={
                      values.availability.length === 0 ||
                      !values.availability[0]?.day ||
                      !values.availability[0]?.startTime ||
                      !values.availability[0]?.endTime
                    }
                    onClick={() => {
                      if (values.availability.length > 0) {
                        if (values.availability.length > 1) {
                          setFieldValue("availability", [
                            values.availability[0],
                          ]);
                        } else {
                          const firstSlot = values.availability[0];
                          const allDays = [
                            "Monday",
                            "Tuesday",
                            "Wednesday",
                            "Thursday",
                            "Friday",
                            "Saturday",
                            "Sunday",
                          ];
                          const newAvailability = allDays.map((day) => ({
                            day,
                            startTime: firstSlot.startTime,
                            endTime: firstSlot.endTime,
                            hospital: {
                              name: firstSlot.hospital?.name || "",
                              location: firstSlot.hospital?.location || "",
                            },
                          }));
                          setFieldValue("availability", newAvailability);
                        }
                      }
                    }}
                    sx={{
                      borderRadius: 2,
                      px: 3,
                      py: 1,
                      fontWeight: 600,
                      textTransform: "none",
                      borderWidth: 2,
                      "&:hover": {
                        borderWidth: 2,
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    {values.availability.length > 1
                      ? "Keep Only First"
                      : "Apply to All Days"}
                  </Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProfessionalDetails;
