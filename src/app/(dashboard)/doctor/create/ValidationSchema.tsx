// ValidationSchema.ts
import * as yup from "yup";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(isSameOrBefore);


const phoneRegExp =
  /^((\+[1-9]{1,4}[ -]?)|(\([0-9]{2,3}\)[ -]?)|([0-9]{2,4})[ -]?)*?[0-9]{3,4}[ -]?[0-9]{3,4}$/;
const emailRegExp = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

const validationSchema = yup.object().shape({
  username: yup
    .string()
    .min(2, "Username is Too Short!")
    .max(50, "Username is Too Long!")
    .required("This Field is Required"),
  email: yup
    .string()
    .matches(emailRegExp, "Email Address is Not Valid")
    .required("This Field is Required"),
  password: yup
    .string()
    .min(8, "Password Must Be 8 Characters Long")
    .matches(/[A-Z]/, "Password Must Contain At Least 1 Uppercase Letter")
    .matches(/[a-z]/, "Password Must Contain At Least 1 Lowercase Letter")
    .matches(/[0-9]/, "Password Must Contain At Least 1 Number")
    .matches(/[^\w]/, "Password Must Contain At Least 1 Special Character")
    .when("_id", {
      is: (value: string) => !value,
      then: (schema) => schema.required("This Field is Required"),
      otherwise: (schema) => schema.optional(),
    }),
  contact: yup
    .string()
    .matches(phoneRegExp, "Phone Number Is Not Valid")
    .required("This Field is Required"),
  experience: yup
    .number()
    .min(0, "Experience cannot be negative")
    .max(70, "Experience must be less than 70 years")
    .required("Experience is required"),
  specializationIds: yup
    .array()
    .min(1, "Select At Least 1 Specialization")
    .max(4, "Maximum 4 Specializations Allowed")
    .required("Specializations are required"),
  symptomIds: yup
    .array()
    .min(1, "Select At Least 1 Symptom")
    .required("Symptoms are required"),
  qualificationIds: yup
    .array()
    .min(1, "Select At Least 1 Qualification")
    .max(4, "Maximum 4 Qualifications Allowed")
    .required("Qualifications are required"),
  gender: yup.string().required("Gender is required"),
  status: yup.string().required("Status is required"),
  bio: yup.string().optional(),
  languagesSpoken: yup.array().of(yup.string()).optional(),
  tags: yup.array().of(yup.string()).optional(),
  clinicAddress: yup.string().required("Clinic Address is required"),
  pincode: yup
    .string()
    .matches(/^[0-9]{6}$/, "Pincode must be a valid 6-digit number")
    .required("Pincode is required"),
  dob: yup
  .string()
  .required("Date of Birth is required")
  .test("valid-format", "Invalid date format (use DD/MM/YYYY)", (value) => {
    if (!value) return false;
    const d = dayjs(value, "DD/MM/YYYY", true); // strict parse
    return d.isValid();
  })
  .test("is-at-least-20-years-old", "You must be at least 20 years old", (value) => {
    if (!value) return false;
    const dob = dayjs(value, "DD/MM/YYYY", true); // strict parse
    if (!dob.isValid()) return false;
    const cutoff = dayjs().subtract(20, "year");
    return dob.isSameOrBefore(cutoff, "day");
  }),
  availability: yup
    .array()
    .of(
      yup.object().shape({
        day: yup.string().required("Day is required"),
        startTime: yup
          .string()
          .required("Start time is required")
          .matches(
            /^(1[0-2]|0?[1-9]):[0-5][0-9] (AM|PM)$/,
            "Invalid time format"
          ),
        endTime: yup
          .string()
          .required("End time is required")
          .matches(
            /^(1[0-2]|0?[1-9]):[0-5][0-9] (AM|PM)$/,
            "Invalid time format"
          )
          .test(
            "end-time-after-start",
            "End time must be after start time",
            function (endTime) {
              const { startTime } = this.parent;
              if (!startTime || !endTime) return true;
              return dayjs(endTime, "h:mm A").isAfter(
                dayjs(startTime, "h:mm A")
              );
            }
          ),
        hospital: yup.object().shape({
          name: yup.string().required("Hospital name is required"), // Changed from nullable()
          location: yup.string().required("Hospital location is required"), // Already required
        }),
      })
    )
    .min(1, "At least one availability slot is required"),
  medicalCertificates: yup.array().of(yup.mixed()).optional(),
  registrationCertificates: yup.array().of(yup.mixed()).optional(),
  aadhaarDocs: yup.array().of(yup.mixed()).optional(),
  pancardDocs: yup.array().of(yup.mixed()).optional(),
  isVerified: yup.boolean().optional(),
});

export default validationSchema;
