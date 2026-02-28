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
