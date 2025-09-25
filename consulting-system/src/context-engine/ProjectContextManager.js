/**
 * ProjectContextManager - Manages rich contextual understanding of projects
 * Aggregates context from multiple sources and maintains project state
 */

class ProjectContextManager {
  constructor(obsidianIntegration, patternRecognition) {
    this.obsidian = obsidianIntegration;
    this.patternRecognition = patternRecognition;
    
    // Context source weights for aggregation
    this.contextWeights = {
      obsidian_notes: 0.4,
      git_history: 0.2,
      decision_history: 0.2,
      client_feedback: 0.1,
      external_metrics: 0.1
    };

    // Context categories and their importance
    this.contextCategories = {
      technical: {
        architecture: 'high',
        infrastructure: 'high',
        security: 'high',
        performance: 'medium'
      },
      business: {
        requirements: 'high',
        constraints: 'high',
        stakeholders: 'medium',
        timeline: 'medium'
      },
      operational: {
        deployment: 'high',
        monitoring: 'medium',
        maintenance: 'medium',
        support: 'low'
      },
      historical: {
        decisions: 'high',
        lessons_learned: 'medium',
        patterns: 'medium',
        metrics: 'low'
      }
    };
  }

  /**
   * Build comprehensive project context
   * @param {string} projectId - Project identifier
   * @returns {Promise<Object>} Aggregated project context
   */
  async buildProjectContext(projectId) {
    try {
      console.log(`Building context for project: ${projectId}`);
      
      // Gather context from all sources in parallel
      const [
        obsidianContext,
        gitContext,
        decisionContext,
        clientContext,
        metricsContext
      ] = await Promise.all([
        this._gatherObsidianContext(projectId),
        this._gatherGitContext(projectId),
        this._gatherDecisionContext(projectId),
        this._gatherClientContext(projectId),
        this._gatherMetricsContext(projectId)
      ]);

      // Aggregate contexts with weighted importance
      const aggregatedContext = this._aggregateContexts({
        obsidian: obsidianContext,
        git: gitContext,
        decisions: decisionContext,
        client: clientContext,
        metrics: metricsContext
      });

      // Enrich with pattern-based insights
      const enrichedContext = await this._enrichWithPatterns(projectId, aggregatedContext);

      // Add temporal context
      const finalContext = this._addTemporalContext(enrichedContext);

      console.log(`Context built successfully for ${projectId}`);
      return finalContext;
      
    } catch (error) {
      console.error('Error building project context:', error);
      throw new Error(`Failed to build context for project ${projectId}: ${error.message}`);
    }
  }

  /**
   * Update project context with new information
   * @param {string} projectId - Project identifier
   * @param {Object} contextDelta - Context changes to apply
   * @returns {Promise<Object>} Updated context
   */
  async updateContext(projectId, contextDelta) {
    try {
      // Get current context
      const currentContext = await this.buildProjectContext(projectId);
      
      // Apply delta changes
      const updatedContext = this._applyContextDelta(currentContext, contextDelta);
      
      // Validate context consistency
      const validatedContext = this._validateContextConsistency(updatedContext);
      
      // Persist context changes
      await this._persistContextChanges(projectId, contextDelta);
      
      // Update related context indices
      await this._updateContextIndices(projectId, validatedContext);

      console.log(`Context updated for project: ${projectId}`);
      return validatedContext;
      
    } catch (error) {
      console.error('Error updating project context:', error);
      throw new Error(`Failed to update context: ${error.message}`);
    }
  }

  /**
   * Get context specifically formatted for decision making
   * @param {string} projectId - Project identifier
   * @param {string} decisionType - Type of decision being made
   * @returns {Promise<Object>} Decision-ready context
   */
  async getContextForDecision(projectId, decisionType) {
    try {
      const fullContext = await this.buildProjectContext(projectId);
      
      // Filter and prioritize context relevant to decision type
      const decisionContext = this._filterContextForDecision(fullContext, decisionType);
      
      // Add decision-specific insights
      const enhancedContext = await this._addDecisionInsights(
        projectId, 
        decisionType, 
        decisionContext
      );

      // Add historical decision outcomes for similar contexts
      const historicalContext = await this._addHistoricalDecisionOutcomes(
        decisionType,
        enhancedContext
      );

      return historicalContext;
      
    } catch (error) {
      console.error('Error getting decision context:', error);
      throw new Error(`Failed to get decision context: ${error.message}`);
    }
  }

  /**
   * Export complete context snapshot for archival
   * @param {string} projectId - Project identifier
   * @returns {Promise<Object>} Context snapshot
   */
  async exportContextSnapshot(projectId) {
    try {
      const context = await this.buildProjectContext(projectId);
      
      const snapshot = {
        projectId,
        timestamp: new Date().toISOString(),
        context,
        metadata: {
          contextVersion: '1.0',
          sources: Object.keys(this.contextWeights),
          categories: Object.keys(this.contextCategories)
        }
      };

      // Store snapshot in Obsidian
      await this._storeContextSnapshot(projectId, snapshot);
      
      return snapshot;
      
    } catch (error) {
      console.error('Error exporting context snapshot:', error);
      throw new Error(`Failed to export context snapshot: ${error.message}`);
    }
  }

