# Claude Flow - Database Schemas and Memory Management

## Overview
Claude Flow employs a sophisticated dual-schema SQLite database architecture that provides both core swarm coordination capabilities and extended functionality for comprehensive memory management. This document analyzes both schemas and their integration patterns.

## Core Schema Analysis (`hive-mind-schema.sql`)

### Primary Tables Structure

#### 1. Swarms Table
**Purpose**: Core swarm configurations and metadata

```sql
CREATE TABLE IF NOT EXISTS swarms (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    topology TEXT NOT NULL CHECK (topology IN ('mesh', 'hierarchical', 'ring', 'star')),
    queen_mode TEXT NOT NULL CHECK (queen_mode IN ('centralized', 'distributed')),
    max_agents INTEGER NOT NULL DEFAULT 8,
    consensus_threshold REAL NOT NULL DEFAULT 0.66,
    memory_ttl INTEGER NOT NULL DEFAULT 86400,
    config TEXT NOT NULL, -- JSON configuration
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived'))
);
```

**Key Features**:
- Enforced topology constraints via CHECK constraints
- Configurable consensus thresholds (default 66%)
- JSON configuration storage for flexibility
- Automatic timestamp management
- Status lifecycle tracking

#### 2. Agents Table
**Purpose**: Individual agent instances and state management

```sql
CREATE TABLE IF NOT EXISTS agents (
    id TEXT PRIMARY KEY,
    swarm_id TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN (
        'coordinator', 'researcher', 'coder', 'analyst', 'architect',
        'tester', 'reviewer', 'optimizer', 'documenter', 'monitor', 'specialist'
    )),
    status TEXT NOT NULL DEFAULT 'idle' CHECK (status IN ('idle', 'busy', 'active', 'error', 'offline')),
    capabilities TEXT NOT NULL, -- JSON array of capabilities
    current_task_id TEXT,
    message_count INTEGER NOT NULL DEFAULT 0,
    error_count INTEGER NOT NULL DEFAULT 0,
    success_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_active_at TIMESTAMP,
    metadata TEXT, -- JSON metadata
    FOREIGN KEY (swarm_id) REFERENCES swarms(id) ON DELETE CASCADE,
    FOREIGN KEY (current_task_id) REFERENCES tasks(id) ON DELETE SET NULL
);
```

**Agent Specialization Types**:
- **Coordinator**: Planning and orchestration
- **Researcher**: Information gathering
- **Coder**: Implementation and development
- **Analyst**: Data analysis and insights
- **Architect**: System design and structure
- **Tester**: Quality assurance
- **Reviewer**: Code and output evaluation
- **Optimizer**: Performance improvements
- **Documenter**: Documentation generation
- **Monitor**: System health tracking
- **Specialist**: Domain expertise

#### 3. Tasks Table
**Purpose**: Work items with dependencies and execution tracking

```sql
CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    swarm_id TEXT NOT NULL,
    description TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    strategy TEXT NOT NULL DEFAULT 'adaptive' CHECK (strategy IN ('parallel', 'sequential', 'adaptive', 'consensus')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_progress', 'completed', 'failed', 'cancelled')),
    progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    result TEXT, -- JSON result data
    error TEXT,
    dependencies TEXT, -- JSON array of task IDs
    assigned_agents TEXT, -- JSON array of agent IDs
    require_consensus BOOLEAN NOT NULL DEFAULT 0,
    consensus_achieved BOOLEAN,
    max_agents INTEGER NOT NULL DEFAULT 3,
    required_capabilities TEXT, -- JSON array
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    assigned_at TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    metadata TEXT, -- JSON metadata
    FOREIGN KEY (swarm_id) REFERENCES swarms(id) ON DELETE CASCADE
);
```

**Task Execution Strategies**:
- **Parallel**: Simultaneous execution across agents
- **Sequential**: Step-by-step execution
- **Adaptive**: Dynamic strategy selection
- **Consensus**: Requires democratic agreement

#### 4. Memory Table
**Purpose**: Persistent collective knowledge storage

```sql
CREATE TABLE IF NOT EXISTS memory (
    key TEXT NOT NULL,
    namespace TEXT NOT NULL DEFAULT 'default',
    value TEXT NOT NULL, -- JSON or plain text
    ttl INTEGER, -- Time to live in seconds
    access_count INTEGER NOT NULL DEFAULT 0,
    last_accessed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    metadata TEXT, -- JSON metadata
    PRIMARY KEY (key, namespace)
);
```

**Memory Features**:
- Namespaced key-value storage
- TTL-based automatic expiration
- Access tracking and statistics
- Flexible value storage (JSON/text)

