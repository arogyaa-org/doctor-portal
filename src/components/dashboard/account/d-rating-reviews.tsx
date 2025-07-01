import React, { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Rating,
  Stack,
  Typography,
} from "@mui/material";
import { fetcher } from "@/apis/apiClient";
import { Utility } from "@/utils";

const { decodedToken } = Utility();
const { id: doctorId } = decodedToken() || {};

interface Testimonial {
  _id: string;
  patientId: {
    username: string;
    age?: number;
    gender?: string;
  };
  doctorId: {
    username: string;
    gender?: string;
  };
  rating?: number;
  review?: string;
}

interface ApiResponse {
  statusCode: number;
  message: string;
  data: Testimonial[];
}

export default function DoctorRatingsAndReviews(): React.JSX.Element {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setLoading(true);
        const response = await fetcher<ApiResponse>(
          "testimonial",
          `/get-testimonial-by-doctor-id/${doctorId}`
        );
        const testimonialsArray = response.data || [];
        setTestimonials(testimonialsArray);
      } catch (err) {
        setError("Failed to load testimonials");
      } finally {
        setLoading(false);
      }
    };

    if (doctorId) {
      fetchTestimonials();
    } else {
      setError("Doctor ID not found");
      setLoading(false);
    }
  }, [doctorId]);

  if (loading) {
    return <Typography>Loading testimonials...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (testimonials.length === 0) {
    return <Typography>No testimonials available.</Typography>;
  }

  return (
    <Stack spacing={2}>
      {testimonials.map((review, index) => (
        <Card
          key={index}
          variant="outlined"
          sx={{
            transition: "transform 0.3s, box-shadow 0.3s",
            "&:hover": {
              boxShadow: 14,
              transform: "scale(1.02)",
            },
          }}
        >
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="flex-start">
              {/* User Profile Image */}
              <Avatar
                src="/api/placeholder/128/128" // No image field in schema, using fallback
                alt={review.patientId.username}
                sx={{ width: 50, height: 50 }}
              />

              {/* Review Content */}
              <Box flex={1}>
                <Stack spacing={1}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="h6">
                      {review.patientId.username}
                    </Typography>
                    <Rating
                      value={review.rating || 0}
                      precision={0.5}
                      readOnly
                    />
                  </Stack>
                  <Typography variant="body2" color="textSecondary">
                    {review.review || "No comment provided"}
                  </Typography>
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}
