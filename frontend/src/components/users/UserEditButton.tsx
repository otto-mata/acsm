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
import { Role } from '@/config/routePermissions';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconEdit } from '@tabler/icons-react';
import { Dispatch, SetStateAction } from 'react';
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

export function UserEditButton({
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
                <DialogTrigger asChild>
                    <Button type="button" variant="outline">
                        Edit
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit user</DialogTitle>
                        <DialogDescription>
                            Make changes to a user's profile.
                            <br />
                            ID: {id}
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
