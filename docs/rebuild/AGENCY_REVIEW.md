# Freeform flood rescue: agency and physical-solvability review

31 October 2026. **Design review only. The guided-patch prototype is rejected by the human owner.** This document does not certify a new map, implemented rule set, fun or learning. No new gameplay code, tests or campaign were written for this review.

The human wants short flood-rescue puzzles, quick retries and genuine choices. The previous interaction became “click wherever the cue points.” Making its clicks reliable cannot fix that architecture. The stopped cue/retry check is not a successful prototype milestone.

## Judgment

**A free digging brush plus three levees can provide agency, but those tool names alone prove nothing.** The map must offer competing feasible hydraulic strategies, useful placement freedom and a forgiving neighborhood around each strategy. If there is one bypass, one choke point and three obvious wall gaps, it is still a slot puzzle with a different cursor.

No concrete freeform map has yet been independently shown to meet those requirements. The proposed design should proceed as a small physical prototype with new imagegen targets, then earn a solvability/agency verdict from actual alternatives. It must not inherit a pass from the legacy 66 tests or the cue-guided desktop witnesses.

## What counts as a choice

| Requirement | Genuine agency | A disguised hotspot puzzle |
|---|---|---|
| Editable ground | A broad continuous soft-earth domain; a stroke anywhere valid changes actual bed elevation and cost | A soft-looking blanket where only hidden authored cells affect routing |
| Channels | Players choose entry, path, width and destination approach within a clear depth/earth limit | Any nearby drag snaps open the same complete bypass |
| Levees | Up to three visible finite-size blocks; free legal position/orientation; water responds to the resulting barriers | Three highlighted sockets or a block-presence flag at a named location |
| Routes | Two spatially different safe approaches, or routing versus temporary-storage strategies | The same mandatory trench with cosmetic offsets or a reordered input sequence |
| Failure | A disconnected ditch, inadequate capacity or bad barrier creates the corresponding physical consequence | A plan fails because it differs from the authored gesture list |
| Learning | The player uses slope, head, storage and peak flow to predict and revise | The player follows arrows or discovers the exact patch the code accepts |

The soft domain should contain substantial usable ground outside any anticipated solution. Its shape must be justified by material and relief, not drawn as a correct-route stencil. Bedrock, houses and machinery can be protected, but they must look and respond differently from editable soil.

## One candidate map that could support two strategies

This is a **design sketch**, not a validated map or a pair of proven solutions. Exact elevations, dimensions, rate, earth cost and block size must be tuned together and checked against the actual conservative solver.

- A finite northern source releases a flood onto a broad sloping catchment.
- Three homes occupy a central lower floodplain. Their whole courtyard/foundation region is a hazard, not a hidden point.
- The **east side** is a broad soft shoulder offering a longer continuously downhill bypass around the homes.
- The **west side** includes a shallow meadow/bowl offering temporary storage and a lower southern spill saddle. It must connect toward safety without passing through the homes.
- A broad southern safe outflow/retention destination accepts water from more than one approach. It is not a tiny compulsory pipe socket. Its entrance and capacity are visible.
- The editable area includes the shoulder, meadow approaches and useful intervening ground. Both sides are accessible with the same broad brush; there are no solution arrows.
- A set of three movable levee blocks can divide a low approach, protect a courtyard edge or redirect spill. Each block has a fixed visible footprint/height. Available wall length must be understood from those objects, not silently stretched to close any river.

### Two candidate witness strategies

| Candidate | Player's physical construction | Why it could work | Distinct tradeoff that must be real |
|---|---|---|---|
| **A: eastern conveyance** | Excavate a longer broad east-side channel; use one or two levees to push the approaching surge into it and protect the nearer courtyard edge | A lower hydraulic path with enough capacity carries most of the wave around the homes to the safe destination | More earth and distance; less dependence on stored capacity; unused levee(s) remain available |
| **B: western detention and spill** | Excavate into the west meadow, use levees to keep its rising water away from homes, and cut a lower southern spill path | Temporary storage reduces the peak, then an actual lower saddle/outlet releases enough water safely | Less continuous bypass excavation; more use of levee inventory and basin capacity; retained water explains the delayed outflow |

Both must meet **the same final conditions**. Candidate B cannot be declared valid merely because it holds all water forever, and candidate A cannot rely on a hidden automatic drain. The game's win code must know neither candidate name nor route membership.

The key elevation relationship is a real one: the useful bypass/spill head must remain below the threatened courtyard head at the tested peak, or the levees must provide an adequate physical barrier. A bowl with an uphill outlet or a saddle higher than the homes offers a false choice. A source that can overwhelm every affordable route is not a challenging map; it is unsolvable tuning.

## Tool contract that supports experimentation

**Digging.** A visible broad brush creates a continuous bed at a stated bounded depth through soft soil. Interpolate the actual stroke between pointer events, so a fast finger movement does not leave invisible uncut teeth. Preview its width, valid/blocked portions and earth cost. One pass should produce the expected first cut; incidental re-crossing must not secretly charge an additional depth pass. Widening/extension are choices, not accuracy chores. Do not complete unseen parts of a named route when a stroke touches one cell.

**Levees.** Three finite blocks can be placed, rotated, moved and removed during planning with clear occupied footprints. They must physically change the barrier/bed geometry used by transport. A rejected placement explains its obstruction and consumes nothing. Repositioning a retained block must not duplicate its mass, consume another inventory slot or leave an invisible old barrier. Any support/overlap/boundary rule must match the visible preview.

**Undo and retry.** Undo reverses the last player construction and refunds exactly its cost/inventory. Retry resets the finite flood and preserves the current valid terrain/blocks. These are different actions with different labels. A harmless but incomplete test must not automatically delete a useful previous stroke; that caused the observed two-gap failure loop. Failure freezes the visible cause; one action returns to the retained plan, with correction immediately available.

