# The Three Gulfs Framework - Complete Implementation Guide

## Overview

The Three Gulfs framework, developed by **Hamel Husain** and **Shreya Shankar**, provides a systematic approach for diagnosing and solving the major challenges in building LLM (Large Language Model) applications. This model was introduced in their highly-regarded **AI Evals course**, which has drawn over a thousand practitioners from hundreds of organizations.

## The Three Critical Gulfs

### 1. Gulf of Comprehension (Developer ↔ Data)
The gap between developers and the reality of the data. It reflects the struggle to truly understand what your system is doing at scale – both the inputs it sees and the outputs it produces.

**Key Insight**: "You cannot vibe-check your way to understanding what's going on" - because you simply can't manually review thousands of interactions. Invisible failure modes and unexpected inputs hide in this gulf.

**Solution**: Deep systematic data analysis - live in your data until no new failure patterns emerge.

### 2. Gulf of Specification (Developer ↔ LLM Pipeline)
The gap in translating human intent into precise instructions for the model. Getting one good output is easy; getting consistent high-quality output is extraordinarily hard.

**Key Insight**: LLMs don't inherently know what we mean by "clear," "helpful," or "fast" – every aspect must be explicitly defined. Vague prompts yield vague outputs.

**Solution**: Formal, strict, and testable prompts and instructions.

### 3. Gulf of Generalization (Data ↔ LLM Pipeline)
The gap between a perfect prompt and consistent performance on all data. Even with a crystal-clear prompt, the model can fail to apply it across diverse or unseen inputs.

**Key Insight**: Inherent model limitations (context length, factual knowledge, reasoning ability) mean that without architectural safeguards, the system will be brittle outside its narrow happy path.

**Solution**: Architectural changes like retrieval, multi-step decomposition, or fallback logic.

## Real-World Example: Apartment Leasing AI Assistant

An apartment leasing AI assistant that looked flawless in demo revealed critical failures only through systematic data review:

- **Comprehension Gulf**: Team lacked visibility into real interactions - critical failures in scheduling tours and handling dates went completely unnoticed during casual testing
- **Specification Gulf**: Vague instructions like "schedule viewings for interested clients" - what counts as "interested"? how many viewings? which time slots?
- **Generalization Gulf**: System extracted "Elon Musk" as property owner just because his name appeared in an email about Tesla chargers

## Why These Gulfs Matter

Each gulf pinpoints a different class of failures and dictates a different remedy:

- **Comprehension failures** → Better observability and data analysis
- **Specification failures** → Clearer prompts, formal schemas, explicit rules
- **Generalization failures** → Architectural changes (retrieval, structured workflows, fallbacks)

> You can't patch these gulfs with brute force; you have to design your system to cross them by construction.

---

## Part 1: Gulf of Comprehension - Achieve Systematic Data Understanding

### Warning Signs of the Comprehension Gulf

1. **Spot-checking instead of systematic review**
   - Relying on cherry-picked examples or happy-path demos
   - Missing systemic issues that only appear in aggregate

2. **Surprise failures from customers**
   - Only discovering critical bugs through complaints
   - Lack of observability for proactive detection

3. **Ad-hoc error analysis**
   - Investigating problems one by one without structure
   - No taxonomy or consistent approach
   - Every bug is a fire-drill

4. **Overconfidence from trivial tests**
   - Assuming success from a few obvious cases
   - Ignoring the hundreds of different questions real users pose

### Real-World Examples

**NurtureBoss Apartment Rental AI**:
- Appeared to handle scheduling fine in basic tests
- Reality: Failed to process date/time requests 66% of the time
- After categorization and fixes: Success jumped from 33% to 95%

**Recipe Bot**:
- Looked great for simple dietary requests
- Systematic analysis revealed consistent breakdown on compound restrictions (e.g., "vegan and gluten-free")

**Customer Support Chatbot**:
- Passed all scripted QA tests
- Production reality: Gave incorrect information ~40% of the time on technical questions

### Implementation Playbook: Bridging the Comprehension Gulf

#### 1. Establish Data Visibility Infrastructure

**Requirements**:
- Comprehensive logging of each interaction
  - User input
  - All intermediate LLM steps (chain-of-thought, tool usage)
  - Final output
- Custom data viewer for traces
  - Display full context (conversation history, metadata)
  - Allow quick tagging/notation of errors
  - One-click buttons for marking correct/incorrect
  - Capture freeform notes

