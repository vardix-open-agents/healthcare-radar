# Capability Analysis: Practice Management / EHR

**Deep-dive into capabilities required to replicate Cambio, CompuGroup Medical, Nabla, and related European EHR systems.**

---

## Executive Summary

Building a competitive practice management/EHR system for European markets requires:
- **5-10+ years** of development for full feature parity with incumbents
- **Deep regional integrations** (Inera, NHS Spine, Telematikinfrastruktur)
- **MDR medical device certification** for clinical decision support features
- **Significant lock-in moats** from data migration costs and training investments

---

## 1. Core Functionality

### 1.1 Patient Registry (Demographics, History)

**Essential Features:**
| Capability | Description | Complexity |
|------------|-------------|------------|
| Patient demographics | Name, DOB, address, contact, insurance, national ID | Medium |
| Medical history | Problems/diagnoses list, surgical history, family history | High |
| Allergies & alerts | Drug allergies, critical alerts, flags | High |
| Immunization records | Vaccination history, schedules | Medium |
| Social history | Smoking, alcohol, occupation, living situation | Low |
| Consent management | Treatment consents, data sharing preferences | High (GDPR) |

**Technical Requirements:**
- Master Patient Index (MPI) with deduplication
- National patient identifier integration (personnummer in SE, NHS number in UK)
- Version-controlled records with audit trails
- HL7 FHIR Patient resource compliance

**Market Benchmarks:**
- **Cambio COSMIC**: Unified patient record across organizational boundaries
- **CGM TakeCare**: Comprehensive patient dossier with HSA (Healthcare Services Act) compliance

---

### 1.2 Appointment Scheduling (Calendars, Availability, Reminders)

**Essential Features:**
| Capability | Description | Complexity |
|------------|-------------|------------|
| Multi-resource scheduling | Book by time, room, equipment, staff | High |
| Availability management | Provider schedules, time-off, on-call | Medium |
| Patient self-scheduling | Web/app booking, 1177.se integration (SE) | High |
| Appointment types | Consultation types, durations, preparation instructions | Medium |
| Waitlist management | Queue management, prioritization | Medium |
| Reminders | SMS, email, app notifications | Low |
| Recurring appointments | Regular visits, treatment cycles | Medium |
| Overbooking rules | Capacity management, no-show predictions | High |

**Integration Requirements:**
- **Sweden**: 1177 Vårdguiden patient portal booking
- **UK**: NHS e-Referral Service integration
- **Germany**: Doctolib/Terminland third-party booking platforms

---

### 1.3 Clinical Documentation (Templates, Voice-to-Text)

**Essential Features:**
| Capability | Description | Complexity |
|------------|-------------|------------|
| Structured templates | Specialty-specific note templates | Medium |
| Free-text documentation | Rich text editor, auto-save | Low |
| Voice-to-text | Ambient clinical voice (ACV), dictation | High |
| Auto-note generation | AI-assisted documentation from conversation | Very High |
| Copy/paste with audit | Forwarding previous notes with attribution | Medium |
| SNOMED CT coding | Terminology integration for diagnoses | High |
| ICD-10/ICD-11 support | Diagnostic coding for billing/research | Medium |
| Clinical decision support | Alerts, reminders, best practice prompts | Very High |
| Document attachments | PDFs, images, scans linked to notes | Medium |

**AI Documentation Landscape:**
- **Nabla**: AI copilot for clinicians, ambient clinical voice
  - Real-time transcription of patient encounters
  - Auto-generated SOAP notes
  - EHR integration via iFrame or API
  - HIPAA/GDPR compliant (no audio storage)
  - Multi-specialty note templates
  - Pricing: ~$100-300/provider/month

**Cambio AI Solution** (2025):
- Integrated AI documentation in COSMIC
- Reduces documentation time by 50%+
- Optional add-on for existing customers

**Regulatory Note:** AI documentation tools may trigger MDR medical device classification if they influence clinical decisions.

---

### 1.4 Billing and Invoicing (Claims, Payments)

**Essential Features:**
| Capability | Description | Complexity |
|------------|-------------|------------|
| Fee schedules | Procedure codes, price lists | Medium |
| Claims generation | Automatic claim creation from encounters | High |
| Insurance verification | Real-time eligibility checks | High |
| Claims submission | Electronic submission to payers | Very High (regional) |
| Payment posting | ERA/EFT reconciliation | Medium |
| Patient billing | Statements, payment plans, collections | Medium |
| Reporting | Revenue cycle analytics | Medium |
| DRG coding | Diagnosis-related groups for hospital billing | Very High |

