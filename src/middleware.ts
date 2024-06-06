import {NextRequest, NextResponse} from "next/server";
import {validateToken} from "@/lib/jwtUtils"

export const middleware = async (request: NextRequest) => {
    if (request.nextUrl.pathname === "/" || request.nextUrl.pathname === "/home") {
        return NextResponse.redirect(new URL("/home/dashboard", request.url));
    } else if (!request.nextUrl.pathname.startsWith("/home")) {
        return NextResponse.next();
    }
    // now we're in the protected route. validate JWT and CSRF token
    const jwt = request.cookies.get("jwt");
    const csrfCookie = request.cookies.get("csrfToken");
    const csrfHeader = request.headers.get("x-csrf-token");

    if (!jwt) {
        request.cookies.clear();
        return NextResponse.redirect(new URL("/login", request.url));
    }
    const res = await fetch(`${request.nextUrl.origin}/api/auth/validate`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${jwt.value}`
        }
    });
    if (res.status === 401) {
        request.cookies.clear();
        return NextResponse.redirect(new URL("/login", request.url));

    }

    if (request.method === "POST") {
        if (!csrfCookie || !csrfHeader || csrfCookie.value !== csrfHeader) {
            return NextResponse.redirect(new URL("/login", request.url))
        }
    }

    return NextResponse.next();
}