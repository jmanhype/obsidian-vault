#!/usr/bin/env python3
"""
Dagger Multi-Project Build & Release Orchestrator
Build, test, and publish multiple projects as Docker images
"""

import json
import requests
import subprocess
import asyncio
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional
import yaml

class DaggerMultiBuild:
    def __init__(self, config_file: str = None, proxy_url: str = "http://localhost:9999"):
        self.proxy_url = proxy_url
        self.config = self._load_config(config_file) if config_file else self._auto_discover()
        
    def _load_config(self, config_file: str) -> Dict:
        """Load build configuration from YAML file"""
        with open(config_file, 'r') as f:
            return yaml.safe_load(f)
    
    def _auto_discover(self) -> Dict:
        """Auto-discover projects in common locations"""
        projects = []
        search_paths = [
            Path.home() / "Documents",
            Path.home() / "Projects", 
            Path.home() / "Code",
            Path.home() / "GitHub"
        ]
        
        for search_path in search_paths:
            if not search_path.exists():
                continue
                
            # Look for projects with Dockerfile or common project files
            for project_path in search_path.iterdir():
                if project_path.is_dir() and not project_path.name.startswith('.'):
                    if any((project_path / f).exists() for f in [
                        "Dockerfile", "package.json", "requirements.txt", 
                        "go.mod", "Cargo.toml", "pom.xml"
                    ]):
                        projects.append({
                            "name": project_path.name,
                            "path": str(project_path),
                            "auto_discovered": True
                        })
        
        return {"projects": projects}
    
    def execute_graphql(self, query: str, variables: Dict = None) -> Dict:
        """Execute GraphQL query through Apollo MCP"""
        payload = {
            "query": query,
            "variables": variables or {},
            "extensions": {"clientLibrary": {"name": "mcp", "version": "0.7.2"}}
        }
        
        try:
            response = requests.post(f"{self.proxy_url}/query", json=payload, timeout=120)
            return response.json()
        except Exception as e:
            return {"error": str(e)}
    
    def build_project(self, project: Dict) -> Dict:
        """Build a single project"""
        project_path = Path(project["path"])
        project_name = project["name"]
        
        print(f"\n🔨 Building {project_name}...")
        
        # Create build query for Dagger
        query = """
        query BuildProject($projectPath: String!, $projectName: String!) {
            host {
                directory(path: $projectPath) {
                    dockerBuild {
                        container {
                            withLabel(name: "project", value: $projectName) {
                                withLabel(name: "built-at", value: $timestamp) {
                                    id
                                    platform
                                }
                            }
                        }
                    }
                }
            }
        }
        """
        
        variables = {
            "projectPath": str(project_path),
            "projectName": project_name,
            "timestamp": datetime.now().isoformat()
        }
        
        result = self.execute_graphql(query, variables)
        
        if "data" in result:
            container_info = result["data"]["host"]["directory"]["dockerBuild"]["container"]
            return {
                "project": project_name,
                "status": "success",
                "container_id": container_info["id"],
                "platform": container_info["platform"],
                "build_time": datetime.now().isoformat()
            }
        else:
            return {
                "project": project_name,
                "status": "failed",
                "error": result.get("error", "Build failed")
            }
    
    def test_project(self, project: Dict, container_id: str) -> Dict:
        """Run tests for a project in container"""
        print(f"🧪 Testing {project['name']}...")
        
        query = """
        query RunProjectTests($containerId: String!, $testCmd: [String!]!) {
            container(id: $containerId) {
                withExec(args: $testCmd) {
                    stdout
                    stderr
                    exitCode
                }
            }
        }
        """
        
        # Determine test command
        test_cmd = project.get("test_command", ["echo", "No tests configured"])
        
        variables = {
            "containerId": container_id,
            "testCmd": test_cmd
        }
        
        result = self.execute_graphql(query, variables)
        
        if "data" in result:
            test_result = result["data"]["container"]["withExec"]
            return {
                "project": project["name"],
                "status": "passed" if test_result["exitCode"] == 0 else "failed",
                "exit_code": test_result["exitCode"],
                "output": test_result["stdout"][:500]  # Limit output
            }
        else:
            return {
                "project": project["name"],
                "status": "error",
                "error": result.get("error")
            }
    
    def publish_image(self, project: Dict, container_id: str, tag: str) -> Dict:
        """Publish container image to registry"""
        print(f"📤 Publishing {project['name']}:{tag}...")
        
        registry = project.get("registry", "docker.io")
        repository = project.get("repository", project["name"].lower())
        
        query = """
        mutation PublishImage($containerId: String!, $address: String!) {
            container(id: $containerId) {
                publish(address: $address) {
                    digest
                    mediaType
                    size
                }
            }
        }
        """
        
        address = f"{registry}/{repository}:{tag}"
        
        variables = {
            "containerId": container_id,
            "address": address
        }
        
        result = self.execute_graphql(query, variables)
        
        if "data" in result:
            publish_info = result["data"]["container"]["publish"]
            return {
                "project": project["name"],
                "status": "published",
                "image": address,
                "digest": publish_info["digest"],
                "size_mb": round(publish_info["size"] / (1024 * 1024), 2)
            }
        else:
            return {
                "project": project["name"],
                "status": "failed",
                "error": result.get("error")
            }
    
    def create_release_manifest(self, build_results: List[Dict]) -> str:
        """Create a release manifest for all built projects"""
        manifest = {
            "version": datetime.now().strftime("%Y.%m.%d"),
            "timestamp": datetime.now().isoformat(),
            "projects": []
        }
        
        for result in build_results:
            if result.get("publish_result", {}).get("status") == "published":
                manifest["projects"].append({
                    "name": result["project"],
                    "image": result["publish_result"]["image"],
                    "digest": result["publish_result"]["digest"],
                    "size_mb": result["publish_result"]["size_mb"],
                    "test_status": result.get("test_result", {}).get("status", "not_tested")
                })
        
        return manifest
    
    def orchestrate_builds(self, version_tag: str = None) -> Dict:
        """Orchestrate building all projects"""
        if not version_tag:
            version_tag = datetime.now().strftime("%Y%m%d-%H%M%S")
        
        print(f"🚀 Apollo Dagger Multi-Project Build Orchestrator")
        print(f"📅 Version: {version_tag}")
        print("=" * 60)
        
        all_results = []
        successful_builds = []
        failed_builds = []
        
        for project in self.config["projects"]:
            print(f"\n{'='*40}")
            print(f"📦 Processing: {project['name']}")
            print(f"📁 Path: {project['path']}")
            
            result = {"project": project["name"]}
            
            # Build
            build_result = self.build_project(project)
            result["build_result"] = build_result
            
            if build_result["status"] != "success":
                failed_builds.append(project["name"])
                all_results.append(result)
                continue
            
            container_id = build_result["container_id"]
            successful_builds.append(project["name"])
            
            # Test (optional)
            if project.get("run_tests", True):
                test_result = self.test_project(project, container_id)
                result["test_result"] = test_result
            
            # Publish
            if project.get("publish", True):
                publish_result = self.publish_image(project, container_id, version_tag)
                result["publish_result"] = publish_result
            
            all_results.append(result)
        
        # Generate summary
        print(f"\n{'='*60}")
        print(f"🎉 Build Orchestration Complete!")
        print(f"\n📊 Summary:")
        print(f"  ✅ Successful: {len(successful_builds)} projects")
        print(f"  ❌ Failed: {len(failed_builds)} projects")
        
        if successful_builds:
            print(f"\n✅ Successfully built:")
            for name in successful_builds:
                print(f"  • {name}")
        
        if failed_builds:
            print(f"\n❌ Failed builds:")
            for name in failed_builds:
                print(f"  • {name}")
        
        # Create release manifest
        manifest = self.create_release_manifest(all_results)
        
        # Save results
        results_file = Path.home() / f"dagger-build-{version_tag}.json"
        with open(results_file, 'w') as f:
            json.dump({
                "summary": {
                    "version": version_tag,
                    "timestamp": datetime.now().isoformat(),
                    "total_projects": len(self.config["projects"]),
                    "successful": len(successful_builds),
                    "failed": len(failed_builds)
                },
                "manifest": manifest,
                "detailed_results": all_results
            }, f, indent=2)
        
        print(f"\n📄 Build results saved to: {results_file}")
        
        # Generate Docker Compose file for all successful builds
        if successful_builds:
            self.generate_compose_file(manifest, version_tag)
        
        return {
            "version": version_tag,
            "successful": successful_builds,
            "failed": failed_builds,
            "manifest": manifest
        }
    
    def generate_compose_file(self, manifest: Dict, version: str):
        """Generate docker-compose.yml for all built images"""
        compose = {
            "version": "3.8",
            "services": {}
        }
        
        for project in manifest["projects"]:
            service_name = project["name"].lower().replace("-", "_")
            compose["services"][service_name] = {
                "image": project["image"],
                "restart": "unless-stopped",
                "environment": [
                    f"VERSION={version}",
                    f"BUILD_DIGEST={project['digest']}"
                ]
            }
        
        compose_file = Path.home() / f"docker-compose-{version}.yml"
        with open(compose_file, 'w') as f:
            yaml.dump(compose, f, default_flow_style=False)
        
        print(f"📝 Docker Compose file generated: {compose_file}")

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description="Dagger Multi-Project Build Orchestrator")
    parser.add_argument("--config", help="Build configuration file (YAML)")
    parser.add_argument("--version", help="Version tag for images")
    parser.add_argument("--auto-discover", action="store_true", 
                       help="Auto-discover projects")
    
    args = parser.parse_args()
    
    if args.auto_discover:
        print("🔍 Auto-discovering projects...")
        builder = DaggerMultiBuild()
        print(f"📦 Found {len(builder.config['projects'])} projects")
        for project in builder.config["projects"]:
            print(f"  • {project['name']} ({project['path']})")
    else:
        builder = DaggerMultiBuild(config_file=args.config)
    
    # Run orchestration
    builder.orchestrate_builds(version_tag=args.version)

if __name__ == "__main__":
    main()