#### 5. Communications Table
**Purpose**: Inter-agent messaging system

```sql
CREATE TABLE IF NOT EXISTS communications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_agent_id TEXT NOT NULL,
    to_agent_id TEXT,
    swarm_id TEXT NOT NULL,
    message_type TEXT NOT NULL CHECK (message_type IN ('direct', 'broadcast', 'consensus', 'query', 'response', 'notification')),
    content TEXT NOT NULL, -- JSON message content
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    requires_response BOOLEAN NOT NULL DEFAULT 0,
    response_to_id INTEGER,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delivered_at TIMESTAMP,
    read_at TIMESTAMP,
    metadata TEXT, -- JSON metadata
    FOREIGN KEY (from_agent_id) REFERENCES agents(id) ON DELETE CASCADE,
    FOREIGN KEY (to_agent_id) REFERENCES agents(id) ON DELETE CASCADE,
    FOREIGN KEY (swarm_id) REFERENCES swarms(id) ON DELETE CASCADE,
    FOREIGN KEY (response_to_id) REFERENCES communications(id) ON DELETE SET NULL
);
```

**Message Types**:
- **Direct**: Point-to-point communication
- **Broadcast**: One-to-many messaging
- **Consensus**: Voting and decision messages
- **Query**: Information requests
- **Response**: Query answers
- **Notification**: Status updates

#### 6. Consensus Table
**Purpose**: Democratic decision tracking and voting

```sql
CREATE TABLE IF NOT EXISTS consensus (
    id TEXT PRIMARY KEY,
    swarm_id TEXT NOT NULL,
    task_id TEXT,
    proposal TEXT NOT NULL, -- JSON proposal
    required_threshold REAL NOT NULL,
    current_votes INTEGER NOT NULL DEFAULT 0,
    total_voters INTEGER NOT NULL DEFAULT 0,
    votes TEXT NOT NULL DEFAULT '{}', -- JSON object: {agent_id: {vote: boolean, reason: string}}
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'achieved', 'failed', 'timeout')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deadline_at TIMESTAMP,
    completed_at TIMESTAMP,
    FOREIGN KEY (swarm_id) REFERENCES swarms(id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);
```

### Advanced Tables

#### 7. Performance Metrics
**Purpose**: System performance tracking

```sql
CREATE TABLE IF NOT EXISTS performance_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    swarm_id TEXT NOT NULL,
    agent_id TEXT,
    metric_type TEXT NOT NULL,
    metric_value REAL NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    metadata TEXT, -- JSON metadata
    FOREIGN KEY (swarm_id) REFERENCES swarms(id) ON DELETE CASCADE,
    FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
);
```

#### 8. Neural Patterns
**Purpose**: Learned behaviors and optimization patterns

```sql
CREATE TABLE IF NOT EXISTS neural_patterns (
    id TEXT PRIMARY KEY,
    swarm_id TEXT NOT NULL,
    pattern_type TEXT NOT NULL CHECK (pattern_type IN ('coordination', 'optimization', 'prediction', 'behavior')),
    pattern_data TEXT NOT NULL, -- JSON encoded pattern
    confidence REAL NOT NULL DEFAULT 0.0,
    usage_count INTEGER NOT NULL DEFAULT 0,
    success_rate REAL NOT NULL DEFAULT 0.0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP,
    metadata TEXT, -- JSON metadata
    FOREIGN KEY (swarm_id) REFERENCES swarms(id) ON DELETE CASCADE
);
```

#### 9. Session History
**Purpose**: Historical swarm session tracking

```sql
CREATE TABLE IF NOT EXISTS session_history (
    id TEXT PRIMARY KEY,
    swarm_id TEXT NOT NULL,
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    tasks_completed INTEGER NOT NULL DEFAULT 0,
    tasks_failed INTEGER NOT NULL DEFAULT 0,
    total_messages INTEGER NOT NULL DEFAULT 0,
    avg_task_duration REAL,
    session_data TEXT, -- JSON session summary
    FOREIGN KEY (swarm_id) REFERENCES swarms(id) ON DELETE CASCADE
);
```

### Database Views and Optimization

#### Core Views

