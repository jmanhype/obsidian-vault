import { 
    RawMetadata, 
    EnrichedMetadata, 
    ProcessedContent, 
    InputSourceType,
    EntityType,
    ContextDepth 
} from './types.js';

/**
 * MetadataEnricher - Enriches raw metadata with additional information
 * extracted during processing, including language detection, quality scores,
 * tags, and categories.
 */
export class MetadataEnricher {
    private readonly supportedLanguages = [
        'en', 'es', 'fr', 'de', 'it', 'pt', 'nl', 'ru', 'zh', 'ja', 'ko', 'ar'
    ];

    private readonly categoryKeywords = {
        meeting: ['meeting', 'call', 'conference', 'discussion', 'agenda', 'minutes'],
        project: ['project', 'milestone', 'deliverable', 'deadline', 'scope', 'requirements'],
        decision: ['decision', 'approval', 'vote', 'consensus', 'agreement', 'resolution'],
        technical: ['code', 'api', 'database', 'deployment', 'architecture', 'technical'],
        financial: ['budget', 'cost', 'expense', 'invoice', 'payment', 'financial'],
        legal: ['contract', 'agreement', 'compliance', 'legal', 'terms', 'liability'],
        communication: ['email', 'message', 'communication', 'announcement', 'update'],
        planning: ['plan', 'strategy', 'roadmap', 'timeline', 'schedule', 'planning']
    };

    private readonly domainPatterns = {
        software: /\b(api|database|deployment|code|programming|software|development|bug|feature)\b/gi,
        business: /\b(revenue|profit|market|customer|sales|business|strategy|growth)\b/gi,
        legal: /\b(contract|compliance|regulation|legal|terms|agreement|liability)\b/gi,
        finance: /\b(budget|cost|expense|financial|accounting|invoice|payment)\b/gi,
        healthcare: /\b(patient|medical|health|treatment|diagnosis|clinical|hospital)\b/gi,
        education: /\b(student|course|curriculum|learning|education|training|academic)\b/gi,
        marketing: /\b(campaign|brand|advertising|promotion|marketing|social media|seo)\b/gi,
        operations: /\b(process|workflow|operations|logistics|supply chain|inventory)\b/gi
    };