**Time.** Planning is safe. Testing releases the full finite event, resolves in roughly eight real seconds and cannot be won by waiting with a closed inlet. A timed reflex requirement is not needed to make the puzzle feel urgent. Preserve a real flowing leading edge and readable contact with the world; avoid hiding the relevant place with a result modal.

## Exact outcome contract: no closed-gate or disappearing-water win

For a first physical witness, **80 game-volume units in and at least 64 safely received** is a reasonable candidate contract consistent with the current prototype's scale. These are original tuning units, not real hydraulic predictions. Their feasibility is still to be demonstrated on the freeform map.

Let `V₀ = 80`, `Vreleased` be cumulative release from the finite source, and `Vsafe` be water that actually crosses the designated safe boundary or resides in the designated safe receiving basin at the end. Count a parcel once: if retained safe water later leaves through a safe boundary, transfer its ledger entry rather than crediting both. Do not count water merely entering an upstream bypass mouth.

A win requires all of the following after the complete event horizon:

1. **The actual flood was tested:** `Vreleased ≥ V₀ − ε`, all scheduled source pulses have occurred, and the remaining source is at most `ε`. Opening release can be automatic; later gates cannot evade this condition.
2. **Useful safe passage occurred:** `Vsafe ≥ 64` within a stated numerical tolerance, at the actual receiving location/boundary and within its real capacity.
3. **All three homes are safe:** each visible courtyard/footprint remains below its declared meaningful flood exposure/depth limit. Use the same terrain/water surface that is drawn. An invisible point wetting or a decorative splash is not an adequate substitute.
4. **All remaining water is accounted for:** released water equals safe receipt plus other surface/groundwater stores plus explicit non-safe outflow/use/evaporation terms, within tolerance. Water stranded in a dead-end pit does not vanish or count as safe receipt. Retention of up to the remaining 16 units can be a legitimate tradeoff.
5. **Construction is valid:** actual excavation stays within the earth budget/depth limit, no protected footprint is modified and no more than three physical levees exist.
6. **Later quality rules also hold:** salt, supported contamination and reuse provenance transfer with water; a route that hydraulically saves a house can still endanger drinking supply or the environment in later missions. Desalination and treatment keep their finite input/output/residual accounting.

Failure may freeze early on a visible home flood, preserving all stores at that moment. Non-flooding quantity failures resolve at the complete horizon and should identify the actual stranded/blocked water or inadequate safe arrival, not repeat “check sills, rate and infiltration.” Final safety checks should not turn green at the initially dry state.

## Independent agency/solvability acceptance criteria

These are specifications for later verification, not tests already implemented or passed.

### 1. Two alternatives carry genuinely different water routes

Produce two ordinary-player construction sequences on the same map under the same budgets/source. Both must independently satisfy the full outcome contract. One should use the east approach and one the west detention/spill approach, or demonstrate an equally substantial different mechanism.

For QA, compare actual flow across spatially separated cross-sections as well as final stores. A useful concrete target is that at least 60% of released volume uses the east cross-section in A and the west cross-section in B, with substantial non-overlapping excavation and a different levee/storage tradeoff. This is an **analysis criterion**, never a route gate in gameplay. Two plans that merely place the same dam one grid cell apart do not qualify.

Each witness should also tolerate a reasonable rough stroke/placement variation consistent with its visible width and margin. Two isolated pixel-perfect winning configurations do not establish usable freedom.

### 2. The same final geometry has the same physical result

Different input sequences that produce the same bed/barriers must produce the same result from the same finite source. A hidden “correct patch clicked” flag must not change flow or success. Conversely, moving the same number of strokes/blocks to different places must change the actual result where topography predicts it.

### 3. Unproductive plans fail for visible physical reasons

Challenge at least these cases: no edits; a closed/stranded source; a disconnected decorative trench; a ditch toward a courtyard; all three levees forming a dead-end dam; a broad retention pit with no safe outlet; and a bypass too narrow for the peak. They must fail a real quantity, capacity or home-safety condition. Do not reject them by comparing to a plan identifier. A viable unanticipated third plan must be allowed to win.

### 4. Free placement is real, and interaction is dependable

Dig outside the anticipated route on several visibly soft areas and observe actual bounded geometry/cost changes. Place each levee at several unmarked legal locations and orientations, move/remove it, and verify that its old barrier disappears and inventory remains exact. Use rough touch strokes at 390 × 844. The visible preview, committed geometry and water response must agree. An inactive stone/machine gesture must not consume earth.

### 5. A newcomer invents, rather than follows, a plan

After a brief generic brush/block demonstration, show the example map without route arrows, marked solution patches or a known-plan script. Observe a fresh player locating the flood, homes and safe destination, choosing a route, constructing it and making a correction after a short test. Record what they tried and why. Ask a second independent planner to find a different construction without seeing the first witness.

Automated witnesses establish physical feasibility. Newcomer observation establishes whether the interface exposes choices. Neither alone establishes enjoyment or learning; record willingness to make another plan and the player's explanation instead of reporting a model pass as “fun.”

## What the next mockups must show

- The **whole editable landscape** and at least two plausible topographic opportunities, with three free levee objects in a small tray. No hand points to the winning patch.
- An arbitrary active brush stroke and a free block placement preview, clearly connected to the actual geometry and cost/inventory.
- A wave taking one player-created route while the homes and safe outflow remain visible; a different target frame should show the other strategy, not just a recolor.
- A local recoverable flood or blocked-water failure with the offending construction still in view.

The imagegen targets can make the design concrete before implementation. They cannot validate either proposed witness. The next acceptance milestone is **one map with genuine alternative physical plans and dependable free input**, not a longer list of cue-driven levels.
