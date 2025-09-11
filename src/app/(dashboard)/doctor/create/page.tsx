"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, useParams } from "next/navigation";
import { Formik, Form } from "formik";
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Tooltip,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import { OpenInNew, Close, Visibility } from "@mui/icons-material";
import Loader from "@/components/common/Loader";
import Toast from "@/components/common/Toast";
import validationSchema from "./ValidationSchema";
import { AppDispatch, RootState } from "@/redux/store";
import { fetcher } from "@/apis/apiClient";
import { useCreateDoctor, useModifyDoctor } from "@/hooks/doctor";
import { useGetSpeciality } from "@/hooks/Speciality";
import { useGetQualification } from "@/hooks/qualification";
import { useGetSymptom } from "@/hooks/symptoms";
import { Utility } from "@/utils";
import { DoctorData } from "@/types/doctor";
import PersonalDetails from "./personalDetails";
import ProfessionalDetails from "./professionalDetails";
import Verify from "./verify";
import Preview from "./preview";
import dayjs from "dayjs";

interface DoctorResponse {
  statusCode: string | number;
  message: string;
  data: DoctorData;
}

type FileOrUrl = { file: File; name: string; preview?: string } | string;

type DoctorFormValues = DoctorData & {
  medicalCertificates?: FileOrUrl[];
  registrationCertificates?: FileOrUrl[];
  aadhaarDocs?: FileOrUrl[];
  pancardDocs?: FileOrUrl[];
};

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
  clinicAddress: "",
  pincode: "",
  profilePicture: null,
  consultationFee: "",
  status: "",
  qualificationIds: [],
  specializationIds: [],
  symptomIds: [],
  availability: [
    {
      day: "",
      startTime: "",
      endTime: "",
      hospital: { name: "", location: "" },
    },
  ],
  isVerified: false,
  medicalCertificates: [],
  registrationCertificates: [],
  aadhaarDocs: [],
  pancardDocs: [],
};

let editFormValues: DoctorFormValues;

