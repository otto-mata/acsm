'use client';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconPlus } from '@tabler/icons-react';
import { Dispatch, SetStateAction } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

const creationSchema = z.object({
    email: z.email(),
    name: z
        .string()
        .min(3, 'Account name must be at least 3 characters.')
        .max(32, 'Account name must be at most 32 characters.'),
    role: z.xor([
        z.literal('admin'),
        z.literal('operator'),
        z.literal('viewer'),
    ]),
    password: z
        .string()
        .min(12, 'Password must be at least 12 characters long')
        .refine((password) => /[A-Z]/.test(password), {
            message: 'Password must contain an uppercase letter',
        })
        .refine((password) => /[a-z]/.test(password), {
            message: 'Password must contain a lowercase letter',
        })
        .refine((password) => /[0-9]/.test(password), {
            message: 'Password must contain a number',
        })
        .refine((password) => /[!@#$%^&*]/.test(password), {
            message: 'Password must contain a special character',
        }),
});

export function JobCreateButton({
    open,
    setOpen,
}: {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
}) {
    const form = useForm<z.infer<typeof creationSchema>>({
        resolver: zodResolver(creationSchema),
        defaultValues: {
            email: '',
            name: '',
            role: 'viewer',
            password: '',
        },
    });

    const onSubmit = async (formData: z.infer<typeof creationSchema>) => {
        const user = await fetch('/api/users', {
            method: 'POST',
            body: JSON.stringify(formData),
        });
        if (!user.ok) {
            if (user.status === 409) {
                form.setFocus('email');
                form.setError('email', { message: 'Email already is use' });
            } else
                toast.error(user.statusText, {
                    richColors: true,
                    position: 'top-center',
                });
        } else {
            toast.success('Successfully created new user', {
                richColors: true,
                position: 'top-center',
            });
            setOpen(false);
        }
    };
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <form id="user-creation" onSubmit={form.handleSubmit(onSubmit)}>
                <DialogTrigger asChild>
                    <Button type="button" asChild>
                        <span>
                            <IconPlus />
                            New job
                        </span>
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create user</DialogTitle>
                        <DialogDescription>
                            Creates a new user. <br />
                        </DialogDescription>
                    </DialogHeader>
                    <FieldGroup>
                        <Controller
                            name="email"
                            control={form.control}
                            render={({ field, fieldState }) => {
                                return (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="email">
                                            Email
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            id="email"
                                            aria-invalid={fieldState.invalid}
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
                            name="name"
                            control={form.control}
                            render={({ field, fieldState }) => {
                                return (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="name">
                                            Account name
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            id="name"
                                            aria-invalid={fieldState.invalid}
                                            placeholder="Username"
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
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="password">
                                            Password
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            id="password"
                                            type="password"
                                            aria-invalid={fieldState.invalid}
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
                        <Controller
                            name="role"
                            control={form.control}
                            render={({ field, fieldState }) => {
                                return (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="role">
                                            RBAC Account role
                                        </FieldLabel>
                                        <Select
                                            name={field.name}
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <SelectTrigger
                                                id="role"
                                                aria-invalid={
                                                    fieldState.invalid
                                                }
                                            >
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectItem value="admin">
                                                        Administrator
                                                    </SelectItem>
                                                    <SelectItem value="operator">
                                                        Operator
                                                    </SelectItem>
                                                    <SelectItem value="viewer">
                                                        Viewer
                                                    </SelectItem>
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
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
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" form="user-creation">
                            Save changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    );
}
