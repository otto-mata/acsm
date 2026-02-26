'use client';

import { LoadScreen } from '@/components/LoadScreen';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export default function Page() {
    const { user, isLoading, logout } = useAuth();

    if (isLoading) return <LoadScreen />;

    return (
        <div>
            <p>Welcome, {user?.name}!</p>
            <Button onClick={logout}>Sign Out</Button>
        </div>
    );
}
