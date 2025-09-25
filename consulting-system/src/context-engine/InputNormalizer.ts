/**
 * Input Normalizer - Handles messy input data
 * 
 * Processes various input formats (transcripts, emails, notes, etc.)
 * and normalizes them into a consistent format for further processing.
 */

import {
  RawInput,
  InputSourceType,
  ProcessingConfig,
  ContentPosition
} from './types';

export interface NormalizedContent {
  cleanedText: string;
  structure: ParsedStructure;
  participants: string[];
  timestamps: TimestampInfo[];
  metadata: NormalizationMetadata;
}

export interface ParsedStructure {
  sections: Section[];
  dialogues: DialogueEntry[];
  headers: Header[];
  lists: List[];
  codeBlocks: CodeBlock[];
}

export interface Section {
  title: string;
  content: string;
  level: number;
  position: ContentPosition;
}

export interface DialogueEntry {
  speaker: string;
  content: string;
  timestamp?: Date;
  position: ContentPosition;
}

export interface Header {
  level: number;
  text: string;
  position: ContentPosition;
}

export interface List {
  type: 'ordered' | 'unordered';
  items: string[];
  position: ContentPosition;
}

export interface CodeBlock {
  language?: string;
  code: string;
  position: ContentPosition;
}

export interface TimestampInfo {
  timestamp: Date;
  associatedText: string;
  position: ContentPosition;
}

export interface NormalizationMetadata {
  originalLength: number;
  cleanedLength: number;
  compressionRatio: number;
  detectedLanguage: string;
  encoding: string;
  lineCount: number;
  structureTypes: string[];
}

export class InputNormalizer {
  
  /**
   * Normalize raw input based on its source type
   */
  async normalize(input: RawInput, config: ProcessingConfig): Promise<NormalizedContent> {
    const normalizer = this.getNormalizerForType(input.sourceType);
    return await normalizer(input, config);
  }

  private getNormalizerForType(sourceType: InputSourceType): 
    (input: RawInput, config: ProcessingConfig) => Promise<NormalizedContent> {
    
    switch (sourceType) {
      case InputSourceType.TRANSCRIPT:
        return this.normalizeTranscript.bind(this);
      case InputSourceType.EMAIL:
        return this.normalizeEmail.bind(this);
      case InputSourceType.NOTE:
        return this.normalizeNote.bind(this);
      case InputSourceType.DOCUMENT:
        return this.normalizeDocument.bind(this);
      case InputSourceType.CHAT:
        return this.normalizeChat.bind(this);
      case InputSourceType.MEETING_RECORDING:
        return this.normalizeMeetingRecording.bind(this);
      case InputSourceType.VOICE_MEMO:
        return this.normalizeVoiceMemo.bind(this);
      default:
        return this.normalizeGeneric.bind(this);
    }
  }

  /**
   * Normalize transcript content
   */
  private async normalizeTranscript(input: RawInput, config: ProcessingConfig): Promise<NormalizedContent> {
    let content = input.content;

    // Clean up transcript-specific noise
    content = this.removeTranscriptNoise(content);

    // Extract speakers and dialogues
    const dialogues = this.extractDialogues(content);
    const participants = this.extractParticipants(dialogues);

    // Extract timestamps
    const timestamps = this.extractTimestamps(content);

    // Clean text for analysis
    const cleanedText = this.cleanTranscriptText(content);

    // Parse structure
    const structure: ParsedStructure = {
      sections: this.extractSections(cleanedText),
      dialogues,
      headers: this.extractHeaders(cleanedText),
      lists: this.extractLists(cleanedText),
      codeBlocks: this.extractCodeBlocks(cleanedText)
    };

    return {
      cleanedText,
      structure,
      participants,
      timestamps,
      metadata: this.generateMetadata(input.content, cleanedText, structure)
    };
  }

  /**
   * Normalize email content
   */
  private async normalizeEmail(input: RawInput, config: ProcessingConfig): Promise<NormalizedContent> {
    let content = input.content;

    // Extract email headers
    const emailHeaders = this.extractEmailHeaders(content);
    
    // Remove email headers from content
    content = this.removeEmailHeaders(content);

    // Clean email-specific formatting
    content = this.cleanEmailContent(content);

    // Extract quoted replies
    const quotedSections = this.extractQuotedReplies(content);
    
    // Extract participants from headers and content
    const participants = this.extractEmailParticipants(emailHeaders, content);

    const cleanedText = this.cleanGenericText(content);
    
    const structure: ParsedStructure = {
      sections: this.extractSections(cleanedText),
      dialogues: this.convertQuotesToDialogues(quotedSections),
      headers: this.extractHeaders(cleanedText),
      lists: this.extractLists(cleanedText),
      codeBlocks: this.extractCodeBlocks(cleanedText)
    };

    return {
      cleanedText,
      structure,
      participants,
      timestamps: this.extractTimestamps(input.content),
      metadata: this.generateMetadata(input.content, cleanedText, structure)
    };
  }

