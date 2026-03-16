# Healthcare Opportunity Radar

A continuous intelligence pipeline for discovering, indexing, and evaluating healthcare innovation opportunities.

## Architecture

```
Sources → Scout → Extractor → Knowledge Base → Theme Agent → Opportunity Agent → Strategy Agent → Backlog → Builder
```

## Layers

| Layer | Agent | Output |
|-------|-------|--------|
| 1. Source Monitoring | Scout Agent | Raw discoveries from feeds |
| 2. Structured Extraction | Extractor Agent | Normalized entries in KB |
| 3. Pattern Detection | Theme Agent | Clustered themes report |
| 4. Opportunity Generation | Opportunity Agent | Product ideas |
| 5. Strategic Scoring | Strategy Agent | Ranked backlog |
| 6. Experiment Loop | Builder Agent | MVPs + validation |

## Directories

- `discoveries/` — Raw scraped entries (JSON)
- `knowledge-base/` — Normalized entries (JSON)
- `themes/` — Theme reports (Markdown)
- `opportunities/` — Product ideas (Markdown)
- `backlog/` — Scored + ranked opportunities (Markdown + JSON)
- `experiments/` — MVP tests and results
- `problems/` — Problem-first research (not just startups)

## Schema (Entry)

```json
{
  "id": "string",
  "title": "string",
  "company": "string | null",
  "country": "string",
  "segment": "string",
  "problem": "string",
  "solution": "string",
  "technology": "string",
  "target_customer": "string",
  "care_setting": "string",
  "care_domain": "string",
  "care_stage": "string",
  "automation_level": "string",
  "ai_type": "string | null",
  "traction_signals": [],
  "funding": "string | null",
  "regulatory_notes": "string | null",
  "source": "string",
  "url": "string",
  "date_added": "YYYY-MM-DD"
}
```

## Scoring Rubric

| Factor | Weight |
|--------|--------|
| Market demand | 25% |
| Fit with Varden platform | 25% |
| Build complexity (inverse) | 15% |
| Time to traction | 15% |
| Competitive saturation (inverse) | 10% |
| Regulatory risk (inverse) | 10% |

## Sources to Monitor

### Healthcare Innovation
- Rock Health
- Digital Health Insider
- HLTH conference news
- NHS innovation pilots
- EU health tech programs

### Startup Discovery
- Crunchbase (healthcare)
- YC batches
- AngelList
- Product Hunt (health)

### Operator Signals
- Healthcare IT forums
- Provider Reddit communities
- Clinical journals

### Problem Sources
- Physician forums
- Healthcare admin discussions
- Regulatory bottleneck reports

## Strategic Focus

**High-leverage for Varden:** Infrastructure over clinical tools

- Provider discovery
- Referral automation
- Care navigation
- Scheduling
- Patient routing
- Eligibility verification
- Intake automation

These scale. Single-clinic tools don't.

## Workflow (Weekly)

1. **Monday:** Scout agents run discovery, extractor normalizes
2. **Tuesday:** Theme agent clusters new entries
3. **Wednesday:** Opportunity agent generates ideas from themes
4. **Thursday:** Strategy agent scores + ranks
5. **Friday:** Human review, pick top ideas for experiment loop
6. **Ongoing:** Builder agents prototype MVPs, track results

## Agent Assignments

- **Rio** — Coordinator, strategy, synthesis, human interface
- **Sky** — Scout agent (discovery + extraction)
- **Nova** — Builder agent (MVP prototyping)

---

*Created 2026-03-11*
