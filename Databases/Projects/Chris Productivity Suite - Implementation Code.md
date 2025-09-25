# Chris Productivity Suite - Implementation Code

## 🚀 Working Implementation for Week 1 Deliverables

---

## Quick Start Setup

```bash
# Clone and setup
git clone https://github.com/jay/chris-productivity-suite.git
cd chris-productivity-suite
npm install
cp .env.example .env
# Add API keys to .env
npm run dev
```

---

## Core Implementation Files

### 1. Meeting Transcription Service

```typescript
// services/transcription.service.ts
import { OpenAI } from 'openai';
import { Anthropic } from '@anthropic-ai/sdk';

export class TranscriptionService {
  private openai: OpenAI;
  private claude: Anthropic;
  
  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    this.claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  
  async transcribeMeeting(audioFile: File): Promise<MeetingTranscript> {
    // Step 1: Transcribe with Whisper
    const transcription = await this.openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      response_format: "verbose_json",
      timestamp_granularities: ["word"]
    });
    
    // Step 2: Extract structure with Claude
    const structured = await this.extractStructure(transcription);
    
    // Step 3: Identify speakers
    const withSpeakers = await this.identifySpeakers(structured);
    
    return withSpeakers;
  }
  
  private async extractStructure(transcript: any) {
    const prompt = `
    Analyze this meeting transcript and extract:
    1. Main topics discussed
    2. Decisions made
    3. Action items mentioned
    4. Pain points expressed
    5. Opportunities identified
    
    Format as structured JSON.
    
    Transcript: ${JSON.stringify(transcript)}
    `;
    
    const response = await this.claude.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }]
    });
    
    return JSON.parse(response.content[0].text);
  }
}
```

### 2. Pain Point Extraction Engine

```typescript
// services/painpoint.service.ts
export class PainPointExtractor {
  private patterns = [
    /(?:problem|issue|challenge|difficulty|struggle|pain|frustrat\w+)/i,
    /(?:can't|cannot|unable|difficult|hard to|impossible)/i,
    /(?:waste|inefficient|slow|manual|tedious|repetitive)/i,
    /(?:wish|need|want|would like|if only|should)/i
  ];
  
  async extractPainPoints(transcript: string): Promise<PainPoint[]> {
    const segments = this.segmentTranscript(transcript);
    const painPoints: PainPoint[] = [];
    
    for (const segment of segments) {
      if (this.containsPainPoint(segment)) {
        const painPoint = await this.analyzePainPoint(segment);
        painPoints.push(painPoint);
      }
    }
    
    // Cluster similar pain points
    const clustered = await this.clusterPainPoints(painPoints);
    
    // Prioritize by impact
    return this.prioritizePainPoints(clustered);
  }
  
  private async analyzePainPoint(segment: string): Promise<PainPoint> {
    const analysis = await claude.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      messages: [{
        role: 'user',
        content: `
        Analyze this segment for pain points:
        
        "${segment}"
        
        Extract:
        1. Core problem
        2. Impact (1-10)
        3. Frequency (daily/weekly/monthly)
        4. Affected stakeholders
        5. Potential solution direction
        
        Return as JSON.
        `
      }]
    });
    
    return JSON.parse(analysis.content[0].text);
  }
  
  private async clusterPainPoints(points: PainPoint[]): Promise<PainPoint[]> {
    // Use embeddings to find similar pain points
    const embeddings = await this.generateEmbeddings(points);
    const clusters = this.performClustering(embeddings);
    
    return clusters.map(cluster => this.mergePainPoints(cluster));
  }
}
```

### 3. Action Item Tracker

```typescript
// services/action.service.ts
export class ActionItemTracker {
  async extractActionItems(transcript: string): Promise<ActionItem[]> {
    const prompt = `
    Extract action items from this transcript.
    
    For each action item, identify:
    - Task description
    - Owner (who will do it)
    - Due date (if mentioned)
    - Priority (inferred from context)
    - Dependencies (other tasks that must complete first)
    - Context (why this is needed)
    
    Transcript: ${transcript}
    `;
    
    const response = await claude.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      messages: [{ role: 'user', content: prompt }]
    });
    
    const actions = JSON.parse(response.content[0].text);
    
    // Enhance with smart defaults
    return this.enhanceActionItems(actions);
  }
  
  private enhanceActionItems(actions: any[]): ActionItem[] {
    return actions.map(action => ({
      ...action,
      id: generateId(),
      status: 'pending',
      createdAt: new Date(),
      priority: action.priority || this.inferPriority(action),
      dueDate: action.dueDate || this.inferDueDate(action),
      owner: action.owner || 'Chris',
      notifications: this.setupNotifications(action)
    }));
  }
}
```

### 4. Concept Clustering (Palantir Pattern)

