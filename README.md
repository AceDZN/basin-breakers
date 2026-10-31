# Basin Breakers — פורצי האגן

A Hebrew 3D flood-rescue puzzle. The active rebuild is **one open construction map**: draw your own trenches through broad soil, place up to three freely positioned and rotated levees, then test a finite flood. Protect all three courtyards while at least64 of80 water units reach the broad lower coast. Retry retains construction; Undo reverses the last edit and refunds its resources.

The human rejected the original24-level version and the later guided sand-plug version. Their source and historical evidence remain; those passes do **not** establish that the rebuilt interaction is clear or enjoyable. See [rejected history](docs/rebuild/REJECTED_HISTORY.md) and the active [freeform plan](docs/rebuild/FREEFORM_PLAN.md). Campaign expansion follows a dependable core and direct human feedback.

## Run

```sh
npm ci
npm run dev
npm run build
npm test
```

Local game: http://localhost:5302 . Strict dev port5302, production preview4302 (`npm run preview`). Static relative assets, no backend, keys, runtime LLM or analytics. No production deployment is claimed.

## Current controls

- **חפירה:** drag through available warm soil. Your pointer stroke determines the excavated geometry. One consistent bounded depth; overlapping excavation is not charged twice. Foundations and fixed stone are protected.
- **מילוי:** drag across a previous excavation to restore soil and refund its actual earth cost. Undo can reverse the fill too.
- **סוללות:** choose the levee tool, rotate with the visible button or **R**, then place a fixed-size piece anywhere legal. Click an existing levee with the shovel selected to move or remove it. Three pieces total.
- **בדיקת השיטפון:** release the finite event. **Space** pauses/resumes. A flood freezes with actual water still present. Return to planning to revise retained construction.
- **Z / ↶:** Undo last construction, including during a running/paused wave (returns to planning). **1 / 2 / 3:** shovel/levee/fill. **F:** fullscreen. **Escape:** close help/pause/exit fullscreen. Touch has equivalent controls. Focus loss pauses. Sound starts muted and can be enabled. A visible reset is itself undoable. Validated plan and the latest32 actual Undo snapshots save locally; old saves without history remain editable using Fill.

No marked answer spots, wall sockets or route-completion checks. Outcomes depend on actual terrain, barriers and water, including unexpected legal plans.

## Physical scope

The deterministic conservative cardinal-grid model transports finite water and dissolved tracers according to hydraulic-head differences. Trenches change bed elevations; levees change crests. Home safety checks every cell of each courtyard over time. Success requires full source release, actual safe receipt and all three protected footprints. Stranding the pulse cannot win.

Maps, compressed time, budgets and units are original simplified teaching scenarios, not engineering predictions. The active map focuses on drainage and flood planning. The retired campaign modeled infiltration, lumped groundwater, salinity, membranes and reuse; source scope/caveats remain in [CURRICULUM.md](CURRICULUM.md). No learning gain or enjoyment is established by internal QA.

## Design and evidence

- [Freeform targets06/07](docs/rebuild/mockups/README.md), generated with built-in imagegen and inspected before implementation.
- [Agency review](docs/rebuild/AGENCY_REVIEW.md): physical alternatives, real bad plans, ordinary-input reliability and proof limits.
- [PLAYTEST.md](PLAYTEST.md), [VISUAL_REVIEW.md](VISUAL_REVIEW.md): current evidence, separated from rejected versions.
- [ASSETS.md](ASSETS.md): original Tripo acquisition through the user's Chrome,60 displayed existing credits, no purchases. Two GLBs total2,616,388bytes; local Hebrew fonts. No additional credits spent on this rebuild.
- [Historical v1 records](docs/history): retired24-level technical evidence retained for provenance.

Public source: https://github.com/AceDZN/basin-breakers . Authorized main; no force pushes.
