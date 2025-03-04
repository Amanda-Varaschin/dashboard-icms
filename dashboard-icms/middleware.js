import { NextResponse } from 'next/server';

export function middleware(request) {
    const authCookie = request.cookies.get('auth');

    // Se não houver autenticação, redireciona para o login
    if (!authCookie || authCookie.value !== 'true') {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard'], // Aplica o middleware apenas para a rota /dashboard
};
