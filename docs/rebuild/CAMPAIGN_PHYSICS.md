# Current freeform campaign — independent proof for all 24 missions

The complete current campaign is authored in `src/freeform/campaign.ts`. All 24 missions preserve arbitrary soft-ground digging/filling and freely positioned finite levees. Each has a physical construction that wins after the entire finite storm, and each untouched map floods at least one actual courtyard. The former one-map stop is superseded; the retired technology/quality campaign is not being counted as these 24 missions.

**76/76 campaign tests pass**, plus **36/36 opening/recovery tests**. These 112 active checks are separate from the retired 66-model suite; `npm test` runs 178 in total. The current campaign reporter is `tests/latest-freeform-campaign-results.txt` (8.54 seconds for the focused run). Full numerical records, including all four independent mass errors and measured flux, are in `campaign-model-proof.json`. Model passes establish feasibility and rule consistency, not fun or measured learning gains.

## What differs and what stays free

The 24 explicit configurations vary source position, courtyard footprint placement, downhill and lateral slope, shallow natural gullies, soft shoulders/sills, protected limestone islands, earth budget, available levees, finite release rate, delayed unequal second waves and actual permeable meadows. See `PLAN24.md` for each mission's planning decision and `CAMPAIGN_CURRICULUM.md` for exact Workbook source mapping and scientific limits.

There are no product known-plan constructions, dig patches, wall sockets or route-completion flags. The actual bed/barrier field drives conservative hydraulic-head transfers. Product configs contain geography and storms only. QA constructions are isolated in `tests/freeform-campaign-witnesses.ts`; every point is passed through the same public `commitDig` / `placeWall` API. Changing a title or clicking the right number of times cannot award a rescue.

Mission 1 retains the original first-map elevations, protected footprints, source 80, target 64, budget 155 and stock 3 exactly. A saved first-map construction restores and still receives 70.7903237972 in its original reference plan. `load(n)` changes the actual map and resets construction/pulse state; stock, budget, protected ground and every saved history snapshot validate against the selected mission.

## Complete-event outcome contract

Every witness runs the complete 100-unit model horizon through `advance(8, false)`. This disables early flood freeze for analysis, including bad plans, without bypassing final home safety, release, coast receipt or soil-renewal conditions.

1. Every scheduled source store must actually release its finite water. Required release is total configured input minus at most 0.001. Delayed pulses use the same visible reservoir/outlet, with separate actual source stores and schedules.
2. Actual water must transfer into the broad southern coast receiver stores. Each mission's target is explicit. Water left in a trench remains on the surface and receives no coast credit.
3. All three **3×3 courtyard footprints** must remain safe. For each, exposure integrates `dt × max(0, maximum footprint water depth − 0.22)` and must not exceed 0.12. These thresholds were not relaxed to cure browser failures.
4. Missions 9, 17, 21 and 24 also require actual renewal. Permeability removes the same surface water and its tracers into explicit aquifer storage. It does not erase water or create a second credited parcel.
5. Actual excavation/levees must remain within their per-mission budget, stock, bounded depth and protected-ground constraints.

The independent ledger sums raw surface arrays plus every source, receiver, aquifer, sludge, evaporation, soil and lost store. Water, salt, contamination and reuse provenance each remain within `1e-7` of initial mass; all stores must be finite and nonnegative. It does not use the engine's `accounting()` to decide conservation. Additional nonzero-tracer fixtures cross delayed releases and real permeable soil. Those fixtures test accounting, not potable-water certification or discharge suitability.

The first 25 model units take five real seconds; the remaining 75 take three. No early dry state wins. Delayed sources at model times 34–42 still contain their untouched finite second volume at time 25, and tests require their actual complete release by the final horizon. The long weak event in mission 20 likewise has unreleased water at time 25. Ordinary home failure can freeze after at least two real seconds, preserving its actual stores.

## All 24 full-horizon results

Receipt and recharge columns show actual / required. Exposure shows all three courtyard integrals; each must be at most 0.12. The final column is the **maximum no-edit courtyard exposure**, demonstrating an actual physical failure on every map. All witnesses fully release their configured water and pass the independent ledgers.

