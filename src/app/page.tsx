import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-8 px-4 text-center">
      <span className="text-6xl" role="img" aria-label="Nest">
        🏡
      </span>
      <h1 className="text-4xl font-extrabold tracking-tight text-primary">
        RoutineNest
      </h1>
      <p className="max-w-md text-lg text-muted-foreground">
        Routines + communication for children — designed with care.
      </p>

      <div className="flex flex-col gap-4 sm:flex-row">
        <Link
          href="/kid/talk"
          className="inline-flex min-h-[56px] min-w-[180px] items-center justify-center gap-3 rounded-2xl bg-primary px-6 text-lg font-bold text-primary-foreground shadow-md transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95"
        >
          <span aria-hidden="true">💬</span> Talk
        </Link>
        <Link
          href="/kid/study"
          className="inline-flex min-h-[56px] min-w-[180px] items-center justify-center gap-3 rounded-2xl bg-accent px-6 text-lg font-bold text-accent-foreground shadow-md transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95"
        >
          <span aria-hidden="true">📖</span> Study
        </Link>
        <Link
          href="/kid/schedule"
          className="inline-flex min-h-[56px] min-w-[180px] items-center justify-center gap-3 rounded-2xl bg-secondary px-6 text-lg font-bold text-secondary-foreground shadow-md transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95"
        >
          <span aria-hidden="true">📋</span> My Tasks
        </Link>
      </div>

      <Link
        href="/login"
        className="mt-4 text-sm font-medium text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
      >
        Parent / Caregiver Sign In →
      </Link>
    </div>
  );
}
