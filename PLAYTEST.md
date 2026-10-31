# Current freeform verification

31 October2026. The human rejected the original24-level game and guided sand-plug rebuild. Their evidence is retired in [history](docs/history/V1_PLAYTEST.md); numerical passes never establish that an interaction is enjoyable.

## Current checks

| Check | Result and limit |
|---|---|
| Static production | `npm run build` passed. Vite reports a732KB uncompressed JS chunk; no new performance/FPS claim. |
| Pure rules | `npm test`:102/102. **36 current freeform** tests plus66 historical-engine regression tests. Historical coverage does not mean24 rebuilt levels. |
| Physical agency | Two opposite-flank plans release all80, receive~70.79/64 and keep all courtyard exposures0. Signed actual row12 flux is53.90 east versus54.28 west. Rough variants and unexpected one-wall construction also pass; trench-only/wall-only ablations fail. |
| UI parity | Two actual-pointer plans with real elapsed waves won at65.03 and64.91 received. These use internal QA coordinates and are not unaided play. |
| Ordinary visible-input audit | Independent QA invented a screen-space trench/shield arrangement and won, with90/155 earth left. Prior model familiarity and one HMR interruption are disclosed in [rebuild PLAYTEST](docs/rebuild/PLAYTEST.md). |
| Control regression |14 checks: arbitrary soil, overlap cost, Undo, wall move/rotate/remove, pause, protected source, help/reset, finite retry, plan/history reload, fullscreen and actual390×844 touch. |
| Human excavation trap |7 focused actual-input recovery checks: free Fill/refund, Undo Fill, Undo during a wave, last-action Undo after reload, Fill after pause, phone touch Fill/Undo and reversible visible reset. |
| Required skill client | Built-in develop-web-game action client ran real excavation + Space against the production preview. Screenshot/text inspected; no console/page errors. |

The human reported “cannot undo what I dug, so I am stuck” during development. This overrode earlier optimism. We added free Fill, active-wave Undo, direct reversible reset, validated saved Undo history, and old-save compatibility without silently wiping a whole plan. See [recovery-summary.json](docs/rebuild/freeform-captures/recovery-summary.json), actual [phone Fill/Undo](docs/rebuild/freeform-captures/10-phone-fill-undo.png).

## Reproduce

```sh
npm test
npm run build
npx tsx tests/freeform-browser.ts
npx tsx tests/freeform-recovery.ts
npx tsx tests/freeform-playthrough.ts
```

The last three scripts drive ordinary controls. Projection is read-only; they never mutate game geometry/stores or inject a win. The parity script uses real elapsed waves. Supplemental audit notes/captures and raw states are in [freeform-captures](docs/rebuild/freeform-captures), physical fixtures/flux and independent ledgers in [FREEFORM_PHYSICS.md](docs/rebuild/FREEFORM_PHYSICS.md).

## Scope

One active freeform map. No current24-level completion, beginner acceptance, learning gain or fun claim. A fixed-heightfield educational model and tuned thresholds simplify real hydraulics; courtyard safety is a depth/exposure threshold, not literal zero wetness. Two validated alternatives are opposite-side conveyance plans, not a proven separate detention strategy. Art/phone differences remain explicit in [VISUAL_REVIEW.md](VISUAL_REVIEW.md).
