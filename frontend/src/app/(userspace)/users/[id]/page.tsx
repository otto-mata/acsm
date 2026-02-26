'use client';
import { LoadScreen } from '@/components/LoadScreen';
import { Badge } from '@/components/ui/badge';
import { Card, CardAction, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/hooks/useAuth';
import { IUserProfile } from '@/lib/client.models';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
    const { isLoading } = useAuth();
    const router = useRouter();
    const [userData, setUser] = useState<IUserProfile | null>(null);
    const [id, setId] = useState<string>('');
    useEffect(() => {
        const idhook = async () => {
            const { id: sId } = await params;
            setId(sId);
            return true;
        };
        const userhook = async () => {
            const data = await fetch('/api/users/' + id);
            if (data.ok) setUser(await data.json());
        };
        idhook().then(() => {
            userhook();
        });
    }, []);
    if (isLoading) return <LoadScreen />;
    console.log(id);
    return (
        <Card>
            <CardContent className="flex justify-around">
                {userData ? (
                    <>
                        <Badge>{userData.role}</Badge>
                        <span>{userData.name}</span>
                        <span>{userData.email}</span>
                    </>
                ) : (
                    <Spinner />
                )}
            </CardContent>
        </Card>
    );
}
