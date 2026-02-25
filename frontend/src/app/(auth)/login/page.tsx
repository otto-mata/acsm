import {
    Card,
    CardContent,
    CardDescription,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/src/components/ui/button';

export default function LoginPage() {
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
        if (response.ok) console.log(await response.json());
        else {
            console.error('Login failed', response.status);
        }
    }
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
            </Card>
        </div>
    );
}
