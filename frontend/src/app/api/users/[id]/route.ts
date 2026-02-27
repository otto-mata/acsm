import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const id = (await params).id;
    const user = await fetch(process.env.BACKEND_URL + '/api/users/' + id, {
        method: 'GET',
        credentials: 'include',
        headers: {
            Cookie: req.cookies
                .getAll()
                .map((c) => `${c.name}=${c.value}`)
                .join(';'),
        },
    });
    if (!user.ok)
        return NextResponse.json({ error: 'Please log in' }, { status: 401 });
    return NextResponse.json(await user.json());
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const id = (await params).id;
    const user = await fetch(process.env.BACKEND_URL + '/api/users/' + id, {
        method: 'PUT',
        headers: {
            Cookie: req.cookies
                .getAll()
                .map((c) => `${c.name}=${c.value}`)
                .join(';'),
        },
        body: JSON.stringify(await req.json()),
    });
    return user;
}
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const id = (await params).id;
    const user = await fetch(process.env.BACKEND_URL + '/api/users/' + id, {
        method: 'DELETE',
        headers: {
            Cookie: req.cookies
                .getAll()
                .map((c) => `${c.name}=${c.value}`)
                .join(';'),
        },
    });
    return user;
}
