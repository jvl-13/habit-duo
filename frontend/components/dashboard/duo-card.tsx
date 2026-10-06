import { useAuth } from '@/lib/auth/auth-context';
import { useMyDuo } from '@/lib/queries/duo-queries';
import {
    MoreHorizontal,
    UserRound,
} from 'lucide-react';
import { useEffect, useState } from 'react';

export function DuoCard() {
    const { user } = useAuth();

    const {
        data: duo,
        isLoading,
        isError,
    } = useMyDuo();

    const [now, setNow] = useState<number | null>(null);

    useEffect(() => {
        setNow(Date.now());

        const interval = setInterval(() => {
            setNow(Date.now());
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    if (isLoading) {
        return (
            <section className='rounded-2xl border bg-background p-6 shadow-sm'>
                <div className='h-5 w-24 animate-pulse rounded bg-muted' />

                <div className='mt-6 h-16 animate-pulse rounded bg-muted' />
            </section>
        )
    }

    if (isError) {
        return (
            <section className='rounded-2xl border bg-background p-6 shadow-sm'>
                <p className='text-sm text-destructive'>
                    Failed to load your duo.
                </p>
            </section>
        );
    }

    if (!duo) {
        return (
            <section className='rounded-2xl border bg-background p-6 shadow-sm'>
                <p className='text-sm text-muted-foreground'>
                    Your Duo
                </p>

                <h2 className='mt-1 text-lg font-semibold'>
                    No partner yet.
                </h2>

                <p className='mt-2 text-sm text-muted-foreground'>
                    Invite someone to start building habits together.
                </p>

                <button className='mt-5 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground'>
                    Invite a partner
                </button>
            </section>
        )
    }

    const partner = duo.members.find(
        (member) => member.userId !== user?.id, 
    );

    if (!partner) {
        return null;
    }

    const isOnline = now !== null &&
    partner.user.lastSeenAt !== null &&
    now -
      new Date(
        partner.user.lastSeenAt,
      ).getTime() <
      60_000;
    
    return (
        <section className="rounded-2xl border bg-background p-6 shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">
                        Your Duo
                    </p>

                    <h2 className="mt-1 text-lg font-semibold">
                        Partner
                    </h2>
                </div>

                <button className="rounded-md p-2 hover:bg-muted">
                    <MoreHorizontal className="h-5 w-5" />
                </button>
            </div>

            <div className="mt-5 flex items-center gap-4">
                <div className="relative">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                        {partner.user.avatarUrl ? (
                            <img
                                src={partner.user.avatarUrl}
                                alt={partner.user.name}
                                className='h-full w-full object-cover'
                            />
                        ) : (
                            <UserRound className="h-6 w-6" />
                        )}     
                    </div>

                    <span className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-background ${
                        isOnline
                            ? 'bg-green-500'
                            : 'bg-muted-foreground'}`}
                    />
                </div>

                <div>
                    <p className="font-medium">
                        {partner.user.name}
                    </p>

                    <p className={`text-sm ${
                        isOnline
                            ? 'text-green-600'
                            : 'text-muted-foreground'}`}>
                        {isOnline ? 'Online' : 'Offline'}
                    </p>
                </div>
            </div>

            {/* <div className="mt-6 rounded-xl bg-muted/50 p-4">
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                        Today progress
                    </span>

                    <span className="font-medium">
                        2 / 3
                    </span>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                        className="h-full w-2/3 rounded-full bg-primary"
                    />
                </div>
            </div> */}

            <button className="mt-4 w-full rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted">
                Poke {partner.user.name}
            </button>
        </section>
    );
}