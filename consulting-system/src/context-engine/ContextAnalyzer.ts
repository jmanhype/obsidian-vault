/**
 * Context Analyzer - Extracts insights and tracks context depth
 * 
 * Analyzes normalized content to extract entities, topics, sentiment,
 * and determines the depth of contextual information (surface/medium/deep).
 */

import {
  ProcessedContent,
  ExtractedEntity,
  Topic,
  SentimentAnalysis,
  ContentStructure,
  ActionItem,
  Decision,
  Question,
  InputSourceType,
  ProcessingConfig,
  EntityType,
  TopicCategory,
  EmotionType,
  Priority,
  ActionStatus,
  ContextDepth,
  ContextDepthMetrics
} from './types';
import { NormalizedContent } from './InputNormalizer';

export class ContextAnalyzer {
  
  /**
   * Analyze normalized content to extract insights and determine depth
   */
  async analyze(
    normalizedContent: NormalizedContent,
    sourceType: InputSourceType,
    config: ProcessingConfig
  ): Promise<ProcessedContent> {
    
    const entities = config.extractEntities 
      ? await this.extractEntities(normalizedContent)
      : [];

    const topics = await this.extractTopics(normalizedContent);
    
    const sentiment = config.detectSentiment
      ? await this.analyzeSentiment(normalizedContent)
      : this.createNeutralSentiment();

    const structure = await this.analyzeContentStructure(normalizedContent, config);

    const summary = await this.generateSummary(normalizedContent, entities, topics);
    
    const keyPoints = await this.extractKeyPoints(normalizedContent, entities, topics);

    return {
      summary,
      keyPoints,
      entities,
      topics,
      sentiment,
      structure,
      originalContent: normalizedContent.cleanedText
    };
  }

  /**
   * Calculate context depth metrics for determining surface/medium/deep levels
   */
  calculateDepthMetrics(
    processedContent: ProcessedContent,
    normalizedContent: NormalizedContent
  ): ContextDepthMetrics {
    
    const informationDensity = this.calculateInformationDensity(processedContent, normalizedContent);
    const conceptualComplexity = this.calculateConceptualComplexity(processedContent);
    const relationshipDepth = this.calculateRelationshipDepth(processedContent);
    const implicitKnowledge = this.calculateImplicitKnowledge(processedContent);
    const contextualReferences = this.calculateContextualReferences(processedContent);

    return {
      informationDensity,
      conceptualComplexity,
      relationshipDepth,
      implicitKnowledge,
      contextualReferences
    };
  }

  /**
   * Determine context depth based on metrics
   */
  determineContextDepth(metrics: ContextDepthMetrics): ContextDepth {
    const weights = {
      informationDensity: 0.2,
      conceptualComplexity: 0.25,
      relationshipDepth: 0.2,
      implicitKnowledge: 0.2,
      contextualReferences: 0.15
    };

    const weightedScore = 
      metrics.informationDensity * weights.informationDensity +
      metrics.conceptualComplexity * weights.conceptualComplexity +
      metrics.relationshipDepth * weights.relationshipDepth +
      metrics.implicitKnowledge * weights.implicitKnowledge +
      metrics.contextualReferences * weights.contextualReferences;

    if (weightedScore >= 0.75) return ContextDepth.DEEP;
    if (weightedScore >= 0.45) return ContextDepth.MEDIUM;
    return ContextDepth.SURFACE;
  }

  // Entity extraction methods

  private async extractEntities(normalizedContent: NormalizedContent): Promise<ExtractedEntity[]> {
    const entities: ExtractedEntity[] = [];
    const text = normalizedContent.cleanedText;

    // Extract different types of entities
    entities.push(...this.extractPersons(text));
    entities.push(...this.extractOrganizations(text));
    entities.push(...this.extractDates(text));
    entities.push(...this.extractTimes(text));
    entities.push(...this.extractLocations(text));
    entities.push(...this.extractEmails(text));
    entities.push(...this.extractPhones(text));
    entities.push(...this.extractUrls(text));
    entities.push(...this.extractMoney(text));
    entities.push(...this.extractTechnicalTerms(text));
    entities.push(...this.extractConcepts(text));

    return entities.sort((a, b) => b.confidence - a.confidence);
  }

