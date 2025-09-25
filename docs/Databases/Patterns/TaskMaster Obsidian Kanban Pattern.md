---
type: pattern
category: workflow-automation
entropy: low
language_agnostic: false
tags: [pattern, taskmaster, obsidian, kanban, automation]
use_cases: [project-management, task-tracking, ai-workflow]
date_documented: 2025-01-22
gif: https://media.giphy.com/media/l0HlPwMAzh13pcZ20/giphy.gif
gif_alt: Tasks flowing between kanban columns
---

# TaskMaster + Obsidian Kanban Integration Pattern

![Tasks flowing between kanban columns](https://media.giphy.com/media/l0HlPwMAzh13pcZ20/giphy.gif)

## Intent
Create a visual project management system where Task Master AI tasks automatically sync to Obsidian Kanban boards.

## The Complete Stack
1. **Claude Code** - AI orchestrator
2. **Task Master MCP** - Task generation and management
3. **Sync Script** - Bridges Task Master to Obsidian
4. **Obsidian Kanban Plugin** - Visual task board

## Implementation

### 1. Install Obsidian Kanban Plugin
In Obsidian: Settings → Community Plugins → Search "Kanban" → Install

### 2. Run the Sync Script
```bash
# One-time sync
~/Documents/Obsidian\ Vault/Scripts/taskmaster-obsidian-sync.sh sync

# Continuous monitoring (recommended)
~/Documents/Obsidian\ Vault/Scripts/taskmaster-obsidian-sync.sh watch
```

### 3. Open Kanban in Obsidian
Navigate to: `Kanban/TaskMaster Board.md`

## Workflow

1. **In Claude Code**: "Parse my PRD and generate tasks"
2. **Script detects changes** → Syncs to Obsidian
3. **Obsidian Kanban** → Shows visual board
4. **Work on tasks**: "Help me implement task 3"
5. **Status updates** → Auto-reflected in Kanban

## Benefits
- **Visual Progress** - See all tasks at a glance
- **Auto-sync** - No manual updates needed
- **Obsidian Power** - Link tasks to notes, docs, research
- **PM Paradise** - Full project visibility

## Script Features
- Monitors `~/.taskmaster/tasks.json`
- Maps Task Master statuses to Kanban columns
- Preserves task IDs and priorities
- Supports macOS (fswatch) and Linux (inotify)

## Column Mapping
```
Task Master Status → Kanban Column
pending/backlog    → Backlog
in_progress/active → In Progress
review/testing     → Review
completed/done     → Done
```

## Advanced: Run as Background Service

### macOS (launchd)
Create `~/Library/LaunchAgents/com.taskmaster.sync.plist`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" 
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.taskmaster.sync</string>
    <key>ProgramArguments</key>
    <array>
        <string>/Users/speed/Documents/Obsidian Vault/Scripts/taskmaster-obsidian-sync.sh</string>
        <string>watch</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
</dict>
</plist>
```

Then: `launchctl load ~/Library/LaunchAgents/com.taskmaster.sync.plist`

## Related Patterns
- [[Natural Language Container Control Pattern]]
- [[MCP Server Configuration]]
- [[Obsidian as Development Hub]]