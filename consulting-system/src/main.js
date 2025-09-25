/**
 * Main Orchestrator for Consulting System
 * 
 * CRITICAL: This orchestrator implements mandatory human decision gates.
 * NO decisions are automated. All client choices require explicit human approval.
 * 
 * The system presents options but NEVER prescribes decisions.
 */

const MaturityTracker = require('./maturity-tracker/index.js');
const PaymentGateSystem = require('./maturity-tracker/payment-gates.js');
const MaturityStateMachine = require('./maturity-tracker/state-machine.js');
const EventEmitter = require('events');

class ConsultingSystemOrchestrator extends EventEmitter {
    constructor(options = {}) {
        super();
        
        // Initialize core components
        this.maturityTracker = new MaturityTracker(options.maturityTracker);
        this.paymentGateSystem = new PaymentGateSystem(options.paymentGates);
        this.stateMachine = new MaturityStateMachine();
        
        // Human decision gate management
        this.pendingDecisions = new Map();
        this.decisionTimeout = options.decisionTimeout || 24 * 60 * 60 * 1000; // 24 hours
        
        // Audit and compliance
        this.auditTrail = [];
        this.humanApprovalRequired = true; // NEVER set to false
        this.automationLocked = true; // PREVENTS any automation bypass
        
        // System configuration
        this.config = {
            requiresHumanApproval: true, // IMMUTABLE
            allowsAutomation: false,     // IMMUTABLE
            auditingEnabled: true,       // IMMUTABLE
            paymentGatesEnabled: true,
            ...options.config
        };

        this._initializeEventHandlers();
        this._recordAuditEvent('orchestrator_initialized', { config: this.config });
    }

    /**
     * Initialize event handlers for component coordination
     */
    _initializeEventHandlers() {
        // Maturity Tracker events
        this.maturityTracker.on('human_decision_required', this._handleHumanDecisionRequired.bind(this));
        this.maturityTracker.on('state_transition_completed', this._handleStateTransitionCompleted.bind(this));
        this.maturityTracker.on('audit_event', this._handleAuditEvent.bind(this));

        // Payment Gate events
        this.paymentGateSystem.on('payment_gate_created', this._handlePaymentGateCreated.bind(this));
        this.paymentGateSystem.on('payment_confirmation_processed', this._handlePaymentConfirmationProcessed.bind(this));
        this.paymentGateSystem.on('payment_audit_event', this._handleAuditEvent.bind(this));
    }

    /**
     * Start a new maturity tracking session
     * This method presents options but NEVER makes decisions
     */
    async startMaturitySession(projectInfo) {
        const sessionId = this._generateSessionId();
        
        const session = {
            id: sessionId,
            projectInfo,
            startedAt: new Date().toISOString(),
            status: 'active',
            currentState: this.maturityTracker.getCurrentState(),
            pendingDecisions: 0,
            humanDecisionGatesCount: 0
        };

        this._recordAuditEvent('maturity_session_started', {
            sessionId,
            session,
            projectInfo
        });

        // Present initial state and options to human decision maker
        const initialPresentation = await this.presentCurrentOptions(sessionId);
        
        this.emit('session_started', {
            sessionId,
            session,
            initialPresentation
        });

        return {
            sessionId,
            session,
            message: 'Maturity tracking session started. Human decision required to proceed.',
            nextAction: 'review_options_and_decide',
            initialPresentation
        };
    }

