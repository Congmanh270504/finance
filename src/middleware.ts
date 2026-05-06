import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const publicPaths = new Set(["/login"]);

export default auth(function middleware(request) {
    const { nextUrl } = request;
    const { pathname, search } = nextUrl;
    const isLoggedIn = Boolean(request.auth);
    const isPublicPath = publicPaths.has(pathname);

    if (isPublicPath && isLoggedIn) {
        return NextResponse.redirect(new URL("/", nextUrl));
    }

    if (!isPublicPath && !isLoggedIn) {
        const callbackUrl = `${pathname}${search}`;
        const loginUrl = new URL("/login", nextUrl);
        loginUrl.searchParams.set("callbackUrl", callbackUrl);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        "/((?!api/auth|api/upload|api/v1|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico)$).*)",
    ],
};
