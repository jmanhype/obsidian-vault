---
type: pattern
category: creational
entropy: low
language_agnostic: true
tags: [pattern, design-pattern, creational]
use_cases: [database-connections, logging, configuration]
date_documented: 2025-01-22
gif: https://media.giphy.com/media/3ohc19EK1gypvsYQgg/giphy.gif
gif_alt: One ring to rule them all
---

# Singleton Pattern

![One ring to rule them all](https://media.giphy.com/media/3ohc19EK1gypvsYQgg/giphy.gif)

## Intent
Ensure a class has only one instance and provide global access to it.

## Problem Solved
- Need exactly one instance (database connection, logger, config)
- Need global access point
- Need lazy initialization

## Structure
```
class Singleton {
    private static instance: Singleton
    private constructor() {}
    
    public static getInstance(): Singleton {
        if (!Singleton.instance) {
            Singleton.instance = new Singleton()
        }
        return Singleton.instance
    }
}
```

## When to Use
- Exactly one instance needed
- Instance needs global access
- Lazy initialization desired

## When NOT to Use  
- Makes testing harder
- Creates hidden dependencies
- Can become an anti-pattern if overused

## Modern Alternatives
- Dependency injection
- Module pattern
- Factory with instance management

## Real World Examples
- Database connection pools
- Application configuration
- Logging services
- Cache managers

## Related Patterns
- [[Factory Pattern]]
- [[Builder Pattern]]
- [[Prototype Pattern]]