# Basin Breakers — פורצי האגן

A Hebrew browser 3D landscape-and-water puzzle for the supplied Israeli grade8–9 Workbook geography scope. Carve finite earth, turn the sluice, release finite water, watch the consequences and rewind to improve the plan. **24 authored playable missions**, six acts, local progress and replay efficiency scores.

## Play locally

```sh
npm ci
npm run dev
```

Open http://localhost:5302 . Vite uses strict port5302. Production preview uses4302 (`npm run build && npm run preview`). Static output is `dist/`, with relative asset paths and no backend, API keys, analytics or runtime LLM. Production deployment is future work.

## Controls

- Drag/click with **חפירה** to lower terrain; **סוללה** raises it. Every change spends finite earth; bedrock limits depth. Two passes lower an authored1.4-unit earth plug.
- **שער** opens the gate/device inspector. Adjust opening, enable the membrane or wastewater treatment, choose actual product/brine/reuse pipe destinations, pump rate and drip irrigation as available.
- **מדידה** reads terrain/water height, salinity, pollutant and permeability. World labels show destinations, quantities and quality.
- **Space** runs/pauses; **R** rewinds all water/stores while preserving the terrain and device plan; **Escape** pauses/closes menus; **1–4** select tools; arrows move a keyboard brush and **Enter** applies the selected tool; **F** toggles fullscreen. Physical key codes support Hebrew keyboard layouts.
- Right drag or two-finger gesture orbits; wheel/pinch zooms. The circle button resets the camera. Touch uses the same tools, sliders and buttons. Sound can be muted; reduced-motion preference suppresses ornamental motion. Losing window focus pauses flow.
- Campaign map selects all24 levels for practice and can restore the last tested earth/device plan after a reload. **תכנון מחדש** resets the current terrain and stores. A hint pauses pressure and explains a physical relationship without drawing an answer route.

## Campaign

1–4: drainage, courtyard bypass, peak rate, changed relief. 5–8: infiltration, sealed ground, deposited sediment obstruction, two pulses. 9–12: recharge, pumping, reserve and source pollution. 13–16: salinity, membrane water/brine separation and finite energy. 17–20: destination-specific reuse, drip efficiency, separate supply networks and environmental allocation. 21–24: drought, storm, alternate layouts and unfamiliar whole-catchment transfer.

Each mission has an earth/device action plan and a physically failing plan tested independently. These are QA fixtures, not solution IDs checked by gameplay. All wins evaluate actual final quantities, qualities, safety and reserves after the full replay. All levels are available immediately so students/teachers can choose the relevant topic.

## Model and limits

The deterministic conservative cardinal-grid heightfield moves water according to hydraulic head differences. Salt, one supported pollutant tracer and reclaimed-water provenance move with the donor concentration. Infiltration transfers those masses to a lumped porous-rock aquifer. Pumps withdraw only stored water. A membrane separates intake into product and brine while consuming energy; ordinary wastewater treatment retains removed pollutant in a sludge ledger, retains salt/reuse and cannot certify potable water. Farm evaporation transfers water to an explicit evaporation store and leaves corresponding tracers in a soil residual store.

Schematic maps, compressed time and tuned units are original teaching scenarios, not engineering predictions or real drinking-water certification. Vertical relief is compressed in the view for readable channels. The aquifer is a storage abstraction, not simulated Darcy flow. Level7 models an existing deposited bed obstruction and its removal, not full suspended-sediment transport or instant geological soil development. Real student enjoyment/learning remains to be evaluated; internal scripted QA does not establish learning gains.

## Verification and evidence

```sh
npm run build
npm test
```

The independent64-check pure suite covers all24 known solutions and failing plans, independent four-tracer ledgers within1e-7, no negative stores, budget/depth limits, gate/pump constraints, infiltration, salinity, membrane energy/split, treatment/reuse, evaporation residue, final reserves, deterministic rewind and timestep subdivision. Browser plays use actual pointer/range/checkbox controls plus the documented deterministic time hook; they never inject a win. See [PLAYTEST.md](PLAYTEST.md) for exact browser coverage and current outcomes.

- [GAME_IDENTITY.md](GAME_IDENTITY.md): first minute, verbs, retry, camera, sound and scope.
- [CURRICULUM.md](CURRICULUM.md): exact Workbook URLs and all24 mission mappings, misconceptions and source corrections.
- [ASSETS.md](ASSETS.md): Tripo Chrome acquisition, paid-use basis, prompts, displayed credit cost, byte counts and hashes.
- [VISUAL_REVIEW.md](VISUAL_REVIEW.md): generated-target versus real-game comparison and deliberate differences.
- [docs/visual-targets](docs/visual-targets): two built-in imagegen **design targets**, generated and inspected before implementation, with exact prompts.
- [docs/captures](docs/captures), [docs/playtest-captures](docs/playtest-captures): actual browser evidence; file captions/state records distinguish progress, mistakes and outcomes.

The original sluice and membrane skid were generated normally through Tripo in the user's Chrome using60 displayed existing credits, no purchases. Both local GLBs load without external decoder/network dependencies and total2.62MB. Hebrew fonts are bundled locally. Local browser state contains completion scores, attempts, mute preference and the last tested earth/device plan, with no personal student information.

Public source: https://github.com/AceDZN/basin-breakers . Main is the authorized checkpoint branch. Assets are original generated props under the recorded Tripo paid-use terms; source snapshot attribution is retained. No Ministry endorsement is claimed.