  private extractPersons(text: string): ExtractedEntity[] {
    const entities: ExtractedEntity[] = [];
    
    // Pattern for names (Title + First + Last)
    const namePattern = /\b(Mr\.?|Ms\.?|Mrs\.?|Dr\.?|Prof\.?)?\s*([A-Z][a-z]+)\s+([A-Z][a-z]+)\b/g;
    let match;

    while ((match = namePattern.exec(text)) !== null) {
      const fullName = match[0].trim();
      const context = this.extractContext(text, match.index, 50);
      
      entities.push({
        type: EntityType.PERSON,
        value: fullName,
        confidence: this.calculatePersonConfidence(fullName, context),
        context,
        position: { start: match.index, end: match.index + match[0].length }
      });
    }

    // Also look for participants from structured dialogues
    // This would be enhanced with the normalized content structure

    return entities;
  }

  private extractOrganizations(text: string): ExtractedEntity[] {
    const entities: ExtractedEntity[] = [];
    
    // Common organization patterns
    const orgPatterns = [
      /\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)\s+(Inc\.?|LLC|Corp\.?|Ltd\.?|Co\.?|Company|Corporation)\b/g,
      /\b([A-Z][A-Z]+)\b/g // Acronyms
    ];

    orgPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const orgName = match[1] || match[0];
        const context = this.extractContext(text, match.index, 50);
        
