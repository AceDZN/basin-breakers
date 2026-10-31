# Freeform rescue: independent physical proof

This document retains the original first-map two-route proof. The **current full24 campaign** and its76 additional independent checks are documented in `CAMPAIGN_PHYSICS.md`; the first map remains exactly compatible. The one-map delivery boundary below is historical, not the final requested scope.

31 October 2026. The new map supports at least two materially different physical diversion plans. **This establishes feasibility and some construction freedom, not enjoyment, newcomer comprehension or completion of the 24-mission rebuild.** The earlier guided prototype remains rejected. The design criteria in AGENCY_REVIEW.md preceded this implementation; this document records the resulting evidence.

## What was actually tested

`src/freeform/model.ts` has a broad editable heightfield, one finite source, three protected 3×3 courtyard footprints and 27 explicit safe coast receivers across the lower boundary. Digging changes actual bed elevations; levees change actual hydraulic barriers. There are no product route identifiers, answer-patch flags or completion checks based on a known plan. Internal constructions live only in `tests/freeform-witnesses.ts` and are never imported by the product.

The current model has **36 passing independent freeform tests**, retained in `tests/latest-freeform-model-results.txt`. Run `npx tsx --test tests/freeform.test.ts` from the repository. The final focused run took 3.36 seconds. The legacy 66 campaign tests concern the former game and cannot certify this interaction.

The proof uses the public construction API, then runs the complete 100-unit model event with `advance(8, false)`. Disabling early failure freeze allows the *bad* plans to finish too; it does not bypass the final safety or receipt checks. No initial topography, budget, source or hydraulic constants needed tuning to obtain the two witnesses. QA subsequently changed only real-time pacing and recovery/persistence behavior.

## Exact success and accounting contract

- Source: 80 finite game-volume units, automatically released at rate 4 model units. At least 79.999 must actually leave the source.
- Safe destination: at least 64 units actually transfer into explicit southern coast receiver stores by the complete horizon. Residual surface water remains stored and does not count as safe passage.
- Homes: for each full 3×3 footprint, accumulate `dt × max(0, maximum footprint water depth − 0.22)`. Exposure must remain at most 0.12 for **every** home. Initially dry homes do not produce an early victory.
- Terrain: at most 155 earth units, excavation depth at most 1.4 per cell, radius 1.25 brush, protected source/homes unchanged. At most three finite physical levees, length 4, width 1.2, crest height 1.3.
- Every completed or frozen test independently sums all surface, source, receiver, aquifer, sludge, evaporation, soil and lost stores. Water, salt, contamination and reuse-provenance mass each remain within `1e-7` of their initial total; stores must be finite and nonnegative. The test ledger does not call the implementation's `accounting()` to decide its result.

These are tuned game units. The conservative heightfield model is not a predictive flood model; salt/contamination fixtures here verify bookkeeping, not environmental discharge suitability.

## Two actual alternatives

Coordinates below are internal reproducibility evidence, not instructions displayed to players. Both plans use two horizontal levees centered at `(14,9)` and `(15,14)`. Their channels and the resulting water paths differ substantially.

| Full-event measurement | East conveyance | West conveyance |
|---|---:|---:|
| Channel polyline | (14,7) → (19,10) → (23,13) → (24,18) → (23,20) | (14,7) → (9,10) → (5,13) → (4,18) → (5,20) |
| Released | 80 | 80 |
| Safe coast receipt | 70.790 | 70.791 |
| Earth used / 155 | 68.6 | 68.6 |
| Home exposures | 0, 0, 0 | 0, 0, 0 |
| Maximum home depths | 0.174, 0.170, 0.036 | 0.168, 0.172, 0.052 |
| Signed west-flank flux | 8.795 | 54.278 |
| Signed center flux | 16.276 | 16.336 |
| Signed east-flank flux | 53.900 | 8.357 |

Flux is measured from the solver's **actual conservative edge transfers** across the full row-12/13 cross-section. West means `x < 12`, center `12 ≤ x ≤ 16`, east `x > 16`; reverse crossings subtract rather than inflating the total. At least 60% of the original 80 units crosses the chosen flank in each witness. The excavated-cell overlap is below 25% of either witness's excavation. Reversed stroke and wall-input order producing the same final field gives the same physical result.

These are opposite-flank **conveyances**. A western detention-and-spill solution was a design hypothesis, and has not been proven; do not relabel this evidence as a different storage mechanism.

