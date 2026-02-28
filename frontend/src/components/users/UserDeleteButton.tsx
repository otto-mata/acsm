'use client';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useRouter } from 'next/navigation';
import { Dispatch, SetStateAction } from 'react';
import { toast } from 'sonner';

export function UserDeleteButton({
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
                <TooltipTrigger asChild>
                    <Button type="button" variant="destructive" disabled>
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
            <DialogTrigger asChild>
                <Button type="button" variant="destructive">
                    Delete
                </Button>
            </DialogTrigger>
            <DialogContent showCloseButton={false}>
                <DialogTitle>Delete User</DialogTitle>
                <DialogDescription>
                    This action is permanent and cannot be undone.
                </DialogDescription>
                <DialogFooter>
                    <DialogClose asChild>
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