> "The single most impactful AI investment" - Hamel Husain

**Impact**: Teams with thoughtfully designed data viewers iterate 10× faster

#### 2. Adopt a Systematic Sampling Strategy

**Approach**:
- Review at least 30-50 recent examples (more for complex systems)
- Continue until theoretical saturation (no new failure patterns)
- Use stratified sampling:
  - Different user segments (new vs power users)
  - Input variations (short vs long prompts)
  - Time periods (weekdays vs weekends)
  - All major features represented
- Weight sampling toward fresh data (last day/week)

**Goal**: Approximate reviewing everything by inspecting a well-chosen subset

#### 3. Develop an Error Taxonomy via Open Coding

**Process**:
1. **Open-ended coding**: Write detailed notes about what went wrong and why
2. **Axial coding**: Organize notes into themes
3. **Create categories** (5-10 high-level with sub-categories):
   - Factual errors
   - Missing information
   - Formatting issues
   - Tone/style problems
   - Logic errors
   - Hallucinated content
   - Safety/policy violations

**Documentation**: Each category needs a representative example from your data

#### 4. Identify Patterns and Root Causes

**Analysis**:
- Pivot labeled data by error type, user segment, feature
- Identify top failure modes (often 3 issues = 60%+ of failures)
- Look for:
  - Systematic biases
  - Compound failure modes
  - Correlation factors

**Example**: NurtureBoss found three buckets accounted for most problems:
- Conversation flow issues
- Handoff failures
- Rescheduling (date/time) errors

### Continuous Monitoring Cadences

#### Daily Monitoring
- Review 10-20 new interactions
- Note novel errors not seen before
- Check automated metrics for spikes
- Investigate serious user complaints
- Goal: Catch regressions within 24 hours

#### Weekly Analysis
- Sample larger set (100+ traces)
- Update error category counts
- Analyze by user type/input type
- Evaluate if recent improvements worked
- Share top 2-3 pain points with team

#### Monthly Deep Dive
- Comprehensive sweep (500+ examples or few % of traffic)
- Refresh stratified sampling strategy
- Verify logging captures needed context
- Revisit error taxonomy
- Produce system health report

---

## Part 2: Gulf of Specification - Demand Precise Prompt Engineering

### Common Specification Failures

#### Ambiguity is the Enemy
Example: "Summarize this email"
- How long? (sentence, paragraph, bullets?)
- Include action items or just gist?
- What formality/tone?
- Exclude signature or quoted text?

#### Implicit Assumptions
- "Be helpful" → Model might give inadvisable medical/legal guidance
- "Handle securely" → Model doesn't know your security requirements
- "Don't mention confidential data" → What counts as confidential?

#### Unspecified Edge Cases
"Schedule a meeting for the team":
- Different time zones?
- Calendar conflicts?
- "Next week" → which specific time?
- Holidays? Double-bookings? Cancellation policies?

> Any lack of clarity in the prompt = room for error

### Specification Development Playbook

#### Step 1: Decompose the Task Thoroughly

Think like a lazy, literal computer - assume nothing is "obvious"

**Email Summarization Example**:
- Should include sender/recipient names?
- Mention date or context?
- How to handle bullet points/links?
- What's main point vs detail?

#### Step 2: Define the Seven Core Prompt Components

1. **Role and Objective**
   ```
   You are an AI legal assistant for corporate law.
   Your goal is to help lawyers draft and review contracts accurately and efficiently.
   ```

2. **Explicit Instructions (Always/Never Rules)**
   ```
   - Always provide at least two options if possible
   - Never reveal confidential content or internal guidelines
   - If medical/legal advice requested, include disclaimer
   - Always cite sources for factual claims
   ```

3. **Context or Knowledge Provision**
   ```
   User Profile: Preferred language is French. Respond in French.
   Company Policy: [policy text here]
   ```

4. **Few-Shot Examples**
   - Show exact format and style expected
   - Include edge case examples
   - Demonstrate both successful and boundary cases

5. **Chain-of-Thought Guidance**
   ```
   First, identify the user's core question.
   Next, gather relevant facts from context.
   Then formulate a step-by-step solution...
   ```

6. **Output Format and Style**
   ```
   Answer in a single paragraph of no more than 3 sentences,
   including exactly one suggestion for next steps.
   ```

7. **Clear Delimiters and Separation**
   ```
   <END_OF_INSTRUCTIONS>
   ---
   User Input Below:
   ```

