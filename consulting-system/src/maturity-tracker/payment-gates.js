/**
 * Payment Gate System for Maturity Tracking
 * 
 * CRITICAL: This system NEVER processes actual payments.
 * It only validates that payment confirmation has been provided
 * by authorized personnel through external systems.
 * 
 * All payment gates require explicit human confirmation.
 */

const EventEmitter = require('events');

class PaymentGateSystem extends EventEmitter {
    constructor(options = {}) {
        super();
        this.pendingGates = new Map();
        this.processedGates = new Map();
        this.auditTrail = [];
        this.config = {
            requiresExternalConfirmation: true,
            authorizedPersonnel: options.authorizedPersonnel || [],
            paymentMethods: options.paymentMethods || ['external_system'],
            ...options
        };

        this._recordAuditEvent('payment_gate_system_initialized', { config: this.config });
    }

    /**
     * Create a payment gate for a level transition
     * This method NEVER processes payment - only creates the gate
     */
    async createPaymentGate(transitionData) {
        const gateId = this._generateGateId();
        const gate = {
            id: gateId,
            transitionType: transitionData.type,
            fromState: transitionData.fromState,
            toState: transitionData.toState,
            amount: this._calculateAmount(transitionData),
            currency: 'USD',
            status: 'pending',
            createdAt: new Date().toISOString(),
            expiresAt: this._calculateExpiration(),
            requiresApproval: true,
            paymentDetails: this._getPaymentDetails(transitionData)
        };

        this.pendingGates.set(gateId, gate);
        
        this._recordAuditEvent('payment_gate_created', {
            gateId,
            gate,
            transitionData
        });

        this.emit('payment_gate_created', gate);

        return gate;
    }

    /**
     * Present payment gate information to human decision makers
     * This method presents options but NEVER processes payment
     */
    async presentPaymentGate(gateId) {
        const gate = this.pendingGates.get(gateId);
        
        if (!gate) {
            throw new Error(`Payment gate ${gateId} not found`);
        }

        if (gate.status !== 'pending') {
            throw new Error(`Payment gate ${gateId} is not in pending status: ${gate.status}`);
        }

        const presentationData = {
            gate,
            instructions: this._getPaymentInstructions(gate),
            confirmationRequirements: this._getConfirmationRequirements(gate),
            approvalProcess: this._getApprovalProcess(gate),
            timeline: this._getPaymentTimeline(gate)
        };

        this._recordAuditEvent('payment_gate_presented', {
            gateId,
            presentationData
        });

        this.emit('payment_gate_presented', presentationData);

        return presentationData;
    }

    /**
     * Process payment confirmation from authorized personnel
     * This method validates confirmation but NEVER handles actual payment
     */
    async processPaymentConfirmation(gateId, confirmationData) {
        const gate = this.pendingGates.get(gateId);
        
        if (!gate) {
            throw new Error(`Payment gate ${gateId} not found`);
        }

        if (gate.status !== 'pending') {
            throw new Error(`Payment gate ${gateId} is not in pending status: ${gate.status}`);
        }

        // Validate confirmation data
        const validation = this._validatePaymentConfirmation(gate, confirmationData);
        if (!validation.valid) {
            this._recordAuditEvent('payment_confirmation_failed', {
                gateId,
                confirmationData,
                validation
            });
            throw new Error(`Payment confirmation failed: ${validation.error}`);
        }

        // Update gate status
        gate.status = 'confirmed';
        gate.confirmedAt = new Date().toISOString();
        gate.confirmationData = {
            ...confirmationData,
            // Remove sensitive data for audit trail
            paymentDetails: '[REDACTED]',
            transactionId: confirmationData.transactionId
        };

        // Move to processed gates
        this.pendingGates.delete(gateId);
        this.processedGates.set(gateId, gate);

        this._recordAuditEvent('payment_confirmation_processed', {
            gateId,
            gate: {
                ...gate,
                confirmationData: '[REDACTED]' // Don't store sensitive data in audit
            }
        });

        this.emit('payment_confirmation_processed', {
            gateId,
            gate,
            transitionApproved: true
        });

        return {
            approved: true,
            gateId,
            transactionId: confirmationData.transactionId,
            approvedAt: gate.confirmedAt
        };
    }

