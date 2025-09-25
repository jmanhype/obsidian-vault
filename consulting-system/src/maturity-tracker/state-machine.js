/**
 * State Machine Configuration for Maturity Tracking System
 * 
 * Defines the formal state machine structure with all valid states,
 * transitions, checkpoints, and validation rules.
 */

class MaturityStateMachine {
    constructor() {
        this.states = this._defineStates();
        this.transitions = this._defineTransitions();
        this.checkpoints = this._defineCheckpoints();
        this.validationRules = this._defineValidationRules();
    }

    /**
     * Define all valid states in the maturity model
     */
    _defineStates() {
        return {
            POC: {
                name: 'Proof of Concept',
                description: 'Initial concept validation and feasibility assessment',
                checkpoints: ['L1', 'L2', 'L3'],
                color: '#FFA500', // Orange
                icon: 'flask'
            },
            MVP: {
                name: 'Minimum Viable Product',
                description: 'Basic functional product with core features',
                checkpoints: ['L1', 'L2', 'L3'],
                color: '#FFD700', // Gold
                icon: 'wrench'
            },
            PILOT: {
                name: 'Pilot Program',
                description: 'Limited deployment for real-world testing',
                checkpoints: ['L1', 'L2', 'L3'],
                color: '#87CEEB', // Sky Blue
                icon: 'test-tube'
            },
            PRODUCTION: {
                name: 'Production Deployment',
                description: 'Full production system serving real users',
                checkpoints: ['L1', 'L2', 'L3'],
                color: '#32CD32', // Lime Green
                icon: 'server'
            },
            SCALE: {
                name: 'Scale Operations',
                description: 'Enterprise-grade scalable system',
                checkpoints: ['L1', 'L2', 'L3'],
                color: '#4169E1', // Royal Blue
                icon: 'chart-line'
            },
            ABORTED: {
                name: 'Project Aborted',
                description: 'Project terminated before completion',
                checkpoints: ['N/A'],
                color: '#DC143C', // Crimson
                icon: 'times-circle'
            }
        };
    }

    /**
     * Define all valid state transitions
     */
    _defineTransitions() {
        return {
            // POC Transitions
            'POC-L1': {
                to: [
                    { state: 'POC', checkpoint: 'L2', type: 'advance' },
                    { state: 'ABORTED', checkpoint: 'N/A', type: 'abort' }
                ]
            },
            'POC-L2': {
                to: [
                    { state: 'POC', checkpoint: 'L3', type: 'advance' },
                    { state: 'POC', checkpoint: 'L1', type: 'rollback' },
                    { state: 'ABORTED', checkpoint: 'N/A', type: 'abort' }
                ]
            },
            'POC-L3': {
                to: [
                    { state: 'MVP', checkpoint: 'L1', type: 'level_advance', paymentGate: true },
                    { state: 'POC', checkpoint: 'L2', type: 'rollback' },
                    { state: 'ABORTED', checkpoint: 'N/A', type: 'abort' }
                ]
            },

            // MVP Transitions
            'MVP-L1': {
                to: [
                    { state: 'MVP', checkpoint: 'L2', type: 'advance' },
                    { state: 'POC', checkpoint: 'L3', type: 'level_rollback' },
                    { state: 'ABORTED', checkpoint: 'N/A', type: 'abort' }
                ]
            },
            'MVP-L2': {
                to: [
                    { state: 'MVP', checkpoint: 'L3', type: 'advance' },
                    { state: 'MVP', checkpoint: 'L1', type: 'rollback' },
                    { state: 'ABORTED', checkpoint: 'N/A', type: 'abort' }
                ]
            },
            'MVP-L3': {
                to: [
                    { state: 'PILOT', checkpoint: 'L1', type: 'level_advance', paymentGate: true },
                    { state: 'MVP', checkpoint: 'L2', type: 'rollback' },
                    { state: 'ABORTED', checkpoint: 'N/A', type: 'abort' }
                ]
            },

            // PILOT Transitions
            'PILOT-L1': {
                to: [
                    { state: 'PILOT', checkpoint: 'L2', type: 'advance' },
                    { state: 'MVP', checkpoint: 'L3', type: 'level_rollback' },
                    { state: 'ABORTED', checkpoint: 'N/A', type: 'abort' }
                ]
            },
            'PILOT-L2': {
                to: [
                    { state: 'PILOT', checkpoint: 'L3', type: 'advance' },
                    { state: 'PILOT', checkpoint: 'L1', type: 'rollback' },
                    { state: 'ABORTED', checkpoint: 'N/A', type: 'abort' }
                ]
            },
            'PILOT-L3': {
                to: [
                    { state: 'PRODUCTION', checkpoint: 'L1', type: 'level_advance', paymentGate: true },
                    { state: 'PILOT', checkpoint: 'L2', type: 'rollback' },
                    { state: 'ABORTED', checkpoint: 'N/A', type: 'abort' }
                ]
            },

            // PRODUCTION Transitions
            'PRODUCTION-L1': {
                to: [
                    { state: 'PRODUCTION', checkpoint: 'L2', type: 'advance' },
                    { state: 'PILOT', checkpoint: 'L3', type: 'level_rollback' },
                    { state: 'ABORTED', checkpoint: 'N/A', type: 'abort' }
                ]
            },
            'PRODUCTION-L2': {
                to: [
                    { state: 'PRODUCTION', checkpoint: 'L3', type: 'advance' },
                    { state: 'PRODUCTION', checkpoint: 'L1', type: 'rollback' },
                    { state: 'ABORTED', checkpoint: 'N/A', type: 'abort' }
                ]
            },
            'PRODUCTION-L3': {
                to: [
                    { state: 'SCALE', checkpoint: 'L1', type: 'level_advance', paymentGate: true },
                    { state: 'PRODUCTION', checkpoint: 'L2', type: 'rollback' },
                    { state: 'ABORTED', checkpoint: 'N/A', type: 'abort' }
                ]
            },

            // SCALE Transitions
            'SCALE-L1': {
                to: [
                    { state: 'SCALE', checkpoint: 'L2', type: 'advance' },
                    { state: 'PRODUCTION', checkpoint: 'L3', type: 'level_rollback' },
                    { state: 'ABORTED', checkpoint: 'N/A', type: 'abort' }
                ]
            },
            'SCALE-L2': {
                to: [
                    { state: 'SCALE', checkpoint: 'L3', type: 'advance' },
                    { state: 'SCALE', checkpoint: 'L1', type: 'rollback' },
                    { state: 'ABORTED', checkpoint: 'N/A', type: 'abort' }
                ]
            },
            'SCALE-L3': {
                to: [
                    { state: 'SCALE', checkpoint: 'L3', type: 'maintain' },
                    { state: 'SCALE', checkpoint: 'L3', type: 'optimize' },
                    { state: 'SCALE', checkpoint: 'L2', type: 'rollback' },
                    { state: 'ABORTED', checkpoint: 'N/A', type: 'abort' }
                ]
            }
        };
    }

