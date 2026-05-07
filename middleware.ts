import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export { auth as default } from "@/lib/auth";

export const config = {
  matcher: ["/dashboard/:path*", "/api/actions/:path*"],
};
