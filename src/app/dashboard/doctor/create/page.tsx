"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import {
  Box,
  Button,
  Grid,
  TextField,
  Typography,
  InputAdornment,
} from "@mui/material";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Password as PasswordIcon,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import Toast from "@/components/common/Toast";
import { Utility } from "@/utils";
import { useCreateDoctor, useModifyDoctor } from "@/hooks/doctor";
import { fetcher } from "@/apis/apiClient";
import { DoctorData } from "@/types/doctor";
import { setDoctor } from "@/redux/features/doctorSlice";

interface DoctorFormValues {
  _id?: string | number;
  username: string;
  email: string;
  password: string;
  contact: string;
  experience: number;
  bio: string;
  gender: string;
  dob: string;
  languageSpoken: string[];
  address: string;
  profilePicture: string;
  consultationFee: number;
  status: string;
  role: string;
  specializationIds: string[];
  qualificationIds: string[];
  availability: string[];
}

const initialValues: DoctorFormValues = {
  username: "",
  email: "",
  password: "",
  contact: "",
  gender: "",
  dob: "",
  experience: 0,
  bio: "",
  languageSpoken: [],
  address: "",
  profilePicture: "",
  consultationFee: 0,
  status: "",
  role: "",
  specializationIds: [],
  qualificationIds: [],
  availability: []
};