    /**
     * Define checkpoint hardening requirements
     */
    _defineCheckpoints() {
        return {
            L1: {
                name: 'Basic Hardening',
                description: 'Fundamental requirements and validation',
                requirements: {
                    mandatory: ['stakeholder_approval', 'risk_assessment'],
                    recommended: ['documentation', 'initial_testing'],
                    optional: ['peer_review']
                },
                validationCriteria: {
                    technical: ['basic_functionality_verified'],
                    business: ['business_case_documented'],
                    risk: ['major_risks_identified']
                }
            },
            L2: {
                name: 'Enhanced Hardening',
                description: 'Comprehensive validation and optimization',
                requirements: {
                    mandatory: ['performance_testing', 'security_review', 'stakeholder_signoff'],
                    recommended: ['user_feedback', 'optimization_completed'],
                    optional: ['third_party_review']
                },
                validationCriteria: {
                    technical: ['performance_benchmarks_met', 'security_scan_passed'],
                    business: ['success_metrics_defined', 'roi_calculated'],
                    risk: ['mitigation_strategies_implemented']
                }
            },
            L3: {
                name: 'Full Hardening',
                description: 'Complete validation and readiness confirmation',
                requirements: {
                    mandatory: ['comprehensive_testing', 'documentation_complete', 'readiness_confirmed'],
                    recommended: ['training_completed', 'support_systems_ready'],
                    optional: ['compliance_audit']
                },
                validationCriteria: {
                    technical: ['all_tests_passed', 'production_ready'],
                    business: ['business_value_demonstrated', 'success_criteria_met'],
                    risk: ['all_risks_mitigated', 'contingency_plans_ready']
                }
            }
        };
    }

