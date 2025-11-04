#!/bin/bash
# Build all vault outputs using Docker (can be containerized with Dagger)

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Error handler
error_exit() {
    echo -e "${RED}Error: $1${NC}" >&2
    exit 1
}

# Success message
success_msg() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Info message
info_msg() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Step header
step_msg() {
    echo -e "${BLUE}▶ $1${NC}"
}

echo "🚀 Building Obsidian Vault Outputs..."

# Validate required tools
command -v docker >/dev/null 2>&1 || error_exit "Docker is not installed"

# Create output directory
step_msg "Creating output directories..."
mkdir -p vault-outputs/{website,pdf,epub,portal}
success_msg "Output directories created"

# 1. Build Static Website
step_msg "Building static website..."
if docker run --rm -v "$(pwd):/docs" squidfunk/mkdocs-material:latest build -d /docs/vault-outputs/website; then
    success_msg "Static website built"
else
    error_exit "Failed to build static website"
fi

# 2. Generate PDF Book
step_msg "Generating PDF book..."
if docker run --rm -v "$(pwd):/workspace" pandoc/core:latest \
  bash -c "find /workspace/Databases -name '*.md' -type f -exec cat {} \; > /workspace/vault-outputs/pdf/vault-complete.md && \
  pandoc /workspace/vault-outputs/pdf/vault-complete.md -o /workspace/vault-outputs/pdf/vault-book.pdf --toc"; then
    success_msg "PDF book generated"
else
    error_exit "Failed to generate PDF book"
fi

# 3. Create EPUB
step_msg "Creating EPUB..."
if docker run --rm -v "$(pwd):/workspace" pandoc/core:latest \
  pandoc /workspace/index.md /workspace/Databases/**/*.md \
  -o /workspace/vault-outputs/epub/vault-book.epub \
  --metadata title="Obsidian Knowledge Vault" \
  --metadata author="Speed" \
  --toc --toc-depth=2; then
    success_msg "EPUB created"
else
    info_msg "EPUB creation failed (non-critical, continuing...)"
fi

# 4. Build Searchable Portal (using MkDocs with search plugin)
step_msg "Building searchable documentation portal..."
if docker run --rm -v "$(pwd):/docs" squidfunk/mkdocs-material:latest build -d /docs/vault-outputs/portal; then
    success_msg "Searchable portal built"
else
    error_exit "Failed to build searchable portal"
fi

# 5. Package as Docker Image
step_msg "Building Docker image..."
if docker build -f Dockerfile.vault-publisher -t vault-publisher:latest .; then
    success_msg "Docker image built: vault-publisher:latest"
else
    error_exit "Failed to build Docker image"
fi

echo ""
success_msg "All outputs built successfully!"
echo -e "${GREEN}📁 Check vault-outputs/ directory for results${NC}"
echo -e "${GREEN}🐳 Docker image: vault-publisher:latest${NC}"
echo ""
info_msg "Build completed at $(date)"