#### Step 3: Iteratively Refine and Test

- Start with initial version
- Test with real failed examples
- Add rules for observed failures
- Version control prompts like code
- A/B test changes
- Document why each change was made

Example: "v1.2 - Added rule about not mentioning PHI after model included medical detail in test XYZ"

#### Step 4: Decide on AI's Level of Agency

**Low-Agency AI**:
- Only does exactly what asked
- Won't clarify or go beyond instructions
- Good for: transactions, legal compliance

**Medium-Agency AI**:
- Asks clarifying questions
- Makes small suggestions
- Example: "To clarify, do you want X or Y?"

**High-Agency AI**:
- More autonomy to interpret intent
- Provides proactive help
- Example: "There's a cheaper flight a day earlier - would you consider that?"

### Specification Quality Checklist

- [ ] **Clear objective** - Explicitly states primary goal
- [ ] **Boundaries defined** - "Always do" and "Never do" rules
- [ ] **Format and examples** - Exact output format with examples
- [ ] **Edge cases addressed** - Instructions or examples for each
- [ ] **Tone and style guidelines** - Voice and style specified
- [ ] **Citations/external info** - How to cite sources
- [ ] **Fallback strategy** - How to respond when unable to fulfill
- [ ] **Escalation criteria** - When to hand off to human

### Stress Tests Before Deployment

1. **Ambiguous inputs** - Deliberately vague queries
2. **Edge cases** - Boundary condition inputs
3. **Adversarial inputs** - Attempts to break rules
4. **Multi-step tasks** - Full workflow simulation
5. **Contradictory instructions** - User vs system conflicts
6. **Missing info** - Incomplete context

---

## Part 3: Gulf of Generalization - Engineer for Robustness

### Generalization Failure Patterns

#### Context Window Overflow
- Model truncates or ignores parts of long documents
- Important details get lost
- Example: Chatbot handles short questions but misses key sections in 5-page documents

#### Variability Across Input Types
- Excel on training-like data, fail on different styles
- Formal queries work, slang/typos fail
- Technical documentation vs casual dialog

#### Capability Gaps
Tasks models inherently struggle with:
- Complex mathematical reasoning
- Tracking numerous facts consistently
- Understanding images (text-only models)
- Optimizing complex SQL queries

### Architectural Solutions

#### 1. Retrieval-Augmented Generation (RAG)

**Purpose**: Provide external knowledge when model doesn't know or can't fit info

**Implementation**:
- Hook LLM to external knowledge source
- Retrieve relevant pieces at query time
- Include in prompt with source labels
- Intelligent document chunking

**Impact**: Greatly reduces hallucinations, increases accuracy

#### 2. Task Decomposition (Multi-Step Workflows)

**Example**: AI Research Paper Summary
```
Step 1: Extract key points from each section
Step 2: Analyze and prioritize points
Step 3: Generate coherent summary
Step 4: Review for missing pieces
```

**Benefits**:
- Each step has narrower scope
- Insert checks between steps
- Isolate failure points

#### 3. Fine-Tuning or Custom Models

**When to Use**:
- Hit ceiling of prompting capabilities
- Need domain-specific knowledge
- Consistent format/rule following needed

**Example**: Harvey Legal AI
- General benchmarks useless for legal tasks
- Created BigLawBench with real legal scenarios
- Fine-tuned models significantly outperformed generic LLMs

#### 4. Ensemble and Fallback Strategies

**Approaches**:
- **Fallback**: Route to stronger model if uncertain
- **Majority voting**: Multiple runs, consensus answer
- **Cross-checking**: Verify rationale supports answer
- **Confidence estimation**: Low confidence → escalate

**Example**: Discord's Clyde Chatbot (200M+ users)
- One model for conversation
- Another for moderation compliance
- Ensemble ensures on-brand, safe behavior

### Measuring Generalization and Robustness

#### Performance Variance
- Track success rate by input category
- Measure accuracy: short vs long, by topic, by reading level
- Aim to reduce variance between best/worst cases

#### Out-of-Distribution Testing
- Test on inputs outside typical distribution
- Check if system recognizes its limits
- Good: "I'm not equipped to answer"
- Bad: Confident hallucination

#### Capability Benchmarks
- Identify edge-of-ability tasks
- Regularly test improvements
- Track previously impossible tasks becoming possible

#### Robustness Under Stress
- Extremely long conversations
- Rapid-fire requests
- Intentionally noisy input
- Verify instructions hold

