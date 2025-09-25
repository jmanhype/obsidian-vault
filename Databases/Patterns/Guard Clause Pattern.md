---
type: pattern
category: refactoring
entropy: low
language_agnostic: true
tags: [pattern, clean-code, readability]
use_cases: [validation, error-handling, control-flow]
date_documented: 2025-01-22
gif: https://media.giphy.com/media/l0HlBO7eyXzSZkJri/giphy.gif
gif_alt: Security guard checking credentials at gate
---

# Guard Clause Pattern

![Security guard checking credentials at gate](https://media.giphy.com/media/l0HlBO7eyXzSZkJri/giphy.gif)

## Intent
Exit early from functions when preconditions aren't met, avoiding deep nesting.

## Problem Solved
Eliminates arrow anti-pattern (deeply nested if statements).

## Before (Arrow Anti-Pattern)
```javascript
function processUser(user) {
    if (user != null) {
        if (user.isActive) {
            if (user.hasPermission) {
                // actual logic here
                return doSomething(user);
            }
        }
    }
    return null;
}
```

## After (Guard Clauses)
```javascript
function processUser(user) {
    if (user == null) return null;
    if (!user.isActive) return null;
    if (!user.hasPermission) return null;
    
    // actual logic here, no nesting
    return doSomething(user);
}
```

## Benefits
- Reduces cognitive load
- Makes happy path obvious
- Easier to test
- Self-documenting

## When to Use
- Multiple preconditions
- Validation logic
- Error checking
- Permission checking

## Related Patterns
- [[Early Return]]
- [[Fail Fast]]
- [[Defensive Programming]]