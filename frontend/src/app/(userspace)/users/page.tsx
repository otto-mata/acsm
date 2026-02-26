'use client';
import { LoadScreen } from '@/components/LoadScreen';
import { Badge } from '@/components/ui/badge';
import { Card, CardAction, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { IUserProfile } from '@/lib/client.models';
import { BookUserIcon } from 'lucide-react';
import Link from 'next/link';
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
        <div className="lg:max-w-1/3 flex flex-col align-middle m-auto">
            {users.map((user) => (
                <Card key={user.id}>
                    <CardContent className="flex justify-around">
                        <Badge>{user.role}</Badge>
                        <span>{user.name}</span>
                        <span>{user.email}</span>
                        <Link href={'users/' + user.id}>
                            <BookUserIcon />
                        </Link>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
