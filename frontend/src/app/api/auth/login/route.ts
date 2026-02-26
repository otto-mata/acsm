import { Backend, IsError } from '@/lib/client';
import { IAuthRequest } from '@/lib/client.models';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const data = (await req.json()) as IAuthRequest;
    const res = await fetch(`${process.env.BACKEND_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = {
            message: 'An error occured',
        };
        if (res.status === 401) err.message = 'Invalid credentials';
        return NextResponse.json(err, { status: 401 });
    }
    const response = NextResponse.json({ user: await res.json() });
    res.headers.getSetCookie().forEach((sc) => {
        response.headers.append('Set-Cookie', sc);
    });

    return response;
}
