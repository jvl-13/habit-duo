import {
    MoreHorizontal,
    UserRound,
} from 'lucide-react';

export function DuoCard() {
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
                        <UserRound className="h-6 w-6" />
                    </div>

                    <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-background bg-green-500" />
                </div>

                <div>
                    <p className="font-medium">
                        Sarah
                    </p>

                    <p className="text-sm text-green-600">
                        Online
                    </p>
                </div>
            </div>

            <div className="mt-6 rounded-xl bg-muted/50 p-4">
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
            </div>

            <button className="mt-4 w-full rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted">
                Poke Sarah
            </button>
        </section>
    );
}