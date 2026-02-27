'use client';

import { AppSidebar } from '@/components/AppSidebar';
import { LoadScreen } from '@/components/LoadScreen';
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useAuth } from '@/hooks/useAuth';

export default function UserSpaceLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const { user } = useAuth();
    if (user === null) return <LoadScreen />;
    return (
        <TooltipProvider>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <main className="w-full">
                        <SidebarTrigger />
                        <div className="p-8">{children}</div>
                    </main>
                </SidebarInset>
            </SidebarProvider>
        </TooltipProvider>
    );
}
