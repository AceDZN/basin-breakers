# Basin Breakers rebuild: independent UX and gameplay audit

31 October 2026. **CURRENT STATUS: THE GUIDED-PATCH RESCUE PROTOTYPE IS REJECTED BY THE HUMAN OWNER. Its cue-driven interaction does not provide the requested agency, even where the input loop works. Stop certification and campaign expansion; the next design review is AGENCY_REVIEW.md.**

**Latest human preference: short flood-rescue puzzles, redirecting water away from homes with quick retries. This supersedes the earlier garden-watering primary goal.** Scope: critique and rebuild recommendations only. No gameplay code, campaign, tests, other repository or other chat was changed. New generated gameplay targets must precede implementation of the rebuild.

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

## Recommended simpler loop: cut a bypass, rescue homes, try another short flood

The human chose **short flood-rescue puzzles** with quick retries and no specific reference game. Village protection is now the primary fantasy. Garden watering is retained only as a possible later resource-management consequence. New rescue-specific imagegen targets must be inspected before implementing this change.

**First promise:** “הסיטו את השיטפון מהבתים.” A close fixed oblique camera contains one visibly held finite flood, three vulnerable homes on the lower threatened route, one broad sandy bypass interruption and a lower safe retention basin/outfall. These form one composition; decorative terrain does not hide the choice. The first scene waits safely for the player's gesture.

**One initial verb:** drag to carve the sandy bypass. A broad scoop follows the finger, opens a usable channel in one pass and exposes a darker bed. Bedrock and machinery do not accept that same destructive gesture. A small hand demonstrates the motion across a short area without painting the complete solution. There is no camera prerequisite, gate panel, raise tool, salinity meter, aquifer or campaign sheet to operate first.

**Immediate experiment:** a valid opening stroke leads directly to a clearly announced **6–8-second finite flood**. The gate can visibly release automatically in this opening; later direct world gates can be introduced as a new verb. If a release button remains, it is one large, unambiguous action. The flood visibly chooses between the real lower routes. It cannot follow an answer-key route or count as captured before reaching the safe basin/outflow.

**A forgiving miss:** water reaches a courtyard, splashes locally and the scene freezes at the first decisive visible failure. One sentence names the cause, for example “המים זרמו אל החצר הנמוכה.” Keep the offending flow, house and channel in view. One clearly described recovery action restores the finite flood and returns to the plan; if it undoes the last stroke, refund exactly that stroke. Do not ambiguously combine 'preserve the plan' and 'undo the plan' in the same copy. The player can make the next correction immediately, without a reset menu or a silent paused-edit dead end.

**A satisfying win:** the entire required flood has passed, all three homes remain safe, and actual water visibly reaches the marked safe basin or outflow. The safe pool rises or the outfall carries the wave away; the water source visibly falls. A short chime and a small world celebration resolve the rescue. The homes do not show final completion checks before the wave has passed. A nearby next scene offers a different threatened route, not a results spreadsheet.

**Progressive unlock:** first establish bypass carving. Then add a competing low courtyard route; then a chunky directly grabbed gate to reduce a peak; then a visibly porous surface or temporary storage. Add pumping, treatment, reuse and salt only after each has a short physical demonstration. The full 24-mission scope remains; later missions protect farms, drinking supply and environmental reserves as well as homes. Each new mechanism earns its screen space.

**Geography remains causal:** gradient and hydraulic head change the route; a low courtyard receives water if the bypass cannot carry the peak; permeability transfers the same water and tracers into groundwater; pumping uses an existing store; a membrane splits real feed into product and brine; reuse retains destination restrictions. Shapes, texture and labels accompany color. No quiz gate, destination-answer switch or technology that creates water is introduced.

### Physical and feedback pitfalls to prevent

1. **'Nothing happened' cannot rescue the village.** Require a real released flood and an actual safe-basin/outflow quantity. A closed gate, permanently stranded source or frozen clock must not satisfy a final all-homes-safe verdict. Automatic opening release is the clearest introduction.
2. **The bypass must work hydraulically.** Its entry must present suitable lower head and enough conveyance capacity at the authored peak. A decorative branch or colored route with an uphill sill will reproduce the old confusion. If a narrow bypass legitimately overflows, show that exact restriction and spill.
3. **Safe storage must have a physical destination.** Use a lower bed and finite capacity; count retained surface water in its actual footprint or cumulative explicit safe boundary outflow. Do not silently extract unlimited water at the bypass mouth while drawing a distant basin filling. If a basin overtops, account for and show the overflow.
4. **Homes and hazard detection must occupy the same place.** The dangerous courtyard/footprint, water surface and house foundation must agree. Use an authored meaningful depth/exposure threshold; a numerical wet speck should not become an unexplained instant loss. A visible splash can be playful without depicting harm to inhabitants.
5. **Freeze and retry must conserve state.** Freeze stops transport and input; it does not erase remaining water, salt or pollutants. A retry restores a single finite pulse. Earth refunds follow the stated Undo scope, with no extra charges for a retained stroke.
6. **Safety is an outcome, not the initial condition.** Three initially dry houses are not already a win. Use outlined/at-risk home markers while the wave is pending, then resolve them after the relevant hazard interval and safe-volume condition.
7. **Short waves still need complete evaluation.** Retune event rates/time coherently so the full relevant flood and any second pulse resolve in the promised time. Do not shorten the view by declaring victory before delayed flooding, quality mixing or depletion.

