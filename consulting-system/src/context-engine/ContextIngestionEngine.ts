/**
 * Context Ingestion Engine - Core Implementation
 * 
 * Main engine that processes messy input data and transforms it into
 * structured, analyzable context with depth tracking and gap detection.
 */

import {
  RawInput,
  NormalizedContext,
  ProcessingConfig,
  ProcessingStats,
  ContextIngestionEngine,
  InputSourceType,
  ProcessingError,
  ErrorType,
  ContextDepth,
  QualityDistribution,
  ConfidenceScore,
  AIProvider,
  OutputFormat
} from './types';
import { InputNormalizer } from './InputNormalizer';
import { ContextAnalyzer } from './ContextAnalyzer';
import { GapDetector } from './GapDetector';
import { MetadataEnricher } from './MetadataEnricher';
import { QualityAssessor } from './QualityAssessor';

export class ContextIngestionEngineImpl implements ContextIngestionEngine {
  private stats: ProcessingStats;
  private inputNormalizer: InputNormalizer;
  private contextAnalyzer: ContextAnalyzer;
  private gapDetector: GapDetector;
  private metadataEnricher: MetadataEnricher;
  private qualityAssessor: QualityAssessor;

  constructor() {
    this.stats = {
      totalProcessed: 0,
      successCount: 0,
      errorCount: 0,
      averageProcessingTime: 0,
      qualityDistribution: {
        high: 0,
        medium: 0,
        low: 0
      }
    };

    this.inputNormalizer = new InputNormalizer();
    this.contextAnalyzer = new ContextAnalyzer();
    this.gapDetector = new GapDetector();
    this.metadataEnricher = new MetadataEnricher();
    this.qualityAssessor = new QualityAssessor();
  }

  /**
   * Process a single raw input into normalized context
   */
  async processInput(input: RawInput, config?: ProcessingConfig): Promise<NormalizedContext> {
    const startTime = Date.now();
    const processingConfig = this.getDefaultConfig(config);

    try {
      this.stats.totalProcessed++;

      // Step 1: Detect input type if unknown
      if (input.sourceType === InputSourceType.UNKNOWN) {
        input.sourceType = await this.detectInputType(input.content);
      }

      // Step 2: Normalize the input
      const normalizedContent = await this.inputNormalizer.normalize(input, processingConfig);

      // Step 3: Analyze context and extract information
      const processedContent = await this.contextAnalyzer.analyze(
        normalizedContent,
        input.sourceType,
        processingConfig
      );

      // Step 4: Detect context gaps
      const gaps = processingConfig.findGaps 
        ? await this.gapDetector.detectGaps(processedContent, input)
        : [];

      // Step 5: Enrich metadata
      const enrichedMetadata = await this.metadataEnricher.enrich(
        input.metadata,
        processedContent,
        processingConfig
      );

      // Step 6: Determine context depth
      const contextDepth = this.determineContextDepth(processedContent, enrichedMetadata);

      // Step 7: Calculate confidence scores
      const confidence = this.calculateConfidence(
        processedContent,
        gaps,
        enrichedMetadata,
        processingConfig
      );

      // Step 8: Create normalized context
      const normalizedContext: NormalizedContext = {
        id: this.generateId(),
        originalId: input.id,
        content: processedContent,
        metadata: enrichedMetadata,
        contextDepth,
        gaps,
        confidence,
        relationships: [], // Will be populated by relationship tracking
        timestamp: input.timestamp,
        lastProcessed: new Date()
      };

      // Step 9: Quality assessment
      const qualityScore = await this.qualityAssessor.assess(normalizedContext);
      normalizedContext.metadata.qualityScore = qualityScore;

      // Step 10: Update statistics
      this.updateStats(startTime, qualityScore);
      this.stats.successCount++;

      return normalizedContext;

    } catch (error) {
      this.stats.errorCount++;
      
      const processingError: ProcessingError = {
        id: this.generateId(),
        type: this.classifyError(error),
        message: error.message || 'Unknown processing error',
        details: error,
        timestamp: new Date(),
        recoverable: this.isRecoverableError(error)
      };

      throw processingError;
    }
  }

