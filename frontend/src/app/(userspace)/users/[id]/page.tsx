'use client';
import { LoadScreen } from '@/components/LoadScreen';
import { ModalDialog } from '@/components/Modal';
import { Typography } from '@/components/Typography';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from '@/components/ui/combobox';
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/hooks/useAuth';
import { IUserProfile, Roles } from '@/lib/client.models';
import { zodResolver } from '@hookform/resolvers/zod';
import { Edit, Trash } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

const editFormSchema = z.object({
    name: z
        .string()
        .min(3, 'Account name must be at least 3 characters.')
        .max(32, 'Account name must be at most 32 characters.'),
    role: z.xor([
        z.literal('admin'),
        z.literal('operator'),
        z.literal('viewer'),
    ]),
});

async function onSubmitEditForm(data: z.infer<typeof editFormSchema>) {
    toast('You submitted the following values:', {
        description: (
            <pre className="bg-accent text-accent-foreground mt-2 w-[320px] overflow-x-auto rounded-md p-4">
                <code>{JSON.stringify(data, null, 2)}</code>
            </pre>
        ),
        position: 'bottom-right',
        classNames: {
            content: 'flex flex-col gap-2',
        },
        style: {
            '--border-radius': 'calc(var(--radius)  + 4px)',
        } as React.CSSProperties,
    });
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
    const [userData, setUser] = useState<IUserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [editModalMode, setEditModal] = useState(false);
    const [deleteModalMode, setDeleteModal] = useState(false);

    const { user, isLoading } = useAuth();

    const form = useForm<z.infer<typeof editFormSchema>>({
        resolver: zodResolver(editFormSchema),
        defaultValues: {
            name: userData?.name ?? '',
            role: userData?.role ?? 'viewer',
        },
    });

    useEffect(() => {
        const hook = async () => {
            const { id } = await params;
            const userdata = await fetch('/api/users/' + id);
            if (!userdata.ok) {
                setError(true);
            } else {
                setUser(await userdata.json());
            }
            setLoading(false);
        };
        hook();
    }, [params, loading]);

    useEffect(() => {
        if (userData !== null) {
            form.setValue('name', userData.name);
            form.setValue('role', userData.role);
        }
    }, [userData]);
    if (loading || isLoading || user === null || userData === null) {
        return <LoadScreen />;
    }

    return (
        <div>
            {editModalMode ? (
                <ModalDialog setModalState={setEditModal}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Edit {userData.name}</CardTitle>
                            <CardDescription>
                                You can only modify the name and the role of the
                                account.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form
                                id="edit-form"
                                onSubmit={form.handleSubmit(onSubmitEditForm)}
                            >
                                <FieldGroup>
                                    <Controller
                                        name="name"
                                        control={form.control}
                                        render={({ field, fieldState }) => {
                                            return (
                                                <Field
                                                    data-invalid={
                                                        fieldState.invalid
                                                    }
                                                >
                                                    <FieldLabel htmlFor="edit-form-name">
                                                        Name
                                                    </FieldLabel>
                                                    <Input
                                                        {...field}
                                                        id="edit-form-name"
                                                        aria-invalid={
                                                            fieldState.invalid
                                                        }
                                                        placeholder="Account name"
                                                        autoComplete="off"
                                                    />
                                                    {fieldState.invalid && (
                                                        <FieldError
                                                            errors={[
                                                                fieldState.error,
                                                            ]}
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
                                                <Field
                                                    data-invalid={
                                                        fieldState.invalid
                                                    }
                                                >
                                                    <FieldLabel htmlFor="edit-form-role">
                                                        Role
                                                    </FieldLabel>
                                                    <Combobox items={Roles}>
                                                        <ComboboxInput
                                                            id="edit-form-role"
                                                            placeholder="Select a role"
                                                            name="role"
                                                        />
                                                        <ComboboxContent>
                                                            <ComboboxEmpty>
                                                                No items found.
                                                            </ComboboxEmpty>
                                                            <ComboboxList>
                                                                {(item) => (
                                                                    <ComboboxItem
                                                                        key={
                                                                            item
                                                                        }
                                                                        value={
                                                                            item
                                                                        }
                                                                    >
                                                                        {item}
                                                                    </ComboboxItem>
                                                                )}
                                                            </ComboboxList>
                                                        </ComboboxContent>
                                                    </Combobox>
                                                    <FieldDescription>
                                                        Admins can access
                                                        everything, operators
                                                        can edit and launch jobs
                                                        and viewers can only
                                                        check for jobs result.
                                                    </FieldDescription>
                                                    {fieldState.invalid && (
                                                        <FieldError
                                                            errors={[
                                                                fieldState.error,
                                                            ]}
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
                                <Button type="submit" form="edit-form">
                                    Submit
                                </Button>
                            </Field>
                        </CardFooter>
                    </Card>
                </ModalDialog>
            ) : (
                <></>
            )}
            {deleteModalMode ? (
                <ModalDialog setModalState={setDeleteModal}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Delete {userData.name}</CardTitle>
                            <CardDescription>
                                <p>You are going to delete account:</p>
                                <code className="break-keep bg-accent text-accent-foreground rounded-md p-1">
                                    {user.id}
                                </code>
                                <p>This action cannot be undone.</p>
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button
                                variant={'destructive'}
                                onClick={async () => {}}
                            >
                                Delete account
                            </Button>
                        </CardContent>
                    </Card>
                </ModalDialog>
            ) : (
                <></>
            )}
            <div className="grid grid-cols-1 gap-8 w-1/4 m-auto">
                <Card>
                    <CardTitle className="flex justify-between  px-6">
                        <Typography variant={'title'} className="my-auto">
                            User
                        </Typography>
                        <div className="flex gap-1">
                            <Button
                                onClick={() => {
                                    setEditModal(true);
                                }}
                            >
                                Edit <Edit></Edit>
                            </Button>
                            <Button
                                onClick={() => {
                                    setDeleteModal(true);
                                }}
                            >
                                Delete <Trash></Trash>
                            </Button>
                        </div>
                    </CardTitle>
                    <CardContent className="flex flex-col">
                        {userData ? (
                            <>
                                <div className="flex justify-between">
                                    <Typography variant="label">
                                        Role
                                    </Typography>
                                    <Badge>{userData.role}</Badge>
                                </div>
                                <div className="flex justify-between">
                                    <Typography variant="label">
                                        Name
                                    </Typography>
                                    <Typography>{userData.name}</Typography>
                                </div>
                                <div className="flex justify-between">
                                    <Typography variant="label">
                                        Email
                                    </Typography>
                                    <Typography>{userData.email}</Typography>
                                </div>
                            </>
                        ) : (
                            <Spinner />
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardTitle className="text-center">
                        <Typography variant={'title'}>Uploads</Typography>
                    </CardTitle>
                    <CardContent className="flex justify-around">
                        <Spinner />
                    </CardContent>
                </Card>
                <Card>
                    <CardTitle className="text-center">
                        <Typography variant={'title'}>
                            Configurations
                        </Typography>
                    </CardTitle>
                    <CardContent className="flex justify-around">
                        <Spinner />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
