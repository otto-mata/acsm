import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
    const jobs = await fetch(process.env.BACKEND_URL + '/api/jobs', {
        method: 'GET',
        credentials: 'include',
        headers: {
            Cookie: req.cookies
                .getAll()
                .map((c) => `${c.name}=${c.value}`)
                .join(';'),
        },
    });
    return jobs;
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const job = await fetch(process.env.BACKEND_URL + '/api/jobs', {
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
    return job;
}
