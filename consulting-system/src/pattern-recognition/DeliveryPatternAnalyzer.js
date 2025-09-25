/**
 * DeliveryPatternAnalyzer - Identifies successful delivery patterns from historical data
 * Learns from past projects to improve future delivery outcomes
 */

class DeliveryPatternAnalyzer {
  constructor(obsidianIntegration, contextEngine) {
    this.obsidian = obsidianIntegration;
    this.contextEngine = contextEngine;
    
    // Pattern categories for analysis
    this.patternCategories = {
      temporal: {
        timeToValue: 'Time from start to first business value',
        cycleTime: 'Time between maturity level transitions',
        decisionVelocity: 'Speed of decision-making processes'
      },
      structural: {
        teamComposition: 'Team size and skill distribution patterns',
        architecturalChoices: 'Technology stack and architecture patterns',
        processAdherence: 'Following established methodologies'
      },
      contextual: {
        clientEngagement: 'Client collaboration and feedback patterns',
        stakeholderAlignment: 'Stakeholder consensus and communication',
        changeManagement: 'Handling of scope and requirement changes'
      },
      outcome: {
        deliverySuccess: 'Achievement of delivery milestones',
        qualityMetrics: 'Code quality and system reliability',
        clientSatisfaction: 'Client feedback and relationship health'
      }
    };

    // Success indicators and their weights
    this.successIndicators = {
      onTimeDelivery: 0.3,
      budgetAdherence: 0.2,
      qualityMetrics: 0.2,
      clientSatisfaction: 0.15,
      teamSatisfaction: 0.15
    };

    // Pattern confidence thresholds
    this.confidenceThresholds = {
      strong: 0.8,
      moderate: 0.6,
      weak: 0.4
    };
  }

  /**
   * Analyze patterns for a specific project
   * @param {string} projectId - Project identifier
   * @returns {Promise<Object>} Pattern analysis results
   */
  async analyzeProjectPatterns(projectId) {
    try {
      console.log(`Analyzing patterns for project: ${projectId}`);
      
      // Get project context and history
      const projectContext = await this.contextEngine.buildProjectContext(projectId);
      const projectHistory = await this._getProjectHistory(projectId);
      
      // Find similar historical projects
      const similarProjects = await this._findSimilarProjects(projectContext);
      
      // Analyze patterns across categories
      const patterns = {
        temporal: await this._analyzeTemporalPatterns(projectHistory, similarProjects),
        structural: await this._analyzeStructuralPatterns(projectContext, similarProjects),
        contextual: await this._analyzeContextualPatterns(projectContext, similarProjects),
        outcome: await this._analyzeOutcomePatterns(projectHistory, similarProjects)
      };

      // Identify success factors
      const successFactors = await this._identifySuccessFactors(patterns, similarProjects);
      
      // Generate insights and predictions
      const insights = await this._generatePatternInsights(patterns, successFactors);
      
      const analysis = {
        projectId,
        timestamp: new Date().toISOString(),
        patterns,
        successFactors,
        insights,
        similarProjects: similarProjects.length,
        confidence: this._calculateOverallConfidence(patterns)
      };

      // Store analysis in Obsidian
      await this._storePatternAnalysis(projectId, analysis);
      
      console.log(`Pattern analysis completed for ${projectId}`);
      return analysis;
      
    } catch (error) {
      console.error('Error analyzing project patterns:', error);
      throw new Error(`Failed to analyze patterns: ${error.message}`);
    }
  }

