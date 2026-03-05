interface EmptyStateProps {
  /** Large emoji displayed prominently */
  emoji: string;
  /** Accessible label for the emoji */
  emojiLabel: string;
  /** Heading text */
  title: string;
  /** Supporting description */
  description: string;
}

/**
 * Friendly empty-state panel for kid pages.
 * Shows an emoji, a heading, and helpful text — never a blank white page.
 */
export function EmptyState({
  emoji,
  emojiLabel,
  title,
  description,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6 px-4 text-center">
      <span className="text-7xl" role="img" aria-label={emojiLabel}>
        {emoji}
      </span>
      <h1 className="text-2xl font-extrabold">{title}</h1>
      <p className="text-muted-foreground text-lg">{description}</p>
    </div>
  );
}
