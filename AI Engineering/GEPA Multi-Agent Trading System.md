# GEPA Multi-Agent Trading System

> Advanced trading system using DSPy's GEPA (Gradient-free Evolution via Prompt Adjustment) optimization with the Three Gulfs Framework for robust strategy generation across volatile markets.

**GitHub Gist**: https://gist.github.com/jmanhype/0da70069e58aab1995ca92d40bf1724e

## 🚀 Quick Start

```bash
# Clone and setup
git clone <repo>
cd multi-agent-system

# Install with uv (recommended)
make setup-uv
make fix-numpy  # Fix VectorBT compatibility

# Or traditional pip
make install
make fix-numpy

# Run optimization
make optimize  # Light budget (396 calls, ~5 min)
```

## 📖 Overview

This system implements a sophisticated trading strategy optimizer that:

- **Learns** from market conditions using GEPA's reflective prompt evolution
- **Adapts** to volatility regimes from 0.7% to 20% daily movement
- **Validates** strategies using the Three Gulfs Framework
- **Backtests** with VectorBT Pro for realistic performance metrics

### Key Innovation: Three Gulfs Framework

Based on Hamel Husain & Shreya Shankar's framework, we bridge three critical gaps:

1. **Gulf of Comprehension** (Developer ↔ Data): Comprehensive logging of every evaluation
2. **Gulf of Specification** (Developer ↔ LLM): Precise, explicit evaluation criteria
3. **Gulf of Generalization** (Data ↔ LLM): Robust handling across volatility regimes

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│           RESEARCH LANE (Offline)           │
├─────────────────────────────────────────────┤
│  gepa_optimizer.py                          │
│    ↓ GEPA Evolution (396-800+ calls)        │
│  gepa_three_gulfs.py                        │
│    ↓ Validation & Analysis                  │
│  volatility_analyzer.py                     │
│    ↓ Stress Testing (10% daily vol)         │
├─────────────────────────────────────────────┤
│          PRODUCTION LANE (Online)           │
├─────────────────────────────────────────────┤
│  main.py → artifacts/winner.json            │
│    ↓ (PR Gate Required)                     │
│  Live Trading System                        │
└─────────────────────────────────────────────┘
```

## 💡 Core Concepts

### GEPA Optimization

- **Auto Budget**: Calculates optimal iterations based on dataset size
  - Light: ~396 calls (33 full evals) - Quick experiments
  - Medium: ~710 calls (59 full evals) - Balanced optimization
  - Heavy: ~800+ calls (66+ full evals) - Thorough optimization

### Volatility Adaptation

The system automatically adjusts strategies for different market conditions:

| Volatility | Range  | Strategy Type     | Stop Loss | Take Profit |
| ---------- | ------ | ----------------- | --------- | ----------- |
| Ultra Low  | <1%    | Mean Reversion    | 0.5-1.5%  | 1-3%        |
| Low        | 1-2%   | Mean Rev/Breakout | 1-2%      | 2-5%        |
| Medium     | 2-5%   | Momentum/Breakout | 2-5%      | 3-8%        |
| High       | 5-10%  | Momentum          | 3-7%      | 5-12%       |
| Extreme    | 10-20% | Momentum/ML       | 5-10%     | 8-20%       |
| Crisis     | >20%   | ML-based          | 8-10%     | 15-20%      |

## 📚 Usage Guide

### Basic Operations

```bash
# Run GEPA optimization with different budgets
make optimize          # Light budget (fastest)
make optimize-medium   # Balanced
make optimize-heavy    # Most thorough

# Test specific scenarios
make volatility       # Test 10% daily volatility
make scenarios        # Test all volatility regimes
make three-gulfs      # Run Three Gulfs analysis

# Full pipeline
make pipeline         # Complete optimization → trading flow
```

### Environment Variables

```bash
# Required in .env
OPENAI_API_KEY=sk-...       # For GPT-4o-mini generation
ANTHROPIC_API_KEY=...        # Optional: For Claude models

# Optional overrides
GEPA_BUDGET=medium           # Control optimization budget
VECTOR_BT_KEY=...            # VectorBT Pro license
```

### Advanced Usage

```python
# Custom optimization with specific volatility
from gepa_optimizer import create_enhanced_metric
from lib.data.dex_adapter import dex_adapter

# Load your data
df = dex_adapter.get_candles('BTC/USDT', '5m', 1000)

