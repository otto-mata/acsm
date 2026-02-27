'use client';
import { LoadScreen } from '@/components/LoadScreen';
import { Typography } from '@/components/Typography';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    FieldDescription,
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
import { Spinner } from '@/components/ui/spinner';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Role } from '@/config/routePermissions';
import { useAuth } from '@/hooks/useAuth';
import { IUserProfile } from '@/lib/client.models';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconArrowLeft, IconEdit, IconTrash } from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
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

function EditButton({
    id,
    name,
    role,
    editRole,
    open,
    setOpen,
}: {
    id: string;
    name: string;
    role: Role;
    editRole: boolean;
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
}) {
    const form = useForm<z.infer<typeof editFormSchema>>({
        resolver: zodResolver(editFormSchema),
        defaultValues: {
            name,
            role,
        },
    });

    const onSubmitEditForm = async (data: z.infer<typeof editFormSchema>) => {
        const user = await fetch('/api/users/' + id, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
        if (user.ok) {
            toast.success('Successfully updated user ' + id, {
                richColors: true,
                position: 'top-center',
            });
            setOpen(false);
        } else {
            toast.error("Could not update user's informations", {
                richColors: true,
                position: 'top-center',
            });
            form.reset();
        }
    };
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <form id="edit-form" onSubmit={form.handleSubmit(onSubmitEditForm)}>
                <DialogTrigger>
                    <Button type="button">
                        <IconEdit />
                        Edit
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit user</DialogTitle>
                        <DialogDescription>
                            <p>Make changes to a user's profile.</p>
                            <p>ID: {id}</p>
                        </DialogDescription>
                    </DialogHeader>
                    <FieldGroup>
                        <Controller
                            name="name"
                            control={form.control}
                            render={({ field, fieldState }) => {
                                return (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="name">
                                            Name
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            id="name"
                                            aria-invalid={fieldState.invalid}
                                            placeholder="Account name"
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
                                if (!editRole) {
                                    field.disabled = true;
                                    field.value = role;
                                    return <></>;
                                }
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
                                        <FieldDescription>
                                            Admins can access everything,
                                            operators can edit and launch jobs
                                            and viewers can only check for jobs
                                            result.
                                        </FieldDescription>
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
                        <Button type="submit" form="edit-form">
                            Save changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    );
}

function DeleteButton({
    id,
    open,
    setOpen,
    disabled,
}: {
    id: string;
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    disabled: boolean;
}) {
    const router = useRouter();
    if (disabled) {
        return (
            <Tooltip>
                <TooltipTrigger>
                    <Button type="button" disabled={disabled}>
                        <IconTrash />
                        Delete
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    You cannot delete your own account.
                </TooltipContent>
            </Tooltip>
        );
    }
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger disabled={disabled}>
                <Button type="button" disabled={disabled}>
                    <IconTrash />
                    Delete
                </Button>
            </DialogTrigger>
            <DialogContent showCloseButton={false}>
                <DialogTitle>Delete User</DialogTitle>
                <DialogDescription>
                    This action is permanent and cannot be undone.
                </DialogDescription>
                <DialogFooter>
                    <DialogClose>
                        <Button type="button" variant={'secondary'}>
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button
                        variant={'destructive'}
                        onClick={async () => {
                            const user = await fetch('/api/users/' + id, {
                                method: 'DELETE',
                            });
                            if (user.ok) {
                                toast.success(
                                    'Successfully deleted user ' + id,
                                    {
                                        richColors: true,
                                        position: 'top-center',
                                    },
                                );
                                router.back();
                            } else {
                                toast.error('Could not delete user', {
                                    description: user.statusText,
                                    richColors: true,
                                    position: 'top-center',
                                });
                            }
                        }}
                    >
                        Delete account
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
    const [userData, setUser] = useState<IUserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const [editModalMode, setEditModal] = useState(false);
    const [deleteModalMode, setDeleteModal] = useState(false);
    const [pageID, setPageID] = useState('');

    const { user, isLoading } = useAuth();

    useEffect(() => {
        const hook = async () => {
            const { id } = await params;
            const userdata = await fetch('/api/users/' + id);
            if (!userdata.ok) {
                toast.error('No user with ID ' + id, {
                    richColors: true,
                    position: 'top-center',
                });
                setTimeout(() => {
                    router.back();
                }, 1000);
            } else {
                const data = await userdata.json();
                setUser(data);
                setPageID(data.id);
            }
            setLoading(false);
        };
        if (!editModalMode) hook();
    }, [params, loading, editModalMode]);

    if (loading || isLoading || user === null || userData === null) {
        return <LoadScreen />;
    }

    return (
        <div>
            <div className="flex flex-col gap-8 m-aut">
                <Link href="/users">
                    <Button>
                        <IconArrowLeft /> Back to users list
                    </Button>
                </Link>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex justify-end cursor">
                            <div className="flex gap-1">
                                <EditButton
                                    editRole={pageID !== user.id}
                                    id={pageID}
                                    name={userData.name}
                                    role={userData.role}
                                    open={editModalMode}
                                    setOpen={setEditModal}
                                />
                                <DeleteButton
                                    id={pageID}
                                    setOpen={setDeleteModal}
                                    open={deleteModalMode}
                                    disabled={pageID === user.id}
                                />
                            </div>
                        </CardTitle>
                    </CardHeader>
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
            </div>
        </div>
    );
}
