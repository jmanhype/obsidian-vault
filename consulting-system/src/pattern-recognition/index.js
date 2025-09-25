/**
 * Pattern Recognition System - Main Export Module
 * 
 * Provides a unified interface for all pattern recognition components
 * and the main PatternRecognitionSystem orchestrator.
 */

const PatternRecognitionSystem = require('./PatternRecognitionSystem');
const DeliveryPatternAnalyzer = require('./DeliveryPatternAnalyzer');
const RiskPatternDetector = require('./RiskPatternDetector');
const RecommendationEngine = require('./RecommendationEngine');
const PatternEvolutionTracker = require('./PatternEvolutionTracker');

// Main system class export
module.exports = PatternRecognitionSystem;

// Individual component exports for advanced usage
module.exports.PatternRecognitionSystem = PatternRecognitionSystem;
module.exports.DeliveryPatternAnalyzer = DeliveryPatternAnalyzer;
module.exports.RiskPatternDetector = RiskPatternDetector;
module.exports.RecommendationEngine = RecommendationEngine;
module.exports.PatternEvolutionTracker = PatternEvolutionTracker;

// Utility functions for system setup and management
module.exports.createPatternRecognitionSystem = function(config = {}) {
    return new PatternRecognitionSystem(config);
};

module.exports.getSystemVersion = function() {
    return '1.0.0';
};

module.exports.getComponentVersions = function() {
    return {
        system: '1.0.0',
        deliveryAnalyzer: '1.0.0',
        riskDetector: '1.0.0',
        recommendationEngine: '1.0.0',
        evolutionTracker: '1.0.0'
    };
};

// Configuration presets for common use cases
module.exports.presets = {
    development: {
        confidenceThreshold: 0.6,
        learningMode: true,
        cacheEnabled: true,
        maxPatterns: 50
    },
    production: {
        confidenceThreshold: 0.8,
        learningMode: true,
        cacheEnabled: true,
        maxPatterns: 500
    },
    testing: {
        confidenceThreshold: 0.5,
        learningMode: false,
        cacheEnabled: false,
        maxPatterns: 10
    }
};

// Quick setup functions
module.exports.setupDevelopmentSystem = function(obsidianVaultPath) {
    return new PatternRecognitionSystem({
        ...module.exports.presets.development,
        obsidianVaultPath
    });
};

module.exports.setupProductionSystem = function(obsidianVaultPath) {
    return new PatternRecognitionSystem({
        ...module.exports.presets.production,
        obsidianVaultPath
    });
};

module.exports.setupTestingSystem = function(obsidianVaultPath) {
    return new PatternRecognitionSystem({
        ...module.exports.presets.testing,
        obsidianVaultPath
    });
};