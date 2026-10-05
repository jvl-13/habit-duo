'use client';

import { useAuth } from "@/lib/auth/auth-context";
import { Bell, Menu } from "lucide-react";

export function Topbar() {
    const {user} = useAuth();

    return (
        <header className="flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
            <button className="rounded-md p-2 hover:bg-muted md:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
            </button>

            <div className="hidden md:block">
                <p className="text-sm text-muted-foreground">
                    Dashboard
                </p>
            </div>

            <div className="ml-auto flex items-center gap-4">
                <button className="relative rounded-full p-2 hover:bg-muted" aria-label="Notifications">
                    <Bell className="h-5 w-5" />
                    <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary" />
                </button>

                <div className="hidden text-right sm:block">
                    <p className="text-sm font-medium">
                        {user?.name ?? 'User'}
                    </p>

                    <p className="text-xs text-muted-foreground">
                        {user?.email}
                    </p>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {user?.name
                    ?.charAt(0)
                    .toUpperCase() ?? 'U'}
                </div>
            </div>
        </header>
    )
}