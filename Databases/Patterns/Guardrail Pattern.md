# Guardrail Pattern

**Pattern Type**: AI Safety Pattern  
**Domain**: Runtime Safety & Monitoring  
**Category**: Dynamic Safety Enforcement  
**Related**: [[Constitutional AI Pattern]], [[Behavioral Vaccination Pattern]]

## Definition

The Guardrail Pattern implements runtime safety checks and constraints that actively monitor and intervene in AI agent behavior to prevent harmful or undesired outputs, even when constitutional training may have failed.

## Core Concept

```python
def with_guardrails(agent_function):
    def guarded_execution(*args, **kwargs):
        # Pre-execution checks
        if not pre_execution_guardrails.validate(args, kwargs):
            return SafetyViolationResponse()
        
        # Execute with monitoring
        result = monitored_execution(agent_function, *args, **kwargs)
        
        # Post-execution validation
        if not post_execution_guardrails.validate(result):
            return filtered_result(result)
        
        return result
    
    return guarded_execution
```

## Implementation Layers

### 1. **Input Guardrails**
Validate incoming requests before processing:

```python
class InputGuardrails:
    def __init__(self):
        self.content_filters = [
            ProfanityFilter(),
            PrivacyFilter(),
            ViolenceFilter(),
            IllegalActivityFilter()
        ]
        self.rate_limiters = {
            'per_user': RateLimiter(100, 3600),  # 100 requests/hour
            'per_session': RateLimiter(10, 60)   # 10 requests/minute
        }
    
    def validate_input(self, user_input, user_context):
        # Content filtering
        for filter_obj in self.content_filters:
            if filter_obj.is_violation(user_input):
                return ValidationResult(
                    passed=False,
                    reason=f"Content filter violation: {filter_obj.name}",
                    action="block_request"
                )
        
        # Rate limiting
        if not self.rate_limiters['per_user'].allow(user_context.user_id):
            return ValidationResult(
                passed=False,
                reason="Rate limit exceeded",
                action="throttle_request"
            )
        
        return ValidationResult(passed=True)
```

### 2. **Processing Guardrails**
Monitor agent behavior during execution:

```python
class ProcessingGuardrails:
    def __init__(self):
        self.monitors = [
            TokenUsageMonitor(max_tokens=4000),
            LoopDetectionMonitor(max_iterations=10),
            TimeoutMonitor(max_duration=30),  # seconds
            MemoryUsageMonitor(max_memory=512)  # MB
        ]
    
    def monitor_execution(self, agent_fn, *args, **kwargs):
        execution_context = ExecutionContext()
        
        try:
            with ExecutionMonitor(self.monitors, execution_context):
                result = agent_fn(*args, **kwargs)
            
            return MonitoredResult(result, execution_context)
            
        except GuardrailViolation as e:
            return SafetyInterruption(
                reason=e.reason,
                context=execution_context,
                recovery_action=e.suggested_action
            )
```

### 3. **Output Guardrails**
Filter and validate agent outputs:

```python
class OutputGuardrails:
    def __init__(self):
        self.output_filters = [
            PIIRedactionFilter(),
            HallucinationDetector(),
            BiasDetector(),
            ToxicityFilter(),
            FactualityChecker()
        ]
    
    def validate_output(self, agent_output, original_input):
        filtered_output = agent_output
        modifications = []
        
        for filter_obj in self.output_filters:
            filter_result = filter_obj.process(filtered_output, original_input)
            
            if filter_result.modified:
                filtered_output = filter_result.output
                modifications.append(filter_result.modification_type)
        
        return OutputValidationResult(
            output=filtered_output,
            original=agent_output,
            modifications=modifications,
            safety_score=self.calculate_safety_score(filtered_output)
        )
```

## Guardrail Types

### 1. **Content-Based Guardrails**
```python
class ContentGuardrails:
    def __init__(self):
        self.patterns = {
            'pii_patterns': [
                r'\b\d{3}-\d{2}-\d{4}\b',  # SSN
                r'\b\d{16}\b',             # Credit card
                r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'  # Email
            ],
            'harmful_patterns': [
                r'(?i)how to (make|create|build).*(bomb|explosive|weapon)',
                r'(?i)(murder|kill|harm).*(instructions|guide|how)',
            ]
        }
    
    def scan_content(self, text):
        violations = []
        
        for category, patterns in self.patterns.items():
            for pattern in patterns:
                matches = re.findall(pattern, text)
                if matches:
                    violations.append({
                        'category': category,
                        'pattern': pattern,
                        'matches': matches
                    })
        
        return violations
```

