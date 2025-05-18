import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
    const token = request.cookies.get("auth_token")?.value;
    const isLoggedIn = !!token;

    const { pathname } = request.nextUrl;
    const isProtectedPath = pathname.startsWith("/reports");

    if (isProtectedPath && !isLoggedIn) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
}
