'use client';
import { LoadScreen } from '@/components/LoadScreen';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { IUserProfile } from '@/lib/client.models';
import { useEffect, useState } from 'react';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
    const [user, setUser] = useState<IUserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

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

    if (loading) {
        return <LoadScreen />;
    }

    return (
        <Card>
            <CardContent className="flex justify-around">
                {user ? (
                    <>
                        <Badge>{user.role}</Badge>
                        <span>{user.name}</span>
                        <span>{user.email}</span>
                    </>
                ) : (
                    <Spinner />
                )}
            </CardContent>
        </Card>
    );
}
