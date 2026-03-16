# Pharmacy Infrastructure Map

*Round 16 — Problem-first, boring software*

---

## Overview

Pharmacy/medication infrastructure is the hidden backbone of modern healthcare. It handles ~$600B in annual US drug spending, processes billions of prescriptions, and sits between insurers, manufacturers, pharmacies, and patients.

**Key insight:** This is a highly consolidated, middleware-heavy ecosystem dominated by a few massive players. Integration is the moat.

---

## Problem 1: Prescribers need to send prescriptions to pharmacies electronically

### Core Infrastructure

| Company | Solution | Notes |
|---------|----------|-------|
| **Surescripts** | National e-prescribing network | Routes 95%+ of US e-prescriptions. Middleman between EHRs, PBMs, pharmacies. Founded 2001. Near-monopoly. |
| **DrFirst** | E-prescribing platform | Rcopia product. Strong in controlled substances (EPCS). Serves 300K+ prescribers. |
| **RxHub** | Prescription history network | Merged into Surescripts (2008). Historical patient medication data from PBMs. |
| **NewCrop** | E-prescribing module | White-label e-prescribing for EHR vendors. Acquired by DrFirst (2021). |
| **DoseSpot** | E-prescribing API | Developer-focused. Embed e-prescribing into health apps. EPCS compliant. |

### EHR-Integrated E-Prescribing

| Company | Solution | Notes |
|---------|----------|-------|
| **Epic** | Beacon e-prescribing | Integrated with Surescripts. Dominates large health systems. |
| **Cerner** | PowerChart e-prescribing | Now Oracle Health. Strong in hospital pharmacy workflows. |
| **Athenahealth** | E-prescribing | Cloud-based. Automatic formulary checks via PBM integration. |
| **eClinicalWorks** | E-prescribing module | Serves small-medium practices. Heavily marketed. |
| **Practice Fusion** | E-prescribing | Free/low-cost EHR. Acquired by Allscripts. |

---

## Problem 2: Insurance plans need someone to manage drug benefits, negotiate prices, and process claims

### Major PBMs (80% market share)

| Company | Solution | Notes |
|---------|----------|-------|
| **CVS Caremark** | PBM services | Vertically integrated with CVS pharmacies + Aetna insurance. 100M+ lives covered. |
| **Express Scripts** | PBM services | Owned by Cigna. Mail-order pharmacy. 100M+ lives. Accredo specialty arm. |
| **OptumRx** | PBM services | UnitedHealth Group subsidiary. 66M+ lives. Deep EHR integration via Optum. |
| **Humana Pharmacy Solutions** | PBM services | Strong in Medicare Part D. Vertically integrated with Humana insurance. |
| **Prime Therapeutics** | PBM services | Owned by Blue Cross Blue Shield plans. 30M+ lives. |

### Mid-Tier / Specialty PBMs

| Company | Solution | Notes |
|---------|----------|-------|
| **Magellan Rx Management** | PBM services | Focus on Medicaid, specialty drugs. Acquired by Prime (2022). |
| **EnvisionRx** | PBM services | Medicare Part D focus. Subsidiary of Rite Aid (divested). |
| **Navitus Health Solutions** | PBM services | Pass-through pricing model. Cooperative ownership. |
| **MedImpact Healthcare Systems** | PBM services | Independent PBM. Transparent pricing pitch. |
| **PerformRx** | PBM services | Medicaid-focused. Not-for-profit model. |

### PBM Technology Vendors

| Company | Solution | Notes |
|---------|----------|-------|
| **Change Healthcare** | PBM claims processing | Massive claims infrastructure. Now UnitedHealth-owned (after DOJ fight). |
| **EXL** | PBM analytics | Outsourced PBM operations. Claims adjudication. |
| **SS&C** | PBM administration | Wealth/platform software. acquired PBM tech via DST. |
| **Gainwell Technologies** | PBM Medicaid systems | Former DXC Medicaid business. State contracts. |

---

## Problem 3: Patients don't take medications as prescribed (adherence)

### Digital Adherence Platforms

