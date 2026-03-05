'use server';
import { TypographyLarge, TypographyMuted } from '@/components/Typography';
import { Button } from '@/components/ui/button';
import { redirect } from 'next/navigation';

export default async function ForbiddenPage({
    searchParams,
}: {
    searchParams?: { origin?: string };
}) {
    if (searchParams === undefined) redirect('/dashboard');
    const { origin } = await searchParams;
    if (origin === undefined) redirect('/dashboard');
    return (
        <div className="w-full h-full flex">
            <div className="m-auto text-center">
                <TypographyLarge className="text-secondary">
                    403
                </TypographyLarge>
                <TypographyMuted>
                    You are not authorized to access this resource.
                </TypographyMuted>
                <Button variant={'secondary'}>Go back</Button>
            </div>
        </div>
    );
}
