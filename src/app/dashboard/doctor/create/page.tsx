"use client";

import React, { useState, useEffect, useCallback } from "react";
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
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import Toast from "@/components/common/Toast";
import { Utility } from "@/utils";
import { useCreateDoctor, useModifyDoctor } from "@/hooks/doctor";
import { fetcher } from "@/apis/apiClient";
import { DoctorData } from "@/types/doctor";
import { setDoctor } from "@/redux/features/doctorSlice";

const DoctorForm = ({
  doctorId = null,
  refetch,
}: {
  doctorId?: string | null;
  refetch?: () => Promise<any>;
}) => {
  const [title, setTitle] = useState<"Create Doctor" | "Edit Doctor">("Create Doctor");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    gender: "",
    dob:"",
    experience: "",
    bio: "",
    languagesSpoken: "",
    hospitalAffiliations: "",
    specializationIds: "",
    qualificationIds: "",
    availability: "",
    role: "", 
    status: "", 
  });

  const { createDoctor } = useCreateDoctor("create-doctor");
  const { modifyDoctor } = useModifyDoctor("update-doctor");
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch: AppDispatch = useDispatch();
  const { toast } = useSelector((state: RootState) => state.toast);
  const { toastAndNavigate } = Utility();
  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  const create = useCallback(
    async (values: any) => {
      setLoading(true);
      try {
        await createDoctor(values);
        toastAndNavigate(dispatch, true, "success", "Doctor created successfully!");
        setTimeout(async () => {
          if (refetch) {
            const updatedData = await refetch();
            if (updatedData) {
              dispatch(setDoctor(updatedData));
            }
          }
          router.push("/dashboard/doctor");
        }, 2200);
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.message || "Error creating doctor, please try again.";
        toastAndNavigate(dispatch, true, "error", errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [dispatch, createDoctor, refetch, router]
  );

  const update = useCallback(
    async (values: any) => {
      setLoading(true);
      try {
        await modifyDoctor(values);
        toastAndNavigate(dispatch, true, "info", "Doctor updated successfully!");
        setTimeout(async () => {
          if (refetch) {
            const updatedDoctorData = await refetch();
            if (updatedDoctorData) {
              dispatch(setDoctor(updatedDoctorData));
            }
          }
          router.push("/dashboard/doctor");
        }, 2200);
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.message || "Error updating doctor, please try again.";
        toastAndNavigate(dispatch, true, "error", errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [dispatch, modifyDoctor, refetch, router]
  );


  
  
  const populateData = useCallback(async (id: string | number) => {
    setLoading(true);
    try {
      const response = await fetcher<DoctorData>(`get-doctor-by-id/${id}`);
      console.log("Fetched Data:", response);
      const mappedData = { /* mapping logic as above */ };
      setFormData(response);
      console.log("Mapped Data:", response);
    } catch (err: any) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, []);
  
  
  useEffect(() => {
    const id = searchParams.get("doctorId");
    console.log('iddddd',id)
    if (id) {
      populateData(id);
      setTitle("Edit Doctor");
    } else {
      setTitle("Create Doctor");
    }
  }, [searchParams, populateData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const parseAvailability = (availabilityString: string) => {
    if (!availabilityString) return [];
    return availabilityString.split(",").map((item) => item.trim());
  };

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const formattedData = {
        ...formData,
        languagesSpoken: formData.languagesSpoken.split(",").map((lang) => lang.trim()),
        hospitalAffiliations: formData.hospitalAffiliations
          .split(",")
          .map((affiliation) => affiliation.trim()),
        specializationIds: formData.specializationIds.split(",").map((id) => id.trim()),
        qualificationIds: formData.qualificationIds.split(",").map((id) => id.trim()),
        availability: parseAvailability(formData.availability),
      };

      if (doctorId) {
        update(formattedData);
      } else {
        create(formattedData);
      }
    },
    [formData, doctorId, create, update]
  );

  return (
    <Box
      sx={{
        maxWidth: 800,
        mx: "auto",
        mt: 5,
        p: 4,
        borderRadius: 2,
        boxShadow: 4,
        backgroundColor: "white",
        border: "1px solid #e0e0e0",
      }}
    >
      <Typography
        variant="h4"
        gutterBottom
        sx={{ textAlign: "center", color: "#1976d2", fontWeight: "bold" }}
      >
        {title}
      </Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Name"
              name="username"
              type="text"
              fullWidth
              value={formData.username}
              onChange={handleInputChange}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Email"
              name="email"
              fullWidth
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Password"
              name="password"
              fullWidth
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              required={!doctorId}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PasswordIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Gender"
              name="gender"
              fullWidth
              value={formData.gender}
              onChange={handleInputChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Date Of Birth"
              name="dob"
              fullWidth
              value={formData.dob}
              onChange={handleInputChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Experience"
              name="experience"
              fullWidth
              type="number"
              value={formData.experience}
              onChange={handleInputChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Languages Spoken (comma-separated)"
              name="languagesSpoken"
              fullWidth
              value={formData.languagesSpoken}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Hospital Affiliations (comma-separated)"
              name="hospitalAffiliations"
              fullWidth
              value={formData.hospitalAffiliations}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Specializations (comma-separated)"
              name="specializationIds"
              fullWidth
              value={formData.specializationIds}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Qualifications (comma-separated)"
              name="qualificationIds"
              fullWidth
              value={formData.qualificationIds}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Availability (comma-separated)"
              name="availability"
              fullWidth
              value={formData.availability}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Bio"
              name="bio"
              fullWidth
              multiline
              minRows={3}
              value={formData.bio}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Role"
              name="role"
              fullWidth
              value={formData.role}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Status"
              name="status"
              fullWidth
              value={formData.status}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                backgroundColor: "#1976d2",
                color: "#fff",
                "&:hover": { backgroundColor: "#005bb5" },
              }}
              disabled={loading}
            >
              {loading ? "Saving..." : "Submit"}
            </Button>
          </Grid>
        </Grid>
      </form>

      <Toast
        alerting={toast.toastAlert}
        severity={toast.toastSeverity}
        message={toast.toastMessage}
      />
    </Box>
  );
};

export default DoctorForm; 