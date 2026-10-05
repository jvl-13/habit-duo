'use-client';

import { CheckCircle2 } from "lucide-react";

export function ProgressCard() {
    const completed = 2;
    const total = 3;
    const percentage = Math.round(
        (completed / total) * 100,
    );

    return (
        <section className="rounded-2xl border bg-background p-6 shadow-sm">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">
                        Today Progress
                    </p>

                    <h2 className="mt-2 text-3xl font-bold">
                        {completed}
                        <span className="text-muted-foreground">
                            {' '}
                            / {total}
                        </span>
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                        habits completed
                    </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <CheckCircle2 className="h-5 w-5" />
                </div>
            </div>

            <div className="mt-6">
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary transition-all"
                        style={{
                            width: `${percentage}%`,
                        }} 
                    />
                </div>

                <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                    <span>
                        {percentage} %completed
                    </span>

                    <span>
                        {total - completed} remaining
                    </span>
                </div>
            </div>
        </section>
    )
}