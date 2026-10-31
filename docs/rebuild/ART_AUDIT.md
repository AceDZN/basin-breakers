# Rebuild art audit — 31 October 2026

The human rejected the first build as ugly, weird, boring, unclear and hard to understand. This audit treats that rejection as a failure of composition and interaction communication, not a request for cosmetic polish. It is research for a new direction before new mockups or implementation. No new Tripo jobs or credits were used for this pass, and no game source was changed.

The earlier visual review was too permissive. It confirmed visible imports and repaired rendering faults, then described the large gap from the generated targets as an acceptable simplification. That did not establish a compelling visual hierarchy or a clear game. Future acceptance must compare the actual experience with a feasible, intentionally composed mockup; visibility of an asset is insufficient.

## Evidence inspected

Current Basin captures:

- `docs/playtest-captures/level-02-solution-flow.png`: the pale slab and many trees dominate; the house, source, goal and trickle are small and visually similar in weight.
- `docs/playtest-captures/level-24-second-pulse-flow.png`: quality information is present, but ten equal dark labels and a long operator toolbar turn the landscape into a monitoring display.

Three other local game examples were inspected read-only. They are references for communication, not assets or mechanics to copy:

| Reference screenshot | Useful principle | What not to carry over |
|---|---|---|
| `/Users/acedzn/dev/AceDZN-exp/bank-shot/docs/captures/01-first-30s.jpg` | The physical playfield dominates the frame. Ball, aiming angle and strike button explain the action immediately. The material palette belongs to one coherent toy. | Its decorative gold UI and angle controls belong to its own game. Basin needs its own landscape identity and fewer control surfaces. |
| `/Users/acedzn/dev/AceDZN-exp/frost-and-flame/docs/captures/01-first-30s-actual.png` | A close camera frames the exact obstacle. The active verb is attached to that object; state feedback sits beside the action. | Do not add an avatar, movement controls or magic doors. The relevant lesson is local focus, not the genre. |
| `/Users/acedzn/dev/AceDZN-exp/sentence-foundry/docs/review/desktop-initial-canvas.png` | A crafted, cohesive miniature world; physical sockets, arrows and pieces suggest what can connect. | Do not reproduce its tiled factory board. A natural water basin should have continuous sculpted land and visible elevation. |

## Why the current art fails

| Failure | Visible consequence | Rebuild response |
|---|---|---|
| Flat checkerboard slab | Hundreds of similar pale cell tops and a thick square plinth read as a test surface, not a catchment. Slight height variations create noise rather than an important slope. | One continuous shaped terrain mesh with broad landforms, a thin exposed cutaway edge and an obvious high-to-low relationship. Keep solver cells invisible. |
| Tiny identity and goals | The requested sluice is roughly a small tabletop ornament; distant tanks and orchards need labels to be recognized. | Make the gate/reservoir and destination the two largest meaningful silhouettes. Frame them close enough to read without zoom or orbit. Reuse the acquired model only where it helps the scene. |
| Repeated tree noise | Dozens of near-identical olive lollipops obscure channels and compete with every important object. | Use a few grouped shrubs/trees at the edges. Reserve the main plant mass for the thirsty orchard that visibly transforms after irrigation. |
| Weak water | Turquoise cell strips are narrow, flat and quiet. A number changing is more noticeable than a wave arriving. | A broad connected surface, a strong moving leading edge, wet-bank darkening, short spill spray and a clearly rising destination. The finite source visibly drains. |
| Uniform terrain contrast | Pale soil, pale stone and pale tank blur together. Excavatable and fixed ground are not visually obvious. | Warm clay in the editable reach, lighter stratified bedrock shoulders, dark moist soil behind the water, saturated turquoise water and dark olive destination foliage. Shape and material both communicate the boundary. |
| Operator HUD | Four tools, speed, hint, rewind, run, time, ledger, mission text, status and many labels all compete. The learner must infer a workflow from the interface. | Early play exposes one drag verb, one release button and a small undo/rewind. Information appears at the relevant object or only when inspected. Introduce one new control when a level needs it. |
| Weak consequence | The destination remains a small symbol; success/failure is mainly a text modal and quantities. | Water fills a visible bowl or tank; dry orchard becomes lush; the courtyard splashes if misrouted. Keep the world visible during retry and success. |
| Mockup mismatch | The targets promised photographic terraces, dramatic water, large machinery and close tactile control. The implementation delivered a distant low-poly slab with numeric labels. | New targets must depict the actual intended feasible stylized browser game, with the planned camera, object count, gesture and feedback. Compare before multiplying levels. |

## Recommended direction: a Mediterranean water toy

**Visual thesis:** a close, sunlit sculpted limestone-and-clay diorama where one satisfying cut releases a bold turquoise wave and brings a visibly thirsty place to life.

