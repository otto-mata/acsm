import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const id = (await params).id;
    const job = await fetch(process.env.BACKEND_URL + '/api/jobs/' + id, {
        method: 'GET',
        credentials: 'include',
        headers: {
            Cookie: req.cookies
                .getAll()
                .map((c) => `${c.name}=${c.value}`)
                .join(';'),
        },
    });
    if (!job.ok)
        return NextResponse.json({ error: 'Please log in' }, { status: 401 });
    return NextResponse.json(await job.json());
}
