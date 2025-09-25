# Law of Template Inclusion

**Law Type**: Software Distribution Law
**Discovered**: Automagik Hive Development (December 2024)
**Domain**: Python Package Management

## Statement

> "Templates and other non-Python resources MUST be explicitly configured for inclusion in Python package distributions, or they will be silently omitted."

## Mathematical Expression

```
P(distribution) = Code + Resources × Configuration
If Configuration = 0, then Resources = ∅
```

## Evidence

### Automagik Hive Case Study

**Failed State** (v0.1.9):
```toml
# No package-data configuration
# Result: Templates exist in source, missing in distribution
```

**Success State** (v0.1.10):
```toml
[tool.setuptools.package-data]
automagik_hive = ["templates_included/**/*.yaml"]
# Result: Templates included in distribution
```

## Implications

1. **Silent Failure**: Package builds successfully even without resources
2. **Works Locally**: Development mode masks the problem
3. **Distribution Breaks**: Users get incomplete packages
4. **Testing Gap**: Standard tests don't catch missing resources

## Corollaries

### Corollary 1: The Naming Uniqueness Principle
Resources should have unique directory names to avoid conflicts

### Corollary 2: The Manifest Completeness Rule
Every non-Python file type needs explicit inclusion

### Corollary 3: The Development-Production Parity Gap
What works in development may not work in distribution

## Prevention Strategies

1. **Explicit Configuration**
   ```toml
   [tool.setuptools.package-data]
   package = ["templates/**/*", "data/**/*"]
   ```

2. **MANIFEST.in File**
   ```
   include package/templates/*
   recursive-include package/data *
   ```

3. **Test Distribution**
   ```bash
   python -m build
   pip install dist/*.whl
   # Test that resources are accessible
   ```

## Historical Context

- **setuptools era**: Required MANIFEST.in
- **Modern tools**: Still require explicit configuration
- **Automagik Hive**: 18 days to discover this law

## Related Laws

- [[Law of Silent Failures]]
- [[Law of Development-Production Disparity]]
- [[Law of Package Completeness]]

## Exceptions

- Pure Python packages (no resources needed)
- Packages using `package_data` autodiscovery (rare)

## Proof

Given:
- Source contains templates/
- No package-data configuration
- Build succeeds

Then:
- Distribution excludes templates/
- Runtime fails to find templates
- Q.E.D.

## Zero-Entropy Insight

"What you don't explicitly include, you implicitly exclude."

---
*Law discovered through 18 days of debugging (Nov-Dec 2024)*