Use one stable oblique camera for each puzzle. No camera operation should be necessary to understand or complete the first levels. The terrain occupies about 75–85% of the frame width; its silhouette follows a small catchment rather than a perfect square. The exposed foundation is a thin stratified edge, not the largest object. Source and destination are both visible at useful scale on desktop and portrait mobile.

The first composition should contain only the information needed for one decision: a large finite reservoir behind the copper-blue gate, one clay ridge that can be cut, one tempting wrong low route or obstacle, and one large dry destination. The important slope must be readable from the geometry and shadow. Avoid dozens of pre-cut trenches that already appear to encode a correct solution. Later levels can add a second destination or quality route while retaining a clear primary problem.

Use broad material contrast, not more microtexture. Chalky warm limestone defines fixed shoulders; ochre clay defines the editable reach; wet clay is markedly darker. Turquoise water has a bright edge and a deeper shaded center. Dark olive foliage is a reward mass at the destination. Copper and ceramic blue belong to machinery, with only a few high-contrast accents. A soft atmospheric background supports the miniature; it should not consume half the frame as empty gray-green space.

Reuse the existing sluice as an identity anchor at meaningful scale. Do not spend credits to solve a camera or hierarchy problem. The treatment skid may return in later levels, with enough room around it to see its distinct sockets. One prop must not visually imply that sewage treatment and desalination are the same process; explicit source, operation and output cues remain necessary.

## Visible action and consequence

The first on-screen instruction can be a short verb such as **“פתחו מעבר למטע”**, followed by the primary **“שחררו”** button. A large circular earth brush and a brief local ridge highlight teach the drag affordance; they must not draw the complete solution. Early levels should not require switching among four tools or opening a machine inspector.

A run should become visually eventful immediately and resolve in roughly 8–12 seconds for early puzzles. Render the conservative flow as a connected water surface with a moving front derived from actual changing wet cells and flux, rather than disconnected square puddles or an unrelated animated route. A few spray/foam particles at active drops can provide scale. The finite reservoir drops, the destination fills, wet banks spread and irrigated vegetation changes visibly. These are views of state, not substitutes for the state model.

Mistakes should be readable in the world: a broad surge enters the wrong courtyard, or water settles in a low pocket short of the goal. A short causal caption appears beside that consequence. Rewind returns water promptly while preserving the earth plan. Success leaves the living result visible and reveals a small next-level action; it should not immediately hide the payoff behind a large blurred modal.

## Feasible implementation envelope for the lead

These are design constraints, not implementation performed in this audit:

- Render a continuous procedural heightfield, with deliberate terraces and clear bank walls. Smooth only where it does not erase the actual cut or misrepresent the solver's hydraulic head. No visible tile grid is needed for the learner.
- A conservative modest solver can remain underneath; improving the connected surface, fronts, shoreline, wetness and framing does not require SPH or photoreal fluids.
- Use a small authored object count: the source, destination, one obstacle and a few scenery clusters. A compelling miniature is achievable with the existing models plus procedural land, buildings and plants.
- Keep physical source/destination scales legible. Aim for an identity gate at least about 80 CSS pixels high on a desktop first-play frame, a primary water reach about 40 pixels wide or more, and touch interaction regions at least 48 pixels. Validate actual portrait frames rather than shrinking desktop controls.
- Use one stable sun direction, soft shadow and controlled exposure so white stone retains surface detail and channels remain darker than surrounding shoulders. Avoid the washed-out uniform cream field.
- Mobile uses the same drag-and-release interaction, a fixed camera, generous target area and safe-area-aware bottom release/undo. Camera rotation cannot compete with earth dragging. Numeric diagnostics remain behind an optional inspection affordance when later lessons need them.

## Requirements for the next mockups

The lead should choose the exact scenario and interaction before image generation. Then generate an honest feasible stylized target, not a photograph to be excused later. The two most useful shots are the same first puzzle in planning and in the dramatic release/green payoff, with matching camera and object placement. A portrait framing check is also needed before implementation expands.

Both shots must visibly communicate: **where the water starts, what the player changes, where the water should go, what happens when it arrives, and how to retry**. Use real intended Hebrew copy and only the controls that will exist in that state. Do not generate dense dashboards, hundreds of trees, a sprawling basin, microscopic water or a fully painted answer route.

Before starting the rebuild, inspect the chosen targets at thumbnail size and at a phone-sized crop. If the source, editable ridge and destination cannot be identified without reading a paragraph, revise the composition. After the first implemented puzzle, compare the actual camera, silhouette, terrain continuity, channel width, water front, UI count and visible payoff directly. A functioning mass ledger or loaded model cannot waive an obvious mismatch.

## Recommendation to lead

Choose this close water-toy direction and build one exemplary action → visible mistake → rewind → satisfying success sequence before re-authoring the campaign around it. The original science requirements remain meaningful, but they should emerge through visible physical choices rather than a miniature operations dashboard. No claim of student enjoyment or learning is established by this audit; the rebuilt first minute needs direct human review before scaling the presentation.