  /**
   * Process multiple inputs in batch
   */
  async batchProcess(inputs: RawInput[], config?: ProcessingConfig): Promise<NormalizedContext[]> {
    const results: NormalizedContext[] = [];
    const errors: ProcessingError[] = [];

    // Process in chunks to manage memory and API limits
    const chunkSize = 5;
    for (let i = 0; i < inputs.length; i += chunkSize) {
      const chunk = inputs.slice(i, i + chunkSize);
      
      const chunkPromises = chunk.map(async (input) => {
        try {
          return await this.processInput(input, config);
        } catch (error) {
          errors.push(error as ProcessingError);
          return null;
        }
      });

      const chunkResults = await Promise.all(chunkPromises);
      results.push(...chunkResults.filter(result => result !== null) as NormalizedContext[]);

      // Add delay between chunks to respect rate limits
      if (i + chunkSize < inputs.length) {
        await this.delay(1000);
      }
    }

    if (errors.length > 0) {
      console.warn(`Batch processing completed with ${errors.length} errors:`, errors);
    }

    return results;
  }

  /**
   * Detect the input type from content analysis
   */
  async detectInputType(content: string): Promise<InputSourceType> {
    const detectionRules = [
      {
        type: InputSourceType.EMAIL,
        patterns: [
          /^(From:|To:|Subject:|Date:)/mi,
          /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/m,
          /(Dear |Hi |Hello )/i
        ]
      },
      {
        type: InputSourceType.TRANSCRIPT,
        patterns: [
          /^\[?\d{1,2}:\d{2}(:\d{2})?\]?\s+/m,
          /^Speaker \d+:/mi,
          /^[A-Z][a-z]+:\s+/m,
          /(um|uh|you know|like)/gi
        ]
      },
      {
        type: InputSourceType.MEETING_RECORDING,
        patterns: [
          /meeting|conference|call/i,
          /agenda|minutes|action items/i,
          /attendees|participants/i
        ]
      },
      {
        type: InputSourceType.CHAT,
        patterns: [
          /^\[\d{1,2}:\d{2}\]/m,
          /^<[^>]+>/m,
          /(lol|omg|btw|fyi)/gi
        ]
      },
      {
        type: InputSourceType.DOCUMENT,
        patterns: [
          /^#+ /m,
          /^## /m,
          /^### /m,
          /^\d+\. /m
        ]
      }
    ];

    for (const rule of detectionRules) {
      const matches = rule.patterns.filter(pattern => 
        pattern.test(content)
      ).length;
      
      if (matches >= 2) {
        return rule.type;
      }
    }

    return InputSourceType.UNKNOWN;
  }

  /**
   * Validate the output quality and completeness
   */
  async validateOutput(context: NormalizedContext): Promise<boolean> {
    const validationChecks = [
      // Basic structure validation
      () => !!context.id && !!context.originalId,
      () => !!context.content && !!context.content.summary,
      () => !!context.metadata && context.metadata.wordCount > 0,
      () => context.confidence.overall >= 0 && context.confidence.overall <= 1,
      
      // Content quality validation
      () => context.content.keyPoints.length > 0,
      () => context.content.summary.length > 10,
      () => context.metadata.qualityScore?.completeness >= 0.3,
      
      // Gap detection validation
      () => Array.isArray(context.gaps),
      () => context.gaps.every(gap => gap.severity && gap.description)
    ];

    return validationChecks.every(check => {
      try {
        return check();
      } catch {
        return false;
      }
    });
  }

  /**
   * Get processing statistics
   */
  getProcessingStats(): ProcessingStats {
    return { ...this.stats };
  }

  // Private helper methods

  private getDefaultConfig(config?: ProcessingConfig): ProcessingConfig {
    return {
      enableDeepAnalysis: true,
      extractEntities: true,
      detectSentiment: true,
      identifyActionItems: true,
      trackRelationships: true,
      findGaps: true,
      aiModel: {
        provider: AIProvider.ANTHROPIC,
        model: 'claude-3-sonnet-20240229',
        temperature: 0.3,
        maxTokens: 4000
      },
      outputFormat: OutputFormat.JSON,
      qualityThreshold: 0.6,
      ...config
    };
  }

  private determineContextDepth(processedContent: any, metadata: any): ContextDepth {
    const metrics = {
      informationDensity: this.calculateInformationDensity(processedContent),
      conceptualComplexity: this.calculateConceptualComplexity(processedContent),
      relationshipDepth: this.calculateRelationshipDepth(processedContent),
      implicitKnowledge: this.calculateImplicitKnowledge(processedContent),
      contextualReferences: this.calculateContextualReferences(processedContent)
    };

    const averageScore = Object.values(metrics).reduce((sum, score) => sum + score, 0) / 5;

    if (averageScore >= 0.8) return ContextDepth.DEEP;
    if (averageScore >= 0.5) return ContextDepth.MEDIUM;
    return ContextDepth.SURFACE;
  }