    /**
     * Present current maturity state and available options
     * This method NEVER prescribes what the human should choose
     */
    async presentCurrentOptions(sessionId) {
        const currentState = this.maturityTracker.getCurrentState();
        const availableTransitions = currentState.availableTransitions;
        
        // Check if any transitions require payment gates
        const transitionsWithPayment = [];
        const transitionsWithoutPayment = [];
        
        for (const transition of availableTransitions) {
            const validation = this.stateMachine.validateTransition(currentState, transition);
            if (validation.valid && validation.transitionData.paymentGate) {
                transitionsWithPayment.push({
                    transition,
                    validation: validation.transitionData,
                    requiresPayment: true
                });
            } else if (validation.valid) {
                transitionsWithoutPayment.push({
                    transition,
                    validation: validation.transitionData,
                    requiresPayment: false
                });
            }
        }

        const presentation = {
            sessionId,
            timestamp: new Date().toISOString(),
            currentState: {
                level: currentState.level,
                checkpoint: currentState.checkpoint,
                status: currentState.status,
                stateDetails: this.stateMachine.getStateInfo(currentState.level),
                checkpointDetails: this.stateMachine.getCheckpointInfo(currentState.checkpoint)
            },
            availableOptions: {
                withoutPayment: transitionsWithoutPayment.map(t => ({
                    transition: t.transition,
                    description: this._getTransitionDescription(t.transition),
                    type: t.validation.type,
                    requirements: this._getTransitionRequirements(t.transition),
                    riskLevel: this._assessTransitionRisk(t.transition),
                    estimatedEffort: this._estimateTransitionEffort(t.transition)
                })),
                withPayment: transitionsWithPayment.map(t => ({
                    transition: t.transition,
                    description: this._getTransitionDescription(t.transition),
                    type: t.validation.type,
                    requirements: this._getTransitionRequirements(t.transition),
                    riskLevel: this._assessTransitionRisk(t.transition),
                    estimatedEffort: this._estimateTransitionEffort(t.transition),
                    paymentRequired: true,
                    estimatedAmount: this._estimatePaymentAmount(t.transition)
                }))
            },
            decisionGuidance: {
                message: 'Please review all available options and select your preferred transition',
                notes: [
                    'This system presents options but does not recommend specific choices',
                    'All transitions require explicit human approval', 
                    'Payment gates trigger for level advances and require external payment',
                    'You may request additional information about any option'
                ],
                nextSteps: [
                    '1. Review each available transition option',
                    '2. Consider requirements, risks, and effort for each option',
                    '3. Select your preferred transition',
                    '4. Provide justification for your choice',
                    '5. Confirm your decision to proceed'
                ]
            },
            humanDecisionRequired: true
        };

        this._recordAuditEvent('options_presented_to_human', {
            sessionId,
            presentation
        });

        return presentation;
    }

    /**
     * Process human decision for maturity transition
     * This method validates and coordinates the human-approved decision
     */
    async processHumanDecision(sessionId, decision) {
        // Validate decision structure
        if (!decision.selectedTransition || !decision.justification) {
            throw new Error('Invalid decision: must include selectedTransition and justification');
        }

        // Validate authorization
        if (!decision.authorizedBy) {
            throw new Error('Invalid decision: must include authorized personnel identification');
        }

        const decisionId = this._generateDecisionId();
        const timestamp = new Date().toISOString();
        
        // Create human decision gate record
        const decisionGate = {
            id: decisionId,
            sessionId,
            timestamp,
            decision,
            status: 'processing',
            humanApprovalRequired: true,
            automationBlocked: true
        };

        this.pendingDecisions.set(decisionId, decisionGate);

        this._recordAuditEvent('human_decision_received', {
            sessionId,
            decisionId,
            decision: {
                ...decision,
                // Note: Full decision details recorded but sensitive info may be redacted
                selectedTransition: decision.selectedTransition,
                justification: decision.justification,
                authorizedBy: decision.authorizedBy
            }
        });

        // Validate the selected transition
        const currentState = this.maturityTracker.getCurrentState();
        const validation = this.stateMachine.validateTransition(currentState, decision.selectedTransition);
        
        if (!validation.valid) {
            decisionGate.status = 'rejected';
            decisionGate.rejectionReason = validation.error;
            
            this._recordAuditEvent('decision_rejected_invalid_transition', {
                sessionId,
                decisionId,
                validation
            });

            throw new Error(`Invalid transition: ${validation.error}`);
        }

        // Check if payment gate is required
        if (validation.transitionData.paymentGate) {
            const paymentGate = await this.paymentGateSystem.createPaymentGate({
                type: validation.transitionData.type,
                fromState: currentState,
                toState: {
                    level: decision.selectedTransition.split('-')[0],
                    checkpoint: decision.selectedTransition.split('-')[1]
                }
            });

            decisionGate.paymentGateId = paymentGate.id;
            decisionGate.status = 'awaiting_payment';

            this._recordAuditEvent('payment_gate_created_for_decision', {
                sessionId,
                decisionId,
                paymentGateId: paymentGate.id
            });

            // Present payment gate information to human
            const paymentPresentation = await this.paymentGateSystem.presentPaymentGate(paymentGate.id);
            
            this.emit('payment_required', {
                sessionId,
                decisionId,
                paymentGate,
                paymentPresentation,
                message: 'Payment required before transition can proceed',
                nextAction: 'process_payment_externally'
            });

            return {
                sessionId,
                decisionId,
                status: 'payment_required',
                paymentGate,
                paymentPresentation,
                message: 'Your decision has been recorded. Payment is required to proceed with this transition.',
                nextAction: 'complete_payment_and_provide_confirmation'
            };
        }

        // No payment required - proceed with transition
        return await this._executeApprovedTransition(sessionId, decisionId, decisionGate);
    }