**Regional Variations:**
| Region | Billing System | Complexity |
|--------|----------------|------------|
| Sweden | SLL invoicing, region-specific codes | High |
| UK | NHS Tariff, CQRS, SUS submissions | Very High |
| Germany | GOÄ/EBM fee schedules, KV connectivity | Very High |

---

### 1.5 Reporting and Analytics

**Essential Features:**
| Capability | Description | Complexity |
|------------|-------------|------------|
| Quality metrics | Clinical quality measures (CQM) | High |
| Population health | Cohort analysis, risk stratification | Very High |
| Operational dashboards | Utilization, wait times, no-shows | Medium |
| Financial reports | Revenue, collections, AR aging | Medium |
| Regulatory reports | Government-mandated submissions | High (regional) |
| Custom report builder | Ad-hoc query tools | Medium |
| Data export | CSV, PDF, API access | Low |

**European Requirements:**
- **Sweden**: SKR (Swedish Association of Local Authorities and Regions) quality registers
- **UK**: CQC (Care Quality Commission) reporting requirements
- **Germany**: QS (Quality Assurance) reports for hospitals

---

## 2. Technical Components Required

### 2.1 Multi-Tenant Architecture

**Design Principles:**
- **Logical separation**: Shared infrastructure, isolated data
- **Regional data residency**: EU-only data centers (GDPR requirement)
- **Customization per tenant**: Configurable workflows, templates
- **Scalable infrastructure**: Auto-scaling for peak loads (Monday mornings)

**Architecture Patterns:**
```
┌─────────────────────────────────────────────────────────┐
│                    Load Balancer                         │
├─────────────────────────────────────────────────────────┤
│  App Tier (Stateless, Auto-scaling)                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  │ API      │ │ Workflow │ │ Doc      │ │ Billing  │    │
│  │ Gateway  │ │ Engine   │ │ Service  │ │ Service  │    │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘    │
├─────────────────────────────────────────────────────────┤
│  Data Tier (Tenant-Isolated)                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                 │
│  │ Postgres │ │ Object   │ │ Search   │                 │
│  │ (per-tenant schema)    │ (Elastic) │                 │
│  └──────────┘ └──────────┘ └──────────┘                 │
└─────────────────────────────────────────────────────────┘
```

**Complexity**: Very High
**Effort**: 12-24 months for robust multi-tenancy

---

### 2.2 Role-Based Access Control (RBAC)

**Essential Roles:**
| Role | Access Level |
|------|--------------|
| Physician | Full clinical access, sign notes |
| Nurse | Clinical access, limited ordering |
| Receptionist | Scheduling, demographics, no clinical notes |
| Biller | Financial data, no clinical details |
| Administrator | System config, user management |
| Patient | Own records via patient portal |

**Advanced Features:**
- **Break-the-glass**: Emergency access override with audit
- **Time-based access**: Shift-based permissions
- **Data masking**: Partial record access for sensitive data
- **Delegation**: Temporary access transfer during leave

**Standards:**
- XACML for policy definition
- SAML/OAuth 2.0 for federated identity
- SITHS (Sweden) smart card authentication

---

### 2.3 Audit Logging (Compliance Requirement)

**Regulatory Requirements:**
| Regulation | Requirement |
|------------|-------------|
| GDPR | Right to access, data portability, breach notification |
| HIPAA | 6-year audit log retention |
| Patient Data Act (SE) | Access logging, consent tracking |
| Caldicott Principles (UK) | Minimum necessary access |

**Audit Events:**
- Patient record access (view, edit, delete)
- Login/logout, failed authentication
- Data export, print, email
- Permission changes
- Configuration modifications

**Technical Implementation:**
- Immutable audit logs (append-only storage)
- Tamper-evident (cryptographic hashing)
- Retention: 7-10 years minimum
- Real-time alerting for suspicious activity

---

### 2.4 Document Storage (Scans, PDFs, Images)

**Requirements:**
| Feature | Specification |
|---------|---------------|
| File types | PDF, JPEG, PNG, DICOM, HL7 CDA |
| Storage | Object storage (S3-compatible) with encryption |
| Versioning | Document version history |
| Metadata | Patient ID, encounter, document type, date |
| Retrieval | Sub-second access, thumbnail previews |
| Retention | Country-specific (often 10+ years) |

**Integration:**
- PACS (Picture Archiving and Communication System) for radiology
- Lab result import (ORU^R01 HL7 messages)
- Document scanning with OCR

