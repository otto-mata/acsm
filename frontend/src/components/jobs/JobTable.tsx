'use client';

import { IJobDetails } from '@/lib/client.models';

import { useRouter } from 'next/navigation';
import { TypographyCode, TypographyP } from '../Typography';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../ui/table';
import { Spinner } from '../ui/spinner';
import Link from 'next/link';

export function JobTable({ jobs }: { jobs: IJobDetails[] }) {
    const router = useRouter();
    const kJob = jobs.at(0);
    if (kJob == undefined) return <Spinner></Spinner>;
    const keys = ['ID', 'Name', 'Type', 'Author'];
    return (
        <Table>
            <TableCaption>Created jobs</TableCaption>
            <TableHeader>
                <TableRow>
                    {keys.map((key) => {
                        return (
                            <TableHead className="text-center" key={key}>
                                {key}
                            </TableHead>
                        );
                    })}
                </TableRow>
            </TableHeader>
            <TableBody>
                {jobs.map((job) => (
                    <TableRow key={job.id}>
                        <TableCell className="size-fit">{job.id}</TableCell>
                        <TableCell>{job.name}</TableCell>
                        <TableCell>{job.type}</TableCell>
                        <TableCell className="flex">
                            <Button
                                className="m-auto"
                                variant="outline"
                                asChild
                            >
                                <Link href={'/users/' + job.created_by}>
                                    View Author
                                </Link>
                            </Button>
                        </TableCell>
                        <TableCell>
                            <Button variant="secondary" asChild>
                                <Link href={'/jobs/' + job.id}>
                                    View Details
                                </Link>
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