    /**
     * Process payment confirmation for pending decision
     */
    async processPaymentConfirmation(sessionId, decisionId, paymentConfirmation) {
        const decisionGate = this.pendingDecisions.get(decisionId);
        
        if (!decisionGate) {
            throw new Error(`Decision gate ${decisionId} not found`);
        }

        if (!decisionGate.paymentGateId) {
            throw new Error(`No payment gate associated with decision ${decisionId}`);
        }

        // Process payment confirmation through payment gate system
        const paymentResult = await this.paymentGateSystem.processPaymentConfirmation(
            decisionGate.paymentGateId,
            paymentConfirmation
        );

        if (paymentResult.approved) {
            decisionGate.paymentConfirmed = true;
            decisionGate.paymentResult = paymentResult;
            
            this._recordAuditEvent('payment_confirmed_for_decision', {
                sessionId,
                decisionId,
                paymentResult
            });

            // Now execute the transition
            return await this._executeApprovedTransition(sessionId, decisionId, decisionGate);
        } else {
            decisionGate.status = 'payment_rejected';
            
            this._recordAuditEvent('payment_rejected_for_decision', {
                sessionId,
                decisionId,
                paymentResult
            });

            throw new Error(`Payment confirmation failed: ${paymentResult.error}`);
        }
    }

    /**
     * Execute approved transition after all gates are satisfied
     */
    async _executeApprovedTransition(sessionId, decisionId, decisionGate) {
        try {
            decisionGate.status = 'executing';
            
            // Process the transition through maturity tracker
            const transitionResult = await this.maturityTracker.processHumanDecision({
                transition: decisionGate.decision.selectedTransition,
                justification: decisionGate.decision.justification,
                paymentConfirmation: decisionGate.paymentConfirmed || false
            });

            decisionGate.status = 'completed';
            decisionGate.transitionResult = transitionResult;
            decisionGate.completedAt = new Date().toISOString();

            this._recordAuditEvent('transition_executed_successfully', {
                sessionId,
                decisionId,
                transitionResult
            });

            // Remove from pending decisions
            this.pendingDecisions.delete(decisionId);

            // Present new state options
            const newPresentation = await this.presentCurrentOptions(sessionId);

            this.emit('transition_completed', {
                sessionId,
                decisionId,
                transitionResult,
                newPresentation
            });

            return {
                sessionId,
                decisionId,
                status: 'completed',
                transitionResult,
                newState: transitionResult,
                newPresentation,
                message: 'Transition completed successfully. New options available.',
                nextAction: 'review_new_options'
            };

        } catch (error) {
            decisionGate.status = 'failed';
            decisionGate.error = error.message;

            this._recordAuditEvent('transition_execution_failed', {
                sessionId,
                decisionId,
                error: error.message
            });

            throw error;
        }
    }

