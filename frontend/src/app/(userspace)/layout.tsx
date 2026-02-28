'use client';

import { AppSidebar } from '@/components/sidebar/AppSidebar';
import { LoadScreen } from '@/components/LoadScreen';
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useAuth } from '@/hooks/useAuth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient();

export default function UserSpaceLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const { user } = useAuth();
    if (user === null) return <LoadScreen />;
    return (
        <QueryClientProvider client={queryClient}>
            <ReactQueryDevtools />
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
        </QueryClientProvider>
    );
}
