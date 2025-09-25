/**
 * Context Ingestion Engine - Type Definitions
 * 
 * Core types and interfaces for the context ingestion system that handles
 * messy input data and transforms it into structured, analyzable format.
 */

// Core data structures
export interface RawInput {
  id: string;
  content: string;
  sourceType: InputSourceType;
  timestamp: Date;
  metadata: RawInputMetadata;
}

export interface RawInputMetadata {
  source?: string;
  filename?: string;
  author?: string;
  participants?: string[];
  platform?: string;
  originalFormat?: string;
  size?: number;
  encoding?: string;
  [key: string]: any; // Allow additional metadata
}

export enum InputSourceType {
  TRANSCRIPT = 'transcript',
  EMAIL = 'email',
  NOTE = 'note',
  DOCUMENT = 'document',
  CHAT = 'chat',
  MEETING_RECORDING = 'meeting_recording',
  VOICE_MEMO = 'voice_memo',
  UNKNOWN = 'unknown'
}

// Normalized output structure
export interface NormalizedContext {
  id: string;
  originalId: string;
  content: ProcessedContent;
  metadata: EnrichedMetadata;
  contextDepth: ContextDepth;
  gaps: ContextGap[];
  confidence: ConfidenceScore;
  relationships: ContextRelationship[];
  timestamp: Date;
  lastProcessed: Date;
}

export interface ProcessedContent {
  summary: string;
  keyPoints: string[];
  entities: ExtractedEntity[];
  topics: Topic[];
  sentiment: SentimentAnalysis;
  structure: ContentStructure;
  originalContent: string;
}

export interface ExtractedEntity {
  type: EntityType;
  value: string;
  confidence: number;
  context: string;
  position: ContentPosition;
}

export enum EntityType {
  PERSON = 'person',
  ORGANIZATION = 'organization',
  DATE = 'date',
  TIME = 'time',
  LOCATION = 'location',
  EMAIL = 'email',
  PHONE = 'phone',
  URL = 'url',
  MONEY = 'money',
  PRODUCT = 'product',
  CONCEPT = 'concept',
  TECHNICAL_TERM = 'technical_term'
}

export interface Topic {
  name: string;
  relevance: number;
  keywords: string[];
  category: TopicCategory;
}

export enum TopicCategory {
  BUSINESS = 'business',
  TECHNICAL = 'technical',
  PERSONAL = 'personal',
  ADMINISTRATIVE = 'administrative',
  STRATEGIC = 'strategic',
  OPERATIONAL = 'operational',
  FINANCIAL = 'financial',
  LEGAL = 'legal',
  OTHER = 'other'
}

export interface SentimentAnalysis {
  overall: number; // -1 to 1
  confidence: number; // 0 to 1
  emotions: Emotion[];
}

export interface Emotion {
  type: EmotionType;
  intensity: number; // 0 to 1
}

export enum EmotionType {
  JOY = 'joy',
  SADNESS = 'sadness',
  ANGER = 'anger',
  FEAR = 'fear',
  SURPRISE = 'surprise',
  DISGUST = 'disgust',
  ANTICIPATION = 'anticipation',
  TRUST = 'trust'
}

export interface ContentStructure {
  sections: ContentSection[];
  dialogues: Dialogue[];
  actionItems: ActionItem[];
  decisions: Decision[];
  questions: Question[];
}

export interface ContentSection {
  title: string;
  content: string;
  level: number;
  startPosition: ContentPosition;
  endPosition: ContentPosition;
}

export interface Dialogue {
  speaker: string;
  content: string;
  timestamp?: Date;
  position: ContentPosition;
}

