# Healthcare Radar - Master Capability Matrix

## Purpose
Cross-reference these capabilities against your platform architecture to identify gaps.

---

## Capability Domains

### 1. Clinical AI / NLP Engine
**Target:** Infermedica, Isabel Healthcare, Ada Health, Tandem Health

| Component | Description | Build | Buy | Partner |
|-----------|-------------|------|-----|--------|
| Symptom NLP | Extract symptoms from text | ✅ | | |
| Triage Logic | Risk stratification | ✅ | | |
| ICD-10 Mapping | Diagnosis code suggestion | ✅ | | |
| Medical Knowledge Base | Disease/symptom ontology | | | ✅ |
| Clinical Validation | Peer-reviewed accuracy | | | ✅ |

**Recommendation:** Partner with Infermedica (B2B API) or Isabel Healthcare. Don't build knowledge base.

---

### 2. Telehealth / Video Consultation
**Target:** Mindler, Kry/Livi, Push Doctor

| Component | Description | Build | Buy | Partner |
|-----------|-------------|------|-----|--------|
| WebRTC Video | Real-time video | | ✅ | |
| Scheduling | Provider availability + booking | ✅ | | |
| Patient Intake | Forms + identity verification | ✅ | | |
| Recording Storage | Consent + GDPR compliant storage | ✅ | | |
| Provider Network | Licensed clinicians | | | B2B |

**Recommendation:** Buy Twilio Video or Daily.co. Sell platform B2B to clinics.

---

### 3. Practice Management / EHR
**Target:** Cambio, CompuGroup Medical, Nabla, Syntax

| Component | Description | Build | Buy | Partner |
|-----------|-------------|------|-----|--------|
| Patient Registry | CRUD + search | ✅ | | |
| Scheduling | Calendar + availability | ✅ | | |
| Documentation | Templates + voice-to-text | ✅ | | |
| Billing/Claims | Invoicing + payer integration | ✅ | | |
| Reporting | Analytics + exports | ✅ | | |
| EHR Integration | National system adapters | | | Per-country |

**Recommendation:** Build core platform. Partner for national EHR adapters.

---

### 4. Integration / Interoperability
**Target:** All EHR-connected systems

| Component | Description | Build | Buy | Partner |
|-----------|-------------|------|-----|--------|
| FHIR Server | RESTful health data exchange | | ✅ | |
| HL7 v2 Parser | Legacy hospital systems | ✅ | | |
| National Adapters | Sweden/UK/Germany specific | | | ✅ |
| OAuth/SMART | Auth for health apps | ✅ | | |

**Recommendation:** Buy FHIR server (HAPI/Azure). Partner for national adapters.

---

### 5. Remote Patient Monitoring
**Target:** Coala Health, Cuviva

| Component | Description | Build | Buy | Partner |
|-----------|-------------|------|-----|--------|
| BLE Integration | Connect medical devices | | ✅ | |
| Alert Engine | Threshold-based notifications | ✅ | | |
| Dashboard | Provider monitoring view | ✅ | | |
| Patient App | iOS/Android | ✅ | | |
| MDR Class IIa | Diagnostic algorithm certification | 🚫 | | |

**Recommendation:** Build non-diagnostic RPM only. Avoid MDR Class IIa.

---

## Quick Wins (Build in <4 weeks)

1. Scheduling system
2. Patient registry
3. Alert engine
4. OAuth/SMART auth

## Medium Investments (4-12 weeks)

1. Telehealth platform (with Twilio)
2. Practice management core
3. RPM dashboard

## Long Investments (Avoid or Partner)

1. Medical knowledge base (partner)
2. National EHR adapters (partner per country)
3. MDR Class IIa certification (avoid)

---

## Strategic Entry Order

1. **Telehealth B2B Platform** → Sell to clinics (8-12 weeks)
2. **Practice Management** → Add AI docs (12-16 weeks)  
3. **Clinical AI** → Partner with Infermedica (4-6 weeks integration)
4. **RPM** → Non-diagnostic first (8-12 weeks)

---

*Generated: 2026-03-15*
*Ready for platform architecture gap analysis*
