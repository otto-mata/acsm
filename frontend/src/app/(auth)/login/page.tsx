import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { isLoggedIn } from '@/lib/auth';
import { Button } from '@/src/components/ui/button';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function LoginPage() {
    async function loginAction(formData: FormData) {
        'use server';
        const email = formData.get('email')?.toString();
        const password = formData.get('password')?.toString();
        const body = JSON.stringify({ email, password });
        const response = await fetch(process.env.BACKEND_URL + '/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body,
        });
        if (!response.ok) {
            console.error('Login failed', response.status);
            return;
        }
        const content = await response.json();
        (await cookies()).set({
            name: 'access_token',
            value: content.access_token,
            httpOnly: true,
            maxAge: 3600,
        });
        redirect('/dashboard');
    }
    const c = await cookies();
    const logged = await isLoggedIn(c.get('access_token')?.value ?? '');
    if (logged) redirect('/dashboard');

    return (
        <div className="h-screen w-screen flex">
            <Card className="w-xs lg:w-lg m-auto flex flex-col justify-around">
                <CardTitle className="text-center">Login</CardTitle>
                <CardContent className="flex flex-col gap-y-2">
                    <form
                        className="flex flex-col gap-y-2"
                        action={loginAction}
                    >
                        <Input type="email" placeholder="Email" name="email" />
                        <Input
                            type="password"
                            placeholder="Password"
                            name="password"
                        />
                        <Button type="submit">Connect</Button>
                    </form>
                    <CardDescription className="text-center">
                        To create an account, contact the admin.
                    </CardDescription>
                </CardContent>
                <CardFooter></CardFooter>
            </Card>
        </div>
    );
}
