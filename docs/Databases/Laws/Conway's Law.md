---
type: law
entropy: zero
domain: [software, organizations, systems]
tags: [law, architecture, organization-design]
proven_since: 1967
author: Melvin Conway
date_documented: 2025-01-22
gif: https://media.giphy.com/media/3oz8xQQP4ahKiyuxHy/giphy.gif
gif_alt: Organization chart morphing into system architecture
---

# Conway's Law

![Organization chart morphing into system architecture](https://media.giphy.com/media/3oz8xQQP4ahKiyuxHy/giphy.gif)

## The Law
"Any organization that designs a system will produce a design whose structure is a copy of the organization's communication structure."

## Why This Is Absolute (Zero Entropy)
- No exceptions found in 50+ years
- Applies to all human organizations
- Inevitable due to information flow constraints

## Implications

### For Software Architecture
- Microservices reflect team boundaries
- Monoliths emerge from centralized teams
- API boundaries match organizational boundaries

### For Organization Design
- Want modular software? Create modular teams
- Want integrated product? Create cross-functional teams
- Architecture follows org chart, not the other way around

## Inverse Conway Maneuver
Deliberately restructure teams to achieve desired architecture.

## Real World Proofs
- Amazon's two-pizza teams → microservices
- Spotify's squads → autonomous features
- Traditional enterprises → layered monoliths

## Corollaries
1. If you don't actively manage team structure, you get accidental architecture
2. Changing architecture requires changing team structure
3. Communication paths determine integration points

## Counter-attempts That Failed
- Trying to build microservices with a monolithic team
- Attempting integrated UX with siloed departments
- Creating modular systems without modular ownership

## Related Laws
- [[Brooks' Law]]
- [[Parkinson's Law]]
- [[The Mythical Man-Month]]