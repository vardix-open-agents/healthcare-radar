# Capability Analysis: Telehealth / Video Consultation

**Target Platforms:** Mindler, Kry/Livi, Push Doctor
**Analysis Date:** 2026-03-15

---

## Executive Summary

Building a telehealth/video consultation platform requires coordinating **three distinct capability domains**:

1. **Technical Infrastructure** — WebRTC video, real-time communication, recording, mobile/web apps
2. **Regulatory/Compliance** — Medical device classification (EU MDR), data protection (GDPR/HIPAA), cross-border licensing
3. **Operational** — Provider credentialing, prescription handling, EHR integration, patient intake workflows

**Key Finding:** The "buy" decision for video infrastructure is overwhelming for most entrants. Build WebRTC from scratch only if video quality is your core differentiator and you have 4-6 dedicated WebRTC specialists. Otherwise, platforms like Daily.co, LiveKit, or Stream Video reduce time-to-market from 6-18 months to days/weeks.

---

## 1. Core Functionality

### 1.1 Video Consultation Flow

| Phase | Features | Complexity |
|-------|----------|------------|
| **Booking** | Provider availability calendar, time zone handling, appointment types (video/chat/async), queue management, reminder notifications | Medium |
| **Pre-Call** | Patient intake forms, consent capture, symptom questionnaires, insurance verification, device/camera testing | Medium |
| **Call** | 1:1 video, screen sharing, chat within call, file/image sharing, waiting room, provider controls (mute/end), network quality indicators | High |
| **During Call** | Real-time notes, AI transcription/summarization, clinical decision support, prescription drafting | High |
| **Post-Call** | Consultation summary generation, prescription issuance, referral letters, follow-up scheduling, patient satisfaction survey | Medium |
| **Documentation** | SOAP notes, CPT/ICD coding, automatic sync to EHR, billing integration | High |

**Mindler (Mental Health Focus):**
- Specializes in video therapy/psychology sessions
- ~100 SEK/visit subsidized in Sweden
- Pure video consultation model
- Strong documentation templates for mental health

**Kry/Livi (Primary Care):**
- Video + chat-based consultations
- Prescription handling
- Lab referral integration
- Multi-country presence (Sweden, Norway, UK, Germany, France)

**Push Doctor (UK NHS Partner):**
- NHS and private patient access
- GP video consultations
- Prescription services
- Integrated with UK healthcare system

### 1.2 Provider Scheduling & Availability

**Capabilities Required:**
- **Availability Management:** Set working hours, blocked times, vacation scheduling
- **Multi-provider Routing:** Round-robin, specialty-based, patient preference
- **Buffer Times:** Configurable gaps between appointments
- **Overbooking Controls:** Maximum daily appointments per provider
- **Time Zone Support:** Critical for cross-border operations
- **On-Call/Rota Systems:** For urgent care models

**Technical Complexity:** Medium
- Calendar systems (Google Calendar, Outlook integration)
- Real-time availability sync
- Conflict resolution

### 1.3 Patient Intake & Onboarding

**Flow Components:**
1. **Account Creation:** Email/phone verification, SSO options
2. **Identity Verification:** Photo ID upload, video KYC (varies by jurisdiction)
3. **Medical History:** Structured questionnaires, file uploads
4. **Insurance/Payment:** Insurance card capture, payment method setup
5. **Consent Forms:** Digital signature, video recording consent, data processing consent

**Compliance Note:** GDPR requires explicit consent for recording. HIPAA requires Business Associate Agreements (BAAs) for all vendors handling PHI.

### 1.4 Documentation During/After Calls

| Feature | Purpose | Integration Need |
|---------|---------|------------------|
| Real-time transcription | Accessibility, record-keeping | ASR API (Whisper, Google, AWS Transcribe Medical) |
| AI scribe/summarization | Reduce provider documentation burden | LLM integration (HIPAA-compliant) |
| Structured templates | SOAP notes, specialty forms | Custom or adapted from EHR |
| Voice dictation | Hands-free documentation | Medical speech recognition |
| Automatic coding | CPT/ICD suggestion | Billing system integration |

