'use client';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';
import z from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';

const loginFormSchema = z.object({
    email: z.email(),
    password: z.string(),
});

export default function LoginPage() {
    const { isLoading, isAuthenticated, login } = useAuth();
    const router = useRouter();
    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            router.replace('/dashboard'); // replace() prevents going back to login
        }
    }, [isAuthenticated, isLoading, router]);
    const onSubmit = async (data: z.infer<typeof loginFormSchema>) => {
        try {
            await login(data.email, data.password);
        } catch (e: any) {
            toast.error(e.message, {
                richColors: true,
                position: 'top-center',
            });
            return;
        }
        router.push('/dashboard');
    };

    const form = useForm<z.infer<typeof loginFormSchema>>({
        resolver: zodResolver(loginFormSchema),
        defaultValues: { email: '', password: '' },
    });

    return (
        <div className="h-screen w-screen flex">
            <Card className="w-xs lg:w-lg m-auto flex flex-col justify-around">
                <CardHeader className="text-center">
                    <CardTitle>Login</CardTitle>
                    <CardDescription>
                        Access to the Server Manager. To create an account,
                        contact the admin.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-y-2">
                    <form
                        id="login-form"
                        className="flex flex-col gap-y-2"
                        onSubmit={form.handleSubmit(onSubmit)}
                    >
                        <FieldGroup>
                            <Controller
                                name="email"
                                control={form.control}
                                render={({ field, fieldState }) => {
                                    return (
                                        <Field
                                            data-invalid={fieldState.invalid}
                                        >
                                            <FieldLabel htmlFor="email">
                                                Email
                                            </FieldLabel>
                                            <Input
                                                {...field}
                                                id="email"
                                                aria-invalid={
                                                    fieldState.invalid
                                                }
                                                placeholder="Email address"
                                                autoComplete="off"
                                            />
                                            {fieldState.invalid && (
                                                <FieldError
                                                    errors={[fieldState.error]}
                                                />
                                            )}
                                        </Field>
                                    );
                                }}
                            />
                            <Controller
                                name="password"
                                control={form.control}
                                render={({ field, fieldState }) => {
                                    return (
                                        <Field
                                            data-invalid={fieldState.invalid}
                                        >
                                            <FieldLabel htmlFor="password">
                                                Password
                                            </FieldLabel>
                                            <Input
                                                {...field}
                                                id="password"
                                                aria-invalid={
                                                    fieldState.invalid
                                                }
                                                type="password"
                                                placeholder="Password"
                                                autoComplete="off"
                                            />
                                            {fieldState.invalid && (
                                                <FieldError
                                                    errors={[fieldState.error]}
                                                />
                                            )}
                                        </Field>
                                    );
                                }}
                            />
                        </FieldGroup>
                    </form>
                </CardContent>

                <CardFooter>
                    <Field>
                        <Button type="submit" form="login-form">
                            Log in
                        </Button>
                    </Field>
                </CardFooter>
            </Card>
        </div>
    );
}
