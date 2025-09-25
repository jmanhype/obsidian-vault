---
type: technical-insight
category: syntax-schema
entropy: high
tool: Obsidian
feature: Bases Plugin
tags: [knowledge, obsidian, yaml, filtering, high-entropy]
date_discovered: 2025-01-22
status: resolved
gif: https://media.giphy.com/media/l46Cy1rHbQ92uuLXa/giphy.gif
gif_alt: Confused math lady meme - multiple syntax attempts
---

# Obsidian Bases Filter Syntax

![Confused math lady meme - multiple syntax attempts](https://media.giphy.com/media/l46Cy1rHbQ92uuLXa/giphy.gif)

## Problem
Needed to filter Bases to show only files from specific folders, but multiple approaches failed.

## Failed Attempts
1. **JSON format** - "Unable to parse base file"
2. **YAML with `source` path** - No effect
3. **Path filtering with `conditions`** - "Filters may only have 'and', 'or', or 'not' keys"
4. **Path filtering with `file.path.startsWith()`** - 0 results

## Solution
Use tag-based filtering with the `file.hasTag()` function:

```yaml
views:
  - type: table
    name: Active Projects
    filters:
      and:
        - 'file.hasTag("project")'
```

## Why High Entropy?
- Multiple plausible syntax variations
- Undocumented function names
- Context-dependent behavior
- Required external example (YouTube) to resolve

## Key Insights
- Tags are more reliable than paths for filtering
- Filter functions use specific syntax like `file.hasTag()`
- YAML format requires `views` wrapper
- Filters must use `and`, `or`, or `not` as keys

## Related
- [[YAML Syntax]]
- [[Obsidian Plugins]]
- [[High-Entropy APIs]]