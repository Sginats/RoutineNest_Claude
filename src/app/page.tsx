import Link from "next/link";

const TILES = [
  { href: "/kid/study", emoji: "📖", label: "Study", bg: "bg-accent text-accent-foreground" },
  { href: "/kid/talk", emoji: "💬", label: "Talk", bg: "bg-primary text-primary-foreground" },
  { href: "/kid/schedule", emoji: "📋", label: "Schedule", bg: "bg-secondary text-secondary-foreground" },
  { href: "/kid/rewards", emoji: "⭐", label: "Rewards", bg: "bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-200" },
  { href: "/kid/break", emoji: "🌿", label: "Break", bg: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-200" },
] as const;

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

      <div className="grid grid-cols-2 gap-4 w-full max-w-md sm:grid-cols-3">
        {TILES.map((tile) => (
          <Link
            key={tile.href}
            href={tile.href}
            className={`inline-flex min-h-[120px] flex-col items-center justify-center gap-3 rounded-2xl px-4 py-5 text-lg font-bold shadow-md transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95 ${tile.bg}`}
          >
            <span className="text-4xl" aria-hidden="true">{tile.emoji}</span>
            <span>{tile.label}</span>
          </Link>
        ))}
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
