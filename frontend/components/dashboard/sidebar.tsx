'use client';

import { cn } from '@/lib/utils';
import { Settings, Bell, CheckCircle2, Home, LogOut, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from "next/navigation";

const navigation = [
    {
        label: 'Overview',
        href: '/dashboard',
        icon: Home,
    },
    {
        label: 'My Habits',
        href: '/dashboard/habits',
        icon: CheckCircle2,
    },
    {
        label: 'My Duo',
        href: '/dashboard/duo',
        icon: Users,
    },
    {
        label: 'Activity',
        href: '/dashboard/activity',
        icon: Bell,
    },
];

export function Sidebar(){
    const pathname = usePathname();

    return(
        <aside className="hidden w-64 shrink-0 border-r bg-background md:flex md:flex-col">
            <div className="flex h-16 items-center border-b px-6">
                <Link
                    href='/'
                    className='text-xl font-bold tracking-tight'>
                        Habit DUO
                </Link>
            </div>

            <nav className='flex-1 space-y-1 p-4'>
                {navigation.map((item) => {
                    const Icon = item.icon;

                    const isActive = pathname===item.href;

                    return (
                        <Link 
                        href={item.href}
                        key={item.href}
                        className={cn(
                            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                            isActive 
                            ? 'bg-primary text-primary-foreground' 
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                        )}
                    >
                        <Icon className='h-4 w-4' />
                        {item.label}
                    </Link>);
                })}
            </nav>

            <div className='border-t p-4'>
                <Link
                    href='/dashboard/settings'
                    className='flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground'>
                        <Settings className='h-4 w-4' />
                        Settings 
                </Link>
            </div>
        </aside>
    )
}