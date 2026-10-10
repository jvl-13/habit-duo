'use client';

import { useState, type FormEvent } from 'react';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import {
    useHabits,
    useCreateHabit,
    useUpdateHabit,
    useDeleteHabit,
} from '@/lib/queries/habit-queries';
import { Pencil, Trash2 } from 'lucide-react';

function todayAsDateInput() {
    const now = new Date();
    const localDate = new Date(
        now.getTime() - now.getTimezoneOffset() * 60_000,
    );

    return localDate.toISOString().slice(0, 10);
}

export default function HabitsPage() {
    return (
        <ProtectedRoute>
            <DashboardLayout>
                <HabitsContent />
            </DashboardLayout>
        </ProtectedRoute>
    );
}

function HabitsContent() {
    const {
        data: habits = [],
        isLoading,
        isError,
        refetch,
    } = useHabits();

    const createHabit = useCreateHabit();

    const updateHabit = useUpdateHabit();
    const deleteHabit = useDeleteHabit();

    const [editingId, setEditingId] = useState<string | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<{
        id: string;
        name: string;
    } | null>(null);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [deadline, setDeadline] = useState('');
    const [startDate, setStartDate] = useState(todayAsDateInput());
    const [formError, setFormError] = useState('');

    const activeHabits = habits.filter((habit) => habit.isActive);

    function handleEdit(habit: (typeof habits)[number]) {
        setEditingId(habit.id);
        setName(habit.name);
        setDescription(habit.description ?? '');
        setDeadline(habit.deadline ?? '');
        setStartDate(habit.startDate.slice(0, 10));
        setFormError('');

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setFormError('');

        const trimmedName = name.trim();
        const trimmedDescription = description.trim();

        if (!trimmedName) {
            setFormError('Please enter a habit name.');
            return;
        }

        if (!startDate) {
            setFormError('Please choose a start date.');
            return;
        }

        const payload = {
            name: trimmedName,
            description: trimmedDescription,
            deadline,
            startDate,
        };

        try {
            if (editingId) {
                await updateHabit.mutateAsync({
                    id: editingId,
                    data: {
                        ...payload,
                        description: trimmedDescription,
                        deadline,
                    },
                });
            } else {
                await createHabit.mutateAsync({
                    name: trimmedName,
                    description: trimmedDescription || undefined,
                    deadline: deadline || undefined,
                    startDate,
                });
            }

            setEditingId(null);
            setName('');
            setDescription('');
            setDeadline('');
            setStartDate(todayAsDateInput());
        } catch (error) {
            setFormError(
                error instanceof Error
                    ? error.message
                    : 'Failed to save habit. Please try again.',
            );
        }
    }

    return (
        <div className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6 lg:px-8">
            <header>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    My Habits
                </h1>
                <p className="mt-2 text-muted-foreground">
                    Build consistent routines, one day at a time.
                </p>
            </header>

            <section className="rounded-2xl border bg-background p-5 shadow-sm sm:p-6">
                <h2 className="text-lg font-semibold">
                    {editingId ? 'Edit habit' : 'Create a new habit'}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Choose a habit and set a daily deadline if you need one.
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                    <div className="space-y-2">
                        <label htmlFor="habit-name" className="text-sm font-medium">
                            Habit name <span className="text-destructive">*</span>
                        </label>
                        <input
                            id="habit-name"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            maxLength={100}
                            required
                            placeholder="e.g. Read for 20 minutes"
                            className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                        />
                        <p className="text-right text-xs text-muted-foreground">
                            {name.length}/100
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="habit-description" className="text-sm font-medium">
                            Description
                        </label>
                        <textarea
                            id="habit-description"
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            maxLength={500}
                            rows={3}
                            placeholder="Why is this habit important to you?"
                            className="w-full resize-y rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                        />
                        <p className="text-right text-xs text-muted-foreground">
                            {description.length}/500
                        </p>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                        <div className="space-y-2">
                            <label htmlFor="habit-deadline" className="text-sm font-medium">
                                Daily deadline
                            </label>
                            <input
                                id="habit-deadline"
                                type="time"
                                value={deadline}
                                onChange={(event) => setDeadline(event.target.value)}
                                className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                            />
                            <p className="text-xs text-muted-foreground">
                                Optional. For example, 21:00.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="habit-start-date" className="text-sm font-medium">
                                Start date <span className="text-destructive">*</span>
                            </label>
                            <input
                                id="habit-start-date"
                                type="date"
                                value={startDate}
                                onChange={(event) => setStartDate(event.target.value)}
                                required
                                className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>
                    </div>

                    {formError && (
                        <p role="alert" className="text-sm text-destructive">
                            {formError}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={createHabit.isPending || updateHabit.isPending}
                        className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {createHabit.isPending || updateHabit.isPending
                            ? 'Saving...'
                            : editingId
                                ? 'Save changes'
                                : 'Create habit'}
                    </button>

                    {editingId && (
                        <button
                            type="button"
                            onClick={() => {
                                setEditingId(null);
                                setName('');
                                setDescription('');
                                setDeadline('');
                                setStartDate(todayAsDateInput());
                                setFormError('');
                            }}
                            className="ml-2 rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-muted"
                        >
                            Cancel
                        </button>
                    )}
                </form>
            </section>

            <section>
                <div className="mb-4 flex items-end justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-semibold">Your habits</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {activeHabits.length} active{' '}
                            {activeHabits.length === 1 ? 'habit' : 'habits'}
                        </p>
                    </div>

                    {!isLoading && (
                        <button
                            type="button"
                            onClick={() => void refetch()}
                            className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted"
                        >
                            Refresh
                        </button>
                    )}
                </div>

                {isLoading && (
                    <p className="rounded-xl border p-6 text-sm text-muted-foreground">
                        Loading habits...
                    </p>
                )}

                {isError && (
                    <div className="rounded-xl border border-destructive/30 p-5">
                        <p className="text-sm text-destructive">
                            Failed to load habits.
                        </p>
                        <button
                            type="button"
                            onClick={() => void refetch()}
                            className="mt-3 rounded-lg border px-3 py-2 text-sm"
                        >
                            Try again
                        </button>
                    </div>
                )}

                {!isLoading && !isError && activeHabits.length === 0 && (
                    <div className="rounded-xl border border-dashed p-8 text-center">
                        <h3 className="font-semibold">No habits yet</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Create your first habit using the form above.
                        </p>
                    </div>
                )}

                {!isLoading && !isError && activeHabits.length > 0 && (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {activeHabits.map((habit) => (
                            <article
                                key={habit.id}
                                className="rounded-2xl border bg-background p-5 shadow-sm"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <h3 className="font-semibold">{habit.name}</h3>
                                    <span className="shrink-0 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                                        Active
                                    </span>
                                </div>

                                <div className="mt-4 flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleEdit(habit)}
                                        className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted"
                                    >
                                        <Pencil className="h-4 w-4" />
                                        Edit
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setDeleteTarget({
                                            id: habit.id,
                                            name: habit.name,
                                        })}
                                        className="inline-flex items-center gap-2 rounded-lg border border-destructive/30 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/5"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Delete
                                    </button>

                                    {deleteTarget && (
                                        <div
                                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
                                            role="presentation"
                                            onMouseDown={(event) => {
                                                if (event.target === event.currentTarget) {
                                                    setDeleteTarget(null);
                                                }
                                            }}
                                        >
                                            <div
                                                role="alertdialog"
                                                aria-modal="true"
                                                aria-labelledby="delete-habit-title"
                                                className="w-full max-w-md rounded-2xl border bg-background p-6 shadow-xl"
                                            >
                                                <h2 id="delete-habit-title" className="text-lg font-semibold">
                                                    Delete habit?
                                                </h2>

                                                <p className="mt-2 text-sm text-muted-foreground">
                                                    Are you sure you want to delete `${deleteTarget.name}`?
                                                    The habit will no longer appear in your active habits.
                                                </p>

                                                {deleteHabit.isError && (
                                                    <p role="alert" className="mt-3 text-sm text-destructive">
                                                        {deleteHabit.error instanceof Error
                                                            ? deleteHabit.error.message
                                                            : 'Failed to delete habit.'}
                                                    </p>
                                                )}

                                                <div className="mt-6 flex justify-end gap-3">
                                                    <button
                                                        type="button"
                                                        disabled={deleteHabit.isPending}
                                                        onClick={() => setDeleteTarget(null)}
                                                        className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
                                                    >
                                                        Cancel
                                                    </button>

                                                    <button
                                                        type="button"
                                                        disabled={deleteHabit.isPending}
                                                        onClick={async () => {
                                                            try {
                                                                await deleteHabit.mutateAsync(deleteTarget.id);
                                                                setDeleteTarget(null);

                                                                if (editingId === deleteTarget.id) {
                                                                    setEditingId(null);
                                                                    setName('');
                                                                    setDescription('');
                                                                    setDeadline('');
                                                                    setStartDate(todayAsDateInput());
                                                                }
                                                            } catch {
                                                                // Error is shown in the confirmation dialog.
                                                            }
                                                        }}
                                                        className="rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                                                    >
                                                        {deleteHabit.isPending ? 'Deleting...' : 'Delete habit'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <p className="mt-2 min-h-10 whitespace-pre-wrap break-words text-sm text-muted-foreground">
                                    {habit.description || 'No description'}
                                </p>

                                <div className="mt-4 space-y-2 border-t pt-4 text-sm">
                                    <p className="flex justify-between gap-3">
                                        <span className="text-muted-foreground">Frequency</span>
                                        <span>Daily</span>
                                    </p>
                                    <p className="flex justify-between gap-3">
                                        <span className="text-muted-foreground">Deadline</span>
                                        <span>{habit.deadline || 'Not set'}</span>
                                    </p>
                                    <p className="flex justify-between gap-3">
                                        <span className="text-muted-foreground">Starts</span>
                                        <span>{habit.startDate.slice(0, 10)}</span>
                                    </p>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}