| Company | Solution | Notes |
|---------|----------|-------|
| **Proteus Digital Health** | Ingestible sensors | **DEAD.** Raised $400M+. Pill sensors + patch. Bankrupt 2020. Lesson: invasive tech fails. |
| **AdhereTech** | Smart pill bottles | Cellular-connected bottles. Light/sound reminders. Pharma partnerships. |
| **EllieGrid** | Smart pill organizer | Consumer device. App-connected. Reminders. |
| **Hero Health** | Smart pill dispenser | Consumer device ($500+). Automatic dispensing. Subscription model. |
| **Pillo** | Medication robot | Home dispenser. Voice assistant. Acquired by BioQuad (?). |
| **MedMinder** | Connected pill dispenser | Locking pharmacy-grade dispenser. Alerts caregivers. |
| **SMRxT** | Digital adherence platform | App + sensor system. Pharma partnerships for outcomes. |

### Adherence Software / Programs

| Company | Solution | Notes |
|---------|----------|-------|
| **AllazoHealth** | AI adherence predictions | Predicts who will be non-adherent. Targets interventions. |
| **GNS Healthcare** | AI drug outcomes | Causal ML for adherence + outcomes. Pharma partnerships. |
| **RxAnte** | Adherence analytics | Predictive analytics. Risk stratification. Acquired by Millennium (2020). |
| **FICO** | Medication Adherence Score | Credit score for pill-taking. Licensed to PBMs. |
| **CuePath** | Caregiver adherence tracking | Family sees if elderly relatives took meds. Canada. |
| **MyTherapy** | Medication reminder app | Consumer app. Free + premium. 10M+ downloads. |

---

## Problem 4: Prescribers need real-time drug interaction and dosing alerts

### Drug Database Vendors (Clinical Decision Support)

| Company | Solution | Notes |
|---------|----------|-------|
| **First Databank (FDB)** | Drug knowledge base | Industry standard. Powers EHRs, PBMs, pharmacies. Owned by Hearst. |
| **Clinical Pharmacology** | Drug database | Elsevier-owned. Academic/clinical depth. Used by hospitals. |
| **Lexicomp** | Drug database | Wolters Kluwer-owned. Mobile-first. Pharmacist favorite. |
| **Micromedex** | Drug database | IBM (via Merative). Clinical depth. Poison control use. |
| **Medi-Span** | Drug database | Wolters Kluwer. Pricing + clinical data. PBM-focused. |
| **Gold Standard/Elsevier** | Drug database | Acquired by Elsevier. ALTO product. |
| **Drugs.com** | Consumer drug info | Massive SEO traffic. Free consumer data. APIs for apps. |
| **GoodRx** | Drug pricing + info | Consumer pricing. IoS integration. |
| **DynaMed** | Drug + clinical info | EBSCO-owned. Evidence-based. Point-of-care. |

### Interaction Checking APIs

| Company | Solution | Notes |
|---------|----------|-------|
| **RxNorm** | Drug terminology API | NIH/NLM free API. Standard drug names. |
| **DrugBank** | Drug database API | Academic-origin. Deep biochemical data. Widely cited. |
| **OpenFDA** | Drug adverse events API | FDA free API. Adverse event reports. |
| **Dosespot API** | E-prescribing + DUR | Includes drug utilization review in API. |
| **DrFirst API** | E-prescribing + clinical | Clinical decision support built-in. |

---

## Problem 5: Specialty drugs (high-cost, complex administration) need dedicated pharmacy workflows

### Specialty Pharmacy Operations

| Company | Solution | Notes |
|---------|----------|-------|
| **Accredo** | Specialty pharmacy | Express Scripts subsidiary. $40B+ revenue. Oncology, rare disease. |
| **CVS Specialty** | Specialty pharmacy | Vertically integrated. Infusion, oral, injectable. |
| **Optum Specialty Pharmacy** | Specialty pharmacy | UnitedHealth-owned. 85K+ patients. Rare disease focus. |
| **Diplomat Pharmacy** | Specialty pharmacy | Acquired by Optum (2020). Was largest independent. |
| **Kroger Specialty Pharmacy** | Specialty pharmacy | Retail pharmacy spin-in. |
| **BioPlus Specialty** | Specialty pharmacy | Acquired by Premium Rx (2022). |
| **Avella Specialty Pharmacy** | Specialty pharmacy | Acquired by Optum (2018). |
| **Onco360** | Oncology specialty pharmacy | Independent. 50+ locations. |
| **Archimedes Pharma** | Specialty pharmacy | UK-based. Pain, oncology focus. |

### Specialty Pharmacy Management Software