Four half-cell lateral channel perturbations all succeed with 70.13–70.82 safely received and zero exposure. Moving the two levees by small continuous offsets also succeeds on both sides. The perturbed west wall arrangement receives only 65.03, so its quantity margin is fairly narrow. This does not establish that all rough drags will work. A third plan, the eastern trench with only the downstream levee at `(15,14)`, also succeeds; the solver accepts useful unanticipated geometry.

## Causal failures and ablations

| Construction | Observed result | Physical implication |
|---|---|---|
| No edit | About 80 reaches the coast, center-home exposure 3.771, peak depth 0.426 | Safe receipt alone cannot erase flooding on the way |
| Eastern trench alone | 71.029 receipt, center exposure 1.314 | The barriers matter; carving a route alone is insufficient |
| Western trench alone | 71.029 receipt, center exposure 1.353 | The opposite route also needs actual deflection/protection |
| Same two levees without a trench | Floods homes despite sufficient receipt | Piece count or presence is not an answer flag |
| Closed inlet diagnostic | Released 0, received 0, homes dry, failure | Withholding the event cannot win |
| Disconnected decorative ditch | Same flood exposure as baseline | Arbitrary excavation has no magical remote routing effect |
| Trench toward the houses | Center peak 0.485, exposure 3.852 | A physically harmful channel worsens exposure |
| Three levees across the valley | 68.120 receipt, center exposure 0.257 | Spending all blocks does not automatically protect the village |
| Short dead-end trench plus two deflectors | Homes safe, only 53.984 receipt, over 16 still on surface | Keeping homes dry by stranding the flood is insufficient |
| Broad source-side pit | Only 44.521 receipt, over 30 remains on surface, home flooding | Retained water is real and never becomes invisible credited outflow |

The no-edit flood can freeze during ordinary play, while the full-horizon model test above proves its cause. The first 25 model units use five real seconds; the remaining 75 use three. This preserves the bounded hydraulic stepping while allowing the leading flood to be seen. A safety freeze waits until at least model time 10, approximately two real seconds. A full safe pulse takes eight real seconds and cannot win transiently.

## Construction and recovery checks

The tests independently cover arbitrary editable points away from either witness, fast versus densely sampled strokes, repeated overlap without repeat cost, full budget/depth limits, protected ground, wall rotation/movement/removal without ghost barriers, invalid placement without stock/history consumption and an unknown wall ID.

After the human reported being trapped by excavation, recovery was expanded:

- The same broad brush can fill excavated soft cells to their original elevation and refund their actual earth difference. Preview leaves the committed bed/cost/history untouched and preserves existing wall crests. Source, homes and currently occupied wall cells are protected.
- Fill itself is undoable. Empty, invalid and already-flat gestures consume nothing.
- Undo cancels a running or paused pulse and restores one construction snapshot. Without a prior action it returns to planning and preserves valuable geometry.
- Saved plans can persist up to 40 validated construction snapshots (the UI keeps the latest 32), so Undo after reload reverses the actual last action. A legacy save without history never invents a destructive whole-plan Undo; its geometry remains intact and the fill/clear tools remain available. Every snapshot must independently satisfy depth, budget, wall, coordinate and protected-ground constraints. Rejected history or geometry leaves the existing plan and pulse unchanged. Future wall IDs account for removed walls in every saved snapshot.

## Actual input evidence and remaining boundary

The independent desktop audit drew a new screen-space channel from the visible source down the right flank, then placed two levees from their visible previews. It did **not** use fixture coordinates, `cellToScreen`, a simulation time hook or injected state. The real-time flood finished with the visible rescue outcome, 90/155 earth left and one levee unused. See `audit/freeform-01-own-trench-preview.png`, `freeform-05-own-walls-ready.png`, `freeform-06-own-wave.png` and `freeform-07-own-outcome.png`.

The auditor already knew the model proof, so this is ordinary-control evidence, not a naive student trial. A lead source edit caused one HMR during construction; persistence retained the committed trench and the final wave ran after the source was frozen. Coast identity was initially ambiguous against the flat teal background, prompting a visible coast label. The bottom toolbar still competes with the near coast. The later fill/Undo changes passed the lead's seven-case browser recovery harness and an independent ordinary-touch phone review: actual dig, fill/refund, Undo fill, pause wave, and Fill back into planning. See `PLAYTEST.md` for the input sequence and capture limits.

Two real routes and reliable construction APIs pass the independent feasibility gate. Human enjoyment, transfer to later missions, and willingness to invent another rescue remain unproven. Campaign expansion should follow direct review of this map, not these numerical passes alone.
