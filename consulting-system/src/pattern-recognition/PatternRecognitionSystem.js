/**
 * Pattern Recognition System - Main Orchestrator
 * 
 * Coordinates all pattern recognition components to provide unified
 * pattern analysis and recommendation services for consulting engagements.
 */

const DeliveryPatternAnalyzer = require('./DeliveryPatternAnalyzer');
const RiskPatternDetector = require('./RiskPatternDetector');
const RecommendationEngine = require('./RecommendationEngine');
const PatternEvolutionTracker = require('./PatternEvolutionTracker');

class PatternRecognitionSystem {
    constructor(config = {}) {
        this.config = {
            confidenceThreshold: config.confidenceThreshold || 0.7,
            learningMode: config.learningMode !== false, // Default to true
            cacheEnabled: config.cacheEnabled !== false, // Default to true
            maxPatterns: config.maxPatterns || 100,
            obsidianVaultPath: config.obsidianVaultPath || './consulting-system',
            ...config
        };

        // Initialize component systems
        this.deliveryAnalyzer = new DeliveryPatternAnalyzer(this.config);
        this.riskDetector = new RiskPatternDetector(this.config);
        this.recommendationEngine = new RecommendationEngine(this.config);
        this.evolutionTracker = new PatternEvolutionTracker(this.config);

        // System state
        this.initialized = false;
        this.learningData = new Map();
        this.performanceMetrics = {
            totalAnalyses: 0,
            successfulMatches: 0,
            averageConfidence: 0,
            recommendationAdoption: 0
        };
    }

    /**
     * Initialize the pattern recognition system
     */
    async initialize() {
        try {
            console.log('Initializing Pattern Recognition System...');
            
            // Initialize all components
            await Promise.all([
                this.deliveryAnalyzer.initialize?.(),
                this.riskDetector.initialize?.(),
                this.recommendationEngine.initialize?.(),
                this.evolutionTracker.initialize?.()
            ]);

            // Load historical patterns
            await this.loadHistoricalPatterns();
            
            this.initialized = true;
            console.log('Pattern Recognition System initialized successfully');
            
            return { success: true, message: 'System initialized' };
        } catch (error) {
            console.error('Failed to initialize Pattern Recognition System:', error);
            throw new Error(`Initialization failed: ${error.message}`);
        }
    }