| Company | Solution | Notes |
|---------|----------|-------|
| **McKesson Specialty Health** | Specialty distribution + software | Oncology focus. ClearPath software. |
| **Kit Check** | Specialty pharmacy automation | RFID tracking. IV room workflow. |
| **BD (Catalyst)** | Pharmacy automation | Acquired Catalyst. Specialty dispensing. |
| **Parata** | Pharmacy automation | Packaging, dispensing. Acquired by BD (2022). |
| **RxSafe** | Pharmacy automation | Strip packaging. High-volume. |
| **ScriptPro** | Pharmacy automation | Dispensing, workflow. Private. |
| **TCGRx** | Pharmacy automation | Packaging systems. |
| **Innovation Associates** | Pharmacy software | Specialty pharmacy management. Acquired by AmerisourceBergen. |

---

## Problem 6: Patients need to find lowest drug prices (transparency / marketplaces)

### Pharmacy Price Transparency

| Company | Solution | Notes |
|---------|----------|-------|
| **GoodRx** | Drug price comparison | 5.5M+ subscribers. $750M+ revenue. Coupons bypass insurance. IPO 2021. |
| **Blink Health** | Drug price marketplace | Pre-pay for drugs at discount. Backed by传奇资本. |
| **SingleCare** | Drug price comparison | Free coupons. Pharmacy network. |
| **RxSaver** | Drug price comparison | Owned by RetailMeNot. Consumer-facing. |
| **WellRx** | Drug price comparison |Owned by Costco? ScriptSave product. |
| **Optum Perks** | Drug price comparison | UnitedHealth's consumer-facing tool. |
| **Cost Plus Drugs** | Direct pharmacy | Mark Cuban. Transparent pricing. 2,000+ generic drugs. Mail-order only. |
| **Honeybee Health** | Direct pharmacy | Cash-pay generic drugs. No insurance. |
| **GeniusRx** | Direct pharmacy | Online pharmacy. Discount pricing. |

### Pharmacy Marketplaces / Routing

| Company | Solution | Notes |
|---------|----------|-------|
| **Capsule** | Digital pharmacy | Delivery in NYC, select markets. $500M+ raised. |
| **Alto Pharmacy** | Digital pharmacy | Same-day delivery. 40 states. $350M+ raised. |
| **NowRx** | Micro-fulfillment pharmacy | 1-hour delivery. Bay Area, Phoenix. |
| **Phil** | Digital pharmacy | White-label for independent pharmacies. Acquired by CVS (2023). |
| **Nurx** | Telepharmacy | Birth control, PrEP, hair loss. Acquired by Thirty Madison (2022). |
| **Ro Pharmacy** | Cash pharmacy | Direct-to-consumer. Generic $6/month. |
| **Hims & Hers** | Telepharmacy | Men's/women's health. Cash-pay. Public (NYSE). |

---

## Problem 7: Pharmacies need to manage inventory, workflow, and claims

### Pharmacy Management Systems

| Company | Solution | Notes |
|---------|----------|-------|
| **PioneerRx** | Pharmacy software | Independent pharmacy favorite. Speed-focused. Acquired by RedSail (2020). |
| **McKesson Pharmacy Systems** | Enterprise pharmacy | HealthMart, etc. Large chains. |
| **Cerner Retail Pharmacy** | Pharmacy system | Now Oracle. Integrated with health systems. |
| **QS/1** | Pharmacy software | Independent + long-term care. UntiedRx platform. |
| **Computer-Rx** | Pharmacy software | Independent pharmacy. Cloud-based. |
| **BestRx** | Pharmacy software | Budget option for independents. |
| **Liberty Software** | Pharmacy software | Workflow + point-of-sale. |
| **RxKey** | Pharmacy software | Long-term care pharmacy. |

### Pharmacy POS / Workflow

| Company | Solution | Notes |
|---------|----------|-------|
| **PDX** | Pharmacy system | National chains. Enterprise-grade. |
| **Noble Systems** | Pharmacy POS | Retail pharmacy. |
| **Gectek** | Pharmacy POS | Independent pharmacy. |
| **Retail Management Solutions** | Pharmacy POS | Point-of-sale. Inventory. |

---

## Problem 8: Pharmacies need patient communication tools

### Pharmacy Engagement Platforms

| Company | Solution | Notes |
|---------|----------|-------|
| **SIRUM** | Medication donation platform | Redistribution of surplus drugs. California. |
| **Digital Pharmacist** | Pharmacy marketing | Patient engagement for independents. |
| **RxWiki** | Pharmacy content | Drug information content. |
| **PocketPills** | Canadian digital pharmacy | Packaged daily doses. Canada-only. |
| **Truepill** | Pharmacy API | White-label pharmacy infrastructure. Acquired by Well (2024). |