# Create metric with custom backtest
metric = create_enhanced_metric(your_backtest_func)

# Run GEPA with custom settings
optimizer = GEPA(
    auto='medium',
    metric=metric,
    reflection_lm=your_model
)
```

## 🛠️ Development

### File Structure

```
.
├── Core Files (rename pending)
│   ├── test_gepa_enhanced.py → gepa_optimizer.py
│   ├── test_gepa_three_gulfs.py → gepa_three_gulfs.py
│   ├── test_10pct_volatility.py → volatility_analyzer.py
│   └── run_gepa_trading.py → main.py
│
├── lib/
│   ├── evaluation/       # Three Gulfs implementation
│   │   ├── gepa_comprehension_logger.py
│   │   ├── gepa_specification_metric.py
│   │   └── gepa_generalization_handler.py
│   ├── research/         # Backtesting & generation
│   └── data/            # Market data adapters
│
├── config/              # Configurations
├── artifacts/           # Production strategies (PR-gated)
└── logs/               # Append-only evidence
```

### Common Issues & Solutions

#### NumPy/VectorBT Compatibility

```bash
# If you see: "AttributeError: _ARRAY_API not found"
make fix-numpy  # Downgrades to compatible versions
```

#### Disk Space Issues

```bash
# GEPA logs can grow large
make clean-logs  # Archive old logs
```

#### Low Scores (0.25)

This usually indicates backtest failures. Check:

1. VectorBT is properly installed
2. NumPy version is 1.23.5
3. Market data is loading correctly

## 🎯 Tips for Success

### 1. Start with Light Budget

```bash
GEPA_BUDGET=light make optimize  # ~5 minutes
```

Validate your setup works before running longer optimizations.

### 2. Monitor in Real-Time

```bash
make monitor  # Watch scores and iterations
```

### 3. Understand Your Scores

- **0.80+**: Excellent strategy, ready for validation
- **0.60-0.79**: Good baseline, may need refinement
- **0.40-0.59**: Functional but suboptimal
- **0.25**: Backtest failure (check VectorBT)
- **0.00**: JSON structure error

### 4. Use Three Gulfs for Debugging

```bash
make three-gulfs  # Comprehensive analysis
```

This shows exactly where strategies fail: structure, parameters, coherence, adaptation, or performance.

### 5. Test Extreme Conditions

```bash
make volatility  # Always test 10% volatility
```

If your strategy survives 10% daily volatility, it's robust.

## 📊 Performance Benchmarks

Current best results (as of last run):

- **Sharpe Ratio**: 1.5-2.0 (target: >1.0)
- **Win Rate**: 55-60% (target: >45%)
- **Max Drawdown**: 15-25% (target: <25%)
- **Risk/Reward**: 2.0-3.0 (target: >1.5)

## 🔒 Security & Production

### PR Gate for Production

Strategies only reach production through:

```
config/best_strategy.json → PR Review → artifacts/winner.json
```

### Safety Mechanisms

- Circuit breaker on high risk/latency
- Kill switch for emergency stops
- Paper trading mode by default
- PIN required for live trading

## Implementation Integration with Existing Frameworks

### Connection to Three Gulfs Framework

This system directly implements the [[Three Gulfs Framework - Overview]] methodology:

#### Gulf of Comprehension Implementation
```python
# gepa_comprehension_logger.py - Complete visibility
class GEPAComprehensionLogger:
    def log_evaluation(self, strategy, backtest_results, metrics):
        """Comprehensive logging of every GEPA evaluation"""
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "strategy": strategy,
            "raw_results": backtest_results,
            "computed_metrics": metrics,
            "failure_points": self.identify_failures(backtest_results)
        }
        self.append_to_log(log_entry)
```

#### Gulf of Specification Implementation
```python
# gepa_specification_metric.py - Precise evaluation
class GEPASpecificationMetric:
    def evaluate_strategy(self, strategy_json):
        """Multi-dimensional strategy evaluation"""
        return {
            "structure_score": self.validate_structure(strategy_json),
            "parameter_score": self.validate_parameters(strategy_json),
            "coherence_score": self.check_logical_coherence(strategy_json),
            "adaptation_score": self.test_volatility_adaptation(strategy_json),
            "performance_score": self.backtest_performance(strategy_json)
        }
