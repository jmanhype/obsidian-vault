#!/bin/bash

# Task Master to Obsidian Kanban Sync Script
# Monitors Task Master tasks and syncs them to Obsidian Kanban format

# Configuration
OBSIDIAN_VAULT="/Users/speed/Documents/Obsidian Vault"
KANBAN_FILE="$OBSIDIAN_VAULT/Kanban/TaskMaster Board.md"
TASKMASTER_DIR="$OBSIDIAN_VAULT/.taskmaster"
TASKS_FILE="$TASKMASTER_DIR/tasks/tasks.json"

# Create Kanban directory if it doesn't exist
mkdir -p "$OBSIDIAN_VAULT/Kanban"

# Function to convert Task Master tasks to Kanban format
sync_tasks_to_kanban() {
    echo "Syncing Task Master tasks to Obsidian Kanban..."
    
    # Initialize Kanban file with header if it doesn't exist
    if [ ! -f "$KANBAN_FILE" ]; then
        cat > "$KANBAN_FILE" << 'EOF'
---
kanban-plugin: board
---

## Backlog

## In Progress

## Review

## Done

%% kanban:settings
```
{
  "kanban-plugin": "board",
  "list-collapse": [false, false, false, false],
  "lane-width": 300,
  "hide-tags": false,
  "date-format": "YYYY-MM-DD",
  "time-format": "HH:mm",
  "link-date-to-daily-note": true
}
```
%%
EOF
    fi
    
    # Check if tasks file exists
    if [ ! -f "$TASKS_FILE" ]; then
        echo "No tasks file found. Initialize Task Master first."
        return
    fi
    
    # Parse tasks and update Kanban (using Python for JSON parsing)
    python3 << 'PYTHON_SCRIPT'
import json
import re
import os

tasks_file = "/Users/speed/Documents/Obsidian Vault/.taskmaster/tasks/tasks.json"
kanban_file = "/Users/speed/Documents/Obsidian Vault/Kanban/TaskMaster Board.md"

try:
    # Read tasks
    with open(tasks_file, 'r') as f:
        data = json.load(f)
        # TaskMaster stores tasks under a tag key (e.g., "master")
        # Get tasks from the first available tag
        if 'tasks' in data:
            tasks = data.get('tasks', [])
        else:
            # Get tasks from the first tag (usually "master")
            for tag_key in data:
                if isinstance(data[tag_key], dict) and 'tasks' in data[tag_key]:
                    tasks = data[tag_key]['tasks']
                    break
            else:
                tasks = []
    
    # Read current kanban
    with open(kanban_file, 'r') as f:
        kanban_content = f.read()
    
    # Clear existing task entries (between headers)
    kanban_lines = kanban_content.split('\n')
    new_lines = []
    current_section = None
    
    for line in kanban_lines:
        if line.startswith('## '):
            current_section = line
            new_lines.append(line)
            new_lines.append('')  # Empty line after header
        elif line.startswith('%%') or 'kanban:settings' in line or line.startswith('```'):
            new_lines.append(line)
        elif current_section and not line.startswith('- [ ]'):
            if line.strip():  # Keep non-task content
                new_lines.append(line)
    
    # Group tasks by status
    backlog_tasks = []
    in_progress_tasks = []
    review_tasks = []
    done_tasks = []
    
    for task in tasks:
        task_id = task.get('id', 'N/A')
        title = task.get('title', 'Untitled')
        status = task.get('status', 'pending')
        priority = task.get('priority', 'medium')
        
        # Format task for Kanban
        task_line = f"- [ ] **Task {task_id}**: {title} `{priority}`"
        
        # Sort into appropriate column
        if status in ['completed', 'done']:
            done_tasks.append(f"- [x] **Task {task_id}**: {title} `{priority}`")
        elif status in ['in-progress', 'in_progress', 'active']:
            in_progress_tasks.append(task_line)
        elif status in ['review', 'testing']:
            review_tasks.append(task_line)
        else:
            backlog_tasks.append(task_line)
    
    # Rebuild kanban content
    final_lines = []
    for line in new_lines:
        final_lines.append(line)
        
        if line == '## Backlog':
            for task in backlog_tasks:
                final_lines.append(task)
            if backlog_tasks:
                final_lines.append('')
                
        elif line == '## In Progress':
            for task in in_progress_tasks:
                final_lines.append(task)
            if in_progress_tasks:
                final_lines.append('')
                
        elif line == '## Review':
            for task in review_tasks:
                final_lines.append(task)
            if review_tasks:
                final_lines.append('')
                
        elif line == '## Done':
            for task in done_tasks:
                final_lines.append(task)
            if done_tasks:
                final_lines.append('')
    
    # Write updated kanban
    with open(kanban_file, 'w') as f:
        f.write('\n'.join(final_lines))
    
    print(f"✅ Synced {len(tasks)} tasks to Obsidian Kanban")
    
except FileNotFoundError:
    print("Tasks file not found. Initialize Task Master first.")
except json.JSONDecodeError:
    print("Error parsing tasks file.")
except Exception as e:
    print(f"Error: {e}")
PYTHON_SCRIPT
}

# Function to watch for changes
watch_for_changes() {
    echo "Watching Task Master for changes..."
    
    # Initial sync
    sync_tasks_to_kanban
    
    # Watch for changes (works on macOS with fswatch, Linux with inotifywait)
    if command -v fswatch &> /dev/null; then
        # macOS
        fswatch -o "$TASKMASTER_DIR" | while read change; do
            sync_tasks_to_kanban
        done
    elif command -v inotifywait &> /dev/null; then
        # Linux
        while inotifywait -e modify,create "$TASKMASTER_DIR"; do
            sync_tasks_to_kanban
        done
    else
        # Fallback: poll every 5 seconds
        while true; do
            sync_tasks_to_kanban
            sleep 5
        done
    fi
}

# Main execution
case "${1:-}" in
    sync)
        sync_tasks_to_kanban
        ;;
    watch)
        watch_for_changes
        ;;
    *)
        echo "Task Master to Obsidian Kanban Sync"
        echo "Usage: $0 [sync|watch]"
        echo "  sync  - Sync once and exit"
        echo "  watch - Continuously watch for changes"
        echo ""
        echo "Running in watch mode..."
        watch_for_changes
        ;;
esac