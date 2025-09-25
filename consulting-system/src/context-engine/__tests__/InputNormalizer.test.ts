import { describe, it, expect } from '@jest/globals';
import { InputNormalizer } from '../InputNormalizer.js';
import { InputSourceType } from '../types.js';

describe('InputNormalizer', () => {
    let normalizer: InputNormalizer;

    beforeEach(() => {
        normalizer = new InputNormalizer();
    });

    describe('normalize', () => {
        it('should normalize email content correctly', async () => {
            const emailContent = `Subject: Project Meeting Tomorrow
From: john.smith@company.com
To: team@company.com
Date: Mon, 15 Jan 2024 10:30:00 +0000
Reply-To: john.smith@company.com

Hi Team,

We have a project meeting scheduled for tomorrow at 2 PM in Conference Room A.

Agenda:
1. Sprint review
2. Budget discussion  
3. Next milestone planning

Please bring your status reports.

Best regards,
John Smith
Project Manager
Company Inc.
Phone: +1-555-0123`;

            const result = await normalizer.normalize(emailContent, InputSourceType.EMAIL);

            expect(result.cleanContent).not.toContain('Subject:');
            expect(result.cleanContent).not.toContain('From:');
            expect(result.cleanContent).not.toContain('Reply-To:');
            expect(result.cleanContent).toContain('project meeting');
            expect(result.cleanContent).toContain('Conference Room A');
            
            expect(result.structure.sections).toHaveLength(2); // Main content + signature
            expect(result.structure.lists).toHaveLength(1); // Agenda
            expect(result.structure.lists[0].items).toHaveLength(3);
            
            expect(result.participants).toContain('John Smith');
        });

        it('should normalize meeting transcript with timestamps', async () => {
            const transcriptContent = `Meeting Transcript - Q1 Planning Session
Date: January 15, 2024
Duration: 45 minutes
Participants: John Smith, Sarah Johnson, Mike Chen

[14:00:00] John: Good afternoon everyone. Let's start with our Q1 planning session.

[14:00:15] Sarah: Thanks John. I've prepared the frontend roadmap for Q1.

[14:01:30] Mike: I have concerns about the backend API timeline. We might need more resources.

[14:02:45] John: Mike, can you elaborate on the specific challenges?

[14:03:20] Mike: The authentication service integration is more complex than we initially estimated. It might take an additional 2 weeks.

[14:04:00] Sarah: That would impact the frontend milestone. We need to adjust our timeline accordingly.

[14:05:15] John: Alright, let's document these concerns and create a revised timeline. Any other blockers?

[14:06:30] [Background noise - someone joining the call]

[14:07:00] Sarah: No other blockers from the frontend side.

[14:07:30] Mike: Just the authentication service issue I mentioned.

[14:08:00] John: Perfect. Let's wrap up and schedule a follow-up meeting for next week.`;

            const result = await normalizer.normalize(transcriptContent, InputSourceType.TRANSCRIPT);

            expect(result.cleanContent).not.toContain('[Background noise');
            expect(result.cleanContent).toContain('Good afternoon everyone');
            
            expect(result.structure.dialogues).toHaveLength(9); // Excluding background noise
            expect(result.structure.dialogues[0]).toMatchObject({
                speaker: 'John',
                content: expect.stringContaining('Good afternoon'),
                timestamp: expect.any(Date)
            });
            
            expect(result.participants).toContain('John Smith');
            expect(result.participants).toContain('Sarah Johnson');
            expect(result.participants).toContain('Mike Chen');
            
            expect(result.timestamps).toHaveLength(9);
        });

        it('should normalize chat messages correctly', async () => {
            const chatContent = `Sarah Johnson - Today at 9:15 AM
Hey team, quick question about the API endpoints

Mike Chen - Today at 9:16 AM
What's up?

Sarah Johnson - Today at 9:17 AM
The user authentication endpoint is returning a 500 error
Can someone take a look?

John Smith - Today at 9:18 AM
@Sarah Johnson I'll check it out
Looks like a database connection issue

Mike Chen - Today at 9:19 AM
@John Smith thanks! 
Let me know if you need help with the DB

Sarah Johnson - Today at 9:20 AM
Thanks guys! 👍`;

            const result = await normalizer.normalize(chatContent, InputSourceType.CHAT);

            expect(result.structure.dialogues).toHaveLength(6);
            expect(result.structure.dialogues[0].speaker).toBe('Sarah Johnson');
            expect(result.structure.dialogues[0].content).toContain('quick question');
            
            expect(result.participants).toContain('Sarah Johnson');
            expect(result.participants).toContain('Mike Chen');
            expect(result.participants).toContain('John Smith');
            
            // Should remove emoji and timestamps
            expect(result.cleanContent).not.toContain('👍');
            expect(result.cleanContent).not.toContain('Today at');
        });

        it('should normalize document content with headers and code', async () => {
            const documentContent = `# API Documentation

## Overview
This document describes the REST API endpoints for the user management system.

### Authentication
All endpoints require a valid JWT token in the Authorization header:

\`\`\`http
Authorization: Bearer <your-jwt-token>
\`\`\`

## Endpoints

### GET /api/users
Returns a list of all users.

**Response:**
\`\`\`json
{
  "users": [
    {
      "id": 1,
      "username": "john.doe",
      "email": "john@example.com",
      "created_at": "2024-01-15T10:00:00Z"
    }
  ],
  "total": 1
}
\`\`\`

### POST /api/users
Creates a new user account.

**Request Body:**
\`\`\`json
{
  "username": "jane.doe",
  "email": "jane@example.com",
  "password": "securePassword123"
}
\`\`\`

## Rate Limits
- 100 requests per minute per IP address
- 1000 requests per hour per authenticated user

---
*Last updated: January 15, 2024*`;

            const result = await normalizer.normalize(documentContent, InputSourceType.DOCUMENT);

            expect(result.structure.headers).toHaveLength(5); // #, ##, ###, ### (2nd), ##
            expect(result.structure.headers[0]).toMatchObject({
                level: 1,
                text: 'API Documentation'
            });
            
            expect(result.structure.codeBlocks).toHaveLength(3);
            expect(result.structure.codeBlocks[0].language).toBe('http');
            expect(result.structure.codeBlocks[1].language).toBe('json');
            
            expect(result.structure.sections).toHaveLength(4); // Based on ## headers
            
            expect(result.cleanContent).toContain('REST API endpoints');
            expect(result.cleanContent).toContain('JWT token');
        });

        it('should handle notes with mixed formatting', async () => {
            const notesContent = `Project Meeting Notes - 1/15/24

Attendees: John, Sarah, Mike

TOPICS DISCUSSED:
• Q1 roadmap review
• Resource allocation  
• Budget constraints

Key Points:
- Need additional frontend developer
- Backend APIs on track
- Database migration scheduled for Feb 1st

TODO:
□ Update project timeline
□ Schedule interviews for frontend role
□ Prepare migration scripts
□ Send budget proposal to management

Next Meeting: January 22, 2024 @ 2:00 PM

---
Additional notes:
Sarah mentioned concerns about the mobile app timeline
Mike suggested using GraphQL for better API performance`;

            const result = await normalizer.normalize(notesContent, InputSourceType.NOTES);

            expect(result.structure.lists).toHaveLength(2); // Bullet points and TODO
            expect(result.structure.lists[0].type).toBe('bullet');
            expect(result.structure.lists[1].type).toBe('todo');
            
            expect(result.structure.sections).toHaveLength(3); // Main topics, TODO, Additional
            
            expect(result.participants).toContain('John');
            expect(result.participants).toContain('Sarah');
            expect(result.participants).toContain('Mike');
            
            expect(result.timestamps).toHaveLength(2); // Meeting date and next meeting
        });

        it('should extract timestamps correctly from various formats', async () => {
            const contentWithDates = `Meeting scheduled for January 15, 2024 at 2:00 PM
Deadline: 2024-01-22
Follow-up call on 15/01/2024
Event time: 14:30 GMT
Next review: Jan 22, 2024`;

            const result = await normalizer.normalize(contentWithDates, InputSourceType.NOTES);

            expect(result.timestamps).toHaveLength(5);
            expect(result.timestamps[0]).toBeInstanceOf(Date);
        });

        it('should handle voice memo transcription format', async () => {
            const voiceMemoContent = `Voice Memo Transcription
Recorded: January 15, 2024, 3:45 PM
Duration: 2:15

Um, so I wanted to record some thoughts about the project. The client meeting went well yesterday, and they're happy with our progress. However, there are a few concerns I want to document.

First, the timeline is tight. We originally estimated 8 weeks for the full implementation, but they want it done in 6 weeks. That's going to require some scope adjustments.

Second, they mentioned wanting additional features that weren't in the original spec. The reporting dashboard needs to include real-time analytics, which will add complexity to the backend.

I should probably schedule a follow-up call with the team to discuss these changes. Maybe we can find some compromises on the scope.

Oh, and remind me to update the project proposal with the new requirements before sending it to the client.

[Recording ends]`;

            const result = await normalizer.normalize(voiceMemoContent, InputSourceType.VOICE_MEMO);

            // Should clean up filler words and transcription artifacts
            expect(result.cleanContent).not.toContain('Um,');
            expect(result.cleanContent).not.toContain('[Recording ends]');
            expect(result.cleanContent).toContain('client meeting went well');
            
            expect(result.timestamps).toHaveLength(1); // Recording date
            expect(result.structure.sections).toHaveLength(1); // Main content
        });
    });

    describe('extractParticipants', () => {
        it('should extract participants from various mention formats', async () => {
            const content = `Meeting with John Smith, Sarah Johnson, and Mike Chen.
@jane.doe will join remotely.
Contact person: Robert Brown <robert@company.com>
CC: mary.williams@company.com`;

            const result = await normalizer.normalize(content, InputSourceType.EMAIL);

            expect(result.participants).toContain('John Smith');
            expect(result.participants).toContain('Sarah Johnson');
            expect(result.participants).toContain('Mike Chen');
            expect(result.participants).toContain('jane.doe');
            expect(result.participants).toContain('Robert Brown');
            expect(result.participants).toContain('mary.williams');
        });
    });

    describe('extractTimestamps', () => {
        it('should extract various timestamp formats', async () => {
            const content = `Event on 2024-01-15 at 14:30
Meeting: January 15, 2024
Deadline is 15/01/2024
Call scheduled for Jan 15, 2024 2:30 PM
Next review: 01/15/24`;

            const result = await normalizer.normalize(content, InputSourceType.NOTES);

            expect(result.timestamps).toHaveLength(5);
            result.timestamps.forEach(timestamp => {
                expect(timestamp).toBeInstanceOf(Date);
            });
        });
    });

    describe('error handling', () => {
        it('should handle empty content gracefully', async () => {
            const result = await normalizer.normalize('', InputSourceType.NOTES);

            expect(result.cleanContent).toBe('');
            expect(result.structure.sections).toHaveLength(0);
            expect(result.participants).toHaveLength(0);
            expect(result.timestamps).toHaveLength(0);
        });

        it('should handle malformed content without crashing', async () => {
            const malformedContent = `
            [[[invalid timestamp]]]
            @@@@@invalid mention
            ````no closing backticks
            # # ## invalid headers
            `;

            expect(async () => {
                await normalizer.normalize(malformedContent, InputSourceType.NOTES);
            }).not.toThrow();
        });
    });
});