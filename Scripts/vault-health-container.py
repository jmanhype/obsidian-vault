#!/usr/bin/env python3
"""
Simple vault health check script for container execution
"""

import os
import re
import json
from pathlib import Path
from datetime import datetime

def main():
    vault_path = Path("/vault")
    results = {
        "timestamp": datetime.now().isoformat(),
        "container_mode": True,
        "vault_path": "/vault"
    }
    
    # Check if vault exists
    if not vault_path.exists():
        results["error"] = "Vault path not found in container"
        print(json.dumps(results))
        return
    
    # List vault contents for debugging
    vault_contents = list(vault_path.iterdir())
    results["vault_contents"] = [str(p.name) for p in vault_contents]
    
    # Find markdown files
    md_files = []
    try:
        md_files = [f for f in vault_path.rglob("*.md") if not f.name.startswith('.')]
        results["md_files_found"] = [str(f.relative_to(vault_path)) for f in md_files[:5]]
    except Exception as e:
        results["error"] = f"Failed to scan files: {e}"
        print(json.dumps(results))
        return
    
    # Build file map for link checking
    file_map = {}
    for md_file in md_files:
        try:
            rel_path = md_file.relative_to(vault_path)
            file_stem = md_file.stem
            file_map[file_stem] = str(rel_path.with_suffix(''))
        except Exception:
            continue
    
    # Check for broken links
    broken_links = []
    total_links = 0
    
    for md_file in md_files:
        try:
            content = md_file.read_text(encoding='utf-8')
            rel_path = md_file.relative_to(vault_path)
            
            # Find wiki links [[link]]
            wiki_links = re.findall(r'\[\[([^\]]+)\]\]', content)
            for link in wiki_links:
                total_links += 1
                link_target = link.split('|')[0].strip()
                if link_target not in file_map:
                    broken_links.append({
                        "file": str(rel_path),
                        "broken_link": link_target,
                        "type": "wiki_link"
                    })
        except Exception as e:
            continue
    
    # Find orphaned files
    linked_files = set()
    for md_file in md_files:
        try:
            content = md_file.read_text(encoding='utf-8')
            wiki_links = re.findall(r'\[\[([^\]]+)\]\]', content)
            for link in wiki_links:
                link_target = link.split('|')[0].strip()
                linked_files.add(link_target)
        except Exception:
            continue
    
    orphaned = []
    for md_file in md_files:
        try:
            rel_path = md_file.relative_to(vault_path)
            file_stem = md_file.stem
            if file_stem not in linked_files:
                orphaned.append({
                    "file": str(rel_path),
                    "size_kb": round(md_file.stat().st_size / 1024, 2)
                })
        except Exception:
            continue
    
    # Calculate summary
    total_size = sum(f.stat().st_size for f in md_files if f.exists())
    
    results.update({
        "summary": {
            "total_files": len(md_files),
            "total_size_mb": round(total_size / (1024 * 1024), 2),
            "total_links": total_links,
            "broken_links_count": len(broken_links),
            "orphaned_files_count": len(orphaned),
            "scan_date": datetime.now().isoformat()
        },
        "broken_links": broken_links[:5],  # Limit output
        "orphaned_files": orphaned[:5],    # Limit output
        "status": "success"
    })
    
    print(json.dumps(results, indent=2))

if __name__ == "__main__":
    main()