  /**
   * Normalize note content (markdown/plain text)
   */
  private async normalizeNote(input: RawInput, config: ProcessingConfig): Promise<NormalizedContent> {
    let content = input.content;

    // Clean markdown formatting while preserving structure
    const cleanedText = this.cleanNoteContent(content);

    // Parse markdown structure
    const structure: ParsedStructure = {
      sections: this.extractMarkdownSections(content),
      dialogues: [],
      headers: this.extractMarkdownHeaders(content),
      lists: this.extractMarkdownLists(content),
      codeBlocks: this.extractMarkdownCodeBlocks(content)
    };

    return {
      cleanedText,
      structure,
      participants: [],
      timestamps: this.extractTimestamps(content),
      metadata: this.generateMetadata(input.content, cleanedText, structure)
    };
  }

  /**
   * Normalize document content
   */
  private async normalizeDocument(input: RawInput, config: ProcessingConfig): Promise<NormalizedContent> {
    return this.normalizeNote(input, config); // Similar to note processing
  }

  /**
   * Normalize chat content
   */
  private async normalizeChat(input: RawInput, config: ProcessingConfig): Promise<NormalizedContent> {
    let content = input.content;

    // Extract chat messages
    const dialogues = this.extractChatMessages(content);
    const participants = this.extractParticipants(dialogues);

    // Clean chat-specific formatting
    const cleanedText = this.cleanChatContent(content);

    const structure: ParsedStructure = {
      sections: [],
      dialogues,
      headers: [],
      lists: this.extractLists(cleanedText),
      codeBlocks: this.extractCodeBlocks(cleanedText)
    };

    return {
      cleanedText,
      structure,
      participants,
      timestamps: this.extractChatTimestamps(content),
      metadata: this.generateMetadata(input.content, cleanedText, structure)
    };
  }

  /**
   * Normalize meeting recording content
   */
  private async normalizeMeetingRecording(input: RawInput, config: ProcessingConfig): Promise<NormalizedContent> {
    // Similar to transcript but with meeting-specific processing
    return this.normalizeTranscript(input, config);
  }

  /**
   * Normalize voice memo content
   */
  private async normalizeVoiceMemo(input: RawInput, config: ProcessingConfig): Promise<NormalizedContent> {
    let content = input.content;

    // Clean voice memo artifacts
    content = this.removeVoiceMemoNoise(content);

    const cleanedText = this.cleanGenericText(content);
    
    const structure: ParsedStructure = {
      sections: this.extractSections(cleanedText),
      dialogues: [],
      headers: [],
      lists: this.extractLists(cleanedText),
      codeBlocks: []
    };

    return {
      cleanedText,
      structure,
      participants: [],
      timestamps: this.extractTimestamps(content),
      metadata: this.generateMetadata(input.content, cleanedText, structure)
    };
  }

  /**
   * Generic normalization for unknown types
   */
  private async normalizeGeneric(input: RawInput, config: ProcessingConfig): Promise<NormalizedContent> {
    const cleanedText = this.cleanGenericText(input.content);
    
    const structure: ParsedStructure = {
      sections: this.extractSections(cleanedText),
      dialogues: this.extractDialogues(cleanedText),
      headers: this.extractHeaders(cleanedText),
      lists: this.extractLists(cleanedText),
      codeBlocks: this.extractCodeBlocks(cleanedText)
    };

    return {
      cleanedText,
      structure,
      participants: this.extractParticipants(structure.dialogues),
      timestamps: this.extractTimestamps(input.content),
      metadata: this.generateMetadata(input.content, cleanedText, structure)
    };
  }

  // Content cleaning methods

