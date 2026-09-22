import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const publicPath =
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/auth") ||
    pathname === "/health";
  if (publicPath) return NextResponse.next();
  if (!req.auth) {
    return NextResponse.redirect(new URL("/login", req.nextUrl.origin));
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
