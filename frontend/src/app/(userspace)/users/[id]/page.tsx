'use client';
import { LoadScreen } from '@/components/LoadScreen';
import {
    TypographyH2,
    TypographyH3,
    TypographyP,
} from '@/components/Typography';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { UserDeleteButton } from '@/components/users/UserDeleteButton';
import { UserEditButton } from '@/components/users/UserEditButton';
import { useAuth } from '@/hooks/useAuth';
import { IUserProfile } from '@/lib/client.models';
import { IconArrowLeft } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
    const [userData, setUser] = useState<IUserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const [editModalMode, setEditModal] = useState(false);
    const [deleteModalMode, setDeleteModal] = useState(false);
    const [pageID, setPageID] = useState('');

    const { user, isLoading } = useAuth();

    const { isPending, error, data, isFetching } = useQuery({
        queryKey: ['user'],
        queryFn: async (): Promise<IUserProfile> => {
            const { id } = await params;
            const response = await fetch('/api/users/' + id);
            return (await response.json()).data;
        },
    });
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
                setUser(data.data);
                setPageID(data.data.id);
            }
            setLoading(false);
        };
        if (!editModalMode) hook();
    }, [params, loading, editModalMode]);

    if (isLoading || isPending || !data || !user) {
        return <LoadScreen />;
    }

    return (
        <div>
            <div className="my-2 text-center">
                <TypographyH3>User {data.id}</TypographyH3>
            </div>
            <div className="flex flex-col gap-8 m-aut">
                <div className="flex justify-between">
                    <Link href="/users">
                        <Button asChild>
                            <span>
                                <IconArrowLeft /> Back to users list
                            </span>
                        </Button>
                    </Link>
                    <div className="flex gap-1">
                        <UserEditButton
                            editRole={pageID !== user.id}
                            id={pageID}
                            name={data.name}
                            role={data.role}
                            open={editModalMode}
                            setOpen={setEditModal}
                        />
                        <UserDeleteButton
                            id={pageID}
                            setOpen={setDeleteModal}
                            open={deleteModalMode}
                            disabled={pageID === user.id}
                        />
                    </div>
                </div>
            </div>
            <div>
                <Badge>{data.role}</Badge>
                <TypographyP>{data.name}</TypographyP>
                <TypographyP>{data.email}</TypographyP>
            </div>
        </div>
    );
}
