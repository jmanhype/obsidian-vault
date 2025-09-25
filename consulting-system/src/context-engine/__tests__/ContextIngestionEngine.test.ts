import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { ContextIngestionEngine } from '../ContextIngestionEngine.js';
import { RawInput, InputSourceType, EntityType, ContextDepth } from '../types.js';

describe('ContextIngestionEngine', () => {
    let engine: ContextIngestionEngine;

    beforeEach(() => {
        engine = new ContextIngestionEngine();
    });

    describe('processInput', () => {
        it('should process a simple email input correctly', async () => {
            const input: RawInput = {
                content: 'Subject: Project Update\n\nHi John,\n\nThe Q1 project is on track. We need to meet with Sarah tomorrow at 3 PM to discuss the API integration.\n\nBest regards,\nMike',
                source: 'email-001.txt',
                timestamp: new Date('2024-01-15T10:00:00Z')
            };

            const result = await engine.processInput(input);

            expect(result).toBeDefined();
            expect(result.rawInput).toBe(input);
            expect(result.detectedSourceType).toBe(InputSourceType.EMAIL);
            expect(result.processedContent).toBeDefined();
            expect(result.contextGaps).toBeDefined();
            expect(result.enrichedMetadata).toBeDefined();
            
            // Check entity extraction
            const entities = result.processedContent.entities;
            const personEntities = entities.filter(e => e.type === EntityType.PERSON);
            expect(personEntities.length).toBeGreaterThanOrEqual(2); // John, Sarah, Mike
            
            // Check structure extraction
            expect(result.processedContent.structure.headers.length).toBeGreaterThan(0);
            
            // Check quality score
            expect(result.enrichedMetadata.qualityScore).toBeGreaterThan(0);
            expect(result.enrichedMetadata.qualityScore).toBeLessThanOrEqual(1);
        });

        it('should process meeting transcript with multiple speakers', async () => {
            const input: RawInput = {
                content: `Meeting Transcript - Daily Standup
January 15, 2024

[10:00] John: Good morning everyone. Let's start with yesterday's progress.

[10:01] Sarah: I completed the user authentication module. The JWT implementation is working correctly. I'll move on to the dashboard components today.

[10:02] Mike: I had some issues with the database migration. The foreign key constraints are causing problems. I need to discuss this with the DBA.

[10:03] John: Thanks everyone. Any blockers?

[10:04] Sarah: No blockers from my side.

[10:05] Mike: I'm blocked on the database issue until I talk to the DBA.

[10:06] John: Alright, let's sync up again tomorrow. Meeting adjourned.`,
                source: 'standup-2024-01-15.txt',
                timestamp: new Date('2024-01-15T10:00:00Z')
            };

            const result = await engine.processInput(input);

            expect(result.detectedSourceType).toBe(InputSourceType.TRANSCRIPT);
            
            // Check dialogue extraction
            const dialogues = result.processedContent.structure.dialogues;
            expect(dialogues.length).toBeGreaterThan(5);
            
            // Check person extraction
            const personEntities = result.processedContent.entities.filter(e => e.type === EntityType.PERSON);
            expect(personEntities.length).toBeGreaterThanOrEqual(3); // John, Sarah, Mike
            
            // Check action items
            expect(result.processedContent.actionItems.length).toBeGreaterThan(0);
            
            // Check for blockers in context gaps or content
            const content = result.processedContent.cleanContent.toLowerCase();
            expect(content).toContain('blocked');
        });

        it('should handle technical documentation with code blocks', async () => {
            const input: RawInput = {
                content: `# API Documentation

## Authentication Endpoint

The authentication endpoint accepts POST requests to \`/api/auth/login\`.

### Request Format
\`\`\`json
{
  "username": "user@example.com",
  "password": "securePassword123"
}
\`\`\`

### Response Format
\`\`\`json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expires": "2024-01-16T10:00:00Z",
  "user": {
    "id": 123,
    "email": "user@example.com"
  }
}
\`\`\`

## Implementation Notes

- Uses bcrypt for password hashing
- JWT tokens expire after 24 hours
- Rate limiting: 5 attempts per minute per IP`,
                source: 'api-docs.md',
                timestamp: new Date('2024-01-15T14:30:00Z')
            };

            const result = await engine.processInput(input);

            expect(result.detectedSourceType).toBe(InputSourceType.DOCUMENT);
            
            // Check code block extraction
            const codeBlocks = result.processedContent.structure.codeBlocks;
            expect(codeBlocks.length).toBeGreaterThanOrEqual(2);
            
            // Check technology entities
            const techEntities = result.processedContent.entities.filter(e => e.type === EntityType.TECHNOLOGY);
            expect(techEntities.length).toBeGreaterThan(0);
            
            // Check headers
            const headers = result.processedContent.structure.headers;
            expect(headers.length).toBeGreaterThanOrEqual(2);
            
            // Should have high complexity due to technical content
            expect(result.enrichedMetadata.complexity.overall).not.toBe('low');
        });

        it('should detect context gaps appropriately', async () => {
            const input: RawInput = {
                content: 'He mentioned that the API integration needs to be completed by next week. We should discuss this with them during the meeting.',
                source: 'incomplete-note.txt',
                timestamp: new Date('2024-01-15T16:00:00Z')
            };

            const result = await engine.processInput(input);

            // Should detect unclear references ("He", "them", "the meeting")
            const unclearRefGaps = result.contextGaps.filter(gap => gap.type === 'unclear_references');
            expect(unclearRefGaps.length).toBeGreaterThan(0);
            
            // Should detect missing context (which API, which meeting, when)
            const missingContextGaps = result.contextGaps.filter(gap => gap.type === 'missing_context');
            expect(missingContextGaps.length).toBeGreaterThan(0);
        });

        it('should handle empty or minimal input gracefully', async () => {
            const input: RawInput = {
                content: '',
                source: 'empty.txt',
                timestamp: new Date()
            };

            const result = await engine.processInput(input);

            expect(result).toBeDefined();
            expect(result.processedContent.cleanContent).toBe('');
            expect(result.processedContent.entities).toHaveLength(0);
            expect(result.enrichedMetadata.qualityScore).toBeLessThan(0.5);
        });

        it('should assign appropriate context depth levels', async () => {
            const inputs = [
                {
                    content: 'Meeting at 3 PM',
                    expectedDepth: ContextDepth.SURFACE
                },
                {
                    content: 'The client wants us to implement OAuth 2.0 authentication with PKCE flow for their mobile app. This requires updating our API endpoints to support the authorization code flow.',
                    expectedDepth: ContextDepth.MEDIUM
                },
                {
                    content: `The microservices architecture implementation requires careful consideration of the distributed tracing patterns. We need to implement OpenTelemetry with Jaeger for distributed tracing, use Prometheus for metrics collection, and ensure proper circuit breaker patterns are implemented using Hystrix. The service mesh layer with Istio will handle mTLS communication between services, while the API gateway will implement rate limiting and request routing based on JWT claims and service discovery through Consul.`,
                    expectedDepth: ContextDepth.DEEP
                }
            ];

            for (const testInput of inputs) {
                const input: RawInput = {
                    content: testInput.content,
                    source: 'test.txt',
                    timestamp: new Date()
                };

                const result = await engine.processInput(input);
                expect(result.contextDepth).toBe(testInput.expectedDepth);
            }
        });
    });

    describe('batchProcess', () => {
        it('should process multiple inputs with proper batching', async () => {
            const inputs: RawInput[] = [
                {
                    content: 'First email content',
                    source: 'email1.txt',
                    timestamp: new Date()
                },
                {
                    content: 'Second meeting transcript',
                    source: 'meeting1.txt',
                    timestamp: new Date()
                },
                {
                    content: 'Third document content',
                    source: 'doc1.txt',
                    timestamp: new Date()
                }
            ];

            const results = await engine.batchProcess(inputs, {
                batchSize: 2,
                delayMs: 100
            });

            expect(results.results).toHaveLength(3);
            expect(results.successful).toBe(3);
            expect(results.failed).toBe(0);
            expect(results.totalProcessingTime).toBeGreaterThan(0);
        });

        it('should handle batch processing failures gracefully', async () => {
            // Mock a failure scenario
            const originalProcessInput = engine.processInput;
            let callCount = 0;
            
            engine.processInput = jest.fn().mockImplementation(async (input) => {
                callCount++;
                if (callCount === 2) {
                    throw new Error('Processing failed');
                }
                return originalProcessInput.call(engine, input);
            });

            const inputs: RawInput[] = [
                {
                    content: 'Content 1',
                    source: 'file1.txt',
                    timestamp: new Date()
                },
                {
                    content: 'Content 2',
                    source: 'file2.txt',
                    timestamp: new Date()
                },
                {
                    content: 'Content 3',
                    source: 'file3.txt',
                    timestamp: new Date()
                }
            ];

            const results = await engine.batchProcess(inputs);

            expect(results.results).toHaveLength(3);
            expect(results.successful).toBe(2);
            expect(results.failed).toBe(1);
            expect(results.errors).toHaveLength(1);
        });
    });

    describe('source type detection', () => {
        const testCases = [
            {
                content: 'Subject: Test\nFrom: user@example.com\nTo: recipient@example.com\n\nEmail body',
                expectedType: InputSourceType.EMAIL
            },
            {
                content: '[10:00] John: Hello everyone\n[10:01] Sarah: Good morning',
                expectedType: InputSourceType.TRANSCRIPT
            },
            {
                content: 'John: Hello\nSarah: Hi there\nMike: Good morning everyone',
                expectedType: InputSourceType.CHAT
            },
            {
                content: '# Document Title\n\nThis is a formal document with headers and structured content.',
                expectedType: InputSourceType.DOCUMENT
            },
            {
                content: 'Just some random notes about the project meeting today.',
                expectedType: InputSourceType.NOTES
            }
        ];

        testCases.forEach(({ content, expectedType }, index) => {
            it(`should detect ${expectedType} correctly (case ${index + 1})`, async () => {
                const input: RawInput = {
                    content,
                    source: `test${index}.txt`,
                    timestamp: new Date()
                };

                const result = await engine.processInput(input);
                expect(result.detectedSourceType).toBe(expectedType);
            });
        });
    });

    describe('confidence calculation', () => {
        it('should assign higher confidence to well-structured content', async () => {
            const wellStructuredInput: RawInput = {
                content: `# Project Status Report

## Completed Tasks
- User authentication system
- Database schema design
- API endpoint implementation

## In Progress
- Frontend dashboard development
- Unit test coverage

## Next Steps
- Integration testing
- Performance optimization

**Team:** John Smith (Lead), Sarah Johnson (Frontend), Mike Chen (Backend)
**Timeline:** Q1 2024
**Budget:** $50,000`,
                source: 'structured-report.txt',
                timestamp: new Date()
            };

            const poorlyStructuredInput: RawInput = {
                content: 'yeah so we talked about stuff and things are going ok i guess maybe we should meet again sometime to discuss whatever',
                source: 'poor-notes.txt',
                timestamp: new Date()
            };

            const structuredResult = await engine.processInput(wellStructuredInput);
            const poorResult = await engine.processInput(poorlyStructuredInput);

            expect(structuredResult.confidence).toBeGreaterThan(poorResult.confidence);
            expect(structuredResult.enrichedMetadata.qualityScore).toBeGreaterThan(poorResult.enrichedMetadata.qualityScore);
        });
    });

    describe('error handling', () => {
        it('should handle processing errors gracefully', async () => {
            // Create input that might cause processing issues
            const problematicInput: RawInput = {
                content: null as any, // Intentionally problematic
                source: 'null-content.txt',
                timestamp: new Date()
            };

            await expect(engine.processInput(problematicInput)).rejects.toThrow();
        });

        it('should provide meaningful error messages', async () => {
            const input: RawInput = {
                content: 'Valid content',
                source: '', // Empty source might cause issues
                timestamp: new Date()
            };

            try {
                await engine.processInput(input);
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
                expect((error as Error).message).toContain('source');
            }
        });
    });

    describe('metadata enrichment', () => {
        it('should enrich metadata with language detection', async () => {
            const inputs = [
                {
                    content: 'This is a test document in English with proper grammar.',
                    expectedLanguage: 'en'
                },
                {
                    content: 'Hola, este es un documento de prueba en español.',
                    expectedLanguage: 'es'
                },
                {
                    content: 'Bonjour, ceci est un document de test en français.',
                    expectedLanguage: 'fr'
                }
            ];

            for (const testCase of inputs) {
                const input: RawInput = {
                    content: testCase.content,
                    source: 'language-test.txt',
                    timestamp: new Date()
                };

                const result = await engine.processInput(input);
                expect(result.enrichedMetadata.language).toBe(testCase.expectedLanguage);
            }
        });

        it('should generate appropriate tags and categories', async () => {
            const technicalInput: RawInput = {
                content: `API Development Update

We've completed the REST API endpoints for user management. The authentication system uses JWT tokens with bcrypt for password hashing. 

Next steps:
- Implement rate limiting
- Add API documentation
- Deploy to staging environment

Technologies used: Node.js, Express, MongoDB, JWT`,
                source: 'technical-update.txt',
                timestamp: new Date()
            };

            const result = await engine.processInput(technicalInput);
            
            expect(result.enrichedMetadata.tags).toContain('technical');
            expect(result.enrichedMetadata.tags).toContain('action-items');
            expect(result.enrichedMetadata.categories).toContain('technical');
            expect(result.enrichedMetadata.domain).toBe('software');
        });
    });
});