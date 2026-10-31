# Basin Breakers rebuild — short flood rescues

Status: rescue mockups generated and inspected before rescue implementation; first playable rescue opening under independent ordinary-input review. The owner rejected v1 as ugly, strange, unclear, boring and difficult because of the experience rather than geography. This feedback supersedes the earlier delivery's UX claims. The v1 numerical tests remain useful conservation evidence; they do not establish approachability or enjoyment.

## Human choice takes precedence

The owner selected **short rescue puzzles: redirect a flood away from homes, with quick retries**, and named no specific reference game. This supersedes the earlier garden-first proposal. Selected implementation references are now `mockups/04-rescue-opening.png` and `05-rescue-payoff.png`. Garden mockups are retained as superseded exploration, not the current opening contract.

## What changes

The game becomes a tactile water toy with short landscape puzzles. A close fixed camera shows a held finite flood, three threatened homes, one clear sandy bypass and a large safe retention basin. Drag once to cut a chunky channel to its correct physical bed depth. Release a finite wave. It either takes the bypass into safe finite storage while the homes stay dry, or produces a visible, understandable courtyard flood. One immediate rewind keeps the plan available to improve. No orbit requirement, four-tool selection, hidden excavation depth, exact-percent sliders or checkbox panel in the opening.

The tone is Mediterranean: sculpted continuous limestone and ochre sand, deep turquoise water, dark olive foliage, copper-blue sluice, warm directional light. Replace the pale checkerboard slab and repeated tree field. Shapes carry the scene; there is no dependence on photographic microdetail. Reuse the two owned Tripo machines where they read clearly; new model spending is not necessary to fix the game.

## First 30 seconds

- **0–3s:** the camera already frames source, threatened homes, sandy bypass and empty safe basin. A short Hebrew instruction sits at the sand: `פתחו תעלת מעקף`. Nothing requires opening a menu.
- **3–7s:** a broad pointer/touch stroke visibly lowers the whole sand interruption. Sand chunks pop, the channel has readable depth, and the gate button responds. One pass performs one understandable excavation; repeated precision clicks are removed.
- **7–15s:** `בדיקת השיטפון` releases a short finite wave. Water moves as a prominent ribbon with a foamy leading edge; the source visibly falls. The destination fills against a visible marker. Wet banks darken, the basin rises to its physical marker, and the three homes visibly stay dry.
- **15–20s:** a short chime and `הבתים בטוחים!`; the next basin is one action away. This is a brief outcome, not a statistics modal covering the world.
- **20–30s:** a changed source and a lower village branch create the next rescue problem. A mistaken straight route makes a local splash. Flow freezes at the cause with `המים הגיעו לחצר`; `ננסה שוב` restores the finite pulse immediately. Failure spends no lives and requires no long replay.

These timings are targets to verify in actual play, not existing evidence. Success still evaluates all required finite pulses and constraints; the whole model event is compressed to roughly6–8 real seconds, not declared won early.

## Controls and feedback

1. Pointer/touch drag on editable sand cuts a channel. Clicking a machine manipulates that machine and never spends earth by accident. Clicking stone gives a clear local response and costs nothing.
2. One primary release/pause control plus one undo/rewind. Keyboard equivalents remain, but no player must learn a shortcut before a first success.
3. Fixed, readable framing. Optional inspection and campaign navigation live behind unobtrusive controls. All important interaction targets must remain large enough on a phone.
4. Budget is forgiving during onboarding. Later earth constraints are introduced explicitly and charge actual earth moved. Undo restores the previous gesture and cost. Exhausting a budget must not leave an unexplained dead end.
5. Later machines use direct world interactions: obvious gate-speed positions, source shutoff, pump operation and visibly distinct pipe destinations. They must describe physical actions and change actual transfers. No control named after an answer such as “safe brine.”
6. Cause captions identify a visible place and event. Quality and quantity both have to pass before a destination shows a completion tick.

## Geography stays consequential

Keep the independent finite-volume solver and its water, salt, pollutant and reuse provenance ledgers. Surface head determines flow. Soil infiltration transfers the same water and tracers to porous-rock storage. Pumping cannot create water; source control prevents polluted recharge. Desalination consumes energy and separates product plus brine; wastewater treatment preserves salt/reuse provenance and has a supported-pollutant residual. These become spatial consequences, not reading gates.

