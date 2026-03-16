# Opportunity Scoring Rubric

Used to evaluate and rank opportunities from the Healthcare Opportunity Radar.

## Scoring Factors

| Factor | Weight | Description |
|--------|--------|-------------|
| Market Demand | 25% | Is there clear evidence of demand? Users, pilots, growth? |
| Varden Platform Fit | 25% | Does this integrate naturally with our ecosystem? Leverage our strengths? |
| Build Complexity | 15% | How hard is this to build? (Higher score = easier to build) |
| Time to Traction | 15% | How fast can we validate this? (Higher score = faster validation) |
| Competitive Saturation | 10% | How crowded is this space? (Higher score = less crowded) |
| Regulatory Risk | 10% | What's the regulatory burden? (Higher score = lower risk) |

## Scoring Scale

Each factor is scored 1-10:

- **1-3:** Poor fit / high risk / difficult
- **4-6:** Moderate
- **7-10:** Strong fit / low risk / easy

## Final Score

```
Final Score = Σ (Factor Score × Weight)
```

Range: 1.0 - 10.0

## Priority Bands

| Score | Priority | Action |
|-------|----------|--------|
| 8.5+ | 🔥 Immediate | Start MVP this week |
| 7.5-8.4 | ⭐ High | Plan MVP within 2 weeks |
| 6.5-7.4 | 📋 Medium | Add to backlog, revisit monthly |
| 5.5-6.4 | 👀 Watch | Monitor, no action yet |
| <5.5 | ❌ Pass | Archive, not a fit |

## Varden Strategic Fit Criteria

**Strong Fit (8-10):**
- Leverages EHR integrations (15+ providers)
- Serves existing customer base (clinics, patients)
- Infrastructure/platform play (scales across customers)
- Low regulatory burden (admin, scheduling, routing)

**Moderate Fit (4-7):**
- New customer segment
- Requires new integrations
- Some regulatory considerations

**Weak Fit (1-3):**
- Clinical decision support (high regulatory)
- Hardware/device dependent
- Single-clinic tools (don't scale)
- Pure consumer play (no B2B angle)

## Example Scoring

### AI Symptom Intake + Provider Matching

| Factor | Score | Weight | Weighted |
|--------|-------|--------|----------|
| Market Demand | 9 | 0.25 | 2.25 |
| Varden Platform Fit | 9 | 0.25 | 2.25 |
| Build Complexity | 8 | 0.15 | 1.20 |
| Time to Traction | 8 | 0.15 | 1.20 |
| Competitive Saturation | 6 | 0.10 | 0.60 |
| Regulatory Risk | 8 | 0.10 | 0.80 |
| **Total** | | | **8.30** |

**Priority:** ⭐ High — Plan MVP within 2 weeks

---

### Teledermatology Triage

| Factor | Score | Weight | Weighted |
|--------|-------|--------|----------|
| Market Demand | 7 | 0.25 | 1.75 |
| Varden Platform Fit | 7 | 0.25 | 1.75 |
| Build Complexity | 6 | 0.15 | 0.90 |
| Time to Traction | 6 | 0.15 | 0.90 |
| Competitive Saturation | 5 | 0.10 | 0.50 |
| Regulatory Risk | 6 | 0.10 | 0.60 |
| **Total** | | | **6.40** |

**Priority:** 👀 Watch — Monitor, no action yet
