import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
    PUBLIC_ROUTES,
    Role,
    routePermissions,
} from './config/routePermissions';

// 🔍 Find the most specific matching route permission
function getRequiredRoles(pathname: string): Role[] | null {
    // Sort by length descending to match most specific route first
    // e.g. /admin/users should match before /admin
    const matchedRoute = Object.keys(routePermissions)
        .sort((a, b) => b.length - a.length)
        .find((route) => pathname.match(route));

    return matchedRoute ? routePermissions[matchedRoute] : null;
}

function isPublicRoute(pathname: string) {
    return PUBLIC_ROUTES.some(
        (route) => pathname === route || pathname.startsWith(route + '/'),
    );
}
function parseJwt(token: string) {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
}
export async function proxy(req: NextRequest) {
    const token = req.cookies.get('access_token');
    const { pathname } = req.nextUrl;

    const isAuthPage = pathname === '/login';

    if (!isAuthPage && token === undefined) {
        return NextResponse.redirect(new URL('/login', req.url));
    } else if (isAuthPage && token !== undefined) {
        const res = await fetch(`${process.env.BACKEND_URL}/auth/validate`, {
            method: 'POST',
            headers: {
                Cookie: `${token.name}=${token.value}`,
            },
        });
        if (res.ok) {
            return NextResponse.redirect(new URL('/dashboard', req.url));
        } else {
            return NextResponse.redirect(new URL('/login', req.url));
        }
    }
    const requiredRoles = getRequiredRoles(pathname);
    if (requiredRoles === null) return NextResponse.next();
    const role = parseJwt(token?.value ?? '').role;
    if (!requiredRoles.includes(role))
        return NextResponse.redirect(new URL('/403', req.url));
    return NextResponse.next();
}

// 🎯 Apply middleware only to these routes
export const config = {
    matcher: ['/login', '/dashboard', '/users/:path*', '/jobs/:path*'],
};
