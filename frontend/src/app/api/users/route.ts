import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const token = req.cookies.get('access_token');
    if (token === undefined)
        return NextResponse.json({ error: 'Please log in' }, { status: 401 });
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
    return NextResponse.json(await users.json());
}

export async function POST(req: NextRequest) {
    const token = req.cookies.get('access_token');
    if (token === undefined)
        return NextResponse.json({ error: 'Please log in' }, { status: 401 });
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
    const userData = await user.json();
    if (!user.ok)
        return NextResponse.json(userData, {
            status: user.status,
            statusText: user.statusText,
        });
    return NextResponse.json(userData);
}
