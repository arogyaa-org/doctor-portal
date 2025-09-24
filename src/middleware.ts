import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;

  const publicPaths = [
    "/login",
    "/signup-as-doctor",
    "/legal",
    "/assets/logomain.png",
    "/reset-password",
    "/reset-password/confirm",
  ];
  const pathname = request.nextUrl.pathname;
  const isPublicPath = publicPaths.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  if (!isPublicPath) {
    if (token) {
      try {
        const jwtSecret = new TextEncoder().encode(
          process.env.JWT_SECRET || ""
        );
        const { payload } = await jwtVerify(token, jwtSecret);
        const role = payload.role;
        if (
          role !== "admin" &&
          role !== "sub_admin" &&
          role !== "sales" &&
          role !== "doctor" &&
          role !== "operations"
        ) {
          return NextResponse.redirect(new URL("/unauthorized", request.url));
        }
      } catch (error) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
    } else {
      console.log("redirect to login");
      // Redirect to login if no token is present
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }
  // Allow the request to proceed if authenticated
  return NextResponse.next();
}

// Specify the paths that this middleware should apply to
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
