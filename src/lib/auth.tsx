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

      try {
        // 1) Check if doctor exists
        const getRes = await fetch(
          `${DOCTOR_URL}/get-doctor-by-email/${encodeURIComponent(email)}`,
          { cache: "no-store" }
        );
        const getData = await getRes.json();

        const notFound =
          getRes.status === 404 ||
          getData?.statusCode === 404 ||
          getData?.message === "Doctor Not Found";

        if (notFound) {
          // 2) Create doctor
          const createRes = await fetch(`${DOCTOR_URL}/create-doctor`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: user?.name,
              email,
              profilePicture: user?.image,
              type: "social",
              role: "doctor",
              specialization: "",
              qualification: "",
              consultationFee: "",
              password: process.env.NEXT_PUBLIC_DOCTOR_PASS, // temp password
              status: "pending",
              createdFrom: "arogyaa",
              isVerified: false,
            }),
          });
          const createData = await createRes.json();

          // If BE says already exists, let FE show a toast
          if (createRes.status === 409 || createData?.statusCode === 409) {
            return "/signup-as-doctor?error=DoctorAlreadyExists";
          }

          // 3) Try auto-login, BUT do not block the flow if it fails.
          try {
            const loginRes = await fetch(`${DOCTOR_URL}/login`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email,
                password: process.env.NEXT_PUBLIC_DOCTOR_PASS,
              }),
            });
            if (loginRes.ok) {
              return "/signup-as-doctor?status=thank-you&via=google";
            }
          } catch {
            /* ignore login error */
          }
          // Created but login failed → still show thank-you
          return "/signup-as-doctor?status=thank-you&via=google";
        }

        // 4) Doctor exists
        const pendingOrUnverified =
          getData?.status === "pending" || getData?.isVerified === false;

        if (pendingOrUnverified) {
          // Existing but pending → show thank-you (review in progress)
          return "/signup-as-doctor?status=thank-you&via=google";
        }

        // Fully exists/active → let FE show a toast about existing account
        return "/signup-as-doctor?error=DoctorAlreadyExists";
      } catch (err) {
        console.error("Doctor sign-in error:", err);
        // Graceful fallback: avoid dead-ends; FE shows thank-you and proceeds
        return "/signup-as-doctor?status=thank-you&via=google";
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
      // Ensure relative paths become same-origin absolute URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return url;
    },
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};