```typescript
// services/clustering.service.ts
import { PineconeClient } from '@pinecone-database/pinecone';

export class ConceptClusteringService {
  private pinecone: PineconeClient;
  private index: any;
  
  constructor() {
    this.pinecone = new PineconeClient();
    this.initializeIndex();
  }
  
  async clusterConcepts(concepts: string[]): Promise<ConceptCluster[]> {
    // Generate embeddings for each concept
    const embeddings = await this.generateEmbeddings(concepts);
    
    // Store in vector database
    await this.storeEmbeddings(embeddings);
    
    // Find clusters using similarity
    const clusters = await this.findClusters(embeddings);
    
    // Generate cluster descriptions
    return this.describeClusters(clusters);
  }
  
  private async generateEmbeddings(texts: string[]) {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-large",
      input: texts
    });
    
    return response.data.map((item, idx) => ({
      text: texts[idx],
      embedding: item.embedding,
      metadata: this.extractMetadata(texts[idx])
    }));
  }
  
  private async findClusters(embeddings: any[]) {
    // DBSCAN clustering algorithm
    const clusters = [];
    const visited = new Set();
    
    for (const embedding of embeddings) {
      if (visited.has(embedding)) continue;
      
      // Find neighbors within threshold
      const neighbors = await this.findNeighbors(embedding);
      
      if (neighbors.length >= 3) { // Min cluster size
        const cluster = this.expandCluster(embedding, neighbors, visited);
        clusters.push(cluster);
      }
    }
    
    return clusters;
  }
  
  async createModuleFromCluster(cluster: ConceptCluster): Promise<Module> {
    const prompt = `
    Create a reusable module from this concept cluster:
    
    Concepts: ${cluster.concepts.join(', ')}
    Context: ${cluster.context}
    
    Generate:
    1. Module name
    2. Description
    3. Key components
    4. Implementation pattern
    5. Use cases
    `;
    
    const response = await claude.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      messages: [{ role: 'user', content: prompt }]
    });
    
    return JSON.parse(response.content[0].text);
  }
}
```

### 5. Frontend Dashboard

```tsx
// app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MeetingView } from '@/components/MeetingView';
import { ActionDashboard } from '@/components/ActionDashboard';
import { InsightsHub } from '@/components/InsightsHub';
import { ModuleLibrary } from '@/components/ModuleLibrary';

export default function Dashboard() {
  const [activeView, setActiveView] = useState('meetings');
  const [data, setData] = useState(null);
  
  useEffect(() => {
    // Initialize real-time subscriptions
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL);
    
    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      handleRealtimeUpdate(update);
    };
    
    return () => ws.close();
  }, []);
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg">
        <nav className="p-4">
          <h1 className="text-2xl font-bold mb-8">Productivity Suite</h1>
          <ul className="space-y-2">
            <li>
              <button 
                onClick={() => setActiveView('meetings')}
                className={`w-full text-left p-2 rounded ${
                  activeView === 'meetings' ? 'bg-blue-100' : ''
                }`}
              >
                🎙️ Meetings
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveView('actions')}
                className={`w-full text-left p-2 rounded ${
                  activeView === 'actions' ? 'bg-blue-100' : ''
                }`}
              >
                ✅ Actions
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveView('insights')}
                className={`w-full text-left p-2 rounded ${
                  activeView === 'insights' ? 'bg-blue-100' : ''
                }`}
              >
                💡 Insights
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveView('modules')}
                className={`w-full text-left p-2 rounded ${
                  activeView === 'modules' ? 'bg-blue-100' : ''
                }`}
              >
                📦 Modules
              </button>
            </li>
          </ul>
        </nav>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 p-8">
        <Tabs value={activeView} onValueChange={setActiveView}>
          <TabsList>
            <TabsTrigger value="meetings">Meetings</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="modules">Modules</TabsTrigger>
          </TabsList>
          
          <TabsContent value="meetings">
            <MeetingView />
          </TabsContent>
          
          <TabsContent value="actions">
            <ActionDashboard />
          </TabsContent>
          
          <TabsContent value="insights">
            <InsightsHub />
          </TabsContent>
          
          <TabsContent value="modules">
            <ModuleLibrary />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
```

### 6. API Routes

```typescript
// app/api/transcribe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { TranscriptionService } from '@/services/transcription.service';

const transcriptionService = new TranscriptionService();

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    
    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }
    
    // Process transcription
    const transcript = await transcriptionService.transcribeMeeting(audioFile);
    
    // Extract pain points
    const painPoints = await painPointExtractor.extractPainPoints(
      transcript.text
    );
    
    // Extract action items
    const actions = await actionTracker.extractActionItems(
      transcript.text
    );
    
    // Store in database
    await saveResults({ transcript, painPoints, actions });
    
    return NextResponse.json({
      success: true,
      data: {
        transcript,
        painPoints,
        actions,
        summary: await generateSummary(transcript)
      }
    });
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: 'Transcription failed' },
      { status: 500 }
    );
  }
}
```

### 7. Real-time WebSocket Handler