Any later garden greening is expressive feedback, not a claim that ecological restoration or mature plant growth happens in seconds. Maps, storage, event time and units stay schematic. Aquifer graphics must depict water within porous material.

## Campaign progression:24 basins after a clear opening

| Act | Four missions | New demand on the player |
|---|---|---|
| 1: make water move | One sand interruption; route around a house; reduce a surge; changed inlet/goal position | Learn drag→wave→visible consequence before scarcity or complex equipment |
| 2: the ground matters | Permeable bed; asphalt runoff; deposited obstruction; two rain pulses | Read land cover and temporary storage; water does not disappear |
| 3: under the basin | Recharge→pump; reserve; polluted source; unfamiliar recharge layout | Maintain an actual finite aquifer, with one direct machine action introduced at a time |
| 4: which water? | Separate saline input; membrane split; brine mixing; limited power | Read quality labels/instruments and keep real output streams distinct |
| 5: another use | Reuse to orchard; drip; two networks; leave water for the stream | Choose destination-specific quality and allocate water |
| 6: whole basin | Drought plus renewal; short storm storage; two feasible plans; new catchment/two pulses | Combine previously familiar verbs, with fewer tutorial cues |

V1's24 numerical fixtures are starting scientific test cases, not a mandate to keep its map composition or interface. Each rebuilt mission needs a readable next action, actual failure/retry and a distinct spatial decision. Do not claim the rebuilt campaign passed based on legacy tests alone.

## Build sequence and evidence

1. Audit current first-use experience and read-only reference games. References illustrate composition/feedback; do not copy their art or presume they are user-approved fun.
2. Generate and inspect three new built-in imagegen gameplay mockups: actionable opening, flowing/blooming payoff, local mistake/retry. Save exact prompts, mode and issues. These are design references, never software captures.
3. Rebuild the first complete action→consequence→retry→win loop to those references. Inspect at desktop and the user's narrow side-panel dimensions; test without knowledge of fixture coordinates. Fix affordance failures before copying the pattern across missions.
4. Apply the established interaction and visual system through the24-level campaign, keeping meaningful geographic escalation and quality/mass constraints.
5. Capture real play at mockup-equivalent states, compare composition/action/scale/feedback, and fix discrepancies. Keep pure conservation tests, but report first-use observations separately. Ask for human response to the new playable opening; scripted victories alone cannot certify enjoyment.

## Rebuild acceptance

- The next action and destination can be pointed to from the first screen; there is no required camera adjustment or tool-menu search.
- A broad, imprecise first stroke produces the expected cut and immediate visible feedback. The gate/machine cannot be mistaken for diggable earth.
- The first finite wave resolves in6–8 real seconds and under10 seconds, and its cause is visible throughout.
- A failed route can be retried in one action; the scene shows what went wrong rather than only a late numeric shortage.
- The source, water front, destination and success transformation dominate the scene. Text labels are secondary; mobile controls remain comfortably usable.
- Every campaign success is backed by actual physical stores and quality, and model invariants remain verified independently.

The owner was asked for preferred tone and a reference game while research continued. The owner explicitly selected flood rescue. The current opening must follow that choice, rather than requiring approval of the superseded garden direction.


## Rescue implementation constraints and current findings

The first two ordinary desktop plays found the action/retry loop substantially clearer: a protected wheel, a rough single drag, actual courtyard failure and an8-second successful wave. The first phone pass exposed cropped homes/source/pond, and liquid sheets interpolated up dry banks. These were blockers, not acceptable art simplifications. The current review pass follows fixes for per-level critical-object framing, wet-only water-head interpolation, a three-cell authoritative bed/plug, complete one-pass cuts, a real gap in the reservoir wall, larger finite source/basin and visible cut-color/dust feedback.

Win requires actual safely received floodwater and dry modeled courtyard exposure after the complete event. Closing the source cannot win. Initial source water is finite; the retention sink has an explicit finite capacity. A full basin stops taking more water. Courtyard floor/footprint is represented in the same heightfield. Freeze stops time/transfers without deleting stores. Retry restores the finite pulse; Undo returns only the actual last earth/device change and cost.

The first source event is authored in original game units; its complete model horizon is compressed into8 real seconds. Broadening the bed changed storage and conveyance, so volumes/timings were re-authored and rechecked rather than drawing a wide cosmetic ribbon over the old narrow solver. Legacy66 tests remain conservation regressions, not rebuilt UX evidence.