    /**
     * Enriches raw metadata with processed information
     */
    async enrichMetadata(
        rawMetadata: RawMetadata,
        processedContent: ProcessedContent,
        sourceType: InputSourceType
    ): Promise<EnrichedMetadata> {
        const startTime = Date.now();

        try {
            const enriched: EnrichedMetadata = {
                ...rawMetadata,
                processingTimestamp: new Date(),
                language: this.detectLanguage(processedContent.cleanContent),
                qualityScore: this.calculateQualityScore(processedContent),
                tags: this.generateTags(processedContent, sourceType),
                categories: this.categorizeContent(processedContent),
                domain: this.identifyDomain(processedContent),
                complexity: this.assessComplexity(processedContent),
                readability: this.calculateReadability(processedContent.cleanContent),
                entityDensity: this.calculateEntityDensity(processedContent),
                topicDistribution: this.analyzeTopicDistribution(processedContent),
                processingStats: {
                    processingTimeMs: Date.now() - startTime,
                    enrichmentSteps: 8,
                    confidenceScore: this.calculateOverallConfidence(processedContent)
                }
            };

            return enriched;
        } catch (error) {
            console.error('Error enriching metadata:', error);
            throw new Error(`Metadata enrichment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Detects the primary language of the content
     */
    private detectLanguage(content: string): string {
        const text = content.toLowerCase();
        
        // Language-specific word patterns
        const languagePatterns = {
            en: /\b(the|and|that|have|for|not|with|you|this|but|his|from|they)\b/g,
            es: /\b(que|de|no|un|se|la|es|en|el|te|lo|le|da|su|por|son)\b/g,
            fr: /\b(de|le|et|à|un|il|être|et|en|avoir|que|pour|dans|ce|son)\b/g,
            de: /\b(der|die|und|in|den|von|zu|das|mit|sich|des|auf|für|ist)\b/g,
            it: /\b(di|a|da|in|del|che|è|per|una|sono|con|non|tu|lo|il|mi)\b/g,
            pt: /\b(de|a|o|que|e|do|da|em|um|para|é|com|não|uma|os|no|se)\b/g,
            ru: /\b(в|и|не|на|я|быть|с|он|а|как|по|но|они|к|у|его|за|до)\b/g,
            zh: /[\u4e00-\u9fff]/g,
            ja: /[\u3040-\u309f\u30a0-\u30ff]/g,
            ko: /[\uac00-\ud7af]/g,
            ar: /[\u0600-\u06ff]/g
        };

        let maxScore = 0;
        let detectedLanguage = 'en'; // default

        for (const [lang, pattern] of Object.entries(languagePatterns)) {
            const matches = text.match(pattern) || [];
            const score = matches.length / content.length * 1000; // normalized score
            
            if (score > maxScore) {
                maxScore = score;
                detectedLanguage = lang;
            }
        }

        return detectedLanguage;
    }

    /**
     * Calculates overall quality score based on multiple factors
     */
    private calculateQualityScore(content: ProcessedContent): number {
        const factors = {
            completeness: this.assessCompleteness(content),
            clarity: this.assessClarity(content),
            structure: this.assessStructure(content),
            entityRichness: this.assessEntityRichness(content),
            coherence: this.assessCoherence(content)
        };

        // Weighted average
        const weights = {
            completeness: 0.25,
            clarity: 0.20,
            structure: 0.20,
            entityRichness: 0.15,
            coherence: 0.20
        };

        let totalScore = 0;
        for (const [factor, score] of Object.entries(factors)) {
            totalScore += score * weights[factor as keyof typeof weights];
        }

        return Math.round(totalScore * 100) / 100; // Round to 2 decimal places
    }

    /**
     * Generates relevant tags based on content analysis
     */
    private generateTags(content: ProcessedContent, sourceType: InputSourceType): string[] {
        const tags = new Set<string>();

        // Source type tag
        tags.add(sourceType.toLowerCase());

        // Entity-based tags
        content.entities.forEach(entity => {
            if (entity.type === EntityType.ORGANIZATION) {
                tags.add('organization');
            } else if (entity.type === EntityType.PERSON) {
                tags.add('people');
            } else if (entity.type === EntityType.TECHNOLOGY) {
                tags.add('technical');
            }
        });

        // Topic-based tags
        content.topics.forEach(topic => {
            if (topic.confidence > 0.7) {
                tags.add(topic.topic.toLowerCase().replace(/\s+/g, '-'));
            }
        });

        // Action-based tags
        if (content.actionItems.length > 0) {
            tags.add('action-items');
        }

        if (content.decisions.length > 0) {
            tags.add('decisions');
        }

        if (content.questions.length > 0) {
            tags.add('questions');
        }

        // Sentiment tags
        if (content.sentiment.score > 0.3) {
            tags.add('positive');
        } else if (content.sentiment.score < -0.3) {
            tags.add('negative');
        } else {
            tags.add('neutral');
        }

        // Complexity tags
        const wordCount = content.cleanContent.split(/\s+/).length;
        if (wordCount > 1000) {
            tags.add('long-form');
        } else if (wordCount < 200) {
            tags.add('brief');
        }

        return Array.from(tags).slice(0, 15); // Limit to 15 most relevant tags
    }

    /**
     * Categorizes content into predefined categories
     */
    private categorizeContent(content: ProcessedContent): string[] {
        const categories = new Set<string>();
        const text = content.cleanContent.toLowerCase();

        for (const [category, keywords] of Object.entries(this.categoryKeywords)) {
            const matches = keywords.filter(keyword => 
                text.includes(keyword) || 
                content.topics.some(topic => topic.topic.toLowerCase().includes(keyword))
            );

            if (matches.length >= 2 || keywords.some(keyword => text.split(keyword).length > 3)) {
                categories.add(category);
            }
        }

        // Fallback categorization based on structure and entities
        if (categories.size === 0) {
            if (content.structure.dialogues.length > 0) {
                categories.add('communication');
            } else if (content.actionItems.length > 0 || content.decisions.length > 0) {
                categories.add('planning');
            } else if (content.entities.some(e => e.type === EntityType.TECHNOLOGY)) {
                categories.add('technical');
            } else {
                categories.add('general');
            }
        }

        return Array.from(categories);
    }

    /**
     * Identifies the primary domain/field of the content
     */
    private identifyDomain(content: ProcessedContent): string {
        const text = content.cleanContent;
        let maxMatches = 0;
        let primaryDomain = 'general';

        for (const [domain, pattern] of Object.entries(this.domainPatterns)) {
            const matches = text.match(pattern) || [];
            if (matches.length > maxMatches) {
                maxMatches = matches.length;
                primaryDomain = domain;
            }
        }

        // Consider entity types for domain identification
        const techEntities = content.entities.filter(e => e.type === EntityType.TECHNOLOGY).length;
        const orgEntities = content.entities.filter(e => e.type === EntityType.ORGANIZATION).length;

        if (techEntities > 3 && primaryDomain === 'general') {
            primaryDomain = 'software';
        } else if (orgEntities > 2 && primaryDomain === 'general') {
            primaryDomain = 'business';
        }

        return primaryDomain;
    }

    /**
     * Assesses content complexity on multiple dimensions
     */
    private assessComplexity(content: ProcessedContent): {
        overall: 'low' | 'medium' | 'high';
        factors: {
            vocabulary: number;
            structure: number;
            concepts: number;
            relationships: number;
        };
    } {
        const factors = {
            vocabulary: this.assessVocabularyComplexity(content.cleanContent),
            structure: this.assessStructuralComplexity(content.structure),
            concepts: this.assessConceptualComplexity(content),
            relationships: this.assessRelationshipComplexity(content)
        };

        const average = Object.values(factors).reduce((sum, val) => sum + val, 0) / 4;
        
        let overall: 'low' | 'medium' | 'high';
        if (average < 0.4) {
            overall = 'low';
        } else if (average < 0.7) {
            overall = 'medium';
        } else {
            overall = 'high';
        }

        return { overall, factors };
    }

    /**
     * Calculates readability score
     */
    private calculateReadability(content: string): {
        score: number;
        level: 'easy' | 'moderate' | 'difficult';
        averageWordsPerSentence: number;
        averageSyllablesPerWord: number;
    } {
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const words = content.split(/\s+/).filter(w => w.length > 0);
        
        const averageWordsPerSentence = words.length / sentences.length || 0;
        const averageSyllablesPerWord = this.calculateAverageSyllables(words);

        // Simplified Flesch Reading Ease formula
        const score = 206.835 - (1.015 * averageWordsPerSentence) - (84.6 * averageSyllablesPerWord);
        
        let level: 'easy' | 'moderate' | 'difficult';
        if (score >= 60) {
            level = 'easy';
        } else if (score >= 30) {
            level = 'moderate';
        } else {
            level = 'difficult';
        }

        return {
            score: Math.max(0, Math.min(100, Math.round(score))),
            level,
            averageWordsPerSentence: Math.round(averageWordsPerSentence * 100) / 100,
            averageSyllablesPerWord: Math.round(averageSyllablesPerWord * 100) / 100
        };
    }

    /**
     * Calculates entity density and distribution
     */
    private calculateEntityDensity(content: ProcessedContent): {
        overall: number;
        byType: Record<string, number>;
        distribution: 'sparse' | 'balanced' | 'dense';
    } {
        const wordCount = content.cleanContent.split(/\s+/).length;
        const entityCount = content.entities.length;
        const overall = entityCount / wordCount * 100;

        const byType: Record<string, number> = {};
        Object.values(EntityType).forEach(type => {
            const count = content.entities.filter(e => e.type === type).length;
            byType[type] = count / wordCount * 100;
        });

        let distribution: 'sparse' | 'balanced' | 'dense';
        if (overall < 2) {
            distribution = 'sparse';
        } else if (overall < 5) {
            distribution = 'balanced';
        } else {
            distribution = 'dense';
        }

        return { overall, byType, distribution };
    }

    /**
     * Analyzes topic distribution and focus
     */
    private analyzeTopicDistribution(content: ProcessedContent): {
        primary: string;
        secondary: string[];
        focus: 'narrow' | 'moderate' | 'broad';
        topicCount: number;
    } {
        const highConfidenceTopics = content.topics
            .filter(t => t.confidence > 0.5)
            .sort((a, b) => b.confidence - a.confidence);

        const primary = highConfidenceTopics[0]?.topic || 'general';
        const secondary = highConfidenceTopics.slice(1, 4).map(t => t.topic);

        let focus: 'narrow' | 'moderate' | 'broad';
        if (highConfidenceTopics.length <= 2) {
            focus = 'narrow';
        } else if (highConfidenceTopics.length <= 5) {
            focus = 'moderate';
        } else {
            focus = 'broad';
        }

        return {
            primary,
            secondary,
            focus,
            topicCount: highConfidenceTopics.length
        };
    }

    /**
     * Private helper methods for complexity assessment
     */
    private assessCompleteness(content: ProcessedContent): number {
        let score = 0.5; // base score

        // Has clear structure
        if (content.structure.sections.length > 0) score += 0.1;
        if (content.structure.headers.length > 0) score += 0.1;

        // Has entities
        if (content.entities.length > 0) score += 0.1;

        // Has topics
        if (content.topics.length > 0) score += 0.1;

        // Content length indicates completeness
        const wordCount = content.cleanContent.split(/\s+/).length;
        if (wordCount > 100) score += 0.1;
        if (wordCount > 500) score += 0.1;

        return Math.min(1, score);
    }

    private assessClarity(content: ProcessedContent): number {
        let score = 0.5;

        // Clear sentence structure
        const sentences = content.cleanContent.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const avgWordsPerSentence = content.cleanContent.split(/\s+/).length / sentences.length;
        
        if (avgWordsPerSentence < 25) score += 0.2; // Not too long sentences
        if (avgWordsPerSentence > 8) score += 0.1; // Not too short sentences

        // Low ambiguity (fewer questions relative to statements)
        const questionCount = (content.cleanContent.match(/\?/g) || []).length;
        const questionRatio = questionCount / sentences.length;
        if (questionRatio < 0.3) score += 0.2;

        return Math.min(1, score);
    }

    private assessStructure(content: ProcessedContent): number {
        let score = 0.3; // base score

        if (content.structure.sections.length > 0) score += 0.2;
        if (content.structure.headers.length > 0) score += 0.2;
        if (content.structure.lists.length > 0) score += 0.1;
        if (content.structure.codeBlocks.length > 0) score += 0.1;
        if (content.structure.dialogues.length > 0) score += 0.1;

        return Math.min(1, score);
    }

    private assessEntityRichness(content: ProcessedContent): number {
        const wordCount = content.cleanContent.split(/\s+/).length;
        const entityDensity = content.entities.length / wordCount * 100;
        
        if (entityDensity > 5) return 1;
        if (entityDensity > 3) return 0.8;
        if (entityDensity > 1) return 0.6;
        if (entityDensity > 0.5) return 0.4;
        return 0.2;
    }

    private assessCoherence(content: ProcessedContent): number {
        let score = 0.5;

        // Topic consistency
        const primaryTopics = content.topics.filter(t => t.confidence > 0.6);
        if (primaryTopics.length > 0 && primaryTopics.length <= 3) score += 0.2;

        // Entity consistency (same entities mentioned multiple times)
        const entityCounts = new Map<string, number>();
        content.entities.forEach(entity => {
            entityCounts.set(entity.text, (entityCounts.get(entity.text) || 0) + 1);
        });
        
        const repeatedEntities = Array.from(entityCounts.values()).filter(count => count > 1).length;
        if (repeatedEntities > 0) score += 0.2;

        // Sentiment consistency
        if (content.sentiment.emotions.length <= 2) score += 0.1;

        return Math.min(1, score);
    }

    private assessVocabularyComplexity(content: string): number {
        const words = content.toLowerCase().split(/\s+/).filter(w => w.length > 0);
        const uniqueWords = new Set(words);
        const vocabularyRichness = uniqueWords.size / words.length;
        
        const longWords = words.filter(w => w.length > 6).length;
        const longWordRatio = longWords / words.length;
        
        return (vocabularyRichness + longWordRatio) / 2;
    }

    private assessStructuralComplexity(structure: any): number {
        let complexity = 0;
        
        complexity += Math.min(structure.sections.length * 0.1, 0.3);
        complexity += Math.min(structure.headers.length * 0.1, 0.2);
        complexity += Math.min(structure.lists.length * 0.05, 0.2);
        complexity += Math.min(structure.dialogues.length * 0.1, 0.3);
        
        return Math.min(1, complexity);
    }

    private assessConceptualComplexity(content: ProcessedContent): number {
        let complexity = 0;
        
        complexity += Math.min(content.topics.length * 0.1, 0.4);
        complexity += Math.min(content.entities.length * 0.02, 0.3);
        complexity += Math.min(content.decisions.length * 0.1, 0.3);
        
        return Math.min(1, complexity);
    }

    private assessRelationshipComplexity(content: ProcessedContent): number {
        const entities = content.entities;
        const relationships = entities.length * (entities.length - 1) / 2; // potential relationships
        return Math.min(1, relationships * 0.001); // normalize
    }

    private calculateAverageSyllables(words: string[]): number {
        if (words.length === 0) return 0;
        
        const totalSyllables = words.reduce((sum, word) => {
            return sum + this.countSyllables(word);
        }, 0);
        
        return totalSyllables / words.length;
    }

    private countSyllables(word: string): number {
        word = word.toLowerCase();
        if (word.length <= 3) return 1;
        
        // Remove common endings that don't add syllables
        word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
        word = word.replace(/^y/, '');
        
        // Count vowel groups
        const matches = word.match(/[aeiouy]{1,2}/g);
        return Math.max(1, matches ? matches.length : 1);
    }

    private calculateOverallConfidence(content: ProcessedContent): number {
        const factors = [
            content.entities.length > 0 ? 0.2 : 0,
            content.topics.length > 0 ? 0.2 : 0,
            content.sentiment.confidence,
            content.structure.sections.length > 0 ? 0.1 : 0,
            content.cleanContent.length > 100 ? 0.2 : content.cleanContent.length / 500,
        ];

        return Math.min(1, factors.reduce((sum, factor) => sum + factor, 0.3));
    }
}