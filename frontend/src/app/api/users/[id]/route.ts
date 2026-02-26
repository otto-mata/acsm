import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const token = req.cookies.get('access_token');
    if (token === undefined)
        return NextResponse.json({ error: 'Please log in' }, { status: 401 });

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