  /**
   * Get context evolution timeline
   * @param {string} projectId - Project identifier
   * @param {string} timeRange - Time range for evolution ('30d', '90d', 'all')
   * @returns {Promise<Array>} Context evolution timeline
   */
  async getContextEvolution(projectId, timeRange = '30d') {
    try {
      const evolution = await this.obsidian.queryKnowledgeGraph({
        type: 'context_evolution',
        projectId,
        timeRange
      });

      return evolution.map(entry => ({
        timestamp: entry.timestamp,
        changes: entry.contextDelta,
        triggers: entry.triggers,
        impact: this._calculateContextImpact(entry.contextDelta)
      }));
      
    } catch (error) {
      console.error('Error getting context evolution:', error);
      throw new Error(`Failed to get context evolution: ${error.message}`);
    }
  }

  // Private helper methods

  async _gatherObsidianContext(projectId) {
    try {
      // Query Obsidian vault for project-related notes
      const projectNotes = await this.obsidian.queryKnowledgeGraph({
        type: 'related_projects',
        projectId
      });

      const context = {
        projectOverview: {},
        requirements: {},
        architecture: {},
        decisions: {},
        stakeholders: {},
        timeline: {},
        risks: {}
      };

      // Extract structured data from notes
      for (const note of projectNotes) {
        const noteContext = await this._extractContextFromNote(note);
        this._mergeContextData(context, noteContext);
      }

      return context;
    } catch (error) {
      console.warn('Error gathering Obsidian context:', error);
      return {};
    }
  }

  async _gatherGitContext(projectId) {
    try {
      // This would integrate with git repositories to gather:
      // - Commit history
      // - Branch patterns
      // - Code complexity metrics
      // - Recent activity
      
      return {
        recentActivity: {
          commits: 0,
          branches: 0,
          contributors: 0
        },
        codeMetrics: {
          complexity: 'unknown',
          coverage: 'unknown',
          quality: 'unknown'
        },
        implementation: {
          security: [],
          reliability: [],
          scalability: []
        }
      };
    } catch (error) {
      console.warn('Error gathering git context:', error);
      return {};
    }
  }

  async _gatherDecisionContext(projectId) {
    try {
      const decisions = await this.obsidian.queryKnowledgeGraph({
        type: 'decisions',
        projectId
      });

      return {
        recentDecisions: decisions.slice(0, 10),
        decisionPatterns: this._analyzeDecisionPatterns(decisions),
        pendingDecisions: decisions.filter(d => d.status === 'pending'),
        decisionVelocity: this._calculateDecisionVelocity(decisions)
      };
    } catch (error) {
      console.warn('Error gathering decision context:', error);
      return {};
    }
  }

  async _gatherClientContext(projectId) {
    try {
      // This would integrate with CRM/client communication systems
      return {
        satisfaction: 'unknown',
        engagement: 'unknown',
        feedback: [],
        expectations: {},
        constraints: {}
      };
    } catch (error) {
      console.warn('Error gathering client context:', error);
      return {};
    }
  }

  async _gatherMetricsContext(projectId) {
    try {
      // This would integrate with monitoring/analytics systems
      return {
        performance: {},
        availability: {},
        usage: {},
        errors: {}
      };
    } catch (error) {
      console.warn('Error gathering metrics context:', error);
      return {};
    }
  }

  _aggregateContexts(contexts) {
    const aggregated = {
      projectId: null,
      timestamp: new Date().toISOString(),
      technical: {},
      business: {},
      operational: {},
      historical: {},
      confidence: {}
    };

    // Merge contexts based on weights and categories
    for (const [source, context] of Object.entries(contexts)) {
      const weight = this.contextWeights[source] || 0.1;
      
      for (const [category, data] of Object.entries(context)) {
        if (!aggregated[category]) {
          aggregated[category] = {};
        }
        
        // Weighted merge logic
        this._weightedMerge(aggregated[category], data, weight);
      }
      
      // Track confidence per source
      aggregated.confidence[source] = this._calculateSourceConfidence(context);
    }

    return aggregated;
  }

  _weightedMerge(target, source, weight) {
    for (const [key, value] of Object.entries(source)) {
      if (typeof value === 'object' && value !== null) {
        if (!target[key]) target[key] = {};
        this._weightedMerge(target[key], value, weight);
      } else {
        // Simple weighted average for numeric values
        if (typeof value === 'number' && target[key]) {
          target[key] = (target[key] * (1 - weight)) + (value * weight);
        } else {
          target[key] = value;
        }
      }
    }
  }

  async _enrichWithPatterns(projectId, context) {
    try {
      const patterns = await this.patternRecognition.analyzeProjectPatterns(projectId);
      
      return {
        ...context,
        patterns: {
          identified: patterns.patterns || [],
          risks: patterns.risks || [],
          opportunities: patterns.opportunities || [],
          recommendations: patterns.recommendations || []
        }
      };
    } catch (error) {
      console.warn('Error enriching with patterns:', error);
      return context;
    }
  }

