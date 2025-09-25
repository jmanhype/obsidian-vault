/**
 * MaturityEngine - Core engine for tracking project maturity progression
 * Manages transitions between POC → MVP → PILOT → PRODUCTION → SCALE
 */

class MaturityEngine {
  constructor(contextEngine, patternRecognition, obsidianIntegration) {
    this.contextEngine = contextEngine;
    this.patternRecognition = patternRecognition;
    this.obsidian = obsidianIntegration;
    
    this.maturityLevels = {
      POC: 1,
      MVP: 2,
      PILOT: 3,
      PRODUCTION: 4,
      SCALE: 5
    };

    this.hardeningRequirements = {
      POC: {
        security: ['basic_auth'],
        reliability: ['manual_testing'],
        scalability: ['single_instance']
      },
      MVP: {
        security: ['https_enabled', 'user_authentication'],
        reliability: ['unit_tests', 'basic_monitoring'],
        scalability: ['load_balancer', 'auto_restart']
      },
      PILOT: {
        security: ['security_scan', 'ssl_certificates', 'input_validation'],
        reliability: ['integration_tests', 'health_checks', 'logging'],
        scalability: ['auto_scaling', 'database_replication']
      },
      PRODUCTION: {
        security: ['penetration_test', 'vulnerability_scan', 'security_headers'],
        reliability: ['e2e_tests', 'monitoring_alerts', 'backup_strategy'],
        scalability: ['multi_region', 'cdn_integration', 'cache_layer']
      },
      SCALE: {
        security: ['compliance_audit', 'threat_modeling', 'security_incident_response'],
        reliability: ['chaos_engineering', 'disaster_recovery', 'performance_testing'],
        scalability: ['global_distribution', 'microservices', 'data_partitioning']
      }
    };

    this.paymentGates = {
      POC_TO_MVP: { percentage: 25, milestone: 'poc_validation' },
      MVP_TO_PILOT: { percentage: 50, milestone: 'mvp_demonstration' },
      PILOT_TO_PRODUCTION: { percentage: 75, milestone: 'pilot_success' },
      PRODUCTION_TO_SCALE: { percentage: 100, milestone: 'production_stability' }
    };
  }

  /**
   * Assess current maturity level of a project
   * @param {string} projectId - Project identifier
   * @returns {Promise<Object>} Current level assessment
   */
  async assessCurrentLevel(projectId) {
    try {
      const projectContext = await this.contextEngine.buildProjectContext(projectId);
      const currentImplementation = projectContext.implementation;
      
      let assessedLevel = 'POC';
      let confidence = 0;
      let blockers = [];

      // Assess against each level's requirements
      for (const [level, requirements] of Object.entries(this.hardeningRequirements)) {
        const levelAssessment = await this._assessLevelRequirements(
          projectId, 
          level, 
          currentImplementation
        );
        
        if (levelAssessment.meetsRequirements) {
          assessedLevel = level;
          confidence = levelAssessment.confidence;
        } else {
          blockers = levelAssessment.blockers;
          break;
        }
      }

      const assessment = {
        projectId,
        currentLevel: assessedLevel,
        confidence,
        blockers,
        nextLevel: this._getNextLevel(assessedLevel),
        timestamp: new Date().toISOString(),
        context: projectContext
      };

      // Record assessment in Obsidian
      await this._recordAssessment(projectId, assessment);
      
      return assessment;
    } catch (error) {
      console.error('Error assessing maturity level:', error);
      throw new Error(`Failed to assess maturity level for project ${projectId}: ${error.message}`);
    }
  }

