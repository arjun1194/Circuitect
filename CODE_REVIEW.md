# Circuitect — Code Review

_Multi-agent review (10 dimensions, adversarially verified). 75 findings confirmed and deduped to the set below: **0 critical, 0 high, 9 medium, 8 low** (+ grouped info-level cleanups)._

## Executive summary

Circuitect is a well-architected educational circuit-simulation game (React 19 + TS + Vite + Tailwind 4) with a clean separation of physics, rendering, and UI concerns, strong NaN/Infinity hygiene in the solver, and high-quality level content. **No critical or high-severity defects were confirmed.** The actionable issues cluster in three areas: (1) physics-model fidelity gaps that contradict the in-game teaching text, (2) React state-sync gaps around undo/redo and property editing, and (3) missing validation on imported circuit JSON.

## Baseline status

| Check | Result | Notes |
|---|---|---|
| Lint (`eslint .`) | ❌ 4 errors | All `no-unused-vars` in `legacy/js/components.js`. **Zero errors in `src/`.** |
| Typecheck (`tsc --noEmit`) | ✅ Pass | No type errors. |
| Tests (`vitest`) | ✅ Pass | 8 files, 52 tests green (~328 ms). |

The only actionable check failure is lint, entirely within the dead `legacy/` directory.

---

## Findings

### 🟠 Medium

**1. Transistor current display ignores dynamic on/off resistance (always ~0).** `src/engine/Physics.ts:215-216`, `src/engine/components/Transistor.ts:9-11` — solve uses dynamic 10Ω/10MΩ, but `c.current` divides by the static `getResistance()` (1MΩ), so a conducting transistor shows ~0 A and never animates current. Display defect (solve is correct). _Folds into the MNA rewrite (Ebers-Moll gives a real I_C)._

**2. Logic chip is non-functional/asymmetric (levels 9–10).** `src/engine/Physics.ts:142-166` — drives output only on `n1` (the `n2` pin falls through to a 10kΩ resistor branch), discovers inputs by fragile 30px proximity, no default branch. Not dead code — used by levels 9–10. _Folds into the MNA rewrite with explicit input/output nodes._

**3. Capacitor has no time-domain dynamics (contradicts the lesson).** `src/engine/components/Capacitor.ts:11-13` — modeled as a static 1MΩ resistor; `capacitance` is serialized but never read. Level-5 text teaches charging/blocking behavior the sim doesn't exhibit. _Folds into MNA (backward-Euler companion); meanwhile fix the lesson text._

**4. Canvas ignores `devicePixelRatio` — blurry on HiDPI/Retina.** `src/hooks/useGameLoop.ts:70-75`, `src/engine/Renderer.ts` — backing store sized in CSS px then stretched. **Highest-impact visual fix for the revamp.** Make `setSize(w,h,dpr)` set backing store `w*dpr × h*dpr`, pin CSS size, `ctx.setTransform(dpr,…)`.

**5. "Clear Board" is not undoable — unrecoverable data loss.** `src/hooks/useGameLoop.ts:275-279` — `clear()` wipes state and `clearHistory()` without pushing, so Undo can't restore. Push the pre-clear state before wiping.

**6. Undo/Redo buttons go stale after build/remove (no re-render).** `src/App.tsx:158-159` — availability read from refs during render; build/remove/import/show-solution mutate refs without a React update. Add an `onHistoryChange` callback → `historyVersion` state. **Keystone for the revamped Header.**

**7. PropertyEditor mutates the live component + `forceUpdate({})`; edits not undoable.** `src/components/UI/PropertyEditor/index.tsx:18-25` — direct mutation, empty-object re-render hack, no `pushState`. Route edits through a history-recording, controlled-state path (commit on blur/Done).

**8. Imported JSON deserialized with no structural validation.** `src/utils/CircuitSerializer.ts:158-202` — trusts shape; malformed input throws raw `TypeError`s or silently produces NaN coordinates. Add an `isValidSerializedCircuit` type guard (arrays, finite x/y, known `type`, integer id refs).

**9. Component properties from untrusted JSON assigned without type validation.** `src/utils/CircuitSerializer.ts:65-103` — only `!== undefined` checks. Validate/clamp per field against constructor defaults; guard `Physics.ts:216` `c.current` as defense-in-depth.

### 🟡 Low

**10. Corrupt localStorage `levelIndex` → blank-screen crash on load.** `src/App.tsx:23-26`, `src/hooks/useLevelProgress.ts:10` — `parseInt("abc")` → `LEVELS[NaN]` → render throws before any UI. Validate integer + clamp ≥ 0; add radix.

