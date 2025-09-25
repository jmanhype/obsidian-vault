#!/usr/bin/env python3
"""
Obsidian Vault Health Dashboard
Generates comprehensive reports on vault health, backups, and trends
"""

import os
import json
import sqlite3
from pathlib import Path
from datetime import datetime, timedelta
from typing import Dict, List
import argparse

class VaultDashboard:
    def __init__(self, vault_path: str):
        self.vault_path = Path(vault_path)
        self.backup_root = Path(vault_path).parent / "Obsidian Vault Backups"
        self.db_path = self.backup_root / "backup_index.db"
        
    def load_health_results(self) -> Dict:
        """Load latest health check results"""
        health_file = self.vault_path / "Scripts" / "vault-health-results.json"
        if health_file.exists():
            with open(health_file, 'r') as f:
                return json.load(f)
        return {}
    
    def get_backup_stats(self) -> Dict:
        """Get backup statistics"""
        if not self.db_path.exists():
            return {"error": "No backup database found"}
        
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Total backups
            cursor.execute("SELECT COUNT(*) FROM backups")
            total_backups = cursor.fetchone()[0]
            
            # Recent backups (last 7 days)
            week_ago = (datetime.now() - timedelta(days=7)).isoformat()
            cursor.execute("SELECT COUNT(*) FROM backups WHERE timestamp > ?", (week_ago,))
            recent_backups = cursor.fetchone()[0]
            
            # Total backup size
            cursor.execute("SELECT SUM(compressed_size) FROM backups")
            total_size = cursor.fetchone()[0] or 0
            
            # Latest backup
            cursor.execute("""
                SELECT timestamp, backup_type, file_count, compressed_size 
                FROM backups 
                ORDER BY timestamp DESC 
                LIMIT 1
            """)
            latest = cursor.fetchone()
            
            # Backup frequency analysis
            cursor.execute("""
                SELECT backup_type, COUNT(*) 
                FROM backups 
                GROUP BY backup_type
            """)
            backup_types = dict(cursor.fetchall())
            
            return {
                "total_backups": total_backups,
                "recent_backups": recent_backups,
                "total_size_mb": round(total_size / (1024*1024), 2) if total_size else 0,
                "latest_backup": {
                    "timestamp": latest[0] if latest else None,
                    "type": latest[1] if latest else None,
                    "file_count": latest[2] if latest else 0,
                    "size_mb": round(latest[3] / (1024*1024), 2) if latest and latest[3] else 0
                } if latest else None,
                "backup_types": backup_types
            }
    
    def get_repair_history(self) -> List[Dict]:
        """Get history of vault repairs"""
        repair_logs = []
        
        # Find all repair log files
        for log_file in self.vault_path.glob("Scripts/repair-log-*.json"):
            try:
                with open(log_file, 'r') as f:
                    log_data = json.load(f)
                    repair_logs.append({
                        "file": log_file.name,
                        "timestamp": log_data.get("timestamp"),
                        "results": log_data.get("results", {}),
                        "changes_count": len(log_data.get("changes", []))
                    })
            except Exception as e:
                print(f"Error reading repair log {log_file}: {e}")
        
        return sorted(repair_logs, key=lambda x: x["timestamp"], reverse=True)
    
    def calculate_health_trends(self) -> Dict:
        """Calculate health trends over time"""
        # This would require storing historical health data
        # For now, return current health snapshot
        health_data = self.load_health_results()
        
        if not health_data:
            return {"error": "No health data available"}
        
        summary = health_data.get("summary", {})
        
        # Calculate health score (0-100)
        health_score = 100
        
        # Deduct points for issues
        if summary.get("broken_links_count", 0) > 0:
            health_score -= min(30, summary["broken_links_count"] * 2)  # Max 30 points
        
        if summary.get("orphaned_files_count", 0) > 10:
            health_score -= min(20, (summary["orphaned_files_count"] - 10) * 1)  # Max 20 points
        
        metadata_issues = len(health_data.get("metadata_issues", []))
        if metadata_issues > 0:
            health_score -= min(20, metadata_issues * 0.5)  # Max 20 points
        
        # Ensure score doesn't go below 0
        health_score = max(0, health_score)
        
        return {
            "current_score": round(health_score, 1),
            "score_breakdown": {
                "links": 100 - min(30, summary.get("broken_links_count", 0) * 2),
                "organization": 100 - min(20, max(0, summary.get("orphaned_files_count", 0) - 10) * 1),
                "metadata": 100 - min(20, metadata_issues * 0.5)
            },
            "total_files": summary.get("total_files", 0),
            "last_scan": summary.get("scan_date", "Unknown")
        }
    
    def generate_recommendations(self) -> List[Dict]:
        """Generate actionable recommendations"""
        health_data = self.load_health_results()
        backup_stats = self.get_backup_stats()
        recommendations = []
        
        # Health-based recommendations
        if health_data:
            summary = health_data.get("summary", {})
            
            if summary.get("broken_links_count", 0) > 0:
                recommendations.append({
                    "priority": "high",
                    "category": "content",
                    "title": "Fix broken links",
                    "description": f"Your vault has {summary['broken_links_count']} broken links that should be fixed",
                    "action": "Run: python3 Scripts/vault-auto-repair.py --fix links"
                })
            
            if summary.get("orphaned_files_count", 0) > 20:
                recommendations.append({
                    "priority": "medium",
                    "category": "organization",
                    "title": "Review orphaned files",
                    "description": f"{summary['orphaned_files_count']} files have no incoming links",
                    "action": "Review files and add links or consider archiving"
                })
            
            metadata_issues = len(health_data.get("metadata_issues", []))
            if metadata_issues > 10:
                recommendations.append({
                    "priority": "medium",
                    "category": "metadata",
                    "title": "Add missing metadata",
                    "description": f"{metadata_issues} files missing proper frontmatter",
                    "action": "Run: python3 Scripts/vault-auto-repair.py --fix metadata"
                })
        
        # Backup-based recommendations
        if backup_stats and not backup_stats.get("error"):
            if backup_stats["recent_backups"] == 0:
                recommendations.append({
                    "priority": "high",
                    "category": "backup",
                    "title": "Create recent backup",
                    "description": "No backups created in the last 7 days",
                    "action": "Run: python3 Scripts/smart-backup.py backup --type full"
                })
            
            if backup_stats["total_size_mb"] > 100:
                recommendations.append({
                    "priority": "low",
                    "category": "maintenance",
                    "title": "Clean up old backups",
                    "description": f"Backup storage using {backup_stats['total_size_mb']} MB",
                    "action": "Run: python3 Scripts/smart-backup.py cleanup"
                })
        
        return recommendations
    
    def generate_dashboard_report(self) -> str:
        """Generate comprehensive dashboard report"""
        health_data = self.load_health_results()
        backup_stats = self.get_backup_stats()
        repair_history = self.get_repair_history()
        health_trends = self.calculate_health_trends()
        recommendations = self.generate_recommendations()
        
        # Generate markdown report
        report = f"""# 📊 Vault Health Dashboard
Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## 🎯 Health Score: {health_trends.get('current_score', 'N/A')}/100

### Score Breakdown:
- **Links**: {health_trends.get('score_breakdown', {}).get('links', 'N/A')}/100
- **Organization**: {health_trends.get('score_breakdown', {}).get('organization', 'N/A')}/100  
- **Metadata**: {health_trends.get('score_breakdown', {}).get('metadata', 'N/A')}/100

## 📈 Vault Statistics

### Content Overview
- **Total Files**: {health_data.get('summary', {}).get('total_files', 'N/A')}
- **Total Size**: {health_data.get('summary', {}).get('total_size_mb', 'N/A')} MB
- **Unique Tags**: {health_data.get('tag_analysis', {}).get('total_unique_tags', 'N/A')}
- **Total Links**: {health_data.get('summary', {}).get('total_links', 'N/A')}

### Health Issues
- **Broken Links**: {health_data.get('summary', {}).get('broken_links_count', 'N/A')}
- **Orphaned Files**: {health_data.get('summary', {}).get('orphaned_files_count', 'N/A')}
- **Metadata Issues**: {len(health_data.get('metadata_issues', []))}
- **Image Issues**: {len(health_data.get('image_issues', []))}

## 💾 Backup Status

### Recent Activity
- **Total Backups**: {backup_stats.get('total_backups', 'N/A')}
- **Recent Backups (7d)**: {backup_stats.get('recent_backups', 'N/A')}
- **Total Storage**: {backup_stats.get('total_size_mb', 'N/A')} MB

### Latest Backup
"""
        
        latest = backup_stats.get('latest_backup')
        if latest:
            report += f"""- **Date**: {latest.get('timestamp', 'N/A')}
- **Type**: {latest.get('type', 'N/A')}
- **Files**: {latest.get('file_count', 'N/A')}
- **Size**: {latest.get('size_mb', 'N/A')} MB
"""
        else:
            report += "- No backups found\n"
        
        report += f"""
### Backup Types
"""
        backup_types = backup_stats.get('backup_types', {})
        for backup_type, count in backup_types.items():
            report += f"- **{backup_type.title()}**: {count} backups\n"
        
        report += f"""
## 🔧 Recent Repairs

"""
        if repair_history:
            for repair in repair_history[:3]:  # Show last 3 repairs
                report += f"""### {repair['timestamp'][:10]}
- **Changes Made**: {repair['changes_count']}
- **Results**: {repair['results']}

"""
        else:
            report += "No repair history found.\n"
        
        report += f"""
## 📋 Recommendations

"""
        if recommendations:
            for rec in recommendations:
                priority_emoji = {"high": "🔴", "medium": "🟡", "low": "🟢"}.get(rec['priority'], "⚪")
                report += f"""### {priority_emoji} {rec['title']} ({rec['priority']} priority)
**Category**: {rec['category']}
**Issue**: {rec['description']}
**Action**: `{rec['action']}`

"""
        else:
            report += "✅ No recommendations at this time - your vault is in good shape!\n"
        
        report += f"""
## 🚀 Next Steps

1. **Regular Maintenance**: Run health checks weekly
2. **Automated Backups**: Set up scheduled backups
3. **Content Review**: Regularly review orphaned files
4. **Link Maintenance**: Fix broken links as they appear

---
*Dashboard generated by Vault Health Monitoring System*
*Last health scan: {health_data.get('summary', {}).get('scan_date', 'Unknown')}*
"""
        
        return report
    
    def save_dashboard_report(self) -> str:
        """Save dashboard report to file"""
        report = self.generate_dashboard_report()
        
        # Save to Scripts directory
        report_file = self.vault_path / "Scripts" / f"vault-dashboard-{datetime.now().strftime('%Y%m%d')}.md"
        with open(report_file, 'w') as f:
            f.write(report)
        
        return str(report_file)

def main():
    parser = argparse.ArgumentParser(description="Obsidian Vault Health Dashboard")
    parser.add_argument("--vault", default="/Users/speed/Documents/Obsidian Vault",
                       help="Path to Obsidian vault")
    parser.add_argument("--output", choices=["console", "file", "both"], default="both",
                       help="Where to output the dashboard")
    
    args = parser.parse_args()
    
    dashboard = VaultDashboard(args.vault)
    
    if args.output in ["console", "both"]:
        report = dashboard.generate_dashboard_report()
        print(report)
    
    if args.output in ["file", "both"]:
        report_file = dashboard.save_dashboard_report()
        print(f"\n📊 Dashboard saved to: {report_file}")

if __name__ == "__main__":
    main()