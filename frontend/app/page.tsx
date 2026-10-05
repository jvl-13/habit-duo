"use client";

import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="text-xl font-bold tracking-tight">
            Habit DUO
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              How it works
            </a>
            <a
              href="#about"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              About project
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex rounded-full border bg-muted/50 px-4 py-2 text-sm text-muted-foreground">
              Build better habits together
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Stay accountable,
              <span className="block text-primary">with a partner.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              Set goals, check in every day, share proof, and keep each other on
              track.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/register"
                className="rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Get started for free!
              </Link>

              <Link
                href='/login'
                className="rounded-lg border px-6 py-3 font-medium transition-colors hover:bg-muted">
                I already had an account
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="border-y bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              Features
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight">
              Everything you need to stay consistent
            </h2>

            <p className="mt-4 text-muted-foreground">
              Simple tools designed to help you and your partner build better
              habits together.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <FeatureCard
              icon="✓"
              title="Daily Check-in"
              description="Check in every day to keep track of your progress."
            />
            <FeatureCard
              icon="◉"
              title="Proof & Photo"
              description="Share a photo or note to show your partner that you completed your habit."
            />
            <FeatureCard
              icon="♡"
              title="Accountability"
              description="Stay motivated with your partner and send a gentle poke when they have not checked in yet."
            />
          </div>
        </div>
      </section>

      <section id="how-it-works">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              How it works
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight">
              Start building better habits in four simple steps.
            </h2>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-4">
            <Step
              number="01"
              title="Create your account"
              description="Sign up for your free Habit Duo account"
            />

            <Step
              number="02"
              title="Invite your partner"
              description="Connect with someone who will keep you accountable"
            />

            <Step
              number="03"
              title="Create a habit"
              description="Set a clear goal and start checking in every day"
            />

            <Step
              number="04"
              title="Stay consistent"
              description="Track progress, encourage each other, and keep going"
            />
          </div>
        </div>
      </section>

      <section className="border-y bg-muted/30">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to build better habits?
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Do not just set goals. Have someone by your side to help you follow
            through.
          </p>

          <Link
            href="/register"
            className="mt-8 inline-flex rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Create your account
          </Link>
        </div>
      </section>

      <section id="about">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold">About Habit DUO</h2>

            <p className="mt-4 leading-7 text-muted-foreground">
              Habit Duo is a full-stack portfolio project focused on authentication, authorization, realtime notifications, presence, and habit tracking.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {[
                "Next.js",
                "TypeScript",
                "NestJS",
                "Prisma",
                "PostgreSQL",
                "Socket.IO",
              ].map((technology) => (
                <span
                  key={technology}
                  className="rounded-full border bg-background px-3 py-1 text-sm text-muted-foreground"
                >
                  {technology}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold">Habit DUO</p>

            <p className="mt-1 text-sm text-muted-foreground">
              Build better habits together.
            </p>
          </div>

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground">
              Features
            </a>

            <a href="#how-it-works" className="hover:text-foreground">
              How it works
            </a>

            <Link href="/login" className="hover:text-foreground">
              Log in
            </Link>
          </div>

          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Habit Duo
          </p>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border bg-background p-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-lg font-bold text-primary">
        {icon}
      </div>

      <h3 className="mt-5 font-semibold">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <span className="text-sm font-semibold text-primary">{number}</span>

      <h3 className="mt-3 font-semibold">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
