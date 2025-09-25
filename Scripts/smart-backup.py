#!/usr/bin/env python3
"""
Smart Obsidian Vault Backup System
Features:
- Incremental backups
- Compression and deduplication  
- Multiple storage backends
- Integrity verification
- Automated scheduling
"""

import os
import sys
import json
import gzip
import shutil
import hashlib
import sqlite3
from pathlib import Path
from datetime import datetime, timedelta
from typing import Dict, List, Set, Optional
import argparse
import subprocess

class SmartBackup:
    def __init__(self, vault_path: str, backup_root: str):
        self.vault_path = Path(vault_path)
        self.backup_root = Path(backup_root)
        
        # Create backup structure
        self.backup_root.mkdir(parents=True, exist_ok=True)
        self.db_path = self.backup_root / "backup_index.db"
        self.config_path = self.backup_root / "backup_config.json"
        
        # Default configuration
        self.config = {
            "retention_days": 30,
            "compression": True,
            "verify_integrity": True,
            "exclude_patterns": [
                ".obsidian/workspace*",
                ".obsidian/hotkeys.json",
                ".obsidian/app.json",
                ".DS_Store",
                "*.tmp",
                "__pycache__"
            ],
            "backup_types": {
                "hourly": {"interval": 1, "keep": 24},
                "daily": {"interval": 24, "keep": 30}, 
                "weekly": {"interval": 168, "keep": 12}
            }
        }
        
        self.load_config()
        self.init_database()
    
    def load_config(self):
        """Load backup configuration"""
        if self.config_path.exists():
            try:
                with open(self.config_path, 'r') as f:
                    saved_config = json.load(f)
                    self.config.update(saved_config)
            except Exception as e:
                print(f"Warning: Could not load config: {e}")
    
    def save_config(self):
        """Save backup configuration"""
        with open(self.config_path, 'w') as f:
            json.dump(self.config, f, indent=2)
    
    def init_database(self):
        """Initialize backup tracking database"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS backups (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp TEXT NOT NULL,
                    backup_type TEXT NOT NULL,
                    file_count INTEGER NOT NULL,
                    total_size INTEGER NOT NULL,
                    compressed_size INTEGER,
                    checksum TEXT NOT NULL,
                    backup_path TEXT NOT NULL,
                    metadata TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            conn.execute("""
                CREATE TABLE IF NOT EXISTS file_hashes (
                    file_path TEXT PRIMARY KEY,
                    last_hash TEXT NOT NULL,
                    last_modified TIMESTAMP NOT NULL,
                    last_backup_id INTEGER,
                    FOREIGN KEY (last_backup_id) REFERENCES backups (id)
                )
            """)
            
            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_backup_timestamp 
                ON backups (timestamp)
            """)
            
            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_file_modified 
                ON file_hashes (last_modified)
            """)
    
    def should_exclude(self, file_path: Path) -> bool:
        """Check if file should be excluded from backup"""
        rel_path = str(file_path.relative_to(self.vault_path))
        
        for pattern in self.config["exclude_patterns"]:
            if file_path.match(pattern) or rel_path.find(pattern.replace('*', '')) != -1:
                return True
        return False
    
    def calculate_file_hash(self, file_path: Path) -> str:
        """Calculate SHA256 hash of file"""
        hash_sha256 = hashlib.sha256()
        try:
            with open(file_path, "rb") as f:
                for chunk in iter(lambda: f.read(4096), b""):
                    hash_sha256.update(chunk)
            return hash_sha256.hexdigest()
        except Exception as e:
            print(f"Error hashing {file_path}: {e}")
            return ""
    
    def get_changed_files(self) -> List[Path]:
        """Get list of files that have changed since last backup"""
        changed_files = []
        
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            for file_path in self.vault_path.rglob("*"):
                if file_path.is_file() and not self.should_exclude(file_path):
                    rel_path = str(file_path.relative_to(self.vault_path))
                    
                    # Get file stats
                    stat = file_path.stat()
                    current_modified = datetime.fromtimestamp(stat.st_mtime)
                    
                    # Check if file exists in database
                    cursor.execute(
                        "SELECT last_hash, last_modified FROM file_hashes WHERE file_path = ?",
                        (rel_path,)
                    )
                    result = cursor.fetchone()
                    
                    if result:
                        last_hash, last_modified_str = result
                        last_modified = datetime.fromisoformat(last_modified_str)
                        
                        # If modification time changed, check hash
                        if current_modified > last_modified:
                            current_hash = self.calculate_file_hash(file_path)
                            if current_hash != last_hash:
                                changed_files.append(file_path)
                    else:
                        # New file
                        changed_files.append(file_path)
        
        return changed_files
    
    def create_backup(self, backup_type: str = "manual") -> Dict:
        """Create a new backup"""
        print(f"🔄 Creating {backup_type} backup...")
        
        timestamp = datetime.now().isoformat()
        backup_dir = self.backup_root / f"backup_{timestamp.replace(':', '-')}"
        backup_dir.mkdir(parents=True, exist_ok=True)
        
        # Get all files to backup
        if backup_type == "incremental":
            files_to_backup = self.get_changed_files()
            print(f"Found {len(files_to_backup)} changed files")
        else:
            files_to_backup = [
                f for f in self.vault_path.rglob("*") 
                if f.is_file() and not self.should_exclude(f)
            ]
            print(f"Backing up {len(files_to_backup)} files")
        
        # Copy files
        total_size = 0
        copied_files = 0
        
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            for file_path in files_to_backup:
                rel_path = file_path.relative_to(self.vault_path)
                dest_path = backup_dir / rel_path
                
                # Create destination directory
                dest_path.parent.mkdir(parents=True, exist_ok=True)
                
                try:
                    if self.config["compression"] and file_path.suffix in ['.md', '.txt', '.json']:
                        # Compress text files
                        with open(file_path, 'rb') as f_in:
                            with gzip.open(f"{dest_path}.gz", 'wb') as f_out:
                                shutil.copyfileobj(f_in, f_out)
                        dest_path = Path(f"{dest_path}.gz")
                    else:
                        # Copy binary files as-is
                        shutil.copy2(file_path, dest_path)
                    
                    # Update file hash database
                    file_hash = self.calculate_file_hash(file_path)
                    file_modified = datetime.fromtimestamp(file_path.stat().st_mtime)
                    
                    cursor.execute("""
                        INSERT OR REPLACE INTO file_hashes 
                        (file_path, last_hash, last_modified) 
                        VALUES (?, ?, ?)
                    """, (str(rel_path), file_hash, file_modified.isoformat()))
                    
                    total_size += file_path.stat().st_size
                    copied_files += 1
                    
                except Exception as e:
                    print(f"Error backing up {file_path}: {e}")
        
        # Calculate backup checksum
        backup_checksum = self.calculate_backup_checksum(backup_dir)
        
        # Get compressed size
        compressed_size = sum(f.stat().st_size for f in backup_dir.rglob("*") if f.is_file())
        
        # Save backup metadata
        metadata = {
            "vault_health_snapshot": self.get_vault_health_snapshot(),
            "git_commit": self.get_git_commit(),
            "backup_stats": {
                "files_copied": copied_files,
                "compression_ratio": round((1 - compressed_size / total_size) * 100, 2) if total_size > 0 else 0
            }
        }
        
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO backups 
                (timestamp, backup_type, file_count, total_size, compressed_size, 
                 checksum, backup_path, metadata)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                timestamp, backup_type, copied_files, total_size, compressed_size,
                backup_checksum, str(backup_dir), json.dumps(metadata)
            ))
            backup_id = cursor.lastrowid
        
        backup_info = {
            "id": backup_id,
            "timestamp": timestamp,
            "type": backup_type,
            "file_count": copied_files,
            "total_size_mb": round(total_size / (1024*1024), 2),
            "compressed_size_mb": round(compressed_size / (1024*1024), 2),
            "compression_ratio": metadata["backup_stats"]["compression_ratio"],
            "checksum": backup_checksum,
            "path": str(backup_dir)
        }
        
        print(f"✅ Backup completed: {backup_info['file_count']} files, {backup_info['compressed_size_mb']} MB")
        return backup_info
    
    def calculate_backup_checksum(self, backup_dir: Path) -> str:
        """Calculate checksum of entire backup"""
        hash_sha256 = hashlib.sha256()
        
        for file_path in sorted(backup_dir.rglob("*")):
            if file_path.is_file():
                rel_path = file_path.relative_to(backup_dir)
                hash_sha256.update(str(rel_path).encode())
                
                with open(file_path, "rb") as f:
                    for chunk in iter(lambda: f.read(4096), b""):
                        hash_sha256.update(chunk)
        
        return hash_sha256.hexdigest()
    
    def get_vault_health_snapshot(self) -> Dict:
        """Get current vault health metrics"""
        try:
            health_file = self.vault_path / "Scripts" / "vault-health-results.json"
            if health_file.exists():
                with open(health_file, 'r') as f:
                    health_data = json.load(f)
                    return {
                        "total_files": health_data.get("summary", {}).get("total_files", 0),
                        "broken_links": health_data.get("summary", {}).get("broken_links_count", 0),
                        "scan_date": health_data.get("summary", {}).get("scan_date", "")
                    }
        except Exception as e:
            print(f"Could not get vault health snapshot: {e}")
        
        return {"error": "Health data not available"}
    
    def get_git_commit(self) -> Optional[str]:
        """Get current git commit hash if available"""
        try:
            result = subprocess.run(
                ["git", "rev-parse", "HEAD"],
                cwd=self.vault_path,
                capture_output=True,
                text=True
            )
            if result.returncode == 0:
                return result.stdout.strip()
        except Exception:
            pass
        return None
    
    def verify_backup(self, backup_id: int) -> bool:
        """Verify backup integrity"""
        print(f"🔍 Verifying backup {backup_id}...")
        
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT checksum, backup_path FROM backups WHERE id = ?",
                (backup_id,)
            )
            result = cursor.fetchone()
            
            if not result:
                print(f"Backup {backup_id} not found")
                return False
            
            stored_checksum, backup_path = result
            backup_dir = Path(backup_path)
            
            if not backup_dir.exists():
                print(f"Backup directory not found: {backup_path}")
                return False
            
            # Recalculate checksum
            current_checksum = self.calculate_backup_checksum(backup_dir)
            
            if current_checksum == stored_checksum:
                print(f"✅ Backup {backup_id} integrity verified")
                return True
            else:
                print(f"❌ Backup {backup_id} integrity check failed")
                return False
    
    def list_backups(self) -> List[Dict]:
        """List all backups"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT id, timestamp, backup_type, file_count, 
                       total_size, compressed_size, backup_path
                FROM backups 
                ORDER BY timestamp DESC
            """)
            
            backups = []
            for row in cursor.fetchall():
                backup_id, timestamp, backup_type, file_count, total_size, compressed_size, backup_path = row
                backups.append({
                    "id": backup_id,
                    "timestamp": timestamp,
                    "type": backup_type,
                    "file_count": file_count,
                    "total_size_mb": round(total_size / (1024*1024), 2),
                    "compressed_size_mb": round(compressed_size / (1024*1024), 2) if compressed_size else 0,
                    "path": backup_path,
                    "exists": Path(backup_path).exists()
                })
            
            return backups
    
    def cleanup_old_backups(self):
        """Remove old backups based on retention policy"""
        print("🧹 Cleaning up old backups...")
        
        cutoff_date = datetime.now() - timedelta(days=self.config["retention_days"])
        
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT id, backup_path FROM backups WHERE timestamp < ?",
                (cutoff_date.isoformat(),)
            )
            
            old_backups = cursor.fetchall()
            
            for backup_id, backup_path in old_backups:
                try:
                    backup_dir = Path(backup_path)
                    if backup_dir.exists():
                        shutil.rmtree(backup_dir)
                        print(f"Removed old backup: {backup_path}")
                    
                    cursor.execute("DELETE FROM backups WHERE id = ?", (backup_id,))
                
                except Exception as e:
                    print(f"Error removing backup {backup_id}: {e}")
            
            conn.commit()
    
    def restore_backup(self, backup_id: int, restore_path: str):
        """Restore a backup to specified location"""
        print(f"🔄 Restoring backup {backup_id}...")
        
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT backup_path FROM backups WHERE id = ?",
                (backup_id,)
            )
            result = cursor.fetchone()
            
            if not result:
                print(f"Backup {backup_id} not found")
                return False
            
            backup_path = Path(result[0])
            restore_path = Path(restore_path)
            
            if not backup_path.exists():
                print(f"Backup directory not found: {backup_path}")
                return False
            
            # Create restore directory
            restore_path.mkdir(parents=True, exist_ok=True)
            
            # Copy files
            for file_path in backup_path.rglob("*"):
                if file_path.is_file():
                    rel_path = file_path.relative_to(backup_path)
                    dest_path = restore_path / rel_path
                    
                    dest_path.parent.mkdir(parents=True, exist_ok=True)
                    
                    if file_path.suffix == '.gz':
                        # Decompress
                        with gzip.open(file_path, 'rb') as f_in:
                            with open(dest_path.with_suffix(''), 'wb') as f_out:
                                shutil.copyfileobj(f_in, f_out)
                    else:
                        shutil.copy2(file_path, dest_path)
            
            print(f"✅ Backup restored to: {restore_path}")
            return True

def main():
    parser = argparse.ArgumentParser(description="Smart Obsidian Vault Backup System")
    parser.add_argument("--vault", default="/Users/speed/Documents/Obsidian Vault", 
                       help="Path to Obsidian vault")
    parser.add_argument("--backup-root", default="/Users/speed/Documents/Obsidian Vault Backups",
                       help="Root directory for backups")
    
    subparsers = parser.add_subparsers(dest="command", help="Available commands")
    
    # Backup command
    backup_parser = subparsers.add_parser("backup", help="Create a backup")
    backup_parser.add_argument("--type", default="manual", 
                              choices=["manual", "incremental", "full"],
                              help="Type of backup to create")
    
    # List command
    subparsers.add_parser("list", help="List all backups")
    
    # Verify command
    verify_parser = subparsers.add_parser("verify", help="Verify backup integrity")
    verify_parser.add_argument("backup_id", type=int, help="Backup ID to verify")
    
    # Restore command
    restore_parser = subparsers.add_parser("restore", help="Restore a backup")
    restore_parser.add_argument("backup_id", type=int, help="Backup ID to restore")
    restore_parser.add_argument("--destination", required=True, help="Restore destination")
    
    # Cleanup command
    subparsers.add_parser("cleanup", help="Clean up old backups")
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return
    
    backup_system = SmartBackup(args.vault, args.backup_root)
    
    if args.command == "backup":
        result = backup_system.create_backup(args.type)
        print(f"Backup created with ID: {result['id']}")
        
    elif args.command == "list":
        backups = backup_system.list_backups()
        print("\n📋 Available Backups:")
        print("-" * 80)
        for backup in backups:
            status = "✅" if backup["exists"] else "❌"
            print(f"{status} ID: {backup['id']} | {backup['timestamp']} | {backup['type']}")
            print(f"    Files: {backup['file_count']} | Size: {backup['compressed_size_mb']} MB")
            print(f"    Path: {backup['path']}")
            print()
            
    elif args.command == "verify":
        backup_system.verify_backup(args.backup_id)
        
    elif args.command == "restore":
        backup_system.restore_backup(args.backup_id, args.destination)
        
    elif args.command == "cleanup":
        backup_system.cleanup_old_backups()

if __name__ == "__main__":
    main()