// eslint-disable-next-line react/function-component-definition
const DoctorForm: React.FC = () => {
  const [title, setTitle] = useState<"Create Doctor" | "Edit Doctor">();
  const [loading, setLoading] = useState<boolean>(false);
  const [dataLoading, setDataLoading] = useState<boolean>(false);
  const [formValues, setFormValues] = useState<DoctorFormValues>(initialValues);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [updatePassword, setUpdatePassword] = useState<boolean>(false);
  const [submitClicked, setSubmitClicked] = useState<boolean>(false);
  const pwFieldRef = useRef<HTMLInputElement | null>(null);
  const emailFieldRef = useRef<HTMLInputElement | null>(null);
  const contactFieldRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [langText, setLangText] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerTitle, setViewerTitle] = useState("");
  const [viewerType, setViewerType] = useState<
    "image" | "pdf" | "doc" | "unknown"
  >("image");
  const [viewerSrc, setViewerSrc] = useState("");
  const [revokeOnClose, setRevokeOnClose] = useState<string | null>(null);

  const params = useParams();
  const router = useRouter();
  const dispatch: AppDispatch = useDispatch();
  const { toast } = useSelector((state: RootState) => state.toast);
  const { createDoctor } = useCreateDoctor("create-doctor");
  const { modifyDoctor } = useModifyDoctor("update-doctor");
  const { decodedToken, getIdsFromObject, toastAndNavigate } = Utility();
  const doctorId = params?.id;
  const role = decodedToken().role;
  const canManageDocs = role === "admin" || role === "operations";

  const {
    value: specialities,
    loading: specialitiesLoading,
    error: specialitiesError,
  } = useGetSpeciality(null, "get-specialities", 1, 200, "");
  const {
    value: qualifications,
    loading: qualificationsLoading,
    error: qualificationsError,
  } = useGetQualification(null, "get-qualifications", 1, 200, "");
  const {
    value: symptoms,
    loading: symptomsLoading,
    error: symptomsError,
  } = useGetSymptom(null, "get-symptoms", 1, 200, "");

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const handleUpdatePassword = useCallback(() => {
    if (formValues.password) {
      editFormValues = { ...formValues };
    }
    if (!updatePassword) {
      setFormValues((prev) => ({ ...prev, password: "" }));
      pwFieldRef?.current?.focus();
    } else {
      setFormValues((prev) => ({ ...prev, password: editFormValues.password }));
    }
    setUpdatePassword(!updatePassword);
  }, [updatePassword, formValues]);

  const initializeTime = (time: string) => {
    if (!time) return dayjs();
    if (time.includes("AM") || time.includes("PM")) {
      return dayjs(time, "h:mm A");
    }
    return dayjs(`2023-01-01T${time}`);
  };

  useEffect(() => {
    if (doctorId) {
      setTitle("Edit Doctor");
      populateData(doctorId);
    } else {
      setTitle("Create Doctor");
      const defaultValues =
        role === "sub_admin"
          ? { ...initialValues, status: "pending" }
          : initialValues;
      setFormValues(defaultValues);
      setCurrentStep(0);
    }
  }, [doctorId, role]);

  useEffect(() => {
    setLangText((formValues.languagesSpoken || []).join(", "));
  }, [formValues.languagesSpoken]);

  const populateData = useCallback(
    async (doctorId: string | string[]) => {
      setDataLoading(true);
      try {
        const response: DoctorResponse = await fetcher(
          "doctor",
          `get-doctor-by-id/${doctorId}`
        );
        if (response?.statusCode === 200) {
          const formattedData: DoctorFormValues = {
            ...initialValues,
            ...response.data,
            availability: response.data.availability.length
              ? response.data.availability.map((slot) => ({
                  ...slot,
                  startTime: slot.startTime
                    ? initializeTime(slot.startTime).format("h:mm A")
                    : "",
                  endTime: slot.endTime
                    ? initializeTime(slot.endTime).format("h:mm A")
                    : "",
                  hospital: {
                    name: slot.hospital?.name || "",
                    location: slot.hospital?.location || "",
                  },
                }))
              : [
                  {
                    day: "",
                    startTime: "",
                    endTime: "",
                    hospital: { name: "", location: "" },
                  },
                ],
            medicalCertificates: response.data.medicalCertificates ?? [],
            registrationCertificates:
              response.data.registrationCertificates ?? [],
            aadhaarDocs: response.data.aadhaarDocs ?? [],
            pancardDocs: response.data.pancardDocs ?? [],
            languagesSpoken: response.data.languagesSpoken ?? [],
            tags: response.data.tags ?? [],
            profilePicture: response.data.profilePicture ?? null,
            qualificationIds: Array.isArray(response.data.qualificationIds)
              ? response.data.qualificationIds
              : [],
            specializationIds: Array.isArray(response.data.specializationIds)
              ? response.data.specializationIds
              : [],
            symptomIds: Array.isArray(response.data.symptomIds)
              ? response.data.symptomIds
              : [],
            dob: response.data.dob ? response.data.dob : "",
            experience: response.data.experience
              ? String(response.data.experience)
              : "",
            consultationFee: response.data.consultationFee
              ? String(response.data.consultationFee)
              : "",
          };
          setFormValues(formattedData);
          editFormValues = formattedData;
          setCurrentStep(0);
        }
      } catch (err) {
        toastAndNavigate(
          dispatch,
          true,
          "error",
          "Failed to load doctor data",
          () => {}
        );
      } finally {
        setDataLoading(false);
      }
    },
    [dispatch, toastAndNavigate]
  );

  const extractFiles = (arr?: FileOrUrl[]) =>
    (arr || [])
      .filter((x: any) => x && (x as any).file)
      .map((x: any) => (x as any).file as File);

  const extractUrls = (arr?: FileOrUrl[]) =>
    (arr || []).filter((x: any) => typeof x === "string") as string[];

  const create = useCallback(
    async (values: DoctorFormValues) => {
      setLoading(true);
      try {
        const formattedAvailability = values.availability.map((slot) => ({
          ...slot,
          startTime: slot.startTime,
          endTime: slot.endTime,
        }));

        const payload: any = {
          ...values,
          gender: values.gender || null,
          status: values.status || null,
          profilePicture: (values as any)?.profilePicture?.file || null,
          qualificationIds: getIdsFromObject(values?.qualificationIds || []),
          specializationIds: getIdsFromObject(values?.specializationIds || []),
          symptomIds: getIdsFromObject(values?.symptomIds || []),
          availability: formattedAvailability,
          createdBy: decodedToken().id,
          medicalCertificates: extractFiles(values.medicalCertificates).length
            ? extractFiles(values.medicalCertificates)
            : extractUrls(values.medicalCertificates),
          registrationCertificates: extractFiles(
            values.registrationCertificates
          ).length
            ? extractFiles(values.registrationCertificates)
            : extractUrls(values.registrationCertificates),
          aadhaarDocs: extractFiles(values.aadhaarDocs).length
            ? extractFiles(values.aadhaarDocs)
            : extractUrls(values.aadhaarDocs),
          pancardDocs: extractFiles(values.pancardDocs).length
            ? extractFiles(values.pancardDocs)
            : extractUrls(values.pancardDocs),
        };

        const response = await createDoctor(payload);

        if (response?.statusCode === 409) {
          const errorMessage = response?.message?.toLowerCase() || "";
          if (errorMessage.includes("email")) {
            toastAndNavigate(
              dispatch,
              true,
              "error",
              "Email already exists, please edit the email",
              () => {
                setCurrentStep(0);
                emailFieldRef?.current?.focus();
              }
            );
          } else if (errorMessage.includes("phone number")) {
            toastAndNavigate(
              dispatch,
              true,
              "error",
              "Phone number already exists, please edit the phone number",
              () => {
                setCurrentStep(0);
                contactFieldRef?.current?.focus();
              }
            );
          } else {
            toastAndNavigate(
              dispatch,
              true,
              "error",
              "Email or phone number already exists, please edit the fields",
              () => {
                setCurrentStep(0);
                emailFieldRef?.current?.focus();
              }
            );
          }
        } else if (response?.statusCode === 201) {
          toastAndNavigate(
            dispatch,
            true,
            "success",
            "Created Successfully",
            () => router.back()
          );
        }
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.message ||
          "Error creating Doctor, please try again.";
        toastAndNavigate(dispatch, true, "error", errorMessage, () =>
          location.reload()
        );
      } finally {
        setLoading(false);
        setSubmitClicked(false);
      }
    },
    [createDoctor, dispatch, router, toastAndNavigate]
  );

  const update = useCallback(
    async (values: DoctorFormValues) => {
      setLoading(true);
      try {
        const formattedAvailability = values.availability.map((slot: any) => ({
          ...slot,
          startTime: slot.startTime,
          endTime: slot.endTime,
        }));

        const payload: any = {
          ...values,
          _id: doctorId,
          gender: values.gender || null,
          status: values.status || null,
          profilePicture: (values as any)?.profilePicture?.file || null,
          qualificationIds: getIdsFromObject(values?.qualificationIds || []),
          specializationIds: getIdsFromObject(values?.specializationIds || []),
          symptomIds: getIdsFromObject(values?.symptomIds || []),
          availability: formattedAvailability,
          updatedBy: decodedToken().id,
          medicalCertificates: extractFiles(values.medicalCertificates).length
            ? extractFiles(values.medicalCertificates)
            : extractUrls(values.medicalCertificates),
          registrationCertificates: extractFiles(
            values.registrationCertificates
          ).length
            ? extractFiles(values.registrationCertificates)
            : extractUrls(values.registrationCertificates),
          aadhaarDocs: extractFiles(values.aadhaarDocs).length
            ? extractFiles(values.aadhaarDocs)
            : extractUrls(values.aadhaarDocs),
          pancardDocs: extractFiles(values.pancardDocs).length
            ? extractFiles(values.pancardDocs)
            : extractUrls(values.pancardDocs),
        };

        if (!updatePassword) {
          delete payload.password;
        }

        const response = await modifyDoctor(payload);
        if (response?.statusCode === 200) {
          toastAndNavigate(dispatch, true, "info", "Updated Successfully", () =>
            router.back()
          );
        }
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || "Error Occurred. Please Try Again";
        toastAndNavigate(dispatch, true, "error", errorMessage, () =>
          location.reload()
        );
      } finally {
        setLoading(false);
        setSubmitClicked(false);
      }
    },
    [modifyDoctor, toastAndNavigate, dispatch, router, updatePassword, doctorId]
  );

  const handleNext = async (
    validateForm: () => Promise<any>,
    setFieldTouched: any,
    values: any
  ) => {
    const personalFields = [
      "username",
      "email",
      "contact",
      "dob",
      "gender",
      "languagesSpoken",
      "clinicAddress",
      "pincode",
      ...(title === "Create Doctor" || updatePassword ? ["password"] : []),
    ];
    const professionalFields = [
      "experience",
      "consultationFee",
      "specializationIds",
      "symptomIds",
      "qualificationIds",
      "availability",
      ...(role !== "sub_admin" ? ["status"] : []),
    ];
    const verifyFields = canManageDocs
      ? [
          "isVerified",
          "medicalCertificates",
          "registrationCertificates",
          "aadhaarDocs",
          "pancardDocs",
        ]
      : [];

    const fieldsToValidate =
      currentStep === 0
        ? personalFields
        : currentStep === 1
          ? professionalFields
          : verifyFields;

    await Promise.all(
      fieldsToValidate.flatMap((field) => {
        if (field !== "availability") {
          return [setFieldTouched(field, true, true)];
        }
        const arr = values?.availability ?? [];
        const tasks: Promise<any>[] = [];
        arr.forEach((_, i) => {
          tasks.push(setFieldTouched(`availability[${i}].day`, true, true));
          tasks.push(
            setFieldTouched(`availability[${i}].startTime`, true, true)
          );
          tasks.push(setFieldTouched(`availability[${i}].endTime`, true, true));
          tasks.push(
            setFieldTouched(`availability[${i}].hospital.name`, true, true)
          );
          tasks.push(
            setFieldTouched(`availability[${i}].hospital.location`, true, true)
          );
        });
        return tasks;
      })
    );

    const errors = await validateForm();
    const hasErrors = fieldsToValidate.some((field) => errors[field]);

    if (!hasErrors) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => setCurrentStep((prev) => prev - 1);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLFormElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
    }
  };

  const handleSubmitClick = () => setSubmitClicked(true);

  const steps = [
    "Personal Details",
    "Professional Details",
    "Verify",
    "Preview",
  ];

  const isDataReady =
    Array.isArray(specialities?.results) &&
    Array.isArray(qualifications?.results) &&
    Array.isArray(symptoms?.results);

  const memoizedFormValues = useMemo(() => formValues, [formValues]);

  if (
    loading ||
    dataLoading ||
    specialitiesLoading ||
    qualificationsLoading ||
    symptomsLoading
  ) {
    return <Loader />;
  }

  if (
    specialitiesError ||
    qualificationsError ||
    symptomsError ||
    !isDataReady
  ) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">
          Failed to load required data (specialities, qualifications, or
          symptoms). Please try again later.
        </Typography>
      </Box>
    );
  }

  return (
    <Box margin="0 10px 10px 10px">
      <Typography
        variant="h4"
        gutterBottom
        sx={{ color: "rgb(7, 135, 179)", fontWeight: "bold", mb: "20px" }}
      >
        {title}
      </Typography>

      <Stepper activeStep={currentStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Formik
        enableReinitialize
        initialValues={memoizedFormValues}
        validationSchema={validationSchema}
        onSubmit={(values, { setSubmitting }) => {
          if (currentStep === 3 && submitClicked) {
            (values as any)._id ? update(values) : create(values);
          }
          setSubmitting(false);
        }}
      >
        {({
          errors,
          values,
          touched,
          handleChange,
          setFieldValue,
          setFieldTouched,
          validateForm,
        }) => (
          <Form encType="multipart/form-data" onKeyDown={handleKeyDown}>
            {currentStep === 0 ? (
              <PersonalDetails
                values={values}
                errors={errors}
                touched={touched}
                handleChange={handleChange}
                setFieldValue={setFieldValue}
                langText={langText}
                setLangText={setLangText}
                title={title}
                updatePassword={updatePassword}
                setUpdatePassword={setUpdatePassword}
                handleUpdatePassword={handleUpdatePassword}
                showPassword={showPassword}
                togglePasswordVisibility={togglePasswordVisibility}
                fileInputRef={fileInputRef}
                role={role}
                emailFieldRef={emailFieldRef}
                contactFieldRef={contactFieldRef}
                pwFieldRef={pwFieldRef}
                dispatch={dispatch}
                toastAndNavigate={toastAndNavigate}
              />
            ) : currentStep === 1 ? (
              <ProfessionalDetails
                values={values}
                errors={errors}
                touched={touched}
                handleChange={handleChange}
                setFieldValue={setFieldValue}
                setFieldTouched={setFieldTouched}
                specialities={specialities.results || []}
                qualifications={qualifications.results || []}
                symptoms={symptoms.results || []}
                role={role}
              />
            ) : currentStep === 2 ? (
              <Verify
                values={values}
                setFieldValue={setFieldValue}
                role={role}
                canManageDocs={canManageDocs}
                viewerOpen={viewerOpen}
                setViewerOpen={setViewerOpen}
                viewerTitle={viewerTitle}
                setViewerTitle={setViewerTitle}
                viewerType={viewerType}
                setViewerType={setViewerType}
                viewerSrc={viewerSrc}
                setViewerSrc={setViewerSrc}
                revokeOnClose={revokeOnClose}
                setRevokeOnClose={setRevokeOnClose}
                dispatch={dispatch}
                toastAndNavigate={toastAndNavigate}
              />
            ) : currentStep === 3 ? (
              <Preview
                values={values}
                specialities={specialities.results || []}
                qualifications={qualifications.results || []}
                symptoms={symptoms.results || []}
                role={role}
                canManageDocs={canManageDocs}
                viewerOpen={viewerOpen}
                setViewerOpen={setViewerOpen}
                viewerTitle={viewerTitle}
                setViewerTitle={setViewerTitle}
                viewerType={viewerType}
                setViewerType={setViewerType}
                viewerSrc={viewerSrc}
                setViewerSrc={setViewerSrc}
                revokeOnClose={revokeOnClose}
                setRevokeOnClose={setRevokeOnClose}
              />
            ) : (
              <Typography color="error">Invalid step: {currentStep}</Typography>
            )}

            <Box display="flex" justifyContent="space-between" m="20px">
              <Button
                color="error"
                variant="contained"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Box>
                {currentStep > 0 && (
                  <Button
                    onClick={handleBack}
                    sx={{ mr: 1 }}
                    variant="outlined"
                  >
                    Back
                  </Button>
                )}
                {currentStep < steps.length - 1 ? (
                  <Button
                    variant="contained"
                    onClick={() =>
                      handleNext(validateForm, setFieldTouched, values)
                    }
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="contained"
                    color={title === "Edit Doctor" ? "info" : "success"}
                    onClick={handleSubmitClick}
                  >
                    Submit
                  </Button>
                )}
              </Box>
            </Box>
            {loading && <Loader />}
            <Toast
              alerting={toast.toastAlert}
              severity={toast.toastSeverity}
              message={toast.toastMessage}
            />
          </Form>
        )}
      </Formik>

      <Dialog
        open={viewerOpen}
        onClose={() => {
          setViewerOpen(false);
          if (revokeOnClose) {
            URL.revokeObjectURL(revokeOnClose);
            setRevokeOnClose(null);
          }
        }}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Visibility fontSize="small" />
          <span style={{ flex: 1 }}>{viewerTitle}</span>
          <Tooltip title="Open in new tab">
            <span>
              <IconButton
                onClick={() => {
                  if (viewerSrc) window.open(viewerSrc, "_blank");
                }}
                disabled={!viewerSrc}
              >
                <OpenInNew />
              </IconButton>
            </span>
          </Tooltip>
          <IconButton
            onClick={() => {
              setViewerOpen(false);
              if (revokeOnClose) {
                URL.revokeObjectURL(revokeOnClose);
                setRevokeOnClose(null);
              }
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ height: "80vh", p: 0 }}>
          {viewerType === "image" && (
            <Box
              component="img"
              src={viewerSrc}
              alt={viewerTitle}
              sx={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          )}
          {viewerType === "pdf" && (
            <iframe
              src={viewerSrc}
              style={{ width: "100%", height: "100%", border: 0 }}
              title={viewerTitle}
            />
          )}
          {viewerType === "doc" && (
            <iframe
              src={viewerSrc}
              style={{ width: "100%", height: "100%", border: 0 }}
              title={viewerTitle}
            />
          )}
          {viewerType === "unknown" && (
            <Box
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                p: 3,
                textAlign: "center",
              }}
            >
              <Typography variant="body1" sx={{ mb: 2 }}>
                This file type can’t be previewed inline. You can open it in a
                new tab or download it.
              </Typography>
              <Button
                variant="contained"
                onClick={() => window.open(viewerSrc, "_blank")}
                startIcon={<OpenInNew />}
              >
                Open in new tab
              </Button>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default DoctorForm;
