# Basin Breakers QA — current freeform prototype

Run every command in `/Users/acedzn/dev/AceDZN-exp/basin-breakers`.

- `npx tsx --test tests/freeform.test.ts`: 36 independent freeform checks. Two materially different actual flux routes, rough construction variations, causal wall ablations, harmful/stranded plans, independent water/salt/contamination/reuse ledgers, timing, construction limits, filling/refunds, paused/run Undo and validated saved-action-history recovery. The latest result is `latest-freeform-model-results.txt`.
- `npx tsx tests/freeform-browser.ts`: current actual-control regression, including pointer/touch construction and controls. This uses read-only projection for targeted input and cannot substitute for a newcomer inventing a plan.
- `npx tsx tests/freeform-playthrough.ts`: lead-owned model-to-UI witness parity using real pointer actions and elapsed time. Internal solutions are QA fixtures, never product guidance.
- `npm test`: runs both the current freeform suite and the legacy 66-model suite. Legacy campaign passes do not establish the new game's usability.

Independent proof and its limits: `docs/rebuild/FREEFORM_PHYSICS.md`. Ordinary visible-input audit captures: `docs/rebuild/audit/freeform-*`. The auditor drew a plan from the rendered map without fixture coordinates/projection/time hooks and observed a successful real-time flood; prior model knowledge means this is not a naive student or fun study. The human's reported excavation trap subsequently required fill and recovery fixes.

## Historical campaign harnesses

The following belong to the superseded 24-level game. They remain regression/history tools and are not current freeform acceptance evidence.

- `node_modules/.bin/tsx tests/browser-qa.ts`: real UI campaign inputs. Set `BASIN_QA_LEVELS=1,2,5,6,10,15,17,19,24` or all 1–24. Every authored-plan run is marked hinted. Read-only state/projection diagnostics and the documented clock do not inject a plan or win.
- `node_modules/.bin/tsx tests/browser-controls.ts`: keyboard, orbit/zoom/fullscreen, persistence, local replay and mobile touch checks.
- `node_modules/.bin/tsx tests/browser-extras.ts`: porous cutaway, keyboard inspection and actual R terrain preservation against production preview.
- `node_modules/.bin/tsx tests/browser-performance.ts`: fresh production preview resource timing, actual-time FPS samples, then offline input play.

Dev URL: `http://localhost:5302`; production preview: `http://localhost:4302`. Local Chromium uses `--use-angle=metal`; software SwiftShader initialization was slow on this machine. The lead separately uses the develop-web-game skill action client as required.

Historical evidence lives in `docs/playtest-captures/` and `docs/history/`. `latest-model-results.tap` retains the legacy readable Node reporter output (66/66); its suffix does not claim strict TAP syntax. The previous guided rescue prototype was rejected by the human and is recorded in `docs/rebuild/REJECTED_HISTORY.md`.

No solution-identifier match, injected success flag, or transient early fill counts as physical solvability. Final evaluation follows the full event horizon. Internal authored-plan QA is not an unaided student trial or evidence of learning gains.