```sql
-- Active swarms with agent and task counts
CREATE VIEW IF NOT EXISTS active_swarms AS
SELECT s.*, 
       COUNT(DISTINCT a.id) as agent_count,
       COUNT(DISTINCT t.id) as task_count
FROM swarms s
LEFT JOIN agents a ON s.id = a.swarm_id AND a.status != 'offline'
LEFT JOIN tasks t ON s.id = t.swarm_id AND t.status IN ('pending', 'assigned', 'in_progress')
WHERE s.status = 'active'
GROUP BY s.id;

-- Agent workload analysis
CREATE VIEW IF NOT EXISTS agent_workload AS
SELECT a.*,
       COUNT(DISTINCT t.id) as assigned_tasks,
       AVG(t.progress) as avg_task_progress
FROM agents a
LEFT JOIN tasks t ON t.assigned_agents LIKE '%' || a.id || '%' AND t.status = 'in_progress'
GROUP BY a.id;

-- Task overview with swarm context
CREATE VIEW IF NOT EXISTS task_overview AS
SELECT t.*,
       s.name as swarm_name,
       COUNT(DISTINCT a.id) as assigned_agent_count
FROM tasks t
JOIN swarms s ON t.swarm_id = s.id
LEFT JOIN agents a ON t.assigned_agents LIKE '%' || a.id || '%'
GROUP BY t.id;
```

#### Performance Indexes

```sql
-- Agent-focused indexes
CREATE INDEX idx_agents_swarm ON agents(swarm_id);
CREATE INDEX idx_agents_status ON agents(status);
CREATE INDEX idx_agents_type ON agents(type);

-- Task-focused indexes
CREATE INDEX idx_tasks_swarm ON tasks(swarm_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);

-- Memory-focused indexes
CREATE INDEX idx_memory_namespace ON memory(namespace);
CREATE INDEX idx_memory_expires ON memory(expires_at);

-- Communication-focused indexes
CREATE INDEX idx_communications_swarm ON communications(swarm_id);
CREATE INDEX idx_communications_timestamp ON communications(timestamp);
CREATE INDEX idx_communications_from ON communications(from_agent_id);
CREATE INDEX idx_communications_to ON communications(to_agent_id);
```

#### Database Triggers

```sql
-- Automatic timestamp updates
CREATE TRIGGER update_swarms_timestamp 
AFTER UPDATE ON swarms
BEGIN
    UPDATE swarms SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Memory TTL management
CREATE TRIGGER set_memory_expiry
AFTER INSERT ON memory
WHEN NEW.ttl IS NOT NULL
BEGIN
    UPDATE memory 
    SET expires_at = datetime(CURRENT_TIMESTAMP, '+' || NEW.ttl || ' seconds')
    WHERE key = NEW.key AND namespace = NEW.namespace;
END;

-- Agent activity tracking
CREATE TRIGGER update_agent_activity
AFTER UPDATE OF status ON agents
BEGIN
    UPDATE agents SET last_active_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
```

## Enhanced Schema Analysis (`enhanced-schema.sql`)

### Extended Functionality Tables

#### 1. Session State Management

```sql
CREATE TABLE IF NOT EXISTS session_state (
    session_id TEXT PRIMARY KEY,
    user_id TEXT,
    project_path TEXT,
    active_branch TEXT,
    last_activity INTEGER,
    state TEXT, -- active, paused, completed
    context TEXT, -- JSON with current task, open files, cursor positions
    environment TEXT -- JSON with env vars, tool versions
);
```

**Features**:
- Resumable work sessions
- Git branch tracking
- IDE context preservation
- Environment state capture

#### 2. MCP Tool Usage Analytics

```sql
CREATE TABLE IF NOT EXISTS mcp_tool_usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tool_name TEXT NOT NULL,
    session_id TEXT,
    timestamp INTEGER DEFAULT (strftime('%s', 'now')),
    arguments TEXT, -- JSON
    result_summary TEXT,
    execution_time_ms INTEGER,
    success BOOLEAN,
    error_message TEXT
);
```

**Analytics Capabilities**:
- Tool effectiveness measurement
- Performance profiling
- Error pattern analysis
- Usage frequency tracking

#### 3. Training Data Collection

```sql
CREATE TABLE IF NOT EXISTS training_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pattern_type TEXT, -- code_style, error_fix, refactor, etc
    input_context TEXT,
    action_taken TEXT,
    outcome TEXT,
    success_score REAL,
    timestamp INTEGER DEFAULT (strftime('%s', 'now')),
    model_version TEXT,
    feedback TEXT -- user feedback if provided
);
```

**Learning Capabilities**:
- Pattern recognition training
- Success/failure correlation
- Model versioning support
- User feedback integration

#### 4. Code Pattern Recognition

```sql
CREATE TABLE IF NOT EXISTS code_patterns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_path TEXT,
    pattern_name TEXT,
    pattern_content TEXT,
    language TEXT,
    frequency INTEGER DEFAULT 1,
    last_used INTEGER,
    effectiveness_score REAL,
    UNIQUE(file_path, pattern_name)
);
```

