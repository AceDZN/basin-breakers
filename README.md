# Basin Breakers — פורצי האגן

A Hebrew browser3D flood-rescue game with **24 authored freeform missions**. Draw your own trenches, fill unwanted excavation, place limited levees, test a finite flood and revise your plan. A win offers **השלב הבא**; a level map supports practice/replay. Every mission saves its own construction and Undo history. Existing first-map wins and plans migrate into the campaign.

## Play

```sh
npm ci
npm run dev
```

Open http://localhost:5302 . Production preview: `npm run build` then `npm run preview` on4302. Strict local ports; static relative assets, no backend, keys, runtime LLM or analytics. No production deployment is claimed.

## Controls and progression

- **חפירה:** drag across any available warm soil. The actual stroke lowers the actual bed at one bounded depth. Overlap does not charge the same earth twice.
- **מילוי:** drag over previous excavation to restore soil and refund actual earth. Fill itself can be undone. Source, house foundations, fixed rock and current levee cells stay protected.
- **סוללות:** choose a piece, rotate with the visible button or **R**, then place it anywhere legal. Select an existing levee with the shovel to move/remove it. Stock varies by mission.
- **בדיקת השיטפון / Space:** test, pause and resume. Failure returns to retained construction. **↶ / Z** reverses the last construction, including during a wave. A visible reset is itself undoable.
- **השלב הבא:** continue after a real win. **מפת השלבים / M** opens all24 for practice. Completed maps retain their plan and can be replayed. The last win opens the completed campaign map.
- **1 / 2 / 3:** shovel/levee/fill. **F:** fullscreen; **Escape:** pause/close/exit. Touch uses the same visible tools. Focus loss pauses. Sound starts muted; reduced motion is respected.

Sparse local saves retain each plan and the latest32 actual Undo snapshots, rather than32 full heightfield copies. Malformed saves are validated; storage errors cannot stop the live controls. Legacy saves without history remain repairable through Fill. No student personal data is collected.

## The24 missions

Source and courtyard positions, true slopes/crossfall, protected limestone islands, earth/levee limits and finite pulse schedules vary. Maps8/16/22/24 contain delayed second waves. Maps9/17/21/24 require actual infiltration into porous-ground storage as well as sufficient coast passage and courtyard safety. Maps7/18 limit construction; the last act combines unfamiliar relief, repeated storms and competing stores.

All24 fields are physically distinct. No dig hotspot, wall socket, named-route answer flag or completed-stroke check determines success. Internal QA constructions live only in tests. The player can invent other legal plans.

## Model and scope

A conservative cardinal-grid heightfield transports finite water and tracers according to hydraulic-head differences. Trenches change bed height; levees change actual crest cells. Safety checks all three full courtyard footprints over the event. Success requires full source release, actual safe coast receipt and any recharge goal after the complete horizon. Infiltrated water moves into an explicit underground store and remains in the ledger.

Schematic maps, compressed eight-second events, rates, thresholds and budgets are original game tuning, not real flood forecasts. Safety means a modeled depth/exposure limit, not literal zero wetness. Groundwater is a lumped porous store, not a cavern river. The current campaign focuses on drainage/soil/flood planning; the rejected technology/quality campaign is retained as history. Exact Workbook mappings and source caveats are in [CURRICULUM.md](CURRICULUM.md). No enjoyment or learning gain is established by internal QA.

## Verification and assets

`npm test`:178/178 (76campaign +36opening/recovery +66retired-engine regression). `npm run build` passes. All24 current missions won through actual browser construction and all23 Next transitions reached the following map; the24th win reached the completed campaign screen. Four storm missions used real elapsed waves; other internal parity runs used the documented clock after actual construction. Additional controls, history migration and touch recovery checks passed. Details and limits: [PLAYTEST.md](PLAYTEST.md).

The independent phone play used an invented visible trench, a natural wave and actual Next to level3. That is an input/playability observation, not a novice-student study. Visual gaps versus the generated targets remain in [VISUAL_REVIEW.md](VISUAL_REVIEW.md). Targets06/07/08 were generated and inspected before dependent implementation.

Original Tripo assets were acquired in the user's Chrome with60 displayed existing credits; no new credits were spent on the rebuild/campaign. The owned gate is visible in current play. Two retained GLBs total2,616,388bytes; fonts are local. Provenance: [ASSETS.md](ASSETS.md). Public source: https://github.com/AceDZN/basin-breakers . Authorized main, no force pushes.
