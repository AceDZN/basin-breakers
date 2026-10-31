# Basin Breakers — verification record

31 October 2026. **66/66 model tests passed; all 24 missions won through actual browser inputs; six required physical mistakes failed and recovered; 18 additional control checks passed.** The static production build passed. Internal QA used authored plans, not unaided student play, and does not establish learning gains or student enjoyment.

## Reproducible checks

Run commands from `/Users/acedzn/dev/AceDZN-exp/basin-breakers`:

- `npm test`: 66 independent model/campaign tests. Final result: 66 passed, zero failed, 13.25 seconds. Saved readable Node report: [latest-model-results.tap](tests/latest-model-results.tap).
- `node_modules/.bin/tsx tests/browser-qa.ts`: actual campaign, pointer, gate, pump and treatment inputs. `BASIN_QA_LEVELS` chooses a focused comma-separated subset. [Consolidated browser states](docs/playtest-captures/browser-summary.json).
- `node_modules/.bin/tsx tests/browser-controls.ts` and `node_modules/.bin/tsx tests/browser-extras.ts`: [18 control checks](docs/playtest-captures/controls-summary.json).
- `node_modules/.bin/tsx tests/browser-performance.ts`: production preview, actual elapsed-time FPS, resource transfers, then network-offline play. [Measured report](docs/playtest-captures/performance-summary.json).

The lead also ran the required develop-web-game skill action client with real excavation and Space inputs, inspecting screenshot and text state. The supplemental scripts exist to exercise the full authored campaign and device controls. Dev: http://localhost:5302 . Production preview: http://localhost:4302 . Both remain local; no production deployment is claimed.

## Physical verification

The QA tests independently sum all water, salt, supported pollutant and reuse-provenance arrays and stores. They do not merely trust the implementation's `accounting()` or a solution identifier. Absolute ledger tolerance is **1e-7 game units**. Tests cover:

- Every known plan and every uncorrected/bad plan through the complete horizon, including delayed pulses and final reserve constraints.
- No negative stores; finite sources; blocked gates; depth, locked-cell and earth-budget bounds; deterministic replay; public timestep subdivision.
- Same finite input on permeable and sealed ground; dissolved tracers reach groundwater; dry pumping produces nothing; withdrawal cannot exceed existing storage.
- Desalination product plus brine equals feed; salt remains in the ledger; finite energy constrains processing.
- Wastewater treatment moves supported pollution into a residual store, preserves salt and nonpotable provenance, and does not automatically qualify drinking water.
- Irrigation evaporation removes water while retaining dissolved material in a soil ledger; drip reduces loss.
- Destination quantity, quality, environmental allocation and aquifer reserves; two spatially distinct valid plans for level 23.
- Wrong drinking connections in 17/19 explain quality before another destination's quantity shortfall.

Maximum absolute ledger error among the saved browser outcomes was **2.32e-12** game units. All 24 known browser plans ended with their actual sources, stores, outputs and quality constraints satisfied; no success state was injected.

## Full browser campaign

Each row is a real UI play to the final horizon. Destination values follow the order in its saved JSON; ✓ means eligible quality. Aquifer columns show remaining/required reserve. Every authored-plan test deliberately pressed Hint so it cannot masquerade as an unaided first success.

| Mission | Outcome | Destination water / goal and quality | Aquifer / reserve |
|---|---|---|---|
| 1 הפתח הראשון | Won | 21.2/16 ✓ | — |
| 2 הבית שבדרך | Won | 20.2/12 ✓ | — |
| 3 לאט עם השער | Won | 24.0/12 ✓ | — |
| 4 אגן חדש | Won | 19.7/12 ✓ | — |
| 5 מה נבלע בקרקע | Won | 11.6/10 ✓ | — |
| 6 חצר האספלט | Won | 11.6/10 ✓ | — |
| 7 מדרגות הנחל | Won | 19.2/12 ✓ | — |
| 8 הגשם הבא | Won | 28.5/19 ✓ | — |
| 9 האקוויפר | Won | 17.1/5 ✓ | 12.1/1 |
| 10 באר עמוקה מדי | Won | 12.0/5 ✓ | 12.8/11 |
| 11 מקור מזוהם | Won | 17.1/5 ✓ | 12.1/1 |
| 12 חוזרים למקור | Won | 18.4/4 ✓ | 10.6/3 |
| 13 מלח במים | Won | 19.6/12 ✓ | — |
| 14 הממברנה | Won | 19.8/10 ✓; 12.2/7 ✓ | — |
| 15 לא לאותו צינור | Won | 19.8/10 ✓; 12.2/7 ✓ | — |
| 16 לילה בלי הספק | Won | 16.5/11 ✓; 6.5/3 ✓ | — |
| 17 מים לסיבוב נוסף | Won | 25.8/12 ✓; 0.0/0 ✓ | — |
| 18 אל השורש | Won | 20.2/14 ✓; 0.0/0 ✓ | — |
| 19 שתי רשתות | Won | 25.8/12 ✓; 15.0/9 ✓ | — |
| 20 הנחל צריך מים | Won | 16.1/7 ✓; 15.9/5 ✓ | — |
| 21 בצורת באגן | Won | 13.6/7 ✓; 8.4/4 ✓; 13.8/8 ✓; 4.6/2 ✓ | 8.4/3 |
| 22 מבול קצר | Won | 35.0/20 ✓ | — |
| 23 תכנית משלכם | Won | 19.8/9 ✓; 12.2/7 ✓ | — |
| 24 האגן החי | Won | 9.9/7 ✓; 12.2/5 ✓; 17.5/10 ✓; 9.9/3 ✓ | 13.0/3 |