  /**
   * Validate requirements for a specific maturity level
   * @param {string} projectId - Project identifier
   * @param {string} targetLevel - Target maturity level
   * @returns {Promise<Object>} Validation results
   */
  async validateLevelRequirements(projectId, targetLevel) {
    try {
      const projectContext = await this.contextEngine.buildProjectContext(projectId);
      const requirements = this.hardeningRequirements[targetLevel];
      
      if (!requirements) {
        throw new Error(`Invalid maturity level: ${targetLevel}`);
      }

      const validation = {
        projectId,
        targetLevel,
        requirements: {},
        overallStatus: 'PENDING',
        blockers: [],
        recommendations: [],
        timestamp: new Date().toISOString()
      };

      // Validate L1 (Security) requirements
      validation.requirements.security = await this._validateSecurityRequirements(
        projectContext, 
        requirements.security
      );

      // Validate L2 (Reliability) requirements  
      validation.requirements.reliability = await this._validateReliabilityRequirements(
        projectContext,
        requirements.reliability
      );

      // Validate L3 (Scalability) requirements
      validation.requirements.scalability = await this._validateScalabilityRequirements(
        projectContext,
        requirements.scalability
      );

      // Determine overall status
      const allRequirementsMet = ['security', 'reliability', 'scalability'].every(
        category => validation.requirements[category].status === 'PASSED'
      );

      validation.overallStatus = allRequirementsMet ? 'READY' : 'BLOCKED';
      
      // Collect blockers
      ['security', 'reliability', 'scalability'].forEach(category => {
        if (validation.requirements[category].status === 'FAILED') {
          validation.blockers.push(...validation.requirements[category].blockers);
        }
      });

      // Get AI recommendations
      validation.recommendations = await this.patternRecognition.recommendNextSteps(
        projectId,
        targetLevel
      );

      // Record validation in Obsidian
      await this._recordValidation(projectId, validation);

      return validation;
    } catch (error) {
      console.error('Error validating level requirements:', error);
      throw new Error(`Failed to validate requirements for ${targetLevel}: ${error.message}`);
    }
  }

  /**
   * Initiate transition to next maturity level
   * @param {string} projectId - Project identifier  
   * @param {string} targetLevel - Target maturity level
   * @returns {Promise<Object>} Transition results
   */
  async initiateTransition(projectId, targetLevel) {
    try {
      // First validate requirements
      const validation = await this.validateLevelRequirements(projectId, targetLevel);
      
      if (validation.overallStatus !== 'READY') {
        return {
          status: 'BLOCKED',
          message: 'Requirements not met for transition',
          blockers: validation.blockers,
          projectId,
          targetLevel
        };
      }

      // Create human decision gate
      const decisionGate = await this._createHumanDecisionGate(projectId, targetLevel, validation);
      
      const transition = {
        projectId,
        targetLevel,
        status: 'AWAITING_APPROVAL',
        decisionGateId: decisionGate.id,
        validation,
        paymentGate: this._getPaymentGate(targetLevel),
        timestamp: new Date().toISOString()
      };

      // Record transition initiation in Obsidian
      await this._recordTransitionInitiation(projectId, transition);

      return transition;
    } catch (error) {
      console.error('Error initiating transition:', error);
      throw new Error(`Failed to initiate transition to ${targetLevel}: ${error.message}`);
    }
  }

  /**
   * Record human decision for level transition
   * @param {string} projectId - Project identifier
   * @param {Object} decision - Decision object with approval/rationale
   * @returns {Promise<Object>} Decision record
   */
  async recordDecision(projectId, decision) {
    try {
      const decisionRecord = {
        projectId,
        decision: decision.approved ? 'APPROVED' : 'REJECTED',
        approver: decision.approver,
        rationale: decision.rationale,
        conditions: decision.conditions || [],
        timestamp: new Date().toISOString(),
        evidence: decision.evidence || []
      };

      // Record in Obsidian decision history
      await this._recordDecisionHistory(projectId, decisionRecord);

      // If approved, execute the transition
      if (decision.approved) {
        await this._executeTransition(projectId, decision.targetLevel);
        
        // Trigger payment gate if applicable
        const paymentGate = this._getPaymentGate(decision.targetLevel);
        if (paymentGate) {
          await this._triggerPaymentGate(projectId, paymentGate, decision.targetLevel);
        }
      }

      return decisionRecord;
    } catch (error) {
      console.error('Error recording decision:', error);
      throw new Error(`Failed to record decision: ${error.message}`);
    }
  }

