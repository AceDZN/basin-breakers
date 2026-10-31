# Model plan (before implementation)

A bounded 29 × 23 cell heightfield carries water volume plus salt, a supported pollutant tracer and reclaimed-water provenance. Cardinal edge flux follows head differences, with outgoing volume bounded by donor storage. Every transfer moves tracers in the donor concentration. Finite upstream reservoir stores enter the surface at a gate-controlled rate. Multiple weather pulses are release times for already accounted stores, not unlimited rainfall.

Terrain edits consume the actual absolute height change from a finite earth budget and cannot cut bedrock indefinitely. Existing channel reaches expose interrupted banks and embankments, but player carving and raising can alter routes. A plan is terrain edits plus gate/device controls, never a solution identifier. The same terrain/controls deterministically replay from initial stores.

Destinations extract actual surface water into explicitly accounted stores. A drinking destination checks salinity, pollutant concentration and reclaimed provenance; farms have less strict pollutant/salt thresholds but are not unrestricted waste sinks. Water quality remains meaningful after mixing. Houses measure flood exposure; success cannot be declared early before a second pulse or depleted reserve occurs.

Infiltration transfers water and all tracers into a separate lumped porous-rock aquifer. There is no automatic filtration. A pump can only withdraw current aquifer storage. A reserve constraint is evaluated at the replay horizon. This is a schematic abstraction of recharge/storage, not Darcy flow or groundwater age prediction.

A membrane intake separates an energy-limited quantity into product water and brine. Both outputs receive their assigned share of water and tracer mass. Wastewater treatment removes only a supported pollutant into an explicit sludge ledger, retains salt and reclaimed provenance, and cannot certify drinking water. Irrigation efficiency affects useful farm delivery versus explicitly tracked evaporative loss; it never increases input.

Independent QA will calculate totals directly from arrays/stores, run known earth/control action sequences for all 24 levels, compare timestep subdivision, and play failure/retry through browser inputs. Numeric budgets and times are tuned original scenarios.
