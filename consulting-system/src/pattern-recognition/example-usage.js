/**
 * Pattern Recognition System - Example Usage
 * 
 * This file demonstrates how to use the Pattern Recognition System
 * for analyzing consulting engagements and generating recommendations.
 */

const PatternRecognitionSystem = require('./index');

async function demonstratePatternRecognitionSystem() {
    console.log('🚀 Pattern Recognition System Demonstration\n');

    // Initialize the pattern recognition system
    const patternSystem = new PatternRecognitionSystem({
        confidenceThreshold: 0.7,
        learningMode: true,
        obsidianVaultPath: '/Users/speed/Documents/Obsidian Vault/consulting-system'
    });

    try {
        // Step 1: Initialize the system
        console.log('Step 1: Initializing Pattern Recognition System...');
        await patternSystem.initialize();
        console.log('✅ System initialized successfully\n');

        // Step 2: Analyze patterns for a new project
        console.log('Step 2: Analyzing patterns for enterprise digital transformation project...');
        
        const projectContext = {
            id: 'proj-2024-enterprise-001',
            clientType: 'enterprise-financial',
            projectType: 'digital-transformation',
            industry: 'financial-services',
            timeline: '8-months',
            budget: 750000,
            teamSize: 12,
            currentLevel: 'POC-L1',
            technologies: ['react', 'node.js', 'aws', 'kubernetes'],
            constraints: ['regulatory-compliance', 'legacy-integration'],
            stakeholders: [
                'cto@client.com',
                'project.lead@client.com',
                'compliance@client.com'
            ]
        };

        const patternAnalysis = await patternSystem.matchPatterns(projectContext);
        
        console.log('📊 Pattern Analysis Results:');
        console.log(`  Overall Confidence: ${(patternAnalysis.confidence * 100).toFixed(1)}%`);
        console.log(`  Processing Time: ${patternAnalysis.processingTime}ms`);
        console.log(`  Patterns Analyzed: ${patternAnalysis.metadata.patternsAnalyzed}`);
        console.log();

        // Display delivery patterns
        console.log('🎯 Delivery Patterns Found:');
        patternAnalysis.deliveryPatterns.patterns.forEach((pattern, index) => {
            console.log(`  ${index + 1}. ${pattern.description} (Confidence: ${(pattern.confidence * 100).toFixed(1)}%)`);
        });
        console.log();

        // Display risk analysis
        console.log('⚠️  Risk Analysis:');
        console.log(`  Severity Level: ${patternAnalysis.riskAnalysis.severity}`);
        patternAnalysis.riskAnalysis.risks.forEach((risk, index) => {
            console.log(`  ${index + 1}. ${risk.type}: ${risk.description}`);
        });
        console.log();

        // Display recommendations
        console.log('💡 Generated Recommendations:');
        console.log(`  Immediate Actions: ${patternAnalysis.recommendations.immediate.length}`);
        console.log(`  Strategic Initiatives: ${patternAnalysis.recommendations.strategic.length}`);
        console.log(`  Tactical Improvements: ${patternAnalysis.recommendations.tactical.length}`);
        
        patternAnalysis.recommendations.immediate.forEach((rec, index) => {
            console.log(`    ${index + 1}. ${rec.title} (Confidence: ${(rec.confidence * 100).toFixed(1)}%)`);
            console.log(`       ${rec.description}`);
        });
        console.log();

        // Step 3: Focused delivery pattern analysis
        console.log('Step 3: Performing focused delivery pattern analysis...');
        
        const deliveryAnalysis = await patternSystem.analyzeDeliveryPatterns(projectContext);
        
        console.log('📈 Delivery Analysis:');
        console.log(`  Success Factors Identified: ${deliveryAnalysis.successFactors.length}`);
        deliveryAnalysis.successFactors.forEach((factor, index) => {
            console.log(`    ${index + 1}. ${factor.factor}: ${factor.description}`);
        });
        console.log();

        // Step 4: Risk pattern analysis
        console.log('Step 4: Performing risk pattern analysis...');
        
        const riskAnalysis = await patternSystem.analyzeRiskPatterns(projectContext);
        
        console.log('🛡️  Risk Pattern Analysis:');
        console.log(`  Current Risks: ${riskAnalysis.currentRisks.length}`);
        console.log(`  Predicted Risks: ${riskAnalysis.predictedRisks.length}`);
        console.log(`  Overall Severity: ${riskAnalysis.severity}/10`);
        console.log(`  Mitigation Strategies: ${riskAnalysis.mitigations.length}`);
        console.log();

        // Step 5: Generate contextual recommendations
        console.log('Step 5: Generating contextual recommendations...');
        
        const recommendations = await patternSystem.generateRecommendations(
            projectContext, 
            { 
                confidenceThreshold: 0.8,
                analysisData: patternAnalysis 
            }
        );
        
        console.log('🎯 High-Confidence Recommendations:');
        console.log(`  Total Generated: ${recommendations.totalGenerated}`);
        console.log(`  High Confidence: ${recommendations.highConfidence}`);
        
        Object.entries(recommendations.categories).forEach(([category, recs]) => {
            if (recs.length > 0) {
                console.log(`  ${category}: ${recs.length} recommendations`);
            }
        });
        console.log();

        // Step 6: Analyze pattern evolution
        console.log('Step 6: Analyzing pattern evolution trends...');
        
        const evolutionAnalysis = await patternSystem.analyzePatternEvolution('6m');
        
        console.log('📊 Pattern Evolution Analysis:');
        console.log(`  Emerging Patterns: ${evolutionAnalysis.insights.emergingPatterns.length}`);
        console.log(`  Declining Patterns: ${evolutionAnalysis.insights.decliningPatterns.length}`);
        console.log(`  Stable Patterns: ${evolutionAnalysis.insights.stablePatterns.length}`);
        console.log(`  Future Opportunities: ${evolutionAnalysis.insights.futureOpportunities.length}`);
        console.log();

        // Step 7: System health and metrics
        console.log('Step 7: Checking system health and performance...');
        
        const metrics = patternSystem.getSystemMetrics();
        
        console.log('📈 System Performance Metrics:');
        console.log(`  Total Analyses: ${metrics.totalAnalyses}`);
        console.log(`  Success Rate: ${metrics.successRate.toFixed(1)}%`);
        console.log(`  Average Confidence: ${(metrics.averageConfidence * 100).toFixed(1)}%`);
        console.log(`  System Health: ${metrics.systemHealth}`);
        console.log('  Component Status:');
        Object.entries(metrics.componentsStatus).forEach(([component, status]) => {
            console.log(`    ${component}: ${status ? '✅ Healthy' : '❌ Unhealthy'}`);
        });
        console.log();

        // Step 8: Export patterns for backup
        console.log('Step 8: Exporting patterns for backup...');
        
        const exportedPatterns = await patternSystem.exportPatterns('json');
        
        console.log('💾 Pattern Export Summary:');
        console.log(`  Total Patterns Exported: ${exportedPatterns.metadata.totalPatterns}`);
        console.log(`  Export Time: ${exportedPatterns.metadata.exportTime}`);
        console.log(`  System Version: ${exportedPatterns.metadata.systemVersion}`);
        console.log();

        // Step 9: Simulate project completion and validation
        console.log('Step 9: Simulating project completion and pattern validation...');
        
        const actualOutcomes = {
            delivery: {
                success: true,
                timelineVariance: 0.05, // 5% over estimate
                budgetVariance: -0.02,  // 2% under budget
                qualityScore: 8.5,
                clientSatisfaction: 9.0
            },
            risks: {
                realizedRisks: ['integration-complexity', 'stakeholder-alignment'],
                mitigatedRisks: ['regulatory-compliance', 'timeline-pressure'],
                newRisks: []
            },
            recommendations: {
                implemented: 8,
                successful: 7,
                failed: 1,
                adoptionRate: 0.8
            },
            evolution: {
                patternsValidated: 5,
                patternsInvalidated: 1,
                newPatternsDiscovered: 2
            }
        };

        const validation = await patternSystem.validatePatternEffectiveness(
            projectContext.id, 
            actualOutcomes
        );
        
        console.log('✅ Pattern Validation Results:');
        console.log(`  Validation Success: ${validation.success}`);
        console.log(`  Patterns Validated: ${validation.validatedPatterns}`);
        console.log(`  Learning System Updated: ${validation.learningUpdated}`);
        console.log();

        // Final system metrics after validation
        const finalMetrics = patternSystem.getSystemMetrics();
        console.log('📊 Final System Metrics:');
        console.log(`  Updated Success Rate: ${finalMetrics.successRate.toFixed(1)}%`);
        console.log(`  Total Analyses: ${finalMetrics.totalAnalyses}`);
        console.log(`  System Health: ${finalMetrics.systemHealth}`);

        console.log('\n🎉 Pattern Recognition System demonstration completed successfully!');
        console.log('\nKey Features Demonstrated:');
        console.log('  ✓ Comprehensive pattern analysis');
        console.log('  ✓ Risk pattern detection and mitigation');
        console.log('  ✓ Context-aware recommendation generation');
        console.log('  ✓ Pattern evolution tracking');
        console.log('  ✓ System performance monitoring');
        console.log('  ✓ Pattern validation and learning');
        console.log('  ✓ Data export and backup capabilities');

    } catch (error) {
        console.error('❌ Demonstration failed:', error.message);
        console.error(error.stack);
    }
}

