'use client';

import { IJobDetails, IUserProfile } from '@/lib/client.models';

import Link from 'next/link';
import { Button } from '../ui/button';
import { Spinner } from '../ui/spinner';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../ui/table';

export function JobTable({
    jobs,
    user,
}: {
    jobs: IJobDetails[];
    user: IUserProfile;
}) {
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
