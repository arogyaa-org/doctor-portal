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
    .when("_id", {
      is: (value: string) => !value,
      then: (schema) => schema.required("This Field is Required"),
      otherwise: (schema) => schema.optional(),
    }),
  contact: yup
    .string()
    .matches(phoneRegExp, "Phone Number Is Not Valid")
    .required("This Field is Required"),
  designation: yup.string(),
  gender: yup.string().required("Gender is required"),
  status: yup.string().required("Status is required"),
  address: yup.string().required("Address is required"),
  pincode: yup
    .string()
    .matches(/^[0-9]{6}$/, "Pincode must be a valid 6-digit number")
    .required("Pincode is required"),
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
    )
});

export default validationSchema;
