import * as Yup from "yup";

export const validationSchema = (isEditMode = false) => {
  return Yup.object({
    username: Yup.string()
      .matches(
        /^[a-zA-Z\s.'-]*$/,
        "Username can only contain letters, spaces, dots (.), hyphens (-), and apostrophes (')"
      )
      .required("Username is required"),
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
    password: isEditMode
      ? Yup.string()
          .min(8, "Password must be at least 8 characters")
          .notRequired()
      : Yup.string()
          .min(8, "Password must be at least 8 characters")
          .required("Password is required"),
    contact: Yup.string()
      .matches(/^\d{1,10}$/, "Contact must be a number with up to 10 digits")
      .required("Contact is required"),
    speciality: Yup.array()
      .of(Yup.string().required("Each speciality must be a valid string"))
      .min(1, "At least one specialization is required")
      .required("Specialization is required"),
    role: Yup.string().required("Role is required"),
    // Optional Fields
    gender: isEditMode ? Yup.string().notRequired() : Yup.string(),
    dob: isEditMode
      ? Yup.string()
          .matches(/^\d{4}-\d{2}-\d{2}$/, "Date format must be YYYY-MM-DD")
          .notRequired()
      : Yup.string()
          .matches(/^\d{4}-\d{2}-\d{2}$/, "Date format must be YYYY-MM-DD")
          .required("Date of Birth is required"),
    bio: isEditMode ? Yup.string().notRequired() : Yup.string(),
    languageSpoken: isEditMode
      ? Yup.array().of(Yup.string()).notRequired()
      : Yup.array().of(Yup.string()),
    address: isEditMode ? Yup.string().notRequired() : Yup.string(),
    profilePicture: isEditMode ? Yup.mixed().notRequired() : Yup.mixed(),
    consultationFee: isEditMode
      ? Yup.number().min(0, "Consultation fee cannot be negative").notRequired()
      : Yup.number(),
    status: isEditMode ? Yup.string().notRequired() : Yup.string(),
    qualification: isEditMode
      ? Yup.array().of(Yup.string()).notRequired()
      : Yup.array().of(Yup.string()),
    availability: isEditMode ? Yup.string().notRequired() : Yup.string(),
  });
};
