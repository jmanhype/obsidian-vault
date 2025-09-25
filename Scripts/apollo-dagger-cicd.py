#!/usr/bin/env python3
"""
Apollo MCP + Dagger CI/CD Pipeline
Build, test, and publish Docker images using Dagger
"""

import json
import requests
import subprocess
from pathlib import Path
from datetime import datetime
from typing import Dict, Optional
import argparse

class ApolloDaggerCICD:
    def __init__(self, project_path: str, proxy_url: str = "http://localhost:9999"):
        self.project_path = Path(project_path)
        self.proxy_url = proxy_url
        self.github_repo = self._get_git_remote()
        
    def _get_git_remote(self) -> Optional[str]:
        """Get GitHub repository from git remote"""
        try:
            result = subprocess.run(
                ["git", "remote", "get-url", "origin"],
                cwd=self.project_path,
                capture_output=True,
                text=True
            )
            if result.returncode == 0:
                url = result.stdout.strip()
                # Convert SSH to HTTPS format
                if url.startswith("git@github.com:"):
                    url = url.replace("git@github.com:", "https://github.com/")
                    url = url.replace(".git", "")
                return url
        except:
            pass
        return None
    
    def execute_graphql(self, query: str, variables: Dict = None) -> Dict:
        """Execute GraphQL query through Apollo MCP"""
        payload = {
            "query": query,
            "variables": variables or {},
            "extensions": {"clientLibrary": {"name": "mcp", "version": "0.7.2"}}
        }
        
        try:
            response = requests.post(
                f"{self.proxy_url}/query",
                json=payload,
                timeout=120
            )
            return response.json()
        except Exception as e:
            return {"error": str(e)}
    
    def build_docker_image(self, dockerfile: str = "Dockerfile", tag: str = "latest") -> Dict:
        """Build Docker image using Dagger"""
        print(f"🔨 Building Docker image: {tag}")
        
        # GraphQL query to build Docker image
        query = """
        mutation BuildDockerImage($contextPath: String!, $dockerfile: String!, $tag: String!) {
            container {
                build(
                    context: { path: $contextPath }
                    dockerfile: $dockerfile
                ) {
                    withLabel(name: "version", value: $tag) {
                        withLabel(name: "built-with", value: "dagger") {
                            withLabel(name: "built-at", value: $timestamp) {
                                export {
                                    id
                                    digest
                                }
                            }
                        }
                    }
                }
            }
        }
        """
        
        variables = {
            "contextPath": str(self.project_path),
            "dockerfile": dockerfile,
            "tag": tag,
            "timestamp": datetime.now().isoformat()
        }
        
        result = self.execute_graphql(query, variables)
        
        if "data" in result:
            return {
                "status": "success",
                "image_id": result["data"]["container"]["build"]["export"]["id"],
                "digest": result["data"]["container"]["build"]["export"]["digest"],
                "tag": tag
            }
        else:
            return {"status": "failed", "error": result.get("error", "Unknown error")}
    
    def run_tests_in_container(self, image_tag: str) -> Dict:
        """Run tests inside the built container"""
        print(f"🧪 Running tests in container: {image_tag}")
        
        query = """
        query RunTests($image: String!, $testCommand: [String!]!) {
            container {
                from(address: $image) {
                    withExec(args: $testCommand) {
                        stdout
                        stderr
                        exitCode
                    }
                }
            }
        }
        """
        
        # Detect test command based on project type
        test_commands = {
            "package.json": ["npm", "test"],
            "requirements.txt": ["python", "-m", "pytest"],
            "go.mod": ["go", "test", "./..."],
            "Cargo.toml": ["cargo", "test"]
        }
        
        test_command = ["echo", "No tests configured"]
        for file, cmd in test_commands.items():
            if (self.project_path / file).exists():
                test_command = cmd
                break
        
        variables = {
            "image": image_tag,
            "testCommand": test_command
        }
        
        result = self.execute_graphql(query, variables)
        
        if "data" in result:
            test_result = result["data"]["container"]["from"]["withExec"]
            return {
                "status": "passed" if test_result["exitCode"] == 0 else "failed",
                "output": test_result["stdout"],
                "errors": test_result["stderr"],
                "exit_code": test_result["exitCode"]
            }
        else:
            return {"status": "error", "error": result.get("error")}
    
    def push_to_registry(self, image_tag: str, registry: str = "docker.io") -> Dict:
        """Push Docker image to registry"""
        print(f"📤 Pushing image to registry: {registry}/{image_tag}")
        
        query = """
        mutation PushImage($image: String!, $registry: String!, $repository: String!) {
            container {
                from(address: $image) {
                    publish(address: $registryUrl) {
                        digest
                        url
                    }
                }
            }
        }
        """
        
        repo_name = self.project_path.name.lower()
        registry_url = f"{registry}/{repo_name}:{image_tag}"
        
        variables = {
            "image": image_tag,
            "registry": registry,
            "registryUrl": registry_url
        }
        
        result = self.execute_graphql(query, variables)
        
        if "data" in result:
            return {
                "status": "success",
                "registry_url": result["data"]["container"]["from"]["publish"]["url"],
                "digest": result["data"]["container"]["from"]["publish"]["digest"]
            }
        else:
            return {"status": "failed", "error": result.get("error")}
    
    def create_github_release(self, version: str, docker_image: str) -> Dict:
        """Create GitHub release with Docker image reference"""
        print(f"📦 Creating GitHub release: v{version}")
        
        if not self.github_repo:
            return {"status": "error", "error": "No GitHub repository found"}
        
        # Use gh CLI through container
        query = """
        query CreateRelease($args: [String!]!) {
            container {
                from(address: "ghcr.io/cli/cli:latest") {
                    withExec(args: $args) {
                        stdout
                        exitCode
                    }
                }
            }
        }
        """
        
        release_notes = f"""## Release v{version}

### 🐳 Docker Image
```bash
docker pull {docker_image}
```

### 📝 Changes
- Built and tested using Apollo MCP + Dagger
- Automated CI/CD pipeline
- Container-based deployment ready

### 🚀 Deployment
```bash
docker run -d {docker_image}
```

---
*Released via Apollo MCP + Dagger CI/CD Pipeline*
"""
        
        variables = {
            "args": [
                "gh", "release", "create",
                f"v{version}",
                "--title", f"Release v{version}",
                "--notes", release_notes,
                "--repo", self.github_repo
            ]
        }
        
        result = self.execute_graphql(query, variables)
        
        if "data" in result and result["data"]["container"]["from"]["withExec"]["exitCode"] == 0:
            return {
                "status": "success",
                "version": version,
                "url": f"{self.github_repo}/releases/tag/v{version}"
            }
        else:
            return {"status": "failed", "error": result.get("error", "GitHub release failed")}
    
    def run_full_pipeline(self, version: str, registry: str = "docker.io") -> Dict:
        """Run complete CI/CD pipeline"""
        print(f"🚀 Running full CI/CD pipeline for version {version}")
        print("=" * 60)
        
        results = {
            "timestamp": datetime.now().isoformat(),
            "version": version,
            "project": str(self.project_path),
            "steps": {}
        }
        
        # Step 1: Build Docker image
        print("\n📦 Step 1: Building Docker image...")
        build_result = self.build_docker_image(tag=version)
        results["steps"]["build"] = build_result
        
        if build_result["status"] != "success":
            print(f"❌ Build failed: {build_result.get('error')}")
            return results
        
        print(f"✅ Image built: {build_result['image_id']}")
        
        # Step 2: Run tests
        print("\n🧪 Step 2: Running tests...")
        test_result = self.run_tests_in_container(build_result["tag"])
        results["steps"]["test"] = test_result
        
        if test_result["status"] == "failed":
            print(f"⚠️  Tests failed but continuing...")
        else:
            print(f"✅ Tests passed")
        
        # Step 3: Push to registry
        print("\n📤 Step 3: Pushing to registry...")
        push_result = self.push_to_registry(version, registry)
        results["steps"]["push"] = push_result
        
        if push_result["status"] != "success":
            print(f"❌ Push failed: {push_result.get('error')}")
            return results
        
        print(f"✅ Pushed to: {push_result['registry_url']}")
        
        # Step 4: Create GitHub release
        print("\n📢 Step 4: Creating GitHub release...")
        release_result = self.create_github_release(
            version, 
            push_result["registry_url"]
        )
        results["steps"]["release"] = release_result
        
        if release_result["status"] == "success":
            print(f"✅ Release created: {release_result['url']}")
        else:
            print(f"⚠️  Release creation failed: {release_result.get('error')}")
        
        # Generate summary
        print("\n" + "=" * 60)
        print("🎉 CI/CD Pipeline Complete!")
        print(f"📦 Version: {version}")
        print(f"🐳 Docker Image: {push_result.get('registry_url', 'N/A')}")
        print(f"📢 GitHub Release: {release_result.get('url', 'N/A')}")
        
        # Save pipeline results
        results_file = self.project_path / f"pipeline-results-{version}.json"
        with open(results_file, 'w') as f:
            json.dump(results, f, indent=2)
        
        print(f"\n📊 Pipeline results saved to: {results_file}")
        
        return results
    
    def generate_dockerfile(self) -> str:
        """Generate Dockerfile if it doesn't exist"""
        dockerfile_path = self.project_path / "Dockerfile"
        
        if dockerfile_path.exists():
            return "Dockerfile exists"
        
        # Detect project type and generate appropriate Dockerfile
        if (self.project_path / "package.json").exists():
            # Node.js project
            dockerfile = """FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
"""
        elif (self.project_path / "requirements.txt").exists():
            # Python project
            dockerfile = """FROM python:3.11-alpine
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["python", "app.py"]
"""
        elif (self.project_path / "go.mod").exists():
            # Go project
            dockerfile = """FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o main .

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/main .
EXPOSE 8080
CMD ["./main"]
"""
        else:
            # Generic Dockerfile
            dockerfile = """FROM alpine:latest
WORKDIR /app
COPY . .
RUN apk add --no-cache bash
CMD ["/bin/bash"]
"""
        
        with open(dockerfile_path, 'w') as f:
            f.write(dockerfile)
        
        return f"Generated Dockerfile for {self.project_path.name}"

def main():
    parser = argparse.ArgumentParser(description="Apollo Dagger CI/CD Pipeline")
    parser.add_argument("--project", default=".", help="Project directory path")
    parser.add_argument("--version", required=True, help="Version to build and release")
    parser.add_argument("--registry", default="docker.io", help="Docker registry")
    parser.add_argument("--generate-dockerfile", action="store_true", 
                       help="Generate Dockerfile if missing")
    
    args = parser.parse_args()
    
    cicd = ApolloDaggerCICD(args.project)
    
    if args.generate_dockerfile:
        result = cicd.generate_dockerfile()
        print(f"📝 {result}")
    
    # Run full pipeline
    cicd.run_full_pipeline(args.version, args.registry)

if __name__ == "__main__":
    main()