'use client';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';

export default function LoginPage() {
    const { isLoading, isAuthenticated, login } = useAuth();
    const router = useRouter();
    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            router.replace('/dashboard'); // replace() prevents going back to login
        }
    }, [isAuthenticated, isLoading, router]);
    const formAction = async (formData: FormData) => {
        const email = formData.get('email')?.toString() ?? '';
        const password = formData.get('password')?.toString() ?? '';
        try {
            await login(email, password);
        } catch (e: any) {
            toast.error(e.message, {
                richColors: true,
                position: 'top-center',
            });
            return;
        }
        router.push('/dashboard');
    };
    return (
        <div className="h-screen w-screen flex">
            <Card className="w-xs lg:w-lg m-auto flex flex-col justify-around">
                <CardTitle className="text-center">Login</CardTitle>
                <CardContent className="flex flex-col gap-y-2">
                    <form className="flex flex-col gap-y-2" action={formAction}>
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