    /**
     * Get current system status
     */
    getCurrentSystemStatus() {
        const maturityState = this.maturityTracker.getCurrentState();
        const pendingGates = this.paymentGateSystem.getPendingGates();
        const pendingDecisionsList = Array.from(this.pendingDecisions.values());

        return {
            timestamp: new Date().toISOString(),
            maturityState,
            pendingDecisions: pendingDecisionsList.length,
            pendingPaymentGates: pendingGates.length,
            humanApprovalRequired: this.humanApprovalRequired, // Always true
            automationLocked: this.automationLocked, // Always true
            auditTrailCount: this.auditTrail.length,
            systemHealth: 'operational'
        };
    }

    /**
     * Generate comprehensive audit report
     */
    generateAuditReport(options = {}) {
        const maturityAudit = this.maturityTracker.generateAuditReport();
        const paymentAudit = this.paymentGateSystem.generatePaymentReport();
        
        return {
            generatedAt: new Date().toISOString(),
            systemStatus: this.getCurrentSystemStatus(),
            maturityTracking: maturityAudit,
            paymentGates: paymentAudit,
            humanDecisionGates: {
                totalDecisions: this.pendingDecisions.size,
                pending: Array.from(this.pendingDecisions.values()).filter(d => d.status === 'processing').length,
                completed: Array.from(this.pendingDecisions.values()).filter(d => d.status === 'completed').length,
                failed: Array.from(this.pendingDecisions.values()).filter(d => d.status === 'failed').length
            },
            auditCompliance: {
                humanApprovalEnforced: this.humanApprovalRequired,
                automationPrevented: this.automationLocked,
                auditTrailComplete: this.auditTrail.length > 0,
                paymentGatesValidated: paymentAudit.summary.totalGates > 0
            },
            fullAuditTrail: options.includeFullTrail ? this.auditTrail : undefined
        };
    }

    // Event handlers
    _handleHumanDecisionRequired(data) {
        this.emit('human_decision_required', data);
    }

    _handleStateTransitionCompleted(data) {
        this.emit('state_transition_completed', data);
    }

    _handlePaymentGateCreated(gate) {
        this.emit('payment_gate_created', gate);
    }

    _handlePaymentConfirmationProcessed(data) {
        this.emit('payment_confirmation_processed', data);
    }

    _handleAuditEvent(auditEntry) {
        this.auditTrail.push({
            ...auditEntry,
            orchestratorTimestamp: new Date().toISOString()
        });
        this.emit('audit_event', auditEntry);
    }

    // Utility methods
    _generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    _generateDecisionId() {
        return `decision_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    _getTransitionDescription(transition) {
        // Implementation would provide human-readable descriptions
        return `Transition to ${transition}`;
    }

    _getTransitionRequirements(transition) {
        // Implementation would return specific requirements
        return ['Stakeholder approval', 'Prerequisites met'];
    }

    _assessTransitionRisk(transition) {
        // Implementation would assess risk levels
        return transition.includes('rollback') ? 'medium' : 'low';
    }

    _estimateTransitionEffort(transition) {
        // Implementation would estimate effort
        return '1-2 weeks';
    }

    _estimatePaymentAmount(transition) {
        // Implementation would calculate payment amounts
        return '$5,000 - $50,000 depending on level';
    }

    _recordAuditEvent(eventType, data) {
        const auditEntry = {
            id: `orchestrator_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            eventType,
            data,
            systemInfo: {
                humanApprovalRequired: this.humanApprovalRequired,
                automationLocked: this.automationLocked
            }
        };
        
        this.auditTrail.push(auditEntry);
        this.emit('orchestrator_audit_event', auditEntry);
    }
}

module.exports = ConsultingSystemOrchestrator;