'use client';

import { NavigationMenu } from '@/components/ui/navigation-menu';

export default function UserSpaceLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <NavigationMenu></NavigationMenu>
            {children}
        </>
    );
}
