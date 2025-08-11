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
    async signIn({ user, account }) {
      try {
        const userId = user.email;

        // Check if the doctor exists
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_DOCTOR_URL}/get-doctor-by-email/${userId}`
        );
        const response = await res.json();

        // If doctor is not found, create a new one
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
                specialization: "", // Default specialization
                qualification: "", // Default qualification
                consultationFee: "", // Default fee
                password: process.env.NEXT_PUBLIC_DOCTOR_PASS, // Using env password
                status: "pending",
                isVerified: false,
              }),
            }
          );
          const createDoctorResponse = await createDoctorRes.json();

          // Login after creation
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
            return true;
          }
        } else {
          return true;
        }
        return true;
      } catch (err) {
        console.error("Doctor sign-in error:", err);
        return false;
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

    //   redirect({ url, baseUrl }) {
    //     if (url.startsWith(baseUrl)) return url;
    //     if (url.startsWith("/")) return `${baseUrl}${url}`;
    //     return baseUrl;
    //   },
    // },

    async redirect({ url, baseUrl }) {
      // Handle thank-you redirect
      if (url.includes("/doctor-signup?status=thank-you")) {
        return `${baseUrl}${url}`;
      }
      // Default redirect to dashboard
      return url.startsWith(baseUrl) ? url : `${baseUrl}${url}`;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
