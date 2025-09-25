# LLM Agent Transparency - System Prompt Documentation Debate

## Overview
A significant discussion initiated by Simon Willison (@simonw) on September 25, 2025, regarding the practice of hiding system prompts and tool descriptions from LLM agent users, arguing that this transparency is actually valuable documentation for sophisticated users.

## Core Argument

### Main Thesis
"If you hide the system prompt and tool descriptions for your LLM agent, what you're actually doing is taking the single most detailed set of documentation for your service and deliberately hiding it from your most sophisticated users!"
— Simon Willison

### Key Points
1. **Documentation Value**: System prompts and tool lists represent the most comprehensive documentation of an agent's capabilities
2. **User Sophistication**: Power users actively seek and benefit from understanding agent internals
3. **Security Theatre**: Attempts to hide prompts are ineffective against determined users
4. **Trust Building**: Transparency demonstrates confidence in product design

## Case Study: Cursor Agent

### Tool Discovery
- A user discovered Cursor's complete tool list
- This revealed the full extent of what the Cursor agent can do
- Willison highlighted this as "wildly useful" information for understanding capabilities

### Implication
Hidden capabilities reduce user effectiveness and adoption

## Community Perspectives

### Supporting Arguments

**Developer Behavior** (Karim C @BrandGrowthOS):
- "I've seen developers dig into agent prompts more than any docs I write. They want to understand the reasoning, not just the API."

**Product Confidence** (Andrea D'Ambrosio @andrebuilds):
- "I actually appreciate the transparency when companies expose their system prompts. Shows confidence in their product design."

**Aviation Analogy** (Ali Sherief @Zenul_Abidin):
- "Hiding the system prompt is like giving pilots a plane but covering half the cockpit dials because 'passengers don't need to see them'"

**Open Source Parallel** (Andres Rosa @TheAndresRosa):
- "Highly parallel to the open source debate. Open source generally won."

### Counter-Arguments

**Business Concerns** (Oscar Le @oscarle_x):
1. Avoiding attacks/abuse
2. Protecting trade secrets from competitors
3. Reason why SaaS doesn't allow bring-your-own-key

**Willison's Response**:
- These protections are ineffective
- Determined attackers will extract prompts anyway
- Security through obscurity doesn't work

## Technical Implications

### For Agent Developers
- Consider system prompts as public-facing documentation
- Design prompts with transparency in mind
- Use prompt quality as a competitive advantage, not secrecy

### For Agent Users
- Sophisticated users will extract prompts regardless
- Transparency improves:
  - User trust
  - Effective usage
  - Debugging capabilities
  - Integration planning

## Related Projects

### INDUBITABLY (@indubitably_ai)
- Openly shares tools and MCPs in their repository
- Full open-source approach
- Demonstrates transparency-first philosophy

### AGENTS.md Initiative (Ben Aiad @benaiad)
- Proposal for unified agent documentation standard
- Allows server-side optimizations while maintaining transparency
- Balance between openness and competitive advantage

## Industry Trends

### Adoption vs Trust Gap
As noted by @saksham_adh:
- Tool adoption is skyrocketing
- Trust remains low due to opacity
- Black box nature limits user confidence

### Documentation Standards
- Movement toward standardized agent documentation
- Pressure for transparency in AI systems
- User demand for understanding agent capabilities

## Best Practices Emerging

1. **Expose System Prompts**: Make them readily available to users
2. **Document Tool Capabilities**: Provide comprehensive tool lists
3. **Version Control Prompts**: Track changes transparently
4. **Share Reasoning**: Explain design decisions in prompts
5. **Enable Inspection**: Don't block users from viewing internals

## Security Considerations

### False Security
- Hiding prompts provides no real security
- Determined users will extract them
- Better to design assuming prompts are public

### Real Security
- Focus on backend protections
- Implement proper authentication/authorization
- Protect sensitive data at the API level, not prompt level

## Future Implications

### Industry Direction
- Trend toward greater transparency
- Standardization of agent documentation
- Competitive advantage through quality, not secrecy

### User Expectations
- Increasing demand for transparency
- Sophisticated users as primary early adopters
- Documentation as key adoption factor

## References
- [Original Twitter/X Thread](https://twitter.com/simonw/status/...) - September 25, 2025
- Related: [[Cursor Agent]], [[LLM System Prompts]], [[Agent Documentation Standards]]

## Tags
#llm #agents #transparency #documentation #system-prompts #ai-ethics #developer-experience #open-source #security #2025-discussion