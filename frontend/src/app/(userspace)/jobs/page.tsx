'use client';
import { JobCreateButton } from '@/components/jobs/JobCreateForm';
import { LoadScreen } from '@/components/LoadScreen';
import { TypographyH1 } from '@/components/Typography';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

export default function Page() {
    const { isLoading } = useAuth();
    const [open, setOpen] = useState(false);
    const { isPending, error, data, isFetching } = useQuery({
        queryKey: ['jobs'],
        queryFn: async () => {
            const response = await fetch('/api/jobs');
            return await response.json();
        },
    });
    if (isLoading) return <LoadScreen />;
    return (
        <>
            <TypographyH1>Jobs</TypographyH1>
            <JobCreateButton open={open} setOpen={setOpen} />
        </>
    );
}