---

### 2.5 Mobile Access (iOS/Android Apps)

**Features:**
| Capability | Description |
|------------|-------------|
| Native apps | iOS/Android with offline support |
| Secure messaging | Provider-patient communication |
| Push notifications | Appointment reminders, results available |
| Camera integration | Photo documentation, ID scanning |
| Biometric auth | Face ID, Touch ID for quick access |

**Compliance:**
- MDM (Mobile Device Management) support
- Remote wipe capability
- Certificate-based authentication
- No local data storage (or encrypted)

---

### 2.6 Offline Mode (For Unstable Connections)

**Architecture Pattern: Offline-First**

| Component | Strategy |
|-----------|----------|
| Data sync | Conflict-free replicated data types (CRDTs) |
| Storage | Encrypted SQLite on device |
| Sync policy | Last-write-wins or manual resolution |
| Scope | Download patient list, recent encounters |

**Use Cases:**
- Home care visits in rural areas
- Emergency situations with network outage
- Mobile clinics

**Reference:** SmartCare Anywhere, OpenMRS offline modules

---

## 3. Integration Requirements

### 3.1 National EHR Systems

#### Sweden

| System | Purpose | Integration Type |
|--------|---------|------------------|
| **NPÖ** (Nationell Patientöversikt) | Cross-region patient summary aggregation | Federation via SITHS auth |
| **Inera** | National eHealth services platform | API gateway, SAML |
| **1177 Journal** | Patient access to records | FHIR-based sync |
| **FASS** | Drug information database | REST API |
| **NLL** (Nationella läkemedelslistan) | National medication list | FHIR MedicationStatement |

**Technical Requirements:**
- SITHS smart card or BankID authentication
- RIV-TA (Regional Interoperability Vocabulary) web services
- HL7 CDA for document exchange
- Transition to HL7 FHIR (ongoing)

**Key Player:** Inera AB (owned by regions)

---

#### United Kingdom

| System | Purpose | Integration Type |
|--------|---------|------------------|
| **NHS Spine** | National demographic, summary care records | Spine Mini Services |
| **GP Connect** | GP record sharing across practices | FHIR API |
| **PDS** (Personal Demographics Service) | National patient index | LDAP/SOAP |
| **NHS e-Referral** | Referral management | Web service |
| **Summary Care Records** | Medications, allergies, adverse reactions | HL7 v3 |

**Technical Requirements:**
- NHS Smartcard authentication
- Spine Directory Service (SDS) lookup
- Role-based access via RBAC codes
- IG (Information Governance) compliance

**Regulatory:** DCB0129 clinical safety standard (see Section 5)

---

#### Germany

| System | Purpose | Integration Type |
|--------|---------|------------------|
| **Telematikinfrastruktur (TI)** | Secure healthcare network | gematik standards |
| **eRezept** | Electronic prescriptions | TI/FHIR |
| **ePA** (elektronische Patientenakte) | Electronic patient record | FHIR |
| **eAU** | Electronic sick notes | TI |
| **KIM** | Secure email for providers | TI |

**Technical Requirements:**
- HBA (Health Professional Card) authentication
- SMC-B (Security Module Card) for organizations
- TI connector gateway hardware/software
- gematik certification process (18+ months)

**Key Player:** gematik GmbH (federal agency)

---

### 3.2 Lab Systems (Ordering, Results)

**Workflow:**
1. Provider orders lab test in EHR
2. Order transmitted to lab (ORM^O01 HL7 v2)
3. Lab performs test
4. Results transmitted back (ORU^R01 HL7 v2)
5. Results filed in patient record
6. Provider notified

**Integration Patterns:**
- HL7 v2.x (most common)
- HL7 FHIR (emerging)
- IHE Lab profiles (LAB-1, LAB-2)

**Major Lab Vendors:**
- Roche (cobas)
- Siemens Healthineers
- Abbott

---

### 3.3 Pharmacy Systems (E-Prescribing)

**Regional Systems:**

| Region | System | Integration |
|--------|--------|-------------|
| Sweden | NLL (National Drug List), e-recept | SITHS, RIV-TA |
| UK | NHS Electronic Prescription Service | Spine |
| Germany | eRezept via TI | FHIR/gematik |

**Features:**
- Drug-drug interaction checking
- Allergy cross-reference
- Formulary checking
- Prescription routing to preferred pharmacy

---

### 3.4 Payer Systems (Claims Submission)

**Sweden:**
- Region-specific invoicing (Fakturaportalen)
- FÖS codes for procedures
- DRG for hospital stays