---

## 2. Technical Components Required

### 2.1 WebRTC Implementation: Build vs Buy

**Critical Decision:** This is the single most consequential technical choice.

#### 2.1.1 Market Landscape (2026)

| Platform | Free Tier | Video $/min | Max Participants | Self-Host | HIPAA |
|----------|-----------|-------------|------------------|-----------|-------|
| Daily.co | 10K min/mo | $0.004 | 200 | No | Yes ($500/mo) |
| LiveKit | 5K min/mo | $0.0005 | 100K | Yes | Yes (Scale tier) |
| Agora | 10K min/mo | $0.00399 | 10K+ | No | Yes |
| Amazon Chime | Pay-as-go | $0.0017 | 250 | No | Yes |
| Twilio | Trial only | $0.004 | 50 | No | Yes |
| Whereby | 2K min/mo | $0.004 | 200 | No | Yes |
| Jitsi | Unlimited | Free | Unlimited | Yes | Self-managed |

#### 2.1.2 Recommendations by Use Case

| Use Case | Best Choice | Runner-Up | Rationale |
|----------|-------------|-----------|-----------|
| **1:1 Video Calls** | Daily.co | Twilio | Simple, reliable, fast integration |
| **Telehealth (HIPAA)** | Daily.co | LiveKit, 100ms | HIPAA compliance included |
| **AI Voice Agents** | LiveKit | Agora | Best AI/agent framework |
| **Self-Hosted Control** | LiveKit, Jitsi | — | Open source, data sovereignty |
| **Budget $0** | Jitsi | LiveKit free tier | Free but requires DevOps |

#### 2.1.3 Build vs Buy: Cost Analysis

**Scenario: Telehealth Platform (50K MAU, 30-min 1:1 calls)**

| Dimension | Build In-House | Buy (Stream/Daily) |
|-----------|----------------|-------------------|
| **3-Year Total Cost** | $2.0M - $3.3M | $798K - $1.37M |
| **Time to First Call** | 3-6 months | Days to weeks |
| **Time to Production-Grade** | 12-18 months | Days to weeks |
| **Dedicated Engineers** | 4.5-8 | 1-2 |
| **Recording** | Separate infrastructure project | Included (~$6/1K call min) |
| **AI Features (noise cancellation, blur)** | Dedicated ML team required | Included |
| **Cross-Platform SDKs** | Build per platform | React, React Native, iOS, Android, Flutter |
| **HIPAA Compliance** | Your responsibility | Included (enterprise) |

**Key Insight:** Infrastructure costs are not the driver — engineering headcount is. Even with AI-assisted development, you need 4-8 engineers to build and 3-5 permanently for maintenance.

#### 2.1.4 When to Build

Consider building only if:
- Video quality/customization is your primary competitive advantage
- You have 3+ WebRTC specialists on staff today
- You're prepared to staff a permanent 4-5 person video infrastructure team
- You need capabilities no existing API provides

### 2.2 Real-Time Communication Infrastructure

**Components Required (if building):**

1. **Signaling Server**
   - Handles session negotiation
   - WebSocket-based
   - Cost: ~$50-100/month (small EC2 instance)

2. **STUN/TURN Servers**
   - ~20-25% of connections require TURN relay
   - coturn (self-hosted) or Cloudflare TURN ($0.05/GB)
   - Global coverage needed for reliability

3. **SFU (Selective Forwarding Unit)**
   - Required for >2 participants
   - Jitsi Videobridge, LiveKit, mediasoup
   - Scales with concurrent users

4. **Recording Pipeline**
   - Server-side recording (composite or individual)
   - Storage + CDN costs scale with usage
   - ~1GB per hour of recorded video

### 2.3 Recording & Storage

**Requirements:**
- **Consent Capture:** Explicit opt-in before recording starts (GDPR/HIPAA)
- **Retention Policies:** Define storage duration, automatic deletion
- **Access Controls:** Role-based access to recordings
- **Encryption:** At rest and in transit
- **Audit Logging:** Who accessed what, when

