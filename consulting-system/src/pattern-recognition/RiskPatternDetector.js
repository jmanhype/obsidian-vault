/**
 * RiskPatternDetector - Detects risk patterns from historical project data
 * 
 * This component identifies patterns that indicate potential risks by analyzing
 * historical project failures, near-misses, and warning signals from the knowledge base.
 */

class RiskPatternDetector {
  constructor(contextEngine, obsidianIntegration, patternAnalyzer) {
    this.contextEngine = contextEngine;
    this.obsidianIntegration = obsidianIntegration;
    this.patternAnalyzer = patternAnalyzer;
    this.riskCache = new Map();
    this.learningData = new Map();
    
    // Risk severity thresholds
    this.severityThresholds = {
      critical: 0.8,
      high: 0.6,
      medium: 0.4,
      low: 0.2
    };

    // Risk categories with weights
    this.riskCategories = {
      technical: { weight: 0.25, patterns: [] },
      timeline: { weight: 0.2, patterns: [] },
      budget: { weight: 0.2, patterns: [] },
      communication: { weight: 0.15, patterns: [] },
      scope: { weight: 0.1, patterns: [] },
      external: { weight: 0.1, patterns: [] }
    };
  }

  /**
   * Detects risk patterns for a specific project
   * @param {string} projectId - Project identifier
   * @returns {Promise<Object>} Risk assessment with detected patterns
   */
  async detectRiskPatterns(projectId) {
    try {
      const projectContext = await this.contextEngine.buildProjectContext(projectId);
      const historicalRisks = await this.getHistoricalRiskPatterns();
      
      const riskAssessment = {
        overallRiskScore: 0,
        riskLevel: 'low',
        detectedPatterns: [],
        earlyWarningSignals: [],
        mitigationRecommendations: [],
        monitoringRecommendations: [],
        timestamp: new Date().toISOString()
      };

      // Detect patterns across all risk categories
      for (const [category, config] of Object.entries(this.riskCategories)) {
        const categoryRisks = await this.detectCategoryRisks(projectContext, category, historicalRisks);
        
        if (categoryRisks.length > 0) {
          riskAssessment.detectedPatterns.push({
            category,
            risks: categoryRisks,
            categoryScore: this.calculateCategoryScore(categoryRisks),
            weight: config.weight
          });
        }
      }

      // Calculate overall risk score
      riskAssessment.overallRiskScore = this.calculateOverallRiskScore(riskAssessment.detectedPatterns);
      riskAssessment.riskLevel = this.determineRiskLevel(riskAssessment.overallRiskScore);

      // Generate early warning signals
      riskAssessment.earlyWarningSignals = await this.generateEarlyWarningSignals(projectContext, riskAssessment.detectedPatterns);

      // Generate mitigation recommendations
      riskAssessment.mitigationRecommendations = await this.generateMitigationRecommendations(riskAssessment.detectedPatterns);

      // Generate monitoring recommendations
      riskAssessment.monitoringRecommendations = await this.generateMonitoringRecommendations(riskAssessment.detectedPatterns);

      // Cache the results
      this.riskCache.set(projectId, riskAssessment);

      // Update learning data
      await this.updateLearningData(projectId, projectContext, riskAssessment);

      return riskAssessment;
    } catch (error) {
      console.error(`Error detecting risk patterns for project ${projectId}:`, error);
      throw new Error(`Risk pattern detection failed: ${error.message}`);
    }
  }