### 2. **Behavioral Guardrails**
```python
class BehaviorGuardrails:
    def __init__(self):
        self.behavioral_limits = {
            'max_tool_calls_per_request': 10,
            'max_recursive_depth': 3,
            'forbidden_tool_combinations': [
                ['file_delete', 'web_scrape'],  # Risky combination
                ['email_send', 'data_export']   # Privacy concern
            ]
        }
    
    def validate_behavior(self, planned_actions):
        for action_sequence in planned_actions:
            # Check tool call limits
            if len(action_sequence.tool_calls) > self.behavioral_limits['max_tool_calls_per_request']:
                return BehaviorViolation("Too many tool calls planned")
            
            # Check forbidden combinations
            tool_names = [call.tool_name for call in action_sequence.tool_calls]
            for forbidden_combo in self.behavioral_limits['forbidden_tool_combinations']:
                if all(tool in tool_names for tool in forbidden_combo):
                    return BehaviorViolation(f"Forbidden tool combination: {forbidden_combo}")
        
        return BehaviorValidationResult(passed=True)
```

### 3. **Context-Aware Guardrails**
```python
class ContextAwareGuardrails:
    def __init__(self):
        self.context_rules = {
            'medical_context': {
                'forbidden_phrases': [
                    'I diagnose you with',
                    'You definitely have',
                    'Stop taking your medication'
                ],
                'required_disclaimers': [
                    'This is not medical advice',
                    'Consult a healthcare professional'
                ]
            },
            'financial_context': {
                'forbidden_phrases': [
                    'guaranteed returns',
                    'risk-free investment',
                    'insider information'
                ],
                'required_disclaimers': [
                    'Investments carry risk',
                    'Past performance does not guarantee future results'
                ]
            }
        }
    
    def validate_in_context(self, output, context_type):
        if context_type not in self.context_rules:
            return ContextValidationResult(passed=True)
        
        rules = self.context_rules[context_type]
        
        # Check forbidden phrases
        for phrase in rules['forbidden_phrases']:
            if phrase.lower() in output.lower():
                return ContextValidationResult(
                    passed=False,
                    violation=f"Forbidden phrase in {context_type}: {phrase}"
                )
        
        # Check required disclaimers
        for disclaimer in rules['required_disclaimers']:
            if disclaimer.lower() not in output.lower():
                # Auto-add disclaimer
                output += f"\n\n**Disclaimer:** {disclaimer}"
        
        return ContextValidationResult(passed=True, modified_output=output)
```

## Dynamic Guardrails

### 1. **Adaptive Safety Thresholds**
```python
class AdaptiveGuardrails:
    def __init__(self):
        self.safety_history = []
        self.base_threshold = 0.8
        self.adaptation_rate = 0.1
    
    def get_dynamic_threshold(self, context):
        recent_violations = self.count_recent_violations(context.user_id)
        
        if recent_violations > 5:
            # Stricter threshold for problematic users
            return min(0.95, self.base_threshold + 0.15)
        elif recent_violations == 0:
            # More lenient for trusted users
            return max(0.6, self.base_threshold - 0.1)
        
        return self.base_threshold
    
    def update_threshold(self, violation_occurred, context):
        if violation_occurred:
            self.base_threshold += self.adaptation_rate * 0.1
        else:
            self.base_threshold -= self.adaptation_rate * 0.01
        
        # Clamp to reasonable bounds
        self.base_threshold = max(0.5, min(0.95, self.base_threshold))
```

### 2. **Learning Guardrails**
```python
class LearningGuardrails:
    def __init__(self):
        self.violation_classifier = ViolationClassifier()
        self.false_positive_tracker = FalsePositiveTracker()
    
    def learn_from_feedback(self, output, human_feedback):
        """Update guardrails based on human feedback"""
        if human_feedback.marked_as_safe and self.flagged_as_unsafe(output):
            # False positive - relax this type of check
            self.false_positive_tracker.record_false_positive(
                output, self.get_triggered_guardrails(output)
            )
            self.adjust_guardrails_sensitivity(output, decrease=True)
        
        elif human_feedback.marked_as_unsafe and not self.flagged_as_unsafe(output):
            # False negative - strengthen guardrails
            self.violation_classifier.add_negative_example(output)
            self.adjust_guardrails_sensitivity(output, increase=True)
    
    def adjust_guardrails_sensitivity(self, example, increase=True):
        triggered_guardrails = self.get_triggered_guardrails(example)
        
        for guardrail in triggered_guardrails:
            if increase:
                guardrail.increase_sensitivity(0.1)
            else:
                guardrail.decrease_sensitivity(0.05)
```

## Recovery Mechanisms