**Storage Estimates:**
- 1-hour 720p recording: ~1GB
- 1000 recorded sessions/month × 30 min: ~500GB/month
- Annual storage: ~6TB + archival

### 2.4 Mobile Apps vs Web-Only

| Approach | Pros | Cons |
|----------|------|------|
| **Web-Only (PWA)** | Fastest development, no app store, instant updates | Limited push notifications, camera access limitations on some browsers |
| **Native iOS/Android** | Best performance, full hardware access, push notifications | 2x development effort, app store approval delays |
| **Cross-Platform (React Native, Flutter)** | Single codebase, near-native performance | Dependency on third-party SDKs, some platform-specific workarounds |

**Recommendation:** Start with cross-platform (React Native or Flutter) with a PWA fallback. Native development only if performance/regulation demands it.

### 2.5 EHR Integration

**Standards:**
- **HL7 FHIR:** Modern RESTful standard, increasingly required
- **HL7 v2:** Legacy but still widespread
- **CDA/CCD:** Clinical document exchange

**Integration Points:**
- Patient demographics sync
- Medication lists
- Allergy information
- Lab results
- Consultation notes (write-back)
- Prescription transmission

**Complexity:** High
- Each EHR has proprietary extensions
- Regional/national systems vary (UK NHS vs Swedish NPO vs US Epic)
- Requires BAA/data processing agreements

---

## 3. Operational Components

### 3.1 Provider Credentialing

**Process:**
1. **Identity Verification:** Government ID, medical license verification
2. **License Validation:** Primary source verification via national databases
3. **Background Checks:** Criminal, malpractice history
4. **Specialty Certification:** Board certification verification
5. **Ongoing Monitoring:** License status changes, disciplinary actions

**Services:**
- Professional verification APIs (e.g., LexisNexis, VerityStream)
- National databases (GMC in UK, NPI in US, IVO in Sweden)

**Timeline:** 30-90 days per provider (can be parallelized)

### 3.2 Licensing by Jurisdiction

**Challenge:** Healthcare providers can typically only practice where licensed.

| Region | Licensing Body | Cross-Border Rules |
|--------|----------------|-------------------|
| **EU/EEA** | National medical boards | Some mutual recognition under EU directives (limited for telehealth) |
| **UK** | GMC | Separate from EU post-Brexit |
| **US** | State medical boards | State-by-state licensing (interstate compacts exist) |
| **Sweden** | IVO (Inspektionen för vård och omsorg) | National licensing required |

**Strategic Implication:** Regional licensing creates natural moats. Multi-country expansion requires local provider networks.

### 3.3 Prescription Handling

**Requirements:**
- **E-Prescription Integration:** Connect to national prescription systems
- **Drug Interaction Checking:** Real-time alerts via drug databases
- **Controlled Substance Rules:** Stricter verification, special licenses
- **Pharmacy Network:** Direct transmission or printable prescriptions

**EU ePrescription Guidelines (2022):**
- EU-wide cross-border ePrescription framework emerging
- Technical specifications for interoperability defined
- Implementation varies by country

### 3.4 Referral Workflows

**Components:**
- Referral letter generation
- Specialist directory/search
- Appointment booking with receiving provider
- Shared care records
- Back-referral/consultation report

**Integration:** Often requires connection to regional/national referral systems.

---

## 4. Regulatory/Compliance

### 4.1 GDPR for Recordings (EU)

**Key Requirements:**
1. **Lawful Basis:** Consent or legitimate interest (consent preferred for recordings)
2. **Data Minimization:** Only record what's necessary
3. **Purpose Limitation:** Recording only for specified purposes
4. **Retention Limits:** Define and enforce deletion timelines
5. **Subject Rights:** Patients can access, delete (right to erasure), or port their data
6. **DPIA:** Data Protection Impact Assessment required for health data processing

**Video-Specific Considerations:**
- Biometric data (face, voice) = special category data
- Requires explicit consent (not just "legitimate interest")
- Cross-border transfers need appropriate safeguards

