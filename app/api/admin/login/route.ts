import { NextResponse } from 'next/server'
import { SignJWT } from 'jose'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD
const ADMIN_SECRET = process.env.ADMIN_JWT_SECRET || 'fallback-secret-kb81'

export async function POST(request: Request) {
    const { password } = await request.json()

    if (!ADMIN_PASSWORD) {
        console.error("ADMIN_PASSWORD not set in env")
        return NextResponse.json({ error: 'Server config error' }, { status: 500 })
    }

    if (password !== ADMIN_PASSWORD) {
        return NextResponse.json({ error: 'Invalid' }, { status: 401 })
    }

    const token = await new SignJWT({ admin: true })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('24h')
        .sign(new TextEncoder().encode(ADMIN_SECRET))

    const response = NextResponse.json({ success: true })
    response.cookies.set('admin_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 86400 // 24 hours
    })

    return response
}
