'use client';
import { JobCreateButton } from '@/components/jobs/JobCreateForm';
import { JobTable } from '@/components/jobs/JobTable';
import { LoadScreen } from '@/components/LoadScreen';
import { TypographyH1 } from '@/components/Typography';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { CreateJobParams, type JobType } from '@/lib/validation/jobs/create';
import { faker } from '@faker-js/faker';
import { IconPlus, IconSeedling } from '@tabler/icons-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

function IntCreateButton() {
    const mutationCreate = useMutation({
        mutationFn: (createParams: CreateJobParams) => {
            return fetch('/api/jobs', {
                method: 'POST',
                body: JSON.stringify(createParams),
            });
        },
        onError: (err) => {
            toast.error('Failed to create job', {
                description: err.message,
            });
        },
        onSuccess: (data) => {
            toast.success('Successfully created a new job', {
                description: (
                    <pre className="bg-code text-code-foreground mt-2 w-[320px] overflow-x-auto rounded-md p-4">
                        <code>{JSON.stringify(data, null, 2)}</code>
                    </pre>
                ),
                position: 'bottom-right',
                classNames: {
                    content: 'flex flex-col gap-2',
                },
                style: {
                    '--border-radius': 'calc(var(--radius)  + 4px)',
                } as React.CSSProperties,
            });
        },
    });
    return (
        <Button
            asChild
            onClick={() => {
                const types: JobType[] = [
                    'file_processing',
                    'scheduled_task',
                    'triggered_task',
                ];
                mutationCreate.mutate({
                    name: faker.word.words(3),
                    description: faker.lorem.sentences(4),
                    script_path: faker.system.filePath(),
                    type: types[Math.floor(Math.random() * types.length)],
                    timeout_secs: faker.number.int({
                        max: 120,
                        min: 0,
                        multipleOf: 5,
                    }),
                    args:
                        Math.random() > 0.5
                            ? null
                            : faker.word
                                  .words({
                                      count: { min: 1, max: 6 },
                                  })
                                  .split(' '),
                    env_vars: null,
                    config: null,
                });
            }}
        >
            <span>
                <IconSeedling />
                Create Random Job
            </span>
        </Button>
    );
}

export default function Page() {
    const { isLoading, user } = useAuth();
    const [open, setOpen] = useState(false);
    const jobsQuery = useQuery({
        queryKey: ['jobs'],
        queryFn: async () => {
            const response = await fetch('/api/jobs');
            return await response.json();
        },
    });

    if (isLoading || !user || jobsQuery.isPending) return <LoadScreen />;
    return (
        <>
            <TypographyH1>Jobs</TypographyH1>
            <div className="flex justify-between">
                {user.role != 'viewer' ? (
                    <Link href="jobs/new">
                        <Button type="button" asChild>
                            <span>
                                <IconPlus />
                                New job
                            </span>
                        </Button>
                    </Link>
                ) : (
                    <div />
                )}
                <IntCreateButton></IntCreateButton>
            </div>
            <JobTable user={user} jobs={jobsQuery.data.data}></JobTable>
        </>
    );
}
