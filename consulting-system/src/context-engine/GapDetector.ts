/**
 * Gap Detector - Identifies and reports context gaps
 * 
 * Analyzes processed content to identify gaps in context that need
 * human clarification or additional information gathering.
 */

import {
  ContextGap,
  GapType,
  GapSeverity,
  ProcessedContent,
  RawInput,
  ExtractedEntity,
  EntityType,
  Question,
  ActionItem
} from './types';

export class GapDetector {

  /**
   * Detect various types of context gaps in processed content
   */
  async detectGaps(processedContent: ProcessedContent, originalInput: RawInput): Promise<ContextGap[]> {
    const gaps: ContextGap[] = [];

    // Detect different types of gaps
    gaps.push(...await this.detectMissingContext(processedContent, originalInput));
    gaps.push(...await this.detectUnclearReferences(processedContent));
    gaps.push(...await this.detectIncompleteInformation(processedContent));
    gaps.push(...await this.detectContradictoryInformation(processedContent));
    gaps.push(...await this.detectAmbiguousMeaning(processedContent));
    gaps.push(...await this.detectTemporalGaps(processedContent));
    gaps.push(...await this.detectParticipantGaps(processedContent, originalInput));
    gaps.push(...await this.detectDomainKnowledgeGaps(processedContent));

    // Sort by severity and confidence
    return gaps.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const aSeverity = severityOrder[a.severity];
      const bSeverity = severityOrder[b.severity];
      
      if (aSeverity !== bSeverity) return bSeverity - aSeverity;
      return b.confidence - a.confidence;
    });
  }

  /**
   * Detect missing context that would help understand the content better
   */
  private async detectMissingContext(processedContent: ProcessedContent, originalInput: RawInput): Promise<ContextGap[]> {
    const gaps: ContextGap[] = [];

    // Check for pronouns without clear antecedents
    const pronounGaps = this.detectPronounGaps(processedContent);
    gaps.push(...pronounGaps);

    // Check for incomplete action items
    const actionItemGaps = this.detectActionItemGaps(processedContent);
    gaps.push(...actionItemGaps);

    // Check for decisions without rationale
    const decisionGaps = this.detectDecisionGaps(processedContent);
    gaps.push(...decisionGaps);

    // Check for technical terms without explanation
    const technicalGaps = this.detectTechnicalTermGaps(processedContent);
    gaps.push(...technicalGaps);

    return gaps;
  }

  /**
   * Detect unclear references that need clarification
   */
  private async detectUnclearReferences(processedContent: ProcessedContent): Promise<ContextGap[]> {
    const gaps: ContextGap[] = [];
    const text = processedContent.originalContent.toLowerCase();

    // Look for vague references
    const vagueReferencePatterns = [
      /\b(it|this|that|they|them|those|these)\b/g,
      /\bthe (thing|item|issue|problem|solution|approach|method)\b/g,
      /\b(above|below|mentioned|discussed|said)\b/g
    ];

    vagueReferencePatterns.forEach((pattern, patternIndex) => {
      const matches = Array.from(text.matchAll(pattern));
      
      matches.forEach((match, matchIndex) => {
        // Check if the reference has a clear antecedent nearby
        const contextBefore = this.getContextBefore(text, match.index || 0, 100);
        const contextAfter = this.getContextAfter(text, (match.index || 0) + match[0].length, 50);
        
        if (!this.hasClearAntecedent(match[0], contextBefore)) {
          gaps.push({
            id: this.generateGapId('unclear_ref', patternIndex, matchIndex),
            type: GapType.UNCLEAR_REFERENCE,
            description: `Unclear reference "${match[0]}" - what specifically does this refer to?`,
            severity: this.determineReferenceSeverity(match[0], contextBefore, contextAfter),
            suggestions: this.generateReferenceSuggestions(match[0], contextBefore, contextAfter),
            relatedEntities: this.extractRelatedEntities(contextBefore + ' ' + contextAfter, processedContent.entities),
            confidence: this.calculateReferenceGapConfidence(match[0], contextBefore)
          });
        }
      });
    });

    return gaps;
  }

  /**
   * Detect incomplete information that needs additional details
   */
  private async detectIncompleteInformation(processedContent: ProcessedContent): Promise<ContextGap[]> {
    const gaps: ContextGap[] = [];

    // Check for incomplete action items
    processedContent.structure.actionItems?.forEach((actionItem, index) => {
      const incompleteAspects = [];
      
      if (!actionItem.assignee) incompleteAspects.push('assignee');
      if (!actionItem.dueDate) incompleteAspects.push('due date');
      if (actionItem.description.length < 10) incompleteAspects.push('detailed description');

      if (incompleteAspects.length > 0) {
        gaps.push({
          id: this.generateGapId('incomplete_action', index),
          type: GapType.INCOMPLETE_INFORMATION,
          description: `Action item missing: ${incompleteAspects.join(', ')}`,
          severity: incompleteAspects.length >= 2 ? GapSeverity.HIGH : GapSeverity.MEDIUM,
          suggestions: incompleteAspects.map(aspect => `Specify ${aspect} for this action item`),
          relatedEntities: [actionItem.description],
          confidence: 0.9
        });
      }
    });

    // Check for incomplete decisions
    processedContent.structure.decisions?.forEach((decision, index) => {
      const incompleteAspects = [];
      
      if (!decision.decisionMaker) incompleteAspects.push('decision maker');
      if (!decision.rationale) incompleteAspects.push('rationale');
      if (!decision.impacts || decision.impacts.length === 0) incompleteAspects.push('impact analysis');

      if (incompleteAspects.length > 0) {
        gaps.push({
          id: this.generateGapId('incomplete_decision', index),
          type: GapType.INCOMPLETE_INFORMATION,
          description: `Decision missing: ${incompleteAspects.join(', ')}`,
          severity: incompleteAspects.includes('rationale') ? GapSeverity.HIGH : GapSeverity.MEDIUM,
          suggestions: incompleteAspects.map(aspect => `Provide ${aspect} for this decision`),
          relatedEntities: [decision.description],
          confidence: 0.85
        });
      }
    });

    // Check for unanswered questions
    const unansweredQuestions = processedContent.structure.questions?.filter(q => !q.resolved) || [];
    unansweredQuestions.forEach((question, index) => {
      gaps.push({
        id: this.generateGapId('unanswered_question', index),
        type: GapType.INCOMPLETE_INFORMATION,
        description: `Unanswered question: "${question.question}"`,
        severity: GapSeverity.MEDIUM,
        suggestions: [
          'Provide answer to this question',
          'Clarify if question is still relevant',
          'Assign someone to research the answer'
        ],
        relatedEntities: [question.question],
        confidence: 0.95
      });
    });

    return gaps;
  }

  /**
   * Detect contradictory information within the content
   */
  private async detectContradictoryInformation(processedContent: ProcessedContent): Promise<ContextGap[]> {
    const gaps: ContextGap[] = [];

    // Check for contradictory statements
    const contradictionIndicators = [
      'however', 'but', 'although', 'despite', 'on the other hand',
      'nevertheless', 'nonetheless', 'conversely', 'in contrast'
    ];

    const text = processedContent.originalContent.toLowerCase();
    const sentences = text.split(/[.!?]+/);

    sentences.forEach((sentence, index) => {
      const hasContradiction = contradictionIndicators.some(indicator => 
        sentence.includes(indicator)
      );

      if (hasContradiction) {
        // Look for potential contradictions in nearby sentences
        const contextSentences = sentences.slice(Math.max(0, index - 2), index + 3);
        const contradiction = this.analyzeContradiction(sentence, contextSentences);

        if (contradiction) {
          gaps.push({
            id: this.generateGapId('contradiction', index),
            type: GapType.CONTRADICTORY_INFO,
            description: `Potential contradiction detected: ${contradiction.description}`,
            severity: GapSeverity.MEDIUM,
            suggestions: [
              'Clarify which statement is accurate',
              'Provide context for the apparent contradiction',
              'Explain the relationship between conflicting statements'
            ],
            relatedEntities: contradiction.relatedEntities,
            confidence: contradiction.confidence
          });
        }
      }
    });

    // Check for conflicting dates/times
    const dateEntities = processedContent.entities.filter(e => 
      [EntityType.DATE, EntityType.TIME].includes(e.type)
    );

    if (dateEntities.length > 1) {
      const dateConflicts = this.detectDateConflicts(dateEntities);
      gaps.push(...dateConflicts);
    }

    return gaps;
  }

  /**
   * Detect ambiguous meaning that needs clarification
   */
  private async detectAmbiguousMeaning(processedContent: ProcessedContent): Promise<ContextGap[]> {
    const gaps: ContextGap[] = [];

    // Look for ambiguous pronouns
    const ambiguousPronouns = ['it', 'this', 'that', 'they', 'them'];
    const text = processedContent.originalContent.toLowerCase();

    ambiguousPronouns.forEach(pronoun => {
      const regex = new RegExp(`\\b${pronoun}\\b`, 'g');
      const matches = Array.from(text.matchAll(regex));

      matches.forEach((match, index) => {
        const context = this.getContextAround(text, match.index || 0, 100);
        const ambiguityScore = this.calculateAmbiguityScore(pronoun, context);

        if (ambiguityScore > 0.6) {
          gaps.push({
            id: this.generateGapId('ambiguous', pronoun, index),
            type: GapType.AMBIGUOUS_MEANING,
            description: `Ambiguous pronoun "${pronoun}" - multiple possible referents`,
            severity: ambiguityScore > 0.8 ? GapSeverity.HIGH : GapSeverity.MEDIUM,
            suggestions: [
              `Replace "${pronoun}" with specific noun`,
              'Clarify what this pronoun refers to',
              'Restructure sentence to remove ambiguity'
            ],
            relatedEntities: this.findPossibleReferents(context, processedContent.entities),
            confidence: ambiguityScore
          });
        }
      });
    });

    // Look for ambiguous technical terms
    const technicalEntities = processedContent.entities.filter(e => 
      e.type === EntityType.TECHNICAL_TERM
    );

    technicalEntities.forEach((entity, index) => {
      if (this.hasMultipleMeanings(entity.value)) {
        gaps.push({
          id: this.generateGapId('ambiguous_tech', index),
          type: GapType.AMBIGUOUS_MEANING,
          description: `Technical term "${entity.value}" has multiple possible meanings`,
          severity: GapSeverity.MEDIUM,
          suggestions: [
            'Define the specific meaning in this context',
            'Provide additional context or examples',
            'Use more specific terminology'
          ],
          relatedEntities: [entity.value],
          confidence: 0.7
        });
      }
    });

    return gaps;
  }

  /**
   * Detect temporal gaps in the narrative or timeline
   */
  private async detectTemporalGaps(processedContent: ProcessedContent): Promise<ContextGap[]> {
    const gaps: ContextGap[] = [];

    // Extract temporal entities and analyze sequence
    const temporalEntities = processedContent.entities.filter(e => 
      [EntityType.DATE, EntityType.TIME].includes(e.type)
    );

    if (temporalEntities.length > 1) {
      // Check for timeline gaps
      const timelineGaps = this.analyzeTimeline(temporalEntities);
      gaps.push(...timelineGaps);
    }

    // Look for temporal indicators without specific times
    const vagueTemporalIndicators = [
      'recently', 'soon', 'later', 'earlier', 'previously', 
      'afterwards', 'meanwhile', 'eventually', 'sometime'
    ];

    const text = processedContent.originalContent.toLowerCase();
    
    vagueTemporalIndicators.forEach((indicator, index) => {
      const regex = new RegExp(`\\b${indicator}\\b`, 'g');
      const matches = Array.from(text.matchAll(regex));

      matches.forEach((match, matchIndex) => {
        gaps.push({
          id: this.generateGapId('temporal_vague', index, matchIndex),
          type: GapType.TEMPORAL_GAP,
          description: `Vague temporal reference "${indicator}" - when specifically?`,
          severity: GapSeverity.LOW,
          suggestions: [
            'Provide specific date or time',
            'Clarify the temporal relationship',
            'Add timeline context'
          ],
          relatedEntities: [],
          confidence: 0.6
        });
      });
    });

    return gaps;
  }

  /**
   * Detect participant gaps - missing or unclear participant information
   */
  private async detectParticipantGaps(processedContent: ProcessedContent, originalInput: RawInput): Promise<ContextGap[]> {
    const gaps: ContextGap[] = [];

    // Check for unknown speakers in dialogues
    const dialogues = processedContent.structure.dialogues || [];
    const unknownSpeakers = dialogues.filter(d => 
      !d.speaker || d.speaker === 'Unknown' || d.speaker.length < 2
    );

    if (unknownSpeakers.length > 0) {
      gaps.push({
        id: this.generateGapId('unknown_speakers'),
        type: GapType.PARTICIPANT_GAP,
        description: `${unknownSpeakers.length} dialogue(s) have unknown speakers`,
        severity: unknownSpeakers.length > 3 ? GapSeverity.HIGH : GapSeverity.MEDIUM,
        suggestions: [
          'Identify the speakers in these dialogues',
          'Add speaker identification to transcript',
          'Clarify participant roles'
        ],
        relatedEntities: unknownSpeakers.map(d => d.content.substring(0, 50) + '...'),
        confidence: 0.9
      });
    }

    // Check for action items without assignees
    const actionItems = processedContent.structure.actionItems || [];
    const unassignedActions = actionItems.filter(a => !a.assignee);

    if (unassignedActions.length > 0) {
      gaps.push({
        id: this.generateGapId('unassigned_actions'),
        type: GapType.PARTICIPANT_GAP,
        description: `${unassignedActions.length} action item(s) have no assigned owner`,
        severity: GapSeverity.HIGH,
        suggestions: [
          'Assign owners to action items',
          'Clarify who is responsible for each task',
          'Add accountability information'
        ],
        relatedEntities: unassignedActions.map(a => a.description),
        confidence: 0.95
      });
    }

    // Check for decisions without decision makers
    const decisions = processedContent.structure.decisions || [];
    const anonymousDecisions = decisions.filter(d => !d.decisionMaker);

    if (anonymousDecisions.length > 0) {
      gaps.push({
        id: this.generateGapId('anonymous_decisions'),
        type: GapType.PARTICIPANT_GAP,
        description: `${anonymousDecisions.length} decision(s) have no identified decision maker`,
        severity: GapSeverity.MEDIUM,
        suggestions: [
          'Identify who made these decisions',
          'Add decision authority information',
          'Clarify the decision-making process'
        ],
        relatedEntities: anonymousDecisions.map(d => d.description),
        confidence: 0.85
      });
    }

    return gaps;
  }

  /**
   * Detect domain knowledge gaps - concepts that need explanation
   */
  private async detectDomainKnowledgeGaps(processedContent: ProcessedContent): Promise<ContextGap[]> {
    const gaps: ContextGap[] = [];

    // Identify technical terms without context
    const technicalEntities = processedContent.entities.filter(e => 
      e.type === EntityType.TECHNICAL_TERM
    );

    technicalEntities.forEach((entity, index) => {
      const hasExplanation = this.hasNearbyExplanation(
        entity.value, 
        entity.context,
        processedContent.originalContent
      );

      if (!hasExplanation && this.isComplexTechnicalTerm(entity.value)) {
        gaps.push({
          id: this.generateGapId('domain_knowledge', index),
          type: GapType.DOMAIN_KNOWLEDGE_GAP,
          description: `Technical term "${entity.value}" may need explanation for broader audience`,
          severity: GapSeverity.LOW,
          suggestions: [
            'Provide definition or explanation',
            'Add context for non-technical audience',
            'Link to relevant documentation'
          ],
          relatedEntities: [entity.value],
          confidence: 0.7
        });
      }
    });

    // Check for acronyms without expansion
    const acronymPattern = /\b([A-Z]{2,6})\b/g;
    const text = processedContent.originalContent;
    const acronyms = new Set<string>();

    let match;
    while ((match = acronymPattern.exec(text)) !== null) {
      const acronym = match[1];
      if (acronym.length >= 2 && acronym.length <= 6) {
        acronyms.add(acronym);
      }
    }

    acronyms.forEach((acronym, index) => {
      if (!this.hasAcronymExpansion(acronym, text)) {
        gaps.push({
          id: this.generateGapId('acronym', Array.from(acronyms).indexOf(acronym)),
          type: GapType.DOMAIN_KNOWLEDGE_GAP,
          description: `Acronym "${acronym}" is not expanded`,
          severity: GapSeverity.LOW,
          suggestions: [
            `Expand "${acronym}" on first use`,
            'Provide definition or full form',
            'Add to glossary or abbreviations list'
          ],
          relatedEntities: [acronym],
          confidence: 0.8
        });
      }
    });

    return gaps;
  }

  // Helper methods for gap detection

  private detectPronounGaps(processedContent: ProcessedContent): ContextGap[] {
    const gaps: ContextGap[] = [];
    const text = processedContent.originalContent.toLowerCase();
    const problematicPronouns = ['it', 'this', 'that', 'they', 'them'];

    problematicPronouns.forEach((pronoun, pronounIndex) => {
      const regex = new RegExp(`\\b${pronoun}\\b`, 'g');
      const matches = Array.from(text.matchAll(regex));

      matches.forEach((match, matchIndex) => {
        const contextBefore = this.getContextBefore(text, match.index || 0, 50);
        if (!this.hasNounInContext(contextBefore)) {
          gaps.push({
            id: this.generateGapId('pronoun', pronounIndex, matchIndex),
            type: GapType.MISSING_CONTEXT,
            description: `Pronoun "${pronoun}" lacks clear antecedent`,
            severity: GapSeverity.MEDIUM,
            suggestions: [
              `Replace "${pronoun}" with specific noun`,
              'Provide clear antecedent',
              'Restructure sentence for clarity'
            ],
            relatedEntities: [],
            confidence: 0.7
          });
        }
      });
    });

    return gaps;
  }

  private detectActionItemGaps(processedContent: ProcessedContent): ContextGap[] {
    const gaps: ContextGap[] = [];
    const actionItems = processedContent.structure.actionItems || [];

    // Look for action words without formal action items
    const actionWords = ['need to', 'should', 'must', 'will', 'todo', 'action'];
    const text = processedContent.originalContent.toLowerCase();

    actionWords.forEach((word, index) => {
      if (text.includes(word) && actionItems.length === 0) {
        gaps.push({
          id: this.generateGapId('missing_actions', index),
          type: GapType.MISSING_CONTEXT,
          description: `Text contains action words but no formal action items identified`,
          severity: GapSeverity.MEDIUM,
          suggestions: [
            'Extract and formalize action items',
            'Create task list from action words',
            'Assign ownership and deadlines'
          ],
          relatedEntities: [word],
          confidence: 0.6
        });
      }
    });

    return gaps;
  }

  private detectDecisionGaps(processedContent: ProcessedContent): ContextGap[] {
    const gaps: ContextGap[] = [];
    const decisions = processedContent.structure.decisions || [];

    decisions.forEach((decision, index) => {
      if (!decision.rationale) {
        gaps.push({
          id: this.generateGapId('decision_rationale', index),
          type: GapType.MISSING_CONTEXT,
          description: 'Decision lacks rationale or justification',
          severity: GapSeverity.HIGH,
          suggestions: [
            'Provide reasoning behind the decision',
            'Explain factors that influenced the decision',
            'Document decision criteria'
          ],
          relatedEntities: [decision.description],
          confidence: 0.9
        });
      }
    });

    return gaps;
  }

  private detectTechnicalTermGaps(processedContent: ProcessedContent): ContextGap[] {
    const gaps: ContextGap[] = [];
    const technicalTerms = processedContent.entities.filter(e => 
      e.type === EntityType.TECHNICAL_TERM
    );

    technicalTerms.forEach((term, index) => {
      if (term.confidence > 0.7 && !this.hasNearbyDefinition(term.value, term.context)) {
        gaps.push({
          id: this.generateGapId('tech_definition', index),
          type: GapType.MISSING_CONTEXT,
          description: `Technical term "${term.value}" may need definition`,
          severity: GapSeverity.LOW,
          suggestions: [
            'Provide definition for technical term',
            'Add explanatory context',
            'Link to documentation'
          ],
          relatedEntities: [term.value],
          confidence: 0.6
        });
      }
    });

    return gaps;
  }

  private analyzeContradiction(sentence: string, contextSentences: string[]): { description: string, relatedEntities: string[], confidence: number } | null {
    // Simple contradiction detection - would need more sophisticated analysis
    const negationWords = ['not', 'no', 'never', 'cannot', 'won\'t', 'don\'t'];
    const hasNegation = negationWords.some(word => sentence.includes(word));

    if (hasNegation) {
      return {
        description: 'Sentence contains negation that may contradict nearby statements',
        relatedEntities: contextSentences.slice(0, 2),
        confidence: 0.5
      };
    }

    return null;
  }

  private detectDateConflicts(dateEntities: ExtractedEntity[]): ContextGap[] {
    const gaps: ContextGap[] = [];
    
    // Simple date conflict detection
    for (let i = 0; i < dateEntities.length - 1; i++) {
      for (let j = i + 1; j < dateEntities.length; j++) {
        const date1 = dateEntities[i];
        const date2 = dateEntities[j];
        
        if (this.areDatesConflicting(date1.value, date2.value)) {
          gaps.push({
            id: this.generateGapId('date_conflict', i, j),
            type: GapType.CONTRADICTORY_INFO,
            description: `Potential date conflict between "${date1.value}" and "${date2.value}"`,
            severity: GapSeverity.MEDIUM,
            suggestions: [
              'Verify which date is correct',
              'Clarify the relationship between dates',
              'Provide additional temporal context'
            ],
            relatedEntities: [date1.value, date2.value],
            confidence: 0.6
          });
        }
      }
    }

    return gaps;
  }

  private analyzeTimeline(temporalEntities: ExtractedEntity[]): ContextGap[] {
    // Placeholder for timeline gap analysis
    return [];
  }

  private calculateAmbiguityScore(pronoun: string, context: string): number {
    // Count possible referents in context
    const nouns = this.extractNouns(context);
    if (nouns.length > 2) {
      return 0.8; // High ambiguity
    } else if (nouns.length === 2) {
      return 0.6; // Medium ambiguity
    }
    return 0.3; // Low ambiguity
  }

  private hasMultipleMeanings(technicalTerm: string): boolean {
    // List of terms known to have multiple meanings in technical contexts
    const ambiguousTechnicalTerms = [
      'server', 'client', 'framework', 'service', 'container',
      'interface', 'protocol', 'endpoint', 'resource', 'entity'
    ];
    
    return ambiguousTechnicalTerms.includes(technicalTerm.toLowerCase());
  }

  private findPossibleReferents(context: string, entities: ExtractedEntity[]): string[] {
    return entities
      .filter(entity => context.toLowerCase().includes(entity.value.toLowerCase()))
      .map(entity => entity.value)
      .slice(0, 3);
  }

  private isComplexTechnicalTerm(term: string): boolean {
    const complexTerms = [
      'microservices', 'containerization', 'orchestration', 'kubernetes',
      'distributed', 'scalability', 'blockchain', 'machine learning'
    ];
    
    return complexTerms.includes(term.toLowerCase()) || term.length > 12;
  }

  private hasNearbyExplanation(term: string, context: string, fullText: string): boolean {
    const explanationIndicators = [
      'is', 'means', 'refers to', 'defined as', 'which is', 'i.e.', 'that is'
    ];
    
    return explanationIndicators.some(indicator => 
      context.toLowerCase().includes(`${term.toLowerCase()} ${indicator}`) ||
      context.toLowerCase().includes(`${indicator} ${term.toLowerCase()}`)
    );
  }

  private hasAcronymExpansion(acronym: string, text: string): boolean {
    // Look for the expansion pattern nearby
    const words = text.split(/\W+/);
    const acronymIndex = words.findIndex(word => word === acronym);
    
    if (acronymIndex === -1) return false;

    // Check nearby words for expansion
    const searchRange = 10;
    const start = Math.max(0, acronymIndex - searchRange);
    const end = Math.min(words.length, acronymIndex + searchRange);
    
    const nearbyWords = words.slice(start, end);
    
    // Simple check: see if there are words that start with the acronym letters
    const acronymLetters = acronym.split('');
    let matchingWords = 0;
    
    for (const letter of acronymLetters) {
      if (nearbyWords.some(word => word.toLowerCase().startsWith(letter.toLowerCase()))) {
        matchingWords++;
      }
    }
    
    return matchingWords >= acronym.length * 0.7; // At least 70% of letters match
  }

  private hasNearbyDefinition(term: string, context: string): boolean {
    const definitionWords = ['is', 'means', 'refers', 'defined', 'explains'];
    return definitionWords.some(word => context.toLowerCase().includes(word));
  }

  // Utility methods

  private hasNounInContext(context: string): boolean {
    // Simple noun detection - would use NLP library in production
    const commonNouns = [
      'system', 'user', 'data', 'file', 'process', 'service', 'application',
      'document', 'report', 'meeting', 'project', 'task', 'issue'
    ];
    
    return commonNouns.some(noun => context.includes(noun));
  }

  private hasClearAntecedent(reference: string, contextBefore: string): boolean {
    // Check if there's a clear noun within reasonable distance
    const words = contextBefore.split(/\s+/).reverse(); // Reverse to check most recent first
    const maxDistance = 10;
    
    for (let i = 0; i < Math.min(words.length, maxDistance); i++) {
      const word = words[i].toLowerCase();
      if (this.isNoun(word) && word.length > 3) {
        return true;
      }
    }
    
    return false;
  }

  private isNoun(word: string): boolean {
    // Simple noun detection - would use proper POS tagging in production
    const commonNouns = [
      'system', 'user', 'data', 'file', 'process', 'service', 'application',
      'document', 'report', 'meeting', 'project', 'task', 'issue', 'team',
      'company', 'person', 'time', 'place', 'thing', 'way', 'work'
    ];
    
    return commonNouns.includes(word.toLowerCase());
  }

  private extractNouns(text: string): string[] {
    const words = text.toLowerCase().split(/\W+/);
    return words.filter(word => this.isNoun(word));
  }

  private areDatesConflicting(date1: string, date2: string): boolean {
    // Simple date conflict detection - would need more sophisticated logic
    try {
      const d1 = new Date(date1);
      const d2 = new Date(date2);
      
      // Check if dates are more than a year apart (might indicate conflict)
      const yearDiff = Math.abs(d1.getFullYear() - d2.getFullYear());
      return yearDiff > 1;
    } catch {
      return false;
    }
  }

  private determineReferenceSeverity(reference: string, contextBefore: string, contextAfter: string): GapSeverity {
    if (['it', 'this'].includes(reference.toLowerCase())) {
      return contextBefore.length < 20 ? GapSeverity.HIGH : GapSeverity.MEDIUM;
    }
    return GapSeverity.MEDIUM;
  }

  private generateReferenceSuggestions(reference: string, contextBefore: string, contextAfter: string): string[] {
    return [
      `Replace "${reference}" with specific noun or phrase`,
      'Provide clearer context for the reference',
      'Consider restructuring the sentence'
    ];
  }

  private calculateReferenceGapConfidence(reference: string, contextBefore: string): number {
    if (contextBefore.length < 30) return 0.9;
    if (this.hasNounInContext(contextBefore)) return 0.4;
    return 0.7;
  }

  private extractRelatedEntities(context: string, entities: ExtractedEntity[]): string[] {
    return entities
      .filter(entity => context.toLowerCase().includes(entity.value.toLowerCase()))
      .map(entity => entity.value)
      .slice(0, 3);
  }

  private getContextBefore(text: string, position: number, length: number): string {
    const start = Math.max(0, position - length);
    return text.substring(start, position);
  }

  private getContextAfter(text: string, position: number, length: number): string {
    const end = Math.min(text.length, position + length);
    return text.substring(position, end);
  }

  private getContextAround(text: string, position: number, totalLength: number): string {
    const halfLength = totalLength / 2;
    const start = Math.max(0, position - halfLength);
    const end = Math.min(text.length, position + halfLength);
    return text.substring(start, end);
  }

  private generateGapId(...parts: (string | number)[]): string {
    return `gap_${parts.join('_')}_${Date.now()}`;
  }
}