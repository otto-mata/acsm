import { Backend, IsError } from '@/lib/client';
import { IAuthRequest } from '@/lib/client.models';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const data = (await req.json()) as IAuthRequest;
    const res = await Backend.getInstance().Login(data);
    if (IsError(res)) {
        return new NextResponse();
    }
    console.log(res);
    return new NextResponse(
        JSON.stringify({
            token: res.access_token.token,
        }),
    );
}
