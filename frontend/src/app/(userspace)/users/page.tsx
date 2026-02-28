'use client';
import { LoadScreen } from '@/components/LoadScreen';
import { TypographyH1 } from '@/components/Typography';
import { UserCreateButton } from '@/components/users/UserCreateButton';
import { UserTable } from '@/components/users/UserTable';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

export default function Page() {
    const { isLoading } = useAuth();
    const [createModalOpen, setCreateModalOpen] = useState(false);

    const { isPending, error, data, isFetching } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const response = await fetch('/api/users');
            return await response.json();
        },
    });

    if (isLoading || isPending) return <LoadScreen />;
    return (
        <>
            <TypographyH1>Users</TypographyH1>
            <UserCreateButton
                open={createModalOpen}
                setOpen={setCreateModalOpen}
            />
            <UserTable users={data.data} />
        </>
    );
}
