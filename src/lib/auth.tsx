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
      const DOCTOR_URL = process.env.NEXT_PUBLIC_DOCTOR_URL!;
      const email = (user?.email || "").toLowerCase();

      const THANK_YOU = "/signup-as-doctor?status=thank-you&via=google";
      const ALREADY_EXISTS = "/signup-as-doctor?error=DoctorAlreadyExists";

      try {
        // 1) Only check existence by email
        const existsRes = await fetch(
          `${DOCTOR_URL}/doctor/exists?email=${encodeURIComponent(email)}`,
          { cache: "no-store" }
        );
        const existsData = await existsRes.json().catch(() => ({}) as any);
        if (existsData?.exists) {
          return ALREADY_EXISTS;
        }

        // 2) Create doctor (first-time). Keep payload minimal but valid for your DTO.
        await fetch(`${DOCTOR_URL}/create-doctor`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-signup-method": "google", // so BE records consent source
          },
          body: JSON.stringify({
            username: user?.name,
            email,
            profilePicture: user?.image,
            password:
              process.env.DOCTOR_TEMP_PASS ??
              process.env.NEXT_PUBLIC_DOCTOR_PASS ??
              "Temp@12345",
            status: "pending",
            createdFrom: "arogyaa",
            isVerified: false,
          }),
        });

        // Regardless of create response (except duplicate), show thank-you.
        return THANK_YOU;
      } catch (err) {
        console.error("Doctor sign-in error:", err);
        // Fallback still shows thank-you per your requirement of only two outcomes
        return THANK_YOU;
      }
    },

    async jwt({ token, user }) {
      if (user) token.role = "doctor";
      return token;
    },

    async session({ session, token }) {
      if (session.user) (session.user as any).role = token.role;
      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return url;
    },
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};
