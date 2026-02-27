'use client';

import { IUserProfile } from '@/lib/client.models';

import {
    Table,
    TableCaption,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from './ui/table';
import { Typography } from './Typography';
import { Badge } from './ui/badge';
import { useRouter } from 'next/navigation';

export function UserTable({ users }: { users: IUserProfile[] }) {
    const router = useRouter();
    return (
        <Table>
            <TableCaption>Registered users</TableCaption>
            <TableHeader>
                <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {users.map((user) => (
                    <TableRow
                        onClick={() => {
                            router.push('/users/' + user.id);
                        }}
                    >
                        <TableCell>
                            <Typography variant="code">{user.id}</Typography>
                        </TableCell>
                        <TableCell>
                            <Badge variant={'outline'}>{user.role}</Badge>
                        </TableCell>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
