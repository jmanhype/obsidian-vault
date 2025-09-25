#!/usr/bin/env python3
"""
Containerized Obsidian Vault Health Check
Optimized for running in Docker containers via Apollo MCP + Dagger
"""

import os
import re
import json
import sys
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Set
import argparse

class ContainerizedVaultHealthCheck:
    def __init__(self, vault_path: str = "/vault"):
        self.vault_path = Path(vault_path)
        self.results = {
            "timestamp": datetime.now().isoformat(),
            "container_mode": True,
            "vault_path": str(vault_path),
            "summary": {},
            "broken_links": [],
            "orphaned_files": [],
            "tag_analysis": {},
            "metadata_issues": [],
            "image_issues": []
        }
        
    def log_info(self, message: str):
        """Log info message to stderr so stdout stays clean for JSON"""
        print(f"[INFO] {message}", file=sys.stderr)
        
    def scan_markdown_files(self) -> List[Path]:
        """Find all markdown files in vault"""
        self.log_info("Scanning for markdown files...")
        
        md_files = []
        if not self.vault_path.exists():
            self.log_info(f"Warning: Vault path {self.vault_path} does not exist")
            return md_files
            
        for md_file in self.vault_path.rglob("*.md"):
            if not md_file.name.startswith('.'):
                md_files.append(md_file)
                
        self.log_info(f"Found {len(md_files)} markdown files")
        return md_files
    
    def check_links(self, md_files: List[Path]):
        """Check for broken internal links"""
        self.log_info("Checking internal links...")
        
        # Build file map for reference
        file_map = {}
        for md_file in md_files:
            rel_path = md_file.relative_to(self.vault_path)
            file_stem = md_file.stem
            file_map[file_stem] = str(rel_path.with_suffix(''))
            file_map[str(rel_path.with_suffix(''))] = str(rel_path.with_suffix(''))
        
        broken_links = []
        total_links = 0
        
        for md_file in md_files:
            try:
                content = md_file.read_text(encoding='utf-8')
                rel_path = md_file.relative_to(self.vault_path)
                
                # Find wiki links [[link]]
                wiki_links = re.findall(r'\[\[([^\]]+)\]\]', content)
                for link in wiki_links:
                    total_links += 1
                    # Remove alias part if present
                    link_target = link.split('|')[0].strip()
                    
                    if link_target not in file_map:
                        broken_links.append({
                            "file": str(rel_path),
                            "broken_link": link_target,
                            "type": "wiki_link",
                            "line": None  # Could implement line detection
                        })
                
                # Find markdown links [text](link.md)
                md_links = re.findall(r'\[([^\]]+)\]\(([^)]+\.md)\)', content)
                for text, link in md_links:
                    total_links += 1
                    link_target = link.replace('.md', '')
                    
                    if link_target not in file_map:
                        broken_links.append({
                            "file": str(rel_path),
                            "broken_link": link_target,
                            "type": "markdown_link",
                            "line": None
                        })
                        
            except Exception as e:
                self.log_info(f"Error reading {md_file}: {e}")
        
        self.results["broken_links"] = broken_links
        self.results["summary"]["total_links"] = total_links
        self.results["summary"]["broken_links_count"] = len(broken_links)
        
        self.log_info(f"Found {len(broken_links)} broken links out of {total_links} total")
    
    def check_orphaned_files(self, md_files: List[Path]):
        """Find files with no incoming links"""
        self.log_info("Checking for orphaned files...")
        
        # Build reference map
        linked_files = set()
        
        for md_file in md_files:
            try:
                content = md_file.read_text(encoding='utf-8')
                
                # Find all linked files
                wiki_links = re.findall(r'\[\[([^\]]+)\]\]', content)
                for link in wiki_links:
                    link_target = link.split('|')[0].strip()
                    linked_files.add(link_target)
                
                md_links = re.findall(r'\[([^\]]+)\]\(([^)]+\.md)\)', content)
                for text, link in md_links:
                    link_target = link.replace('.md', '')
                    linked_files.add(link_target)
                    
            except Exception as e:
                self.log_info(f"Error checking links in {md_file}: {e}")
        
        # Find orphaned files
        orphaned = []
        for md_file in md_files:
            rel_path = md_file.relative_to(self.vault_path)
            file_stem = md_file.stem
            
            if (file_stem not in linked_files and 
                str(rel_path.with_suffix('')) not in linked_files):
                orphaned.append({
                    "file": str(rel_path),
                    "size_kb": round(md_file.stat().st_size / 1024, 2)
                })
        
        self.results["orphaned_files"] = orphaned
        self.results["summary"]["orphaned_files_count"] = len(orphaned)
        
        self.log_info(f"Found {len(orphaned)} orphaned files")
    
    def analyze_tags(self, md_files: List[Path]):
        """Analyze tag usage patterns"""
        self.log_info("Analyzing tags...")
        
        all_tags = []
        tag_counts = {}
        
        for md_file in md_files:
            try:
                content = md_file.read_text(encoding='utf-8')
                
                # Find hashtags in content
                hashtags = re.findall(r'#(\w+)', content)
                all_tags.extend(hashtags)
                
                # Find tags in frontmatter
                frontmatter_match = re.match(r'^---\n(.*?)\n---', content, re.DOTALL)
                if frontmatter_match:
                    fm_content = frontmatter_match.group(1)
                    fm_tags = re.findall(r'tags:\s*\[(.*?)\]', fm_content, re.DOTALL)
                    for tag_list in fm_tags:
                        tags = [tag.strip().strip('"\'') for tag in tag_list.split(',')]
                        all_tags.extend([tag for tag in tags if tag])
                        
            except Exception as e:
                self.log_info(f"Error analyzing tags in {md_file}: {e}")
        
        # Count tag usage
        for tag in all_tags:
            tag_counts[tag] = tag_counts.get(tag, 0) + 1
        
        self.results["tag_analysis"] = {
            "total_tags": len(all_tags),
            "total_unique_tags": len(tag_counts),
            "most_common": sorted(tag_counts.items(), key=lambda x: x[1], reverse=True)[:10]
        }
        
        self.log_info(f"Found {len(tag_counts)} unique tags")
    
    def check_metadata(self, md_files: List[Path]):
        """Check metadata and frontmatter"""
        self.log_info("Checking metadata...")
        
        metadata_issues = []
        
        for md_file in md_files:
            try:
                content = md_file.read_text(encoding='utf-8')
                rel_path = md_file.relative_to(self.vault_path)
                
                # Check for frontmatter
                if not content.startswith('---'):
                    metadata_issues.append({
                        "file": str(rel_path),
                        "issue": "missing_frontmatter",
                        "severity": "medium"
                    })
                
            except Exception as e:
                self.log_info(f"Error checking metadata in {md_file}: {e}")
        
        self.results["metadata_issues"] = metadata_issues
        self.log_info(f"Found {len(metadata_issues)} metadata issues")
    
    def calculate_summary(self, md_files: List[Path]):
        """Calculate summary statistics"""
        total_size = sum(f.stat().st_size for f in md_files)
        
        self.results["summary"].update({
            "total_files": len(md_files),
            "total_size_mb": round(total_size / (1024 * 1024), 2),
            "scan_date": datetime.now().isoformat(),
            "vault_path": str(self.vault_path)
        })
    
    def run_health_check(self) -> Dict:
        """Run complete health check"""
        self.log_info("Starting containerized vault health check...")
        
        # Scan files
        md_files = self.scan_markdown_files()
        if not md_files:
            self.log_info("No markdown files found - vault may be empty or path incorrect")
            return self.results
        
        # Run checks
        self.check_links(md_files)
        self.check_orphaned_files(md_files)
        self.analyze_tags(md_files)
        self.check_metadata(md_files)
        self.calculate_summary(md_files)
        
        self.log_info("Health check complete")
        return self.results
    
    def save_results(self, output_path: str = "/tmp/health-results.json"):
        """Save results to file"""
        output_file = Path(output_path)
        output_file.parent.mkdir(parents=True, exist_ok=True)
        
        with open(output_file, 'w') as f:
            json.dump(self.results, f, indent=2)
        
        self.log_info(f"Results saved to {output_file}")

def main():
    parser = argparse.ArgumentParser(description="Containerized Vault Health Check")
    parser.add_argument("--vault", default="/vault", help="Vault path in container")
    parser.add_argument("--output", default="/tmp/health-results.json", help="Output file path")
    parser.add_argument("--json-only", action="store_true", help="Output only JSON to stdout")
    
    args = parser.parse_args()
    
    # Run health check
    checker = ContainerizedVaultHealthCheck(args.vault)
    results = checker.run_health_check()
    
    # Save results
    checker.save_results(args.output)
    
    # Output results
    if args.json_only:
        print(json.dumps(results, indent=2))
    else:
        print(json.dumps(results, indent=2))

if __name__ == "__main__":
    main()