  /**
   * Analyzes risk pattern evolution over time
   * @param {string} projectId - Project identifier
   * @param {string} timeframe - Time period ('1w', '1m', '3m', '6m', '1y')
   * @returns {Promise<Object>} Risk evolution analysis
   */
  async analyzeRiskEvolution(projectId, timeframe = '3m') {
    try {
      const historicalAssessments = await this.getHistoricalRiskAssessments(projectId, timeframe);
      
      if (historicalAssessments.length === 0) {
        return { evolution: 'no-data', message: 'Insufficient historical data for evolution analysis' };
      }

      const evolution = {
        trend: 'stable',
        riskScoreChange: 0,
        emergingRisks: [],
        resolvedRisks: [],
        persistentRisks: [],
        recommendations: []
      };

      // Analyze trend
      const scores = historicalAssessments.map(a => a.overallRiskScore);
      const trendSlope = this.calculateTrendSlope(scores);
      
      if (trendSlope > 0.1) evolution.trend = 'increasing';
      else if (trendSlope < -0.1) evolution.trend = 'decreasing';
      
      evolution.riskScoreChange = scores[scores.length - 1] - scores[0];

      // Identify emerging, resolved, and persistent risks
      const latestRisks = new Set(historicalAssessments[historicalAssessments.length - 1].detectedPatterns.map(p => p.category + ':' + p.risks.map(r => r.type).join(',')));
      const earliestRisks = new Set(historicalAssessments[0].detectedPatterns.map(p => p.category + ':' + p.risks.map(r => r.type).join(',')));
      
      evolution.emergingRisks = Array.from(latestRisks).filter(r => !earliestRisks.has(r));
      evolution.resolvedRisks = Array.from(earliestRisks).filter(r => !latestRisks.has(r));
      evolution.persistentRisks = Array.from(latestRisks).filter(r => earliestRisks.has(r));

      // Generate evolution-based recommendations
      evolution.recommendations = await this.generateEvolutionRecommendations(evolution);

      return evolution;
    } catch (error) {
      console.error(`Error analyzing risk evolution for project ${projectId}:`, error);
      throw new Error(`Risk evolution analysis failed: ${error.message}`);
    }
  }

  /**
   * Validates risk predictions against actual outcomes
   * @param {string} projectId - Project identifier
   * @param {Object} actualOutcome - Actual project outcome
   * @returns {Promise<Object>} Prediction validation results
   */
  async validateRiskPredictions(projectId, actualOutcome) {
    try {
      const cachedAssessment = this.riskCache.get(projectId);
      if (!cachedAssessment) {
        throw new Error('No risk assessment found for validation');
      }

      const validation = {
        overallAccuracy: 0,
        categoryAccuracy: {},
        truePositives: [],
        falsePositives: [],
        falseNegatives: [],
        learningInsights: []
      };

      // Compare predictions with actual outcomes
      for (const pattern of cachedAssessment.detectedPatterns) {
        const categoryResults = await this.validateCategoryPredictions(pattern, actualOutcome);
        validation.categoryAccuracy[pattern.category] = categoryResults.accuracy;
        
        validation.truePositives.push(...categoryResults.truePositives);
        validation.falsePositives.push(...categoryResults.falsePositives);
        validation.falseNegatives.push(...categoryResults.falseNegatives);
      }

      // Calculate overall accuracy
      const totalPredictions = validation.truePositives.length + validation.falsePositives.length;
      validation.overallAccuracy = totalPredictions > 0 ? validation.truePositives.length / totalPredictions : 0;

      // Generate learning insights
      validation.learningInsights = await this.generateLearningInsights(validation);

      // Update the learning system
      await this.updateLearningSystem(projectId, validation);

      return validation;
    } catch (error) {
      console.error(`Error validating risk predictions for project ${projectId}:`, error);
      throw new Error(`Risk prediction validation failed: ${error.message}`);
    }
  }