**UK:**
- NHS Tariff (Payment by Results)
- CQRS (Calculating Quality Reporting Service)
- SUS (Secondary Uses Service) submissions

**Germany:**
- KV (Kassenärztliche Vereinigung) claims
- GOÄ (private fee schedule)
- EBM (statutory fee schedule)

---

### 3.5 Medical Devices (Vital Signs Import)

**Device Categories:**
| Type | Data | Protocol |
|------|------|----------|
| Blood pressure monitors | Systolic/diastolic, pulse | Bluetooth HL7/FHIR |
| Glucometers | Blood glucose readings | BLE, USB |
| Pulse oximeters | SpO2, heart rate | BLE |
| ECG devices | 12-lead ECG waveforms | DICOM, HL7 |
| Weight scales | Body weight | BLE |

**Standards:**
- Continua Design Guidelines (PCHA)
- IEEE 11073
- HL7 FHIR Device and Observation resources

**Cambio Device Connectivity:** Integrates medical device data directly into COSMIC

---

## 4. Regional Variations

### 4.1 Sweden

**Market Leaders:**
- **Cambio COSMIC** - Largest EHR, 10+ regions via SUSSA collaboration
- **CGM TakeCare** - Primary care focus, strong in private sector
- **Melior** - Region Skåne

**Unique Requirements:**
| Requirement | Description |
|-------------|-------------|
| Patient Data Act (PDL) | Strict consent and access controls |
| SITHS authentication | Smart card for all provider access |
| HSA catalog | Healthcare provider directory |
| 1177 patient portal | Mandatory patient access |
| Quality registers | National clinical registries |

**National Initiatives:**
- **NDI** (Nya Digitala Infrastrukturen) - Next-gen eHealth infrastructure
- **FHIR transition** - Moving from RIV-TA to FHIR APIs

---

### 4.2 United Kingdom

**Market Leaders:**
- **EMIS Web** - Largest GP system
- **TPP SystmOne** - Major GP/hospital system
- **Epic** - Hospital trusts
- **Cerner** - Hospital trusts

**Unique Requirements:**
| Requirement | Description |
|-------------|-------------|
| GP Contract | GMS/PMS contract requirements |
| DCB0129 | Clinical safety standard |
| NHS Spine | Mandatory for secondary care |
| CQC registration | Care Quality Commission oversight |

**GP Connect Mandate:** All GP systems must expose records via FHIR API

---

### 4.3 Germany

**Market Leaders:**
- **CompuGroup Medical** - Largest ambulatory system
- **Cerner** - Hospital market
- **ISIK** - Hospital information systems

**Unique Requirements:**
| Requirement | Description |
|-------------|-------------|
| Telematikinfrastruktur | Mandatory for statutory insurers |
| MDR (Medical Device Regulation) | EU-wide device classification |
| BfArM regulation | Federal institute oversight |
| KBV requirements | Statutory insurance rules |

**eRezept Timeline:**
- 2022-2024: Regional pilots
- 2025+: Nationwide rollout (mandatory)

---

### 4.4 Common Standards (All Regions)

| Standard | Purpose |
|----------|---------|
| **HL7 FHIR** | Modern REST API for health data |
| **HL7 v2** | Legacy message exchange |
| **SNOMED CT** | Clinical terminology |
| **LOINC** | Lab/observation codes |
| **ICD-10/11** | Diagnosis coding |
| **IHE profiles** | Integration patterns |

**IHE Key Profiles:**
- IHE XDS/XCA - Document sharing
- IHE ITI - Patient identity management
- IHE PCC - Patient care coordination

---

## 5. Regulatory/Compliance

### 5.1 GDPR (EU-Wide)

**Healthcare-Specific Requirements:**

| Requirement | Implementation |
|-------------|----------------|
| **Data residency** | EU-only data centers |
| **Right to access** | Patient portal data export |
| **Right to erasure** | Complex for medical records (legal hold) |
| **Breach notification** | 72-hour reporting to authority |
| **DPO** | Data Protection Officer required |
| **DPIA** | Privacy impact assessments |
| **Consent management** | Granular consent tracking |

**Special Category Data:**
Health data requires explicit consent or vital interest basis. Professional secrecy obligations apply.

---

### 5.2 Medical Device Classification (MDR)

**EU Medical Device Regulation (2017/745):**

**When EHR Software is a Medical Device:**
- Clinical decision support affecting diagnosis/treatment
- AI-based diagnostic suggestions
- Drug interaction checking (if automated intervention)
- Dosage calculations

