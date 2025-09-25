#!/bin/bash
# Build all vault outputs using Docker (can be containerized with Dagger)

echo "🚀 Building Obsidian Vault Outputs..."

# Create output directory
mkdir -p vault-outputs/{website,pdf,epub,portal}

# 1. Build Static Website
echo "📄 Building static website..."
docker run --rm -v "$(pwd):/docs" squidfunk/mkdocs-material:latest build -d /docs/vault-outputs/website

# 2. Generate PDF Book
echo "📚 Generating PDF book..."
docker run --rm -v "$(pwd):/workspace" pandoc/core:latest \
  bash -c "find /workspace/Databases -name '*.md' -type f -exec cat {} \; > /workspace/vault-outputs/pdf/vault-complete.md && \
  pandoc /workspace/vault-outputs/pdf/vault-complete.md -o /workspace/vault-outputs/pdf/vault-book.pdf --toc"

# 3. Create EPUB
echo "📖 Creating EPUB..."
docker run --rm -v "$(pwd):/workspace" pandoc/core:latest \
  pandoc /workspace/index.md /workspace/Databases/**/*.md \
  -o /workspace/vault-outputs/epub/vault-book.epub \
  --metadata title="Obsidian Knowledge Vault" \
  --metadata author="Speed" \
  --toc --toc-depth=2

# 4. Build Searchable Portal (using MkDocs with search plugin)
echo "🔍 Building searchable documentation portal..."
docker run --rm -v "$(pwd):/docs" squidfunk/mkdocs-material:latest build -d /docs/vault-outputs/portal

# 5. Package as Docker Image
echo "📦 Building Docker image..."
docker build -f Dockerfile.vault-publisher -t vault-publisher:latest .

echo "✅ All outputs built successfully!"
echo "📁 Check vault-outputs/ directory for results"
echo "🐳 Docker image: vault-publisher:latest"