  private removeTranscriptNoise(content: string): string {
    return content
      .replace(/\[inaudible\]/gi, '[UNCLEAR]')
      .replace(/\[crosstalk\]/gi, '[OVERLAPPING]')
      .replace(/\b(um|uh|er|ah){2,}\b/gi, '[FILLER]')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private cleanTranscriptText(content: string): string {
    return content
      .replace(/^\[?\d{1,2}:\d{2}(:\d{2})?\]?\s*/gm, '') // Remove timestamps
      .replace(/^[A-Z][a-z]+:\s*/gm, '') // Remove speaker labels
      .replace(/\[UNCLEAR\]|\[OVERLAPPING\]|\[FILLER\]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private removeEmailHeaders(content: string): string {
    return content.replace(/^(From|To|Cc|Bcc|Subject|Date|Reply-To):.*$/gm, '').trim();
  }

  private cleanEmailContent(content: string): string {
    return content
      .replace(/^>+\s*/gm, '') // Remove quote markers
      .replace(/On .* wrote:.*$/gm, '') // Remove forwarding headers
      .replace(/-----Original Message-----.*$/s, '') // Remove original message markers
      .replace(/\s+/g, ' ')
      .trim();
  }

  private cleanNoteContent(content: string): string {
    return content
      .replace(/^#+\s*/gm, '') // Remove markdown headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold formatting
      .replace(/\*(.*?)\*/g, '$1') // Remove italic formatting
      .replace(/`(.*?)`/g, '$1') // Remove inline code formatting
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // Extract link text
      .replace(/\s+/g, ' ')
      .trim();
  }

  private cleanChatContent(content: string): string {
    return content
      .replace(/^\[?\d{1,2}:\d{2}\]?\s*/gm, '') // Remove timestamps
      .replace(/^<[^>]+>\s*/gm, '') // Remove user markers
      .replace(/\s+/g, ' ')
      .trim();
  }

  private removeVoiceMemoNoise(content: string): string {
    return content
      .replace(/\b(um|uh|er|ah|like|you know)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private cleanGenericText(content: string): string {
    return content
      .replace(/\r\n/g, '\n')
      .replace(/\t/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Extraction methods

  private extractDialogues(content: string): DialogueEntry[] {
    const dialogues: DialogueEntry[] = [];
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      // Match patterns like "Speaker:" or "John Smith:" or "[Speaker]:"
      const speakerMatch = line.match(/^([A-Z][a-zA-Z\s]+):\s*(.+)$/);
      if (speakerMatch) {
        dialogues.push({
          speaker: speakerMatch[1].trim(),
          content: speakerMatch[2].trim(),
          position: { start: index, end: index }
        });
      }
    });

    return dialogues;
  }

  private extractParticipants(dialogues: DialogueEntry[]): string[] {
    const participants = new Set<string>();
    dialogues.forEach(dialogue => {
      if (dialogue.speaker && dialogue.speaker !== 'Unknown') {
        participants.add(dialogue.speaker);
      }
    });
    return Array.from(participants);
  }

  private extractTimestamps(content: string): TimestampInfo[] {
    const timestamps: TimestampInfo[] = [];
    const timestampRegex = /(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[AP]M)?)/g;
    let match;

    while ((match = timestampRegex.exec(content)) !== null) {
      timestamps.push({
        timestamp: this.parseTimestamp(match[1]),
        associatedText: this.getAssociatedText(content, match.index, 100),
        position: { start: match.index, end: match.index + match[0].length }
      });
    }

    return timestamps;
  }

  private extractChatTimestamps(content: string): TimestampInfo[] {
    const timestamps: TimestampInfo[] = [];
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      const timestampMatch = line.match(/^\[?(\d{1,2}:\d{2}(?::\d{2})?)\]?\s*(.*)$/);
      if (timestampMatch) {
        timestamps.push({
          timestamp: this.parseTimestamp(timestampMatch[1]),
          associatedText: timestampMatch[2],
          position: { start: index, end: index, line: index }
        });
      }
    });

    return timestamps;
  }

  private extractSections(content: string): Section[] {
    const sections: Section[] = [];
    // This is a simplified implementation - would need more sophisticated logic
    const paragraphs = content.split('\n\n');
    
    paragraphs.forEach((paragraph, index) => {
      if (paragraph.length > 50) { // Only include substantial sections
        sections.push({
          title: `Section ${index + 1}`,
          content: paragraph.trim(),
          level: 1,
          position: { start: index, end: index }
        });
      }
    });

    return sections;
  }

  private extractHeaders(content: string): Header[] {
    // Extract various header patterns
    const headers: Header[] = [];
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      // All caps headers
      if (/^[A-Z][A-Z\s]{3,}$/.test(line.trim())) {
        headers.push({
          level: 1,
          text: line.trim(),
          position: { start: index, end: index, line: index }
        });
      }
      // Title case headers
      else if (/^[A-Z][a-z]+(?:\s[A-Z][a-z]+)*:?\s*$/.test(line.trim()) && line.length < 100) {
        headers.push({
          level: 2,
          text: line.trim(),
          position: { start: index, end: index, line: index }
        });
      }
    });

    return headers;
  }

  private extractMarkdownHeaders(content: string): Header[] {
    const headers: Header[] = [];
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      const headerMatch = line.match(/^(#+)\s+(.+)$/);
      if (headerMatch) {
        headers.push({
          level: headerMatch[1].length,
          text: headerMatch[2].trim(),
          position: { start: index, end: index, line: index }
        });
      }
    });

    return headers;
  }

  private extractLists(content: string): List[] {
    const lists: List[] = [];
    const lines = content.split('\n');
    let currentList: { type: 'ordered' | 'unordered', items: string[], startIndex: number } | null = null;

    lines.forEach((line, index) => {
      const unorderedMatch = line.match(/^\s*[-*+]\s+(.+)$/);
      const orderedMatch = line.match(/^\s*\d+\.\s+(.+)$/);

      if (unorderedMatch) {
        if (!currentList || currentList.type !== 'unordered') {
          if (currentList) {
            this.finalizeLis t(lists, currentList, index - 1);
          }
          currentList = { type: 'unordered', items: [], startIndex: index };
        }
        currentList.items.push(unorderedMatch[1]);
      } else if (orderedMatch) {
        if (!currentList || currentList.type !== 'ordered') {
          if (currentList) {
            this.finalizeList(lists, currentList, index - 1);
          }
          currentList = { type: 'ordered', items: [], startIndex: index };
        }
        currentList.items.push(orderedMatch[1]);
      } else if (currentList && line.trim() === '') {
        // Allow empty lines within lists
      } else if (currentList) {
        // Non-list line found, finalize current list
        this.finalizeList(lists, currentList, index - 1);
        currentList = null;
      }
    });

    if (currentList) {
      this.finalizeList(lists, currentList, lines.length - 1);
    }

    return lists;
  }

  private finalizeList(lists: List[], currentList: any, endIndex: number): void {
    lists.push({
      type: currentList.type,
      items: currentList.items,
      position: { start: currentList.startIndex, end: endIndex }
    });
  }

  private extractMarkdownLists(content: string): List[] {
    return this.extractLists(content); // Same logic works for markdown
  }

  private extractCodeBlocks(content: string): CodeBlock[] {
    const codeBlocks: CodeBlock[] = [];
    
    // Match fenced code blocks
    const fencedRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let match;

    while ((match = fencedRegex.exec(content)) !== null) {
      codeBlocks.push({
        language: match[1] || undefined,
        code: match[2].trim(),
        position: { start: match.index, end: match.index + match[0].length }
      });
    }

    // Match indented code blocks
    const lines = content.split('\n');
    let inCodeBlock = false;
    let codeLines: string[] = [];
    let startIndex = -1;

    lines.forEach((line, index) => {
      if (line.match(/^    /) || line.match(/^\t/)) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          startIndex = index;
          codeLines = [];
        }
        codeLines.push(line.replace(/^    |\t/, ''));
      } else if (inCodeBlock) {
        if (line.trim() === '') {
          codeLines.push('');
        } else {
          // End of code block
          if (codeLines.length > 0) {
            codeBlocks.push({
              code: codeLines.join('\n').trim(),
              position: { start: startIndex, end: index - 1 }
            });
          }
          inCodeBlock = false;
        }
      }
    });

