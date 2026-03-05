# Contributing to RoutineNest

Thank you for your interest in contributing to RoutineNest!

## Getting Started

1. Fork this repository.
2. Clone your fork locally.
3. Create a feature branch from `main`.
4. Make your changes (see guidelines below).
5. Open a pull request.

## Development Guidelines

### Tools

- **Node + npm** — do not use pnpm or yarn.
- **Next.js App Router** — follow App Router conventions for all pages and layouts.
- **TypeScript** — all new files must be TypeScript (`.ts` / `.tsx`).

### Accessibility

RoutineNest is built for children with autism and similar support needs. Accessibility is not optional.

- Use large touch targets (minimum 48 × 48 px).
- Ensure predictable, consistent UI with no surprise sounds or animations.
- Support Calm Mode (reduced motion, softer colours).
- All images and icons must have meaningful alt text or aria labels.
- Test with screen readers when possible.

### Code Style

- Follow existing patterns in the codebase.
- Use Tailwind CSS utility classes for styling.
- Use shadcn/ui components where available.
- Keep components small and focused.

### Commits

- One logical change per commit.
- Use clear, descriptive commit messages.

### Testing

- Run existing tests before submitting a PR.
- Add tests for new functionality when test infrastructure is available.

## Reporting Issues

- Use GitHub Issues.
- Include steps to reproduce, expected behaviour, and actual behaviour.
- Screenshots or screen recordings are very helpful.

## Code of Conduct

Be kind, inclusive, and respectful. This project serves children and families — keep that in mind in every interaction.