### 4.2 Medical Device Classification (EU MDR)

**Critical Question:** Is video consultation software a medical device?

**Answer:** Depends on intended purpose.

| Software Type | Classification | Regulatory Path |
|--------------|----------------|-----------------|
| **Administrative (scheduling, billing)** | Not a medical device | None |
| **Video only (communication)** | Generally not a medical device | None (verify with legal) |
| **Clinical decision support** | Likely Class IIa or higher | Notified Body required |
| **Diagnostic AI/ML** | Likely Class IIb or III | Full MDR pathway |
| **Prescription/monitoring** | Case-by-case, often Class IIa | Notified Body may be required |

**MDR Rule 11 (Software Classification):**
- **Class III:** Information for diagnosis/therapy of life-threatening conditions
- **Class IIb:** Information for diagnosis/therapy of serious conditions
- **Class IIa:** Information for diagnosis/monitoring (lower risk)
- **Class I:** Administrative only

**Key Standards for SaMD (if applicable):**
- IEC 62304: Software lifecycle processes
- ISO 13485: Quality management system
- ISO 14971: Risk management
- IEC 62366: Usability engineering

**Timeline for MDR Compliance:** 12-24 months for Class IIa, 18-36 months for Class IIb/III

**Recommendation:** Structure offering to avoid medical device classification where possible (position as communication tool, not diagnostic). If clinical features are added, budget for regulatory pathway.

### 4.3 HIPAA Compliance (US Market)

**Requirements:**
- **BAA:** Business Associate Agreement with all vendors handling PHI
- **Encryption:** At rest and in transit
- **Access Controls:** Role-based, audit logging
- **Breach Notification:** 60-day notification requirement
- **Physical/Technical Safeguards:** Documented security measures

**Platform Selection:** Ensure video API vendor offers HIPAA-compliant tier with signed BAA.

### 4.4 Cross-Border Practice Rules

**EU Context:**
- Professional qualifications directive allows some mobility
- Telehealth-specific rules still evolving
- Country of provider vs country of patient creates complexity
- Some countries require local establishment

**UK Post-Brexit:**
- Separate regulatory regime from EU
- GMC registration required for UK practice
- Data transfer agreements needed for EU data

---

## 5. Business Model Variations

### 5.1 B2B (Sell to Clinics/Healthcare Systems)

**Model:** Sell telehealth platform to healthcare organizations.

**Revenue Streams:**
- Software licensing fees (per seat or per organization)
- Monthly/annual SaaS subscription
- Implementation/setup fees
- Custom development services

**Pros:**
- Long-term contracts (predictable revenue)
- High LTV per customer
- Deep integration creates stickiness
- Lower customer acquisition cost (fewer, larger customers)

**Cons:**
- Long sales cycles (6-18 months)
- High implementation complexity
- EHR integration requirements
- Feature demands vary by customer

### 5.2 B2C (Direct to Patients)

**Model:** Offer video consultations directly to consumers.

**Revenue Streams:**
- Per-consultation fees
- Monthly/annual subscriptions
- Insurance reimbursement (if credentialed)

**Pros:**
- Fast market entry
- Brand building
- Price flexibility
- Direct patient relationship

**Cons:**
- High customer acquisition costs
- Competitive market (Teladoc, Amwell, etc.)
- Need own provider network
- Insurance credentialing complexity

### 5.3 Marketplace Model (Matching)

**Model:** Platform connecting patients to independent providers.

**Revenue Streams:**
- Transaction fees (10-30% of consultation fee)
- Provider subscription (pay to be listed)
- Premium placement/listings

**Pros:**
- Asset-light (no employment of providers)
- Scalable (platform economics)
- Provider variety attracts patients

**Cons:**
- Quality control across providers
- Regulatory complexity (provider vs platform liability)
- Provider network effects take time

### 5.4 Hybrid Models

Most successful platforms combine elements:
- **Kry/Livi:** B2C + B2B (partners with health systems)
- **Mindler:** B2C + public sector contracts
- **Push Doctor:** B2C + NHS partnerships