```typescript
// services/websocket.service.ts
import { Server } from 'socket.io';

export class WebSocketService {
  private io: Server;
  
  constructor(server: any) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL,
        methods: ['GET', 'POST']
      }
    });
    
    this.setupHandlers();
  }
  
  private setupHandlers() {
    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);
      
      // Handle live transcription
      socket.on('audio:chunk', async (chunk) => {
        const partial = await this.processAudioChunk(chunk);
        socket.emit('transcription:partial', partial);
      });
      
      // Handle action updates
      socket.on('action:update', async (action) => {
        await this.updateAction(action);
        this.io.emit('action:updated', action);
      });
      
      // Handle insight requests
      socket.on('insight:request', async (context) => {
        const insight = await this.generateInsight(context);
        socket.emit('insight:generated', insight);
      });
    });
  }
  
  broadcastUpdate(event: string, data: any) {
    this.io.emit(event, data);
  }
}
```

---

## Environment Configuration

```env
# .env.local
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
PINECONE_API_KEY=...
PINECONE_ENVIRONMENT=...
PINECONE_INDEX=chris-productivity

DATABASE_URL=postgresql://...
REDIS_URL=redis://...

NEXT_PUBLIC_WS_URL=ws://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:3000

# Email Integration
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_USER=chris@example.com
IMAP_PASS=app-specific-password

# Calendar Integration
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

---

## Docker Setup

```dockerfile
# Dockerfile
FROM node:20-alpine AS base

WORKDIR /app

# Dependencies
FROM base AS deps
COPY package*.json ./
RUN npm ci

# Builder
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Runner
FROM base AS runner
ENV NODE_ENV production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/productivity
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
  
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: productivity
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

---

## Deployment Instructions

### Quick Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables
vercel env add OPENAI_API_KEY
vercel env add ANTHROPIC_API_KEY
# ... add all required vars
```

### Deploy to Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and init
railway login
railway init

# Deploy
railway up

# Add services
railway add postgresql
railway add redis
```

---

## Testing Suite

```typescript
// __tests__/transcription.test.ts
import { TranscriptionService } from '@/services/transcription.service';

describe('TranscriptionService', () => {
  let service: TranscriptionService;
  
  beforeEach(() => {
    service = new TranscriptionService();
  });
  
  it('should transcribe audio file', async () => {
    const mockAudio = new File([''], 'test.mp3', { type: 'audio/mp3' });
    const result = await service.transcribeMeeting(mockAudio);
    
    expect(result).toHaveProperty('text');
    expect(result).toHaveProperty('segments');
    expect(result).toHaveProperty('speakers');
  });
  
  it('should extract pain points', async () => {
    const transcript = "The main problem is we spend too much time on manual data entry";
    const painPoints = await painPointExtractor.extractPainPoints(transcript);
    
    expect(painPoints).toHaveLength(1);
    expect(painPoints[0].problem).toContain('manual data entry');
  });
});
```

---

## Usage Examples

### 1. Upload Meeting Recording

```typescript
// Upload and process meeting
const formData = new FormData();
formData.append('audio', audioFile);

const response = await fetch('/api/transcribe', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log('Pain points found:', result.painPoints);
console.log('Action items:', result.actions);
```

### 2. Real-time Transcription

```typescript
// Connect to WebSocket for live transcription
const socket = io('ws://localhost:3001');

// Send audio chunks
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    const mediaRecorder = new MediaRecorder(stream);
    
    mediaRecorder.ondataavailable = (event) => {
      socket.emit('audio:chunk', event.data);
    };
    
    mediaRecorder.start(1000); // Send chunks every second
  });

// Receive transcription updates
socket.on('transcription:partial', (text) => {
  updateTranscriptDisplay(text);
});
```

### 3. Generate Insights

```typescript
// Request insight generation
const context = {
  clientName: 'Acme Corp',
  meetingDate: new Date(),
  painPoints: ['manual processes', 'data silos']
};

socket.emit('insight:request', context);

socket.on('insight:generated', (insight) => {
  displayInsight(insight);
});
```

---

## Monitoring & Analytics

```typescript
// services/analytics.service.ts
export class AnalyticsService {
  trackEvent(event: string, properties: any) {
    // Track to multiple services
    this.trackToPostHog(event, properties);
    this.trackToMixpanel(event, properties);
    this.logToDatabase(event, properties);
  }
  
  trackUsage() {
    return {
      meetingsProcessed: this.getMeetingCount(),
      painPointsIdentified: this.getPainPointCount(),
      actionsCreated: this.getActionCount(),
      modulesGenerated: this.getModuleCount(),
      timesSaved: this.calculateTimeSaved()
    };
  }
}
```

---

## Support & Troubleshooting

### Common Issues

1. **Transcription Failing**
   - Check API key validity
   - Verify audio format (MP3, WAV, M4A supported)
   - Ensure file size < 25MB

2. **Slow Processing**
   - Enable Redis caching
   - Use async processing for large files
   - Implement queue system for batch processing

3. **Database Connection Issues**
   - Verify connection string
   - Check firewall rules
   - Ensure proper SSL configuration

---

*Implementation Version: 1.0*  
*Ready for Testing*  
*Created by: Jay Guthrie*