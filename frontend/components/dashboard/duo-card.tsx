
'use client';

import { useEffect, useState, type FormEvent } from 'react';
import {
    MoreHorizontal,
    UserRound,
    Loader2,
    MailPlus,
    CheckCircle2,
} from 'lucide-react';

import { useAuth } from '@/lib/auth/auth-context';
import { useSocket } from '@/lib/socket/socket-provider';

import {
    useMyDuo,
    useInvitePartner,
    useAcceptDuoInvitation,
    useRejectDuoInvitation,
} from '@/lib/queries/duo-queries';

interface PresenceData {
    userId: string;
    isOnline: boolean;
    lastSeenAt: string | null;
}

export function DuoCard() {
    const { user } = useAuth();
    const { socket } = useSocket();

    const {
        data: duo,
        isLoading,
        isError,
    } = useMyDuo();

    const {
        mutate: invitePartner,
        isPending: isInviting,
        isSuccess: inviteSuccess,
        error: inviteError,
        reset: resetInvite,
    } = useInvitePartner();

    const {
        mutate: acceptInvitation,
        isPending: isAccepting,
        error: acceptError,
    } = useAcceptDuoInvitation();

    const {
        mutate: rejectInvitation,
        isPending: isRejecting,
        error: rejectError,
    } = useRejectDuoInvitation();

    const isResponding = isAccepting || isRejecting;

    const [now, setNow] = useState<number | null>(null);
    const [email, setEmail] = useState('');
    const [presence, setPresence] = useState<PresenceData | null>(null);

    // Find the partner only when the Duo is active.
    const partnerUserId =
        duo?.status === 'ACTIVE'
            ? duo.members.find(
                  (member) => member.userId !== user?.id,
              )?.userId ?? null
            : null;

    // Keep the current time available for the last-seen fallback.
    useEffect(() => {
        setNow(Date.now());

        const interval = setInterval(() => {
            setNow(Date.now());
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    // Listen for real-time presence events from Socket.IO.
    useEffect(() => {
        setPresence(null);

        if (!socket || !partnerUserId) {
            return;
        }

        const handlePresence = (data: PresenceData) => {
            if (data.userId !== partnerUserId) {
                return;
            }

            setPresence(data);
        };

        socket.on('presence:status', handlePresence);
        socket.on('presence:update', handlePresence);

        return () => {
            socket.off('presence:status', handlePresence);
            socket.off('presence:update', handlePresence);
        };
    }, [socket, partnerUserId]);

    const handleInvite = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const normalizedEmail = email.trim().toLowerCase();

        if (!normalizedEmail) {
            return;
        }

        resetInvite();
        invitePartner({ email: normalizedEmail });
    };

    if (isLoading) {
        return (
            <section className="rounded-2xl border bg-background p-6 shadow-sm">
                <div className="h-5 w-24 animate-pulse rounded bg-muted" />
                <div className="mt-6 h-16 animate-pulse rounded bg-muted" />
            </section>
        );
    }

    if (isError) {
        return (
            <section className="rounded-2xl border bg-background p-6 shadow-sm">
                <p className="text-sm text-destructive">
                    Failed to load your duo.
                </p>
            </section>
        );
    }

    // No duo, or a previous duo has ended/rejected.
    if (
        !duo ||
        duo.status === 'ENDED' ||
        duo.status === 'REJECTED'
    ) {
        return (
            <section className="rounded-2xl border bg-background p-6 shadow-sm">
                <p className="text-sm text-muted-foreground">
                    Your Duo
                </p>

                <h2 className="mt-1 text-lg font-semibold">
                    {duo?.status === 'ENDED' ||
                    duo?.status === 'REJECTED'
                        ? 'Ready for a new Duo?'
                        : 'No partner yet.'}
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                    Invite a friend to build habits and keep each other
                    accountable.
                </p>

                <form
                    onSubmit={handleInvite}
                    className="mt-5 space-y-3"
                >
                    <label
                        htmlFor="partner-email"
                        className="block text-sm font-medium"
                    >
                        Partner email
                    </label>

                    <input
                        id="partner-email"
                        type="email"
                        required
                        value={email}
                        onChange={(event) => {
                            setEmail(event.target.value);

                            if (inviteSuccess || inviteError) {
                                resetInvite();
                            }
                        }}
                        placeholder="friend@example.com"
                        disabled={isInviting}
                        className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                    />

                    <button
                        type="submit"
                        disabled={isInviting || !email.trim()}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isInviting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <MailPlus className="h-4 w-4" />
                        )}

                        {isInviting
                            ? 'Sending invitation...'
                            : 'Invite a partner'}
                    </button>
                </form>

                {inviteSuccess && (
                    <p className="mt-3 flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle2 className="h-4 w-4" />
                        Invitation sent successfully.
                    </p>
                )}

                {inviteError && (
                    <p className="mt-3 text-sm text-destructive">
                        {inviteError instanceof Error
                            ? inviteError.message
                            : 'Failed to send invitation.'}
                    </p>
                )}
            </section>
        );
    }

    // Handle pending invitations.
    if (duo.status === 'PENDING') {
        const inviter = duo.members.find(
            (member) => member.role === 'INVITER',
        );

        const invitee = duo.members.find(
            (member) => member.role === 'INVITEE',
        );

        const isInviter = inviter?.userId === user?.id;
        const isInvitee = invitee?.userId === user?.id;

        const otherMember = duo.members.find(
            (member) => member.userId !== user?.id,
        );

        return (
            <section className="rounded-2xl border bg-background p-6 shadow-sm">
                <p className="text-sm font-medium text-muted-foreground">
                    Your Duo
                </p>

                <h2 className="mt-1 text-lg font-semibold">
                    Invitation pending
                </h2>

                {isInviter ? (
                    <p className="mt-2 text-sm text-muted-foreground">
                        Your invitation is waiting for your friend to respond.
                    </p>
                ) : isInvitee ? (
                    <>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {inviter?.user.name ?? 'Your friend'} invited you
                            to build habits together.
                        </p>

                        <div className="mt-5 flex gap-3">
                            <button
                                type="button"
                                disabled={isResponding}
                                onClick={() => acceptInvitation(duo.id)}
                                className="flex flex-1 items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isAccepting ? 'Accepting...' : 'Accept'}
                            </button>

                            <button
                                type="button"
                                disabled={isResponding}
                                onClick={() => rejectInvitation(duo.id)}
                                className="flex flex-1 items-center justify-center rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isRejecting ? 'Rejecting...' : 'Reject'}
                            </button>
                        </div>

                        {acceptError && (
                            <p className="mt-3 text-sm text-destructive">
                                {acceptError instanceof Error
                                    ? acceptError.message
                                    : 'Failed to accept invitation.'}
                            </p>
                        )}

                        {rejectError && (
                            <p className="mt-3 text-sm text-destructive">
                                {rejectError instanceof Error
                                    ? rejectError.message
                                    : 'Failed to reject invitation.'}
                            </p>
                        )}
                    </>
                ) : (
                    <p className="mt-2 text-sm text-muted-foreground">
                        You are not listed as a member of this invitation.
                    </p>
                )}

                {otherMember && isInviter && (
                    <p className="mt-3 text-sm text-muted-foreground">
                        Invited: {otherMember.user.name}
                    </p>
                )}
            </section>
        );
    }

    // Show the active partner.
    const partner = duo.members.find(
        (member) => member.userId !== user?.id,
    );

    if (!partner) {
        return (
            <section className="rounded-2xl border bg-background p-6 shadow-sm">
                <p className="text-sm text-muted-foreground">
                    Your Duo is active, but partner details are unavailable.
                </p>
            </section>
        );
    }

    // Prefer the live WebSocket state.
    // Use lastSeenAt as a fallback before receiving a presence event.
    const isOnline =
        presence?.userId === partner.userId
            ? presence.isOnline
            : now !== null &&
              !!partner.user.lastSeenAt &&
              now - new Date(partner.user.lastSeenAt).getTime() < 60000;

    const lastSeenAt =
        presence?.userId === partner.userId
            ? presence.lastSeenAt
            : partner.user.lastSeenAt;

    const lastSeenLabel = (() => {
        if (isOnline || !lastSeenAt) {
            return null;
        }

        const timestamp = new Date(lastSeenAt).getTime();

        if (Number.isNaN(timestamp)) {
            return null;
        }

        const elapsed = Math.max(0, Date.now() - timestamp);
        const minutes = Math.floor(elapsed / 60000);

        if (minutes < 1) {
            return 'Last seen just now';
        }

        if (minutes < 60) {
            return `Last seen ${minutes} min${minutes === 1 ? '' : 's'} ago`;
        }

        const hours = Math.floor(minutes / 60);

        if (hours < 24) {
            return `Last seen ${hours} hour${hours === 1 ? '' : 's'} ago`;
        }

        const days = Math.floor(hours / 24);

        return `Last seen ${days} day${days === 1 ? '' : 's'} ago`;
    })();

    return (
        <section className="rounded-2xl border bg-background p-6 shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">
                        Your Duo
                    </p>

                    <h2 className="mt-1 text-lg font-semibold">
                        {partner.user.name}
                    </h2>
                </div>

                <button
                    type="button"
                    aria-label="Duo options"
                    className="rounded-md p-2 hover:bg-muted"
                >
                    <MoreHorizontal className="h-5 w-5" />
                </button>
            </div>

            <div className="mt-5 flex items-center gap-4">
                <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary">
                    {partner.user.avatarUrl ? (
                        <img
                            src={partner.user.avatarUrl}
                            alt={partner.user.name}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <UserRound className="h-6 w-6" />
                    )}

                    <span
                        aria-label={isOnline ? 'Online' : 'Offline'}
                        className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-background ${
                            isOnline
                                ? 'bg-green-500'
                                : 'bg-muted-foreground'
                        }`}
                    />
                </div>

                <div>
                    <p className="font-medium">{partner.user.name}</p>

                    <p
                        className={`text-sm ${
                            isOnline
                                ? 'text-green-600'
                                : 'text-muted-foreground'
                        }`}
                    >
                        {isOnline ? 'Online' : 'Offline'}
                    </p>

                    {!isOnline && lastSeenLabel && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            {lastSeenLabel}
                        </p>
                    )}
                </div>
            </div>

            <button
                type="button"
                className="mt-4 w-full rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
            >
                Poke {partner.user.name}
            </button>
        </section>
    );
}