**Classification:**
| Class | Risk Level | Examples |
|-------|------------|----------|
| Class I | Low | Patient portals, scheduling |
| Class IIa | Medium | CDS with moderate risk |
| Class IIb | High | Diagnostic AI, critical alerts |
| Class III | Very High | Life-supporting software |

**Certification Process:**
1. QMS (ISO 13485) implementation
2. Technical file preparation
3. Notified body audit (e.g., TÜV, BSI)
4. CE marking
5. Post-market surveillance

**Timeline:** 12-24 months
**Cost:** €100K-500K+

---

### 5.3 Clinical Safety Standards

#### DCB0129 (UK)

**Scope:** Clinical risk management in health IT manufacture

**Requirements:**
| Requirement | Description |
|-------------|-------------|
| Safety case | Documented safety arguments |
| Hazard log | Identified clinical risks |
| Risk mitigation | Controls for each hazard |
| Clinical safety officer | Named accountable person |
| Safety evidence | Testing, validation records |

**DCB0128:** Equivalent for NHS organizations deploying systems

**Reference:** NHS England Clinical Safety Team

---

## 6. Build Complexity

### 6.1 Generic vs Country-Specific

**Approach Comparison:**

| Approach | Pros | Cons | Timeline |
|----------|------|------|----------|
| Generic core + regional plugins | Code reuse, faster expansion | Integration complexity | 3-5 years |
| Country-specific builds | Deep local compliance | Duplicate effort, high cost | 5-7 years each |
| Acquire local players | Immediate market presence | Integration debt, cultural fit | 1-2 years post-acquisition |

**Recommended:** Generic FHIR-compliant core with regional adapter modules

---

### 6.2 Template-Based Documentation

**Design Requirements:**
- Visual template builder (drag-and-drop)
- Conditional logic (show/hide fields)
- Calculated fields (BMI, scores)
- Mandatory field enforcement
- Multi-language support

**Technical Stack:**
- JSON Schema for template definitions
- React/Vue for form rendering
- Template versioning with migration

**Complexity:** Medium-High (6-12 months)

---

### 6.3 Workflow Engine Flexibility

**Use Cases:**
- Referral routing rules
- Prior authorization workflows
- Care pathway templates
- Escalation procedures

**Engine Options:**
- Camunda BPMN
- Custom state machine
- Microsoft Power Automate (for non-critical)

**Requirements:**
- Visual workflow designer
- Audit trail for workflow actions
- Parallel/sequential tasks
- SLA monitoring

**Complexity:** High (9-18 months)

---

## 7. Competitive Moat

### 7.1 EHR Lock-In (Data Migration Costs)

**Migration Challenges:**

| Barrier | Description |
|---------|-------------|
| **Data volume** | Years of clinical notes, images, lab results |
| **Semantic mapping** | Local codes → standard terminologies |
| **Downtime risk** | Business continuity during migration |
| **User retraining** | Significant productivity loss |
| **Integration rework** | Rebuild all lab/pharmacy connections |

**Typical Migration Cost:** €500K-2M per organization
**Timeline:** 12-24 months for large hospital

**Strategic Implication:** High switching costs create vendor lock-in. New entrants must offer compelling ROI to justify migration.

---

### 7.2 Integration Depth

**Moat Factors:**

| Integration Type | Lock-In Strength |
|------------------|------------------|
| Lab interfaces | Medium (standards-based) |
| National EHR (NPÖ, Spine) | High (certification required) |
| Pharmacy e-prescribing | Very High (regulatory mandate) |
| Billing/invoicing | High (revenue impact) |
| Medical devices | Medium |

**Certification Barriers:**
- Sweden: Inera certification (6-12 months)
- UK: NHS Spine connection (12-18 months)
- Germany: gematik TI certification (18-24 months)

---

### 7.3 User Training Investment

**Training Costs:**

| Role | Training Hours | Productivity Loss |
|------|----------------|-------------------|
| Physician | 20-40 hours | 20-30% for 3 months |
| Nurse | 15-30 hours | 15-25% for 2 months |
| Receptionist | 10-20 hours | 10-15% for 1 month |

**Organizational Change:**
- Workflow redesign
- Super-user programs
- Ongoing support staff
- Update training for new features

**Total Cost:** €200-500K for 100-provider organization

---

## 8. Target Vendors Analysis

### 8.1 Cambio Healthcare Systems (Sweden)

**Profile:**
- Founded: 1993
- HQ: Linköping, Sweden
- Market: Nordic region leader
- Product: COSMIC EHR, VIVA (municipal care)

