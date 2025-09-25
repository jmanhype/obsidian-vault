import { gql } from '@apollo/client';
import { Container, Directory } from '@dagger.io/dagger';

/**
 * Apollo Dagger MCP Operations for Vault Publishing
 * These operations build and deploy Obsidian vault documentation
 */

// Operation: Build MkDocs static site from vault
export const VaultMkDocsBuild = gql`
  query VaultMkDocsBuild($sourceDir: DirectoryID!) {
    container {
      from(address: "squidfunk/mkdocs-material:latest") {
        withDirectory(path: "/docs", directory: $sourceDir) {
          withWorkdir(path: "/docs") {
            withExec(args: ["mkdocs", "build", "-d", "/site"]) {
              directory(path: "/site") {
                id
                export(path: "./build/website")
              }
            }
          }
        }
      }
    }
  }
`;

// Operation: Generate PDF from all vault notes
export const VaultPDFGenerate = gql`
  query VaultPDFGenerate($sourceDir: DirectoryID!) {
    container {
      from(address: "pandoc/latex:latest") {
        withDirectory(path: "/vault", directory: $sourceDir) {
          withWorkdir(path: "/vault") {
            withExec(args: [
              "sh", "-c",
              "find . -name '*.md' -type f | xargs pandoc --toc --pdf-engine=xelatex -o /output/vault-complete.pdf"
            ]) {
              file(path: "/output/vault-complete.pdf") {
                id
                export(path: "./build/vault.pdf")
              }
            }
          }
        }
      }
    }
  }
`;

// Operation: Generate EPUB for e-readers
export const VaultEPUBGenerate = gql`
  query VaultEPUBGenerate($sourceDir: DirectoryID!) {
    container {
      from(address: "pandoc/latex:latest") {
        withDirectory(path: "/vault", directory: $sourceDir) {
          withWorkdir(path: "/vault") {
            withExec(args: [
              "sh", "-c", 
              "find . -name '*.md' -type f | xargs pandoc --toc -o /output/vault.epub"
            ]) {
              file(path: "/output/vault.epub") {
                id
                export(path: "./build/vault.epub")
              }
            }
          }
        }
      }
    }
  }
`;

// Operation: Build complete vault publisher container
export const VaultPublisherBuild = gql`
  query VaultPublisherBuild($sourceDir: DirectoryID!) {
    container {
      from(address: "nginx:alpine") {
        # Copy MkDocs build
        withDirectory(path: "/usr/share/nginx/html", directory: $sourceDir) {
          # Add nginx config for serving
          withExec(args: [
            "sh", "-c",
            "echo 'server { listen 8000; location / { root /usr/share/nginx/html; index index.html; try_files \\$uri \\$uri/ /index.html; }}' > /etc/nginx/conf.d/default.conf"
          ]) {
            # Set up health check
            withEnvVariable(name: "PORT", value: "8000") {
              withLabel(key: "coolify.managed", value: "true") {
                withLabel(key: "app.name", value: "vault-docs") {
                  id
                  publish(address: "vault-publisher:latest")
                }
              }
            }
          }
        }
      }
    }
  }
`;

// Operation: Deploy to Coolify
export const VaultCoolifyDeploy = gql`
  query VaultCoolifyDeploy($sourceDir: DirectoryID!, $coolifyUrl: String!) {
    # Build the complete container
    publisher: container {
      from(address: "squidfunk/mkdocs-material:latest") {
        withDirectory(path: "/docs", directory: $sourceDir) {
          withExec(args: ["mkdocs", "build"]) {
            # Package as nginx container
            from(address: "nginx:alpine") {
              withDirectory(path: "/usr/share/nginx/html", directory: "./site") {
                withExec(args: ["nginx", "-g", "daemon off;"]) {
                  id
                  # Export as tarball for Coolify
                  export(path: "./vault-docs.tar")
                }
              }
            }
          }
        }
      }
    }
    
    # Create deployment manifest
    manifest: container {
      from(address: "alpine:latest") {
        withExec(args: [
          "sh", "-c",
          "cat > /deploy.json << 'EOF'\n{\n  \"name\": \"vault-docs\",\n  \"image\": \"vault-publisher:latest\",\n  \"ports\": [8000],\n  \"domains\": [\"vault.local\"],\n  \"healthCheck\": \"/\"\n}\nEOF"
        ]) {
          file(path: "/deploy.json") {
            contents
          }
        }
      }
    }
  }
`;

// Operation: Build and push to registry
export const VaultRegistryPush = gql`
  mutation VaultRegistryPush($sourceDir: DirectoryID!, $registry: String!, $tag: String!) {
    container {
      from(address: "squidfunk/mkdocs-material:latest") {
        withDirectory(path: "/docs", directory: $sourceDir) {
          withExec(args: ["mkdocs", "build", "-d", "/site"]) {
            # Create final container
            from(address: "nginx:alpine") {
              withDirectory(path: "/usr/share/nginx/html", source: "/site") {
                withEntrypoint(args: ["nginx", "-g", "daemon off;"]) {
                  publish(address: $registry + "/vault-docs:" + $tag) {
                    digest
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;