# Contributing to Obsidian Vault

Thank you for your interest in contributing to this knowledge vault project! While this is primarily a personal knowledge base, contributions for automation scripts, tooling improvements, and bug fixes are welcome.

## How to Contribute

### Reporting Issues

If you find a bug or have a suggestion:

1. Check existing [issues](https://github.com/yourusername/obsidian-vault/issues) to avoid duplicates
2. Create a new issue with:
   - Clear title and description
   - Steps to reproduce (for bugs)
   - Expected vs actual behavior
   - Environment details (OS, Python version, Docker version)

### Submitting Changes

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/obsidian-vault.git
   cd obsidian-vault
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow existing code style and conventions
   - Add tests if applicable
   - Update documentation

4. **Test your changes**
   ```bash
   # Test Python scripts
   python3 Scripts/your-script.py --help

   # Test shell scripts
   bash -n build-vault-outputs.sh  # Syntax check

   # Run health checks
   python3 Scripts/vault-health-check.py
   ```

5. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add feature description"
   ```

   Use [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` - New features
   - `fix:` - Bug fixes
   - `docs:` - Documentation changes
   - `refactor:` - Code refactoring
   - `test:` - Adding tests
   - `chore:` - Maintenance tasks

6. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```
   Then create a Pull Request on GitHub.

## Development Guidelines

### Python Scripts

- Use Python 3.8+ features
- Include docstrings for classes and functions
- Add type hints where helpful
- Handle errors gracefully
- Include `#!/usr/bin/env python3` shebang
- Make scripts executable (`chmod +x`)

Example:
```python
#!/usr/bin/env python3
"""
Script description here.
"""

import argparse
from pathlib import Path
from typing import Dict, List

class MyClass:
    """Class description."""

    def __init__(self, path: str):
        """Initialize with path."""
        self.path = Path(path)

    def process(self) -> Dict[str, any]:
        """Process and return results."""
        # Implementation
        pass

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Script description")
    parser.add_argument("path", help="Path to vault")
    args = parser.parse_args()

    # Run script
```

### Shell Scripts

- Use `#!/bin/bash` shebang
- Include `set -euo pipefail` for safety
- Add error handling functions
- Validate required tools exist
- Use colored output for readability
- Make scripts executable (`chmod +x`)

Example:
```bash
#!/bin/bash
set -euo pipefail

error_exit() {
    echo "Error: $1" >&2
    exit 1
}

command -v docker >/dev/null 2>&1 || error_exit "Docker not installed"

# Script logic here
```

### Documentation

- Update README.md for new features
- Add inline comments for complex logic
- Include usage examples
- Document environment variables
- Update mkdocs.yml for new pages

### Testing

Before submitting:

1. **Syntax check Python**:
   ```bash
   python3 -m py_compile Scripts/*.py
   ```

2. **Syntax check Bash**:
   ```bash
   bash -n *.sh
   ```

3. **Run health checks**:
   ```bash
   python3 Scripts/vault-health-check.py
   ```

4. **Test Docker builds** (if applicable):
   ```bash
   docker build -f Dockerfile.vault-publisher -t test:latest .
   ```

## Areas for Contribution

### High-Priority

- **Testing**: Add unit tests for Python scripts
- **Documentation**: Improve inline documentation and examples
- **Error Handling**: Enhance error messages and recovery
- **Performance**: Optimize vault scanning and processing

### Nice-to-Have

- **CI/CD**: Improve GitHub Actions workflows
- **Monitoring**: Enhanced health check metrics
- **Integrations**: New export formats or integrations
- **UI**: Web dashboard for vault statistics

## Code Review Process

1. All PRs require review before merging
2. CI checks must pass (linting, tests)
3. Documentation must be updated
4. Changes should be focused and atomic

## Questions?

Open an issue or discussion if you have questions about:
- Implementation approach
- Architecture decisions
- Feature requests
- Contribution guidelines

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for helping improve this project! 🎉
