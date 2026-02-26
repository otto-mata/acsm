'use client';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { isLoggedIn } from '@/lib/auth';
import { Backend, IsError } from '@/lib/client';
import { Button } from '@/src/components/ui/button';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
    const router = useRouter();
    const formAction = async (formData: FormData) => {
        const email = formData.get('email')?.toString() ?? '';
        const password = formData.get('password')?.toString() ?? '';
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        if (!res.ok) {
            console.log(res);
            return;
        }
        const data = await res.json();
        localStorage.setItem('access_token', data.token);
        router.push('/dashboard');
    };
    useEffect(() => {
        (async () => {
            if (await isLoggedIn()) router.push('/dashboard');
        })();
    }, [router]);
    return (
        <div className="h-screen w-screen flex">
            <Card className="w-xs lg:w-lg m-auto flex flex-col justify-around">
                <CardTitle className="text-center">Login</CardTitle>
                <CardContent className="flex flex-col gap-y-2">
                    <form className="flex flex-col gap-y-2" action={formAction}>
                        <Input
                            type="email"
                            placeholder="Email"
                            name="email"
                            value="admin@acsm.fr"
                        />
                        <Input
                            type="password"
                            placeholder="Password"
                            name="password"
                            value="password12345678"
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
