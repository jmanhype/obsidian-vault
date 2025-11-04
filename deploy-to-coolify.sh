#!/bin/bash
# Deploy Obsidian Vault Documentation to Coolify
# Uses Apollo Dagger MCP for containerization

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

echo "🚀 Deploying Vault Documentation to Coolify"

# Configuration
COOLIFY_URL="${COOLIFY_URL:-http://192.168.1.190:8000}"
PROJECT_NAME="${PROJECT_NAME:-vault-docs}"
IMAGE_NAME="${IMAGE_NAME:-vault-publisher}"
IMAGE_TAG="${IMAGE_TAG:-latest}"

# Validate required tools
command -v docker >/dev/null 2>&1 || error_exit "Docker is not installed"
command -v dagger >/dev/null 2>&1 || info_msg "Dagger CLI not found, skipping Dagger build step"

# Build with Apollo Dagger MCP (using existing operations)
if command -v dagger >/dev/null 2>&1; then
    info_msg "Building container with Apollo Dagger MCP..."

    # Option 1: Use dagger CLI directly
    if dagger call \
      --source-dir=. \
      container-from --address="squidfunk/mkdocs-material:latest" \
      container-with-directory --path="/docs" --directory="." \
      container-with-exec --args='["mkdocs", "build", "-d", "/output/website"]' \
      container-with-exec --args='["tar", "-czf", "/output/vault-docs.tar.gz", "/output/website"]' \
      export --path="./build"; then
        success_msg "Dagger build completed"
    else
        error_exit "Dagger build failed"
    fi
else
    info_msg "Skipping Dagger build (CLI not installed)"
fi

# Option 2: Use Apollo MCP operations through GraphQL
# This would use the RunestoneBuild operation adapted for MkDocs

info_msg "Building Docker image..."
if ! docker build -f Dockerfile.vault-publisher -t ${IMAGE_NAME}:${IMAGE_TAG} .; then
    error_exit "Docker build failed"
fi
success_msg "Docker image built: ${IMAGE_NAME}:${IMAGE_TAG}"

# Tag for Coolify's registry (if using local registry)
# docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${COOLIFY_URL}/${PROJECT_NAME}:${IMAGE_TAG}

# Push to registry (if Coolify has one configured)
# docker push ${COOLIFY_URL}/${PROJECT_NAME}:${IMAGE_TAG}

success_msg "Build complete!"
echo ""
echo "📝 Next steps in Coolify:"
echo "1. Login to Coolify at ${COOLIFY_URL}"
echo "2. Create new application"
echo "3. Choose 'Docker Image' as source"
echo "4. Use image: ${IMAGE_NAME}:${IMAGE_TAG}"
echo "5. Configure domain/subdomain"
echo "6. Deploy!"
echo ""
info_msg "Script completed successfully"