  /**
   * Get project maturity history
   * @param {string} projectId - Project identifier
   * @returns {Promise<Array>} Maturity progression history
   */
  async getMaturityHistory(projectId) {
    try {
      return await this.obsidian.getProjectMaturityHistory(projectId);
    } catch (error) {
      console.error('Error getting maturity history:', error);
      throw new Error(`Failed to get maturity history: ${error.message}`);
    }
  }

  // Private helper methods

  async _assessLevelRequirements(projectId, level, implementation) {
    const requirements = this.hardeningRequirements[level];
    let totalChecks = 0;
    let passedChecks = 0;
    const blockers = [];

    for (const [category, reqs] of Object.entries(requirements)) {
      for (const req of reqs) {
        totalChecks++;
        const passed = await this._checkRequirement(implementation, category, req);
        if (passed) {
          passedChecks++;
        } else {
          blockers.push({ category, requirement: req });
        }
      }
    }

    return {
      meetsRequirements: blockers.length === 0,
      confidence: passedChecks / totalChecks,
      blockers
    };
  }

  async _checkRequirement(implementation, category, requirement) {
    // This would integrate with actual implementation checking
    // For now, return mock results based on implementation context
    return implementation[category]?.includes(requirement) || false;
  }

  _getNextLevel(currentLevel) {
    const levels = Object.keys(this.maturityLevels);
    const currentIndex = levels.indexOf(currentLevel);
    return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null;
  }

  _getPaymentGate(targetLevel) {
    const gateMap = {
      MVP: this.paymentGates.POC_TO_MVP,
      PILOT: this.paymentGates.MVP_TO_PILOT,
      PRODUCTION: this.paymentGates.PILOT_TO_PRODUCTION,
      SCALE: this.paymentGates.PRODUCTION_TO_SCALE
    };
    return gateMap[targetLevel];
  }

  async _validateSecurityRequirements(context, requirements) {
    // Implement security requirement validation
    return { status: 'PASSED', details: requirements, blockers: [] };
  }

  async _validateReliabilityRequirements(context, requirements) {
    // Implement reliability requirement validation  
    return { status: 'PASSED', details: requirements, blockers: [] };
  }

  async _validateScalabilityRequirements(context, requirements) {
    // Implement scalability requirement validation
    return { status: 'PASSED', details: requirements, blockers: [] };
  }

  async _createHumanDecisionGate(projectId, targetLevel, validation) {
    const gateId = `gate_${projectId}_${targetLevel}_${Date.now()}`;
    
    const decisionGate = {
      id: gateId,
      projectId,
      targetLevel,
      validation,
      status: 'PENDING',
      created: new Date().toISOString()
    };

    // Create decision gate note in Obsidian
    await this.obsidian.createDecisionGateNote(decisionGate);
    
    return decisionGate;
  }

  async _executeTransition(projectId, targetLevel) {
    // Execute the actual level transition
    await this.contextEngine.updateContext(projectId, {
      maturityLevel: targetLevel,
      transitionDate: new Date().toISOString()
    });
  }

  async _triggerPaymentGate(projectId, paymentGate, targetLevel) {
    // Integration with payment system
    console.log(`Triggering payment gate for ${projectId}: ${paymentGate.percentage}% at ${targetLevel}`);
    // This would integrate with actual payment processing
  }

  async _recordAssessment(projectId, assessment) {
    await this.obsidian.updateProjectNote(projectId, {
      latestAssessment: assessment,
      assessmentHistory: assessment
    });
  }

  async _recordValidation(projectId, validation) {
    await this.obsidian.updateProjectNote(projectId, {
      latestValidation: validation,
      validationHistory: validation
    });
  }

  async _recordTransitionInitiation(projectId, transition) {
    await this.obsidian.updateProjectNote(projectId, {
      activeTransition: transition,
      transitionHistory: transition
    });
  }

  async _recordDecisionHistory(projectId, decision) {
    await this.obsidian.updateProjectNote(projectId, {
      decisionHistory: decision
    });
  }
}

module.exports = MaturityEngine;