**Recommendation:** Start with clear focus (B2B or B2C), add second model once initial segment is established.

### 5.5 Pricing Structures

| Model | Use Case | Price Range |
|-------|----------|-------------|
| **Per Consultation** | B2C urgent care | $30-80 per visit |
| **Subscription (Patient)** | Chronic care, mental health | $10-50/month |
| **SaaS (Provider)** | B2B clinic platform | $100-500/provider/month |
| **Enterprise License** | Health systems | $10K-100K+/year |

---

## 6. Build vs Buy Analysis

### 6.1 Video Infrastructure

**Strong Recommendation: BUY**

| Factor | Recommendation | Rationale |
|--------|----------------|-----------|
| **Time to Market** | Buy | 3-6 months vs days/weeks |
| **Cost (3-year)** | Buy | $798K-$1.37M vs $2.0M-$3.3M |
| **Reliability** | Buy | Battle-tested infrastructure |
| **AI Features** | Buy | Included vs building ML team |
| **Compliance** | Buy | HIPAA/GDPR handled |
| **Ongoing Maintenance** | Buy | Vendor handles browser updates, codecs |

**Best Platforms for Telehealth:**
1. **Daily.co** — Best overall for HIPAA apps, developer experience
2. **LiveKit** — Best for AI features, self-hosting option
3. **100ms** — Good for templated use cases
4. **Stream Video** — Excellent if already using Stream Chat

### 6.2 Patient/Provider Apps

**Recommendation: Build (with frameworks)**

| Component | Approach | Rationale |
|-----------|----------|-----------|
| **Patient App** | React Native or Flutter | Cross-platform, health tech friendly |
| **Provider Dashboard** | React/Vue web app | Complex workflows need web flexibility |
| **Admin Panel** | Build or buy (Retool, Forest Admin) | Internal tool, buy if possible |

### 6.3 EHR Integration

**Recommendation: Start with API, build deep integration over time**

| Phase | Approach | Timeline |
|-------|----------|----------|
| **MVP** | Manual data entry, PDF export | 0-3 months |
| **Phase 2** | FHIR-based read (patient demographics) | 3-6 months |
| **Phase 3** | FHIR write-back (notes, prescriptions) | 6-12 months |
| **Deep Integration** | Legacy HL7, custom per EHR | 12-24 months |

### 6.4 Timeline Estimates

**MVP Telehealth Platform:**

| Component | Build Time (Buy Video) | Build Time (Build Video) |
|-----------|------------------------|--------------------------|
| Video Integration | 2-4 weeks | 6-9 months |
| Booking System | 4-6 weeks | 4-6 weeks |
| Patient Intake | 2-4 weeks | 2-4 weeks |
| Provider Dashboard | 6-8 weeks | 6-8 weeks |
| Basic EHR Integration | 4-8 weeks | 4-8 weeks |
| Mobile Apps | 8-12 weeks | 8-12 weeks |
| **Total MVP** | **4-6 months** | **12-18 months** |

**Full Platform (with compliance, integrations):** 12-24 months with buy approach, 24-36 months with build.

---

## 7. Competitive Moat

### 7.1 Provider Network Effects

**The Core Moat:** More providers → more availability → better patient experience → more patients → attracts more providers.

| Stage | Description | Defensive Strength |
|-------|-------------|-------------------|
| **Thin Network** | Few providers, limited availability | Weak |
| **Regional Density** | Strong in one geography/specialty | Moderate |
| **Multi-Specialty** | Broad coverage across conditions | Strong |
| **National Scale** | Thousands of providers, national coverage | Very Strong |

**Build Strategy:** Start with one specialty (e.g., mental health like Mindler) or one geography. Density beats breadth initially.

### 7.2 Regional Licensing Moats

**Structural Barrier:** Medical licensing is jurisdiction-specific.

| Market | Barrier Level | Implication |
|--------|--------------|-------------|
| **Single Country (e.g., Sweden)** | Moderate | Fast to establish, but limited market |
| **EU Multi-Country** | High | License per country, local providers needed |
| **US** | Very High | State-by-state licensing (50 barriers) |
| **UK** | Moderate | Single market post-Brexit |

