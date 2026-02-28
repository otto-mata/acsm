import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { IconDashboard, IconSettings2, IconUser } from '@tabler/icons-react';
import { Car } from 'lucide-react';
import { NavMain } from './NavMain';
import { NavUser } from './NavUser';
import { useAuth } from '@/hooks/useAuth';
import { LoadScreen } from '../LoadScreen';

const sideBarData = {
    main: [
        {
            title: 'Dashboard',
            url: '/dashboard',
            icon: IconDashboard,
        },
        {
            title: 'Users',
            url: '/users',
            icon: IconUser,
        },
        {
            title: 'Jobs',
            url: '/jobs',
            icon: IconSettings2,
        },
    ],
};

export function AppSidebar() {
    const { user } = useAuth();
    if (user === null) return <LoadScreen />;
    return (
        <Sidebar variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className="data-[slot=sidebar-menu-button]:p-1.5!"
                        >
                            <a href="#">
                                <Car className="size-5!" />
                                <span className="text-base font-semibold">
                                    ACSM
                                </span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={sideBarData.main} />
                <SidebarGroup />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={user} />
            </SidebarFooter>
        </Sidebar>
    );
}
