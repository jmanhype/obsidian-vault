# Decision Gate: {{targetLevel}} Transition

---
gate_id: {{id}}
project_id: {{projectId}}
target_level: {{targetLevel}}
status: {{status}}
created_date: {{created}}
decision_deadline: {{deadline}}
approvers:
  - {{approvers}}
tags:
  - decision-gate
  - {{targetLevel}}
  - {{projectId}}
---

## Decision Gate Summary

**Project:** [[{{projectId}}]]
**Transition:** {{currentLevel}} → **{{targetLevel}}**
**Status:** {{status}}
**Created:** {{created}}

## Requirements Validation

### Overall Status: {{validation.overallStatus}}

#### L1 Security Requirements
{{#each validation.requirements.security.details}}
- [{{#if passed}}x{{else}} {{/if}}] {{this}}
{{/each}}

**Security Status:** {{validation.requirements.security.status}}
{{#if validation.requirements.security.blockers}}
**Blockers:**
{{#each validation.requirements.security.blockers}}
- {{this}}
{{/each}}
{{/if}}

#### L2 Reliability Requirements
{{#each validation.requirements.reliability.details}}
- [{{#if passed}}x{{else}} {{/if}}] {{this}}
{{/each}}

**Reliability Status:** {{validation.requirements.reliability.status}}
{{#if validation.requirements.reliability.blockers}}
**Blockers:**
{{#each validation.requirements.reliability.blockers}}
- {{this}}
{{/each}}
{{/if}}

#### L3 Scalability Requirements
{{#each validation.requirements.scalability.details}}
- [{{#if passed}}x{{else}} {{/if}}] {{this}}
{{/each}}

**Scalability Status:** {{validation.requirements.scalability.status}}
{{#if validation.requirements.scalability.blockers}}
**Blockers:**
{{#each validation.requirements.scalability.blockers}}
- {{this}}
{{/each}}
{{/if}}

## Payment Gate Information

**Payment Percentage:** {{paymentGate.percentage}}%
**Milestone:** {{paymentGate.milestone}}

### Payment Requirements
{{#each paymentGate.requirements}}
- [{{#if completed}}x{{else}} {{/if}}] {{this}}
{{/each}}

## AI Recommendations

### Identified Patterns
{{#each recommendations.patterns}}
- **{{category}}:** {{description}}
{{/each}}

### Risk Assessment
{{#each recommendations.risks}}
- **{{severity}}:** {{description}}
  - *Likelihood:* {{likelihood}}
  - *Impact:* {{impact}}
  - *Mitigation:* {{mitigation}}
{{/each}}

### Recommended Actions
{{#each recommendations.actions}}
1. **{{priority}}:** {{action}}
   - *Rationale:* {{rationale}}
   - *Effort:* {{effort}}
{{/each}}

## Decision Framework

### Evaluation Criteria

#### Technical Readiness
- [ ] All L1/L2/L3 requirements satisfied
- [ ] Security review completed
- [ ] Performance benchmarks met
- [ ] Monitoring and alerting configured

#### Business Readiness  
- [ ] Stakeholder sign-off obtained
- [ ] Business value demonstrated
- [ ] Risk assessment approved
- [ ] Budget allocation confirmed

#### Operational Readiness
- [ ] Deployment procedures documented
- [ ] Support processes defined
- [ ] Training completed
- [ ] Rollback plan prepared

### Stakeholder Input

#### Technical Review
**Reviewer:** {{technicalReviewer}}
**Status:** Pending
**Comments:** 

#### Business Review
**Reviewer:** {{businessReviewer}}
**Status:** Pending
**Comments:**

#### Client Review
**Reviewer:** {{clientReviewer}}
**Status:** Pending
**Comments:**

## Historical Context

### Similar Decisions
{{#each historicalDecisions}}
- **{{project}}:** {{decision}} ({{outcome}})
  - *Duration:* {{duration}}
  - *Lessons:* {{lessons}}
{{/each}}

### Pattern Analysis
Based on historical data:
- **Average Decision Time:** {{patterns.averageDecisionTime}}
- **Success Rate for {{targetLevel}}:** {{patterns.successRate}}
- **Common Failure Reasons:** {{patterns.commonFailures}}

## Decision Record

### Approval Status
- [ ] **Technical Approval** - {{technicalReviewer}}
- [ ] **Business Approval** - {{businessReviewer}}  
- [ ] **Client Approval** - {{clientReviewer}}
- [ ] **Final Sign-off** - {{finalApprover}}

### Decision
**Status:** [PENDING/APPROVED/REJECTED]
**Date:** 
**Approver:** 
**Conditions:**

### Rationale


### Conditions (if any)
1. 
2. 
3. 

### Next Steps
1. 
2. 
3. 

## Evidence & Documentation

### Required Documentation
{{#each requiredDocs}}
- [{{#if provided}}x{{else}} {{/if}}] {{doc}} {{#if provided}}([[{{link}}]]){{/if}}
{{/each}}

### Test Results
- **Security Scan:** [[Security Scan Results]]
- **Performance Test:** [[Performance Test Results]]
- **Integration Test:** [[Integration Test Results]]

### Deployment Artifacts
- **Deployment Guide:** [[Deployment Guide]]
- **Rollback Plan:** [[Rollback Plan]]
- **Monitoring Setup:** [[Monitoring Configuration]]

## Communication Plan

### Stakeholder Notification
{{#each stakeholders}}
- **{{role}}:** {{name}} - {{contactMethod}}
{{/each}}

### Announcement Schedule
- **Internal Team:** {{internalAnnouncement}}
- **Client Communication:** {{clientAnnouncement}}
- **Go-Live Communication:** {{goLiveAnnouncement}}

---

## Decision Log

| Date | Action | Approver | Notes |
|------|--------|----------|-------|
| {{created}} | Gate Created | System | Initial validation complete |
|      |        |          |       |
|      |        |          |       |

---

*Decision Gate created: {{created}}*
*Project: [[{{projectId}}]]*
*System: Consulting Delivery System*