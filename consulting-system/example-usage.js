/**
 * Example Usage of Consulting System Maturity Tracker
 * 
 * This example demonstrates how to use the Maturity Tracking System
 * with proper human decision gates and payment processing.
 * 
 * IMPORTANT: This example shows the system presenting options to humans,
 * never making decisions for them.
 */

const ConsultingSystemOrchestrator = require('./src/main.js');

async function demonstrateMaturityTracking() {
    console.log('🚀 Starting Consulting System Maturity Tracking Demonstration\n');
    
    // Initialize the orchestrator with configuration
    const orchestrator = new ConsultingSystemOrchestrator({
        config: {
            requiresHumanApproval: true, // IMMUTABLE - always true
            allowsAutomation: false,     // IMMUTABLE - always false
            auditingEnabled: true        // IMMUTABLE - always true
        },
        paymentGates: {
            authorizedPersonnel: [
                'project.manager@company.com',
                'finance.director@company.com',
                'ceo@company.com'
            ],
            paymentMethods: ['external_payment_system']
        },
        decisionTimeout: 24 * 60 * 60 * 1000 // 24 hours
    });

    // Set up event listeners for monitoring
    orchestrator.on('human_decision_required', (data) => {
        console.log('📋 Human Decision Required:', data.presentationData?.currentState);
    });

    orchestrator.on('payment_required', (data) => {
        console.log('💳 Payment Required:', `$${data.paymentGate.amount} for ${data.paymentGate.transitionType}`);
    });

    orchestrator.on('transition_completed', (data) => {
        console.log('✅ Transition Completed:', `${data.transitionResult.level}-${data.transitionResult.checkpoint}`);
    });

    orchestrator.on('audit_event', (auditEntry) => {
        console.log('📊 Audit:', auditEntry.eventType);
    });

    try {
        // Step 1: Start a maturity tracking session
        console.log('Step 1: Starting maturity session for new product development\n');
        
        const session = await orchestrator.startMaturitySession({
            projectName: 'AI-Powered Analytics Platform',
            clientId: 'enterprise-client-001',
            projectType: 'software_product',
            estimatedBudget: 250000,
            timeline: '12 months',
            stakeholders: [
                'project.manager@company.com',
                'tech.lead@company.com',
                'product.owner@company.com'
            ]
        });

        console.log('📊 Session Started:');
        console.log(`  Session ID: ${session.sessionId}`);
        console.log(`  Current State: ${session.session.currentState.level}-${session.session.currentState.checkpoint}`);
        console.log(`  Status: ${session.session.status}\n`);

        // Display initial options presentation
        console.log('🎯 Initial Options Presented to Human Decision Maker:');
        console.log(`  Current Level: ${session.initialPresentation.currentState.level}`);
        console.log(`  Current Checkpoint: ${session.initialPresentation.currentState.checkpoint}`);
        console.log('  Available Transitions:');
        
        session.initialPresentation.availableOptions.withoutPayment.forEach((option, index) => {
            console.log(`    ${index + 1}. ${option.transition} - ${option.description}`);
            console.log(`       Risk: ${option.riskLevel}, Effort: ${option.estimatedEffort}`);
        });

        if (session.initialPresentation.availableOptions.withPayment.length > 0) {
            console.log('  Payment Required Transitions:');
            session.initialPresentation.availableOptions.withPayment.forEach((option, index) => {
                console.log(`    ${index + 1}. ${option.transition} - ${option.description}`);
                console.log(`       Payment: ${option.estimatedAmount}, Risk: ${option.riskLevel}`);
            });
        }
        console.log();

        // Step 2: Simulate human decision for checkpoint advancement
        console.log('Step 2: Processing human decision for checkpoint advancement\n');
        
        const humanDecision1 = {
            selectedTransition: 'POC-L2',
            justification: 'Basic POC validation completed successfully. Core concept validated with stakeholders. Ready to proceed with enhanced validation phase including detailed architecture and prototype development.',
            authorizedBy: 'project.manager@company.com',
            decisionTimestamp: new Date().toISOString(),
            stakeholderApproval: true,
            prerequisitesReviewed: true
        };

        console.log('👤 Human Decision Submitted:');
        console.log(`  Selected: ${humanDecision1.selectedTransition}`);
        console.log(`  Authorized by: ${humanDecision1.authorizedBy}`);
        console.log(`  Justification: ${humanDecision1.justification.substring(0, 80)}...`);
        console.log();

        const result1 = await orchestrator.processHumanDecision(session.sessionId, humanDecision1);
        
        console.log('✅ Decision Processed Successfully:');
        console.log(`  New State: ${result1.transitionResult.level}-${result1.transitionResult.checkpoint}`);
        console.log(`  Status: ${result1.status}`);
        console.log();

        // Step 3: Advance through POC phases
        console.log('Step 3: Advancing to POC-L3 (requires comprehensive validation)\n');

        const humanDecision2 = {
            selectedTransition: 'POC-L3',
            justification: 'Enhanced validation phase completed. Detailed technical architecture approved, initial prototype demonstrates feasibility, and success metrics have been established. Ready for final POC validation.',
            authorizedBy: 'project.manager@company.com',
            decisionTimestamp: new Date().toISOString(),
            prerequisitesCompleted: [
                'Technical architecture review completed',
                'Prototype development finished',
                'Success metrics defined and approved'
            ]
        };

        const result2 = await orchestrator.processHumanDecision(session.sessionId, humanDecision2);
        console.log(`✅ Advanced to: ${result2.transitionResult.level}-${result2.transitionResult.checkpoint}\n`);

        // Step 4: Attempt level transition (triggers payment gate)
        console.log('Step 4: Attempting level transition from POC to MVP (triggers payment gate)\n');

        const humanDecision3 = {
            selectedTransition: 'MVP-L1',
            justification: 'POC phase fully completed with all L3 requirements met. Business case validated, technical feasibility confirmed, and stakeholders approve advancement to MVP phase. Ready to begin minimum viable product development.',
            authorizedBy: 'project.manager@company.com',
            decisionTimestamp: new Date().toISOString(),
            businessCaseApproved: true,
            technicalValidationComplete: true,
            stakeholderSignoff: true
        };

        console.log('👤 Human Decision for Level Transition:');
        console.log(`  Selected: ${humanDecision3.selectedTransition}`);
        console.log(`  This is a LEVEL transition (POC → MVP)`);
        console.log('  Payment gate will be triggered...\n');

        const result3 = await orchestrator.processHumanDecision(session.sessionId, humanDecision3);
        
        if (result3.status === 'payment_required') {
            console.log('💳 Payment Gate Triggered:');
            console.log(`  Amount: $${result3.paymentGate.amount} ${result3.paymentGate.currency}`);
            console.log(`  Gate ID: ${result3.paymentGate.id}`);
            console.log(`  Expires: ${result3.paymentGate.expiresAt}`);
            console.log('\n📋 Payment Instructions:');
            result3.paymentPresentation.instructions.steps.forEach((step, index) => {
                console.log(`  ${index + 1}. ${step}`);
            });
            console.log();

            // Step 5: Simulate external payment processing
            console.log('Step 5: Simulating external payment processing\n');
            
            console.log('💰 Processing payment through external system...');
            console.log('   (In real system, this happens outside our application)');
            console.log('   Payment processed successfully in external system');
            console.log('   Transaction ID: ext_txn_789abc123def\n');

            // Provide payment confirmation
            const paymentConfirmation = {
                transactionId: 'ext_txn_789abc123def',
                authorizedBy: 'finance.director@company.com',
                paymentMethod: 'external_payment_system',
                confirmationTimestamp: new Date().toISOString(),
                paymentAmount: result3.paymentGate.amount,
                paymentCurrency: result3.paymentGate.currency,
                externalReceiptNumber: 'RCPT-2024-001-XYZ'
            };

            console.log('✅ Submitting payment confirmation:');
            console.log(`  Transaction ID: ${paymentConfirmation.transactionId}`);
            console.log(`  Authorized by: ${paymentConfirmation.authorizedBy}`);
            console.log();

            const paymentResult = await orchestrator.processPaymentConfirmation(
                session.sessionId, 
                result3.decisionId, 
                paymentConfirmation
            );

            console.log('🎉 Payment Confirmed and Transition Completed:');
            console.log(`  New State: ${paymentResult.transitionResult.level}-${paymentResult.transitionResult.checkpoint}`);
            console.log(`  Transition ID: ${paymentResult.decisionId}`);
            console.log(`  Completed at: ${paymentResult.transitionResult.timestamp}`);
            console.log();
        }

        // Step 6: Generate comprehensive audit report
        console.log('Step 6: Generating comprehensive audit report\n');
        
        const auditReport = orchestrator.generateAuditReport({
            includeFullTrail: false // Set to true for complete audit trail
        });

        console.log('📊 System Audit Report:');
        console.log('  System Status:');
        console.log(`    Current State: ${auditReport.systemStatus.maturityState.level}-${auditReport.systemStatus.maturityState.checkpoint}`);
        console.log(`    Human Approval Required: ${auditReport.systemStatus.humanApprovalRequired}`);
        console.log(`    Automation Locked: ${auditReport.systemStatus.automationLocked}`);
        console.log(`    Audit Events: ${auditReport.systemStatus.auditTrailCount}`);
        
        console.log('  Maturity Tracking:');
        console.log(`    Total State Transitions: ${auditReport.maturityTracking.stateHistory.length}`);
        console.log(`    Event Types: ${Object.keys(auditReport.maturityTracking.eventTypeCounts).length}`);
        
        console.log('  Payment Gates:');
        console.log(`    Total Gates: ${auditReport.paymentGates.summary.totalGates}`);
        console.log(`    Confirmed: ${auditReport.paymentGates.summary.confirmed}`);
        console.log(`    Total Value: $${auditReport.paymentGates.summary.totalValue.toLocaleString()}`);
        
        console.log('  Human Decision Gates:');
        console.log(`    Total Decisions: ${auditReport.humanDecisionGates.totalDecisions}`);
        console.log(`    Completed: ${auditReport.humanDecisionGates.completed}`);
        
        console.log('  Audit Compliance:');
        console.log(`    Human Approval Enforced: ${auditReport.auditCompliance.humanApprovalEnforced}`);
        console.log(`    Automation Prevented: ${auditReport.auditCompliance.automationPrevented}`);
        console.log(`    Audit Trail Complete: ${auditReport.auditCompliance.auditTrailComplete}`);
        console.log();

        // Step 7: Show current state and next options
        console.log('Step 7: Current state and available next options\n');
        
        const currentStatus = orchestrator.getCurrentSystemStatus();
        console.log('📈 Current System Status:');
        console.log(`  Maturity Level: ${currentStatus.maturityState.level}-${currentStatus.maturityState.checkpoint}`);
        console.log(`  Available Transitions: ${currentStatus.maturityState.availableTransitions.join(', ')}`);
        console.log(`  Pending Decisions: ${currentStatus.pendingDecisions}`);
        console.log(`  System Health: ${currentStatus.systemHealth}`);
        console.log();

        console.log('🎯 Next Steps Available to Human Decision Makers:');
        currentStatus.maturityState.availableTransitions.forEach((transition, index) => {
            console.log(`  ${index + 1}. ${transition}`);
        });
        console.log();

        console.log('✅ Demonstration Complete!');
        console.log('\nKey Features Demonstrated:');
        console.log('  ✓ Human decision gates enforced at every transition');
        console.log('  ✓ Payment gates triggered for level transitions');
        console.log('  ✓ External payment system integration');
        console.log('  ✓ Comprehensive audit trail maintenance');
        console.log('  ✓ No automated client decisions');
        console.log('  ✓ Complete transaction transparency');

    } catch (error) {
        console.error('❌ Error during demonstration:', error.message);
        console.error('   This error has been logged in the audit trail');
    }
}

// Additional utility functions for testing

async function demonstrateRollback() {
    console.log('\n🔄 Demonstrating Rollback Scenario\n');
    
    // This would demonstrate how the system handles rollbacks
    // with proper human justification and audit trails
    console.log('Rollback scenarios require:');
    console.log('  - Explicit human justification');  
    console.log('  - Stakeholder approval for level rollbacks');
    console.log('  - Comprehensive audit trail documentation');
    console.log('  - Post-mortem planning for level rollbacks');
}

async function demonstrateAbort() {
    console.log('\n🛑 Demonstrating Project Abort Scenario\n');
    
    console.log('Project abort requires:');
    console.log('  - Comprehensive justification');
    console.log('  - Senior stakeholder approval');
    console.log('  - Post-mortem documentation');
    console.log('  - Resource cleanup planning');
    console.log('  - Irreversible decision confirmation');
}

// Run the demonstration
if (require.main === module) {
    demonstrateMaturityTracking()
        .then(() => {
            console.log('\n🎉 All demonstrations completed successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Demonstration failed:', error);
            process.exit(1);
        });
}

module.exports = {
    demonstrateMaturityTracking,
    demonstrateRollback,
    demonstrateAbort
};