const DoctorForm = () => {
  const [title, setTitle] = useState<"Create" | "Edit">("Create");
  const [loading, setLoading] = useState<boolean>(false);
  const [formValues, setFormValues] = useState<DoctorFormValues>(initialValues);

  const router = useRouter();
  const pathname = usePathname();
  const dispatch: AppDispatch = useDispatch();
  const { toast } = useSelector((state: RootState) => state.toast);
  const { toastAndNavigate } = Utility();

  const { createDoctor } = useCreateDoctor("create-doctor");
  const { modifyDoctor } = useModifyDoctor("update-doctor");

  const doctorId = pathname.split('/').pop();

  //Create/Edit/Populate Doctor
  useEffect(() => {
    if (doctorId) {
      setTitle("Edit");
      populateData(doctorId);
    } else {
      setFormValues(initialValues);
      setTitle("Create");
    }
  }, [doctorId]);

  // const create = useCallback(
  //   async (values: any) => {
  //     setLoading(true);
  //     try {
  //       await createDoctor(values);
  //       toastAndNavigate(dispatch, true, "success", "Doctor created successfully!");
  //       setTimeout(async () => {
  //         if (refetch) {
  //           const updatedData = await refetch();
  //           if (updatedData) {
  //             dispatch(setDoctor(updatedData));
  //           }
  //         }
  //         router.push("/dashboard/doctor");
  //       }, 2200);
  //     } catch (error: any) {
  //       const errorMessage =
  //         error?.response?.data?.message || "Error creating doctor, please try again.";
  //       toastAndNavigate(dispatch, true, "error", errorMessage);
  //     } finally {
  //       setLoading(false);
  //     }
  //   },
  //   [dispatch, createDoctor, refetch, router]
  // );

  const populateData = useCallback(async (id: string | number) => {
    setLoading(true);
    try {
      const response = await fetcher<DoctorData>(`get-doctor-by-id/${id}`);
      if (response && response.statusCode == 200) {
        console.log("Fetched Data:", response);
        setFormValues(response);
      } else if (response && response.statusCode == 404) {
        console.log('not found')
      }
    } catch (err: any) {
      console.log("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // const update = useCallback(
  //   async (values: any) => {
  //     setLoading(true);
  //     try {
  //       await modifyDoctor(values);
  //       toastAndNavigate(dispatch, true, "info", "Doctor updated successfully!");
  //       setTimeout(async () => {
  //         if (refetch) {
  //           const updatedDoctorData = await refetch();
  //           if (updatedDoctorData) {
  //             dispatch(setDoctor(updatedDoctorData));
  //           }
  //         }
  //         router.push("/dashboard/doctor");
  //       }, 2200);
  //     } catch (error: any) {
  //       const errorMessage =
  //         error?.response?.data?.message || "Error updating doctor, please try again.";
  //       toastAndNavigate(dispatch, true, "error", errorMessage);
  //     } finally {
  //       setLoading(false);
  //     }
  //   },
  //   [dispatch, modifyDoctor, refetch, router]
  // );

  return (
    // <Box
    //   sx={{
    //     maxWidth: 800,
    //     mx: "auto",
    //     mt: 5,
    //     p: 4,
    //     borderRadius: 2,
    //     boxShadow: 4,
    //     backgroundColor: "white",
    //     border: "1px solid #e0e0e0",
    //   }}
    // >
    //   <Typography
    //     variant="h4"
    //     gutterBottom
    //     sx={{ textAlign: "center", color: "#1976d2", fontWeight: "bold" }}
    //   >
    //     {title}
    //   </Typography>

    //   <form onSubmit={handleSubmit}>
    //     <Grid container spacing={3}>
    //       <Grid item xs={12} sm={6}>
    //         <TextField
    //           label="Name"
    //           name="username"
    //           type="text"
    //           fullWidth
    //           value={formData.username}
    //           onChange={handleInputChange}
    //           required
    //           InputProps={{
    //             startAdornment: (
    //               <InputAdornment position="start">
    //                 <PersonIcon color="primary" />
    //               </InputAdornment>
    //             ),
    //           }}
    //         />
    //       </Grid>
    //       <Grid item xs={12} sm={6}>
    //         <TextField
    //           label="Email"
    //           name="email"
    //           fullWidth
    //           type="email"
    //           value={formData.email}
    //           onChange={handleInputChange}
    //           required
    //           InputProps={{
    //             startAdornment: (
    //               <InputAdornment position="start">
    //                 <EmailIcon color="primary" />
    //               </InputAdornment>
    //             ),
    //           }}
    //         />
    //       </Grid>
    //       <Grid item xs={12} sm={6}>
    //         <TextField
    //           label="Password"
    //           name="password"
    //           fullWidth
    //           type="password"
    //           value={formData.password}
    //           onChange={handleInputChange}
    //           required={!doctorId}
    //           InputProps={{
    //             startAdornment: (
    //               <InputAdornment position="start">
    //                 <PasswordIcon color="primary" />
    //               </InputAdornment>
    //             ),
    //           }}
    //         />
    //       </Grid>
    //       <Grid item xs={12} sm={6}>
    //         <TextField
    //           label="Gender"
    //           name="gender"
    //           fullWidth
    //           value={formData.gender}
    //           onChange={handleInputChange}
    //           required
    //         />
    //       </Grid>
    //       <Grid item xs={12} sm={6}>
    //         <TextField
    //           label="Date Of Birth"
    //           name="dob"
    //           fullWidth
    //           value={formData.dob}
    //           onChange={handleInputChange}
    //           required
    //         />
    //       </Grid>
    //       <Grid item xs={12} sm={6}>
    //         <TextField
    //           label="Experience"
    //           name="experience"
    //           fullWidth
    //           type="number"
    //           value={formData.experience}
    //           onChange={handleInputChange}
    //           required
    //         />
    //       </Grid>
    //       <Grid item xs={12}>
    //         <TextField
    //           label="Languages Spoken (comma-separated)"
    //           name="languagesSpoken"
    //           fullWidth
    //           value={formData.languagesSpoken}
    //           onChange={handleInputChange}
    //         />
    //       </Grid>
    //       <Grid item xs={12}>
    //         <TextField
    //           label="Hospital Affiliations (comma-separated)"
    //           name="hospitalAffiliations"
    //           fullWidth
    //           value={formData.hospitalAffiliations}
    //           onChange={handleInputChange}
    //         />
    //       </Grid>
    //       <Grid item xs={12}>
    //         <TextField
    //           label="Specializations (comma-separated)"
    //           name="specializationIds"
    //           fullWidth
    //           value={formData.specializationIds}
    //           onChange={handleInputChange}
    //         />
    //       </Grid>
    //       <Grid item xs={12}>
    //         <TextField
    //           label="Qualifications (comma-separated)"
    //           name="qualificationIds"
    //           fullWidth
    //           value={formData.qualificationIds}
    //           onChange={handleInputChange}
    //         />
    //       </Grid>
    //       <Grid item xs={12}>
    //         <TextField
    //           label="Availability (comma-separated)"
    //           name="availability"
    //           fullWidth
    //           value={formData.availability}
    //           onChange={handleInputChange}
    //         />
    //       </Grid>
    //       <Grid item xs={12}>
    //         <TextField
    //           label="Bio"
    //           name="bio"
    //           fullWidth
    //           multiline
    //           minRows={3}
    //           value={formData.bio}
    //           onChange={handleInputChange}
    //         />
    //       </Grid>
    //       <Grid item xs={12}>
    //         <TextField
    //           label="Role"
    //           name="role"
    //           fullWidth
    //           value={formData.role}
    //           onChange={handleInputChange}
    //         />
    //       </Grid>
    //       <Grid item xs={12}>
    //         <TextField
    //           label="Status"
    //           name="status"
    //           fullWidth
    //           value={formData.status}
    //           onChange={handleInputChange}
    //         />
    //       </Grid>
    //       <Grid item xs={12}>
    //         <Button
    //           type="submit"
    //           variant="contained"
    //           fullWidth
    //           sx={{
    //             backgroundColor: "#1976d2",
    //             color: "#fff",
    //             "&:hover": { backgroundColor: "#005bb5" },
    //           }}
    //           disabled={loading}
    //         >
    //           {loading ? "Saving..." : "Submit"}
    //         </Button>
    //       </Grid>
    //     </Grid>
    //   </form>

    //   <Toast
    //     alerting={toast.toastAlert}
    //     severity={toast.toastSeverity}
    //     message={toast.toastMessage}
    //   />
    // </Box>
    <></>
  );
};

export default DoctorForm; 
