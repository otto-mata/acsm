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
import { useAuth } from '@/hooks/useAuth';
import {
    IconDashboard,
    IconList,
    IconSettings2,
    IconSparkles,
    IconUser,
} from '@tabler/icons-react';
import { Car } from 'lucide-react';
import { LoadScreen } from '../LoadScreen';
import { ItemWithOptions, NavMain } from './NavMain';
import { NavUser } from './NavUser';

const sideBarData: ItemWithOptions[] = [
    {
        title: 'Dashboard',
        icon: IconDashboard,
        options: [],
    },
    {
        title: 'Users',
        icon: IconUser,
        options: [{ title: 'List Users', url: '/users', icon: IconList }],
    },
    {
        title: 'Jobs',
        icon: IconSettings2,
        options: [
            { title: 'List Jobs', url: '/jobs', icon: IconList },
            { title: 'Create Job', url: '/jobs/new', icon: IconSparkles },
        ],
    },
];

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
                <NavMain items={sideBarData} />
                <SidebarGroup />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={user} />
            </SidebarFooter>
        </Sidebar>
    );
}
