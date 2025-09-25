/**
 * Maturity Tracking System - Core Module
 * 
 * Manages the state machine for POC/MVP/PILOT/PRODUCTION/SCALE levels
 * with L1/L2/L3 hardening checkpoints and human decision gates.
 * 
 * CRITICAL: This system NEVER automates client decisions.
 * All transitions require explicit human approval.
 */

const EventEmitter = require('events');

class MaturityTracker extends EventEmitter {
    constructor(options = {}) {
        super();
        this.auditTrail = [];
        this.currentState = {
            level: 'POC',
            checkpoint: 'L1',
            status: 'active',
            timestamp: new Date().toISOString(),
            metadata: {}
        };
        this.humanDecisionPending = false;
        this.paymentGateStatus = 'none';
        
        // Initialize audit trail
        this._recordAuditEvent('system_initialized', {
            initialState: this.currentState,
            options
        });
    }

    /**
     * Get current maturity state with all details
     */
    getCurrentState() {
        return {
            ...this.currentState,
            humanDecisionPending: this.humanDecisionPending,
            paymentGateStatus: this.paymentGateStatus,
            availableTransitions: this._getAvailableTransitions(),
            auditTrailCount: this.auditTrail.length
        };
    }

    /**
     * Get available state transitions based on current state
     * NEVER prescribes what the client should do - only presents options
     */
    _getAvailableTransitions() {
        const { level, checkpoint } = this.currentState;
        
        const transitions = {
            POC: {
                L1: ['POC-L2', 'abort'],
                L2: ['POC-L3', 'rollback-L1', 'abort'], 
                L3: ['MVP-L1', 'rollback-L2', 'abort']
            },
            MVP: {
                L1: ['MVP-L2', 'rollback-POC-L3', 'abort'],
                L2: ['MVP-L3', 'rollback-L1', 'abort'],
                L3: ['PILOT-L1', 'rollback-L2', 'abort']
            },
            PILOT: {
                L1: ['PILOT-L2', 'rollback-MVP-L3', 'abort'],
                L2: ['PILOT-L3', 'rollback-L1', 'abort'], 
                L3: ['PRODUCTION-L1', 'rollback-L2', 'abort']
            },
            PRODUCTION: {
                L1: ['PRODUCTION-L2', 'rollback-PILOT-L3', 'abort'],
                L2: ['PRODUCTION-L3', 'rollback-L1', 'abort'],
                L3: ['SCALE-L1', 'rollback-L2', 'abort']
            },
            SCALE: {
                L1: ['SCALE-L2', 'rollback-PRODUCTION-L3', 'abort'],
                L2: ['SCALE-L3', 'rollback-L1', 'abort'],
                L3: ['maintain', 'optimize', 'abort']
            }
        };

        return transitions[level]?.[checkpoint] || [];
    }

    /**
     * Present transition options to human decision maker
     * This method NEVER makes decisions - only presents options
     */
    async presentTransitionOptions() {
        if (this.humanDecisionPending) {
            throw new Error('Another human decision is already pending');
        }

        const availableTransitions = this._getAvailableTransitions();
        const checkpointDetails = this._getCheckpointDetails(this.currentState.level, this.currentState.checkpoint);
        const paymentRequired = this._checkPaymentGateRequired(availableTransitions);

        const presentationData = {
            currentState: this.currentState,
            checkpointDetails,
            availableTransitions: availableTransitions.map(transition => ({
                transition,
                description: this._getTransitionDescription(transition),
                paymentRequired: paymentRequired.includes(transition),
                riskLevel: this._getTransitionRisk(transition),
                estimatedEffort: this._getEstimatedEffort(transition)
            })),
            paymentGateInfo: paymentRequired.length > 0 ? this._getPaymentGateDetails() : null
        };

        this.humanDecisionPending = true;
        this._recordAuditEvent('transition_options_presented', presentationData);
        
        this.emit('human_decision_required', presentationData);
        
        return presentationData;
    }