#### Resource and Latency Impact
- Track computational cost of solutions
- Balance complexity vs performance
- Sometimes simpler prompt with 5% more failures acceptable if complex solution doubles cost

---

## The Analyze-Measure-Improve Lifecycle

### Analyze: Turn Observations into Insights

1. **Data inspection and annotation**
   - 30-50+ representative examples
   - Domain expert review
   - Open-ended notes

2. **Open coding to taxonomy**
   - Cluster notes into error categories
   - Multiple perspectives (PM + engineer)
   - Specific, meaningful labels

3. **Quantify occurrence**
   - Label examples with categories
   - Create Pareto chart
   - Find that handful of issues = bulk of errors

4. **Root cause hypotheses**
   - Specification issue?
   - Generalization issue?
   - Data issue?

5. **Document findings**
   - List failure modes with examples
   - Frequency/impact estimation
   - Likely root causes

### Measure: Build Quantitative Evaluations

#### LLM-as-Judge Evaluations

**Key Principle**: Build separate judge for each specific failure mode

**Best Practices**:
- Binary pass/fail decisions (not scales)
- Very targeted criteria
- Include examples in judge prompt
- Validate against human judgments

**Success Story**: Honeycomb achieved 90% agreement between LLM judge and human experts after 3 prompt iterations

#### Code-Based Assertions

Use for:
- Valid JSON checks
- Format compliance
- Profanity detection
- SQL syntax validation

> "If you can catch an error with code, do it" - Hamel Husain

### Improve: Target Highest ROI Fixes

**Priority Order**:
1. Glaring specification issues (small prompt changes)
2. Missing context additions
3. Highest frequency failure categories

**Scientific Mindset**:
- Change one variable at a time
- Observe effect on metrics
- Avoid premature optimization

**Example**: Coursera AI Grading
- Initial: Bland, unhelpful feedback
- Fix: Refined prompt with pedagogy expert input
- Result: 16.7% increase in course completions
- 90% learner satisfaction

---

## Real-World Case Studies

### Anaconda - Code Assistant
- **Initial**: 0% success on complex bug fixes
- **Comprehension**: Analyzed transcripts, found API usage issues
- **Specification**: Added explicit examples for each API method → 63% success
- **Generalization**: Implemented RAG for documentation → 100% success

### Discord - Clyde Chatbot
- **Challenge**: Millions of users, zero tolerance for unsafe outputs
- **Comprehension**: Log analysis showed tone inconsistency
- **Specification**: Expanded prompt with persona consistency rules
- **Generalization**: Multi-model ensemble for safety checks
- **Result**: Consistent, safe behavior across diverse conversations

### Harvey - Legal AI Platform
- **Problem**: Generic benchmarks meaningless for legal work
- **Solution**: Created BigLawBench with real lawyer tasks
- **Fine-tuning**: Trained on legal documents and Q&A
- **Result**: Outperforms general models on complex legal tasks
- **Key Learning**: "MMLU scores had zero correlation with real legal performance"

### Coursera - AI Peer Review Grading
- **Problem**: Students not engaging with AI feedback
- **Analysis**: Feedback too generic, not encouraging
- **Fix**: Explicit instructions for specific, supportive feedback
- **Architecture**: Decomposition for long essays
- **Impact**: 16.7% more students complete next assignment within a day

---

## Common Pitfalls and Anti-Patterns

### 1. The "Vibe Check" or Demo Trap
- Testing with handful of prompts
- False sense of security
- **Fix**: Insist on systematic evaluation

### 2. Chasing Generic Metrics
- BLEU, ROUGE scores meaningless for your use case
- "GPT-4 gave 8/10" too vague
- **Fix**: Custom metrics aligned to specific tasks

### 3. Too Many Cooks in the Kitchen
- Everyone adds instructions without coordination
- Convoluted, contradictory prompts
- **Fix**: Designate 1-2 prompt owners

### 4. Premature Complexity
- Complex agents before simple prompts tried
- Fine-tuning before few-shot examples
- **Fix**: Match solution complexity to problem evidence

### 5. Trying to Eliminate All Failure
- Aiming for 100% can be a trap
- Diminishing returns
- **Fix**: Accept small % with good fallbacks

---

## Metrics for Success

### Comprehension Metrics
- **Coverage of data reviewed**: % of interactions examined regularly
- **Failure mode inventory**: Number of distinct failure modes tracked
- **Time to discovery**: How quickly new errors noticed
- **Diagnostic depth**: Understanding of root causes
- **Team engagement**: Number of team members using data viewer

