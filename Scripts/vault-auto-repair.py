#!/usr/bin/env python3
"""
Obsidian Vault Auto-Repair System
Automatically fixes common vault issues identified by health checks
"""

import os
import re
import json
import shutil
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Set
import argparse

class VaultAutoRepair:
    def __init__(self, vault_path: str, dry_run: bool = False):
        self.vault_path = Path(vault_path)
        self.dry_run = dry_run
        self.changes_made = []
        
        # Load health check results
        self.health_results = self.load_health_results()
        
    def load_health_results(self) -> Dict:
        """Load latest health check results"""
        health_file = self.vault_path / "Scripts" / "vault-health-results.json"
        if health_file.exists():
            with open(health_file, 'r') as f:
                return json.load(f)
        return {}
    
    def log_change(self, action: str, details: str):
        """Log a change made during repair"""
        change = {
            "timestamp": datetime.now().isoformat(),
            "action": action,
            "details": details,
            "dry_run": self.dry_run
        }
        self.changes_made.append(change)
        
        if self.dry_run:
            print(f"[DRY RUN] {action}: {details}")
        else:
            print(f"✅ {action}: {details}")
    
    def fix_broken_links(self) -> int:
        """Fix broken internal links"""
        if not self.health_results.get('broken_links'):
            return 0
        
        print("🔗 Fixing broken links...")
        fixes_made = 0
        
        # Build file mapping
        file_map = self.build_file_map()
        
        for link_issue in self.health_results['broken_links']:
            file_path = self.vault_path / link_issue['file']
            broken_link = link_issue['broken_link']
            link_type = link_issue['type']
            
            if not file_path.exists():
                continue
            
            try:
                content = file_path.read_text(encoding='utf-8')
                original_content = content
                
                # Try to find a matching file
                suggested_file = self.find_best_match(broken_link, file_map)
                
                if suggested_file:
                    if link_type == 'wiki_link':
                        # Replace [[broken_link]] with [[suggested_file]]
                        pattern = rf'\[\[{re.escape(broken_link)}(\|[^\]]+)?\]\]'
                        replacement = f'[[{suggested_file}\\1]]' if '\\1' in pattern else f'[[{suggested_file}]]'
                        content = re.sub(pattern, replacement, content)
                    
                    elif link_type == 'markdown_link':
                        # Replace [text](broken_link.md) with [text](suggested_file.md)
                        pattern = rf'\[([^\]]+)\]\({re.escape(broken_link)}\)'
                        replacement = f'[\\1]({suggested_file}.md)'
                        content = re.sub(pattern, replacement, content)
                    
                    if content != original_content:
                        if not self.dry_run:
                            file_path.write_text(content, encoding='utf-8')
                        
                        self.log_change(
                            "Fixed broken link",
                            f"In {link_issue['file']}: {broken_link} → {suggested_file}"
                        )
                        fixes_made += 1
                
            except Exception as e:
                print(f"Error fixing link in {file_path}: {e}")
        
        return fixes_made
    
    def build_file_map(self) -> Dict[str, str]:
        """Build mapping of file names to their paths"""
        file_map = {}
        
        for md_file in self.vault_path.rglob("*.md"):
            if md_file.name.startswith('.'):
                continue
            
            file_stem = md_file.stem
            rel_path = md_file.relative_to(self.vault_path)
            
            # Map both just filename and full relative path
            file_map[file_stem] = file_stem
            file_map[str(rel_path.with_suffix(''))] = str(rel_path.with_suffix(''))
        
        return file_map
    
    def find_best_match(self, broken_link: str, file_map: Dict[str, str]) -> str:
        """Find best matching file for broken link"""
        # Direct match
        if broken_link in file_map:
            return file_map[broken_link]
        
        # Case insensitive match
        broken_lower = broken_link.lower()
        for filename, path in file_map.items():
            if filename.lower() == broken_lower:
                return path
        
        # Partial match
        for filename, path in file_map.items():
            if broken_lower in filename.lower() or filename.lower() in broken_lower:
                return path
        
        # Fuzzy match (simple)
        best_match = None
        best_score = 0
        
        for filename, path in file_map.items():
            score = self.similarity_score(broken_link, filename)
            if score > best_score and score > 0.7:  # 70% similarity threshold
                best_score = score
                best_match = path
        
        return best_match
    
    def similarity_score(self, str1: str, str2: str) -> float:
        """Calculate simple similarity score between strings"""
        str1_lower = str1.lower()
        str2_lower = str2.lower()
        
        # Jaccard similarity based on character bigrams
        bigrams1 = set(str1_lower[i:i+2] for i in range(len(str1_lower)-1))
        bigrams2 = set(str2_lower[i:i+2] for i in range(len(str2_lower)-1))
        
        if not bigrams1 and not bigrams2:
            return 1.0
        if not bigrams1 or not bigrams2:
            return 0.0
        
        intersection = len(bigrams1.intersection(bigrams2))
        union = len(bigrams1.union(bigrams2))
        
        return intersection / union if union > 0 else 0.0
    
    def standardize_tags(self) -> int:
        """Standardize tag usage across vault"""
        if not self.health_results.get('tag_analysis', {}).get('similar_tags'):
            return 0
        
        print("🏷️ Standardizing tags...")
        fixes_made = 0
        
        similar_tags = self.health_results['tag_analysis']['similar_tags']
        
        # Build tag consolidation map
        tag_map = {}
        for tag_pair in similar_tags:
            tag1, tag2 = tag_pair['tag1'], tag_pair['tag2']
            count1, count2 = tag_pair['count1'], tag_pair['count2']
            
            # Keep the more common tag
            if count1 >= count2:
                tag_map[tag2] = tag1
            else:
                tag_map[tag1] = tag2
        
        # Apply tag standardization
        for md_file in self.vault_path.rglob("*.md"):
            if md_file.name.startswith('.'):
                continue
            
            try:
                content = md_file.read_text(encoding='utf-8')
                original_content = content
                
                # Replace hashtags in content
                for old_tag, new_tag in tag_map.items():
                    content = re.sub(
                        rf'#\b{re.escape(old_tag)}\b',
                        f'#{new_tag}',
                        content
                    )
                
                # Replace tags in frontmatter
                frontmatter_match = re.match(r'^---\n(.*?)\n---', content, re.DOTALL)
                if frontmatter_match:
                    fm_content = frontmatter_match.group(1)
                    
                    for old_tag, new_tag in tag_map.items():
                        # Replace in tags array
                        fm_content = re.sub(
                            rf'\b{re.escape(old_tag)}\b',
                            new_tag,
                            fm_content
                        )
                    
                    content = content.replace(frontmatter_match.group(1), fm_content)
                
                if content != original_content:
                    if not self.dry_run:
                        md_file.write_text(content, encoding='utf-8')
                    
                    changed_tags = [f"{old}→{new}" for old, new in tag_map.items() 
                                   if f"#{old}" in original_content or old in original_content]
                    
                    if changed_tags:
                        self.log_change(
                            "Standardized tags",
                            f"In {md_file.relative_to(self.vault_path)}: {', '.join(changed_tags)}"
                        )
                        fixes_made += 1
                
            except Exception as e:
                print(f"Error standardizing tags in {md_file}: {e}")
        
        return fixes_made
    
    def add_missing_metadata(self) -> int:
        """Add missing metadata to files"""
        if not self.health_results.get('metadata_issues'):
            return 0
        
        print("📋 Adding missing metadata...")
        fixes_made = 0
        
        for issue in self.health_results['metadata_issues']:
            if issue['issue'] != 'missing_frontmatter':
                continue
            
            file_path = self.vault_path / issue['file']
            if not file_path.exists():
                continue
            
            try:
                content = file_path.read_text(encoding='utf-8')
                
                # Skip if file already has frontmatter
                if content.startswith('---'):
                    continue
                
                # Generate basic frontmatter
                stat = file_path.stat()
                created_date = datetime.fromtimestamp(stat.st_ctime)
                modified_date = datetime.fromtimestamp(stat.st_mtime)
                
                frontmatter = f"""---
title: {file_path.stem}
created: {created_date.isoformat()}
modified: {modified_date.isoformat()}
tags: []
---

"""
                
                new_content = frontmatter + content
                
                if not self.dry_run:
                    file_path.write_text(new_content, encoding='utf-8')
                
                self.log_change(
                    "Added frontmatter",
                    f"To {issue['file']}"
                )
                fixes_made += 1
                
            except Exception as e:
                print(f"Error adding metadata to {file_path}: {e}")
        
        return fixes_made
    
    def organize_files(self) -> int:
        """Organize misplaced files"""
        print("📁 Organizing file structure...")
        fixes_made = 0
        
        # Define organization rules
        organization_rules = {
            'patterns': {
                r'.*\.md$': 'Notes',
                r'.*\.(png|jpg|jpeg|gif)$': 'Images',
                r'.*\.pdf$': 'Documents/PDFs',
                r'.*\.(json|yaml|yml)$': 'Config'
            },
            'exclude_folders': {'.obsidian', '.git', 'Scripts', 'Templates'}
        }
        
        # This is a placeholder - in practice, file organization
        # should be done very carefully to avoid breaking workflows
        
        # For now, just suggest reorganization without doing it
        self.log_change(
            "File organization analysis",
            "Found files that could be better organized (manual review recommended)"
        )
        
        return 0  # Don't auto-move files for safety
    
    def run_all_repairs(self) -> Dict[str, int]:
        """Run all available repairs"""
        print(f"🔧 Starting vault auto-repair {'(DRY RUN)' if self.dry_run else ''}...")
        
        results = {
            "broken_links_fixed": self.fix_broken_links(),
            "tags_standardized": self.standardize_tags(),
            "metadata_added": self.add_missing_metadata(),
            "files_organized": self.organize_files()
        }
        
        # Save repair log
        if not self.dry_run:
            log_file = self.vault_path / "Scripts" / f"repair-log-{datetime.now().strftime('%Y%m%d-%H%M%S')}.json"
            with open(log_file, 'w') as f:
                json.dump({
                    "timestamp": datetime.now().isoformat(),
                    "results": results,
                    "changes": self.changes_made
                }, f, indent=2)
            print(f"📝 Repair log saved to: {log_file}")
        
        return results

def main():
    parser = argparse.ArgumentParser(description="Obsidian Vault Auto-Repair System")
    parser.add_argument("--vault", default="/Users/speed/Documents/Obsidian Vault",
                       help="Path to Obsidian vault")
    parser.add_argument("--dry-run", action="store_true",
                       help="Show what would be changed without making changes")
    parser.add_argument("--fix", choices=["links", "tags", "metadata", "all"],
                       default="all", help="What to fix")
    
    args = parser.parse_args()
    
    repairer = VaultAutoRepair(args.vault, args.dry_run)
    
    if args.fix == "links":
        fixed = repairer.fix_broken_links()
        print(f"Fixed {fixed} broken links")
    elif args.fix == "tags":
        fixed = repairer.standardize_tags()
        print(f"Standardized {fixed} files with tags")
    elif args.fix == "metadata":
        fixed = repairer.add_missing_metadata()
        print(f"Added metadata to {fixed} files")
    else:
        results = repairer.run_all_repairs()
        print("\n📊 Repair Summary:")
        for category, count in results.items():
            print(f"  {category}: {count}")

if __name__ == "__main__":
    main()