  private calculateInformationDensity(content: any): number {
    const entityCount = content.entities?.length || 0;
    const wordCount = content.originalContent?.split(' ').length || 1;
    return Math.min(entityCount / (wordCount / 10), 1);
  }

  private calculateConceptualComplexity(content: any): number {
    const technicalTerms = content.entities?.filter((e: any) => 
      e.type === 'technical_term' || e.type === 'concept'
    ).length || 0;
    const totalEntities = content.entities?.length || 1;
    return technicalTerms / totalEntities;
  }

  private calculateRelationshipDepth(content: any): number {
    // Placeholder - would analyze relationships between entities
    return Math.random() * 0.6 + 0.2; // 0.2 to 0.8 range
  }

  private calculateImplicitKnowledge(content: any): number {
    // Placeholder - would detect implicit references and assumptions
    return Math.random() * 0.5 + 0.3; // 0.3 to 0.8 range
  }

  private calculateContextualReferences(content: any): number {
    // Count references to external knowledge or previous context
    const referencePatterns = [
      /as mentioned/gi,
      /previously/gi,
      /as discussed/gi,
      /referring to/gi,
      /in relation to/gi
    ];

    const content_str = content.originalContent || '';
    const references = referencePatterns.reduce((count, pattern) => {
      return count + (content_str.match(pattern) || []).length;
    }, 0);

    const wordCount = content_str.split(' ').length || 1;
    return Math.min(references / (wordCount / 100), 1);
  }

  private calculateConfidence(
    processedContent: any,
    gaps: any[],
    metadata: any,
    config: ProcessingConfig
  ): ConfidenceScore {
    const extraction = this.calculateExtractionConfidence(processedContent);
    const classification = this.calculateClassificationConfidence(metadata);
    const relationships = this.calculateRelationshipConfidence(processedContent);
    const gapsConfidence = this.calculateGapsConfidence(gaps);

    return {
      overall: (extraction + classification + relationships + gapsConfidence) / 4,
      extraction,
      classification,
      relationships,
      gaps: gapsConfidence
    };
  }

  private calculateExtractionConfidence(content: any): number {
    if (!content.entities || content.entities.length === 0) return 0.3;
    
    const avgEntityConfidence = content.entities.reduce(
      (sum: number, entity: any) => sum + (entity.confidence || 0.5), 0
    ) / content.entities.length;

    return Math.min(avgEntityConfidence, 1);
  }

  private calculateClassificationConfidence(metadata: any): number {
    return metadata.qualityScore?.accuracy || 0.5;
  }

  private calculateRelationshipConfidence(content: any): number {
    // Placeholder for relationship confidence calculation
    return 0.7;
  }

  private calculateGapsConfidence(gaps: any[]): number {
    if (gaps.length === 0) return 1.0; // No gaps found = high confidence
    
    const avgGapConfidence = gaps.reduce(
      (sum, gap) => sum + (gap.confidence || 0.5), 0
    ) / gaps.length;

    return avgGapConfidence;
  }

  private updateStats(startTime: number, qualityScore: any): void {
    const processingTime = Date.now() - startTime;
    
    // Update average processing time
    this.stats.averageProcessingTime = 
      (this.stats.averageProcessingTime * (this.stats.totalProcessed - 1) + processingTime) / 
      this.stats.totalProcessed;

    // Update quality distribution
    const overallQuality = qualityScore.completeness || 0.5;
    if (overallQuality >= 0.8) {
      this.stats.qualityDistribution.high++;
    } else if (overallQuality >= 0.5) {
      this.stats.qualityDistribution.medium++;
    } else {
      this.stats.qualityDistribution.low++;
    }
  }

  private classifyError(error: any): ErrorType {
    if (error.name?.includes('Parse') || error.message?.includes('parse')) {
      return ErrorType.PARSING_ERROR;
    }
    if (error.message?.includes('timeout')) {
      return ErrorType.TIMEOUT_ERROR;
    }
    if (error.status === 429 || error.message?.includes('quota')) {
      return ErrorType.QUOTA_EXCEEDED;
    }
    if (error.message?.includes('validation')) {
      return ErrorType.VALIDATION_ERROR;
    }
    return ErrorType.UNKNOWN_ERROR;
  }

  private isRecoverableError(error: any): boolean {
    const errorType = this.classifyError(error);
    return [
      ErrorType.TIMEOUT_ERROR,
      ErrorType.QUOTA_EXCEEDED
    ].includes(errorType);
  }

  private generateId(): string {
    return `ctx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}