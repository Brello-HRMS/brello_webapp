# Module: Theme (webapp)

## 1. Purpose & Current Usage

- **This is not a light/dark-mode system.** `src/features/theme/` is a manual color-customizer: a slide-in panel with 11 `<input type="color">` swatches that let a user override specific CSS custom properties (`--color-primary`, `--color-background`, `--color-text-primary`, etc.) at runtime, persisted to `localStorage` under the key `brello-custom-theme` (`src/features/theme/constants.ts:1`). There is no concept of "light" vs "dark" mode, no `prefers-color-scheme` handling, and no second color palette anywhere in the codebase.
- Files:
  - `src/features/theme/useTheme.ts` — hook that loads saved overrides from `localStorage` (`useTheme.ts:12-19`), applies them to `document.documentElement.style` via inline styles (`useTheme.ts:5-9`), and exposes `updateColor`/`resetTheme`/`hasCustomTheme`.
  - `src/features/theme/constants.ts` — the 11 overridable CSS vars and their default hex values (must be kept in sync by hand with `src/assets/styles/_variables.scss`).
  - `src/features/theme/ThemeCustomizer.tsx` — the UI panel (a moon icon button that opens a right-hand drawer of color pickers).
  - `src/features/theme/ThemeCustomizer.module.scss` — styling for the panel.
- **Who uses it today: no one.** `ThemeCustomizer` was wired into the header in earlier commits, but the currently checked-in `src/components/layout/Header/Header.tsx:137` has it fully commented out (`{/* <ThemeCustomizer /> */}`), and the corresponding `import { ThemeCustomizer } from '../../../features/theme/ThemeCustomizer'` has been deleted from the file entirely (confirmed via `git log -p -- src/components/layout/Header/Header.tsx`, commit `a590169`). A global grep for `ThemeCustomizer` across `src/` outside of `src/features/theme/` finds only that one commented-out JSX line — it is not mounted anywhere in the app.
- Dead/unused: the entire feature is currently dead code — unreachable by any user, since the only mount point is commented out and its import removed.

## 2. Intended / Ideal Usage

- If the goal is genuine light/dark theming: a `ThemeProvider`/context that (a) reads the OS preference via `window.matchMedia('(prefers-color-scheme: dark)')` on first load, (b) lets the user override it and persists the choice (e.g. `localStorage`), (c) applies the choice before first paint (e.g. via a blocking inline script or a `data-theme` attribute set pre-hydration) to avoid a flash of the wrong theme, and (d) exposes a single source of truth (CSS variables scoped under `:root`/`[data-theme="dark"]` or a `.dark` class) that every component consumes.
- If the goal is the existing per-swatch color customizer: it should at minimum be re-mounted somewhere reachable, validate/sanitize stored values (a corrupted or hand-edited `localStorage` blob is trusted blindly), and stay in sync with the canonical variable list in `_variables.scss` instead of maintaining a second, hand-copied list of 11 vars in `constants.ts`.

## 3. Cross-Module Connections

- **Depends on**: `src/assets/styles/_variables.scss` (`:root` block, `_variables.scss:1-145`) as the canonical default values that `constants.ts` duplicates by hand; browser `localStorage`; `document.documentElement` DOM access (SSR-unsafe, but this is a CSR app so currently fine).
- **What depends on this**: nothing, currently — the mechanism (CSS custom properties applied by SCSS modules) is used by essentially every feature (`src/features/**/*.module.scss` reference `var(--color-*)` pervasively), but that dependency is on the static `:root` block in `_variables.scss`, not on anything in `src/features/theme/`. Since the customizer is unmounted, `useTheme`'s runtime `style.setProperty` calls never execute in production.
- **Missing/expected connections**: there is no app-wide `ThemeProvider` in `src/app/App.tsx` or `src/main.tsx` — confirmed no references to "theme" in either file. No dark-mode CSS block exists at all (no `@media (prefers-color-scheme: dark)`, no `.dark`/`[data-theme]` selectors anywhere in `src/`). Given the task framing ("light/dark mode theming"), this is the central gap: the feature that exists solves a different problem (arbitrary color customization) than the one implied by its directory name, and neither problem is currently delivered to users.

## 4. Gaps

### Structural (architecture, component boundaries, coupling, missing abstractions)

