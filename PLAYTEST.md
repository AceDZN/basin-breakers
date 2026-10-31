# Current24-level campaign verification

31 October2026. The human won the freeform prototype and expected further levels. Stopping at one map was an incomplete milestone. The current main page now delivers24 authored freeform missions, proper Next flow, per-map saved plans/history and a completed campaign screen. Original24 quality-game and guided-plug evidence remain retired in [history](docs/history/V1_PLAYTEST.md).

## Final results

- `npm run build` passed. `npm test`:178/178 =76 current campaign +36 opening/recovery +66 retired-engine regression. The legacy66 do not count as new campaign coverage.
- **24/24 browser wins in one continuous run**, through actual pointer/tool construction. All23 Next transitions opened the following actual map; the24th win opened the completed24/24 level map. Exactly one canvas remained after each swap; no browser errors.
- Missions2/8/16/24 used normal elapsed-time waves. Other internal parity missions used documented `advanceTime` after actual construction. Every result reached100-model-second horizon, fully released its finite sources and met all physical constraints. No geometry/answer/win state was injected into the browser.
-14 actual control checks,7 excavation-trap recovery checks and7 progression/migration checks passed against current code. These include real touch, fill/refund, Undo during flow, sparse saved history, old first-map win migration, independent per-level plans, failure staying on the same map and reload selection.
- Independent ordinary phone play: one screenshot-chosen touch trench on level2, a natural wave, win and Next to a fresh3, without fixtures/projection/clock hook. Emulator/author familiarity limits are disclosed in [phone method](docs/rebuild/campaign-captures/phone-play-method.md).
- All24 untouched maps fail actual courtyard safety. Pure witnesses independently sum water/salt/contamination/provenance ledgers within1e-7; delayed-wave, soil-storage, fixed-rock and rough-construction cases pass. Full proof: [CAMPAIGN_PHYSICS.md](docs/rebuild/CAMPAIGN_PHYSICS.md).

## Browser outcomes

Receipt and recharge are actual model units, not visual fill flags. Courtyard exposure must stay≤0.12 after integrating depth above0.22 across the full event; safe does not mean absolutely dry.

| Mission | Coast / goal | Recharge / goal | Maximum home exposure | Playback |
|---|---|---|---|---|
| 1 הצילו את הכפר | 70.79/64 | 0.00/0 | 0.00000 | Clock hook |
| 2 מים ממערב | 70.59/64 | 0.00/0 | 0.00000 | Real wave |
| 3 מים ממזרח | 70.27/64 | 0.00/0 | 0.03626 | Clock hook |
| 4 שלושה במורד | 68.40/64 | 0.00/0 | 0.00000 | Clock hook |
| 5 גב האבן | 69.49/64 | 0.00/0 | 0.03734 | Clock hook |
| 6 הכתף הנמוכה | 76.55/64 | 0.00/0 | 0.00000 | Clock hook |
| 7 סוללה אחת | 68.85/64 | 0.00/0 | 0.03700 | Clock hook |
| 8 שני גלים | 66.38/64 | 0.00/0 | 0.00622 | Real wave |
| 9 הקרקע ששותה | 63.96/60 | 5.26/2 | 0.10152 | Clock hook |
| 10 חוף תלול | 75.67/64 | 0.00/0 | 0.00000 | Clock hook |
| 11 מעבר בין סלעים | 72.52/64 | 0.00/0 | 0.01869 | Clock hook |
| 12 מפרץ ארוך | 62.48/60 | 0.00/0 | 0.08391 | Clock hook |
| 13 גשם קצר וחזק | 67.29/66 | 0.00/0 | 0.00657 | Clock hook |
| 14 הבתים המפוזרים | 68.23/64 | 0.00/0 | 0.00000 | Clock hook |
| 15 ערוץ נוטה | 68.57/64 | 0.00/0 | 0.00000 | Clock hook |
| 16 הגל המאוחר | 75.54/68 | 0.00/0 | 0.00000 | Real wave |
| 17 אחו במזרח | 64.06/61 | 5.24/3 | 0.04924 | Clock hook |
| 18 מעט אדמה | 68.97/64 | 0.00/0 | 0.01318 | Clock hook |
| 19 כפר על המדרגה | 66.54/64 | 0.00/0 | 0.00000 | Clock hook |
| 20 נחל ארוך | 77.82/66 | 0.00/0 | 0.00000 | Clock hook |
| 21 שתי קרקעות | 68.90/61 | 5.39/4 | 0.00000 | Clock hook |
| 22 שיטפון כפול | 81.68/74 | 0.00/0 | 0.00757 | Clock hook |
| 23 הכפר שמנגד | 70.03/64 | 0.00/0 | 0.00000 | Clock hook |
| 24 אגן שלם | 77.20/72 | 5.37/3 | 0.00000 | Real wave |

Raw states, construction geometry and flow/result images: [campaign-captures](docs/rebuild/campaign-captures). [Continuous campaign report](docs/rebuild/campaign-captures/campaign-browser-summary.json), [complete map](docs/rebuild/campaign-captures/campaign-complete-map.png), [progression report](docs/rebuild/campaign-captures/progression-summary.json).

## Defects corrected rather than waived

The first campaign browser sweep won20/24. Four ideal model plans did not tolerate actual pointer geometry:6 stranded water;10/16/20 exceeded a courtyard limit. We widened the actual10 diversion and authored a real broad shoulder/coastal exit, gave6 a real lower coastal exit, and chose stronger off-bank interception/shielding for16/20. Safety thresholds were unchanged. Exact observed wall offsets and rough variations were tested before rerunning those maps and the entire continuous campaign. Final24/24 is from the corrected fields/plans.

The earlier human excavation trap was repaired with free Fill/refund, active-wave Undo, reversible reset and validated actual saved action history. Full-plan wiping is never disguised as Undo of an unknown legacy action. Existing first-map completion and construction survive migration. Per-map sparse saves keep history compact; storage errors do not disable live controls.

Renderer tests covered24 actual map selections at390×844 and a delayedGLB1→2→3 replacement race, retaining one canvas and no shader/context warnings. Important2/9/24 bounds were visually checked. This is not measured physical-phone performance. Generated-versus-actual gaps remain in [VISUAL_REVIEW.md](VISUAL_REVIEW.md).

## Reproduce

```sh
npm test
npm run build
npx tsx tests/campaign-browser.ts
FREEFORM_BASE=http://localhost:4302/ npx tsx tests/freeform-browser.ts
FREEFORM_BASE=http://localhost:4302/ npx tsx tests/freeform-recovery.ts
npx tsx tests/campaign-progression.ts
```

The campaign browser harness uses production preview4302; migration checks use dev5302's retained `/freeform.html` prototype and `/campaign.html` current entry. Keep both local servers running. The required develop-web-game action client was also run and its actual screenshot/text inspected. Internal witnesses are feasibility/parity checks, not unaided student trials or evidence of learning gains. No deployment is claimed.