  /**
   * Gets risk pattern recommendations based on similar projects
   * @param {Object} projectContext - Current project context
   * @returns {Promise<Array>} Array of risk-based recommendations
   */
  async getRiskBasedRecommendations(projectContext) {
    try {
      // Find similar projects that faced similar contexts
      const similarProjects = await this.findSimilarRiskContexts(projectContext);
      
      const recommendations = [];
      
      for (const similarProject of similarProjects) {
        const projectRisks = await this.getProjectRiskHistory(similarProject.id);
        
        for (const risk of projectRisks) {
          if (risk.materialized && risk.impact > 0.3) {
            recommendations.push({
              riskType: risk.type,
              category: risk.category,
              probability: this.calculateSimilarityAdjustedProbability(risk, projectContext, similarProject.similarity),
              impact: risk.impact,
              preventionActions: risk.preventionActions || [],
              mitigationActions: risk.mitigationActions || [],
              earlyWarnings: risk.earlyWarnings || [],
              monitoringMetrics: risk.monitoringMetrics || [],
              similarProjectId: similarProject.id,
              confidence: similarProject.similarity
            });
          }
        }
      }

      // Remove duplicates and sort by risk score (probability * impact)
      const uniqueRecommendations = this.deduplicateRecommendations(recommendations);
      return uniqueRecommendations.sort((a, b) => (b.probability * b.impact) - (a.probability * a.impact));
    } catch (error) {
      console.error('Error getting risk-based recommendations:', error);
      throw new Error(`Risk recommendations failed: ${error.message}`);
    }
  }

  /**
   * Private helper methods
   */

  async detectCategoryRisks(projectContext, category, historicalRisks) {
    const categoryRisks = historicalRisks.filter(risk => risk.category === category);
    const detectedRisks = [];

    for (const risk of categoryRisks) {
      const similarity = await this.calculateContextSimilarity(projectContext, risk.context);
      
      if (similarity > 0.6) { // Only consider risks with >60% context similarity
        const adjustedProbability = risk.baseProbability * similarity * this.getLearningAdjustment(risk.type);
        
        if (adjustedProbability > 0.3) { // Only include risks with >30% probability
          detectedRisks.push({
            type: risk.type,
            description: risk.description,
            probability: adjustedProbability,
            impact: risk.averageImpact,
            confidence: similarity,
            historicalOccurrences: risk.occurrences,
            patterns: risk.patterns,
            triggers: risk.commonTriggers,
            preventionActions: risk.preventionActions,
            mitigationActions: risk.mitigationActions,
            earlyWarnings: risk.earlyWarnings
          });
        }
      }
    }

    return detectedRisks;
  }

  calculateCategoryScore(risks) {
    if (risks.length === 0) return 0;
    
    // Calculate weighted average of risk scores
    const totalRiskScore = risks.reduce((sum, risk) => sum + (risk.probability * risk.impact), 0);
    return totalRiskScore / risks.length;
  }

  calculateOverallRiskScore(detectedPatterns) {
    let weightedScore = 0;
    let totalWeight = 0;

    for (const pattern of detectedPatterns) {
      weightedScore += pattern.categoryScore * pattern.weight;
      totalWeight += pattern.weight;
    }

    return totalWeight > 0 ? weightedScore / totalWeight : 0;
  }

  determineRiskLevel(overallScore) {
    if (overallScore >= this.severityThresholds.critical) return 'critical';
    if (overallScore >= this.severityThresholds.high) return 'high';
    if (overallScore >= this.severityThresholds.medium) return 'medium';
    return 'low';
  }

  async generateEarlyWarningSignals(projectContext, detectedPatterns) {
    const signals = [];

    for (const pattern of detectedPatterns) {
      for (const risk of pattern.risks) {
        if (risk.earlyWarnings && risk.probability > 0.4) {
          for (const warning of risk.earlyWarnings) {
            const signal = {
              riskType: risk.type,
              category: pattern.category,
              signal: warning.signal,
              description: warning.description,
              monitoringFrequency: warning.frequency,
              threshold: warning.threshold,
              currentValue: await this.getCurrentSignalValue(projectContext, warning),
              priority: this.calculateSignalPriority(risk.probability, risk.impact),
              automatedMonitoring: warning.automatable || false
            };
            signals.push(signal);
          }
        }
      }
    }

    return signals.sort((a, b) => b.priority - a.priority);
  }