        entities.push({
          type: EntityType.ORGANIZATION,
          value: orgName.trim(),
          confidence: this.calculateOrgConfidence(orgName, context),
          context,
          position: { start: match.index, end: match.index + match[0].length }
        });
      }
    });

    return entities;
  }

  private extractDates(text: string): ExtractedEntity[] {
    const entities: ExtractedEntity[] = [];
    
    const datePatterns = [
      /\b(\d{1,2}\/\d{1,2}\/\d{2,4})\b/g,
      /\b(\d{1,2}-\d{1,2}-\d{2,4})\b/g,
      /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/g,
      /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},?\s+\d{4}\b/g
    ];

    datePatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const dateStr = match[0];
        const context = this.extractContext(text, match.index, 30);
        
        entities.push({
          type: EntityType.DATE,
          value: dateStr,
          confidence: 0.9,
          context,
          position: { start: match.index, end: match.index + match[0].length }
        });
      }
    });

    return entities;
  }

  private extractTimes(text: string): ExtractedEntity[] {
    const entities: ExtractedEntity[] = [];
    
    const timePattern = /\b(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[AaPp][Mm])?)\b/g;
    let match;

    while ((match = timePattern.exec(text)) !== null) {
      const timeStr = match[0];
      const context = this.extractContext(text, match.index, 30);
      
      entities.push({
        type: EntityType.TIME,
        value: timeStr,
        confidence: 0.85,
        context,
        position: { start: match.index, end: match.index + match[0].length }
      });
    }

    return entities;
  }

  private extractLocations(text: string): ExtractedEntity[] {
    const entities: ExtractedEntity[] = [];
    
    // Simple location patterns - would be enhanced with gazetteer
    const locationPatterns = [
      /\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)*),\s*([A-Z]{2})\b/g, // City, State
      /\b(\d+\s[A-Z][a-z]+(?:\s[A-Z][a-z]+)*\s(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd))\b/g // Addresses
    ];

    locationPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const location = match[0];
        const context = this.extractContext(text, match.index, 50);
        
        entities.push({
          type: EntityType.LOCATION,
          value: location,
          confidence: 0.7,
          context,
          position: { start: match.index, end: match.index + match[0].length }
        });
      }
    });

    return entities;
  }

  private extractEmails(text: string): ExtractedEntity[] {
    const entities: ExtractedEntity[] = [];
    
    const emailPattern = /\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/g;
    let match;

    while ((match = emailPattern.exec(text)) !== null) {
      const email = match[1];
      const context = this.extractContext(text, match.index, 30);
      
      entities.push({
        type: EntityType.EMAIL,
        value: email,
        confidence: 0.95,
        context,
        position: { start: match.index, end: match.index + match[0].length }
      });
    }

    return entities;
  }

  private extractPhones(text: string): ExtractedEntity[] {
    const entities: ExtractedEntity[] = [];
    
    const phonePattern = /\b(\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4})\b/g;
    let match;

    while ((match = phonePattern.exec(text)) !== null) {
      const phone = match[1];
      const context = this.extractContext(text, match.index, 30);
      
      entities.push({
        type: EntityType.PHONE,
        value: phone,
        confidence: 0.85,
        context,
        position: { start: match.index, end: match.index + match[0].length }
      });
    }

    return entities;
  }

  private extractUrls(text: string): ExtractedEntity[] {
    const entities: ExtractedEntity[] = [];
    
    const urlPattern = /\b(https?:\/\/[^\s]+)\b/g;
    let match;

    while ((match = urlPattern.exec(text)) !== null) {
      const url = match[1];
      const context = this.extractContext(text, match.index, 30);
      
      entities.push({
        type: EntityType.URL,
        value: url,
        confidence: 0.9,
        context,
        position: { start: match.index, end: match.index + match[0].length }
      });
    }

    return entities;
  }

  private extractMoney(text: string): ExtractedEntity[] {
    const entities: ExtractedEntity[] = [];
    
    const moneyPattern = /\$([0-9,]+(?:\.[0-9]{2})?)\b/g;
    let match;

    while ((match = moneyPattern.exec(text)) !== null) {
      const amount = match[0];
      const context = this.extractContext(text, match.index, 30);
      
      entities.push({
        type: EntityType.MONEY,
        value: amount,
        confidence: 0.9,
        context,
        position: { start: match.index, end: match.index + match[0].length }
      });
    }

    return entities;
  }

  private extractTechnicalTerms(text: string): ExtractedEntity[] {
    const entities: ExtractedEntity[] = [];
    
    // Common technical term patterns
    const techTerms = [
      'API', 'SDK', 'JSON', 'XML', 'HTTP', 'HTTPS', 'REST', 'GraphQL',
      'database', 'server', 'client', 'framework', 'library', 'module',
      'algorithm', 'deployment', 'infrastructure', 'scalability',
      'microservices', 'containerization', 'orchestration'
    ];

    const techPattern = new RegExp(`\\b(${techTerms.join('|')})\\b`, 'gi');
    let match;

    while ((match = techPattern.exec(text)) !== null) {
      const term = match[1];
      const context = this.extractContext(text, match.index, 40);
      
      entities.push({
        type: EntityType.TECHNICAL_TERM,
        value: term,
        confidence: 0.8,
        context,
        position: { start: match.index, end: match.index + match[0].length }
      });
    }

    return entities;
  }

  private extractConcepts(text: string): ExtractedEntity[] {
    const entities: ExtractedEntity[] = [];
    
    // Business/domain concepts
    const concepts = [
      'strategy', 'implementation', 'requirements', 'specification',
      'workflow', 'process', 'methodology', 'best practice',
      'optimization', 'analysis', 'assessment', 'evaluation',
      'integration', 'migration', 'transformation'
    ];

    const conceptPattern = new RegExp(`\\b(${concepts.join('|')})\\b`, 'gi');
    let match;

    while ((match = conceptPattern.exec(text)) !== null) {
      const concept = match[1];
      const context = this.extractContext(text, match.index, 40);
      
      entities.push({
        type: EntityType.CONCEPT,
        value: concept,
        confidence: 0.6,
        context,
        position: { start: match.index, end: match.index + match[0].length }
      });
    }

    return entities;
  }

  // Topic extraction

  private async extractTopics(normalizedContent: NormalizedContent): Promise<Topic[]> {
    const text = normalizedContent.cleanedText;
    const topics: Topic[] = [];

    // Simple keyword-based topic extraction
    const topicKeywords = {
      [TopicCategory.TECHNICAL]: [
        'technology', 'system', 'architecture', 'development', 'software',
        'programming', 'database', 'api', 'integration', 'deployment'
      ],
      [TopicCategory.BUSINESS]: [
        'business', 'strategy', 'marketing', 'sales', 'revenue', 'profit',
        'customer', 'client', 'market', 'competition', 'growth'
      ],
      [TopicCategory.FINANCIAL]: [
        'budget', 'cost', 'expense', 'investment', 'funding', 'revenue',
        'financial', 'accounting', 'profit', 'loss'
      ],
      [TopicCategory.OPERATIONAL]: [
        'process', 'workflow', 'operation', 'procedure', 'efficiency',
        'productivity', 'management', 'team', 'resource'
      ],
      [TopicCategory.STRATEGIC]: [
        'strategy', 'planning', 'vision', 'mission', 'goals', 'objectives',
        'roadmap', 'direction', 'future', 'long-term'
      ]
    };

    Object.entries(topicKeywords).forEach(([category, keywords]) => {
      const relevantKeywords: string[] = [];
      let totalScore = 0;

      keywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = text.match(regex);
        if (matches) {
          relevantKeywords.push(keyword);
          totalScore += matches.length;
        }
      });

      if (relevantKeywords.length > 0) {
        const wordCount = text.split(' ').length;
        const relevance = Math.min(totalScore / (wordCount / 100), 1);
        
        topics.push({
          name: this.formatCategoryName(category as TopicCategory),
          relevance,
          keywords: relevantKeywords,
          category: category as TopicCategory
        });
      }
    });

    return topics.sort((a, b) => b.relevance - a.relevance);
  }

  // Sentiment analysis

  private async analyzeSentiment(normalizedContent: NormalizedContent): Promise<SentimentAnalysis> {
    const text = normalizedContent.cleanedText;
    
    // Simple rule-based sentiment analysis
    const positiveWords = [
      'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic',
      'success', 'achieve', 'accomplish', 'progress', 'improve'
    ];
    
    const negativeWords = [
      'bad', 'terrible', 'awful', 'horrible', 'fail', 'failure', 'problem',
      'issue', 'concern', 'worry', 'disappointed', 'frustrated'
    ];

    const emotionWords = {
      [EmotionType.JOY]: ['happy', 'joy', 'excited', 'pleased', 'delighted'],
      [EmotionType.SADNESS]: ['sad', 'disappointed', 'upset', 'depressed'],
      [EmotionType.ANGER]: ['angry', 'frustrated', 'annoyed', 'mad', 'furious'],
      [EmotionType.FEAR]: ['worried', 'concerned', 'afraid', 'anxious', 'scared'],
      [EmotionType.SURPRISE]: ['surprised', 'shocked', 'amazed', 'astonished'],
      [EmotionType.TRUST]: ['trust', 'confident', 'reliable', 'dependable'],
      [EmotionType.ANTICIPATION]: ['excited', 'eager', 'looking forward', 'anticipate']
    };

    const words = text.toLowerCase().split(/\W+/);
    let positiveScore = 0;
    let negativeScore = 0;

    words.forEach(word => {
      if (positiveWords.includes(word)) positiveScore++;
      if (negativeWords.includes(word)) negativeScore++;
    });

    const totalSentimentWords = positiveScore + negativeScore;
    const overall = totalSentimentWords > 0 
      ? (positiveScore - negativeScore) / totalSentimentWords 
      : 0;

    const confidence = totalSentimentWords / words.length * 10; // Rough confidence measure

    // Detect emotions
    const emotions = Object.entries(emotionWords).map(([emotion, emotionKeywords]) => {
      const emotionScore = emotionKeywords.reduce((score, keyword) => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = text.match(regex);
        return score + (matches ? matches.length : 0);
      }, 0);

      return {
        type: emotion as EmotionType,
        intensity: Math.min(emotionScore / (words.length / 100), 1)
      };
    }).filter(emotion => emotion.intensity > 0.1);

    return {
      overall: Math.max(-1, Math.min(1, overall)),
      confidence: Math.min(1, confidence),
      emotions
    };
  }

  private createNeutralSentiment(): SentimentAnalysis {
    return {
      overall: 0,
      confidence: 0.5,
      emotions: []
    };
  }

  // Content structure analysis

  private async analyzeContentStructure(
    normalizedContent: NormalizedContent,
    config: ProcessingConfig
  ): Promise<ContentStructure> {
    
    const actionItems = config.identifyActionItems
      ? await this.extractActionItems(normalizedContent)
      : [];

    const decisions = await this.extractDecisions(normalizedContent);
    const questions = await this.extractQuestions(normalizedContent);

    return {
      sections: normalizedContent.structure.sections.map(s => ({
        title: s.title,
        content: s.content,
        level: s.level,
        startPosition: s.position,
        endPosition: s.position
      })),
      dialogues: normalizedContent.structure.dialogues,
      actionItems,
      decisions,
      questions
    };
  }

  private async extractActionItems(normalizedContent: NormalizedContent): Promise<ActionItem[]> {
    const text = normalizedContent.cleanedText;
    const actionItems: ActionItem[] = [];

    // Look for action item patterns
    const actionPatterns = [
      /\b(TODO|Action item|Action:|Follow up|Need to|Should|Must|Task):\s*(.+)/gi,
      /\b(Assign|Assignee|Owner|Responsible):\s*([^.]+)/gi,
      /\b(Due|Deadline|By):\s*([^.]+)/gi
    ];

    const lines = text.split('\n');
    lines.forEach((line, index) => {
      actionPatterns.forEach(pattern => {
        const match = line.match(pattern);
        if (match) {
          actionItems.push({
            description: match[2] || match[1] || line.trim(),
            assignee: this.extractAssignee(line),
            dueDate: this.extractDueDate(line),
            priority: this.determinePriority(line),
            status: ActionStatus.IDENTIFIED,
            position: { start: index, end: index, line: index }
          });
        }
      });
    });

    return actionItems;
  }

  private async extractDecisions(normalizedContent: NormalizedContent): Promise<Decision[]> {
    const text = normalizedContent.cleanedText;
    const decisions: Decision[] = [];

    const decisionPatterns = [
      /\b(Decision|Decided|Conclude|Resolution):\s*(.+)/gi,
      /\bWe (decided|concluded|agreed) (?:that|to)?\s*(.+)/gi,
      /\b(Approved|Rejected|Accepted):\s*(.+)/gi
    ];

    const lines = text.split('\n');
    lines.forEach((line, index) => {
      decisionPatterns.forEach(pattern => {
        const match = line.match(pattern);
        if (match) {
          decisions.push({
            description: match[2] || match[1] || line.trim(),
            decisionMaker: this.extractDecisionMaker(line),
            rationale: this.extractRationale(normalizedContent, index),
            impacts: this.extractImpacts(line),
            position: { start: index, end: index, line: index }
          });
        }
      });
    });

    return decisions;
  }

  private async extractQuestions(normalizedContent: NormalizedContent): Promise<Question[]> {
    const text = normalizedContent.cleanedText;
    const questions: Question[] = [];

    const lines = text.split('\n');
    lines.forEach((line, index) => {
      if (line.trim().endsWith('?')) {
        // Check for Q&A patterns
        const qaMatch = line.match(/^([^:]+):\s*(.+\?)$/);
        const questioner = qaMatch ? qaMatch[1].trim() : undefined;
        const questionText = qaMatch ? qaMatch[2].trim() : line.trim();

        // Look for answer in following lines
        const answer = this.findAnswer(lines, index);

        questions.push({
          question: questionText,
          answer: answer?.text,
          questioner,
          answerer: answer?.answerer,
          resolved: !!answer,
          position: { start: index, end: index, line: index }
        });
      }
    });

    return questions;
  }

  // Depth calculation methods

  private calculateInformationDensity(
    processedContent: ProcessedContent,
    normalizedContent: NormalizedContent
  ): number {
    const wordCount = processedContent.originalContent.split(' ').length;
    const entityCount = processedContent.entities.length;
    const structureCount = 
      normalizedContent.structure.sections.length +
      normalizedContent.structure.dialogues.length +
      normalizedContent.structure.lists.length +
      normalizedContent.structure.codeBlocks.length;

    // Information density based on entities and structure per word
    const density = (entityCount + structureCount * 2) / (wordCount / 10);
    return Math.min(density / 5, 1); // Normalize to 0-1
  }

  private calculateConceptualComplexity(processedContent: ProcessedContent): number {
    const totalEntities = processedContent.entities.length || 1;
    const conceptualEntities = processedContent.entities.filter(e => 
      [EntityType.CONCEPT, EntityType.TECHNICAL_TERM].includes(e.type)
    ).length;

    const technicalTopics = processedContent.topics.filter(t =>
      [TopicCategory.TECHNICAL, TopicCategory.STRATEGIC].includes(t.category)
    ).length;

    const complexityScore = (conceptualEntities / totalEntities) + (technicalTopics * 0.2);
    return Math.min(complexityScore, 1);
  }

  private calculateRelationshipDepth(processedContent: ProcessedContent): number {
    // Look for relationship indicators in text
    const relationshipIndicators = [
      'because', 'therefore', 'however', 'although', 'meanwhile', 'consequently',
      'in contrast', 'on the other hand', 'as a result', 'furthermore',
      'moreover', 'nevertheless', 'similarly', 'likewise'
    ];

    const text = processedContent.originalContent.toLowerCase();
    let relationshipCount = 0;

    relationshipIndicators.forEach(indicator => {
      const regex = new RegExp(`\\b${indicator}\\b`, 'g');
      const matches = text.match(regex);
      if (matches) relationshipCount += matches.length;
    });

    const wordCount = text.split(' ').length;
    return Math.min(relationshipCount / (wordCount / 50), 1);
  }

  private calculateImplicitKnowledge(processedContent: ProcessedContent): number {
    // Look for implicit knowledge indicators
    const implicitIndicators = [
      'as we know', 'obviously', 'clearly', 'as mentioned', 'as discussed',
      'referring to', 'in relation to', 'building on', 'following up on',
      'as established', 'given that', 'assuming'
    ];

    const text = processedContent.originalContent.toLowerCase();
    let implicitCount = 0;

    implicitIndicators.forEach(indicator => {
      const regex = new RegExp(`\\b${indicator}\\b`, 'g');
      const matches = text.match(regex);
      if (matches) implicitCount += matches.length;
    });

    // Also consider questions as implicit knowledge gaps
    const questionCount = processedContent.structure?.questions?.length || 0;
    
    const wordCount = text.split(' ').length;
    const implicitScore = (implicitCount + questionCount) / (wordCount / 100);
    return Math.min(implicitScore, 1);
  }

  private calculateContextualReferences(processedContent: ProcessedContent): number {
    // Count external references and dependencies
    const referenceIndicators = [
      'according to', 'based on', 'referenced in', 'mentioned in',
      'documented in', 'specified in', 'defined in', 'see also',
      'refer to', 'as per', 'following', 'per the'
    ];

    const text = processedContent.originalContent.toLowerCase();
    let referenceCount = 0;

    referenceIndicators.forEach(indicator => {
      const regex = new RegExp(`\\b${indicator}\\b`, 'g');
      const matches = text.match(regex);
      if (matches) referenceCount += matches.length;
    });

    // Also count URLs and document references
    const urlCount = processedContent.entities.filter(e => e.type === EntityType.URL).length;
    
    const wordCount = text.split(' ').length;
    const contextScore = (referenceCount + urlCount) / (wordCount / 100);
    return Math.min(contextScore, 1);
  }

  // Helper methods

  private async generateSummary(
    normalizedContent: NormalizedContent,
    entities: ExtractedEntity[],
    topics: Topic[]
  ): Promise<string> {
    const text = normalizedContent.cleanedText;
    
    // Simple extractive summary - take first few sentences and key points
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const firstSentences = sentences.slice(0, 2).join('. ') + '.';
    
    const keyEntities = entities.slice(0, 5).map(e => e.value).join(', ');
    const mainTopics = topics.slice(0, 3).map(t => t.name).join(', ');
    
    let summary = firstSentences;
    if (keyEntities) {
      summary += ` Key entities: ${keyEntities}.`;
    }
    if (mainTopics) {
      summary += ` Main topics: ${mainTopics}.`;
    }
    
    return summary;
  }

  private async extractKeyPoints(
    normalizedContent: NormalizedContent,
    entities: ExtractedEntity[],
    topics: Topic[]
  ): Promise<string[]> {
    const keyPoints: string[] = [];
    
    // Extract from structured content
    normalizedContent.structure.sections.forEach(section => {
      if (section.content.length > 50) {
        keyPoints.push(section.content.substring(0, 200) + '...');
      }
    });

    // Extract from lists
    normalizedContent.structure.lists.forEach(list => {
      keyPoints.push(...list.items.slice(0, 3));
    });

    // Extract sentences with high entity density
    const text = normalizedContent.cleanedText;
    const sentences = text.split(/[.!?]+/);
    
    sentences.forEach(sentence => {
      if (sentence.length > 30 && sentence.length < 200) {
        const entityMatches = entities.filter(entity => 
          sentence.toLowerCase().includes(entity.value.toLowerCase())
        ).length;
        
        if (entityMatches >= 2) {
          keyPoints.push(sentence.trim());
        }
      }
    });

    return keyPoints.slice(0, 10); // Limit to top 10 key points
  }

  private extractContext(text: string, position: number, length: number): string {
    const start = Math.max(0, position - length / 2);
    const end = Math.min(text.length, position + length / 2);
    return text.substring(start, end).trim();
  }

  private calculatePersonConfidence(name: string, context: string): number {
    let confidence = 0.5;
    
    // Increase confidence if context suggests a person
    if (context.toLowerCase().includes('said') || 
        context.toLowerCase().includes('told') ||
        context.toLowerCase().includes('mentioned')) {
      confidence += 0.2;
    }
    
    // Decrease confidence if it looks like a place or organization
    if (context.toLowerCase().includes('company') ||
        context.toLowerCase().includes('corporation')) {
      confidence -= 0.3;
    }
    
    return Math.max(0.1, Math.min(1, confidence));
  }

  private calculateOrgConfidence(orgName: string, context: string): number {
    let confidence = 0.6;
    
    if (context.toLowerCase().includes('company') ||
        context.toLowerCase().includes('corporation') ||
        context.toLowerCase().includes('organization')) {
      confidence += 0.2;
    }
    
    return Math.max(0.1, Math.min(1, confidence));
  }

  private formatCategoryName(category: TopicCategory): string {
    return category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  private extractAssignee(line: string): string | undefined {
    const assigneeMatch = line.match(/\b(?:assign|owner|responsible):\s*([^.,;]+)/i);
    return assigneeMatch ? assigneeMatch[1].trim() : undefined;
  }

  private extractDueDate(line: string): Date | undefined {
    const dateMatch = line.match(/\b(?:due|deadline|by):\s*([^.,;]+)/i);
    if (dateMatch) {
      try {
        return new Date(dateMatch[1].trim());
      } catch {
        return undefined;
      }
    }
    return undefined;
  }

  private determinePriority(line: string): Priority {
    const lowerLine = line.toLowerCase();
    if (lowerLine.includes('urgent') || lowerLine.includes('critical')) {
      return Priority.URGENT;
    } else if (lowerLine.includes('high') || lowerLine.includes('important')) {
      return Priority.HIGH;
    } else if (lowerLine.includes('low')) {
      return Priority.LOW;
    }
    return Priority.MEDIUM;
  }

  private extractDecisionMaker(line: string): string | undefined {
    const decisionMakerMatch = line.match(/\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)\s+(?:decided|concluded)/i);
    return decisionMakerMatch ? decisionMakerMatch[1].trim() : undefined;
  }

  private extractRationale(normalizedContent: NormalizedContent, lineIndex: number): string | undefined {
    // Look for rationale in surrounding lines
    const lines = normalizedContent.cleanedText.split('\n');
    const contextLines = lines.slice(Math.max(0, lineIndex - 2), Math.min(lines.length, lineIndex + 3));
    
    const rationale = contextLines.find(line => 
      line.toLowerCase().includes('because') || 
      line.toLowerCase().includes('reason') ||
      line.toLowerCase().includes('due to')
    );
    
    return rationale?.trim();
  }

  private extractImpacts(line: string): string[] {
    // Simple impact extraction - would need more sophisticated logic
    if (line.toLowerCase().includes('impact') || line.toLowerCase().includes('affect')) {
      return [line.trim()];
    }
    return [];
  }

  private findAnswer(lines: string[], questionIndex: number): { text: string, answerer?: string } | undefined {
    // Look for answer in next few lines
    const maxLookAhead = 3;
    for (let i = questionIndex + 1; i < Math.min(lines.length, questionIndex + maxLookAhead); i++) {
      const line = lines[i].trim();
      if (line.length > 10 && !line.endsWith('?')) {
        const answerMatch = line.match(/^([^:]+):\s*(.+)$/);
        if (answerMatch) {
          return {
            text: answerMatch[2].trim(),
            answerer: answerMatch[1].trim()
          };
        }
        return { text: line };
      }
    }
    return undefined;
  }
}