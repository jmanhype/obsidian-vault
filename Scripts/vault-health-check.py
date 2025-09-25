#!/usr/bin/env python3
"""
Obsidian Vault Health Assessment Script
Analyzes vault structure, links, tags, and content quality
"""

import os
import re
import json
import glob
from pathlib import Path
from collections import defaultdict, Counter
from datetime import datetime
import hashlib

class VaultHealthChecker:
    def __init__(self, vault_path):
        self.vault_path = Path(vault_path)
        self.results = {
            'summary': {},
            'broken_links': [],
            'orphaned_files': [],
            'tag_analysis': {},
            'metadata_issues': [],
            'file_structure': {},
            'image_issues': [],
            'recommendations': []
        }
        
    def scan_vault(self):
        """Main scanning function"""
        print("🔍 Starting comprehensive vault health check...")
        
        # Get all markdown files
        md_files = list(self.vault_path.rglob("*.md"))
        print(f"Found {len(md_files)} markdown files")
        
        # Basic statistics
        self.results['summary'] = {
            'total_files': len(md_files),
            'total_size_mb': sum(f.stat().st_size for f in md_files) / (1024*1024),
            'scan_date': datetime.now().isoformat(),
            'vault_path': str(self.vault_path)
        }
        
        # Analyze each component
        self.check_links(md_files)
        self.analyze_tags(md_files)
        self.check_metadata(md_files)
        self.analyze_file_structure(md_files)
        self.check_images(md_files)
        self.find_orphaned_files(md_files)
        self.generate_recommendations()
        
        return self.results
    
    def check_links(self, md_files):
        """Check for broken internal links"""
        print("🔗 Checking internal links...")
        
        # Build map of all files
        file_map = {}
        for f in md_files:
            name = f.stem
            file_map[name] = f
            # Also map with full path for absolute links
            rel_path = f.relative_to(self.vault_path)
            file_map[str(rel_path.with_suffix(''))] = f
        
        broken_links = []
        all_links = []
        
        for md_file in md_files:
            try:
                content = md_file.read_text(encoding='utf-8')
                
                # Find [[wiki-style]] links
                wiki_links = re.findall(r'\[\[([^\]]+)\]\]', content)
                for link in wiki_links:
                    # Remove display text after |
                    clean_link = link.split('|')[0].strip()
                    all_links.append(clean_link)
                    
                    if clean_link not in file_map:
                        broken_links.append({
                            'file': str(md_file.relative_to(self.vault_path)),
                            'broken_link': clean_link,
                            'type': 'wiki_link'
                        })
                
                # Find markdown links [text](file.md)
                md_links = re.findall(r'\[([^\]]+)\]\(([^)]+\.md)\)', content)
                for text, link in md_links:
                    all_links.append(link)
                    # Convert relative path to absolute
                    link_path = (md_file.parent / link).resolve()
                    if not link_path.exists():
                        broken_links.append({
                            'file': str(md_file.relative_to(self.vault_path)),
                            'broken_link': link,
                            'type': 'markdown_link'
                        })
                        
            except Exception as e:
                print(f"Error reading {md_file}: {e}")
        
        self.results['broken_links'] = broken_links
        self.results['summary']['total_links'] = len(all_links)
        self.results['summary']['broken_links_count'] = len(broken_links)
        
        print(f"Found {len(broken_links)} broken links out of {len(all_links)} total links")
    
    def analyze_tags(self, md_files):
        """Analyze tag usage and consistency"""
        print("🏷️ Analyzing tags...")
        
        all_tags = []
        tag_files = defaultdict(list)
        
        for md_file in md_files:
            try:
                content = md_file.read_text(encoding='utf-8')
                
                # Find hashtags in content
                hashtags = re.findall(r'#([a-zA-Z0-9_-]+)', content)
                
                # Find tags in frontmatter
                frontmatter_match = re.match(r'^---\n(.*?)\n---', content, re.DOTALL)
                if frontmatter_match:
                    fm_content = frontmatter_match.group(1)
                    # Look for tags: line
                    tags_match = re.search(r'tags:\s*\[(.*?)\]', fm_content)
                    if tags_match:
                        fm_tags = [tag.strip(' "\'') for tag in tags_match.group(1).split(',')]
                        hashtags.extend(fm_tags)
                
                for tag in hashtags:
                    all_tags.append(tag)
                    tag_files[tag].append(str(md_file.relative_to(self.vault_path)))
                    
            except Exception as e:
                print(f"Error analyzing tags in {md_file}: {e}")
        
        # Analyze tag patterns
        tag_counts = Counter(all_tags)
        
        # Find similar tags that might need consolidation
        similar_tags = []
        tag_list = list(tag_counts.keys())
        for i, tag1 in enumerate(tag_list):
            for tag2 in tag_list[i+1:]:
                if self.tags_similar(tag1, tag2):
                    similar_tags.append({
                        'tag1': tag1,
                        'tag2': tag2,
                        'count1': tag_counts[tag1],
                        'count2': tag_counts[tag2]
                    })
        
        self.results['tag_analysis'] = {
            'total_unique_tags': len(tag_counts),
            'most_common_tags': tag_counts.most_common(10),
            'single_use_tags': [tag for tag, count in tag_counts.items() if count == 1],
            'similar_tags': similar_tags,
            'tag_files': dict(tag_files)
        }
        
        print(f"Found {len(tag_counts)} unique tags")
    
    def tags_similar(self, tag1, tag2):
        """Check if two tags are similar enough to suggest consolidation"""
        # Simple similarity checks
        if tag1.lower() == tag2.lower() and tag1 != tag2:
            return True
        if tag1.replace('-', '') == tag2.replace('-', ''):
            return True
        if tag1.replace('_', '') == tag2.replace('_', ''):
            return True
        # Add more sophisticated similarity checks as needed
        return False
    
    def check_metadata(self, md_files):
        """Check frontmatter and metadata consistency"""
        print("📋 Checking metadata...")
        
        issues = []
        
        for md_file in md_files:
            try:
                content = md_file.read_text(encoding='utf-8')
                
                # Check for frontmatter
                frontmatter_match = re.match(r'^---\n(.*?)\n---', content, re.DOTALL)
                if not frontmatter_match:
                    issues.append({
                        'file': str(md_file.relative_to(self.vault_path)),
                        'issue': 'missing_frontmatter',
                        'description': 'File has no YAML frontmatter'
                    })
                    continue
                
                fm_content = frontmatter_match.group(1)
                
                # Check for required fields
                if 'tags:' not in fm_content and '#' not in content:
                    issues.append({
                        'file': str(md_file.relative_to(self.vault_path)),
                        'issue': 'no_tags',
                        'description': 'File has no tags in frontmatter or content'
                    })
                
                # Check date formats
                date_matches = re.findall(r'(date|created|modified):\s*([^\n]+)', fm_content)
                for field, date_val in date_matches:
                    if not self.is_valid_date_format(date_val.strip()):
                        issues.append({
                            'file': str(md_file.relative_to(self.vault_path)),
                            'issue': 'invalid_date_format',
                            'description': f'Invalid date format in {field}: {date_val}'
                        })
                        
            except Exception as e:
                issues.append({
                    'file': str(md_file.relative_to(self.vault_path)),
                    'issue': 'read_error',
                    'description': f'Could not read file: {e}'
                })
        
        self.results['metadata_issues'] = issues
        print(f"Found {len(issues)} metadata issues")
    
    def is_valid_date_format(self, date_str):
        """Check if date string is in a valid format"""
        common_formats = [
            '%Y-%m-%d',
            '%Y-%m-%d %H:%M:%S',
            '%Y-%m-%dT%H:%M:%S',
            '%Y-%m-%dT%H:%M:%SZ'
        ]
        
        for fmt in common_formats:
            try:
                datetime.strptime(date_str, fmt)
                return True
            except ValueError:
                continue
        return False
    
    def analyze_file_structure(self, md_files):
        """Analyze file organization and structure"""
        print("📁 Analyzing file structure...")
        
        structure = defaultdict(list)
        naming_issues = []
        
        for md_file in md_files:
            rel_path = md_file.relative_to(self.vault_path)
            folder = str(rel_path.parent)
            structure[folder].append(str(rel_path.name))
            
            # Check naming conventions
            filename = md_file.stem
            if ' ' in filename and not filename.replace(' ', '').isalnum():
                naming_issues.append({
                    'file': str(rel_path),
                    'issue': 'special_characters',
                    'description': 'Filename contains special characters that might cause issues'
                })
        
        self.results['file_structure'] = {
            'folders': dict(structure),
            'folder_count': len(structure),
            'naming_issues': naming_issues
        }
        
        print(f"Files organized in {len(structure)} folders")
    
    def check_images(self, md_files):
        """Check image references and files"""
        print("🖼️ Checking images...")
        
        image_issues = []
        image_refs = []
        
        for md_file in md_files:
            try:
                content = md_file.read_text(encoding='utf-8')
                
                # Find image references
                img_refs = re.findall(r'!\[([^\]]*)\]\(([^)]+)\)', content)
                for alt_text, img_path in img_refs:
                    image_refs.append(img_path)
                    
                    # Check if image exists
                    if not img_path.startswith('http'):
                        img_file = (md_file.parent / img_path).resolve()
                        if not img_file.exists():
                            image_issues.append({
                                'file': str(md_file.relative_to(self.vault_path)),
                                'missing_image': img_path,
                                'type': 'missing_file'
                            })
                            
            except Exception as e:
                print(f"Error checking images in {md_file}: {e}")
        
        # Find large images that might slow down vault
        try:
            vault_images = list(self.vault_path.rglob("*.png")) + \
                          list(self.vault_path.rglob("*.jpg")) + \
                          list(self.vault_path.rglob("*.jpeg")) + \
                          list(self.vault_path.rglob("*.gif"))
        except Exception as e:
            print(f"Error scanning images: {e}")
            vault_images = []
        
        large_images = []
        for img in vault_images:
            size_mb = img.stat().st_size / (1024*1024)
            if size_mb > 5:  # Images larger than 5MB
                large_images.append({
                    'file': str(img.relative_to(self.vault_path)),
                    'size_mb': round(size_mb, 2)
                })
        
        self.results['image_issues'] = image_issues
        self.results['summary']['total_images'] = len(vault_images)
        self.results['summary']['large_images'] = len(large_images)
        self.results['large_images'] = large_images
        
        print(f"Found {len(image_issues)} image reference issues")
    
    def find_orphaned_files(self, md_files):
        """Find files with no incoming links"""
        print("🏝️ Finding orphaned files...")
        
        # Build map of all references
        referenced_files = set()
        file_names = set()
        
        for md_file in md_files:
            file_names.add(md_file.stem)
            try:
                content = md_file.read_text(encoding='utf-8')
                
                # Find all internal references
                wiki_links = re.findall(r'\[\[([^\]|]+)', content)
                md_links = re.findall(r'\]\(([^)]+\.md)\)', content)
                
                for link in wiki_links + md_links:
                    clean_link = link.split('|')[0].strip()
                    if clean_link.endswith('.md'):
                        clean_link = clean_link[:-3]
                    referenced_files.add(clean_link)
                    
            except Exception as e:
                print(f"Error checking references in {md_file}: {e}")
        
        # Find orphaned files (files not referenced by others)
        orphaned = []
        for md_file in md_files:
            file_stem = md_file.stem
            if file_stem not in referenced_files:
                # Skip certain files that are meant to be entry points
                if file_stem.lower() not in ['readme', 'index', 'home', 'dashboard']:
                    orphaned.append(str(md_file.relative_to(self.vault_path)))
        
        self.results['orphaned_files'] = orphaned
        self.results['summary']['orphaned_files_count'] = len(orphaned)
        
        print(f"Found {len(orphaned)} potentially orphaned files")
    
    def generate_recommendations(self):
        """Generate actionable recommendations"""
        recommendations = []
        
        if self.results['summary']['broken_links_count'] > 0:
            recommendations.append({
                'priority': 'high',
                'category': 'links',
                'action': f"Fix {self.results['summary']['broken_links_count']} broken links",
                'impact': 'Improves navigation and prevents user frustration'
            })
        
        if len(self.results['tag_analysis']['similar_tags']) > 0:
            recommendations.append({
                'priority': 'medium',
                'category': 'tags',
                'action': f"Consolidate {len(self.results['tag_analysis']['similar_tags'])} similar tag pairs",
                'impact': 'Improves tag consistency and findability'
            })
        
        if len(self.results['tag_analysis']['single_use_tags']) > 10:
            recommendations.append({
                'priority': 'low',
                'category': 'tags',
                'action': f"Review {len(self.results['tag_analysis']['single_use_tags'])} single-use tags",
                'impact': 'Reduces tag clutter and improves organization'
            })
        
        if self.results['summary']['orphaned_files_count'] > 5:
            recommendations.append({
                'priority': 'medium',
                'category': 'structure',
                'action': f"Review {self.results['summary']['orphaned_files_count']} orphaned files",
                'impact': 'Improves content discoverability'
            })
        
        if len(self.results['metadata_issues']) > 0:
            recommendations.append({
                'priority': 'medium',
                'category': 'metadata',
                'action': f"Fix {len(self.results['metadata_issues'])} metadata issues",
                'impact': 'Improves data consistency and automation'
            })
        
        self.results['recommendations'] = recommendations

