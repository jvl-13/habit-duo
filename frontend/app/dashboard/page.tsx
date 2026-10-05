import { ProtectedRoute } from "@/components/auth/protected-route";
import { useAuth } from "@/lib/auth/auth-context";

export default function DashboardPage() {
    return (
        <ProtectedRoute>
            <DashboardContent />
        </ProtectedRoute>
    );
}

function DashboardContent() {
    const {
        user,
        logout,
    } = useAuth();

    return (
        <main className="min-h-screen bg-background">
            <div className="mx-auto max-w-6xl px-6 py-8">
                <header className="flex items-center justify-between border-b pb-6">
                    <div>
                        <h1 className="text-2xl font-bold">
                            Habit Duo
                        </h1>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Welcome, {user?.name}
                        </p>
                    </div>

                    <button 
                        onClick={logout}
                        className="rounded-md border px-4 py-2 text-sm hover:bg-muted"
                    >
                        Logout
                    </button>
                </header>

                <section className="mt-8">
                    <h2 className="text-xl font-semibold">
                        Dashboard
                    </h2>
                    <p className="mt-2 text-muted-foreground">......</p>
                </section>
            </div>
        </main>
    )
}