  async generateMitigationRecommendations(detectedPatterns) {
    const recommendations = [];

    for (const pattern of detectedPatterns) {
      for (const risk of pattern.risks) {
        if (risk.mitigationActions && risk.probability > 0.3) {
          for (const action of risk.mitigationActions) {
            recommendations.push({
              riskType: risk.type,
              category: pattern.category,
              action: action.action,
              description: action.description,
              effort: action.effort,
              effectiveness: action.effectiveness,
              cost: action.cost,
              timeline: action.timeline,
              dependencies: action.dependencies,
              priority: this.calculateMitigationPriority(risk, action),
              riskReduction: action.riskReduction || 0.5
            });
          }
        }
      }
    }

    return recommendations.sort((a, b) => b.priority - a.priority);
  }

  async generateMonitoringRecommendations(detectedPatterns) {
    const monitoring = [];

    for (const pattern of detectedPatterns) {
      for (const risk of pattern.risks) {
        if (risk.probability > 0.25) {
          monitoring.push({
            riskType: risk.type,
            category: pattern.category,
            metrics: this.getRelevantMetrics(risk),
            frequency: this.calculateMonitoringFrequency(risk.probability, risk.impact),
            thresholds: this.calculateThresholds(risk),
            alerting: {
              channels: this.getAlertingChannels(risk),
              escalation: this.getEscalationProcedure(risk)
            },
            automation: this.getAutomationOptions(risk)
          });
        }
      }
    }

    return monitoring;
  }

  async calculateContextSimilarity(projectContext, riskContext) {
    let similarity = 0;
    let factors = 0;

    // Project type similarity
    if (projectContext.project?.type === riskContext.project?.type) {
      similarity += 0.3;
    } else if (this.areRelatedProjectTypes(projectContext.project?.type, riskContext.project?.type)) {
      similarity += 0.15;
    }
    factors++;

    // Client type similarity
    if (projectContext.client?.type === riskContext.client?.type) {
      similarity += 0.2;
    } else if (this.areRelatedClientTypes(projectContext.client?.type, riskContext.client?.type)) {
      similarity += 0.1;
    }
    factors++;

    // Technology similarity
    const techSimilarity = this.calculateTechnologySimilarity(
      projectContext.technical?.stack,
      riskContext.technical?.stack
    );
    similarity += techSimilarity * 0.15;
    factors++;

    // Team size similarity
    const teamSizeDiff = Math.abs((projectContext.team?.size || 0) - (riskContext.team?.size || 0));
    const maxTeamSize = Math.max(projectContext.team?.size || 1, riskContext.team?.size || 1);
    const teamSimilarity = 1 - (teamSizeDiff / maxTeamSize);
    similarity += teamSimilarity * 0.1;
    factors++;

    // Timeline similarity
    const timelineDiff = Math.abs((projectContext.timeline?.duration || 0) - (riskContext.timeline?.duration || 0));
    const maxTimeline = Math.max(projectContext.timeline?.duration || 1, riskContext.timeline?.duration || 1);
    const timelineSimilarity = 1 - (timelineDiff / maxTimeline);
    similarity += timelineSimilarity * 0.1;
    factors++;

    // Budget similarity
    const budgetDiff = Math.abs((projectContext.budget?.amount || 0) - (riskContext.budget?.amount || 0));
    const maxBudget = Math.max(projectContext.budget?.amount || 1, riskContext.budget?.amount || 1);
    const budgetSimilarity = 1 - (budgetDiff / maxBudget);
    similarity += budgetSimilarity * 0.1;
    factors++;

    // Complexity similarity
    const complexityDiff = Math.abs((projectContext.complexity?.score || 0) - (riskContext.complexity?.score || 0));
    const complexitySimilarity = 1 - (complexityDiff / 10); // Assuming 0-10 scale
    similarity += complexitySimilarity * 0.05;
    factors++;

    return factors > 0 ? similarity / factors : 0;
  }

  getLearningAdjustment(riskType) {
    const learningData = this.learningData.get(riskType);
    if (!learningData) return 1.0;

    // Adjust probability based on historical prediction accuracy
    const accuracy = learningData.truePositives / (learningData.truePositives + learningData.falsePositives + 1);
    
    // If we've been over-predicting this risk, reduce probability
    if (accuracy < 0.5) return 0.8;
    // If we've been under-predicting, increase probability
    if (accuracy > 0.8) return 1.2;
    
    return 1.0;
  }

