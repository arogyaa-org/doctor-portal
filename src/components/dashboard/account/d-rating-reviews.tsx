import React from "react";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Rating,
  Stack,
  Typography,
} from "@mui/material";

const reviews = [
  {
    patient: "John Smith",
    rating: 5,
    comment: "Excellent doctor, highly recommended!",
    image: "/api/placeholder/128/128",
  },
  {
    patient: "Sarah Connor",
    rating: 4,
    comment: "Very professional and knowledgeable.",
    image: "/api/placeholder/128/128",
  },
];

export default function DoctorRatingsAndReviews(): React.JSX.Element {
  return (
    <Stack spacing={2}>
      {reviews.map((review, index) => (
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
                src={review.image}
                alt={review.patient}
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
                    <Typography variant="h6">{review.patient}</Typography>
                    <Rating value={review.rating} readOnly />
                  </Stack>
                  <Typography variant="body2" color="textSecondary">
                    {review.comment}
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
