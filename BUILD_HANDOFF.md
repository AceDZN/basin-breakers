# Basin Breakers — פורצי האגן

Commissioned 31 October 2026. Own this repository and this game's builder chat. Read docs/COMMON.md. Public repo https://github.com/AceDZN/basin-breakers . Dev 5302, preview 4302. Hebrew browser 3D, grades 8–9, **24 authored levels**. Required order: imagegen → user's Chrome Tripo → game → real-versus-target review.

## The game

A tactile landscape puzzle toy with dramatic water release. Borrow From Dust's terrain manipulation, Terra Nil's satisfying visible environmental change, and Poly Bridge's build/test/replay tension. Carve a channel with a limited earth budget, set a gate or treatment module, release a finite pulse and watch whether it fills the intended basin or floods the wrong place. Pause to plan, run to enjoy the consequences, rewind quickly and try a better cut. Later levels combine freshwater, saline water, treated wastewater, aquifer renewal and drinking versus farm demand. This is a compact puzzle-action game, not a national policy dashboard.

First minute: an upstream reservoir sits behind a low wall; a village tank and dry field lie on different slopes. Carve a bend around a house, lift the gate and let a sparkling pulse race the ravine. A straight trench sends the surge into the house courtyard; comic splashes, the tank stays low, a Hebrew cause caption points to the topography. Rewind to the gate, make a spill basin, open gradually and chain the tank fill into field irrigation. One plan can be revised with visible water rather than an answer textbox. No avatar courier or fake yes/no doors.

Controls: drag to carve/raise within allowed ground; click placed gates then drag their wheel/slider; Space toggles plan/run, R rewind pulse, Escape pause; touch equivalents. Camera: low oblique orbit around a substantial 3D terrain cutaway, zoom for channels, reset to readable whole basin. View water surface height, terrain, aquifer cutaway on demand. Four sparse tool icons and a compact quantity/quality/budget bar. Strong wet/dry animation, churning spill, water sound and satisfying filling chimes. A wave replay is short, with fast restart.

Art: expressive terraced limestone canyon and precise ceramic/copper-blue water machinery; dark olive shrubs, warm stone, turquoise water, salt crust white, sunlit Mediterranean texture. Physical channels have visible walls and depth. Glowing paths and color-coded answers do not replace elevation and water-quality information. Shapes/patterns/labels accompany colors. Different camera/composition from the flight or transport game.

## Feasible and accurate system

Use a modest conservative 2D heightfield/shallow-volume flow model rendered as real 3D mesh; no SPH/AAA fluid undertaking. Explicit finite water volume, terrain height, cell storage, edge flow, permeable ground, aquifer store and quality tracers. Surface water follows hydraulic head differences in this simplified model. Aquifer flow/storage is an abstraction and documented separately; do not imply all water lives in underground rivers. Earthen edits have a real budget and allowed depth, not unlimited magic.

Mass accounting: water input = stores + outflows + designated evaporative loss; contaminants and salt move with concentration/mass, never disappear merely because streams touch. Desalination yields freshwater and brine with energy cost; treatment changes supported contaminants, not automatically salt; reuse may go to appropriate farms but not a drinking tank. Use a finite safe model of quality categories; do not claim real potable-water certification. Sources, quality and destination matter as much as a full reservoir. Simulation values/time are tuned originals, not real water-system predictions.

Primary source files: g8-water.md, g8-erosion.md, g9-water-tech.md, g9-water-quality.md, g9-water-management.md; optional g9-rivers.md. Geography links drainage/land cover to supply and downstream effects. No need to teach current laws, prices or national statistics. Correct source shorthand that says technology creates water: it separates or reuses water.

## 24 authored levels