**Pattern Management**:
- File-specific pattern tracking
- Language-aware categorization
- Usage frequency analysis
- Effectiveness scoring

#### 5. Agent Interaction History

```sql
CREATE TABLE IF NOT EXISTS agent_interactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_agent TEXT,
    target_agent TEXT,
    message_type TEXT, -- request, response, broadcast
    content TEXT,
    task_id TEXT,
    timestamp INTEGER DEFAULT (strftime('%s', 'now')),
    correlation_id TEXT
);
```

**Interaction Analysis**:
- Communication pattern tracking
- Agent collaboration metrics
- Task correlation analysis
- Message flow visualization

#### 6. Knowledge Graph

```sql
CREATE TABLE IF NOT EXISTS knowledge_graph (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_type TEXT, -- file, function, class, module, concept
    entity_name TEXT,
    entity_path TEXT,
    relationships TEXT, -- JSON array of related entities
    metadata TEXT, -- JSON with additional info
    embedding BLOB, -- Vector embedding for similarity search
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);
```

**Knowledge Features**:
- Entity relationship mapping
- Vector similarity search
- Semantic understanding
- Dynamic relationship discovery

#### 7. Error Pattern Learning

```sql
CREATE TABLE IF NOT EXISTS error_patterns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    error_type TEXT,
    error_message TEXT,
    stack_trace TEXT,
    context TEXT, -- What was being attempted
    resolution TEXT, -- How it was fixed
    prevention_strategy TEXT,
    occurrence_count INTEGER DEFAULT 1,
    last_seen INTEGER DEFAULT (strftime('%s', 'now')),
    UNIQUE(error_type, error_message)
);
```

**Error Intelligence**:
- Automatic error classification
- Resolution tracking
- Prevention strategy learning
- Occurrence frequency analysis

#### 8. Task Dependencies

```sql
CREATE TABLE IF NOT EXISTS task_dependencies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id TEXT,
    depends_on TEXT, -- task_id of dependency
    dependency_type TEXT, -- blocking, optional, parallel
    status TEXT, -- pending, satisfied, failed
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
);
```

**Dependency Management**:
- Complex workflow orchestration
- Dependency type classification
- Status tracking and resolution
- Deadlock detection support

#### 9. Performance Benchmarks

```sql
CREATE TABLE IF NOT EXISTS performance_benchmarks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    operation_type TEXT,
    operation_details TEXT,
    duration_ms INTEGER,
    memory_used_mb REAL,
    cpu_percent REAL,
    timestamp INTEGER DEFAULT (strftime('%s', 'now')),
    session_id TEXT,
    optimization_applied TEXT
);
```

**Performance Intelligence**:
- Operation profiling
- Resource usage tracking
- Optimization effectiveness
- Performance trend analysis

#### 10. User Preferences Learning

```sql
CREATE TABLE IF NOT EXISTS user_preferences (
    preference_key TEXT PRIMARY KEY,
    preference_value TEXT,
    category TEXT, -- coding_style, tool_usage, communication
    learned_from TEXT, -- explicit, inferred
    confidence_score REAL,
    last_updated INTEGER DEFAULT (strftime('%s', 'now'))
);
```

**Personalization Features**:
- Automatic preference detection
- Confidence-based recommendations
- Category-based organization
- Learning source tracking

### Enhanced Views and Analytics

```sql
-- Active session tracking
CREATE VIEW IF NOT EXISTS active_sessions AS
SELECT * FROM session_state 
WHERE state = 'active' 
ORDER BY last_activity DESC;

-- Error frequency analysis
CREATE VIEW IF NOT EXISTS frequent_errors AS
SELECT error_type, error_message, occurrence_count, resolution
FROM error_patterns
WHERE occurrence_count > 1
ORDER BY occurrence_count DESC;

-- Tool effectiveness metrics
CREATE VIEW IF NOT EXISTS tool_effectiveness AS
SELECT tool_name, 
       COUNT(*) as usage_count,
       AVG(CASE WHEN success THEN 1 ELSE 0 END) * 100 as success_rate,
       AVG(execution_time_ms) as avg_time_ms
FROM mcp_tool_usage
GROUP BY tool_name;
```

## Memory Management Patterns

### TTL-Based Expiration

The system implements automatic memory cleanup:

```sql
-- Automatic expiration calculation
CREATE TRIGGER set_memory_expiry
AFTER INSERT ON memory
WHEN NEW.ttl IS NOT NULL
BEGIN
    UPDATE memory 
    SET expires_at = datetime(CURRENT_TIMESTAMP, '+' || NEW.ttl || ' seconds')
    WHERE key = NEW.key AND namespace = NEW.namespace;
END;
```

### Namespace Organization

Memory is organized into logical namespaces:
- `default`: General purpose storage
- `session`: Session-specific data
- `agent`: Agent-private memory
- `swarm`: Swarm-shared information
- `system`: System configuration
- `neural`: Learning and pattern data

### Access Pattern Tracking

The system tracks memory usage patterns:
- Access frequency counting
- Last accessed timestamps
- Usage pattern analysis
- Cache optimization opportunities

## Data Integrity and Constraints

### Foreign Key Enforcement

```sql
PRAGMA foreign_keys = ON;
```

All tables use appropriate foreign key constraints to ensure referential integrity.

### CHECK Constraints

Extensive use of CHECK constraints for data validation:
- Enumerated status values
- Priority levels
- Progress percentage bounds
- Topology type validation

### Unique Constraints

Strategic unique constraints prevent data duplication:
- Compound keys for namespaced storage
- File path + pattern name uniqueness
- Error type + message combinations

## Performance Optimization

### Index Strategy

Comprehensive indexing on:
- Foreign key columns
- Status and type fields
- Timestamp columns for temporal queries
- Text columns for search operations

### Query Optimization

Pre-built views for common query patterns:
- Agent workload analysis
- Active system components
- Performance metrics aggregation
- Error frequency analysis

## Backup and Recovery

### Schema Versioning

The system includes version tracking:

```sql
INSERT OR IGNORE INTO memory (key, namespace, value) VALUES 
    ('system.version', 'hive-mind', '2.0.0'),
    ('system.initialized', 'hive-mind', datetime('now'));
```

### Data Migration Support

The schema design supports incremental updates and migrations through:
- Nullable columns for backward compatibility
- Default values for new fields
- Extensible JSON metadata columns

## Integration Patterns

### Cross-Schema Queries

The dual schema approach enables:
- Core functionality isolation
- Enhanced feature layering
- Performance optimization through separation
- Independent backup and recovery

### JSON Data Handling

Extensive use of JSON columns for:
- Configuration flexibility
- Metadata extensibility
- Complex relationship storage
- Dynamic schema evolution

## Conclusion

Claude Flow's database architecture demonstrates sophisticated design principles:

1. **Separation of Concerns**: Core vs enhanced schemas
2. **Data Integrity**: Comprehensive constraints and triggers
3. **Performance**: Strategic indexing and view optimization
4. **Flexibility**: JSON storage for extensibility
5. **Intelligence**: Learning and pattern recognition support
6. **Scalability**: Efficient query patterns and resource management

The dual-schema approach provides both reliability for core operations and extensibility for advanced features, making it a robust foundation for complex swarm intelligence operations.

## Related

### Vault Documentation
- [[Claude Flow - Master Architecture Documentation]] - Complete system architecture
- [[Claude Flow - Dynamic Agent Architecture (DAA) Deep Dive]] - Agent lifecycle and patterns
- [[Claude Flow - Neural Integration and Learning Patterns]] - Neural learning system
- [[Claude Flow v2.0.0 - Complete Command Reference]] - CLI commands and usage
- [[Claude Flow Tmux Integration - Complete Swarm Automation]] - Persistent operations

### Database & Storage Patterns
- [[DSPy Production Stack - Field-Tested Architecture Patterns]] - Production data patterns
- [[Automagik Hive Architecture and Apollo MCP Synergy - Real Deal Implementation]] - Alternative storage architectures
- [[Apollo Dagger MCP Integration]] - Container-based data management

### External Resources
- [SQLite Documentation](https://www.sqlite.org/docs.html) - Official SQLite documentation
- [SQLite JSON1 Extension](https://www.sqlite.org/json1.html) - JSON handling in SQLite
- [SQLite Full-Text Search](https://www.sqlite.org/fts5.html) - FTS5 extension documentation
- [Database Design Patterns](https://www.martinfowler.com/articles/evodb.html) - Evolutionary database design

### Related Technologies
- [Node.js SQLite3](https://github.com/TryGhost/node-sqlite3) - Node.js SQLite bindings
- [Better-SQLite3](https://github.com/WiseLibs/better-sqlite3) - Faster SQLite3 library
- [Knex.js](https://knexjs.org) - SQL query builder for Node.js
- [TypeORM](https://typeorm.io) - TypeScript ORM framework