```

#### Gulf of Generalization Implementation
```python
# gepa_generalization_handler.py - Cross-regime robustness
class GEPAGeneralizationHandler:
    def test_across_regimes(self, strategy):
        """Test strategy across all volatility regimes"""
        regimes = self.get_volatility_regimes()
        results = {}
        for regime in regimes:
            test_data = self.get_regime_data(regime)
            results[regime] = self.backtest_in_regime(strategy, test_data)
        return self.aggregate_regime_results(results)
```

### Relationship to Chain-of-Alpha Framework

While this system focuses on strategy optimization rather than factor generation, it shares architectural patterns with the [[Chain-of-Alpha Framework - Overview]]:

#### Iterative Improvement Loop
```python
# Similar to Chain-of-Alpha's dual-chain approach
class GEPAOptimizationLoop:
    def optimize_strategy(self, initial_strategy):
        """GEPA's reflective improvement mirrors Chain-of-Alpha's optimization chain"""
        current_strategy = initial_strategy
        
        for iteration in range(self.max_iterations):
            # Evaluate current strategy (like Chain-of-Alpha factor evaluation)
            performance = self.backtest_strategy(current_strategy)
            
            # Generate improvements (like Chain-of-Alpha factor optimization)
            improvements = self.generate_improvements(current_strategy, performance)
            
            # Select best variant (systematic selection process)
            current_strategy = self.select_best_strategy(improvements)
            
        return current_strategy
```

#### Multi-Model Architecture
```python
# Ensemble approach similar to Chain-of-Alpha's multi-model generation
class MultiModelGEPA:
    def __init__(self):
        self.models = {
            'gpt-4o-mini': OpenAIModel('gpt-4o-mini'),
            'claude-3-sonnet': AnthropicModel('claude-3-5-sonnet-20241022'),
            'gemini-pro': GoogleModel('gemini-pro')
        }
    
    def generate_strategy_ensemble(self, context):
        """Generate strategies using multiple models like Chain-of-Alpha factors"""
        strategies = []
        for model_name, model in self.models.items():
            strategy = self.generate_with_model(model, context)
            strategies.append(strategy)
        
        return self.select_best_ensemble(strategies)
```

### Advanced Applications

#### Real-Time Market Adaptation

```python
# Dynamic strategy adaptation based on market conditions
class AdaptiveGEPASystem:
    def __init__(self):
        self.volatility_detector = VolatilityRegimeDetector()
        self.strategy_cache = {}
        
    def get_optimal_strategy(self, current_market_data):
        """Dynamically select strategy based on current market conditions"""
        regime = self.volatility_detector.detect_regime(current_market_data)
        
        if regime not in self.strategy_cache:
            # Generate strategy optimized for this regime
            regime_strategy = self.optimize_for_regime(regime)
            self.strategy_cache[regime] = regime_strategy
            
        return self.strategy_cache[regime]
```

#### Multi-Asset Strategy Generation

```python
# Extend GEPA optimization across multiple asset classes
class MultiAssetGEPA:
    def optimize_portfolio_strategy(self, assets):
        """Generate strategies that work across multiple assets"""
        base_strategies = {}
        
        # Generate asset-specific strategies
        for asset in assets:
            asset_data = self.get_asset_data(asset)
            asset_strategy = self.optimize_single_asset(asset_data)
            base_strategies[asset] = asset_strategy
            
        # Create portfolio-level strategy
        portfolio_strategy = self.synthesize_portfolio_strategy(base_strategies)
        
        return portfolio_strategy
```

## 🤝 Contributing

1. Run optimizations locally: `make optimize`
2. Validate with Three Gulfs: `make three-gulfs`
3. Test extreme volatility: `make volatility`
4. Submit PR with evidence in logs/

## 📝 License

MIT - See LICENSE file

## 🙏 Acknowledgments

- DSPy team for GEPA optimizer
- Hamel Husain & Shreya Shankar for Three Gulfs Framework
- VectorBT Pro for backtesting engine

## Related Documentation

- [[Three Gulfs Framework - Overview]] - Core evaluation methodology
- [[Three Gulfs - Tools and Templates Quick Reference]] - Implementation templates
- [[Chain-of-Alpha Framework - Overview]] - Factor generation approach
- [[Chain-of-Alpha - Implementation Guide]] - Similar system architecture patterns

---

**Note**: This is a research system. Always validate strategies thoroughly before live trading. The system is designed for safety-first operation with multiple validation gates.

*"GEPA represents the evolution of automated trading strategy optimization - where machine learning meets systematic validation to generate robust, adaptable trading algorithms."*