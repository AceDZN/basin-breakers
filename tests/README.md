# Basin Breakers QA

Run every command in `/Users/acedzn/dev/AceDZN-exp/basin-breakers`.

- `npm test`: 66 independent model and campaign checks in `sim.test.ts`; actual edits/devices/time, independent mass totals, all 24 known/bad plans, final reserves and quality.
- `node_modules/.bin/tsx tests/browser-qa.ts`: real UI campaign inputs. Set `BASIN_QA_LEVELS=1,2,5,6,10,15,17,19,24` or all 1–24. Every authored-plan run is marked hinted. Read-only state/projection diagnostics and the documented clock do not inject a plan or win.
- `node_modules/.bin/tsx tests/browser-controls.ts`: keyboard, orbit/zoom/fullscreen, persistence, local replay and mobile touch checks.
- `node_modules/.bin/tsx tests/browser-extras.ts`: porous cutaway, keyboard inspection and actual R terrain preservation against production preview.
- `node_modules/.bin/tsx tests/browser-performance.ts`: fresh production preview resource timing, actual-time FPS samples, then offline input play.

Dev URL: `http://localhost:5302`; production preview: `http://localhost:4302`. Local Chromium uses `--use-angle=metal`; software SwiftShader initialization was slow on this machine. The lead separately uses the develop-web-game skill action client as required.

The consolidated final evidence lives in `docs/playtest-captures/` and PLAYTEST.md. `latest-model-results.tap` retains the final readable Node test reporter output (66/66); the suffix is historical rather than a claim that the reporter text is strict TAP syntax. Stale intermediate raw logs/screenshots were removed after their defects and fixes were documented.

No solution-identifier match, injected success flag, or transient early fill counts as physical solvability. Final evaluation follows the full event horizon. Internal authored-plan QA is not an unaided student trial or evidence of learning gains.