**Defensive Position:** Regional players have natural moats against global entrants. Cross-border expansion is hard.

### 7.3 EHR Integration Depth

**Integration as Moat:** Deep EHR integration takes years but creates significant stickiness.

| Integration Level | Effort | Lock-In |
|-------------------|--------|---------|
| **None (standalone)** | None | None |
| **Export (PDF, CDA)** | Low | Low |
| **FHIR Read** | Medium | Low-Medium |
| **FHIR Read/Write** | High | Medium |
| **Custom per EHR** | Very High | High |
| **Embedded in EHR workflow** | Extreme | Very High |

**Strategy:** For B2B, EHR integration is table stakes. Depth of integration is a differentiator.

### 7.4 Summary: Moat Building Priorities

| Priority | Moat Type | Time to Build | Investment |
|----------|-----------|---------------|------------|
| 1 | Provider network (specialty/region) | 12-24 months | Medium |
| 2 | Regional licensing/relationships | 6-18 months | Low-Medium |
| 3 | EHR integration depth | 12-36 months | High |
| 4 | Brand/patient trust | 24-48 months | High |
| 5 | Proprietary technology | Variable | Very High |

**Recommendation:** Focus on provider network density in one vertical/region first. EHR integration follows B2B customer wins. Technology is rarely the moat — operations and relationships are.

---

## Appendix A: Platform Comparison Summary

| Platform | Primary Markets | Model | Specialty Focus | Key Differentiator |
|----------|----------------|-------|-----------------|-------------------|
| **Mindler** | Sweden, UK, Norway | B2C + B2B | Mental health | Psychology video consultations |
| **Kry/Livi** | Sweden, Norway, UK, Germany, France | B2C + B2B | Primary care | Multi-country, chat + video |
| **Push Doctor** | UK | B2C (NHS + Private) | GP consultations | NHS integration |

## Appendix B: Technology Vendor Shortlist

| Category | Vendor | Notes |
|----------|--------|-------|
| **Video API** | Daily.co, LiveKit, Stream | HIPAA-compliant, fast integration |
| **EHR Integration** | Redox, 1upHealth | FHIR API gateways |
| **E-Prescription** | DrFirst (US), various national systems | Region-specific |
| **Provider Verification** | LexisNexis, Credsy | US-focused |
| **Transcription** | AWS Transcribe Medical, Deepgram | HIPAA options available |
| **AI Scribe** | Nuance DAX, Abridge | Ambient clinical documentation |

## Appendix C: Regulatory Contacts

| Jurisdiction | Authority | Website |
|--------------|-----------|---------|
| **EU (MDR)** | Notified Bodies (BSI, TÜV, DEKRA) | Various |
| **UK** | MHRA | gov.uk/mhra |
| **Sweden** | IVO, Läkemedelsverket | ivo.se, lakemedelsverket.se |
| **US** | FDA (SaMD), HHS (HIPAA) | fda.gov, hhs.gov |

---

## Conclusion

Building a telehealth platform is **operationally complex** more than **technically novel**. The key decisions:

1. **Video Infrastructure:** Buy (Daily.co, LiveKit, or Stream). Building is 3x more expensive and 5x slower.

2. **Regulatory Path:** Position as communication tool to avoid SaMD classification initially. Add clinical features only when justified by market need.

3. **Business Model:** Choose B2B OR B2C for MVP. Hybrid comes after product-market fit.

4. **Geographic Strategy:** Win one region/specialty before expanding. Licensing moats favor regional depth.

5. **Competitive Moat:** Provider network density > technology. Focus on recruitment, retention, and quality.

**Estimated Total Investment (to MVP):**
- **With video API:** $500K-800K, 4-6 months
- **Building video:** $1.5M-2.5M, 12-18 months

**Recommendation:** Start with video API, focus engineering on patient/provider experience and EHR integration. Re-evaluate build vs buy for video only at 100K+ monthly consultations.