- **No dark mode exists anywhere in the app.** There is exactly one palette, defined once in `src/assets/styles/_variables.scss:1-145`, with no alternate palette, no `prefers-color-scheme` media query, and no theme-switching mechanism reachable by users. This matters because any product requirement for dark mode requires building the feature essentially from scratch; `src/features/theme/` provides no scaffolding toward it (it solves per-color customization, not mode switching).
- **Duplicated source of truth for default colors.** `DEFAULT_THEME_COLORS` in `src/features/theme/constants.ts:17-29` hand-copies 11 values that already exist in `src/assets/styles/_variables.scss:4-101`; the two lists have already drifted (e.g. `--color-primary-hover` is `#7F56D9` in `constants.ts:19` vs `#61219b` in `_variables.scss:5`, and `--color-primary` is `#392A46` in both but `--color-secondary` differs by case only). Any future edit to the base palette silently desyncs the customizer's "defaults," so `resetTheme()` would restore stale colors instead of the real current theme.
- **No React Context/Provider** — `useTheme()` is a standalone hook with local `useState`; if it were ever used from two places (e.g. header + settings page) each instance would hold independent, potentially conflicting state despite both writing to the same `localStorage` key, since there's no shared provider to coordinate them.

### Coding (bugs, dead code, inconsistent patterns, hardcoded colors bypassing the theme system, missing validation)

- **Entire feature is dead code**: `ThemeCustomizer` is unreachable — commented out at `src/components/layout/Header/Header.tsx:137` with its import removed, so it cannot even be uncommented without re-adding the import; confirmed no other mount points exist in `src/`.
- **Unvalidated `localStorage` read**: `loadSavedTheme()` in `useTheme.ts:12-19` does `JSON.parse` inside a try/catch that only guards against parse errors — it never validates that the parsed object's keys/values are the expected CSS-var-name/hex-color shape before spreading it into React state and writing it straight to `document.documentElement.style.setProperty` (`useTheme.ts:5-9`). A malformed or tampered value in storage would silently inject arbitrary property values with no validation.
- **Hardcoded colors bypass the CSS-variable theme system in many components**, meaning even if theming were wired up, restyling would miss these: e.g. `src/features/attendance/setup/components/AssignTab.module.scss:78` (`color: #fff;`) and `:248` (`color: #fff;`) with no CSS variable at all, and `src/features/auth/components/OtpForm/OtpForm.module.scss:42` (`border: 1px solid #D0D5DD;`) with no variable either. Many other files (e.g. same `OtpForm.module.scss:7,20,44-55`) do use `var(--color-x, #hexfallback)` — the fallback hardcodes a value that will silently diverge from `_variables.scss` if the variable is ever renamed or the CSS fails to load.
- **Copy-paste bug in `_variables.scss`**: the "Brand Loader specific" block (`--brand`, `--brand-deep`, `--brand-mid`, `--brand-light`, `--brand-pale`, `--inactive`, `--inactive-soft`, `--tint`) is defined twice verbatim, at `_variables.scss:15-23` and again at `_variables.scss:25-33` — harmless (last write wins) but indicates unreviewed copy-paste.
- **Self-referential CSS variable**: `--color-error: var(--color-error);` at `_variables.scss:62` references itself before being properly defined at `_variables.scss:105` (`--color-error: #dc3545;`); per CSS custom-property resolution rules a self-reference makes the property invalid at computed-value time, so line 62 is inert/wrong and only works because line 105 overrides it later in the same block — this is a latent bug that would break the moment someone reorders the block.

### Technical (performance, flash of wrong theme, accessibility, contrast, test coverage)

- **N/A — no flash-of-wrong-theme risk today because there is no theme-switching to flash between**; however, if `ThemeCustomizer` were re-enabled as-is, there would be a flash: `useTheme.ts:22-28` applies saved colors only after the component mounts and `useEffect` runs, so the default `:root` palette from `_variables.scss` paints first and any customized colors would visibly swap in a frame or more later.
- **No test coverage**: there are no test files anywhere under `src/features/theme/` (no `*.test.ts(x)`), so neither the `localStorage` persistence, the reset behavior, nor the DOM-application logic in `useTheme.ts` is verified.
- **Accessibility not evaluated by design**: because colors are freely user-chosen via `<input type="color">` (`ThemeCustomizer.tsx:56-61`) with no contrast checking, a user could pick a text color equal to the background color with no warning — there is no contrast validation logic anywhere in the feature.

## 5. Top 3 Priorities

1. **Decide product intent and rebuild accordingly**: the directory is named/positioned as "theme" (light/dark mode) but delivers a different, currently-dead feature (manual color customization) — clarify which is actually wanted before investing further, since fixing bugs in the wrong feature wastes effort.
2. **Either remove or re-mount `ThemeCustomizer`**: shipping fully dead code (unreachable component, orphaned hook) with no tests and no consumers is pure maintenance liability — decide to delete `src/features/theme/` or wire it back into `Header.tsx` with its import restored.
3. **Consolidate the duplicated color-default source of truth**: `constants.ts`'s `DEFAULT_THEME_COLORS` has already drifted from `_variables.scss`'s `:root` block — generate/derive one from the other (or read computed styles at runtime) so "reset to default" is guaranteed correct.