    return codeBlocks;
  }

  private extractMarkdownCodeBlocks(content: string): CodeBlock[] {
    return this.extractCodeBlocks(content); // Same logic
  }

  private extractMarkdownSections(content: string): Section[] {
    const sections: Section[] = [];
    const lines = content.split('\n');
    let currentSection: { title: string, content: string[], level: number, startIndex: number } | null = null;

    lines.forEach((line, index) => {
      const headerMatch = line.match(/^(#+)\s+(.+)$/);
      
      if (headerMatch) {
        // Finalize previous section
        if (currentSection) {
          sections.push({
            title: currentSection.title,
            content: currentSection.content.join('\n').trim(),
            level: currentSection.level,
            position: { start: currentSection.startIndex, end: index - 1 }
          });
        }
        
        // Start new section
        currentSection = {
          title: headerMatch[2].trim(),
          content: [],
          level: headerMatch[1].length,
          startIndex: index
        };
      } else if (currentSection && line.trim()) {
        currentSection.content.push(line);
      }
    });

    // Finalize last section
    if (currentSection) {
      sections.push({
        title: currentSection.title,
        content: currentSection.content.join('\n').trim(),
        level: currentSection.level,
        position: { start: currentSection.startIndex, end: lines.length - 1 }
      });
    }

    return sections;
  }

  // Helper methods

  private extractEmailHeaders(content: string): Record<string, string> {
    const headers: Record<string, string> = {};
    const lines = content.split('\n');
    
    for (const line of lines) {
      const match = line.match(/^(From|To|Cc|Bcc|Subject|Date|Reply-To):\s*(.+)$/i);
      if (match) {
        headers[match[1].toLowerCase()] = match[2].trim();
      }
    }
    
    return headers;
  }

  private extractQuotedReplies(content: string): string[] {
    const quotedSections: string[] = [];
    const lines = content.split('\n');
    let currentQuote: string[] = [];
    
    lines.forEach(line => {
      if (line.match(/^>\s*/)) {
        currentQuote.push(line.replace(/^>\s*/, ''));
      } else if (currentQuote.length > 0) {
        quotedSections.push(currentQuote.join('\n').trim());
        currentQuote = [];
      }
    });
    
    if (currentQuote.length > 0) {
      quotedSections.push(currentQuote.join('\n').trim());
    }
    
    return quotedSections;
  }

  private extractEmailParticipants(headers: Record<string, string>, content: string): string[] {
    const participants = new Set<string>();
    
    // Extract from headers
    ['from', 'to', 'cc', 'bcc'].forEach(field => {
      if (headers[field]) {
        const emails = headers[field].match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
        emails.forEach(email => participants.add(email));
      }
    });
    
    return Array.from(participants);
  }

  private convertQuotesToDialogues(quotedSections: string[]): DialogueEntry[] {
    return quotedSections.map((quote, index) => ({
      speaker: 'Previous Message',
      content: quote,
      position: { start: index, end: index }
    }));
  }

  private extractChatMessages(content: string): DialogueEntry[] {
    const dialogues: DialogueEntry[] = [];
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      // Match patterns like "[12:34] <username> message" or "12:34 username: message"
      const chatMatch = line.match(/^(?:\[?\d{1,2}:\d{2}\]?\s*)?(?:<([^>]+)>|([^:]+):\s*)(.+)$/);
      if (chatMatch) {
        dialogues.push({
          speaker: chatMatch[1] || chatMatch[2] || 'Unknown',
          content: chatMatch[3].trim(),
          position: { start: index, end: index, line: index }
        });
      }
    });

    return dialogues;
  }

  private parseTimestamp(timestampStr: string): Date {
    // Simple timestamp parsing - would need more sophisticated logic for various formats
    const now = new Date();
    const match = timestampStr.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
    
    if (match) {
      const hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const seconds = match[3] ? parseInt(match[3], 10) : 0;
      
      const timestamp = new Date(now);
      timestamp.setHours(hours, minutes, seconds, 0);
      
      return timestamp;
    }
    
    return now;
  }

  private getAssociatedText(content: string, position: number, contextLength: number): string {
    const start = Math.max(0, position - contextLength / 2);
    const end = Math.min(content.length, position + contextLength / 2);
    return content.substring(start, end).trim();
  }

  private generateMetadata(originalContent: string, cleanedContent: string, structure: ParsedStructure): NormalizationMetadata {
    const originalLength = originalContent.length;
    const cleanedLength = cleanedContent.length;
    
    return {
      originalLength,
      cleanedLength,
      compressionRatio: originalLength > 0 ? cleanedLength / originalLength : 1,
      detectedLanguage: 'en', // Would implement proper language detection
      encoding: 'utf-8',
      lineCount: originalContent.split('\n').length,
      structureTypes: this.getStructureTypes(structure)
    };
  }

  private getStructureTypes(structure: ParsedStructure): string[] {
    const types: string[] = [];
    
    if (structure.sections.length > 0) types.push('sections');
    if (structure.dialogues.length > 0) types.push('dialogues');
    if (structure.headers.length > 0) types.push('headers');
    if (structure.lists.length > 0) types.push('lists');
    if (structure.codeBlocks.length > 0) types.push('code');
    
    return types;
  }
}