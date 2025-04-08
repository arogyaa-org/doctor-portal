import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Formik, Field } from "formik";
import {
  Dialog,
  Button,
  TextField,
  Typography,
  Box,
  useMediaQuery,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import DescriptionIcon from "@mui/icons-material/Description";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import DeleteIcon from "@mui/icons-material/Delete";
import * as Yup from "yup";

import Loader from "@/components/common/Loader";
import Toast from "@/components/common/Toast";
import type { AppDispatch, RootState } from "@/redux/store";
import { useCreateSymptom, useModifySymptom } from "@/hooks/symptoms";
import { fetcher } from "@/apis/apiClient";
import { setSymptom } from "@/redux/features/symptomsSlice";
import { Utility } from "@/utils";
import { Symptom } from "@/types/symptom";

interface PopulateDataResponse {
  statusCode: string | number;
  message: string;
  data: any;
}

interface SymptomFormValues {
  _id?: string | number;
  name: string;
  description: string;
  icon: { file: File; preview: string } | null;
}

const initialValues: SymptomFormValues = {
  name: "",
  description: "",
  icon: null
};

interface FormInModalProps {
  openDialog: boolean;
  setOpenDialog: (value: boolean) => void;
  symptomId: string | null;
  refetch: () => Promise<any>;
}

const validationSchema = Yup.object({
  name: Yup.string()
    .min(3, "Name is too short!")
    .max(40, "Name is too long!")
    .matches(/^[a-zA-Z\s]+$/, "Name should only contain letters")
    .required("This field is required"),
  description: Yup.string().min(5, "Description is too short!"),
});

const FormInModal: React.FC<FormInModalProps> = ({
  openDialog,
  setOpenDialog,
  symptomId,
  refetch,
}) => {
  const [title, setTitle] = useState<"Create" | "Edit">("Create");
  const [loading, setLoading] = useState<boolean>(false);
  const [formValues, setFormValues] =
    useState<SymptomFormValues>(initialValues);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const dispatch: AppDispatch = useDispatch();
  const { toast } = useSelector((state: RootState) => state.toast);
  const { toastAndNavigate } = Utility();

  const { createSymptom } = useCreateSymptom("create-symptom");
  const { modifySymptom } = useModifySymptom(`update-symptom`);

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  //Create/Edit/Populate Symptom
  useEffect(() => {
    if (symptomId) {
      setTitle("Edit");
      populateData(symptomId);
    } else {
      setFormValues(initialValues);
      setTitle("Create");
    }
  }, [symptomId, openDialog]);

  const create = useCallback(async (values: SymptomFormValues) => {
    setLoading(true);
    try {
      await createSymptom({
        ...values,
        icon: values?.icon?.file || null
      });
      toastAndNavigate(dispatch, true, "success", "Created Successfully");
      setTimeout(async () => {
        handleDialogClose();
        const updatedSymptom = await refetch();
        if (updatedSymptom) {
          dispatch(setSymptom(updatedSymptom));
        }
      }, 2200);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        "Error creating symptom, please try again.";
      toastAndNavigate(dispatch, true, "error", errorMessage);
      setTimeout(() => {
        handleDialogClose();
      }, 2200);
    } finally {
      setLoading(false);
    }
  }, []);

  const populateData = useCallback(async (id: string | number) => {
    setLoading(true);
    try {
      const response: PopulateDataResponse = await fetcher<Symptom>(
        "symptom",
        `get-symptom-by-id/${id}`
      );
      if (response?.statusCode === 200) {
        setFormValues(response.data);
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.msg || "An Error Occurred";
      toastAndNavigate(dispatch, true, "error", errorMessage);
      setTimeout(() => {
        handleDialogClose();
      }, 2200);
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(
    async (values: any) => {
      setLoading(true);
      try {
        await modifySymptom({
          ...values,
          icon: values?.icon?.file || null
        });
        setLoading(false);
        toastAndNavigate(dispatch, true, "info", "Successfully Updated");
        setTimeout(async () => {
          handleDialogClose();
          const updatedUsers = await refetch();
          if (updatedUsers) {
            dispatch(setSymptom(updatedUsers));
          }
        }, 2200);
      } catch (err: any) {
        setLoading(false);
        const errorMessage =
          err?.response?.data?.message || "Error Occurred. Please Try Again";
        toastAndNavigate(dispatch, true, "error", errorMessage);
        setTimeout(() => {
          handleDialogClose();
        }, 2200);
      } finally {
        setLoading(false);
      }
    },
    [formValues]
  );

  return (
    <Dialog
      fullScreen={fullScreen}
      open={openDialog}
      onClose={handleDialogClose}
      aria-labelledby="responsive-dialog-title"
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          p: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 2,
          }}
        >
          <Typography variant="h4" gutterBottom>
            {title}
          </Typography>
        </Box>
        <Formik
          initialValues={formValues}
          enableReinitialize //to reinitialize the form when it gets stored values from backend
          validationSchema={validationSchema} // Add the validation schema
          onSubmit={(values) => {
            values._id ? update(values) : create(values);
          }}
        >
          {({
            dirty,
            errors,
            values,
            touched,
            isSubmitting,
            handleChange,
            handleSubmit,
            setFieldValue
          }) => (
            <form onSubmit={handleSubmit}>
              <Box
                display="grid"
                gap="30px"
                gridTemplateColumns="repeat(2, minmax(0, 1fr))"
              >
                <Field
                  as={TextField}
                  fullWidth
                  label="*Name"
                  name="name"
                  value={values.name}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocalHospitalIcon sx={{ color: "black" }} />
                      </InputAdornment>
                    ),
                    style: { color: "black", fontSize: "15px" },
                  }}
                  InputLabelProps={{ style: { color: "black" } }}
                  error={touched.name && Boolean(errors.name)}
                  helperText={touched.name && errors.name}
                />
                <Field
                  as={TextField}
                  fullWidth
                  label="Description"
                  name="description"
                  value={values.description}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DescriptionIcon sx={{ color: "black" }} />
                      </InputAdornment>
                    ),
                    style: { color: "black", fontSize: "15px" },
                  }}
                  InputLabelProps={{ style: { color: "black" } }}
                  error={touched.description && Boolean(errors.description)}
                  helperText={touched.description && errors.description}
                />
              </Box>
              {/* File input and display */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "16px",
                  alignItems: "center",
                  justifyItems: "center",
                  mt: "15px"
                }}
              >
                {/* Upload Icon with Label */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid #ccc",
                    borderRadius: "8%",
                    width: "150px",
                    height: "120px",
                    cursor: "pointer",
                    textAlign: "center",
                    transition: "border-color 0.3s ease, color 0.3s ease",
                    "&:hover": {
                      borderColor: 'rgb(33, 38, 54)',
                      "& svg": {
                        color: 'rgb(33, 38, 54)', // Darker icon color on hover
                      },
                    },
                  }}
                  component="label"
                >
                  <AddPhotoAlternateIcon
                    sx={{
                      fontSize: "36px",
                      color: '#aaa',
                      mb: 1,
                      transition: "color 0.3s ease"
                    }} />
                  <Typography variant="body2">Upload Icon</Typography>
                  <input
                    ref={fileInputRef}
                    hidden
                    type="file"
                    accept=".jpg, .gif, .png, .jpeg, .svg, .webp"
                    onChange={(event) => {
                      const imgfiles = event.target.files;
                      if (imgfiles && imgfiles[0]) {
                        const file = imgfiles[0];
                        if (file.size > 1048576) {   // Check file size (1MB = 1,048,576 bytes)
                          toastAndNavigate(
                            dispatch,
                            true,
                            "error",
                            `${file.name} exceeds 1MB limit`
                          );
                          return;
                        }
                        // Set file to Formik field and create a preview
                        const fileUrl = URL.createObjectURL(file);
                        setFieldValue("icon", { file, preview: fileUrl });
                      }
                    }}
                  />
                </Box>

                {/* Display Selected File Preview */}
                {(values.icon?.file || values.icon) && (
                  <Box
                    sx={{
                      position: "relative",
                      width: "150px",
                      height: "120px",
                    }}
                  >
                    {/* Delete Icon */}
                    <IconButton
                      onClick={() => {
                        // Clean up preview URL only if it exists
                        if (values.icon?.preview) {
                          URL.revokeObjectURL(values.icon.preview);
                        }
                        setFieldValue("icon", null);
                      }}
                      sx={{
                        position: "absolute",
                        top: "-3px",
                        right: "-4px",
                        backgroundColor: "white",
                        zIndex: 1,
                        p: "4px",
                        "&:hover": {
                          color: "rgb(255, 102, 94)",
                        },
                      }}
                    >
                      <DeleteIcon sx={{ fontSize: "18px" }} />
                    </IconButton>

                    {/* Image Preview */}
                    {(values.icon?.preview || typeof values.icon === "string") && (
                      <Box
                        component="img"
                        src={
                          typeof values.icon === "string"
                            ? values.icon // value From database
                            : values.icon.preview // From file upload
                        }
                        alt="Profile Preview"
                        sx={{
                          width: "100%",
                          height: "100%",
                          borderRadius: "8px",
                          border: "1px solid #aaa",
                        }}
                      />
                    )}
                  </Box>
                )}
              </Box>
              <Box display="flex" justifyContent="center" p="20px">
                <Button
                  color="error"
                  variant="contained"
                  sx={{ mr: 3, width: "20%" }}
                  onClick={handleDialogClose}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  sx={{ width: "20%" }}
                  disabled={!dirty || isSubmitting}
                  color={title === "Edit" ? "info" : "success"}
                  variant="contained"
                >
                  Submit
                </Button>
              </Box>
            </form>
          )}
        </Formik>
        {loading ? <Loader /> : null}
        <Toast
          alerting={toast.toastAlert}
          severity={toast.toastSeverity}
          message={toast.toastMessage}
        />
      </Box>
    </Dialog>
  );
};

export default FormInModal;
