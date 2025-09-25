# Law of Distribution Complexity

**Law Type**: Software Engineering Law
**Domain**: Package Management
**First Observed**: Python Packaging Ecosystem

## Statement

> "The complexity of distributing software is inversely proportional to the complexity of developing it. The easier it is to build locally, the harder it is to distribute globally."

## Mathematical Expression

```
C(distribution) = k / C(development) + ε

Where:
- C(distribution) = Distribution complexity
- C(development) = Development complexity  
- k = Platform constant
- ε = Environmental factors
```

## Evidence

### Automagik Hive Timeline
- **Days 1-5**: 29 commits, fully functional locally
- **Days 45-63**: 18 days struggling with distribution
- **Ratio**: 3.6x more time on distribution than core development

### Common Manifestations

1. **Python**: Works with `pip install -e .`, fails with `pip install package`
2. **Node.js**: Works with `npm link`, fails with `npm publish`
3. **Docker**: Works locally, fails in registry
4. **Electron**: Runs in dev, fails when packaged

## Corollaries

### Corollary 1: The Local Success Trap
Early local success creates false confidence about distribution readiness.

### Corollary 2: The Resource Inclusion Paradox
The more resources your package needs, the more likely they'll be excluded.

### Corollary 3: The Version Bump Phenomenon
Distribution problems lead to rapid version increments (0.1.6→0.1.9).

## Proof by Cases

### Case 1: Pure Code Package
- Development: Medium complexity
- Distribution: Low complexity
- Ratio: Favorable

### Case 2: Code + Resources Package
- Development: Medium complexity
- Distribution: High complexity
- Ratio: Unfavorable (Automagik Hive case)

### Case 3: Binary Package
- Development: High complexity
- Distribution: Maximum complexity
- Ratio: Hostile

## Mitigation Strategies

1. **Test Distribution Early**
   ```bash
   python -m build && pip install dist/*.whl && pytest
   ```

2. **CI/CD Distribution Tests**
   ```yaml
   - name: Test Distribution
     run: |
       pip install dist/*.whl
       package-name --version
   ```

3. **Resource Embedding**
   ```python
   # Embed resources in Python code
   TEMPLATES = {"file.yaml": "content..."}
   ```

## Historical Examples

1. **Automagik Hive**: 18 days to fix template distribution
2. **TensorFlow**: Years of pip installation issues
3. **Node-gyp**: Perpetual native module problems

## Related Laws

- [[Law of Template Inclusion]]
- [[Law of Silent Failures]]
- [[Law of Leaky Abstractions]]
- [[Murphy's Law of Packaging]]

## Exceptions

- Single-file scripts
- Pure Python packages with no dependencies
- Packages with exceptional tooling

## Implications for Development

1. **Budget Time**: Allocate 50% of timeline for distribution
2. **Test Early**: Create distribution tests before features
3. **Document Process**: Distribution steps are critical docs
4. **Version Strategy**: Expect multiple versions for distribution fixes

## Zero-Entropy Insight

"If it works on your machine, it's 50% done."

---
*Law validated by countless package distribution failures*