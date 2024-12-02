import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog,
  Button,
  TextField,
  Typography,
  Box,
  useMediaQuery,
  InputAdornment,
} from '@mui/material';
import { useTheme } from "@mui/material/styles";
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import DescriptionIcon from '@mui/icons-material/Description';
import { Formik, Field } from "formik";
import * as Yup from 'yup';

import Loader from '@/components/common/Loader';
import Toast from '@/components/common/Toast';
import type { AppDispatch, RootState } from '@/redux/store';
import { useCreateSymptom, useModifySymptom } from '@/hooks/symptoms';
import { fetcher } from '@/apis/apiClient';
import { setSymptom } from '@/redux/features/symptomsSlice';
import { Utility } from '@/utils';
import { SymptomData } from '@/types/symptom';

interface SymptomFormValues {
  _id?: string | number;
  name: string;
  description: string;
}

const initialValues: SymptomFormValues = {
  name: "",
  description: "",
};

interface FormInModalProps {
  openDialog: boolean;
  setOpenDialog: (value: boolean) => void;
  symptomId: string | null;
  refetch: () => Promise<any>;
}

const FormInModal: React.FC<FormInModalProps> = ({
  openDialog,
  setOpenDialog,
  symptomId,
  refetch
}) => {
  const [title, setTitle] = useState<"Create" | "Edit">("Create");
  const [loading, setLoading] = useState<boolean>(false);
  const [formValues, setFormValues] = useState<SymptomFormValues>(initialValues);

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const dispatch: AppDispatch = useDispatch();
  const { toast } = useSelector((state: RootState) => state.toast);
  const { toastAndNavigate } = Utility();

  const { createSymptom } = useCreateSymptom("symptoms/create-symptoms");
  const { modifySymptom } = useModifySymptom(`/symptoms/update-symptom`);

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
      await createSymptom(values);
      toastAndNavigate(dispatch, true, "success", "Created Successfully");
      setTimeout(async () => {
        handleDialogClose();
        const updatedSymptom = await refetch();
        if (updatedSymptom) {
          dispatch(setSymptom(updatedSymptom));
        }
      }, 2200);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || "Error creating symptom, please try again.";
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
      const response = await fetcher<SymptomData>(`symptoms/get-symptoms/${id}`);
      console.log(response, 'response');
      setFormValues(response);
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

  const update = useCallback(async (values: any) => {
    setLoading(true);
    try {
      await modifySymptom(values);
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
      const errorMessage = err?.response?.data?.message || "Error Occurred. Please Try Again";
      toastAndNavigate(dispatch, true, "error", errorMessage);
      setTimeout(() => {
        handleDialogClose();
      }, 2200);
    } finally {
      setLoading(false);
    }
  }, [formValues]);

  // Validation Schema with Yup
  const validationSchema = Yup.object({
    name: Yup.string()
      .min(3, "Name is too short!")
      .max(40, "Name is too long!")
      .matches(/^[a-zA-Z\s]+$/, "Name should only contain letters")
      .required("This field is required"),
  });

  return (
    <Dialog
      fullScreen={fullScreen}
      open={openDialog}
      onClose={handleDialogClose}
      aria-labelledby="responsive-dialog-title"
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          p: 2
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
          <Typography
            variant="h4"
            gutterBottom
          >
            {title} Symptom
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
            values,
            errors,
            touched,
            handleChange,
            handleSubmit,
            isSubmitting,
            dirty,
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
              <Box display="flex" justifyContent="center" p="20px">
                <Button
                  color="error"
                  variant="contained"
                  sx={{ mr: 3, width: '20%' }}
                  onClick={handleDialogClose}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  sx={{ width: '20%' }}
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