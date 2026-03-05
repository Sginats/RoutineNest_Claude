# Privacy Policy — RoutineNest

_Last updated: 2026-03-05_

RoutineNest is a routine-planning and communication app designed for children.
We take privacy seriously — especially when kids are involved.

## What data do we store?

| Data | Where | Why |
|------|-------|-----|
| Parent email + password | Supabase Auth (your project) | Sign-in only |
| Child profiles (name) | Your Supabase database | To personalise schedules |
| Cards, schedules, rewards | Your Supabase database | Core app features |
| Uploaded icons | Supabase Storage (`card-icons` bucket) | Custom card images |
| App settings | Your Supabase database | Calm mode, grid size, sound |

All data lives inside **your own** Supabase project — RoutineNest does not
operate a central server. You own and control every byte.

## Analytics (optional)

If you configure a PostHog key, RoutineNest sends **anonymous** usage events
(screen views, card-tap counts by category) in **production only**.

- No session replays.
- No child names, labels, or speech text are ever sent.
- Analytics can be **disabled** in Settings → Privacy at any time.
- If no PostHog key is set, zero analytics code runs.

## Cookies and local storage

RoutineNest uses browser local storage and IndexedDB to:

- Cache data for offline use.
- Remember the active child profile.
- Store the analytics opt-out preference.

No third-party tracking cookies are set.

## Children's privacy

- RoutineNest does not collect personally identifiable information from
  children.
- All data is stored in the parent's own Supabase project.
- Parents control what cards, labels, and images exist.

## ARASAAC pictograms

The optional ARASAAC icon picker fetches pictogram search results from
`api.arasaac.org`. These requests contain only search keywords entered by
parents — never child data. ARASAAC pictograms are licensed under
[CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/).

## Data deletion

Because all data resides in your Supabase project, you can delete everything
at any time via the Supabase dashboard or by deleting the project entirely.

## Contact

If you have questions about privacy, please open a GitHub issue at
<https://github.com/Sginats/RoutineNest_Claude/issues>.