---

## Problem 9: Pharmacy claims need to be adjudicated in real-time

### Claims Switch / Adjudication

| Company | Solution | Notes |
|---------|----------|-------|
| **NCPDP** | Pharmacy claims standard | Industry org. Telecommunication standard. |
| **Change Healthcare** | Claims switching | Routes pharmacy claims to PBMs. Massive scale. |
| **Emdeon** | Claims processing | Now Change Healthcare. |
| **RelayHealth** | Pharmacy connectivity | McKesson-owned. PBM switching. |
| **RxAmerica** | Claims adjudication | PBM owned by Walgreens. |

---

## Problem 10: Long-term care facilities need specialized pharmacy services

### Long-Term Care Pharmacy

| Company | Solution | Notes |
|---------|----------|-------|
| **Omnicare** | LTC pharmacy | CVS-owned. Largest US LTC pharmacy. |
| **PharMerica** | LTC pharmacy | Kindred-owned. Skilled nursing focus. |
| **Medwyn** | LTC pharmacy | Independent LTC pharmacy. UK-based. |
| **Grane Rx** | LTC pharmacy | Mid-Atlantic US. PACE programs. |
| **Senior Care Pharmacy** | LTC pharmacy | Consultant pharmacy services. |
| **SynchronyRx** | LTC pharmacy software | Operations management. |

---

## Problem 11: Drug wholesalers need distribution infrastructure

### Pharmaceutical Wholesalers

| Company | Solution | Notes |
|---------|----------|-------|
| **McKesson** | Drug distribution | Largest pharma distributor. $276B revenue. |
| **AmerisourceBergen** | Drug distribution | #2 distributor. Specialty focus. |
| **Cardinal Health** | Drug distribution | #3 distributor. Medical-surgical too. |
| **Morris & Dickson** | Drug distribution | Regional. Louisiana-based. |
| **HD Smith** | Drug distribution | Regional. Merged into AmerisourceBergen (2018). |
| **Anda** | Drug distribution | Generic-focused. Teva-owned. |

---

## Problem 12: Compounding pharmacies need specialized workflows

### Compounding Pharmacy Systems

| Company | Solution | Notes |
|---------|----------|-------|
| **RxTouch** | Compounding software | Formula management. |
| **PharmKonnect** | Compounding software | Workflow + compliance. |
| **SuiteRx** | Compounding module | Integrated with pharmacy system. |
| **PioneerRx** | Compounding support | Popular with independents. |
| **TCGRx** | Compounding automation | Equipment + software. |

---

## Key Patterns

### 1. Consolidation is extreme
- 3 PBMs control 80% of lives
- Surescripts controls 95% of e-prescribing routing
- First Databank/Lexicomp/Micromedex dominate drug databases
- Specialty pharmacy is now Big Pharma / PBM-owned

### 2. Vertical integration
- CVS: PBM + pharmacy + insurer (Aetna)
- UnitedHealth: PBM (OptumRx) + insurer + provider (Optum)
- Cigna: PBM (Express Scripts) + insurer

### 3. Middleware dominates
- Nobody talks directly — everyone goes through hubs
- Surescripts: EHR ↔ Pharmacy
- PBMs: Insurer ↔ Pharmacy
- Drug databases: EHR ↔ Clinical knowledge

### 4. Consumer bypass emerging
- GoodRx lets patients pay less than insurance copay
- Cost Plus Drugs bypasses entire PBM system
- Cash-pay telepharmacy (Ro, Hims) ignores insurance

### 5. Adherence graveyard
- Proteus raised $400M+ for ingestible sensors → bankrupt
- Technology invasive to patients fails
- Simple reminders (AdhereTech, apps) work better

---

## Opportunities for Varden

Based on problem-first analysis:

### High-fit (infrastructure plays)

1. **PBM integration layer** — Simplify connecting to multiple PBMs
2. **E-prescribing API for telehealth** — DoseSpot competitor, vertical-specific
3. **Drug pricing API** — GoodRx for apps/telehealth
4. **Specialty pharmacy workflow** — High-touch, low-software penetration
5. **Adherence tracking for providers** — Visibility into whether patients filled prescriptions

### Lower-fit (crowded or low-margin)

- Direct pharmacy marketplace (GoodRx saturated)
- Drug database (FDB/Lexicomp moat too deep)
- PBM itself (requires billions, regulatory nightmare)

---

*Mapped 2026-03-11 by Sky (Round 16)*
*70+ entries across 12 problem areas*
