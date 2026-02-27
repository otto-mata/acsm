'use client';
import { LoadScreen } from '@/components/LoadScreen';
import { Typography } from '@/components/Typography';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { IUserProfile } from '@/lib/client.models';
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Page() {
    const { user, isLoading } = useAuth();
    const [users, setUsers] = useState<IUserProfile[]>([]);
    useEffect(() => {
        const usersHook = async () => {
            const data = await fetch('/api/users');
            if (data.ok) setUsers(await data.json());
        };
        usersHook();
    }, []);
    if (isLoading) return <LoadScreen />;
    return (
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
                <Card className="m-auto text-nowrap w-full h-full hover:bg-accent hover:cursor-pointer">
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
    );
}
