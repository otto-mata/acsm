'use client';

import { IApiResponse, IUserProfile } from '@/lib/client.models';

import {
    Table,
    TableCaption,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from '../ui/table';
import { Badge } from '../ui/badge';
import { useRouter } from 'next/navigation';
import { TypographyCode, TypographyP } from '../Typography';
import Link from 'next/link';
import { Button } from '../ui/button';

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
                    <TableRow key={user.id}>
                        <TableCell>
                            <TypographyCode>{user.id}</TypographyCode>
                        </TableCell>
                        <TableCell>
                            <Badge variant={'outline'} asChild>
                                <TypographyP>{user.role}</TypographyP>
                            </Badge>
                        </TableCell>
                        <TableCell>
                            <TypographyP>{user.name}</TypographyP>
                        </TableCell>
                        <TableCell>
                            <TypographyP>{user.email}</TypographyP>
                        </TableCell>
                        <TableCell>
                            <Button
                                onClick={() => {
                                    router.push('/users/' + user.id);
                                }}
                                variant="outline"
                            >
                                View
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