### 1. **Graceful Degradation**
```python
class GracefulDegradation:
    def handle_guardrail_violation(self, violation, original_request):
        recovery_strategies = {
            'content_filter_violation': self.content_recovery,
            'rate_limit_violation': self.rate_limit_recovery,
            'resource_limit_violation': self.resource_recovery,
            'behavioral_violation': self.behavioral_recovery
        }
        
        strategy = recovery_strategies.get(violation.type, self.default_recovery)
        return strategy(violation, original_request)
    
    def content_recovery(self, violation, request):
        # Try to fulfill request with safety modifications
        modified_request = self.sanitize_request(request, violation)
        safe_response = self.generate_safe_response(modified_request)
        
        return RecoveryResult(
            success=True,
            response=safe_response,
            modifications=['content_sanitized'],
            explanation="Response modified to ensure safety"
        )
    
    def rate_limit_recovery(self, violation, request):
        # Queue request for later processing
        estimated_wait = self.queue_request(request)
        
        return RecoveryResult(
            success=False,
            response=f"Request queued. Estimated wait: {estimated_wait} minutes",
            retry_after=estimated_wait * 60
        )
```

### 2. **Human Escalation**
```python
class HumanEscalation:
    def __init__(self):
        self.escalation_queue = Queue()
        self.human_reviewers = HumanReviewerPool()
    
    def escalate_to_human(self, violation, context):
        escalation_request = EscalationRequest(
            violation=violation,
            context=context,
            priority=self.calculate_priority(violation),
            timestamp=datetime.utcnow()
        )
        
        self.escalation_queue.put(escalation_request)
        
        return EscalationResult(
            escalated=True,
            ticket_id=escalation_request.id,
            estimated_review_time=self.estimate_review_time()
        )
    
    def process_human_feedback(self, ticket_id, human_decision):
        """Process human reviewer decision and update guardrails"""
        escalation = self.get_escalation(ticket_id)
        
        if human_decision.approved and escalation.violation.type == 'false_positive':
            # Update guardrails to prevent similar false positives
            self.update_guardrail_exceptions(escalation.violation)
        
        return self.apply_human_decision(escalation, human_decision)
```

## Integration Patterns

### 1. **Layered Guardrails**
```python
class LayeredGuardrails:
    def __init__(self):
        self.layers = [
            InputValidationLayer(),
            ContentFilterLayer(),
            BehaviorMonitoringLayer(),
            OutputSanitizationLayer(),
            FinalSafetyLayer()
        ]
    
    def process_with_layers(self, request):
        current_request = request
        layer_results = []
        
        for layer in self.layers:
            layer_result = layer.process(current_request)
            layer_results.append(layer_result)
            
            if not layer_result.passed:
                return LayeredResult(
                    blocked_at_layer=layer.name,
                    violation=layer_result.violation,
                    layer_results=layer_results
                )
            
            current_request = layer_result.modified_request or current_request
        
        return LayeredResult(
            passed=True,
            final_request=current_request,
            layer_results=layer_results
        )
```

### 2. **Guardrail Orchestration**
```python
class GuardrailOrchestrator:
    def __init__(self):
        self.active_guardrails = {}
        self.guardrail_dependencies = {}
    
    def register_guardrail(self, name, guardrail, dependencies=None):
        self.active_guardrails[name] = guardrail
        self.guardrail_dependencies[name] = dependencies or []
    
    def execute_guardrails(self, context):
        results = {}
        
        # Execute in dependency order
        execution_order = self.topological_sort(self.guardrail_dependencies)
        
        for guardrail_name in execution_order:
            guardrail = self.active_guardrails[guardrail_name]
            
            # Pass results of dependent guardrails
            dependent_results = {
                dep: results[dep] for dep in self.guardrail_dependencies[guardrail_name]
                if dep in results
            }
            
            results[guardrail_name] = guardrail.execute(context, dependent_results)
            
            # Early termination on critical violation
            if results[guardrail_name].severity == 'critical':
                break
        
        return GuardrailExecutionResult(results)
```

## Performance Optimization

### 1. **Efficient Filtering**
```python
class OptimizedGuardrails:
    def __init__(self):
        self.bloom_filter = BloomFilter(capacity=10000, error_rate=0.1)
        self.pattern_cache = LRUCache(maxsize=1000)
        self.compiled_patterns = self.compile_regex_patterns()
    
    def fast_content_check(self, text):
        # Quick bloom filter check first
        text_hash = hash(text)
        if not self.bloom_filter.might_contain(text_hash):
            return FastCheckResult(safe=True, confidence=0.9)
        
        # Cached pattern matching
        cache_key = f"{text[:100]}_{len(text)}"
        if cache_key in self.pattern_cache:
            return self.pattern_cache[cache_key]
        
        # Full pattern matching
        result = self.full_pattern_check(text)
        self.pattern_cache[cache_key] = result
        
        return result
```

