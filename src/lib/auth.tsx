import GoogleProvider from "next-auth/providers/google";
import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      try {
        const userId = user.email;

        // 1. Check if doctor exists
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_DOCTOR_URL}/get-doctor-by-email/${userId}`
        );
        const response = await res.json();

        // 2. If doctor not found → create
        if (
          response.statusCode === 404 ||
          response.message === "Doctor Not Found"
        ) {
          const createDoctorRes = await fetch(
            `${process.env.NEXT_PUBLIC_DOCTOR_URL}/create-doctor`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                username: user.name,
                email: user.email,
                profilePicture: user.image,
                type: "social",
                role: "doctor",
                specialization: "",
                qualification: "",
                consultationFee: "",
                password: process.env.NEXT_PUBLIC_DOCTOR_PASS,
                status: "pending",
                isVerified: false,
              }),
            }
          );

          const createDoctorData = await createDoctorRes.json();

          if (createDoctorData.statusCode === 409) {
            // Email already used → stay on signup page
            return "/signup-as-doctor?error=DoctorAlreadyExists";
          }

          // 3. Auto login after creation
          const loginRes = await fetch(
            `${process.env.NEXT_PUBLIC_DOCTOR_URL}/login`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email: user.email,
                password: process.env.NEXT_PUBLIC_DOCTOR_PASS,
              }),
            }
          );

          const loginData = await loginRes.json();
          if (loginData.statusCode === 200) {
            // Created & logged in → go to thank you
            return "/signup-as-doctor?status=thank-you";
          } else {
            return "/signup-as-doctor?error=DoctorLoginFailed";
          }
        } else {
          // 4. Doctor already exists → stay on signup page
          return "/signup-as-doctor?error=DoctorAlreadyExists";
        }
      } catch (err) {
        console.error("Doctor sign-in error:", err);
        return "/signup-as-doctor?error=SomethingWentWrong";
      }
    },

    async jwt({ token, user }) {
      if (user) {
        token.role = "doctor";
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      // NextAuth will use whatever we return from signIn callback directly
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return url;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
