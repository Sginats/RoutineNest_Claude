# Contributing to RoutineNest

Thank you for your interest in contributing to RoutineNest!

## Getting Started

1. Fork this repository.
2. Clone your fork locally.
3. Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials.
4. Run `npm install` to install dependencies.
5. Run `npm run dev` to start the development server.
6. Create a feature branch from `main`.
7. Make your changes (see guidelines below).
8. Open a pull request.

## Development Setup

### Prerequisites

- Node.js 18+ and npm
- A Supabase project (free tier works)

### Environment Variables

```bash
cp .env.local.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start development server |
| `npm run build` | Build for production (static export) |
| `npm run lint` | Run ESLint |
| `npm run cap:build` | Build for Capacitor (web + copy to native) |
| `npm run cap:open:android` | Open Android project in Android Studio |
| `npm run cap:open:ios` | Open iOS project in Xcode |

### Building Without Supabase

The app builds successfully without environment variables. The Supabase client returns `null` and all consumers handle this gracefully. This enables CI/CD pipelines to build without secrets.

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

### Autism-Friendly Design

- Predictable layouts with consistent navigation.
- Minimal text — prefer icon + label pairs.
- Calm colour palette with no flashing or overstimulation.
- Clear next actions in every flow.
- Repetition-friendly learning activities.

### Code Style

- Follow existing patterns in the codebase.
- Use Tailwind CSS utility classes for styling.
- Use shadcn/ui components where available.
- Keep components small and focused.

### Adding Activities

To add interactive gameplay for an activity type:
1. Create a component in `src/components/activities/`.
2. Export it from `src/components/activities/index.ts`.
3. Add gameplay data in `src/lib/activityGameplayData.ts`.
4. Wire it up in the `ActivityGameplay` component in `LessonActivitiesClient.tsx`.

### Commits

- One logical change per commit.
- Use clear, descriptive commit messages.

### Testing

- Run `npm run build` before submitting a PR to ensure no TypeScript or build errors.
- Run `npm run lint` to check for linting issues.
- Add tests for new functionality when test infrastructure is available.

## Deployment

### Web (Vercel)

1. Connect the repo to Vercel.
2. Set environment variables in the Vercel dashboard.
3. Deploy.

### Android / iOS (Capacitor)

1. Run `npm run cap:build`.
2. Open in Android Studio / Xcode: `npm run cap:open:android` or `npm run cap:open:ios`.
3. Build and deploy through the native IDE.

## Reporting Issues

- Use GitHub Issues.
- Include steps to reproduce, expected behaviour, and actual behaviour.
- Screenshots or screen recordings are very helpful.

## Code of Conduct

Be kind, inclusive, and respectful. This project serves children and families — keep that in mind in every interaction.
