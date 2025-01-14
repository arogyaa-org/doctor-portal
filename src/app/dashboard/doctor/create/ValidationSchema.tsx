import * as yup from "yup";

const phoneRegExp = /^((\+[1-9]{1,4}[ -]?)|(\([0-9]{2,3}\)[ -]?)|([0-9]{2,4})[ -]?)*?[0-9]{3,4}[ -]?[0-9]{3,4}$/;
const emailRegExp = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

const validationSchema = yup.object().shape({
  username: yup.string()
    .min(2, 'Firstname is Too Short!')
    .max(50, 'Firstname is Too Long!')
    .required("This Field is Required"),
  email: yup.string()
    .matches(emailRegExp, "Email Address is Not Valid")
    .required("This Field is Required"),
  password: yup.string()
    .min(8, 'Password Must Be 8 Characters Long')
    .matches(/[A-Z]/, 'Password Must Contain At Least 1 Uppercase Letter')
    .matches(/[a-z]/, 'Password Must Contain At Least 1 Lowercase Letter')
    .matches(/[0-9]/, 'Password Must Contain At Least 1 Number')
    .matches(/[^\w]/, 'Password Must Contain At Least 1 Special Character')
    .required("This Field is Required"),
  contact: yup.string()
    .matches(phoneRegExp, "Phone Number Is Not Valid")
    .required("This Field is Required"),
  specializationIds: yup.array()
    .min(1, "Select At Least 1 Specialization"),
  symptomIds: yup.array()
    .min(1, "Select At Least 1 Symptom"),
  qualificationIds: yup.array()
    .min(1, "Select At Least 1 Qualification"),
  role: yup.string(),
  gender: yup.string(),
  status: yup.string(),
  bio: yup.string(),
  dob: yup.string()
    .required("Date of Birth is required")
});

export default validationSchema;
