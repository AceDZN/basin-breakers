# Assets and acquisition

31 October 2026. Original generated gameplay design targets are in `docs/visual-targets/`; these are not runtime screenshots.

## Tripo sluice gate

- Acquisition: user's Chrome, own **💧 Basin Breakers** tab, normal Tripo Studio UI, https://studio.tripo3d.ai/workspace/generate/ . Existing `My Assets` library inspected first; no suitably matching owned sluice was visible, so original generation selected.
- Account UI shows **Pro**. Current official [commercial-use guide](https://www.tripo3d.ai/help/privacy-policy/how-to-use-tripo-models-commercially) states paid users may use, modify and distribute generated models. This is a generated original commissioned prop, not a gallery asset with unverified rights. No terms were accepted, no upgrade or purchase made.
- Mode: HD Model, text to 3D, H3.1 Best Quality, Geometry & Texture, Private; parts and 8K trials disabled. Static rigid machinery, no deforming character and no rig or animation processing.
- Displayed generation cost: **30** credits. Balance observed before: **3200**; after submission: **3170**. Crew total so far 30/600, one model generation of three allowed.
- Exact prompt: `Original game prop for Basin Breakers: modular canal sluice gate, two thick carved pale Mediterranean limestone piers and lintel forming upright rectangular opening, dark aged copper handwheel visibly above gate, cobalt ceramic blue mechanical housing centered below wheel, simple iron sliding panel, broad stable stone footings, charming stylized realistic indie game materials, clear readable silhouette. Single isolated static object, centered, no water, no landscape, no background, no text, no logo, no people. Modest low poly game ready geometry, physically plausible machinery. Front three quarter view.`
- Task URL: https://studio.tripo3d.ai/workspace/generate/5531fe71-c0bf-42ba-a120-f19d970d71e3 . Completed and inspected in Studio. Normal **Export → GLB → 2k → Export** downloaded `basin-breakers-sluice-source.glb` to Downloads; export download-event observation timed out, but the ordinary browser download completed and file was confirmed. Source copied into ignored scratch `work/art/` for optimization.
- Source: **3,305,640 bytes**, SHA-256 `8f21ffc2c997fe8a4a8ff82280392cf3c6d755e51d862d7e76d79e28985a2fe1`.
- Runtime: **`public/models/sluice-gate.glb`**, **1,402,236 bytes**, SHA-256 `d2d7dd50c30bd2af0ba51a38de7bd429ddfedd3a4e88938023a209e0eb7229d6`.
- Optimization: registry package `@gltf-transform/cli@4.2.1 resize ... --width 1024 --height 1024`. Original topology preserved; 19,618 triangles, 11,691 vertices, one mesh/material, three textures resized 2048→1024, no required runtime extensions or compression decoder. Unsupported optional `FB_ngon_encoding` metadata discarded by glTF Transform. Source remains in scratch, not public download.
- Local extents: min `(-0.5, 0, -0.269623)`, max `(0.5, 0.945679, 0.269623)`. Y up, foot at Y0, X width1, centered in XZ, visual front +Z. Scene can scale to source channel width and rotate about Y. All parts form one rigid decorative mesh; actual animated flow barrier/wheel feedback must be separate procedural geometry. Boundaries and colliders remain authoritative simulation geometry.

## Tripo membrane skid

- Same account, method and rights basis; static HD H3.1 machine with no rig. Task URL: https://studio.tripo3d.ai/workspace/generate/9c662f6d-0f20-4c8b-8817-c2659c5d4068 .
- Displayed cost **30** credits. Balance previously seen 3170; after submission 3080. Other authorized crews share this balance, so the 90-credit observed interval decrease is not attributed entirely to this crew. Our submitted displayed costs total **60/600**, two model generations of three allowed.
- Exact prompt: `Original compact membrane desalination skid for Mediterranean water puzzle game Basin Breakers. Single static machine, cobalt ceramic blue rectangular housing on pale limestone plinth, aged copper trim and pipes, three horizontal white membrane pressure vessels inside open support frame, one large intake socket at left, two unmistakably separate output sockets at right at different heights, one blue and one copper. Clear small game prop silhouette, readable from oblique isometric camera, low poly stylized realistic materials. Isolated object on plain background, no text, no logos, no ground scenery, no water, no people, no extra buildings.`
- Actual connectors, product/brine streams and treatment type are procedural simulation geometry. This model's decorative socket shapes do not define hydraulic behavior. Reuse treatment uses its own wastewater input and never comes from a membrane brine output.
- Completed, inspected, and normally exported **GLB/2k** via UI to `basin-breakers-membrane-source.glb`; copied from Downloads into scratch. Source **3,056,708 bytes**, SHA-256 `07c5c3193b8c5b85758dd3ca991daae4d2500bac4ffef4b725100ba21eab733c`.
- Runtime **`public/models/membrane-skid.glb`**, **1,214,152 bytes**, SHA-256 `c903645b1b6da579f36776ac36793c05586667711754a592f1d95c1a9325b79f`.
- Same pinned texture optimization 2048→1024, original 17,534 triangles, 12,245 vertices, one mesh/material, no required extensions. Extents min `(-0.5,0,-0.323914)`, max `(0.5,0.625061,0.323914)`. Y up, grounded Y0, front +Z. Three visible white membrane vessels, cobalt framing, copper sockets/trim, limestone plinth.

## Runtime and size check

Both optimized GLBs together: **2,616,388 bytes** (2.62 MB decimal). Terrain, water, basin boundaries, gates, exact pipes, buildings and vegetation are procedural. Imported prop geometry is visual and never the hydraulic solver. Actual runtime integration/model-load verification will be recorded after the game is built.