**11. LED burns on a voltage threshold, contradicting the current-limiting lesson.** `src/engine/Physics.ts:225-231`, `levels.ts:56` — burnout is voltage-driven (default 10V), so a bare LED on 9V never burns and the resistor lesson isn't modeled. Burn on `|current|` with a `maxCurrent` (~0.02 A); tighten `checkCurrentLimiting`. _Folds into MNA._

**12. Ground/reference selection assumes one global battery-negative node.** `src/engine/Physics.ts:194-198` — only one node pinned to 0 V; isolated multi-supply topologies get wrong absolute voltages. _Resolved by MNA ground + per-subgraph reference._

**13. Grounding `nodes.find` runs inside the per-node iteration loop (O(N²)/iter).** `src/engine/Physics.ts:194-196` — repeated work every frame. _Moot after MNA._

**14. Renderer mutates component state during draw (frame-rate-dependent particles).** `src/engine/Renderer.ts:32-53` — dead lazy-init + no `dt`, so particles move 2× faster at 120 Hz. Move phase advancement into an update step with `dt`.

**15. Round-trip fidelity: inconsistent dangling-ref handling (`-1` sentinel vs silent n3 drop).** `src/utils/CircuitSerializer.ts:129-130, 173-189` — drop the `?? -1` sentinel; make n3 consistent with n1/n2.

**16. Imported circuit bypasses undo/redo history.** `src/hooks/useGameLoop.ts:310-320` — no `pushState`/`clearHistory` after import. Pairs with #6.

**17. `localStorage` access has no try/catch (quota/disabled storage).** `src/hooks/useLevelProgress.ts:11-13`, `App.tsx:24,47` — the `getItem` in `App.tsx:24`'s `useState` initializer could crash before first paint. Add a `safeStorage` helper + optional top-level ErrorBoundary. _(useTheme.ts already guards its storage access.)_

**18. Controlled number input yields NaN on empty/invalid input.** `src/components/UI/PropertyEditor/EditorComponents.tsx:15-22` — `parseFloat("")` → NaN onto the model. Sanitize at the boundary; keep local string state, commit on blur. Pairs with #7.

**19. Misc cleanups (info-level):** unused `useLevelProgress` 2nd param (`App.tsx:41`); rAF loop re-binds on every `toolMode` change (`useGameLoop.ts:82-112`); duplicated `10000000` open-circuit magic number (`Physics.ts:75`, `LED.ts:15`) → extract `OPEN_CIRCUIT_R`; double `getBoundingClientRect()` in `handleMouseDown`; inconsistent hit-test radii/coord spaces (`useGameLoop.ts:125-128,193,225`); the 4 `legacy/` lint errors (delete `legacy/` or exclude from lint).

---

## Strengths

- **Engine:** thorough NaN/Infinity hygiene; infinite-R components correctly skipped; transistor base as a true high-impedance node; bounded relaxation (can't hang); battery "ghost current" deliberately zeroed — all with regression coverage.
- **Types/config:** `TYPES` as `const` + derived `ComponentType`; `COMPONENT_METADATA` as `Record<ComponentType,…>` (compiler-enforced completeness); checkers separated from content as pure functions; all 10 levels/solutions/checkers aligned; genuinely good `theory`/`hints`.
- **UI/architecture:** clean single-responsibility components; reusable `EditorInput/Select/Slider`; real `disabled` attributes on undo/redo; `clsx`; robust Export/Import (FileReader, Blob + `revokeObjectURL`, input reset); mutable game state in refs (no setState-per-frame); controller `useMemo`'d with accurate deps.

---

## Prioritized action plan

**Phase 1 — Correctness & data-loss:** #5 (undoable clear), #10/#17 (storage guards), #6 (undo/redo → React state, keystone for #16), #8/#9 (import validation + guard `Physics.ts:216`).

**Phase 2 — Physics fidelity & visual quality:** #4 (DPR canvas — before restyling), then #1/#2/#11/#3 — **most of which are absorbed by the planned full SPICE-grade MNA rewrite.**

**Phase 3 — Editor & state polish:** #7 + #18 (controlled, history-recording editor), #16 (import through history), #15 (serializer dangling refs).

**Phase 4 — Cleanups & perf:** #12/#13 (ground lookup — moot after MNA), #14 (particle `dt`), #19 (misc + `legacy/` lint).

Per `CLAUDE.md`, each fix lands with a regression test.

---

## How this maps to the current work

- **UI revamp (in progress):** directly covers #4 (DPR), #6 (undo/redo state), #7/#18 (editor rework), a11y labels, and making the theme system the single source of truth (done — see `index.css` tokens + `useTheme`).
- **MNA SPICE-grade engine rewrite (queued):** absorbs the physics-fidelity findings #1, #2, #3, #11, #12, #13 and the grounding model.
- **Quick wins to fold in:** #5, #10, #17 (data-loss / crash hardening) and #19 (`legacy/` lint) during the revamp.
