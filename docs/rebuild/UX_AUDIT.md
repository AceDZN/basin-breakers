# Basin Breakers rebuild: independent UX and gameplay audit

31 October 2026. Scope: critique and rebuild recommendations only. No gameplay code, campaign, tests, other repository or other chat was changed. New generated gameplay targets must precede implementation of the rebuild.

## Verdict

The shipped build presents a simulation editor before it establishes a satisfying game. The player must discover a hidden editing contract, operate several modes and wait a long time to learn whether an almost invisible change mattered. The numerical model can be correct while this experience remains confusing, unattractive and dull. The owner's rejection is consistent with the observed first attempt.

The earlier 66 tests and authored-plan browser wins established physical accounting and reachable outcomes. They did not establish that a newcomer could find a meaningful first action or enjoy repeating it. That distinction must shape the rebuild, not sit in a disclaimer after campaign completion.

## Audit method and limits

Opened the production preview at `http://127.0.0.1:4302` in a new Chromium profile, 1440 × 900, DPR 1. Used visible controls and ordinary pointer gestures with real elapsed time. Did not load a known plan, use the cell projection helper, inspect hidden simulator state, call `advanceTime`, or press Hint. Read visible DOM text and captured the actual screen.

This assessor worked on the previous model QA and cannot erase that prior knowledge. These are fresh-profile usability observations, not a claim to be an independent first-time human student. Human enjoyment and learning were not measured.

The audit followed the initial goal, first gesture, ordinary release, failure, retry, a visible trench gesture and paused correction. It also reviewed actual screenshots and documentation from three local Workbook games, read-only. No other game's current runtime was played, so their documented timings and test results are attributed to their own records.

### Observed attempt

| Moment | Actual visible result | Usability implication |
|---|---|---|
| Fresh opening | Four terrain/machinery tools; release, rewind, speed, Hint, campaign, sound, camera and groundwater cutaway; source quantity, earth budget and a 16-unit target | Many possible actions appear before the player knows which piece of ground matters. Groundwater and salinity labels are exposed before either is needed. |
| Click the prominent copper wheel at screen `(754,585)` | Earth fell from **14.0 to 13.3**. Gate remained **80%**. Status stayed “חצבו מעבר בקרקע · השער קובע את קצב השחרור” | A machine that visually invites manipulation is interpreted as a terrain edit. The action silently spends a scarce resource. |
| Press the large release button and wait **8 real seconds** | Source fell to about **9.9**, tank read **0.1 / 16**; narrow cyan tiles appeared near the source | There is movement, but little dramatic payoff or readable indication of the bottleneck. The player is watching a counter rather than feeling a surge. |
| Let the ordinary first run end | After the **55-second** horizon, the tank was **15.0 / 16** and the attempt failed | A nearly full tank fails after a long wait. There is no visible fill-line explanation of why one further unit was stranded or where to recover it. |
| Failure caption | “חסרים מים ביעד: מכל היישוב. בדקו את הספים, קצב השחרור והחלחול.” | The caption lists three possible systems. It does not identify this attempt's actual cause. In the first level, infiltration is not even the active lesson. |
| Failure presentation | Large modal blurs the entire catchment; it also reports unused energy **40.0** | The evidence needed for correction disappears. An irrelevant debug-like number occupies attention. |
| Retry, then drag along a visible trench segment | Earth fell from **13.3 to 7.2**; the change was difficult to read at whole-board scale | A broad gesture spends many small cell costs without teaching useful depth or showing whether the route is open. |
| Pause a new run, then attempt another excavation gesture | Earth stayed **7.2**; status only said “הזרימה מושהית” | Paused correction appears available but does nothing. The required distinction between pause and rewind-to-plan is not explained at the attempted action. |

Actual audit captures:

- [Fresh opening](audit/00-first-view.png).
- [Eight seconds after release](audit/01-eight-seconds-after-release.png).
- [55-second first-attempt failure](audit/02-long-wave-outcome.png).
- [One visible trench drag](audit/03-one-visible-trench-drag.png).
- [Paused edit with no explanation](audit/04-paused-edit-no-feedback.png).

## Why it feels hard

