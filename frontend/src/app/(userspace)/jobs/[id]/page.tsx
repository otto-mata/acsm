'use client';
import { LoadScreen } from '@/components/LoadScreen';
import { TypographyH2, TypographySmall } from '@/components/Typography';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';

function ShowJSON({ content }: { content: Record<string, any> }) {
    return (
        <div>
            {Object.entries(content).map((entry) => {
                return (
                    <p key={entry[0]} className="font-mono">
                        <span className="text-accent-foreground">
                            {entry[0]}
                        </span>
                        :&nbsp;
                        <span className="text-primary">{entry[1]}</span>
                    </p>
                );
            })}
        </div>
    );
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
    const { isLoading } = useAuth();
    const { isPending, error, data, isFetching } = useQuery({
        queryKey: ['job_details'],
        queryFn: async () => {
            const { id } = await params;
            const response = await fetch('/api/jobs/' + id);
            return await response.json();
        },
    });
    if (isLoading || isPending) return <LoadScreen />;
    if (isFetching)
        return <TypographySmall>Fetching job details...</TypographySmall>;
    if (error)
        return (
            <>
                <code>{error.message}</code>
                <pre>{error.stack}</pre>
            </>
        );
    return (
        <div className="w-full">
            <TypographyH2>Job {data.data.id}</TypographyH2>
            <ShowJSON content={data.data} />
        </div>
    );
}