  _addTemporalContext(context) {
    const now = new Date();
    
    return {
      ...context,
      temporal: {
        created: context.created || now.toISOString(),
        lastUpdated: now.toISOString(),
        dayOfWeek: now.getDay(),
        timeOfDay: now.getHours(),
        quarter: Math.floor(now.getMonth() / 3) + 1,
        projectAge: context.created ? 
          Math.floor((now - new Date(context.created)) / (1000 * 60 * 60 * 24)) : 0
      }
    };
  }

  _applyContextDelta(currentContext, delta) {
    // Deep merge delta changes into current context
    const updated = JSON.parse(JSON.stringify(currentContext));
    
    for (const [key, value] of Object.entries(delta)) {
      if (typeof value === 'object' && value !== null) {
        if (!updated[key]) updated[key] = {};
        Object.assign(updated[key], value);
      } else {
        updated[key] = value;
      }
    }
    
    return updated;
  }

  _validateContextConsistency(context) {
    // Validate that context is internally consistent
    const warnings = [];
    
    // Check for contradictory information
    if (context.business?.timeline && context.technical?.timeline) {
      // Validate timeline consistency
    }
    
    // Check for missing required context
    const requiredFields = ['projectId', 'timestamp'];
    for (const field of requiredFields) {
      if (!context[field]) {
        warnings.push(`Missing required field: ${field}`);
      }
    }
    
    if (warnings.length > 0) {
      console.warn('Context validation warnings:', warnings);
    }
    
    return context;
  }

  async _persistContextChanges(projectId, delta) {
    // Persist context changes to Obsidian
    await this.obsidian.updateProjectNote(projectId, {
      contextDelta: {
        timestamp: new Date().toISOString(),
        changes: delta
      }
    });
  }

  async _updateContextIndices(projectId, context) {
    // Update context indices for faster querying
    // This would maintain search indices, relationship graphs, etc.
  }

  _filterContextForDecision(context, decisionType) {
    // Filter context based on decision type
    const relevantCategories = this._getRelevantCategoriesForDecision(decisionType);
    
    const filtered = {};
    for (const category of relevantCategories) {
      if (context[category]) {
        filtered[category] = context[category];
      }
    }
    
    return filtered;
  }

  _getRelevantCategoriesForDecision(decisionType) {
    const decisionMap = {
      'maturity_transition': ['technical', 'business', 'operational'],
      'architecture': ['technical', 'historical'],
      'timeline': ['business', 'historical'],
      'resource': ['business', 'operational']
    };
    
    return decisionMap[decisionType] || Object.keys(this.contextCategories);
  }

  async _addDecisionInsights(projectId, decisionType, context) {
    // Add AI-generated insights for decision making
    const insights = await this.patternRecognition.predictDeliveryRisks(context);
    
    return {
      ...context,
      decisionInsights: {
        type: decisionType,
        risks: insights.risks || [],
        opportunities: insights.opportunities || [],
        recommendations: insights.recommendations || []
      }
    };
  }

  async _addHistoricalDecisionOutcomes(decisionType, context) {
    // Add historical outcomes for similar decisions
    const historicalOutcomes = await this.obsidian.queryKnowledgeGraph({
      type: 'historical_decisions',
      decisionType
    });
    
    return {
      ...context,
      historicalOutcomes: historicalOutcomes.slice(0, 5)
    };
  }

  async _storeContextSnapshot(projectId, snapshot) {
    await this.obsidian.updateProjectNote(projectId, {
      contextSnapshot: snapshot
    });
  }

  _calculateContextImpact(delta) {
    // Calculate the impact score of context changes
    let impact = 0;
    
    for (const [key, value] of Object.entries(delta)) {
      if (this.contextCategories[key]) {
        impact += Object.keys(value).length;
      }
    }
    
    return impact;
  }

  async _extractContextFromNote(note) {
    // Extract structured context from Obsidian note
    // This would parse note content and extract relevant data
    return {};
  }

  _mergeContextData(target, source) {
    // Merge context data from multiple notes
    Object.assign(target, source);
  }

  _analyzeDecisionPatterns(decisions) {
    // Analyze patterns in decision history
    return {
      averageTime: 0,
      commonReasons: [],
      successRate: 0
    };
  }

  _calculateDecisionVelocity(decisions) {
    // Calculate how quickly decisions are being made
    return decisions.length / 30; // decisions per day over last 30 days
  }

  _calculateSourceConfidence(context) {
    // Calculate confidence in context source
    const dataPoints = this._countDataPoints(context);
    return Math.min(dataPoints / 10, 1); // Normalize to 0-1
  }

  _countDataPoints(obj) {
    let count = 0;
    for (const value of Object.values(obj)) {
      if (typeof value === 'object' && value !== null) {
        count += this._countDataPoints(value);
      } else if (value !== null && value !== undefined) {
        count++;
      }
    }
    return count;
  }
}

module.exports = ProjectContextManager;