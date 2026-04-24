import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const publicPaths = new Set(["/login"]);

export async function middleware(request: NextRequest) {
    const { nextUrl } = request;
    const { pathname, search } = nextUrl;
    const token = await getToken({
        req: request,
        secret: process.env.AUTH_SECRET,
    });
    const isLoggedIn = Boolean(token);
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
}

export const config = {
    matcher: [
        "/((?!api/auth|api/upload|api/v1|_next/static|_next/image|favicon.ico).*)",
    ],
};