**Key Features:**
- Unified patient record across care continuum
- NPÖ integration
- AI documentation (2025+)
- Device connectivity
- Clinical decision support

**Strengths:**
- Dominant Swedish market position
- Deep regional integrations
- SUSSA collaboration (10+ regions)
- Mature product, regulatory compliance

**Weaknesses:**
- Nordic-focused, limited international presence
- Legacy codebase challenges
- High customization costs for new markets

---

### 8.2 CompuGroup Medical (Germany/International)

**Profile:**
- Founded: 1975
- HQ: Koblenz, Germany
- Market: DACH region, international
- Products: TakeCare, CGM Enterprise, ELVI

**Key Features:**
- Ambulatory care focus
- Telematikinfrastruktur certified
- Video consultations (ELVI)
- Multi-country deployments

**Strengths:**
- German market leader
- Public company (financial stability)
- Broad product portfolio
- International footprint

**Weaknesses:**
- Complex product line
- Integration across acquired systems
- Competition from Epic/Cerner in hospitals

---

### 8.3 Nabla (France/US)

**Profile:**
- Founded: 2021
- HQ: Paris, France
- Product: AI clinical documentation copilot
- Focus: Ambient clinical voice

**Key Features:**
- Real-time encounter transcription
- Auto-generated clinical notes
- Multi-specialty templates
- EHR integration (iFrame, API)
- No audio storage (privacy-first)

**Strengths:**
- Best-in-class AI documentation
- Rapid adoption (low friction)
- HIPAA/GDPR compliant
- Modern tech stack

**Weaknesses:**
- Not a full EHR (complementary tool)
- Subscription pricing (recurring cost)
- Reliance on third-party EHRs
- AI accuracy concerns

**Use Case:** Best as AI layer over existing EHR, not EHR replacement

---

### 8.4 Syntax (Clarification)

**Note:** "Syntax" in healthcare typically refers to:
- **Arden Syntax**: HL7 standard for clinical decision support rules
- Not a major EHR vendor in European markets

**Arden Syntax:**
- Medical Logic Modules (MLMs) for CDS
- Knowledge representation format
- Used within EHRs for alert logic

---

## 9. Build vs Buy Analysis

### 9.1 Time-to-Market Estimates

| Scope | Timeline | Investment |
|-------|----------|------------|
| Basic practice management | 12-18 months | €2-5M |
| Full EHR (single country) | 36-60 months | €15-30M |
| Multi-country EHR | 60-84 months | €40-80M |
| EHR + AI documentation | 84-120 months | €60-100M |

### 9.2 Critical Path Items

1. **MDR certification** (12-24 months, parallel track)
2. **National EHR integration** (6-18 months per country)
3. **Billing/claims compliance** (6-12 months per country)
4. **Clinical content library** (ongoing, 24+ months for baseline)

### 9.3 Recommended Strategy

**For New Entrants:**
1. Start with **practice management** (scheduling, billing) - avoid medical device classification
2. Add **AI documentation** as differentiator (partner with Nabla or build)
3. Target **underserved specialties** (mental health, veterinary, dentistry)
4. Focus on **one country** initially - depth over breadth
5. Pursue **MDR certification** early if CDS features planned

**For Acquisition Strategy:**
- Acquire mid-tier regional player
- Modernize tech stack
- Expand to adjacent markets

---

## 10. Conclusion

### Key Takeaways

1. **EHR market is highly regulated** - MDR, GDPR, national standards create significant barriers
2. **Regional integrations are critical moats** - 12-24 month certification processes favor incumbents
3. **AI documentation is the battleground** - Nabla represents new category of AI-first tools
4. **Data migration costs are massive** - €500K-2M per organization, creating lock-in
5. **Multi-country strategy is complex** - Each market requires 3-5 years of localization

### Competitive Positioning

| Player | Moat Strength | Threat Level |
|--------|---------------|--------------|
| Cambio | Very High (Sweden) | Low |
| CGM | High (DACH) | Low-Medium |
| Nabla | Medium (AI) | High (disruptive) |
| Epic/Cerner | Very High (US) | Medium (EU expansion) |

### Market Opportunity

- **Best entry point**: AI-powered documentation overlay for existing EHRs
- **Avoid**: Building full EHR from scratch (10+ year journey)
- **Consider**: Niche specialties or geographic gaps

---

*Analysis compiled March 2026*
*Sources: Company websites, regulatory documents, industry reports, technical standards*
