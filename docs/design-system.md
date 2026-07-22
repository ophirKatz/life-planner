# Design system

Everything here lives in `src/core/ui/`. Modules import from there — never
from `@rn-primitives/*`, raw React Native, or NativeWind's defaults directly
for anything already wrapped. If you need a new visual pattern, check this
list first; if it's genuinely new, add it here rather than inlining it in a
module.

## Look and feel

"Calm productivity" (DESIGN.md §9): restrained neutrals, one confident
accent, generous whitespace. Colors are semantic Tailwind classes backed by
CSS-variable tokens (`src/core/ui/theme/global.css`), themed light/dark via
`darkMode: "class"`:

`bg` `surface` `surface-muted` `border` `foreground` `muted` /
`muted-foreground` `accent` / `accent-foreground` `danger` / `danger-foreground`
`success` / `success-foreground`

Use these classes (`bg-surface`, `text-muted-foreground`, …), never raw hex
in `className`. When a hex value is unavoidable (an `Icon`'s `color` prop, an
SVG stroke, a status dot), pull it from `useThemeColors()`
(`src/core/ui/theme/useThemeColors.ts`), not a hardcoded string — it resolves
to the right value for the active theme automatically. A few genuinely
data-driven colors (event colors, habit colors, priority dots) are stored as
hex in the DB and rendered via inline `style`, which is fine — those aren't
theme colors, they're user/record data.

## Component inventory

| Component | Use for |
|---|---|
| `Button` | Every tappable action. Variants: `default`/`secondary`/`outline`/`ghost`/`destructive`; sizes `default`/`sm`/`lg`/`icon`. |
| `Card` / `PressableCard` | A bounded content block; `PressableCard` for dashboard widgets. |
| `Input` | Text entry, with built-in `label`/`error`. |
| `Checkbox` | Boolean toggle with haptic feedback baked in. |
| `Select` | Single-choice picker from an open-ended list (e.g. a task list, a shopping category). |
| `OptionButtonGroup` | Single-choice picker from a **small, fixed** set shown as buttons (priority, status, cadence, Today/Tomorrow/None). Prefer this over `Select` when there are ≤5 options — it's one tap instead of two. |
| `NumberStepper` | A bounded integer with "− N +" (servings, target-per-period). |
| `FrequencyInput` | Recurrence: Daily/Weekly/Monthly/Yearly presets + a custom "every N units" fallback. Built on `NumberStepper` + `OptionButtonGroup`. |
| `ListRow` | Any list item: optional leading checkbox/dot/icon, title (+ `titleDone` strike-through), subtitle, trailing content, optional `swipeAction`. This is what every list screen renders — see below. |
| `ListItem` | A simpler, chevron-navigation row with no leading indicator (used for plain "go to X" rows, e.g. the People list). Prefer `ListRow` once a row needs a checkbox, dot, or swipe action. |
| `Sheet` / `SheetContent` / `RouteSheet` | Bottom drawers — see below. |
| `Dialog` | A small centered confirmation (yes/no), **not** a creation form — see below. |
| `Tabs` / `TabsList` / `TabsTrigger` / `TabsContent` | Segmented in-screen views (Calendar's Month/Agenda, Focus's Tomorrow/This week). |
| `EmptyState` | Every list's zero-data and error states — `icon`, `title`, optional `description`/`actionLabel`/`onAction`. |
| `Skeleton` / `SkeletonListItem` | Loading placeholders — use these, not spinners, for list/screen loading. |
| `SwipeableRow` | The primitive behind `ListRow`'s `swipeAction` — reach for it directly only if you're not rendering a `ListRow`. |
| `StreakRing` / `ConfettiBurst` | Habit-style progress ring and completion celebration. |

## Modals: Sheet vs Dialog vs full page

Three surfaces, one rule: **pick by content size, not by habit.**

- **Bottom-drawer `Sheet`** — the default for any multi-field creation flow
  ("New task", "New recipe", …) and for in-page quick-creates ("New shopping
  list", "New budget category"). Routed creation screens use `RouteSheet`
  (`src/core/ui/RouteSheet.tsx`), which renders the screen's content inside a
  `Sheet` while leaving the route itself untouched — `router.push` and
  deep-linking keep working, dismissing just pops the route. Pair the route's
  `Stack.Screen` options with `{ headerShown: false, presentation:
  "transparentModal", animation: "none" }` so only the Sheet's own animation
  plays. Copy any existing `app/modules/*/new.tsx` for the exact pattern.
- **Centered `Dialog`** — a yes/no confirmation only (see
  `ScheduledAsConfirmDialog`). Never use it for a form with more than one
  field; that's a `Sheet`.
- **Full page** (a route with default `presentation: "card"`) — detail/edit
  screens for an existing record (`TaskDetailScreen`, `PersonDetailScreen`,
  …), where back-navigation and full screen real estate genuinely help.
  Editing an existing record is not a "quick add," so it stays a page.

## Forms

Every form is `react-hook-form` + `zod`, same shape everywhere:

```tsx
export const xFormSchema = z.object({ /* ... */ });
export type XFormValues = z.infer<typeof xFormSchema>;

export function XForm({ defaultValues, onSubmit, isSubmitting, submitLabel }: {
  defaultValues: XFormValues;
  onSubmit: (values: XFormValues) => void;
  isSubmitting?: boolean;
  submitLabel: string;
}) {
  const { control, handleSubmit, formState: { errors } } =
    useForm<XFormValues>({ resolver: zodResolver(xFormSchema), defaultValues });
  // one <Controller> per field, ending in a submit <Button>
}
```

The same `XForm` component is reused by both the "New X" screen and the "X
detail" (edit) screen — only `defaultValues` and `onSubmit` differ. Don't
write a separate form for create vs. edit.

## Lists

Every list screen follows: header with title + a `Button size="icon"` "+"
(or nothing, if creation only happens via the global quick-add) → loading
(`SkeletonListItem` × N) → error (`EmptyState` + retry) → empty
(`EmptyState` + create action) → `FlashList` of `ListRow`s. Copy
`TasksListScreen` or `IdeasListScreen` for the exact skeleton.

## Icons

`lucide-react-native` only. A module's own icon (shown in the Store, the
dashboard widget header, tab bars) must also be registered as a string key in
`src/core/modules/icon-map.ts` — the Store renders straight from the DB
catalog and can't resolve a not-yet-installed module's own `ModuleDefinition.icon`.
