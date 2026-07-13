---
name: Expo useColors dark-mode typecheck bug
description: The scaffold's hooks/useColors.ts uses an `as Record<string, typeof colors.light>` cast that breaks tsc once you add a `dark` key + `radius` to constants/colors.ts.
---

## Symptom

After adding a `dark` palette object to `constants/colors.ts` (to support dark mode), `pnpm --filter @workspace/<slug> run typecheck` fails with a TS2352 error in `hooks/useColors.ts`, complaining that `radius: number` doesn't fit the palette's `Record<string, {...}>` shape.

## Fix

Replace the unsafe cast in `useColors()` with a direct property check:

```ts
const palette = scheme === 'dark' && colors.dark ? colors.dark : colors.light;
return { ...palette, radius: colors.radius };
```

**Why:** The original scaffold code does `(colors as Record<string, typeof colors.light>).dark`, which only worked because `dark` didn't exist yet. Once `dark` is added alongside a sibling `radius: number` key, the whole `colors` object no longer safely casts to `Record<string, PaletteShape>`.

**How to apply:** Any time you add real dark-mode tokens to a fresh Expo scaffold's `constants/colors.ts`, apply this fix to `hooks/useColors.ts` in the same pass, then re-run typecheck.
