---
type: principle
entropy: zero
domain: [information-architecture, databases, content-management]
tags: [principle, filtering, data-organization]
confidence: proven
applications: universal
date_documented: 2025-01-22
gif: https://media.giphy.com/media/xT9IgzoKnwFNmISR8I/giphy.gif
gif_alt: Tags and labels organizing chaos into clarity
---

# Filter by Semantic Identity, Not Physical Location

![Tags and labels organizing chaos into clarity](https://media.giphy.com/media/xT9IgzoKnwFNmISR8I/giphy.gif)

## Core Truth
Always filter data by what it IS, not where it LIVES.

## Why Zero Entropy
Physical location is ephemeral and implementation-dependent. Semantic identity is invariant and intention-revealing. This holds across all systems: filesystems, databases, knowledge bases, even physical organization.

## The Principle
- Tag/type/category = Semantic identity (what it IS)
- Path/folder/location = Physical location (where it LIVES)
- Always choose semantic over physical for filtering

## Universal Proof
Every robust system evolves from physical to semantic:
- Files: folder paths → tags and metadata
- Databases: table location → foreign keys and relationships  
- Web: directory structure → semantic HTML and microdata
- Libraries: shelf location → subject classification
- Biology: physical proximity → functional grouping

## Why Physical Location Fails
1. **Moves break filters** - Reorganization shouldn't break queries
2. **Platform-dependent** - Paths vary across systems
3. **Single hierarchy** - Items can only be in one place
4. **Coupling** - Ties logic to storage implementation

## Why Semantic Identity Works
1. **Location-independent** - Works regardless of storage
2. **Multiple membership** - Items can have many identities
3. **Intention-revealing** - Shows WHY not just WHERE
4. **Refactor-safe** - Reorganization doesn't break logic

## The Pattern
```yaml
# WRONG - Physical coupling
filter: path.startsWith("/projects/")

# RIGHT - Semantic identity  
filter: hasTag("project")
filter: type == "project"
filter: category.includes("project")
```

## Manifestations
- Git: branches/tags vs directories
- Docker: labels vs file locations
- Kubernetes: selectors vs namespaces
- Email: labels/tags vs folders
- OOP: interfaces vs inheritance

## Corollary
Any system that forces physical-only organization will eventually add semantic layer (tags, labels, categories) or be replaced by one that does.

## Related Principles
- [[Separation of Concerns]]
- [[Single Source of Truth]]
- [[Law of Demeter]]