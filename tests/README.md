# QA test ownership

The geography/gameplay QA helper owns this directory. Tests will import the deterministic model once the lead publishes its public API. They must independently total the physical ledger, run authored action sequences for every level, and challenge quantity/quality/reserve constraints with meaningful wrong actions.

Do not count a fixed answer key, injected win flag, plan-label match or early tank fill as physical solvability. Final evaluation must occur after all weather pulses and sustained-demand periods.

Browser scripts must operate actual UI controls and may use the documented deterministic clock. A debug solution can help development but cannot serve as browser-play evidence.


Current commands:

- `npm test`: 64 independent model/campaign checks, including every known and bad plan.
- `node_modules/.bin/tsx tests/browser-qa.ts`: actual UI scenarios for 1,2,5,6,10,15,17,19,24.
- `BASIN_QA_LEVELS=1,2 node_modules/.bin/tsx tests/browser-qa.ts`: focused subset after a UI fix.

All shell commands run in `/Users/acedzn/dev/AceDZN-exp/basin-breakers`. Browser artifact directory is `docs/playtest-captures`. The lead also runs the required develop-web-game skill action client; this supplemental harness is needed to exercise authored terrain/device actions across multiple campaign maps.