    /**
     * Reject or cancel a payment gate
     */
    async rejectPaymentGate(gateId, rejectionReason, authorizedBy) {
        const gate = this.pendingGates.get(gateId);
        
        if (!gate) {
            throw new Error(`Payment gate ${gateId} not found`);
        }

        gate.status = 'rejected';
        gate.rejectedAt = new Date().toISOString();
        gate.rejectionReason = rejectionReason;
        gate.rejectedBy = authorizedBy;

        this.pendingGates.delete(gateId);
        this.processedGates.set(gateId, gate);

        this._recordAuditEvent('payment_gate_rejected', {
            gateId,
            gate,
            rejectionReason,
            authorizedBy
        });

        this.emit('payment_gate_rejected', {
            gateId,
            gate,
            rejectionReason
        });

        return {
            rejected: true,
            gateId,
            reason: rejectionReason,
            rejectedAt: gate.rejectedAt
        };
    }

    /**
     * Calculate amount for transition (placeholder logic)
     * In real implementation, this would integrate with pricing systems
     */
    _calculateAmount(transitionData) {
        const basePrices = {
            'POC-to-MVP': 5000,
            'MVP-to-PILOT': 15000,
            'PILOT-to-PRODUCTION': 25000,
            'PRODUCTION-to-SCALE': 50000
        };

        const key = `${transitionData.fromState.level}-to-${transitionData.toState.level}`;
        return basePrices[key] || 10000;
    }

    /**
     * Get payment details and breakdown
     */
    _getPaymentDetails(transitionData) {
        return {
            description: `Level transition: ${transitionData.fromState.level} to ${transitionData.toState.level}`,
            itemization: [
                {
                    item: 'Maturity Level Advancement',
                    description: `Professional services for advancing from ${transitionData.fromState.level} to ${transitionData.toState.level}`,
                    quantity: 1,
                    unitPrice: this._calculateAmount(transitionData)
                }
            ],
            paymentTerms: 'Payment required before transition approval',
            acceptedMethods: this.config.paymentMethods,
            taxInformation: 'Tax may apply based on jurisdiction'
        };
    }

    /**
     * Get payment instructions for human operators
     */
    _getPaymentInstructions(gate) {
        return {
            overview: 'This system does not process payments directly. Payment must be handled through your organization\'s approved payment system.',
            steps: [
                '1. Process payment through authorized external system',
                '2. Obtain transaction confirmation/receipt',
                '3. Return to this system with confirmation details',
                '4. Provide transaction ID and authorization details'
            ],
            importantNotes: [
                'Do not provide actual payment details to this system',
                'Only transaction confirmation IDs are required',
                'All payments must be authorized by designated personnel',
                'Keep all payment receipts for your records'
            ],
            amount: `$${gate.amount.toLocaleString()} ${gate.currency}`,
            expirationTime: gate.expiresAt
        };
    }

    /**
     * Get confirmation requirements
     */
    _getConfirmationRequirements(gate) {
        return {
            required: [
                'transactionId',
                'authorizedBy',
                'paymentMethod',
                'confirmationTimestamp'
            ],
            optional: [
                'receiptNumber',
                'additionalNotes'
            ],
            validation: {
                transactionId: 'Must be unique transaction identifier from payment system',
                authorizedBy: 'Must be from authorized personnel list',
                paymentMethod: 'Must be from approved payment methods',
                confirmationTimestamp: 'Must be within 24 hours of payment'
            }
        };
    }

    /**
     * Get approval process information
     */
    _getApprovalProcess(gate) {
        return {
            process: [
                'Payment confirmation submitted',
                'System validates confirmation data',
                'Transaction ID verified as unique',
                'Authorized personnel confirmed',
                'Gate approved and transition enabled'
            ],
            authorizedPersonnel: this.config.authorizedPersonnel,
            approvalCriteria: [
                'Valid transaction ID provided',
                'Payment amount matches gate requirement',
                'Authorization from designated personnel',
                'Confirmation within expiration window'
            ]
        };
    }

    /**
     * Get payment timeline information
     */
    _getPaymentTimeline(gate) {
        const now = new Date();
        const expires = new Date(gate.expiresAt);
        const timeRemaining = expires - now;

        return {
            created: gate.createdAt,
            expires: gate.expiresAt,
            timeRemaining: Math.max(0, Math.floor(timeRemaining / (1000 * 60 * 60))), // hours
            status: timeRemaining > 0 ? 'active' : 'expired'
        };
    }

