# Basin Breakers QA — current 24-mission freeform campaign

Run every command in `/Users/acedzn/dev/AceDZN-exp/basin-breakers`.

- `npx tsx --test tests/freeform-campaign.test.ts`: 76 current campaign checks, including one public-action complete-wave win and one actual no-edit courtyard failure for **each of 24 authored maps**. Independent raw-store ledgers, real delayed pulses, soil renewal versus sealed soil, fixed limestone, changed water routes, per-level construction/history limits, load/level1 save compatibility, rough construction and observed UI-offset regressions. Latest reporter: `latest-freeform-campaign-results.txt`; full numerical proof: `docs/rebuild/campaign-model-proof.json`.
- `npx tsx --test tests/freeform.test.ts`: 36 first-map and recovery checks. Two materially different actual flux routes, rough construction variations, causal wall ablations, harmful/stranded plans, independent water/salt/contamination/reuse ledgers, timing, construction limits, filling/refunds, paused/run Undo and validated saved-action-history recovery. The first map's geometry/source/budget are preserved exactly. Latest result: `latest-freeform-model-results.txt`.
- `npx tsx tests/campaign-browser.ts`: lead-owned current campaign parity. Actual pointer strokes, free wall placement and visible controls across all24; selected scheduled-wave levels use real elapsed time and others use the documented clock after construction. Internal fixtures are never imported by the product. This is targeted regression, not blind human play.
- `FREEFORM_BASE=http://localhost:4302/ npx tsx tests/freeform-browser.ts`: current campaign actual-control regression, including pointer/touch construction and controls. This uses read-only projection for targeted input and cannot substitute for a newcomer inventing a plan.
- `FREEFORM_BASE=http://localhost:4302/ npx tsx tests/freeform-recovery.ts`:7 actual excavation-trap controls, including touch, paused/running recovery and saved Undo.
- `npx tsx tests/campaign-progression.ts`:7 migration/Next/selection/replay checks through dev5302 prototype and campaign entries.
- `npx tsx tests/freeform-playthrough.ts`: lead-owned model-to-UI witness parity using real pointer actions and elapsed time. Internal solutions are QA fixtures, never product guidance.
- `npm test`: 178 checks: 112 active freeform checks (76 campaign +36 first-map/recovery), plus the legacy 66-model suite. Legacy passes do not establish the new game's usability.

Independent current proof and its limits: `docs/rebuild/CAMPAIGN_PHYSICS.md`; opening two-route proof: `docs/rebuild/FREEFORM_PHYSICS.md`. Ordinary visible-input audit captures: `docs/rebuild/audit/freeform-*`. The auditor drew a plan from the rendered map without fixture coordinates/projection/time hooks and observed a successful real-time flood; prior model knowledge means this is not a naive student or fun study. After the human's excavation-trap report, a separate ordinary-touch phone audit verified Fill, refund, Undo and paused-wave recovery. Current geography mapping is `docs/rebuild/CAMPAIGN_CURRICULUM.md`; retired quality missions remain historical.

## Historical campaign harnesses

The following belong to the superseded 24-level game. They remain regression/history tools and are not current freeform acceptance evidence.

- `node_modules/.bin/tsx tests/browser-qa.ts`: real UI campaign inputs. Set `BASIN_QA_LEVELS=1,2,5,6,10,15,17,19,24` or all 1–24. Every authored-plan run is marked hinted. Read-only state/projection diagnostics and the documented clock do not inject a plan or win.
- `node_modules/.bin/tsx tests/browser-controls.ts`: keyboard, orbit/zoom/fullscreen, persistence, local replay and mobile touch checks.
- `node_modules/.bin/tsx tests/browser-extras.ts`: porous cutaway, keyboard inspection and actual R terrain preservation against production preview.
- `node_modules/.bin/tsx tests/browser-performance.ts`: fresh production preview resource timing, actual-time FPS samples, then offline input play.

Dev URL: `http://localhost:5302`; production preview: `http://localhost:4302`. Local Chromium uses `--use-angle=metal`; software SwiftShader initialization was slow on this machine. The lead separately uses the develop-web-game skill action client as required.

Historical evidence lives in `docs/playtest-captures/` and `docs/history/`. `latest-model-results.tap` retains the legacy readable Node reporter output (66/66); its suffix does not claim strict TAP syntax. The previous guided rescue prototype was rejected by the human and is recorded in `docs/rebuild/REJECTED_HISTORY.md`.

No solution-identifier match, injected success flag, or transient early fill counts as physical solvability. Final evaluation follows the full event horizon. Internal authored-plan QA is not an unaided student trial or evidence of learning gains.