Per-level `level-NN-solution-flow.png`, `level-NN-solution-result.png` and JSON files are in [playtest-captures](docs/playtest-captures). Flow captures for all 24 were opened and visually inspected. Later visual changes were recaptured for 17/19/21/24; earlier frames retain their tested rendering revision.

## Mistake → rewind → improvement

| Mission | Actual physical mistake | Verified recovery |
|---|---|---|
| 2 | Open bypass without blocking the courtyard branch; real flood exposure fails | R restores finite pulse, preserve excavation, raise the branch barrier, win |
| 6, paired with 5 | Same cut and finite input while asphalt remains sealed; zero recharge despite supply | R, unseal using actual earth budget, recharge and supply both pass |
| 10 | Pump at maximum; existing aquifer reserve is depleted | R, reduce pump rate, satisfy supply plus reserve |
| 15 | Send membrane brine into freshwater outlet; salt concentration rejects drinking store | R, separate the brine outlet, both streams meet their destinations |
| 17 | Send treated reuse to drinking tank; nonpotable provenance remains | R, connect eligible farm; drinking tank remains uncontaminated |
| 19 | Mix treated reuse with the town network | R, separate town freshwater and farm reuse, meet both demands |

These six mistake states, their flow/result captures and improved wins are saved. Level 24 ran both delayed weather pulses through the full horizon; [second-pulse capture](docs/playtest-captures/level-24-second-pulse-flow.png) shows the later flow and simultaneous destinations.

## Controls, persistence and display

18 checks passed: Space pause/resume, Escape pause, R finite-pulse restore, terrain/budget reset, right-drag orbit, reset camera, wheel zoom, F fullscreen and Escape exit, arrow/Enter terrain brush, hinted/unaided separation, mute and completed progress across reload, saved tested-plan restore with a fresh pulse, mobile touch excavation/drag without scrolling, mobile run/pause, reduced motion, porous-rock cutaway, keyboard inspection, and R preserving the actual excavated terrain/budget. Related checks are grouped in the saved report.

The blur-handler check dispatches a synthetic blur event: headless tab activation did not emit native OS blur. The handler pauses correctly; a manual native app-switch audit is not claimed. Mobile input was tested at **390 × 844**; desktop campaign at **1440 × 900**, DPR 1. [Mobile capture](docs/playtest-captures/controls-mobile-touch.png), [groundwater cutaway](docs/playtest-captures/controls-groundwater-cutaway.png).

## Measured production preview

Fresh-context resource timing recorded **2,813,915 bytes transferred** (**2,811,815 encoded response bytes**) across the HTML, bundled JS/CSS, two local Hebrew fonts and two Tripo GLBs. All requests were local. The report records resource paths, byte counts and durations.

After loading, the context was taken offline. Actual pointer excavation and release still won. The game ran for more than five real seconds before samples; three reported FPS samples were **60, 60, 60** on local headless Chromium with Metal at 1440 × 900, DPR 1. These are measurements of this machine/configuration, not a mobile or universal performance claim. `advanceTime` was not used during the FPS sampling window.

## Defects found and corrected

The initial suite was 53/64, then 60/64. Real failures exposed unreachable reserves, unsafe gate rates, adjacent/crossing quality networks, and intended mistakes that still won. The lead repaired actual terrain separation, branches, input/energy/pump tuning and final constraints. The final suite is 66/66; none of those failures was waived.

Browser QA found occluded excavation, camera reset momentum, Escape fullscreen exit and misleading result checks. The lead made heightfield selection and relief readable, cleared reset momentum, explicitly exits fullscreen, prioritizes quality failure captions and checks both quantity and quality for result marks. Actual controls and affected captures were re-run. Level 21 received a finite fresh recharge source and permeable branch so its renewal objective is modeled rather than only named.

## Limits

The heightfield is a compact conservative educational model, not engineering hydraulics. Groundwater is a lumped porous-rock store; level 7 clears an existing sediment deposit rather than simulating suspended sediment or geological soil formation. Numeric budgets, rates, quality thresholds and compressed time are original tuning values. Treatment is not real potable-water certification. Visual differences from the design targets are reviewed in VISUAL_REVIEW.md. Source scope and corrections are in CURRICULUM.md. Student testing is still needed to evaluate enjoyment, difficulty and learning.