export interface ActionItem {
  description: string;
  assignee?: string;
  dueDate?: Date;
  priority: Priority;
  status: ActionStatus;
  position: ContentPosition;
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum ActionStatus {
  IDENTIFIED = 'identified',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface Decision {
  description: string;
  decisionMaker?: string;
  rationale?: string;
  impacts: string[];
  timestamp?: Date;
  position: ContentPosition;
}

export interface Question {
  question: string;
  answer?: string;
  questioner?: string;
  answerer?: string;
  resolved: boolean;
  position: ContentPosition;
}

export interface ContentPosition {
  start: number;
  end: number;
  line?: number;
  column?: number;
}

// Context depth levels
export enum ContextDepth {
  SURFACE = 'surface',     // Basic information extracted
  MEDIUM = 'medium',       // Relationships and patterns identified
  DEEP = 'deep'           // Complex insights and implications
}

export interface ContextDepthMetrics {
  informationDensity: number;
  conceptualComplexity: number;
  relationshipDepth: number;
  implicitKnowledge: number;
  contextualReferences: number;
}

// Context gaps
export interface ContextGap {
  id: string;
  type: GapType;
  description: string;
  severity: GapSeverity;
  suggestions: string[];
  relatedEntities: string[];
  confidence: number;
}

export enum GapType {
  MISSING_CONTEXT = 'missing_context',
  UNCLEAR_REFERENCE = 'unclear_reference',
  INCOMPLETE_INFORMATION = 'incomplete_information',
  CONTRADICTORY_INFO = 'contradictory_info',
  AMBIGUOUS_MEANING = 'ambiguous_meaning',
  TEMPORAL_GAP = 'temporal_gap',
  PARTICIPANT_GAP = 'participant_gap',
  DOMAIN_KNOWLEDGE_GAP = 'domain_knowledge_gap'
}

export enum GapSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Enriched metadata
export interface EnrichedMetadata extends RawInputMetadata {
  processedAt: Date;
  processingVersion: string;
  language: string;
  wordCount: number;
  estimatedReadingTime: number;
  contentType: ContentType;
  qualityScore: QualityMetrics;
  tags: string[];
  categories: string[];
}

export enum ContentType {
  STRUCTURED = 'structured',
  SEMI_STRUCTURED = 'semi_structured',
  UNSTRUCTURED = 'unstructured',
  CONVERSATIONAL = 'conversational',
  TECHNICAL = 'technical',
  NARRATIVE = 'narrative'
}

export interface QualityMetrics {
  completeness: number; // 0 to 1
  clarity: number;       // 0 to 1
  relevance: number;     // 0 to 1
  accuracy: number;      // 0 to 1
  consistency: number;   // 0 to 1
}

// Confidence scoring
export interface ConfidenceScore {
  overall: number;       // 0 to 1
  extraction: number;    // Confidence in entity/info extraction
  classification: number; // Confidence in categorization
  relationships: number; // Confidence in relationship mapping
  gaps: number;         // Confidence in gap detection
}

// Relationships
export interface ContextRelationship {
  id: string;
  sourceId: string;
  targetId: string;
  type: RelationshipType;
  strength: number; // 0 to 1
  direction: RelationshipDirection;
  metadata: RelationshipMetadata;
}

export enum RelationshipType {
  REFERENCES = 'references',
  CONTRADICTS = 'contradicts',
  SUPPORTS = 'supports',
  EXTENDS = 'extends',
  SUMMARIZES = 'summarizes',
  DEPENDS_ON = 'depends_on',
  PART_OF = 'part_of',
  SIMILAR_TO = 'similar_to',
  CAUSED_BY = 'caused_by',
  LEADS_TO = 'leads_to'
}

export enum RelationshipDirection {
  BIDIRECTIONAL = 'bidirectional',
  UNIDIRECTIONAL = 'unidirectional'
}

export interface RelationshipMetadata {
  confidence: number;
  extractedAt: Date;
  evidence: string[];
  context: string;
}

// Processing configuration
export interface ProcessingConfig {
  enableDeepAnalysis: boolean;
  extractEntities: boolean;
  detectSentiment: boolean;
  identifyActionItems: boolean;
  trackRelationships: boolean;
  findGaps: boolean;
  aiModel: AIModelConfig;
  outputFormat: OutputFormat;
  qualityThreshold: number;
}

export interface AIModelConfig {
  provider: AIProvider;
  model: string;
  temperature: number;
  maxTokens: number;
  apiKey?: string;
}

export enum AIProvider {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  GOOGLE = 'google',
  LOCAL = 'local'
}

export enum OutputFormat {
  JSON = 'json',
  MARKDOWN = 'markdown',
  XML = 'xml',
  YAML = 'yaml'
}

// Error handling
export interface ProcessingError {
  id: string;
  type: ErrorType;
  message: string;
  details: any;
  timestamp: Date;
  recoverable: boolean;
}

export enum ErrorType {
  PARSING_ERROR = 'parsing_error',
  AI_SERVICE_ERROR = 'ai_service_error',
  VALIDATION_ERROR = 'validation_error',
  TIMEOUT_ERROR = 'timeout_error',
  QUOTA_EXCEEDED = 'quota_exceeded',
  UNKNOWN_ERROR = 'unknown_error'
}

// Service interfaces
export interface ContextIngestionEngine {
  processInput(input: RawInput, config?: ProcessingConfig): Promise<NormalizedContext>;
  batchProcess(inputs: RawInput[], config?: ProcessingConfig): Promise<NormalizedContext[]>;
  detectInputType(content: string): Promise<InputSourceType>;
  validateOutput(context: NormalizedContext): Promise<boolean>;
  getProcessingStats(): ProcessingStats;
}

export interface ProcessingStats {
  totalProcessed: number;
  successCount: number;
  errorCount: number;
  averageProcessingTime: number;
  qualityDistribution: QualityDistribution;
}

export interface QualityDistribution {
  high: number;    // Count of high-quality outputs
  medium: number;  // Count of medium-quality outputs
  low: number;     // Count of low-quality outputs
}