### 2. **Parallel Guardrail Execution**
```python
class ParallelGuardrails:
    async def execute_parallel_checks(self, context):
        # Independent guardrails can run in parallel
        independent_checks = [
            self.content_filter.check_async(context),
            self.toxicity_detector.check_async(context),
            self.privacy_scanner.check_async(context),
            self.bias_detector.check_async(context)
        ]
        
        # Dependent checks run after independent ones
        independent_results = await asyncio.gather(*independent_checks)
        
        if any(not result.passed for result in independent_results):
            return ParallelResult(
                passed=False,
                failed_checks=independent_results,
                execution_time=self.measure_execution_time()
            )
        
        # Run dependent checks
        dependent_results = await self.run_dependent_checks(
            context, independent_results
        )
        
        return ParallelResult(
            passed=all(result.passed for result in dependent_results),
            all_results=independent_results + dependent_results,
            execution_time=self.measure_execution_time()
        )
```

## Monitoring and Analytics

### 1. **Guardrail Metrics**
```python
class GuardrailMetrics:
    def __init__(self):
        self.metrics = {
            'total_requests': Counter(),
            'violations_by_type': Counter(),
            'false_positives': Counter(),
            'false_negatives': Counter(),
            'response_times': Histogram(),
            'user_satisfaction': Gauge()
        }
    
    def record_violation(self, violation_type, context):
        self.metrics['violations_by_type'][violation_type] += 1
        
        # Track user patterns
        user_violations = self.get_user_violations(context.user_id)
        if user_violations > 10:
            self.flag_problematic_user(context.user_id)
    
    def analyze_trends(self, time_window='7d'):
        return {
            'violation_rate': self.calculate_violation_rate(time_window),
            'most_common_violations': self.get_top_violations(time_window),
            'false_positive_rate': self.calculate_false_positive_rate(time_window),
            'performance_impact': self.measure_performance_impact(time_window)
        }
```

### 2. **Real-time Dashboards**
```python
class GuardrailDashboard:
    def get_real_time_status(self):
        return {
            'active_guardrails': len(self.active_guardrails),
            'current_load': self.measure_current_load(),
            'recent_violations': self.get_recent_violations(minutes=5),
            'system_health': self.assess_system_health(),
            'response_time_p95': self.get_response_time_percentile(95)
        }
    
    def generate_alerts(self):
        alerts = []
        
        if self.get_violation_rate() > 0.1:  # 10% violation rate
            alerts.append(Alert(
                level='warning',
                message='High violation rate detected',
                recommended_action='Review guardrail sensitivity'
            ))
        
        if self.get_false_positive_rate() > 0.05:  # 5% false positive rate
            alerts.append(Alert(
                level='info',
                message='High false positive rate',
                recommended_action='Retrain guardrail classifiers'
            ))
        
        return alerts
```

## Best Practices

1. **Defense in Depth**: Layer multiple guardrails for comprehensive coverage
2. **Performance Balance**: Optimize guardrails to minimize latency impact  
3. **Continuous Learning**: Update guardrails based on new violation patterns
4. **User Experience**: Provide clear feedback when requests are blocked
5. **False Positive Handling**: Implement appeal/review processes
6. **Context Sensitivity**: Adapt guardrails based on use case and user
7. **Monitoring**: Track guardrail effectiveness and performance impact

## Anti-Patterns

1. **Over-Filtering**: Blocking too many legitimate requests
2. **Under-Monitoring**: Not tracking guardrail effectiveness
3. **Static Rules**: Failing to adapt to new violation patterns  
4. **Poor User Feedback**: Unclear error messages when blocked
5. **Single Point of Failure**: Relying on one guardrail type
6. **Performance Neglect**: Ignoring latency impact of guardrails

## Related Patterns

- [[Constitutional AI Pattern]] - Training-time safety principles
- [[Behavioral Vaccination Pattern]] - Preventive behavioral constraints  
- [[Human-in-the-Loop Pattern]] - Human oversight integration
- [[Multi-Agent Consensus Pattern]] - Collaborative safety validation
- [[Context Preservation Principle]] - Maintaining safety context

## Zero-Entropy Insights

### 1. **Prevention vs Detection**
Guardrails detect and prevent at runtime what constitutional training missed

### 2. **Dynamic Adaptation**  
Effective guardrails learn and adapt to new violation patterns

### 3. **Layered Defense**
Multiple independent guardrails provide redundant safety coverage

### 4. **Performance Trade-offs**
Safety always competes with speed - optimization is critical

---

*Guardrail Pattern provides runtime safety enforcement through active monitoring and intervention in AI agent behavior*