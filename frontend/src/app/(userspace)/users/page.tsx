'use client';
import { LoadScreen } from '@/components/LoadScreen';
import { ModalDialog } from '@/components/Modal';
import { Typography } from '@/components/Typography';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from '@/components/ui/card';
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { IUserProfile } from '@/lib/client.models';
import { Plus } from 'lucide-react';
import { ReactNode, useEffect, useState } from 'react';

export default function Page() {
    const { isLoading } = useAuth();
    const [users, setUsers] = useState<IUserProfile[]>([]);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const formAction = async (formData: FormData) => {};
    const roles = ['admin', 'operator', 'viewer'];

    useEffect(() => {
        const usersHook = async () => {
            const data = await fetch('/api/users');
            if (data.ok) setUsers(await data.json());
        };
        usersHook();
    }, []);
    if (isLoading) return <LoadScreen />;
    return (
        <div>
            {createModalOpen ? (
                <ModalDialog setCreateModalOpen={setCreateModalOpen}>
                    <CardHeader>
                        <Typography variant={'title'} className="text-center">
                            Create a new user
                        </Typography>
                    </CardHeader>
                    <form action={formAction} className="flex flex-col gap-6">
                        <CardContent className="flex flex-col gap-2">
                            <Input
                                type="email"
                                placeholder="Email"
                                name="email"
                            />
                            <Input
                                type="text"
                                placeholder="Account name"
                                name="name"
                            />
                            <Input
                                type="password"
                                placeholder="Password"
                                name="password"
                            />
                            <Combobox items={roles}>
                                <ComboboxInput placeholder="Select a role" />
                                <ComboboxContent>
                                    <ComboboxEmpty>
                                        No items found.
                                    </ComboboxEmpty>
                                    <ComboboxList>
                                        {(item) => (
                                            <ComboboxItem
                                                key={item}
                                                value={item}
                                            >
                                                {item}
                                            </ComboboxItem>
                                        )}
                                    </ComboboxList>
                                </ComboboxContent>
                            </Combobox>
                        </CardContent>
                        <CardFooter className="m-auto">
                            <Button type="submit">Create</Button>
                        </CardFooter>
                    </form>
                </ModalDialog>
            ) : (
                <></>
            )}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 2xl:grid-cols-3 w-3/4 m-auto">
                {users.map((user) => (
                    <div key={user.id}>
                        <a className="flex" href={'/users/' + user.id}>
                            <Card className="m-auto text-nowrap w-full hover:bg-accent">
                                <CardHeader className="flex justify-between">
                                    <Badge>{user.role}</Badge>
                                    <Typography variant={'label'}>
                                        {user.id}
                                    </Typography>
                                </CardHeader>
                                <CardContent className="flex flex-col justify-around">
                                    <Typography variant="title">
                                        {user.name}
                                    </Typography>
                                    <Typography variant="subtitle">
                                        {user.email}
                                    </Typography>
                                </CardContent>
                                <CardFooter></CardFooter>
                            </Card>
                        </a>
                    </div>
                ))}
                <div className="flex">
                    <Card
                        className="m-auto text-nowrap w-full h-full hover:bg-accent hover:cursor-pointer"
                        onClick={() => {
                            setCreateModalOpen(true);
                        }}
                    >
                        <CardContent className="flex flex-col justify-around h-full">
                            <div className="m-auto flex flex-col gap-4 items-center">
                                <Typography variant="title">
                                    Create new user
                                </Typography>
                                <Plus></Plus>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