| # | Mission | Coast receipt | Soil recharge | Home exposures | Earth / budget | Levees / stock | No-edit max exposure |
|---|---|---:|---:|---|---:|---:|---:|
| 1 | הצילו את הכפר | 70.79/64 | 0/0 | 0, 0, 0 | 68.6/155 | 2/3 | 3.771 |
| 2 | מים ממערב | 70.59/64 | 0/0 | 0, 0, 0 | 64.4/155 | 0/2 | 1.687 |
| 3 | מים ממזרח | 70.27/64 | 0/0 | 0, .0355, .0365 | 64.4/145 | 0/3 | 2.559 |
| 4 | שלושה במורד | 68.40/64 | 0/0 | 0, 0, 0 | 72.8/140 | 2/3 | 2.847 |
| 5 | גב האבן | 69.49/64 | 0/0 | .0393, .0012, 0 | 68.6/155 | 2/3 | 3.527 |
| 6 | הכתף הנמוכה | 76.55/64 | 0/0 | 0, 0, 0 | 74.2/135 | 1/3 | 2.447 |
| 7 | סוללה אחת | 68.85/64 | 0/0 | .0386, 0, 0 | 67.2/125 | 1/1 | 3.360 |
| 8 | שני גלים | 65.77/64 | 0/0 | .0076, 0, 0 | 75.6/155 | 1/3 | 2.921 |
| 9 | הקרקע ששותה | 63.67/60 | 5.41/2 | 0, .0823, 0 | 72.8/155 | 1/3 | 3.686 |
| 10 | חוף תלול | 76.60/64 | 0/0 | 0, 0, 0 | 95.2/140 | 1/3 | 4.795 |
| 11 | מעבר בין סלעים | 71.92/64 | 0/0 | .0131, .0004, 0 | 74.2/150 | 2/3 | 3.248 |
| 12 | מפרץ ארוך | 68.43/60 | 0/0 | 0, .0061, 0 | 72.8/120 | 2/3 | 5.087 |
| 13 | גשם קצר וחזק | 73.20/66 | 0/0 | .0371, .0594, 0 | 72.8/150 | 2/3 | 3.226 |
| 14 | הבתים המפוזרים | 68.23/64 | 0/0 | 0, 0, 0 | 75.6/145 | 1/2 | 3.202 |
| 15 | ערוץ נוטה | 68.46/64 | 0/0 | 0, 0, 0 | 84.0/140 | 1/3 | 4.040 |
| 16 | הגל המאוחר | 75.54/68 | 0/0 | 0, 0, 0 | 70.0/150 | 2/3 | 2.181 |
| 17 | אחו במזרח | 64.06/61 | 5.24/3 | 0, .0518, 0 | 64.4/155 | 1/3 | 4.061 |
| 18 | מעט אדמה | 68.97/64 | 0/0 | .0143, 0, 0 | 64.4/88 | 0/2 | 2.057 |
| 19 | כפר על המדרגה | 66.03/64 | 0/0 | 0, 0, 0 | 74.2/145 | 2/3 | 4.155 |
| 20 | נחל ארוך | 77.24/66 | 0/0 | 0, 0, 0 | 75.6/145 | 1/3 | 2.783 |
| 21 | שתי קרקעות | 68.87/61 | 5.42/4 | .0001, 0, 0 | 67.2/155 | 1/3 | 3.510 |
| 22 | שיטפון כפול | 81.67/74 | 0/0 | 0, .0077, 0 | 75.6/160 | 0/3 | 1.113 |
| 23 | הכפר שמנגד | 70.03/64 | 0/0 | 0, 0, 0 | 58.8/135 | 1/2 | 2.737 |
| 24 | אגן שלם | 76.89/72 | 5.42/3 | 0, 0, 0 | 77.0/150 | 1/2 | 4.278 |

Smallest ideal construction receipt margin is mission 8, at 1.77 units. This is a measured limit, not a guarantee that every nearby plan works. Its scheduled real-time browser wave also passes.

## Physical differences and counterfactuals

The original two opposite-flank first-map plans remain valid, as documented in `FREEFORM_PHYSICS.md`. In the campaign, mission 2 conveys **56.98** units through the western row-12/13 cross-section and only 3.29 through the east; mission 3 conveys **61.55** through the east and only 0.019 through the west. These are signed actual conservative transfers, with reverse crossings subtracted. Thus a shifted source and different construction produce genuinely different water passage, rather than renamed copies.

Every map has a distinct actual heightfield, substantial arbitrary editable ground, three protected courtyards and empty product `knownPlan`, `cuts` and `routes` arrays. A cross-island free drag excavates available surrounding soil while leaving protected limestone unchanged. Reload and saved-history checks enforce the selected map's actual stone, home, stock and budget constraints.

Sealing the permeability in each of the four renewal missions transfers **zero** water into aquifer storage and fails renewal; the otherwise identical permeable case transfers real conserved water. Coast receipt is higher in the sealed counterfactual, exposing the actual allocation tradeoff. The first-map suite separately retains disconnected-ditch, harmful courtyard channel, all-block dam, dead-end channel, storage pit and closed-inlet counterexamples, plus causal wall ablations.

## Browser failures informed actual revisions

The first actual-input campaign batch did not receive a blanket pass: missions 6, 10, 16 and 20 failed despite ideal model witnesses. Pointer/raster changes selected slightly different terrain cells, and a wall aimed at a trench bank could land farther uphill. The model's safety tolerance was unchanged.

- **6:** lower the actual broad coastal exit by 0.6 and place the single deflector on clear ground at `(15,10)`. This is real relief/transfer, not credited disappearance. Seven constructed path/wall variations pass; the targeted actual UI receives 76.547/64 with zero home exposure.
- **10:** create a wider upstream diversion with two actual parallel brush strokes. Add a real broad 0.3 soft shoulder near the lower courtyard and lower the coastal exit by 0.6; the homes still use the same safety rule. Seven path/wall variants pass, as do three tests using the observed wall position over a cell uphill. The targeted actual UI receives 75.672/64 with zero home exposure. Its untouched map still has maximum exposure 4.795.
- **16:** intercept earlier, use the inner western reach and add two off-bank shields. Seven construction variations pass; the targeted actual UI receives 75.541/68 with zero exposure through both scheduled pulses.
- **20:** put the deflector at an unobscured planning position `(15,13)`. Seven variations pass; the targeted actual UI receives 77.816/66 with zero exposure through the sustained release.

All 24 now have individual actual-UI successful runs in the lead's `campaign-captures/` evidence. Mission 24's real eight-second browser wave receives 77.198/72, recharges 5.370/3 and has zero courtyard exposure. These are separate from this independent numerical proof; the lead owns the final continuous progression/control run and its report. Browser fixtures use actual pointer/tool controls with read-only projection; selected waves use real elapsed time, others the documented deterministic clock after construction. They are not blind player trials or proof of enjoyment. Art's separate ordinary-touch mission-2 attempt, made without the fixtures, also rescues the village and advances to a fresh mission 3.

No further configuration or model edits are pending. Human response to the full campaign remains the appropriate evidence for whether the revised rescue play is engaging and understandable.