  /**
   * Identify success factors for project type and client combination
   * @param {string} projectType - Type of project
   * @param {string} clientType - Type of client/industry
   * @returns {Promise<Object>} Success factors analysis
   */
  async identifySuccessFactors(projectType, clientType) {
    try {
      // Query historical projects with similar characteristics
      const historicalProjects = await this.obsidian.queryKnowledgeGraph({
        type: 'related_projects',
        filters: {
          projectType,
          clientType
        }
      });

      if (historicalProjects.length < 3) {
        return this._getDefaultSuccessFactors(projectType);
      }

      // Analyze success patterns across historical projects
      const successfulProjects = historicalProjects.filter(p => 
        p.outcomes && p.outcomes.overallSuccess > 0.7
      );

      const failedProjects = historicalProjects.filter(p => 
        p.outcomes && p.outcomes.overallSuccess < 0.4
      );

      // Compare characteristics of successful vs failed projects
      const successFactors = await this._compareProjectCharacteristics(
        successfulProjects,
        failedProjects
      );

      return {
        projectType,
        clientType,
        sampleSize: historicalProjects.length,
        successRate: successfulProjects.length / historicalProjects.length,
        factors: successFactors,
        confidence: this._calculateFactorConfidence(historicalProjects.length),
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Error identifying success factors:', error);
      throw new Error(`Failed to identify success factors: ${error.message}`);
    }
  }

  /**
   * Predict delivery risks based on current project context
   * @param {Object} projectContext - Current project context
   * @returns {Promise<Object>} Risk predictions
   */
  async predictDeliveryRisks(projectContext) {
    try {
      // Find similar historical projects
      const similarProjects = await this._findSimilarProjects(projectContext);
      
      // Analyze risk patterns from similar projects
      const riskPatterns = await this._analyzeRiskPatterns(similarProjects);
      
      // Assess current project against risk patterns
      const riskAssessment = await this._assessProjectRisks(projectContext, riskPatterns);
      
      // Generate risk predictions and recommendations
      const predictions = {
        overallRiskScore: riskAssessment.overallScore,
        riskCategories: riskAssessment.categories,
        topRisks: riskAssessment.topRisks,
        riskTrajectory: riskAssessment.trajectory,
        recommendations: await this._generateRiskMitigationRecommendations(riskAssessment),
        confidence: riskAssessment.confidence,
        basedOnProjects: similarProjects.length,
        timestamp: new Date().toISOString()
      };

      return predictions;
      
    } catch (error) {
      console.error('Error predicting delivery risks:', error);
      throw new Error(`Failed to predict risks: ${error.message}`);
    }
  }

  /**
   * Recommend next steps based on current project state and patterns
   * @param {string} projectId - Project identifier
   * @param {string} currentLevel - Current maturity level
   * @returns {Promise<Array>} Recommended next steps
   */
  async recommendNextSteps(projectId, currentLevel) {
    try {
      const projectContext = await this.contextEngine.buildProjectContext(projectId);
      const patterns = await this.analyzeProjectPatterns(projectId);
      
      // Get successful transition patterns for current level
      const transitionPatterns = await this._getTransitionPatterns(currentLevel);
      
      // Generate context-aware recommendations
      const recommendations = await this._generateRecommendations(
        projectContext,
        patterns,
        transitionPatterns
      );

      return recommendations.map(rec => ({
        action: rec.action,
        rationale: rec.rationale,
        priority: rec.priority,
        effort: rec.estimatedEffort,
        riskReduction: rec.riskReduction,
        successProbability: rec.successProbability,
        basedOnPattern: rec.patternEvidence
      }));
      
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return [];
    }
  }

  // Private helper methods

  async _getProjectHistory(projectId) {
    const history = await this.obsidian.getProjectMaturityHistory(projectId);
    return {
      transitions: history.transitions || [],
      decisions: history.decisions || [],
      milestones: history.milestones || [],
      timeline: history.timeline || {}
    };
  }

  async _findSimilarProjects(projectContext) {
    const similarities = [
      'projectType',
      'clientIndustry', 
      'teamSize',
      'technicalComplexity',
      'timeConstraints'
    ];

    const query = {
      type: 'patterns',
      similarityFactors: similarities,
      context: projectContext,
      limit: 20
    };

    const results = await this.obsidian.queryKnowledgeGraph(query);
    return results || [];
  }

  async _analyzeTemporalPatterns(projectHistory, similarProjects) {
    const patterns = {
      averageTransitionTime: {},
      decisionSpeed: 0,
      timeToValue: 0,
      seasonality: {},
      confidence: 0
    };

    // Calculate average transition times between maturity levels
    const transitions = ['POC_TO_MVP', 'MVP_TO_PILOT', 'PILOT_TO_PRODUCTION', 'PRODUCTION_TO_SCALE'];
    
    for (const transition of transitions) {
      const times = similarProjects
        .map(p => p.transitions?.[transition]?.duration)
        .filter(t => t != null);
      
      if (times.length > 0) {
        patterns.averageTransitionTime[transition] = {
          mean: times.reduce((a, b) => a + b, 0) / times.length,
          median: this._calculateMedian(times),
          standardDeviation: this._calculateStandardDeviation(times)
        };
      }
    }

    patterns.confidence = this._calculateTemporalConfidence(similarProjects.length);
    return patterns;
  }

  async _analyzeStructuralPatterns(projectContext, similarProjects) {
    return {
      commonArchitectures: this._identifyCommonArchitectures(similarProjects),
      teamPatterns: this._analyzeTeamPatterns(similarProjects),
      technologyChoices: this._analyzeTechnologyPatterns(similarProjects),
      processPatterns: this._analyzeProcessPatterns(similarProjects),
      confidence: this._calculateStructuralConfidence(similarProjects.length)
    };
  }

  async _analyzeContextualPatterns(projectContext, similarProjects) {
    return {
      clientEngagementPatterns: this._analyzeClientEngagement(similarProjects),
      stakeholderPatterns: this._analyzeStakeholderPatterns(similarProjects),
      changeManagementPatterns: this._analyzeChangePatterns(similarProjects),
      communicationPatterns: this._analyzeCommunicationPatterns(similarProjects),
      confidence: this._calculateContextualConfidence(similarProjects.length)
    };
  }

  async _analyzeOutcomePatterns(projectHistory, similarProjects) {
    const successfulProjects = similarProjects.filter(p => p.outcomes?.overallSuccess > 0.7);
    const problematicProjects = similarProjects.filter(p => p.outcomes?.overallSuccess < 0.5);

    return {
      successRate: successfulProjects.length / similarProjects.length,
      commonSuccessFactors: this._identifyCommonFactors(successfulProjects),
      commonFailureFactors: this._identifyCommonFactors(problematicProjects),
      qualityIndicators: this._analyzeQualityPatterns(similarProjects),
      clientSatisfactionPatterns: this._analyzeClientSatisfactionPatterns(similarProjects),
      confidence: this._calculateOutcomeConfidence(similarProjects.length)
    };
  }

  async _identifySuccessFactors(patterns, similarProjects) {
    const factors = {};
    
    // Extract success factors from each pattern category
    for (const [category, categoryPatterns] of Object.entries(patterns)) {
      factors[category] = this._extractSuccessFactorsFromCategory(
        categoryPatterns,
        similarProjects
      );
    }

    return factors;
  }

  async _generatePatternInsights(patterns, successFactors) {
    const insights = {
      strengths: [],
      risks: [],
      opportunities: [],
      recommendations: []
    };

    // Generate insights based on pattern analysis
    if (patterns.temporal.confidence > this.confidenceThresholds.moderate) {
      insights.strengths.push('Strong temporal pattern data available for predictions');
    }

    if (patterns.structural.commonArchitectures.length > 0) {
      insights.opportunities.push('Leverage proven architectural patterns from similar projects');
    }

    return insights;
  }

  _calculateOverallConfidence(patterns) {
    const confidences = Object.values(patterns).map(p => p.confidence || 0);
    return confidences.reduce((a, b) => a + b, 0) / confidences.length;
  }

  async _storePatternAnalysis(projectId, analysis) {
    await this.obsidian.updateProjectNote(projectId, {
      patternAnalysis: analysis
    });
  }

  _getDefaultSuccessFactors(projectType) {
    const defaults = {
      'web_application': {
        technical: ['responsive_design', 'performance_optimization', 'security_implementation'],
        process: ['agile_methodology', 'continuous_integration', 'user_feedback_loops'],
        team: ['full_stack_expertise', 'ui_ux_skills', 'devops_knowledge']
      },
      'api_development': {
        technical: ['api_documentation', 'error_handling', 'rate_limiting'],
        process: ['api_first_design', 'comprehensive_testing', 'version_management'],
        team: ['backend_expertise', 'security_knowledge', 'integration_experience']
      }
    };

    return defaults[projectType] || defaults['web_application'];
  }

  async _compareProjectCharacteristics(successfulProjects, failedProjects) {
    // Compare characteristics between successful and failed projects
    // This would implement statistical analysis to identify differentiating factors
    return {
      technicalFactors: [],
      processFactors: [],
      teamFactors: [],
      clientFactors: []
    };
  }

  _calculateFactorConfidence(sampleSize) {
    if (sampleSize < 3) return 0.2;
    if (sampleSize < 10) return 0.5;
    if (sampleSize < 20) return 0.7;
    return 0.9;
  }

  async _analyzeRiskPatterns(similarProjects) {
    return {
      technicalRisks: [],
      processRisks: [],
      teamRisks: [],
      clientRisks: []
    };
  }

  async _assessProjectRisks(projectContext, riskPatterns) {
    return {
      overallScore: 0.5,
      categories: {},
      topRisks: [],
      trajectory: 'stable',
      confidence: 0.6
    };
  }

  async _generateRiskMitigationRecommendations(riskAssessment) {
    return [];
  }

  async _getTransitionPatterns(currentLevel) {
    return {};
  }

  async _generateRecommendations(projectContext, patterns, transitionPatterns) {
    return [];
  }

  // Statistical helper methods
  _calculateMedian(numbers) {
    const sorted = numbers.sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 
      ? (sorted[middle - 1] + sorted[middle]) / 2
      : sorted[middle];
  }

  _calculateStandardDeviation(numbers) {
    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    const variance = numbers.reduce((acc, num) => acc + Math.pow(num - mean, 2), 0) / numbers.length;
    return Math.sqrt(variance);
  }

  // Pattern analysis helper methods
  _identifyCommonArchitectures(projects) {
    return [];
  }

  _analyzeTeamPatterns(projects) {
    return {};
  }

  _analyzeTechnologyPatterns(projects) {
    return {};
  }

  _analyzeProcessPatterns(projects) {
    return {};
  }

  _analyzeClientEngagement(projects) {
    return {};
  }

  _analyzeStakeholderPatterns(projects) {
    return {};
  }

  _analyzeChangePatterns(projects) {
    return {};
  }

  _analyzeCommunicationPatterns(projects) {
    return {};
  }

  _identifyCommonFactors(projects) {
    return [];
  }

  _analyzeQualityPatterns(projects) {
    return {};
  }

  _analyzeClientSatisfactionPatterns(projects) {
    return {};
  }

  _extractSuccessFactorsFromCategory(categoryPatterns, similarProjects) {
    return [];
  }

  // Confidence calculation methods
  _calculateTemporalConfidence(sampleSize) {
    return Math.min(sampleSize / 20, 1);
  }

  _calculateStructuralConfidence(sampleSize) {
    return Math.min(sampleSize / 15, 1);
  }

  _calculateContextualConfidence(sampleSize) {
    return Math.min(sampleSize / 10, 1);
  }

  _calculateOutcomeConfidence(sampleSize) {
    return Math.min(sampleSize / 25, 1);
  }
}

module.exports = DeliveryPatternAnalyzer;