### What the new rescue imagegen targets must prove

1. A cold opening where the held flood, endangered homes, safe destination and single editable sand feature are identifiable at phone scale.
2. The same framing during the first two seconds: a strong water front visibly diverted along the actual lower bypass while the homes remain in view.
3. A miss with real contact at a home/courtyard, one specific cause caption and one recovery action; the world remains visible.
4. A completed rescue with the finite source depleted appropriately, safe basin/outflow visibly receiving water and all three homes clearly protected.

Use these as gameplay contracts, then compare ordinary real-time input with the targets. Richer cliffs alone will not fix a mismatched gesture or a long passive wait.

## Five concrete newcomer acceptance cases for the rebuild

These are proposed future acceptance cases, not passed tests. Browser timing can verify response mechanics. A genuinely new player is needed to judge discovery and desire to continue.

| Case | Setup and ordinary action | Observable pass condition |
|---|---|---|
| **1. Understand and act without instruction** | Fresh profile, rescue opening shown for five seconds; no README, Hint, spoken help or developer controls | The newcomer can point to the flood, threatened homes and safe destination, say they must divert water, and make a useful bypass-carving gesture within **15 seconds**. The first screen exposes one necessary world verb. Source, goal and touch target remain readable at 390 × 844. |
| **2. One gesture feels dependable** | Try a reasonable drag on the soft earth; also tap the visible wheel/rock before that interaction is unlocked | A continuous drag creates a visibly connected usable cut in **one pass**, with immediate deformation and feedback (target ≤ **200 ms**). An unavailable prop gesture never silently spends earth. Cost is previewed or clearly acknowledged, Undo refunds it, and no hidden second depth pass is required for the opening. |
| **3. A short wave pays off the plan** | Let go after a valid opening stroke and watch at normal speed | The leading edge reacts within **one second**; the destination responds within **three seconds**; the whole first wave resolves in **under 10 seconds**. A player can attempt two different plans within **30 seconds**. A strong diverted wave, visible safe-pool/outflow progress and dry homes communicate progress without a numerical dashboard. Closing the gate or leaving the source stranded cannot win. |
| **4. A mistake teaches a correction** | Make a plausible cut toward the lower courtyard, leaving the safe bypass inadequate | The physical spill is readable and freezes promptly. One sentence names this actual cause; the affected place remains visible and editable. A newcomer can make a corrective stroke and start another wave with **one recovery action**, without a mode dead end, reset-menu hunt or double earth charge. The retry's finite water and tracer ledgers remain correct. |
| **5. The next puzzle adds interest, not interface homework** | After two short rescue successes, present one porous bypass bed using the same carve gesture | The added material is visually different; its lower surface flow and increased groundwater store are linked by visible feedback. The player can explain the observed change in their own words, with no answer menu. Only this new mechanism is introduced. Record whether the player voluntarily chooses another attempt/landscape and why; absence of that desire is a reason to revise the loop, not to expand the campaign. |

Do not equate a solved fixture, low console error count, polished target image or a spectator's correct explanation with enjoyment. The rebuild should first make a small number of ordinary actions feel clear and worth repeating, then sustain that quality across the full campaign.

## Historical review of the first garden candidate (superseded by rescue preference)

Before the human selected flood rescue, reviewed `docs/rebuild/mockups/01-actionable-opening.png` and `PLAN.md` before implementation. This garden-focused candidate is now historical, not the approved rescue opening. The new target is a substantial compositional improvement: a large upstream reservoir, broad contrasting sand interruption and visibly thirsty garden form one scene. The hand is near the actual editable material; the gate is large enough to read as machinery. Rounded limestone and ochre soil establish a more convincing catchment than the old square slab. The camera does not require the player to orbit before seeing the action.

This is a promising design target, not a usability pass. Resolve these points as the flowing and mistake targets are authored:

- **Clarify the stroke.** The opening's arrow points uphill/left toward the gate. Decide whether the gesture crosses the width of a plug or excavates downhill along the bed. Show the same intended gesture and resulting cut in the next target; do not let art teach one motion while input accepts another.
- **Make the goal legible.** The garden is visibly dry, but there is no physical fill line or irrigation-completion cue yet. A modest world marker can show what sufficient delivery means, with no opening numerical dashboard. Preserve the visible dead-to-recovered contrast at success.
- **Tighten the first wave.** PLAN allows roughly 8–12 real seconds and a 12-second acceptance ceiling. The opening target should resolve in 6–8 seconds and stay under 10. The full relevant model horizon still has to run; shortening the payoff must not mean declaring victory before later flooding or depletion.
- **Retain the height relationship.** The closed-gate opening plausibly places water above a downhill bed and a lower garden. Flowing/miss targets must retain that geometry and camera. Do not obtain prettier water by moving the destination uphill or adding an unaccounted source.
- **Make prop protection real.** PLAN correctly promises that a click on machinery cannot dig it. The next target and implementation need direct manipulation or a clear inactive response, rather than the old tool-dependent silent earth loss.

The next image should make the water front and goal response readable in the first two seconds; the miss image should keep the actual spill site visible and correctable. Implementation should follow the completed design sequence and be judged against those specific moments.

## Fresh ordinary-input audit of the first rescue build

31 October 2026, development build on port 5302. This is a new interaction audit, separate from the legacy tests. New desktop and emulated-touch profiles were used. The new implementation and level layouts were deliberately left unread. Inputs followed visible objects and sand cues, with real elapsed time; no fixture coordinates, known plans, projection helper, hidden state, Hint or clock hook were used. Screen coordinates below were chosen from the rendered screenshot, not level data.

### What improved and actually worked

- Desktop opening communicates **save three homes** with a held flood, houses, a bypass and a safe basin. It uses one world verb and one prominent test button. The four-tool/operator panel from v1 is gone.
- Clicking the obvious wheel at approximately screen `(500,165)` did not deform the ground. It responded “החול הכתום ניתן לחפירה. נסו לגרור בו.” This protects a reasonable exploratory action, though a gate-specific sentence would explain its role more directly.
- Testing the first flood without carving caused actual visible water around the houses. The scene froze with “אופס… המים בחצר”, retained the evidence and offered one “ננסה שוב” action. No long modal hid the catchment.
- That action returned immediately to planning. A deliberately rough single downhill stroke from the shown sand hand toward the existing bypass won the first complete normal-speed wave. The second desktop puzzle also won after two broad strokes through its two visible sand cues. Neither required precision clicks or repeated depth passes.
- A 390 × 844 touch profile accepted a rough finger drag through the first visible sand patch and won the first normal-speed flood. Touch input did not need a separate tool mode.
- The outcomes arrived on the ordinary approximately eight-second wave, not through a time hook. This removes the old 55-second first-attempt wait.

These are useful first-use improvements. They do not establish sustained fun or student learning.

### Blocking visual/usability findings

| Priority | Finding from the actual build | Required correction before broad campaign work |
|---|---|---|
| **P0** | **Phone puzzle 1 hides the rescued homes.** All three actual homes are off the left edge; only a fragment of roof is visible. The three HUD home icons overlap the source reservoir. The player can win but cannot see what was protected or observe a failed courtyard route. | Fit the flood source, threatened home cluster, editable bypass and safe destination together. Recompose or rotate/scale the map for portrait; do not treat a cropped desktop camera as a phone layout. |
| **P0** | **Phone puzzle 2 hides both endpoints.** The source is entirely off the right edge, safe basin entirely off the left, and both “פתחו תעלת מעקף” bubbles are clipped. Only the central ravine and homes are visible. | Use per-layout portrait framing that includes the required interaction chain. Keep cue text and the relevant touch patches inside safe screen bounds. Do not use remembered coordinates to claim it playable. |
| **P1** | **Water looks like polygon/glass sheets.** Bright cell-edge lines and tall almost vertical teal surfaces dominate both successful bypass flows. During the uncarved attempt, turquoise patches visibly extended outside the upper island near the source. | Make the liquid surface, banks and falls read as a coherent flow. Clip/mask rendering to the actual terrain/water domain. Avoid visual mass floating over nonexistent ground. Preserve the real water stores while correcting the mesh/material representation. |
| **P1** | **A successful cut is hard to perceive before testing.** The correct rough stroke removed the hand cue, but the before/after sand surface and channel opening were barely distinguishable at the fixed camera. The remaining cue still read “פתחו תעלת מעקף”. | Show a substantial bed change, darker exposed soil and a brief local acknowledgment. Once an opening is genuinely usable, update the local cue to invite the test. Do not imply readiness from any arbitrary gesture. |
| **P2** | The safe-basin label says “מים מגיעים בבטחה” even during the attempt that visibly floods homes. | Clarify that this is partial basin arrival rather than an overall safety verdict. Reserve final safe/completed styling for the full rescue conditions. |

