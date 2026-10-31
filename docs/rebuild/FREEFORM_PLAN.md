> Current scope: the human won this core prototype and explicitly requested further levels. The one-map hold below is historical and superseded. The active24-mission plan is [PLAN24.md](PLAN24.md); physical proof is [CAMPAIGN_PHYSICS.md](CAMPAIGN_PHYSICS.md). Main now supports Next, saved per-map construction and all24 authored missions.

# Freeform core plan — followed by the full24-level campaign

31 October2026. Human feedback rejected the guided sand-plug version: following a marker is not planning, and rendering/recovery still failed. Stop expanding that interaction. The next reviewable deliverable is **one genuinely freeform rescue map**, not24 more prompted actions. Campaign expansion follows a clear, dependable physical game and direct human response.

## Core decision

A held finite flood sits uphill from three homes on a broad soft-earth catchment. The player chooses where to excavate and where to put up to three finite levees. The whole soil surface is editable; there are no authored dig targets, wall sockets or route-completion flags. A shovel drag makes that actual continuous channel, at a consistent bounded bed depth. A levee changes the actual heightfield at its free position/orientation. Test a short flood, observe where the water goes, retain the construction and revise it.

The goal is to keep all three courtyards safe while the full finite event is released and enough water actually reaches the broad lower safe coast. Merely keeping a gate closed or stranding all water behind a wall cannot win. Useful temporary storage is allowed, but is finite and remains in the ledger.

## Initial map and physical contract

- One source high at the back; three individually modeled house/courtyard footprints lower in the center; broad soil on both sides and a broad low southern coast.
- Natural relief slopes toward danger. It does not contain a precut correct bypass. Raised pale limestone is fixed, warm terracotta soil is editable throughout its visible region, and house foundations/source machinery are protected.
- An original tuned finite source around80volumeunits; all source water must actually be released. Initial success target: at least64 safely received, all three footprints below meaningful flood depth/exposure and all stores/tracers conserved. Exact values require feasibility tuning, not a scientific prediction.
- Source release is part of Test, with no player-adjustable inlet that evades the storm. Planning is safe; the full relevant model event is compressed to about8real seconds. Physical flooding may freeze earlier, without deleting stores.
- Outflow is a broad lower boundary, never a tiny compulsory socket. Every exiting parcel transfers to explicit received storage once. The remaining surface water is accounted, not removed to improve a score.

## Input contract

**Dig.** Choose the shovel and draw anywhere on valid soil. Interpolate the actual pointer polyline so rough/fast drags leave no hidden teeth. Preview the full broad trench, bounded depth and actual earth cost. Commit only actual edited cells; repeat overlap does not charge the same excavation again. No callback may choose a named route or complete untraced ground. A stable pre-stroke picking surface prevents the preview itself moving the input target.

**Levees.** Three fixed-size pieces, freely placed/oriented on legal terrain. Preview their occupied footprint and crest. Placing/moving/removing recomputes the actual barrier without leaving an invisible old wall or consuming an extra piece. R or a visible rotate control changes orientation. A failed placement costs nothing and explains the visible obstruction.

**Undo and retry differ.** Undo restores the last actual construction and cost/inventory. Retry restores the finite pulse with the present geometry retained. A partial plan must not disappear after testing. Editing a frozen failure can return to safe planning automatically; no menu hunt or mode dead end.

**Communication.** One general goal, a neutral brush at the player's chosen point, shovel/three-piece tray, Test and Undo. No hand/arrow at a solution site. A physical flood and local cause remain visible; result copy stays small. Source, all three homes and both usable flanks must fit on390×844 without camera work.

## Required proof before expansion

1. Two independently authored, materially different physical plans succeed on the same map and budget. Prefer an eastern conveyance and a western detention/spill arrangement; neither route name is used in win logic.
2. Compare actual signed flux across separated cross-sections and excavation/levee geometry. Cosmetic offsets or reordered clicks are not alternatives.
3. Arbitrary edits on other soft soil and arbitrary legal levee positions affect the actual field. A viable unexpected third plan is accepted.
4. No-edit, a disconnected ditch, a courtyard-directed trench, a dead-end wall/pit and an insufficient-capacity route fail for their real physical consequences. Full release, safe receipt, construction limits and all mass ledgers remain explicit.
5. Ordinary mouse/touch input can construct, preview, undo, retry, move/remove a block and complete a rescue without fixture coordinates, solution cues or hidden state injection.
6. Inspect new generated06/07mockups **before dependent implementation**, then compare actual opening, chosen-plan flow and failure at the same camera/viewport. Do not waive broken liquid, buried houses or a fixed-answer interaction because numerical tests pass.

Internal alternatives establish feasibility, not enjoyment. The human must be able to invent a plan and want another attempt; direct feedback takes precedence over scripted victories.

## Human recovery correction after the first build

The human then reported being unable to undo excavation and getting stuck. Active-wave Undo and reload-history loss were real recovery weaknesses. The current shovel now has a separate free Fill tool: draw over any previous excavation to restore bed and refund actual earth. Fill is itself undoable. Selecting an edit tool during a running/paused wave returns to safe planning. Undo during a wave restores the last actual construction and finite pulse. The latest32 real action snapshots are validated and persisted; old saves without history remain intact and can be repaired through Fill. A visible clear button is reversible. Never present wiping an entire legacy saved plan as undoing its unknown last stroke.

The fixed opening observation clock shows the first25 model seconds over5 real seconds and settles the remaining75 over3. A real flood exposure is recorded immediately, with failure freeze after at least2 real seconds so the player can see its cause. These are presentation/time choices, not changed hydraulic routes or invented water.
