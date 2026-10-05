import {
    CheckCircle2,
    Bell,
} from 'lucide-react';

const activities = [
    {
        type: 'completed',
        text: 'Sarah completed Morning Workout',
        time: '10 minutes ago',
    },
    {
        type: 'completed',
        text: 'You completed Read 20 minutes',
        time: '1 hour ago',
    },
    {
        type: 'notification',
        text: 'Sarah sent you a poke',
        time: '2 hours ago',
    },
];

export function ActivityCard() {
    return (
        <section className="rounded-2xl border bg-background p-6 shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">
                        Activity
                    </p>

                    <h2 className="mt-1 text-lg font-semibold">
                        Recent activity
                    </h2>
                </div>
            </div>

            <div className="mt-6 space-y-5">
                {activities.map(
                    (activity, index) => {
                        const Icon =
                            activity.type === 'completed'
                                ? CheckCircle2
                                : Bell;

                        return (
                            <div
                                key={index}
                                className="flex gap-3"
                            >
                                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                                    <Icon className="h-4 w-4 text-muted-foreground" />
                                </div>

                                <div>
                                    <p className="text-sm font-medium">
                                        {activity.text}
                                    </p>

                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {activity.time}
                                    </p>
                                </div>
                            </div>
                        );
                    },
                )}
            </div>
        </section>
    );
}