def main():
    import sys
    if len(sys.argv) > 1:
        vault_path = sys.argv[1]
    else:
        vault_path = "/Users/speed/Documents/Obsidian Vault"  # Default local path
    
    checker = VaultHealthChecker(vault_path)
    results = checker.scan_vault()
    
    # Save results
    vault_path_obj = Path(vault_path)
    results_file = vault_path_obj / "Scripts" / "vault-health-results.json"
    with open(results_file, 'w') as f:
        json.dump(results, f, indent=2)
    
    # Generate summary report
    print("\n" + "="*50)
    print("📊 VAULT HEALTH SUMMARY")
    print("="*50)
    print(f"Total Files: {results['summary']['total_files']}")
    print(f"Total Size: {results['summary']['total_size_mb']:.1f} MB")
    print(f"Broken Links: {results['summary']['broken_links_count']}")
    print(f"Orphaned Files: {results['summary']['orphaned_files_count']}")
    print(f"Unique Tags: {results['tag_analysis']['total_unique_tags']}")
    print(f"Metadata Issues: {len(results['metadata_issues'])}")
    
    print(f"\n📋 TOP RECOMMENDATIONS:")
    for rec in results['recommendations'][:5]:
        print(f"  {rec['priority'].upper()}: {rec['action']}")
    
    print(f"\n✅ Results saved to: {results_file}")

if __name__ == "__main__":
    main()