1. **The first move is a search problem.** “Open a low passage in the stone embankment” assumes the player can distinguish the intended embankment from hundreds of similarly colored squares. A tiny ring and a small height change do not explain a successful cut. The authored two-pass depth is an implementation detail the world does not teach.
2. **The machine and input contracts disagree.** A visible handwheel implies grab/turn. The game requires selecting a separate gate tool and using a panel slider. Default digging can modify the tile beneath the machine instead. The player pays for a reasonable interpretation of the artwork.
3. **Mode errors look like broken controls.** Planning, running and paused states change whether excavation works. “Pause” sounds like a safe time to fix the landscape, yet only rewind permits edits. A rejected gesture lacks an actionable explanation.
4. **The earth budget punishes exploration.** The player spends before understanding depth, brush size or which ground matters. Rewind preserves those costs. Full terrain reset is a separate operation. This makes experimentation feel expensive before it is informative.
5. **The explanation is less specific than the puzzle.** A heightfield can produce a precise failure, but the UI gives a generic checklist. The player cannot connect one visible place to one corrective action.
6. **The campaign is exposed as inventory.** All 24 missions and several systems are available immediately. “24” communicates workload before the first successful water interaction. The first useful thing should be foregrounded; practice selection can remain available through a secondary route.

## Why the payoff is weak

- The first wave lasts 55 seconds. Several later waves last 85–105. The old automation skipped this waiting with the clock hook. That helped test physics, but hid the actual pace from the delivery decision.
- The water reads as thin turquoise square surfaces. Its leading edge, acceleration, splash and collection are small at the default view. A wrong route therefore looks numerically wrong more clearly than physically wrong.
- The terrain reads as a pale tiled slab with repeated trees. The relief, soil and destination do not form a strong landscape composition. Many decorative shapes compete with the few editable or consequential shapes.
- The source and target look like small circular basins. “16 units” gives an accounting objective without a strong human or environmental desire. A visibly thirsty orchard, empty village cistern with a marked fill line, or dry waterwheel would make the same conserved quantity matter.
- The end-of-run modal changes text and numbers more than it changes the world. Successful irrigation should visibly transform a place. A short failure should be entertaining enough to invite another attempt.
- Early decision depth comes from locating a sill and repeating cuts. Later systems add panel settings. There is too little satisfying action between choosing a plan and receiving a verdict.

These observations support the owner's complaint. They do not quantify student boredom or prove that a different loop will be fun.

## Useful patterns in other Workbook games

These references inform interaction and pacing; they do not supply Basin's art, maps or scientific rules. Generated targets were not treated as implementation evidence.

| Reference and evidence inspected | Implemented pattern visible in actual captures | Useful adaptation | Caution |
|---|---|---|---|
| **Clean Flow v2** — `clean-flow/GAME_IDENTITY.md`, `PLAYTEST.md`, `docs/VISUAL_REVIEW.md`; actual `docs/captures/v2/actual-01-puzzle-start.png` and `actual-03-oops.png` | One machine card, one large socket, a hand gesture, a large start button and destination order bars. The mistake capture visibly ejects the wrong particles beside a specific customer caption. Its own record says a full 14-puzzle UI run passed. | One obvious manipulation; a goal attached to a world object; the wrong material remains visible at the wrong destination; a retry keeps useful work. | This is screenshot/document review, not a fresh play of that game. Its scan stamps, machine cards and busy chemistry labels are not a template for a geography quiz. |
| **Ringwarden live-defense rebuild** — `ringwarden/docs/rebuild/PLAYTEST.md`, `VISUAL_REVIEW.md`, capture index; actual `captures/00-actionable-opening.png` and `09-opening-leak.png` | A single large ring grip, one approaching enemy and an obvious defended core. Failure freezes with the escaped enemy and route still visible. One recovery action retains the corrected radius. Its own record includes native real-time completion and explicitly limits fun claims. | A large physical affordance; a visible cause of failure; correction while the failure is frozen; one-action retry without charging the retained plan twice. | Its second encounter can be held by a static maximum-radius plan. Immediate clarity does not prove sustained fun. Do not copy automatic combat into Basin. |
| **Slope Sled** — `slope-sled/GAME_IDENTITY.md`, `PLAYTEST.md`; actual round-2 `03-l1-build.png`, `06-l1-ride.png`, `14-l1-plus-result.png` | The opening asks for one of three slopes with a visible start and finish. The build view turns into a close sled ride; the wrong slope leaves a visible upward line and a specific stall explanation. Its record reports a first successful ride of about 6.3 seconds and explicitly fixed a boring slow wrong-answer crawl. | A short physical payoff after planning; a clear destination; visible replay of the exact mistake; shorten uninformative waiting. | The slope buttons are appropriate to that math game, not a reason to make Basin multiple choice. Snow, dog and chase camera are not Basin's identity. |

