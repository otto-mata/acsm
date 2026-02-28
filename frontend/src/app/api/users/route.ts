import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const users = await fetch(process.env.BACKEND_URL + '/api/users', {
        method: 'GET',
        credentials: 'include',
        headers: {
            Cookie: req.cookies
                .getAll()
                .map((c) => `${c.name}=${c.value}`)
                .join(';'),
        },
    });
    return users;
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const user = await fetch(process.env.BACKEND_URL + '/api/users', {
        method: 'POST',
        credentials: 'include',
        headers: {
            Cookie: req.cookies
                .getAll()
                .map((c) => `${c.name}=${c.value}`)
                .join(';'),
        },
        body: JSON.stringify(body),
    });
    return user;
}
