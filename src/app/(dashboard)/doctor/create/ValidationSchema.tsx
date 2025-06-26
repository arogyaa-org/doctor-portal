import * as yup from "yup";

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
    .required("This Field is Required"),
  contact: yup
    .string()
    .matches(phoneRegExp, "Phone Number Is Not Valid")
    .required("This Field is Required"),
  experience: yup.number().max(70, "Experience must be less than 70 years"),
  specializationIds: yup
    .array()
    .min(1, "Select At Least 1 Specialization")
    .max(4, "Maximum 5 Specialization Allowed"),
  symptomIds: yup.array().min(1, "Select At Least 1 Symptom"),
  qualificationIds: yup
    .array()
    .min(1, "Select At Least 1 Qualification")
    .max(4, "Maximum 5 Qualifications Allowed"),
  gender: yup.string(),
  status: yup.string(),
  bio: yup.string(),
  dob: yup
    .string()
    .required("Date of Birth is required")
    .test(
      "is-at-least-20-years-old",
      "You must be at least 20 years old",
      (value) => {
        if (!value) return false; 
        const dob = new Date(value);
        const minDate = new Date();
        minDate.setFullYear(minDate.getFullYear() - 20);
        return dob <= minDate; 
      }
    ),
});

export default validationSchema;
