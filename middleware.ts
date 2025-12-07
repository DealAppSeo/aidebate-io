import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const ADMIN_SECRET = process.env.ADMIN_JWT_SECRET || 'fallback-secret-kb81'

export async function middleware(request: NextRequest) {
    if (request.nextUrl.pathname.startsWith('/admin')) {
        // Exclude login page from protection
        if (request.nextUrl.pathname === '/admin/login') {
            return NextResponse.next()
        }

        const token = request.cookies.get('admin_token')?.value

        if (!token) {
            return NextResponse.redirect(new URL('/admin/login', request.url))
        }

        try {
            await jwtVerify(token, new TextEncoder().encode(ADMIN_SECRET))
        } catch {
            return NextResponse.redirect(new URL('/admin/login', request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/admin/:path*'],
}