  async getHistoricalRiskPatterns() {
    // Query Obsidian vault for historical risk patterns
    const query = {
      noteType: 'risk-pattern',
      status: 'validated'
    };

    const riskNotes = await this.obsidianIntegration.queryKnowledgeGraph(query);
    
    return riskNotes.map(note => ({
      id: note.id,
      type: note.riskType,
      category: note.category,
      description: note.description,
      baseProbability: note.baseProbability || 0.3,
      averageImpact: note.averageImpact || 0.5,
      occurrences: note.occurrences || 1,
      context: note.context || {},
      patterns: note.patterns || [],
      commonTriggers: note.triggers || [],
      preventionActions: note.prevention || [],
      mitigationActions: note.mitigation || [],
      earlyWarnings: note.earlyWarnings || []
    }));
  }

  calculateTrendSlope(scores) {
    if (scores.length < 2) return 0;
    
    const n = scores.length;
    const sumX = (n * (n - 1)) / 2; // Sum of indices 0, 1, 2, ..., n-1
    const sumY = scores.reduce((sum, score) => sum + score, 0);
    const sumXY = scores.reduce((sum, score, index) => sum + (index * score), 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6; // Sum of squares

    return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  }

  async getCurrentSignalValue(projectContext, warning) {
    // Implementation would depend on the specific warning signal
    // This could involve querying project metrics, team metrics, etc.
    switch (warning.type) {
      case 'velocity_decline':
        return projectContext.metrics?.velocity || 0;
      case 'defect_rate_increase':
        return projectContext.quality?.defectRate || 0;
      case 'communication_frequency_drop':
        return projectContext.communication?.frequency || 0;
      case 'budget_burn_rate':
        return projectContext.budget?.burnRate || 0;
      default:
        return null;
    }
  }

  calculateSignalPriority(probability, impact) {
    return probability * impact * 100; // Scale to 0-100
  }

  calculateMitigationPriority(risk, action) {
    const riskScore = risk.probability * risk.impact;
    const effectiveness = action.effectiveness || 0.5;
    const effort = action.effort || 5; // 1-10 scale, lower is less effort
    
    // Priority = (Risk Score * Effectiveness) / Effort
    return (riskScore * effectiveness) / (effort / 10);
  }

  getRelevantMetrics(risk) {
    const metricMap = {
      'timeline_pressure': ['velocity', 'burn_down', 'milestone_completion'],
      'scope_creep': ['story_point_changes', 'requirement_changes', 'feature_additions'],
      'technical_debt': ['code_quality_score', 'test_coverage', 'refactoring_backlog'],
      'communication_breakdown': ['meeting_frequency', 'response_times', 'conflict_incidents'],
      'budget_overrun': ['burn_rate', 'cost_per_story_point', 'resource_utilization'],
      'quality_issues': ['defect_rate', 'customer_satisfaction', 'test_failure_rate']
    };

    return metricMap[risk.type] || ['general_health_score'];
  }

  calculateMonitoringFrequency(probability, impact) {
    const riskScore = probability * impact;
    
    if (riskScore > 0.7) return 'daily';
    if (riskScore > 0.5) return 'weekly';
    if (riskScore > 0.3) return 'bi-weekly';
    return 'monthly';
  }

  calculateThresholds(risk) {
    // Generate appropriate thresholds based on risk type and severity
    const baseThresholds = {
      'timeline_pressure': { warning: 0.8, critical: 0.9 },
      'budget_overrun': { warning: 0.85, critical: 0.95 },
      'quality_issues': { warning: 0.1, critical: 0.2 },
      'scope_creep': { warning: 0.15, critical: 0.25 }
    };

    const thresholds = baseThresholds[risk.type] || { warning: 0.7, critical: 0.9 };
    
    // Adjust thresholds based on risk probability and impact
    const adjustment = (risk.probability * risk.impact - 0.5) * 0.2;
    
    return {
      warning: Math.max(0, Math.min(1, thresholds.warning - adjustment)),
      critical: Math.max(0, Math.min(1, thresholds.critical - adjustment))
    };
  }

  getAlertingChannels(risk) {
    const severity = risk.probability * risk.impact;
    
    if (severity > 0.7) {
      return ['email', 'slack', 'sms', 'phone'];
    } else if (severity > 0.5) {
      return ['email', 'slack'];
    } else {
      return ['email'];
    }
  }

  getEscalationProcedure(risk) {
    return {
      level1: { role: 'project_manager', timeframe: '2h' },
      level2: { role: 'technical_lead', timeframe: '4h' },
      level3: { role: 'department_head', timeframe: '8h' }
    };
  }

  getAutomationOptions(risk) {
    const automationMap = {
      'timeline_pressure': ['automated_standup_reminders', 'velocity_tracking'],
      'budget_overrun': ['budget_alerts', 'resource_optimization'],
      'quality_issues': ['automated_testing', 'code_review_enforcement'],
      'communication_breakdown': ['meeting_scheduling', 'response_tracking']
    };

    return automationMap[risk.type] || [];
  }

  // Additional helper methods for similarity calculations and learning updates

  areRelatedProjectTypes(type1, type2) {
    const relations = {
      'web-app': ['mobile-app', 'desktop-app'],
      'mobile-app': ['web-app', 'hybrid-app'],
      'enterprise': ['saas', 'b2b-platform'],
      'api': ['microservice', 'integration']
    };

    return relations[type1]?.includes(type2) || relations[type2]?.includes(type1) || false;
  }

  areRelatedClientTypes(type1, type2) {
    const relations = {
      'startup': ['scale-up', 'small-business'],
      'enterprise': ['large-corporation', 'multinational'],
      'government': ['non-profit', 'public-sector'],
      'healthcare': ['regulated-industry', 'compliance-heavy']
    };

    return relations[type1]?.includes(type2) || relations[type2]?.includes(type1) || false;
  }

  calculateTechnologySimilarity(stack1, stack2) {
    if (!stack1 || !stack2) return 0;

    const technologies1 = new Set(Array.isArray(stack1) ? stack1 : [stack1]);
    const technologies2 = new Set(Array.isArray(stack2) ? stack2 : [stack2]);

    const intersection = new Set([...technologies1].filter(tech => technologies2.has(tech)));
    const union = new Set([...technologies1, ...technologies2]);

    return union.size > 0 ? intersection.size / union.size : 0;
  }

  async updateLearningData(projectId, projectContext, riskAssessment) {
    // Store this assessment for future learning
    const learningEntry = {
      projectId,
      timestamp: Date.now(),
      context: projectContext,
      assessment: riskAssessment
    };

    // This would be stored in Obsidian or another persistent store
    await this.obsidianIntegration.createProjectNote(learningEntry, 'risk-learning');
  }

  async getHistoricalRiskAssessments(projectId, timeframe) {
    // Query historical assessments from Obsidian vault
    const query = {
      projectId,
      noteType: 'risk-assessment',
      timeframe
    };

    return await this.obsidianIntegration.queryKnowledgeGraph(query);
  }

  async generateEvolutionRecommendations(evolution) {
    const recommendations = [];

    if (evolution.trend === 'increasing') {
      recommendations.push({
        priority: 'high',
        action: 'Investigate root cause of increasing risk trend',
        description: 'Risk levels are trending upward, requiring immediate attention'
      });
    }

    if (evolution.emergingRisks.length > 0) {
      recommendations.push({
        priority: 'medium',
        action: 'Address emerging risk patterns',
        description: `New risk patterns detected: ${evolution.emergingRisks.join(', ')}`
      });
    }

    if (evolution.persistentRisks.length > 0) {
      recommendations.push({
        priority: 'medium',
        action: 'Implement stronger mitigation for persistent risks',
        description: `These risks continue to appear: ${evolution.persistentRisks.join(', ')}`
      });
    }

    return recommendations;
  }

  async validateCategoryPredictions(pattern, actualOutcome) {
    const results = {
      accuracy: 0,
      truePositives: [],
      falsePositives: [],
      falseNegatives: []
    };

    for (const risk of pattern.risks) {
      const actualRisk = actualOutcome.risks?.find(r => r.type === risk.type);
      
      if (actualRisk && actualRisk.materialized) {
        results.truePositives.push({
          riskType: risk.type,
          predictedProbability: risk.probability,
          actualImpact: actualRisk.impact
        });
      } else if (!actualRisk) {
        results.falsePositives.push({
          riskType: risk.type,
          predictedProbability: risk.probability
        });
      }
    }

    // Check for risks that occurred but weren't predicted
    for (const actualRisk of actualOutcome.risks || []) {
      if (actualRisk.materialized && !pattern.risks.find(r => r.type === actualRisk.type)) {
        results.falseNegatives.push({
          riskType: actualRisk.type,
          actualImpact: actualRisk.impact
        });
      }
    }

    const totalPredictions = results.truePositives.length + results.falsePositives.length;
    results.accuracy = totalPredictions > 0 ? results.truePositives.length / totalPredictions : 0;

    return results;
  }

  async generateLearningInsights(validation) {
    const insights = [];

    if (validation.overallAccuracy < 0.6) {
      insights.push({
        type: 'accuracy_concern',
        message: 'Risk prediction accuracy is below acceptable threshold',
        recommendation: 'Review and recalibrate risk detection algorithms'
      });
    }

    if (validation.falsePositives.length > validation.truePositives.length) {
      insights.push({
        type: 'false_positive_bias',
        message: 'High false positive rate detected',
        recommendation: 'Adjust probability thresholds to reduce false alarms'
      });
    }

    if (validation.falseNegatives.length > 0) {
      insights.push({
        type: 'missed_risks',
        message: `${validation.falseNegatives.length} risks were missed`,
        recommendation: 'Expand risk pattern database and improve detection sensitivity'
      });
    }

    return insights;
  }

  async updateLearningSystem(projectId, validation) {
    // Update learning weights based on validation results
    for (const tp of validation.truePositives) {
      const learningData = this.learningData.get(tp.riskType) || { truePositives: 0, falsePositives: 0 };
      learningData.truePositives++;
      this.learningData.set(tp.riskType, learningData);
    }

    for (const fp of validation.falsePositives) {
      const learningData = this.learningData.get(fp.riskType) || { truePositives: 0, falsePositives: 0 };
      learningData.falsePositives++;
      this.learningData.set(fp.riskType, learningData);
    }

    // Persist learning data to Obsidian vault
    await this.obsidianIntegration.createProjectNote({
      projectId,
      validation,
      learningData: Object.fromEntries(this.learningData),
      timestamp: Date.now()
    }, 'risk-learning-update');
  }

  async findSimilarRiskContexts(projectContext) {
    // Find projects with similar contexts that had risks
    const query = {
      noteType: 'project-outcome',
      hasRisks: true
    };

    const projects = await this.obsidianIntegration.queryKnowledgeGraph(query);
    const similarProjects = [];

    for (const project of projects) {
      const similarity = await this.calculateContextSimilarity(projectContext, project.context);
      if (similarity > 0.5) {
        similarProjects.push({
          id: project.id,
          similarity,
          context: project.context
        });
      }
    }

    return similarProjects.sort((a, b) => b.similarity - a.similarity);
  }

  async getProjectRiskHistory(projectId) {
    const query = {
      projectId,
      noteType: 'risk-history'
    };

    return await this.obsidianIntegration.queryKnowledgeGraph(query);
  }

  calculateSimilarityAdjustedProbability(risk, projectContext, similarity) {
    return risk.probability * similarity * this.getLearningAdjustment(risk.type);
  }

  deduplicateRecommendations(recommendations) {
    const seen = new Set();
    const unique = [];

    for (const rec of recommendations) {
      const key = `${rec.riskType}-${rec.category}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(rec);
      }
    }

    return unique;
  }
}

module.exports = RiskPatternDetector;