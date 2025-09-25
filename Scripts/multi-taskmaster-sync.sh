#!/bin/bash

# Multi-Database Task Master to Obsidian Kanban Sync Script
# Monitors multiple TaskMaster instances and syncs them to separate Kanban boards

# Configuration
OBSIDIAN_VAULT="/Users/speed/Documents/Obsidian Vault"
KANBAN_DIR="$OBSIDIAN_VAULT/Kanban"

# Database configurations
declare -A DATABASES=(
    ["Projects"]="$OBSIDIAN_VAULT/Databases/Projects"
    ["Knowledge_Base"]="$OBSIDIAN_VAULT/Databases/Knowledge Base"
    ["Patterns"]="$OBSIDIAN_VAULT/Databases/Patterns"
    ["Principles"]="$OBSIDIAN_VAULT/Databases/Principles"
    ["Laws"]="$OBSIDIAN_VAULT/Databases/Laws"
    ["Reading_List"]="$OBSIDIAN_VAULT/Databases/Reading List"
    ["Main"]="$OBSIDIAN_VAULT"
)

# Create Kanban directory if it doesn't exist
mkdir -p "$KANBAN_DIR"

# Function to sync a single database's tasks to its Kanban
sync_database_to_kanban() {
    local db_name=$1
    local db_path=$2
    local kanban_file="$KANBAN_DIR/${db_name} Tasks.md"
    local tasks_file="$db_path/.taskmaster/tasks/tasks.json"
    
    echo "Syncing $db_name tasks to Kanban..."
    
    # Check if tasks file exists
    if [ ! -f "$tasks_file" ]; then
        echo "  No tasks file found for $db_name. Skipping."
        return
    fi
    
    # Initialize Kanban file if it doesn't exist
    if [ ! -f "$kanban_file" ]; then
        cat > "$kanban_file" << EOF
---
kanban-plugin: board
---

## Backlog

## In Progress

## Review

## Done

%% kanban:settings
\`\`\`
{
  "kanban-plugin": "board",
  "list-collapse": [false, false, false, false],
  "lane-width": 300,
  "hide-tags": false,
  "date-format": "YYYY-MM-DD",
  "time-format": "HH:mm",
  "link-date-to-daily-note": true
}
\`\`\`
%%
EOF
    fi
    
    # Parse tasks and update Kanban using Python
    python3 << PYTHON_SCRIPT
import json
import os

db_name = "$db_name"
tasks_file = "$tasks_file"
kanban_file = "$kanban_file"

try:
    # Read tasks
    with open(tasks_file, 'r') as f:
        data = json.load(f)
        # TaskMaster stores tasks under a tag key (e.g., "master")
        if 'tasks' in data:
            tasks = data.get('tasks', [])
        else:
            # Get tasks from the first tag
            for tag_key in data:
                if isinstance(data[tag_key], dict) and 'tasks' in data[tag_key]:
                    tasks = data[tag_key]['tasks']
                    break
            else:
                tasks = []
    
    # Read current kanban
    with open(kanban_file, 'r') as f:
        kanban_content = f.read()
    
    # Clear existing task entries
    kanban_lines = kanban_content.split('\n')
    new_lines = []
    current_section = None
    
    for line in kanban_lines:
        if line.startswith('## '):
            current_section = line
            new_lines.append(line)
            new_lines.append('')  # Empty line after header
        elif line.startswith('%%') or 'kanban:settings' in line or line.startswith('\`\`\`'):
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
        
        # Format task for table view with metadata
        description = task.get('description', '')
        details = task.get('details', '')
        dependencies = task.get('dependencies', [])
        
        # Create task content with metadata tags and fields
        card_content = []
        card_content.append(f"- [ ] **Task #{task_id}** - {title}")
        card_content.append(f"  @priority({priority})")
        card_content.append(f"  @id({task_id})")
        if dependencies:
            deps_str = ', '.join(str(d) for d in dependencies)
            card_content.append(f"  @depends-on({deps_str})")
        card_content.append(f"  **Status:** {status}")
        if description:
            card_content.append(f"  **Description:** {description}")
        card_content.append(f"  **Created:** [[{db_name} Tasks]]")
        card_content.append("")  # Empty line between tasks
        
        task_card = "\\n".join(card_content)
        
        # Sort into appropriate column
        if status in ['completed', 'done']:
            done_card = []
            done_card.append(f"- [x] **Task #{task_id}** - {title}")
            done_card.append(f"  @priority({priority})")
            done_card.append(f"  @id({task_id})")
            if dependencies:
                deps_str = ', '.join(str(d) for d in dependencies)
                done_card.append(f"  @depends-on({deps_str})")
            done_card.append(f"  **Status:** completed ✅")
            if description:
                done_card.append(f"  **Description:** {description}")
            done_card.append(f"  **Created:** [[{db_name} Tasks]]")
            done_card.append("")
            done_tasks.append("\\n".join(done_card))
        elif status in ['in-progress', 'active']:
            in_progress_tasks.append(task_card)
        elif status in ['review', 'testing']:
            review_tasks.append(task_card)
        else:
            backlog_tasks.append(task_card)
    
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
    
    print(f"  ✅ Synced {len(tasks)} tasks for {db_name}")
    
except FileNotFoundError:
    print(f"  Tasks file not found for {db_name}")
except json.JSONDecodeError:
    print(f"  Error parsing tasks file for {db_name}")
except Exception as e:
    print(f"  Error for {db_name}: {e}")
PYTHON_SCRIPT
}

# Function to sync all databases
sync_all_databases() {
    echo "=== Syncing all TaskMaster databases to Kanban boards ==="
    echo "Time: $(date)"
    echo ""
    
    for db_name in "${!DATABASES[@]}"; do
        sync_database_to_kanban "$db_name" "${DATABASES[$db_name]}"
    done
    
    echo ""
    echo "=== Sync complete ==="
    echo ""
}

# Function to watch for changes
watch_for_changes() {
    echo "Watching all TaskMaster databases for changes..."
    
    # Initial sync
    sync_all_databases
    
    # Build list of directories to watch
    WATCH_DIRS=""
    for db_path in "${DATABASES[@]}"; do
        if [ -d "$db_path/.taskmaster" ]; then
            WATCH_DIRS="$WATCH_DIRS $db_path/.taskmaster"
        fi
    done
    
    if [ -z "$WATCH_DIRS" ]; then
        echo "No TaskMaster directories found to watch."
        exit 1
    fi
    
    # Watch for changes
    if command -v fswatch &> /dev/null; then
        # macOS
        fswatch -o $WATCH_DIRS | while read change; do
            sync_all_databases
        done
    elif command -v inotifywait &> /dev/null; then
        # Linux
        while inotifywait -r -e modify,create $WATCH_DIRS; do
            sync_all_databases
        done
    else
        # Fallback: poll every 10 seconds
        while true; do
            sync_all_databases
            sleep 10
        done
    fi
}

# Main execution
case "${1:-}" in
    sync)
        sync_all_databases
        ;;
    watch)
        watch_for_changes
        ;;
    list)
        echo "Configured databases:"
        for db_name in "${!DATABASES[@]}"; do
            echo "  - $db_name: ${DATABASES[$db_name]}"
        done
        ;;
    *)
        echo "Multi-Database Task Master to Obsidian Kanban Sync"
        echo "Usage: $0 [sync|watch|list]"
        echo "  sync  - Sync all databases once and exit"
        echo "  watch - Continuously watch for changes"
        echo "  list  - List configured databases"
        echo ""
        echo "Running in watch mode..."
        watch_for_changes
        ;;
esac