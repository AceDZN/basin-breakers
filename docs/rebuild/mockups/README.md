# New rebuild gameplay design targets

Generated and visually inspected 31 October 2026 **before rebuild implementation** using the built-in `image_gen__imagegen` tool, one call per image, `transparent_background: false`. These are generated DESIGN TARGETS, not screenshots of running software. They replace the old distant landscape direction for the rebuild; the prior targets are kept separately in `docs/visual-targets/` as history.

No game source was changed and no new Tripo generation/credits were used while producing these targets.

## Selected images and exact prompts

| Target | Mode and input reference | Exact prompt |
|---|---|---|
| [01-actionable-opening-v2.png](01-actionable-opening-v2.png) | Built-in targeted edit of stylized v1: downhill drag/notch cue and physical leaf/fill marker added | [01-actionable-opening-v2.prompt.txt](01-actionable-opening-v2.prompt.txt) |
| [02-payoff-v2.png](02-payoff-v2.png) | Built-in targeted edit of v1 payoff, with revised opening as second reference: upright recovered plants and water at the physical marker | [02-payoff-v2.prompt.txt](02-payoff-v2.prompt.txt) |
| [03-mistake-retry.png](03-mistake-retry.png) | Built-in image generation with opening as style/camera reference; new fork-and-house geometry for level 2 | [03-mistake-retry.prompt.txt](03-mistake-retry.prompt.txt) |

The first generated draft had the desired action hierarchy but remained too photographic, with excessive foliage/stone microdetail and a large decorative title. It was explicitly rejected as the selected style, then simplified with a targeted edit. The rejected draft and original exact composition prompt are preserved under `drafts/`; they are not the implementation target.

The original stylized `01-actionable-opening.png` and `02-payoff.png` and their exact prompts are retained as superseded v1 history. Independent QA found an ambiguous uphill hand arrow and insufficient recovery of the payoff plants. Exactly two targeted built-in edits produced the selected v2 pair; no further decorative iteration or Tripo activity occurred.

Selected tool-returned originals were copied, without deleting originals, from:

- Opening v2: `/Users/acedzn/.codex/generated_images/01a191ec-a820-7dc2-bec8-1c348e499f1a/exec-31b335e7-c39e-4241-9d4f-9a6fd108c469.png`
- Payoff v2: `/Users/acedzn/.codex/generated_images/01a191ec-a820-7dc2-bec8-1c348e499f1a/exec-e012c9d7-a2e9-4a1c-afde-81e7e5aae55e.png`
- Mistake: `/Users/acedzn/.codex/generated_images/01a191ec-a820-7dc2-bec8-1c348e499f1a/exec-d1baf97e-9470-4ff8-a66c-9878b173d9d7.png`

## Inspection: visual and interaction hierarchy

All three selected wide 16:9 images were inspected as returned pixels. They share warm rounded polygon limestone/clay, copper-and-cobalt gate, bold turquoise water, dark olive foliage and quiet deep teal background. The scene uses continuous shaped terrain, large important objects and a fixed close camera. The visual identity is feasible stylized browser 3D rather than the old photographic promise.

- **Opening v2:** high source pool and gate are immediately visible; the short hand/arrow and shallow notch preview point downhill, diagonally down-right from gate through only the soft sand into the existing dry channel. The broad terracotta channel and large dry destination are clear. One physical pale stone peg at the garden's inner rim carries a leaf and a horizontal fill line, visibly above the dry bed. The only primary UI action is `שחרור מים`, with a small undo. Hebrew title and contextual `גררו בחול` are readable. The reservoir's left edge is partly cropped, but the finite pool and gate remain plainly identifiable.
- **Payoff v2:** the opening camera, silhouettes and important object locations are preserved. The sand has a notch, the gate is open, the reservoir is lower and a thick connected wave reaches the pond. ALL garden trees now have upright trunks/branches, full dark green polygon crowns and unfurled new leaves; small flowers and shoots make recovery distinct from the drooping opening. Pond water reaches the same physical stone marker line, with the leaf symbol above water. Success is visible without a numeric counter or obscuring modal. `זה זורם!` is a local reward caption; the small next action leaves the result on screen.
- **Mistake/retry:** level 2 adds one readable house/courtyard and a physical fork. The open low branch floods the courtyard; the sand-blocked bypass and garden remain dry. The contextual `ננסה שוב` points toward the choice rather than giving a grade. This is a paused recoverable event, not resource punishment.

The important route is intentionally uncluttered even where shrubs decorate the perimeter. Do not recreate the old field of repeated trees or a thick checkerboard foundation. UI should preserve this small control count; an operator ledger/tool row would contradict the selected targets.

## Scientific and geometry review

These images specify appearance and communication, not hydrological truth or numerical mass accounting. Implementation must preserve actual finite stores and fluxes.

- Source is visibly above the receiving garden; the channel is continuous and descends through the edited obstruction. No target requires water to flow uphill.
- The gate controls the existing finite reservoir. Sand removal creates a route; it does not create water. The payoff's lower source and partly filled pond must be backed by conserved simulation volumes, not an independent success animation.
- The bold wave and wet leading edge should derive from modeled changing water/flux. Spray and highlights are cosmetic; they must not imply additional mass. The artwork's stylized water pattern does not require photoreal fluid simulation. The leaf marker is a visible pond-height objective and must map to actual modeled storage, not an unrelated answer variable.
- Greening/opening leaves is a compressed game response to successful irrigation. It must not be taught as a prediction that real olive trees recover or grow in eight seconds. It is feedback for delivered water, not another water source.
- The mistake shows the actual lower connected branch taking flow. The house cannot fail through a hidden answer variable; the bypass must really remain blocked at the sand neck until edited. Rewind restores water for another attempt while keeping the plan.
- Exposed rock layers and the organic edge are scenic. Geometry used for carving, hydraulic head and destination connections must remain consistent with what is visible. No invisible height thresholds, tiny required clicks or hidden checkbox panel should determine this opening action.

## Feasible rendering contract

Continuous terrain and broad banks can be procedural meshes over the conservative solver, with grouped foliage geometry, simple strata bands, practical shadows, a connected water surface and a limited leading-edge particle pool. The existing owned sluice supplies the identity prop. Detailed caustic patterns, a few scattered stones and roof tiles are surface treatment; their rendering technique can be procedural, but the composition, strong contrast, object scale and flowing-water prominence cannot be waived as optional detail.

Early implementation is intended to use a forgiving single pass drag to reach channel-bed depth, then an approximately eight-second wave, with a stable camera and immediate retry. Desktop and mobile should use the same action. Portrait composition is **not yet proved by these wide targets**; a phone frame and touch target inspection is still required before scaling the rebuild. No implementation parity, fun or learning outcome is claimed by generation alone.

## Review gate for implementation

Before adding more levels, compare a real opening and real payoff with these selected images for: source/goal placement, gate scale, continuous landform, broad readable channel, clear soft sand, bold wave, wet/green change, UI count and immediate retry. Source, editable obstruction and destination must remain clear at thumbnail size. A working mass ledger or a GLB load flag does not establish that match.
