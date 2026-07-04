# Streamly Frontend Refactoring Guidelines

## Principles

- One responsibility per file.
- Shared components stay presentation-only.
- API paths live in endpoint modules.
- Validation is centralized.
- Auth state is isolated.
- Data mapping is not done inside UI primitives.

## SOLID Application

- Split route orchestration from reusable presentation.
- Prefer narrow typed contracts.
- Keep API client replaceable.
- Keep route guards independent of rendering.
- Avoid hardcoded provider logic in components.

## DRY Application

Extract repeated:

- Form validation.
- Error copy.
- API request handling.
- Loading states.
- Empty states.
- Motion tokens.
- Navigation metadata.

Do not extract speculative abstractions.

## Performance Rules

- Avoid unnecessary client components.
- Keep route shells server-renderable by default.
- Move interactivity into focused client components.
- Avoid large media in the initial bundle.
- Use backend video streaming rather than buffering media in the browser.

## Security Rules

- No secrets in frontend env.
- Only `NEXT_PUBLIC_*` variables are public.
- Do not persist sensitive tokens casually.
- Use backend session refresh decisions.
- Keep role checks declarative.
