#!/bin/bash
# Deploy Obsidian Vault Documentation to Coolify
# Uses Apollo Dagger MCP for containerization

set -e

echo "🚀 Deploying Vault Documentation to Coolify"

# Configuration
COOLIFY_URL="http://192.168.1.190:8000"
PROJECT_NAME="vault-docs"
IMAGE_NAME="vault-publisher"
IMAGE_TAG="latest"

# Build with Apollo Dagger MCP (using existing operations)
echo "📦 Building container with Apollo Dagger MCP..."

# Option 1: Use dagger CLI directly
dagger call \
  --source-dir=. \
  container-from --address="squidfunk/mkdocs-material:latest" \
  container-with-directory --path="/docs" --directory="." \
  container-with-exec --args='["mkdocs", "build", "-d", "/output/website"]' \
  container-with-exec --args='["tar", "-czf", "/output/vault-docs.tar.gz", "/output/website"]' \
  export --path="./build"

# Option 2: Use Apollo MCP operations through GraphQL
# This would use the RunestoneBuild operation adapted for MkDocs

echo "🏗️ Building Docker image..."
docker build -f Dockerfile.vault-publisher -t ${IMAGE_NAME}:${IMAGE_TAG} .

# Tag for Coolify's registry (if using local registry)
# docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${COOLIFY_URL}/${PROJECT_NAME}:${IMAGE_TAG}

# Push to registry (if Coolify has one configured)
# docker push ${COOLIFY_URL}/${PROJECT_NAME}:${IMAGE_TAG}

echo "✅ Build complete!"
echo ""
echo "📝 Next steps in Coolify:"
echo "1. Login to Coolify at ${COOLIFY_URL}"
echo "2. Create new application"
echo "3. Choose 'Docker Image' as source"
echo "4. Use image: ${IMAGE_NAME}:${IMAGE_TAG}"
echo "5. Configure domain/subdomain"
echo "6. Deploy!"