    /**
     * Process human decision for state transition
     * This method validates and executes human-approved transitions
     */
    async processHumanDecision(decision) {
        if (!this.humanDecisionPending) {
            throw new Error('No human decision is currently pending');
        }

        const { transition, justification, paymentConfirmation } = decision;
        
        // Validate the selected transition is available
        const availableTransitions = this._getAvailableTransitions();
        if (!availableTransitions.includes(transition)) {
            this._recordAuditEvent('invalid_transition_attempted', { 
                transition, 
                available: availableTransitions,
                justification
            });
            throw new Error(`Invalid transition: ${transition}. Available: ${availableTransitions.join(', ')}`);
        }

        // Check payment gate requirements
        const paymentRequired = this._checkPaymentGateRequired([transition]);
        if (paymentRequired.includes(transition) && !paymentConfirmation) {
            this._recordAuditEvent('payment_gate_failed', { transition, paymentRequired });
            throw new Error(`Payment confirmation required for transition: ${transition}`);
        }

        // Execute the transition
        const previousState = { ...this.currentState };
        const newState = this._executeTransition(transition);
        
        this.currentState = newState;
        this.humanDecisionPending = false;
        
        this._recordAuditEvent('human_decision_processed', {
            previousState,
            newState,
            transition,
            justification,
            paymentConfirmation
        });

        this.emit('state_transition_completed', {
            previousState,
            newState,
            transition,
            justification
        });

        return this.getCurrentState();
    }

    /**
     * Execute the actual state transition logic
     */
    _executeTransition(transition) {
        const [targetLevel, targetCheckpoint] = this._parseTransition(transition);
        
        return {
            level: targetLevel || this.currentState.level,
            checkpoint: targetCheckpoint || this.currentState.checkpoint,
            status: 'active',
            timestamp: new Date().toISOString(),
            metadata: {
                ...this.currentState.metadata,
                lastTransition: transition,
                transitionTimestamp: new Date().toISOString()
            }
        };
    }

    /**
     * Parse transition string into level and checkpoint
     */
    _parseTransition(transition) {
        if (transition === 'abort') return ['ABORTED', 'N/A'];
        if (transition === 'maintain') return ['SCALE', 'L3'];
        if (transition === 'optimize') return ['SCALE', 'L3'];
        
        // Handle rollback transitions
        if (transition.startsWith('rollback-')) {
            const target = transition.replace('rollback-', '');
            if (target.includes('-')) {
                const [level, checkpoint] = target.split('-');
                return [level, checkpoint];
            }
            return [null, target]; // Just checkpoint rollback
        }

        // Handle forward transitions
        const [level, checkpoint] = transition.split('-');
        return [level, checkpoint];
    }

