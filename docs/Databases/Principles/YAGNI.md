---
type: principle
entropy: zero
domain: software-engineering
tags: [principle, simplicity, agile]
confidence: proven
applications: universal
date_documented: 2025-01-22
gif: https://media.giphy.com/media/3o85xnoIXebk3xYx4Q/giphy.gif
gif_alt: Person throwing unnecessary items in trash
---

# YAGNI - You Aren't Gonna Need It

![Person throwing unnecessary items in trash](https://media.giphy.com/media/3o85xnoIXebk3xYx4Q/giphy.gif)

## Core Truth
Never add functionality until it's actually needed.

## Why Zero Entropy  
Studies show 60-90% of features built "just in case" are never used. The cost of wrong abstraction always exceeds cost of duplication.

## The Principle
- Build only what's needed now
- Delete speculative code
- Prefer duplication over wrong abstraction

## What YAGNI Prevents
- Increased complexity
- Maintenance burden
- Wrong abstractions
- Wasted effort
- Delayed delivery

## When You Think You Need It
Ask:
1. Is it needed for current requirements? 
2. Will not having it block current work?
3. Do we have concrete use cases today?

If any answer is "no" → YAGNI

## The Paradox
The features you're certain you'll need are the ones you'll never use.
The features you never anticipated are the ones you'll desperately need.

## Related
- [[KISS - Keep It Simple Stupid]]
- [[Make It Work Then Make It Right]]
- [[Premature Optimization]]