All reference files were read in `/Users/acedzn/dev/AceDZN-exp/` without writes. The actual screenshots provide evidence of the shown composition. Their docs' campaign and timing claims remain attributed reports, not independently revalidated facts.

## Recommended radical simpler loop: pull a channel, watch a short wave, improve it

**First promise:** “גררו תעלה כדי להביא מים למטע.” One source, one thirsty destination, one clearly different patch of soft earth. A fixed close oblique camera includes all three. The destination carries a broad physical fill line and a simple progress shape. The olive patch should visibly be dry before success and visibly recover afterward.

**One initial verb:** drag to carve. A broad scoop follows the finger, produces a coherent channel in one pass and visibly exposes a darker bed. Bedrock and machinery do not accept the same gesture. One gentle hand demonstration can show *how to drag across a short patch* without drawing the full correct route. No camera operation, gate panel, raise tool, salinity meter, aquifer or campaign sheet is required for the first useful action.

**Immediate experiment:** releasing the first valid stroke triggers a clearly announced **6–8-second finite test wave**. Give a brief cancellable preparation beat if needed. A later explicit “שחרור מים” control can support deliberate multi-stroke plans. The response begins while the gesture is still remembered. The water visibly runs down the actual bed; it must not follow a route-answer key.

**A forgiving miss:** water briefly splashes into a low spill basin or courtyard; the scene freezes at the first decisive visible mistake. One short sentence identifies it, for example “המים נשפכו לחצר הנמוכה.” The player can reshape the relevant earth while that evidence is visible. One “עוד גל” action restores the finite pulse and replays the current plan. An obvious Undo reverses the last earth stroke and refunds its actual cost. Do not consume a learning attempt with silent clicks on props.

**A satisfying win:** the tank reaches its marked line, water trickles into roots, dusty ground darkens, olives perk up and a short chime/splash resolves the run. Keep the landscape visible. Offer a nearby next landscape, not a large result spreadsheet. Show a concise optional water ledger after the action, rather than asking a beginner to monitor several unrelated counters.

**Progressive unlock:** first establish channel shaping. Then add one competing lower route; then one chunky directly grabbed gate for a narrower reach; then a visibly porous surface. Add groundwater, treatment, reuse and salt only after each new mechanism has a short playable demonstration. Keep 24 missions as the full scope, but earn each added verb through prior play. Reuse the reliable conservation layer only where its pacing and geometry serve the new interaction.

**Geography remains causal:** changing gradient changes the route; a courtyard lower than the intended outlet receives water; permeability transfers the same water and tracers into groundwater; pumping uses an existing store; a membrane splits real feed into product and brine; reuse retains destination restrictions. Shapes, texture and labels accompany color. No quiz gate, destination-answer switch or technology that creates water is introduced.

### What the new imagegen targets must prove

1. A cold opening where the source, the dry goal and the single manipulable ground feature are identifiable at a glance, with the initial drag affordance legible at phone scale.
2. The same framing during the first two seconds of a short pulse: readable water front, depth, wet soil and destination response.
3. A funny but clear miss with the actual spill site visible and a correction gesture possible; the world is not hidden by a modal.
4. A successful fill/recovery of the landscape that is visually more rewarding than a changed counter.

Use these as gameplay contracts, then compare actual real-time play against them. A richer canyon background alone will not fix the input contract or waiting.

## Five concrete newcomer acceptance cases for the rebuild

These are proposed future acceptance cases, not passed tests. Browser timing can verify response mechanics. A genuinely new player is needed to judge discovery and desire to continue.

