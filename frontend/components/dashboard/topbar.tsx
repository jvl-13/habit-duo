'use client';

import { useAuth } from "@/lib/auth/auth-context";
import { LogOut, Menu } from "lucide-react";
import { NotificationBell } from "./notification-bell";

export function Topbar() {
    const { user, logout } = useAuth();

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
                {/* <button className="relative rounded-full p-2 hover:bg-muted" aria-label="Notifications">
                    <Bell className="h-5 w-5" />
                    <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary" />
                </button> */}

                <NotificationBell />

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

                <button
                    type="button"
                    onClick={() => void logout()}
                    title="Log out"
                    aria-label="Log out"
                    className="group flex h-10 w-10 items-center justify-center rounded-xl border border-transparent text-muted-foreground transition-all duration-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 dark:hover:border-red-900 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                >
                    <LogOut className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5" />
                </button>
            </div>
        </header>
    )
}