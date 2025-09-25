"""
Apollo Dagger MCP Operations for Coolify Deployment
Extends the existing Apollo MCP with Coolify-specific operations
"""

import json
from typing import Dict, Any, Optional

class CoolifyDeploymentOperations:
    """Operations for deploying to Coolify via Apollo Dagger MCP"""
    
    @staticmethod
    def build_and_deploy_vault_docs(
        source_dir: str,
        coolify_url: str = "http://192.168.1.190:8000",
        project_name: str = "vault-docs"
    ) -> Dict[str, Any]:
        """
        Build vault documentation and prepare for Coolify deployment
        
        This operation:
        1. Builds MkDocs static site
        2. Generates PDF and EPUB
        3. Creates Docker image
        4. Prepares Coolify deployment config
        """
        
        operations = {
            "query": """
            query BuildVaultForCoolify($sourceDir: DirectoryID!) {
                # Build MkDocs website
                websiteBuilder: containerFrom(address: "squidfunk/mkdocs-material:latest") {
                    withDirectory(path: "/docs", directory: $sourceDir) {
                        withWorkdir(path: "/docs") {
                            withExec(args: ["mkdocs", "build", "-d", "/output/website"]) {
                                website: directory(path: "/output/website") {
                                    id
                                }
                            }
                        }
                    }
                }
                
                # Build PDF with Pandoc
                pdfBuilder: containerFrom(address: "pandoc/latex:latest") {
                    withDirectory(path: "/source", directory: $sourceDir) {
                        withExec(args: ["sh", "-c", "find /source -name '*.md' -exec pandoc {} -o /output/vault.pdf \\;"]) {
                            pdf: directory(path: "/output") {
                                id
                            }
                        }
                    }
                }
                
                # Package for Coolify
                deployer: containerFrom(address: "alpine:latest") {
                    withExec(args: ["apk", "add", "--no-cache", "curl", "jq"]) {
                        # Create deployment manifest
                        withExec(args: ["sh", "-c", '''
                            cat > /coolify-deploy.json << EOF
                            {
                                "name": "''' + project_name + '''",
                                "type": "static",
                                "buildPack": "dockerfile",
                                "ports": [8000],
                                "domains": ["vault.local"],
                                "healthCheck": {
                                    "enabled": true,
                                    "path": "/"
                                }
                            }
                            EOF
                        ''']) {
                            manifest: stdout
                        }
                    }
                }
            }
            """,
            "variables": {
                "sourceDir": source_dir
            }
        }
        
        return operations
    
    @staticmethod
    def setup_coolify_github_integration(
        repo_url: str,
        branch: str = "main"
    ) -> Dict[str, Any]:
        """
        Configure GitHub integration for automatic deployments
        """
        
        return {
            "query": """
            mutation SetupGitHubIntegration($repo: String!, $branch: String!) {
                coolifyApp: createApplication(
                    source: "github",
                    repository: $repo,
                    branch: $branch,
                    buildPack: "dockerfile",
                    dockerfile: "Dockerfile.vault-publisher"
                ) {
                    id
                    webhookUrl
                    deployKey
                }
            }
            """,
            "variables": {
                "repo": repo_url,
                "branch": branch
            }
        }
    
    @staticmethod
    def create_coolify_docker_compose_app() -> str:
        """
        Generate Docker Compose configuration for Coolify
        """
        
        compose_config = {
            "version": "3.8",
            "services": {
                "vault-docs": {
                    "build": {
                        "context": ".",
                        "dockerfile": "Dockerfile.vault-publisher",
                        "args": {
                            "BUILDKIT_INLINE_CACHE": "1"
                        }
                    },
                    "ports": ["8000:8000"],
                    "environment": {
                        "SITE_NAME": "Obsidian Vault Documentation",
                        "ENABLE_SEARCH": "true",
                        "ENABLE_PDF_EXPORT": "true"
                    },
                    "healthcheck": {
                        "test": ["CMD", "curl", "-f", "http://localhost:8000"],
                        "interval": "30s",
                        "timeout": "10s",
                        "retries": 3
                    },
                    "labels": {
                        "coolify.managed": "true",
                        "coolify.autodeploy": "true"
                    }
                }
            }
        }
        
        return json.dumps(compose_config, indent=2)


# Apollo MCP Integration Functions
def deploy_to_coolify_with_apollo():
    """
    Main deployment function using Apollo Dagger MCP
    """
    
    print("🚀 Deploying Vault to Coolify with Apollo Dagger MCP")
    
    # 1. Build all outputs
    ops = CoolifyDeploymentOperations()
    build_ops = ops.build_and_deploy_vault_docs(
        source_dir="/Users/speed/Documents/Obsidian Vault"
    )
    
    # 2. Generate Coolify config
    compose = ops.create_coolify_docker_compose_app()
    
    # 3. Return deployment instructions
    return {
        "build_operations": build_ops,
        "compose_config": compose,
        "deployment_url": "http://192.168.1.190:8000",
        "instructions": [
            "1. Run the Apollo Dagger build operations",
            "2. Push the built image to Coolify",
            "3. Import the Docker Compose config",
            "4. Configure domain settings",
            "5. Deploy!"
        ]
    }


if __name__ == "__main__":
    # Execute deployment
    result = deploy_to_coolify_with_apollo()
    print(json.dumps(result, indent=2))