    /**
     * Validate payment confirmation data
     */
    _validatePaymentConfirmation(gate, confirmationData) {
        const required = ['transactionId', 'authorizedBy', 'paymentMethod', 'confirmationTimestamp'];
        
        // Check required fields
        for (const field of required) {
            if (!confirmationData[field]) {
                return {
                    valid: false,
                    error: `Missing required field: ${field}`
                };
            }
        }

        // Check authorized personnel
        if (this.config.authorizedPersonnel.length > 0 && 
            !this.config.authorizedPersonnel.includes(confirmationData.authorizedBy)) {
            return {
                valid: false,
                error: `Unauthorized personnel: ${confirmationData.authorizedBy}`
            };
        }

        // Check payment method
        if (!this.config.paymentMethods.includes(confirmationData.paymentMethod)) {
            return {
                valid: false,
                error: `Invalid payment method: ${confirmationData.paymentMethod}`
            };
        }

        // Check transaction ID uniqueness
        const existingTransaction = Array.from(this.processedGates.values())
            .find(g => g.confirmationData?.transactionId === confirmationData.transactionId);
        
        if (existingTransaction) {
            return {
                valid: false,
                error: `Transaction ID already used: ${confirmationData.transactionId}`
            };
        }

        // Check expiration
        const now = new Date();
        const expires = new Date(gate.expiresAt);
        if (now > expires) {
            return {
                valid: false,
                error: 'Payment gate has expired'
            };
        }

        return { valid: true };
    }

    /**
     * Calculate gate expiration time
     */
    _calculateExpiration() {
        const now = new Date();
        const expirationHours = 72; // 72 hours default
        return new Date(now.getTime() + (expirationHours * 60 * 60 * 1000)).toISOString();
    }

    /**
     * Generate unique gate ID
     */
    _generateGateId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 15);
        return `gate_${timestamp}_${random}`;
    }

    /**
     * Get all pending payment gates
     */
    getPendingGates() {
        return Array.from(this.pendingGates.values());
    }

    /**
     * Get all processed payment gates
     */
    getProcessedGates() {
        return Array.from(this.processedGates.values());
    }

    /**
     * Get payment gate by ID
     */
    getPaymentGate(gateId) {
        return this.pendingGates.get(gateId) || this.processedGates.get(gateId);
    }

    /**
     * Record audit event
     */
    _recordAuditEvent(eventType, data) {
        const auditEntry = {
            id: `payment_audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            eventType,
            data
        };
        
        this.auditTrail.push(auditEntry);
        this.emit('payment_audit_event', auditEntry);
    }

    /**
     * Get payment gate audit trail
     */
    getAuditTrail(filter = {}) {
        let filtered = [...this.auditTrail];
        
        if (filter.gateId) {
            filtered = filtered.filter(entry => 
                entry.data.gateId === filter.gateId
            );
        }
        
        if (filter.eventType) {
            filtered = filtered.filter(entry => 
                entry.eventType === filter.eventType
            );
        }
        
        if (filter.since) {
            filtered = filtered.filter(entry => 
                new Date(entry.timestamp) >= new Date(filter.since)
            );
        }
        
        return filtered;
    }

    /**
     * Generate payment gate report
     */
    generatePaymentReport() {
        const pending = this.getPendingGates();
        const processed = this.getProcessedGates();
        const confirmed = processed.filter(g => g.status === 'confirmed');
        const rejected = processed.filter(g => g.status === 'rejected');

        return {
            summary: {
                totalGates: pending.length + processed.length,
                pending: pending.length,
                confirmed: confirmed.length,
                rejected: rejected.length,
                totalValue: processed.reduce((sum, gate) => sum + gate.amount, 0)
            },
            pendingGates: pending.map(gate => ({
                id: gate.id,
                amount: gate.amount,
                expiresAt: gate.expiresAt,
                transition: `${gate.fromState.level} → ${gate.toState.level}`
            })),
            recentActivity: this.auditTrail
                .slice(-10)
                .map(entry => ({
                    timestamp: entry.timestamp,
                    eventType: entry.eventType,
                    gateId: entry.data.gateId
                }))
        };
    }
}

module.exports = PaymentGateSystem;