'use client';

import { type Icon } from '@tabler/icons-react';
import { usePathname } from 'next/navigation';

import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '../ui/collapsible';
import { ChevronDown } from 'lucide-react';

export interface Item {
    title: string;
    url: string;
    icon?: Icon;
}

export interface ItemWithOptions {
    title: string;
    icon?: Icon;
    options: Item[];
}

export function NavMain({ items }: { items: ItemWithOptions[] }) {
    const pathname = usePathname();

    return (
        <SidebarGroup>
            <SidebarGroupContent className="flex flex-col gap-2">
                <SidebarMenu>
                    {items.map((item) => (
                        <Collapsible
                            key={item.title}
                            defaultOpen
                            className="group/collapsible"
                        >
                            <SidebarGroup>
                                <SidebarGroupLabel asChild>
                                    <CollapsibleTrigger>
                                        {item.title}
                                        <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                                    </CollapsibleTrigger>
                                </SidebarGroupLabel>
                                <CollapsibleContent>
                                    <SidebarGroupContent>
                                        {item.options.map((option) => (
                                            <SidebarMenuItem
                                                key={option.title + option.url}
                                            >
                                                <SidebarMenuButton
                                                    tooltip={option.title}
                                                    isActive={
                                                        pathname === option.url
                                                    }
                                                    asChild
                                                >
                                                    <Link href={option.url}>
                                                        {option.icon && (
                                                            <option.icon />
                                                        )}
                                                        <span>
                                                            {option.title}
                                                        </span>
                                                    </Link>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        ))}
                                    </SidebarGroupContent>
                                </CollapsibleContent>
                            </SidebarGroup>
                        </Collapsible>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