### Specification Metrics
- **Prompt change frequency**: Should stabilize over time
- **Regression rate**: Previously passing cases that fail after changes
- **Output consistency**: Variance in output properties
- **Edge case handling**: % of edge scenarios passing
- **Clarity audit**: Can fresh engineer interpret prompt correctly?

### Generalization Metrics
- **Success rate by segment**: Performance across different categories
- **Fallback rate**: How often fallbacks trigger
- **Error distribution stability**: New error types appearing?
- **Stress test performance**: Pass rates on tricky inputs
- **Adaptability**: How quickly system handles new patterns

### Business Impact Metrics
- **Task success rate**: Users completing tasks with AI help
- **User satisfaction**: Explicit and implicit feedback
- **Efficiency gains**: Time/cost saved
- **Incident reduction**: Severe incidents prevented
- **Feature velocity**: Faster iteration with trusted evals

---

## Tools and Templates

### Error Analysis Template

For each analyzed interaction:
```
ID/Timestamp: [conversation ID and time]
User Input: [exact query]
Context: [relevant context]
Expected Outcome: [what should have happened]
Actual Outcome: [what happened]
Error Category: [from taxonomy]
Severity: [Low/Medium/High]
Notes/Analysis: [hypotheses about why]
Suggested Fix: [optional ideas]
```

### LLM-as-Judge Prompt Template

```
1. Role Definition:
   "You are a strict [domain] evaluator"

2. Criteria Description:
   "Decide if the AI's answer correctly [specific criterion].
   PASS means [exact definition]
   FAIL means [exact definition]"

3. Few-Shot Examples:
   Example 1: [scenario] → Judge: "FAIL because..."
   Example 2: [scenario] → Judge: "PASS because..."

4. Output Format:
   "Respond with PASS or FAIL and brief explanation"
```

### Synthetic Data Generation Framework

Vary along three axes:
1. **Feature coverage**: Test each function with edge cases
2. **Scenario coverage**: End-to-end sequences
3. **Persona coverage**: Different user types/tones

---

## Implementation Timeline

### Week 1-2: Foundation
- Set up logging infrastructure
- Build basic data viewer
- Start daily monitoring

### Week 3-4: Analysis
- Develop error taxonomy
- Analyze first 100-200 examples
- Identify top 3 failure modes

### Week 5-6: Measurement
- Build first LLM judges
- Implement code-based checks
- Establish baseline metrics

### Week 7-8: First Improvements
- Fix top specification issues
- Add missing context
- Measure impact

### Ongoing: Continuous Loop
- Daily monitoring
- Weekly analysis
- Monthly deep dives
- Quarterly architecture reviews

---

## Key Principles for Success

### Make Evaluation a Habit
- Weekly eval meetings
- Part of sprint planning
- Definition of done includes eval

### Involve the Whole Team
- Domain experts
- Product managers
- QA testers
- Customer support

### Stay Humble and Curious
- Users will always find new ways to break things
- Each failure is an opportunity
- Ask "How did our eval miss this?"

### Balance Innovation with Reliability
- Evaluate new models through this lens
- Data-driven decisions over hype
- Quality ensures long-term speed

### Allocate Resources Wisely
- 60%+ effort on evals for mature products
- Prevents disasters and rework
- Share wins to justify investment

### Core Wisdom

> "If you are not willing to look at some data manually on a regular cadence, you are wasting your time with evals... Furthermore, you are wasting your time more generally." - Hamel Husain

Never lose touch with the reality of your system's behavior. No metric or tool is a substitute for actually seeing and understanding how your AI interacts with the world.

---

## Conclusion

By rigorously bridging:
- **Gulf of Comprehension** → Work with full information
- **Gulf of Specification** → Turn fuzzy intentions into precise directives
- **Gulf of Generalization** → Protect from the unexpected

This triad forms the backbone of resilient AI engineering.

With this framework guiding an analyze-measure-improve loop, your LLM system not only gets better with time – it stays better. You'll have the confidence to update it, the insight to fix it when it breaks, and the wisdom to know when it's ready for the next challenge.

In the rapidly evolving landscape of AI products, that discipline and knowledge is a true competitive advantage.

---

*Framework developed by Hamel Husain and Shreya Shankar*
*Based on learnings from their AI Evals course with 1000+ practitioners*