    /**
     * Get detailed checkpoint requirements and validation criteria
     */
    _getCheckpointDetails(level, checkpoint) {
        const checkpoints = {
            POC: {
                L1: {
                    name: 'Proof of Concept - Basic Validation',
                    requirements: [
                        'Core concept validation',
                        'Basic technical feasibility confirmed',
                        'Initial stakeholder buy-in',
                        'Risk assessment completed'
                    ],
                    validation: ['Technical review', 'Stakeholder approval'],
                    estimatedDuration: '1-2 weeks'
                },
                L2: {
                    name: 'Proof of Concept - Enhanced Validation', 
                    requirements: [
                        'Detailed technical architecture',
                        'Resource requirements identified',
                        'Initial prototype developed',
                        'Success metrics defined'
                    ],
                    validation: ['Architecture review', 'Prototype demonstration'],
                    estimatedDuration: '2-4 weeks'
                },
                L3: {
                    name: 'Proof of Concept - Full Validation',
                    requirements: [
                        'Complete POC implementation',
                        'Performance benchmarks met',
                        'Business case validated',
                        'Go/no-go decision framework'
                    ],
                    validation: ['Complete POC review', 'Business case approval'],
                    estimatedDuration: '1-2 weeks'
                }
            },
            MVP: {
                L1: {
                    name: 'Minimum Viable Product - Foundation',
                    requirements: [
                        'Core features implemented',
                        'Basic user interface',
                        'Essential functionality working',
                        'Initial testing completed'
                    ],
                    validation: ['Feature review', 'Basic user testing'],
                    estimatedDuration: '4-8 weeks'
                },
                L2: {
                    name: 'Minimum Viable Product - Enhancement',
                    requirements: [
                        'User feedback incorporated',
                        'Performance optimizations',
                        'Additional features added',
                        'Quality assurance testing'
                    ],
                    validation: ['User acceptance testing', 'Performance review'],
                    estimatedDuration: '4-6 weeks'
                },
                L3: {
                    name: 'Minimum Viable Product - Market Ready',
                    requirements: [
                        'Market-ready functionality',
                        'Documentation completed', 
                        'Support systems in place',
                        'Launch readiness confirmed'
                    ],
                    validation: ['Market readiness review', 'Launch approval'],
                    estimatedDuration: '2-4 weeks'
                }
            },
            PILOT: {
                L1: {
                    name: 'Pilot Program - Limited Deployment',
                    requirements: [
                        'Limited user group identified',
                        'Pilot environment setup',
                        'Monitoring systems active',
                        'Feedback collection mechanisms'
                    ],
                    validation: ['Pilot readiness review', 'Stakeholder approval'],
                    estimatedDuration: '2-4 weeks'
                },
                L2: {
                    name: 'Pilot Program - Active Monitoring',
                    requirements: [
                        'Users actively engaged',
                        'Performance metrics collected',
                        'Issues tracked and resolved',
                        'Regular feedback sessions'
                    ],
                    validation: ['Performance review', 'User satisfaction survey'],
                    estimatedDuration: '8-12 weeks'
                },
                L3: {
                    name: 'Pilot Program - Success Validation',
                    requirements: [
                        'Success criteria met',
                        'Scalability validated',
                        'Business value demonstrated',
                        'Production readiness confirmed'
                    ],
                    validation: ['Pilot success review', 'Production readiness assessment'],
                    estimatedDuration: '2-4 weeks'
                }
            },
            PRODUCTION: {
                L1: {
                    name: 'Production Deployment - Initial Launch',
                    requirements: [
                        'Production environment ready',
                        'Security measures implemented',
                        'Backup and recovery systems',
                        'Monitoring and alerting active'
                    ],
                    validation: ['Production readiness checklist', 'Security audit'],
                    estimatedDuration: '4-8 weeks'
                },
                L2: {
                    name: 'Production Deployment - Stable Operations',
                    requirements: [
                        'System stability confirmed',
                        'User adoption tracking',
                        'Performance optimization',
                        'Support processes established'
                    ],
                    validation: ['Stability review', 'User adoption metrics'],
                    estimatedDuration: '8-16 weeks'
                },
                L3: {
                    name: 'Production Deployment - Full Maturity',
                    requirements: [
                        'Full operational maturity',
                        'Comprehensive documentation',
                        'Training programs complete',
                        'Continuous improvement processes'
                    ],
                    validation: ['Maturity assessment', 'Operational review'],
                    estimatedDuration: '12-24 weeks'
                }
            },
            SCALE: {
                L1: {
                    name: 'Scale Operations - Growth Preparation',
                    requirements: [
                        'Scalability architecture implemented',
                        'Automated deployment pipelines',
                        'Load testing completed',
                        'Capacity planning done'
                    ],
                    validation: ['Scalability review', 'Performance benchmarking'],
                    estimatedDuration: '8-16 weeks'
                },
                L2: {
                    name: 'Scale Operations - Active Scaling',
                    requirements: [
                        'Multi-region deployment',
                        'Advanced monitoring systems',
                        'Automated scaling mechanisms',
                        'Business continuity plans'
                    ],
                    validation: ['Scale testing', 'Business continuity review'],
                    estimatedDuration: '12-24 weeks'
                },
                L3: {
                    name: 'Scale Operations - Enterprise Grade',
                    requirements: [
                        'Enterprise-grade reliability',
                        'Advanced security measures',
                        'Compliance certifications',
                        'Global deployment capability'
                    ],
                    validation: ['Enterprise readiness audit', 'Compliance verification'],
                    estimatedDuration: '16-32 weeks'
                }
            }
        };

        return checkpoints[level]?.[checkpoint] || null;
    }