    /**
     * Define validation rules for state transitions
     */
    _defineValidationRules() {
        return {
            // Level advance rules (require payment gates)
            level_advance: {
                requiresPaymentGate: true,
                requiresFullL3Hardening: true,
                requiresStakeholderApproval: true,
                minimumDwellTime: '1 week', // Minimum time in current state
                requiredDocumentation: ['business_case', 'technical_specs', 'risk_assessment']
            },

            // Checkpoint advance rules
            advance: {
                requiresPaymentGate: false,
                requiresHardeningCompletion: true,
                requiresStakeholderApproval: false,
                minimumDwellTime: '3 days'
            },

            // Rollback rules
            rollback: {
                requiresPaymentGate: false,
                requiresJustification: true,
                requiresStakeholderApproval: false,
                allowsDataPreservation: true
            },

            // Level rollback rules
            level_rollback: {
                requiresPaymentGate: false,
                requiresJustification: true,
                requiresStakeholderApproval: true,
                allowsDataPreservation: true,
                requiresPostMortem: true
            },

            // Abort rules
            abort: {
                requiresPaymentGate: false,
                requiresJustification: true,
                requiresStakeholderApproval: true,
                requiresPostMortem: true,
                isIrreversible: true
            },

            // Maintenance rules (SCALE-L3 only)
            maintain: {
                requiresPaymentGate: false,
                requiresStatusReport: true,
                allowsContinuousImprovement: true
            },

            // Optimization rules (SCALE-L3 only)
            optimize: {
                requiresPaymentGate: false,
                requiresOptimizationPlan: true,
                requiresPerformanceTargets: true
            }
        };
    }

    /**
     * Validate if a transition is allowed from current state
     */
    validateTransition(currentState, targetTransition) {
        const currentKey = `${currentState.level}-${currentState.checkpoint}`;
        const allowedTransitions = this.transitions[currentKey];

        if (!allowedTransitions) {
            return {
                valid: false,
                error: `No transitions defined for state ${currentKey}`
            };
        }

        const targetTransitionData = allowedTransitions.to.find(t => 
            this._matchesTransition(t, targetTransition)
        );

        if (!targetTransitionData) {
            return {
                valid: false,
                error: `Transition ${targetTransition} not allowed from ${currentKey}`,
                allowedTransitions: allowedTransitions.to.map(t => this._formatTransition(t))
            };
        }

        return {
            valid: true,
            transitionData: targetTransitionData,
            validationRules: this.validationRules[targetTransitionData.type]
        };
    }

    /**
     * Check if a transition matches the target
     */
    _matchesTransition(transitionData, targetTransition) {
        const formatted = this._formatTransition(transitionData);
        return formatted === targetTransition;
    }

    /**
     * Format transition data into string representation
     */
    _formatTransition(transitionData) {
        if (transitionData.type === 'abort') return 'abort';
        if (transitionData.type === 'maintain') return 'maintain';
        if (transitionData.type === 'optimize') return 'optimize';
        
        if (transitionData.type.includes('rollback')) {
            return `rollback-${transitionData.state}-${transitionData.checkpoint}`;
        }
        
        return `${transitionData.state}-${transitionData.checkpoint}`;
    }

    /**
     * Get all valid states and their metadata
     */
    getStates() {
        return this.states;
    }

    /**
     * Get state metadata
     */
    getStateInfo(stateName) {
        return this.states[stateName] || null;
    }

    /**
     * Get checkpoint metadata
     */
    getCheckpointInfo(checkpointLevel) {
        return this.checkpoints[checkpointLevel] || null;
    }

    /**
     * Get validation rules for transition type
     */
    getValidationRules(transitionType) {
        return this.validationRules[transitionType] || null;
    }

    /**
     * Generate state machine visualization data
     */
    generateVisualizationData() {
        const nodes = [];
        const edges = [];

        // Create nodes for all state-checkpoint combinations
        Object.keys(this.states).forEach(stateName => {
            const state = this.states[stateName];
            state.checkpoints.forEach(checkpoint => {
                nodes.push({
                    id: `${stateName}-${checkpoint}`,
                    label: `${state.name}\n${checkpoint}`,
                    color: state.color,
                    icon: state.icon,
                    level: stateName,
                    checkpoint: checkpoint
                });
            });
        });

        // Create edges for all transitions
        Object.keys(this.transitions).forEach(fromState => {
            const transitions = this.transitions[fromState];
            transitions.to.forEach(transition => {
                const toState = this._formatTransition(transition);
                if (toState !== 'abort' && toState !== 'maintain' && toState !== 'optimize') {
                    edges.push({
                        from: fromState,
                        to: toState,
                        type: transition.type,
                        paymentGate: transition.paymentGate || false,
                        color: transition.paymentGate ? '#DC143C' : '#808080'
                    });
                }
            });
        });

        return { nodes, edges };
    }
}

module.exports = MaturityStateMachine;