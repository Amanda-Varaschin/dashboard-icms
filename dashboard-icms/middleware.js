import { NextResponse } from 'next/server';

export function middleware(request) {
    const authCookie = request.cookies.get('auth');

    if (!authCookie || authCookie.value !== 'true') {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard'], // Protege apenas a rota /dashboard
};