| # | Hebrew mission / action | Decision and tested misconception |
|---|---|---|
| 1 | הפתח הראשון — carve a downhill outlet to a tank | Visible terrain gradient, finite water and successful fill. |
| 2 | הבית שבדרך — bend a trench around a courtyard | Shortest cut floods the wrong place; drainage route matters. |
| 3 | לאט עם השער — meter a pulse through a narrow reach | Peak flow and temporary storage; amount alone is insufficient. |
| 4 | אגן חדש — move inlet and outlet elevations | First transfer, changed topology without a drawn solution. |
| 5 | מה נבלע בקרקע — permeable versus sealed ground | Infiltration reduces immediate runoff and adds groundwater store. |
| 6 | חצר האספלט — new sealed patch increases runoff | Same rain input, different surface consequences. |
| 7 | מדרגות הנחל — sediment blocks a channel | Erosion transports material; deposition changes flow capacity. |
| 8 | הגשם הבא — retention area helps a second pulse | Manage two events; cannot use one-shot drainage trick. |
| 9 | האקוויפר — recharge then pump | Groundwater is stored in permeable material; pump only what exists. |
| 10 | באר עמוקה מדי — sustained demand exceeds renewal | Temporary pumping win becomes depletion; keep a reserve. |
| 11 | מקור מזוהם — source control before infiltration | Surface pollution can threaten groundwater; no magical cleanse. |
| 12 | חוזרים למקור — new land cover and recharge layout | Unaided runoff/infiltration/renewal transfer. |
| 13 | מלח במים — saline inlet cannot fill drinking tank | Quantity versus quality; label/salinity instrument, not hue only. |
| 14 | הממברנה — route intake through desalination | Freshwater plus brine plus energy; both output streams tracked. |
| 15 | לא לאותו צינור — keep brine away from freshwater | Dilution is not elimination; wrong mix needs real recovery. |
| 16 | לילה בלי הספק — energy constraint cuts treatment rate | Add stored freshwater and timing; not infinite technology. |
| 17 | מים לסיבוב נוסף — wastewater treatment to farm | Treated reuse is destination-specific, never automatically potable. |
| 18 | אל השורש — drip layout reduces irrigation loss | Demand efficiency conserves water rather than creating more. |
| 19 | שתי רשתות — town freshwater, farms reuse | Two quality pathways and a limited crossing/gate budget. |
| 20 | הנחל צריך מים — meet supply and downstream minimum | All water diverted to tanks is not a sustainable win. |
| 21 | בצורת באגן — combine renewal, reuse and limited desalination | Multi-source balance with no free source. |
| 22 | מבול קצר — flood storage then refill supply | Upstream management changes downstream peak; satisfy safety and quantity. |
| 23 | תכנית משלכם — two valid quality-safe layouts | Optimize earth/energy/retained water; replay supports alternate solutions. |
| 24 | האגן החי — unfamiliar whole catchment, two weather pulses | Unaided integrated transfer: routing, infiltration, quality, reuse and environmental reserve. |

Six acts of four. Each level has authored geometry, budgets, success conditions, a known solution and a meaningful wrong action. Build 1–4 first, then all 24. No stopping at a toy water demo. Rerun a pulse deterministically; preserve prior plan/replay. A hint identifies a physical relationship instead of painting the complete solution. First-unaided/hinted outcomes separate.

## Tripo asset plan

Original identity prop: **Basin Breakers modular canal sluice gate**, carved pale limestone frame, dark copper handwheel, ceramic blue mechanical housing, upright clear silhouette, no text, static game prop. Second optional: compact treatment/desalination skid with two visually distinct output sockets; procedural connectors and exact flow boundaries remain authoritative. No deforming character needed. Record acquisition/cost/rights and actual runtime use under common limits. Do not generate terrain as a GLB; sculptable precise surface is procedural.

## Acceptance

Tests verify volume and salt/contaminant conservation within explicit tolerance, stable flow under timestep changes, no negative store, treatment rejects unsupported purification, downstream reserve and known solution for every level. QA must play real inputs for flood/retry level 2, permeability 5/6, depletion 10, brine mistake 15, wrong drinking-water connection 17/19 and final 24. Demonstrate that an aesthetically neat but physically wrong route fails for the actual modeled reason. No background-success script or fixed answer key pretending to simulate flow.

Compare real captures to targets for materialized channel depth, readable animated water, low-oblique camera, gate identity, strong whole-basin composition and restrained Hebrew HUD. Deliver common docs, 24 levels and running server; commit/push main at milestones.