    /**
     * Get transition description for human readability
     */
    _getTransitionDescription(transition) {
        const descriptions = {
            'abort': 'Stop the project and exit the maturity tracking system',
            'maintain': 'Continue maintaining current scale level',
            'optimize': 'Focus on optimization at current scale level'
        };

        if (descriptions[transition]) return descriptions[transition];

        if (transition.startsWith('rollback-')) {
            const target = transition.replace('rollback-', '');
            return `Roll back to previous state: ${target}`;
        }

        const [level, checkpoint] = transition.split('-');
        const details = this._getCheckpointDetails(level, checkpoint);
        return details ? `Advance to ${details.name}` : `Move to ${transition}`;
    }

    /**
     * Assess risk level for transitions
     */
    _getTransitionRisk(transition) {
        if (transition === 'abort') return 'high';
        if (transition.startsWith('rollback-')) return 'medium';
        
        const [level, checkpoint] = transition.split('-');
        
        // Level transitions are higher risk
        const currentLevel = this.currentState.level;
        if (level !== currentLevel) return 'high';
        
        // Checkpoint advances are medium risk
        return 'medium';
    }

    /**
     * Estimate effort for transitions
     */
    _getEstimatedEffort(transition) {
        if (transition === 'abort') return 'low';
        if (transition.startsWith('rollback-')) return 'medium';
        
        const [level, checkpoint] = transition.split('-');
        const details = this._getCheckpointDetails(level, checkpoint);
        
        return details?.estimatedDuration || 'unknown';
    }

    /**
     * Check which transitions require payment gates
     */
    _checkPaymentGateRequired(transitions) {
        // Payment gates required for level transitions
        const paymentTransitions = [];
        const currentLevel = this.currentState.level;
        
        transitions.forEach(transition => {
            if (transition === 'abort') return;
            if (transition.startsWith('rollback-')) return;
            
            const [level] = transition.split('-');
            if (level !== currentLevel) {
                paymentTransitions.push(transition);
            }
        });
        
        return paymentTransitions;
    }

    /**
     * Get payment gate details and pricing
     */
    _getPaymentGateDetails() {
        return {
            message: 'Level transitions require payment confirmation',
            note: 'This system does not process payments - it only validates that payment has been confirmed externally',
            requirement: 'Payment confirmation must be provided by authorized personnel'
        };
    }

    /**
     * Record audit trail event
     */
    _recordAuditEvent(eventType, data) {
        const auditEntry = {
            id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            eventType,
            data,
            systemState: { ...this.currentState }
        };
        
        this.auditTrail.push(auditEntry);
        
        // Emit audit event for external logging
        this.emit('audit_event', auditEntry);
    }

    /**
     * Get complete audit trail
     */
    getAuditTrail(filter = {}) {
        let filtered = [...this.auditTrail];
        
        if (filter.eventType) {
            filtered = filtered.filter(entry => entry.eventType === filter.eventType);
        }
        
        if (filter.since) {
            filtered = filtered.filter(entry => new Date(entry.timestamp) >= new Date(filter.since));
        }
        
        if (filter.limit) {
            filtered = filtered.slice(-filter.limit);
        }
        
        return filtered;
    }

    /**
     * Generate audit report
     */
    generateAuditReport() {
        const trail = this.auditTrail;
        const eventTypes = [...new Set(trail.map(entry => entry.eventType))];
        const stateTransitions = trail.filter(entry => entry.eventType === 'human_decision_processed');
        
        return {
            summary: {
                totalEvents: trail.length,
                eventTypes: eventTypes.length,
                stateTransitions: stateTransitions.length,
                firstEvent: trail[0]?.timestamp,
                lastEvent: trail[trail.length - 1]?.timestamp
            },
            eventTypeCounts: eventTypes.reduce((counts, type) => {
                counts[type] = trail.filter(entry => entry.eventType === type).length;
                return counts;
            }, {}),
            stateHistory: stateTransitions.map(entry => ({
                timestamp: entry.timestamp,
                from: entry.data.previousState,
                to: entry.data.newState,
                transition: entry.data.transition,
                justification: entry.data.justification
            })),
            currentState: this.getCurrentState()
        };
    }
}

module.exports = MaturityTracker;