// Example of using individual components
async function demonstrateIndividualComponents() {
    console.log('\n🔧 Individual Component Usage Examples\n');

    // Using components independently
    const { 
        DeliveryPatternAnalyzer, 
        RiskPatternDetector, 
        RecommendationEngine 
    } = require('./index');

    // Example 1: Standalone delivery pattern analysis
    console.log('Example 1: Standalone Delivery Pattern Analysis');
    const deliveryAnalyzer = new DeliveryPatternAnalyzer({
        confidenceThreshold: 0.7
    });

    const projectId = 'standalone-proj-001';
    const patterns = await deliveryAnalyzer.analyzeProjectPatterns(projectId);
    console.log(`  Found ${patterns.patterns?.length || 0} delivery patterns`);
    console.log();

    // Example 2: Standalone risk detection
    console.log('Example 2: Standalone Risk Detection');
    const riskDetector = new RiskPatternDetector({
        severityThreshold: 6
    });

    const riskContext = {
        projectType: 'cloud-migration',
        timeline: '4-months',
        teamExperience: 'mixed',
        clientReadiness: 'low'
    };

    const risks = await riskDetector.detectRiskPatterns(riskContext);
    console.log(`  Detected ${risks.risks?.length || 0} risk patterns`);
    console.log();

    // Example 3: Standalone recommendations
    console.log('Example 3: Standalone Recommendation Generation');
    const recommendationEngine = new RecommendationEngine({
        maxRecommendations: 5
    });

    const recContext = {
        currentLevel: 'MVP-L2',
        projectType: 'api-development',
        teamSize: 6,
        urgency: 'high'
    };

    const recommendations = await recommendationEngine.generateRecommendations(recContext);
    console.log(`  Generated ${recommendations.length || 0} recommendations`);
    console.log();
}

// Example of using configuration presets
function demonstrateConfigurationPresets() {
    console.log('\n⚙️  Configuration Presets Examples\n');

    const { presets, setupDevelopmentSystem, setupProductionSystem } = require('./index');

    console.log('Available Presets:');
    Object.entries(presets).forEach(([name, config]) => {
        console.log(`  ${name}:`);
        console.log(`    Confidence Threshold: ${config.confidenceThreshold}`);
        console.log(`    Learning Mode: ${config.learningMode}`);
        console.log(`    Cache Enabled: ${config.cacheEnabled}`);
        console.log(`    Max Patterns: ${config.maxPatterns}`);
        console.log();
    });

    // Quick setup examples
    console.log('Quick Setup Examples:');
    console.log('  Development: const system = setupDevelopmentSystem(vaultPath);');
    console.log('  Production: const system = setupProductionSystem(vaultPath);');
    console.log();
}

// Run demonstrations
if (require.main === module) {
    demonstratePatternRecognitionSystem()
        .then(() => demonstrateIndividualComponents())
        .then(() => demonstrateConfigurationPresets())
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
    demonstratePatternRecognitionSystem,
    demonstrateIndividualComponents,
    demonstrateConfigurationPresets
};