    /**
     * Main pattern matching interface
     * Analyzes project context and returns comprehensive pattern analysis
     */
    async matchPatterns(projectContext) {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            console.log(`Analyzing patterns for project: ${projectContext.id}`);
            
            // Start performance tracking
            const startTime = Date.now();
            this.performanceMetrics.totalAnalyses++;

            // Parallel analysis across all components
            const [
                deliveryPatterns,
                riskPatterns,
                evolutionData
            ] = await Promise.all([
                this.deliveryAnalyzer.analyzeProjectPatterns(projectContext.id),
                this.riskDetector.detectRiskPatterns(projectContext),
                this.evolutionTracker.trackProjectPatternEvolution(projectContext.id)
            ]);

            // Generate unified recommendations
            const recommendations = await this.recommendationEngine.generateRecommendations({
                projectContext,
                patterns: deliveryPatterns,
                risks: riskPatterns,
                evolution: evolutionData
            });

            // Calculate overall analysis confidence
            const overallConfidence = this.calculateOverallConfidence({
                deliveryPatterns,
                riskPatterns,
                recommendations
            });

            // Compile comprehensive analysis result
            const analysis = {
                projectId: projectContext.id,
                timestamp: new Date().toISOString(),
                confidence: overallConfidence,
                processingTime: Date.now() - startTime,
                deliveryPatterns: {
                    patterns: deliveryPatterns.patterns || [],
                    successFactors: deliveryPatterns.successFactors || [],
                    confidence: deliveryPatterns.confidence || 0
                },
                riskAnalysis: {
                    risks: riskPatterns.risks || [],
                    severity: riskPatterns.severity || 'medium',
                    mitigationStrategies: riskPatterns.mitigations || [],
                    confidence: riskPatterns.confidence || 0
                },
                recommendations: {
                    immediate: recommendations.filter(r => r.priority === 'high'),
                    strategic: recommendations.filter(r => r.type === 'strategic'),
                    tactical: recommendations.filter(r => r.type === 'tactical'),
                    all: recommendations
                },
                evolution: {
                    trends: evolutionData.trends || [],
                    predictions: evolutionData.predictions || [],
                    confidence: evolutionData.confidence || 0
                },
                metadata: {
                    systemVersion: '1.0.0',
                    analysisType: 'comprehensive',
                    patternsAnalyzed: (deliveryPatterns.patterns?.length || 0) + (riskPatterns.risks?.length || 0)
                }
            };

            // Update learning data if in learning mode
            if (this.config.learningMode) {
                await this.updateLearningData(projectContext, analysis);
            }

            // Update performance metrics
            if (overallConfidence >= this.config.confidenceThreshold) {
                this.performanceMetrics.successfulMatches++;
            }
            this.updatePerformanceMetrics(analysis);

            console.log(`Pattern analysis completed for ${projectContext.id} with confidence: ${overallConfidence}`);
            return analysis;

        } catch (error) {
            console.error(`Pattern matching failed for project ${projectContext.id}:`, error);
            throw new Error(`Pattern matching failed: ${error.message}`);
        }
    }

    /**
     * Focused delivery pattern analysis
     */
    async analyzeDeliveryPatterns(projectContext) {
        const patterns = await this.deliveryAnalyzer.analyzeProjectPatterns(projectContext.id);
        const successFactors = await this.deliveryAnalyzer.identifySuccessFactors(
            projectContext.projectType,
            projectContext.clientType
        );
        const nextSteps = await this.deliveryAnalyzer.recommendNextSteps(
            projectContext.id,
            projectContext.currentLevel
        );

        return {
            patterns,
            successFactors,
            nextSteps,
            confidence: patterns.confidence || 0
        };
    }

    /**
     * Focused risk pattern analysis
     */
    async analyzeRiskPatterns(projectContext) {
        const risks = await this.riskDetector.detectRiskPatterns(projectContext);
        const predictedRisks = await this.deliveryAnalyzer.predictDeliveryRisks(projectContext);
        
        return {
            currentRisks: risks.risks || [],
            predictedRisks: predictedRisks.risks || [],
            severity: Math.max(risks.severity || 0, predictedRisks.severity || 0),
            mitigations: [...(risks.mitigations || []), ...(predictedRisks.mitigations || [])],
            confidence: Math.min(risks.confidence || 0, predictedRisks.confidence || 0)
        };
    }

    /**
     * Generate contextual recommendations
     */
    async generateRecommendations(projectContext, options = {}) {
        const analysisData = options.analysisData || await this.matchPatterns(projectContext);
        
        const recommendations = await this.recommendationEngine.generateRecommendations({
            projectContext,
            patterns: analysisData.deliveryPatterns,
            risks: analysisData.riskAnalysis,
            evolution: analysisData.evolution,
            ...options
        });

        // Filter by confidence threshold if specified
        const filteredRecommendations = options.confidenceThreshold
            ? recommendations.filter(r => r.confidence >= options.confidenceThreshold)
            : recommendations;

        return {
            recommendations: filteredRecommendations,
            totalGenerated: recommendations.length,
            highConfidence: recommendations.filter(r => r.confidence >= 0.8).length,
            categories: this.categorizeRecommendations(filteredRecommendations)
        };
    }

    /**
     * Track and analyze pattern evolution
     */
    async analyzePatternEvolution(timeframe = '6m') {
        const evolution = await this.evolutionTracker.analyzeIndustryPatternTrends(timeframe);
        const predictions = await this.evolutionTracker.predictPatternEvolution();

        return {
            evolution,
            predictions,
            insights: this.generateEvolutionInsights(evolution, predictions)
        };
    }

    /**
     * Validate and update pattern effectiveness
     */
    async validatePatternEffectiveness(projectId, actualOutcomes) {
        try {
            // Validate delivery patterns
            await this.deliveryAnalyzer.validatePredictions?.(projectId, actualOutcomes.delivery);
            
            // Validate risk patterns
            await this.riskDetector.validateRiskPredictions(projectId, actualOutcomes.risks);
            
            // Validate recommendations
            await this.recommendationEngine.validateRecommendations?.(projectId, actualOutcomes.recommendations);
            
            // Update evolution tracking
            await this.evolutionTracker.validateEvolutionPredictions?.(projectId, actualOutcomes.evolution);

            // Update learning data
            if (this.config.learningMode) {
                await this.updatePatternEffectiveness(projectId, actualOutcomes);
            }

            return {
                success: true,
                validatedPatterns: Object.keys(actualOutcomes).length,
                learningUpdated: this.config.learningMode
            };
        } catch (error) {
            console.error(`Pattern validation failed for project ${projectId}:`, error);
            throw new Error(`Validation failed: ${error.message}`);
        }
    }

    /**
     * Get system health and performance metrics
     */
    getSystemMetrics() {
        const successRate = this.performanceMetrics.totalAnalyses > 0
            ? (this.performanceMetrics.successfulMatches / this.performanceMetrics.totalAnalyses) * 100
            : 0;

        return {
            ...this.performanceMetrics,
            successRate,
            systemHealth: successRate >= 70 ? 'healthy' : successRate >= 50 ? 'warning' : 'critical',
            uptime: Date.now() - (this.initTime || Date.now()),
            componentsStatus: {
                deliveryAnalyzer: this.deliveryAnalyzer.isHealthy?.() || true,
                riskDetector: this.riskDetector.isHealthy?.() || true,
                recommendationEngine: this.recommendationEngine.isHealthy?.() || true,
                evolutionTracker: this.evolutionTracker.isHealthy?.() || true
            }
        };
    }

    /**
     * Export patterns for backup or analysis
     */
    async exportPatterns(format = 'json') {
        const patterns = {
            delivery: await this.deliveryAnalyzer.exportPatterns?.() || {},
            risks: await this.riskDetector.exportPatterns?.() || {},
            evolution: await this.evolutionTracker.exportPatterns?.() || {},
            metadata: {
                exportTime: new Date().toISOString(),
                systemVersion: '1.0.0',
                totalPatterns: 0 // Will be calculated
            }
        };

        patterns.metadata.totalPatterns = 
            (patterns.delivery.patterns?.length || 0) +
            (patterns.risks.patterns?.length || 0) +
            (patterns.evolution.patterns?.length || 0);

        return format === 'json' ? patterns : this.formatPatternsOutput(patterns, format);
    }

    /**
     * Import patterns from backup or external source
     */
    async importPatterns(patternsData, options = {}) {
        try {
            const { merge = true, validate = true } = options;
            
            if (validate) {
                await this.validatePatternsData(patternsData);
            }

            // Import to individual components
            const results = await Promise.allSettled([
                this.deliveryAnalyzer.importPatterns?.(patternsData.delivery, { merge }),
                this.riskDetector.importPatterns?.(patternsData.risks, { merge }),
                this.evolutionTracker.importPatterns?.(patternsData.evolution, { merge })
            ]);

            const successful = results.filter(r => r.status === 'fulfilled').length;
            const failed = results.filter(r => r.status === 'rejected').length;

            return {
                success: failed === 0,
                imported: successful,
                failed,
                errors: results.filter(r => r.status === 'rejected').map(r => r.reason)
            };
        } catch (error) {
            console.error('Pattern import failed:', error);
            throw new Error(`Import failed: ${error.message}`);
        }
    }

    // Private helper methods

    async loadHistoricalPatterns() {
        // Load patterns from Obsidian vault or database
        // This would integrate with the actual data storage system
        console.log('Loading historical patterns...');
    }

    calculateOverallConfidence({ deliveryPatterns, riskPatterns, recommendations }) {
        const weights = { delivery: 0.4, risk: 0.3, recommendations: 0.3 };
        
        const deliveryConf = deliveryPatterns.confidence || 0;
        const riskConf = riskPatterns.confidence || 0;
        const recConf = recommendations.reduce((sum, r) => sum + (r.confidence || 0), 0) / (recommendations.length || 1);

        return (
            deliveryConf * weights.delivery +
            riskConf * weights.risk +
            recConf * weights.recommendations
        );
    }

    async updateLearningData(projectContext, analysis) {
        const learningKey = `${projectContext.projectType}-${projectContext.clientType}`;
        
        if (!this.learningData.has(learningKey)) {
            this.learningData.set(learningKey, {
                count: 0,
                patterns: [],
                averageConfidence: 0,
                successRate: 0
            });
        }

        const data = this.learningData.get(learningKey);
        data.count++;
        data.patterns.push({
            projectId: projectContext.id,
            confidence: analysis.confidence,
            timestamp: analysis.timestamp
        });
        
        // Update rolling averages
        data.averageConfidence = data.patterns.reduce((sum, p) => sum + p.confidence, 0) / data.patterns.length;
        
        this.learningData.set(learningKey, data);
    }

    updatePerformanceMetrics(analysis) {
        const currentAvg = this.performanceMetrics.averageConfidence;
        const count = this.performanceMetrics.totalAnalyses;
        
        this.performanceMetrics.averageConfidence = 
            (currentAvg * (count - 1) + analysis.confidence) / count;
    }

    categorizeRecommendations(recommendations) {
        const categories = {
            immediate: [],
            strategic: [],
            tactical: [],
            risk: [],
            process: [],
            technical: []
        };

        recommendations.forEach(rec => {
            if (rec.priority === 'high') categories.immediate.push(rec);
            if (rec.type === 'strategic') categories.strategic.push(rec);
            if (rec.type === 'tactical') categories.tactical.push(rec);
            if (rec.category === 'risk') categories.risk.push(rec);
            if (rec.category === 'process') categories.process.push(rec);
            if (rec.category === 'technical') categories.technical.push(rec);
        });

        return categories;
    }

    generateEvolutionInsights(evolution, predictions) {
        return {
            emergingPatterns: evolution.emerging || [],
            decliningPatterns: evolution.declining || [],
            stablePatterns: evolution.stable || [],
            futureOpportunities: predictions.opportunities || [],
            adaptationNeeds: predictions.adaptations || []
        };
    }

    async updatePatternEffectiveness(projectId, actualOutcomes) {
        // Update pattern effectiveness based on actual outcomes
        // This would integrate with the learning system
        console.log(`Updating pattern effectiveness for project ${projectId}`);
    }

    async validatePatternsData(patternsData) {
        // Validate the structure and content of patterns data
        if (!patternsData || typeof patternsData !== 'object') {
            throw new Error('Invalid patterns data format');
        }
        
        // Add more specific validation as needed
        return true;
    }

    formatPatternsOutput(patterns, format) {
        switch (format) {
            case 'csv':
                return this.convertPatternsToCSV(patterns);
            case 'yaml':
                return this.convertPatternsToYAML(patterns);
            default:
                return patterns;
        }
    }

    convertPatternsToCSV(patterns) {
        // Convert patterns to CSV format
        return 'CSV format not implemented';
    }

    convertPatternsToYAML(patterns) {
        // Convert patterns to YAML format
        return 'YAML format not implemented';
    }
}

module.exports = PatternRecognitionSystem;