| Case | Setup and ordinary action | Observable pass condition |
|---|---|---|
| **1. Understand and act without instruction** | Fresh profile, opening shown for five seconds; no README, Hint, spoken help or developer controls | The newcomer can point to the water source and goal, say what they are trying to achieve, and make a useful carving gesture within **15 seconds**. The first screen exposes one necessary world verb. Source, goal and touch target remain readable at 390 × 844. |
| **2. One gesture feels dependable** | Try a reasonable drag on the soft earth; also tap the visible wheel/rock before that interaction is unlocked | A continuous drag creates a visibly connected usable cut in **one pass**, with immediate deformation and feedback (target ≤ **200 ms**). An unavailable prop gesture never silently spends earth. Cost is previewed or clearly acknowledged, Undo refunds it, and no hidden second depth pass is required for the opening. |
| **3. A short wave pays off the plan** | Let go after a valid opening stroke and watch at normal speed | The leading edge reacts within **one second**; the destination responds within **three seconds**; the whole first wave resolves in **under 10 seconds**. A player can attempt two different plans within **30 seconds**. A visible tank line, wet soil and plant change communicate progress without reading raw units. |
| **4. A mistake teaches a correction** | Make a plausible downhill cut toward the lower courtyard or spill basin | The physical spill is readable and freezes promptly. One sentence names this actual cause; the affected place remains visible and editable. A newcomer can make a corrective stroke and start another wave with **one recovery action**, without a mode dead end, reset-menu hunt or double earth charge. The retry's finite water and tracer ledgers remain correct. |
| **5. The next puzzle adds interest, not interface homework** | After two short drainage successes, present one new porous patch using the same carve gesture | The added material is visually different; its lower surface flow and increased groundwater store are linked by visible feedback. The player can explain the observed change in their own words, with no answer menu. Only this new mechanism is introduced. Record whether the player voluntarily chooses another attempt/landscape and why; absence of that desire is a reason to revise the loop, not to expand the campaign. |

Do not equate a solved fixture, low console error count, polished target image or a spectator's correct explanation with enjoyment. The rebuild should first make a small number of ordinary actions feel clear and worth repeating, then sustain that quality across the full campaign.

## Review of the new opening target and plan

Reviewed `docs/rebuild/mockups/01-actionable-opening.png` and `PLAN.md` before implementation. The new target is a substantial compositional improvement: a large upstream reservoir, broad contrasting sand interruption and visibly thirsty garden form one scene. The hand is near the actual editable material; the gate is large enough to read as machinery. Rounded limestone and ochre soil establish a more convincing catchment than the old square slab. The camera does not require the player to orbit before seeing the action.

This is a promising design target, not a usability pass. Resolve these points as the flowing and mistake targets are authored:

- **Clarify the stroke.** The opening's arrow points uphill/left toward the gate. Decide whether the gesture crosses the width of a plug or excavates downhill along the bed. Show the same intended gesture and resulting cut in the next target; do not let art teach one motion while input accepts another.
- **Make the goal legible.** The garden is visibly dry, but there is no physical fill line or irrigation-completion cue yet. A modest world marker can show what sufficient delivery means, with no opening numerical dashboard. Preserve the visible dead-to-recovered contrast at success.
- **Tighten the first wave.** PLAN allows roughly 8–12 real seconds and a 12-second acceptance ceiling. The opening target should resolve in 6–8 seconds and stay under 10. The full relevant model horizon still has to run; shortening the payoff must not mean declaring victory before later flooding or depletion.
- **Retain the height relationship.** The closed-gate opening plausibly places water above a downhill bed and a lower garden. Flowing/miss targets must retain that geometry and camera. Do not obtain prettier water by moving the destination uphill or adding an unaccounted source.
- **Make prop protection real.** PLAN correctly promises that a click on machinery cannot dig it. The next target and implementation need direct manipulation or a clear inactive response, rather than the old tool-dependent silent earth loss.

The next image should make the water front and goal response readable in the first two seconds; the miss image should keep the actual spill site visible and correctable. Implementation should follow the completed design sequence and be judged against those specific moments.
