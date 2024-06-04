import {NextRequest, NextResponse} from "next/server";
import {validateToken} from "@/lib/jwtUtils"

export const middleware = (request: NextRequest) => {
    console.log(request.url)
    if (request.nextUrl.pathname === "/" || request.nextUrl.pathname === "/home") {
        return NextResponse.redirect(new URL("/home/dashboard", request.url));
    } else if (!request.nextUrl.pathname.startsWith("/home")) {
        return NextResponse.next();
    }
    // now we're in the protected route. validate JWT and CSRF token
    const jwt = request.cookies.get("jwt");
    const csrfCookie = request.cookies.get("csrfToken");
    const csrfHeader = request.headers.get("x-csrf-token");

    if (!jwt || !validateToken(jwt.value)) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    if (request.method === "POST") {
        if (!csrfCookie || !csrfHeader || csrfCookie.value !== csrfHeader) {
            return NextResponse.redirect(new URL("/login", request.url))
        }
    }

    return NextResponse.next();
}