The phone puzzle-2 interaction was intentionally stopped at the unreadable opening. It was not solved using remembered desktop placement. No campaign automation or rebuilt-rule test file was started after these findings.

### Actual rescue audit evidence

- `audit/rescue-00-desktop-opening.png`: desktop initial source, sand, homes and basin.
- `audit/rescue-01-wheel-click.png`: harmless exploratory wheel click and feedback.
- `audit/rescue-02-uncarved-wave.png`, `rescue-03-first-failure.png`: real uncarved flood and frozen cause.
- `audit/rescue-04-imprecise-single-drag.png`, `rescue-05-single-drag-wave.png`, `rescue-06-single-drag-outcome.png`: one broad stroke and normal-time first success.
- `audit/rescue-07-puzzle-two-opening.png` through `rescue-10-puzzle-two-outcome.png`: second desktop layout, broad gestures and success.
- `audit/rescue-11-phone-opening.png` through `rescue-13-phone-touch-outcome.png`: working touch gesture with the protected homes offscreen.
- `audit/rescue-14-phone-puzzle-two-opening.png`: cropped source, basin and cues; no phone puzzle-2 success claim.

The next audit should re-check only the corrected framing, liquid appearance and pre-wave cut feedback first. Legacy 66 checks and current authored desktop witnesses cannot waive these visible failures.

## Second rescue audit: framing fixed; multi-step recovery still blocked

Same ordinary-input constraints, new touch profile at 390 × 844, corrected port-5302 build. No new scene/model code was read.

- **Phone framing is substantially corrected.** Both opening maps now include the source, all three homes, editable interruptions and safe pond. The previous phone-2 missing-endpoints failure no longer applies. Decorative peripheral terrain can crop without hiding the rescue chain.
- **The first phone rescue works with a rough single finger stroke.** A no-cut test visibly flooded the homes and froze; one recovery and a broad stroke through the visible sand cue then won the complete ordinary eight-second wave.
- **Liquid appearance is improved.** The tested bypass no longer became a tall glass sheet; it read as a surface stream. The bright polygon/caustic pattern remains stylized, but the previous severe shoreline spikes were absent in this phone observation.
- **Cuts are more visible.** The source interruption darkened to exposed clay and produced local chunks. The hand cue cleared after the useful stroke. This is better confirmation than the previous nearly unchanged surface.

### Newly exposed recovery problem in phone puzzle 2

The second map showed a first sand cue near the source. One rough stroke cleared it; the next cue appeared at the lower interruption (`rescue-r2-07-phone-second-stroke.png`). Testing at that point produced a quantity shortfall, with the old generic “בדקו את הספים, קצב השחרור והחלחול” caption. That attempt had visibly routed water safely through the first section, so retaining that useful stroke is the natural correction contract.

Pressing **“ננסה שוב”** and then opening the lower cue produced a courtyard flood; the first source cue reappeared (`rescue-r2-10-phone-second-recovered.png`). The visible behavior indicates that recovery undid the previous valid first cut before the player made the second. This creates a plausible alternating failure: clear the first gap → miss the second → retry removes first → clear second → flood because first is closed.

**Required before expansion:** normal retry must clearly restore the finite pulse while preserving useful terrain, with an explicit separate Undo for removing/refunding the last earth stroke. If a different recovery contract is intended, its visible wording and tutorial must make it unmistakable and must not turn the two-gap introduction into repeated loss of valid work. The current “try again” label does not communicate that a good stroke will be removed.

The current quantity-shortfall caption also falls back to the old broad three-system checklist. A rescue-specific place/event explanation would support the second-gap correction much better. No new campaign tests or campaign success claim is based on this intermediate build.

Second-audit captures are `audit/rescue-r2-00-phone-opening.png` through `rescue-r2-10-phone-second-recovered.png`. Phone puzzle 1 passed; phone puzzle 2 is not cleared by this audit until its ordinary recovery sequence works.


## Human rejection of the guided-patch architecture

The owner rejected the rescue prototype again because it amounts to clicking where the cue points and sometimes does not respond. This supersedes any partial technical pass above. The focused retry regression was stopped before completion; it is not a signoff. No campaign expansion or additional certification follows from these observations.

The next concept is a freeform rescue sandbox: carve arbitrary soft terrain, place up to three freely positioned levee blocks, release a finite flood, protect three homes and deliver required water to a real safe outflow. It must support at least two materially different physical solutions, not preselected patches or a painted route. Its independent design review is in AGENCY_REVIEW.md.
