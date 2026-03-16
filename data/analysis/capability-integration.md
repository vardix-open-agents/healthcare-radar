# Capability Analysis: EHR Integration / Interoperability

> Deep-dive into capabilities required for cross-system integration in healthcare digital products.

**Last Updated:** March 2026
**Status:** Research Complete

---

## Executive Summary

EHR integration and interoperability represent one of the most technically complex and strategically valuable capabilities for healthcare SaaS products. The ability to exchange data seamlessly with national health systems, existing EHR platforms, and clinical workflows creates significant competitive moats due to:

1. **Technical complexity** - Multiple standards, legacy systems, and regional variations
2. **Regulatory barriers** - Certification requirements and compliance obligations
3. **Trust relationships** - Long sales cycles with national health bodies and health systems
4. **Ongoing maintenance** - Spec changes, version support, and recertification

---

## 1. Standards & Protocols

### 1.1 HL7 FHIR (Fast Healthcare Interoperability Resources)

**What it is:** The modern RESTful standard for healthcare data exchange, developed by HL7 International. Structures data into modular "resources" (Patient, Observation, Medication, Encounter, etc.).

**Key Characteristics:**
- RESTful API design (JSON/XML support)
- Modular resource-based architecture
- Strong tooling ecosystem (HAPI FHIR, Firely, etc.)
- Active development with R4, R4B, and R5 versions

**Adoption Status (2024-2025):**
- **US:** Mandated by 21st Century Cures Act and CMS Interoperability Rules
- **UK:** NHS Digital has adopted FHIR for GP Connect and NHS Spine
- **EU:** Core standard for European Health Data Space (EHDS)
- **Germany:** Used in eRezept and TI components

**Technical Requirements:**
- FHIR server/client implementation
- Implementation Guide (IG) compliance for national/Regional profiles
- CapabilityStatement documentation
- Bulk Data Export ($export) for population-level queries

**Strategic Notes:**
- FHIR-first architecture is recommended for new products
- Expect to support multiple FHIR versions (R4 is current baseline)
- National profiles often extend base FHIR with constraints

---

### 1.2 HL7 v2 (Version 2.x)

**What it is:** The legacy but still-prevalent message-based standard used in ~90% of US hospital integrations.

**Key Characteristics:**
- Pipe-delimited message format (ADT, ORU, SIU, etc.)
- Event-driven messaging (admissions, orders, results)
- Deeply embedded in hospital IT infrastructure
- Well-understood with mature integration patterns

**Technical Requirements:**
- HL7 v2 message parsing/serialization
- MLLP (Minimal Lower Layer Protocol) transport
- Message routing and transformation
- ACK/NACK response handling

**Strategic Notes:**
- Will not disappear for decades; essential for hospital integrations
- Transformation layer needed to bridge v2 → FHIR
- Integration engines (Rhapsody, Mirth, Corepoint) commonly used

---

### 1.3 CDA / C-CDA (Clinical Document Architecture)

**What it is:** XML-based standard for clinical documents (discharge summaries, referrals, care plans).

**Key Variants:**
- **CDA R2:** Base specification from HL7
- **C-CDA:** US Consolidated CDA (meaningful use requirements)
- **EPSOS / epSOS:** European patient summary format

**Technical Requirements:**
- XML document generation/parsing
- Template-based document validation
- XDS.b document sharing integration
- IHE cross-community access patterns

**Strategic Notes:**
- Still required for document-centric workflows
- FHIR Documents and FHIR Composition emerging as alternatives
- PDF/A + CDA common for archival requirements

---

### 1.4 DICOM (Digital Imaging and Communications in Medicine)

**What it is:** The standard for medical imaging (radiology, cardiology, pathology).

**Key Characteristics:**
- Image storage and transmission
- PACS (Picture Archiving and Communication System) integration
- IHE XDS-I (Imaging) profile for document sharing
- DICOMweb for RESTful image access

**Technical Requirements:**
- DICOM C-STORE, C-FIND, C-MOVE operations
- DICOMweb (WADO-RS, STOW-RS, QIDO-RS)
- Image metadata extraction
- Integration with VNA (Vendor Neutral Archive)

**Strategic Notes:**
- Essential for radiology, cardiology, pathology products
- DICOMweb increasingly preferred for cloud-native architectures
- IHE XDS-I integration for cross-enterprise image sharing

---

### 1.5 IHE Profiles (Integrating the Healthcare Enterprise)

**What it is:** A framework of integration profiles that define how standards are applied in real-world scenarios.

**Key Profiles for Integration:**

| Profile | Purpose | Relevance |
|---------|---------|-----------|
| **XDS.b** | Cross-Enterprise Document Sharing | National HIEs, regional exchanges |
| **XCA** | Cross-Community Access | Multi-region document queries |
| **XCPD** | Cross-Community Patient Discovery | Patient matching across systems |
| **XCDR** | Cross-Community Document Request | Document retrieval patterns |
| **PIXv3 / PDQv3** | Patient Identity Cross-Reference | Patient ID management |
| **ATNA** | Audit Trail and Node Authentication | Security logging |
| **CT / ITI** | Consistent Time / IT Infrastructure | Foundational services |

**Technical Requirements:**
- Document Repository/Registry actors
- SOAP/REST web services (IHE ITI domain)
- Affinity Domain configuration
- Audit event logging (ATNA)

**Strategic Notes:**
- IHE profiles are implementation patterns, not new standards
- Required for TEFCA (US) and many national exchanges
- Connectathon testing available for certification

---

### 1.6 OpenAPI / Modern API Specs

**What it is:** Standard API specification format for REST services, used alongside FHIR.

**Key Characteristics:**
- FHIR uses StructureDefinition + CapabilityStatement
- OpenAPI/Swagger for non-FHIR APIs
- AsyncAPI for event-driven integrations
- GraphQL emerging for flexible queries

**Strategic Notes:**
- FHIR server OpenAPI generation available (HAPI, Firely)
- Non-FHIR APIs need separate documentation
- API versioning strategy critical

---

## 2. National EHR Ecosystems

### 2.1 Sweden (Inera / NPO / NPÖ)

**Key Organizations:**
- **Inera:** Owned by Swedish regions; operates national eHealth services
- **E-hälsomyndigheten:** National eHealth authority
- **SLL (Stockholm Läns Landsting):** Regional healthcare IT

**Core Services:**

| Service | Description | Integration |
|---------|-------------|-------------|
| **NPÖ** | Nationell Patientöversikt (National Patient Overview) | Aggregated view across regions |
| **NPO** | Nationell Patientöversikt (alternate acronym) | Patient summary access |
| **NMI** | Nationellt Medicinskt Informationssystem | National medical information systems |
| **1177 Journal** | Patient-accessible health record | Patient portal integration |
| **SITHS** | Healthcare professional identity | Smart card authentication |

**Standards & Protocols:**
- FHIR adopted as primary standard (2024+)
- HL7 v2 for legacy integrations
- SAML for authentication
- HSA (Healthcare Directory) for provider lookup

**Technical Requirements:**
- SITHS certificate for professional access
- FHIR server with Swedish national profiles
- NPÖ integration for care summary access
- 1177 integration for patient access

**FHIR Adoption Status:**
- Sweden actively migrating to FHIR (2024-2025 roadmap)
- NPÖ/NPO services adopting FHIR interfaces
- National services moving from proprietary to FHIR-based APIs

---

### 2.2 United Kingdom (NHS)

**Key Organizations:**
- **NHS England:** National health service leadership
- **NHS Digital:** Technical infrastructure and APIs
- **NHSX (now merged):** Digital transformation unit

**Core Services:**

| Service | Description | Integration |
|---------|-------------|-------------|
| **NHS Spine** | National infrastructure platform | PDS, SCR, eRS |
| **GP Connect** | GP practice data access | FHIR API |
| **NHS login** | Patient identity | OAuth2/OIDC |
| **Summary Care Record (SCR)** | Emergency care summary | Document access |
| **eReferral Service (eRS)** | Referral management | API integration |

**Key Standards:**
- **FHIR STU3/R4:** GP Connect uses FHIR
- **MESH:** Message Exchange for electronic documents
- **DTAC (Digital Technology Assessment Criteria):** Compliance framework for NHS apps

**GP Connect Integration:**

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   Consumer  │────▶│  Spine Proxy │────▶│  GP System   │
│     App     │     │    (APIM)    │     │  (Provider)  │
└─────────────┘     └──────────────┘     └──────────────┘
       │                   │                    │
       └─── OAuth2/JWT ────┴─── FHIR R4 ────────┘
```

**GP Connect Capabilities:**
- Access Record: Structured (patient data)
- Access Record: HTML (rendered view)
- Appointment Management
- Task Management

**DTAC Requirements:**
1. Clinical safety (DCB0129/0160)
2. Information governance
3. Technical security
4. Interoperability
5. Usability and accessibility

**Technical Requirements:**
- NHS Spine integration (client certificate)
- GP Connect FHIR API compliance
- NHS login integration for patient apps
- MESH adapter for document exchange
- Clinical Safety Officer (CSO) sign-off

---

### 2.3 Germany (Telematikinfrastruktur)

**Key Organizations:**
- **Gematik:** Standards body for TI
- **BfArM:** Federal Institute for Drugs and Medical Devices
- **KBV:** National Association of Statutory Health Insurance Physicians

**Core Infrastructure:**

| Component | Description | Status |
|-----------|-------------|--------|
| **Telematikinfrastruktur (TI)** | Secure national network | Operational |
| **eRezept** | Electronic prescription | Mandatory 2024+ |
| **ePA** | elektronische Patientenakte (ePA) | Rolling deployment |
| **DiGA** | Digitale Gesundheitsanwendungen | Fast-track approval |

**eRezept Integration:**

The eRezept system enables end-to-end digital prescriptions:
1. Physician issues prescription in practice software
2. Prescription transmitted via TI to Fachdienst
3. Patient retrieves prescription via eRezept app
4. Pharmacy dispenses and updates status

**DiGA Integration Requirements:**
- CE marking as medical device
- BfArM approval process
- ePA integration (optional but recommended)
- Prescribable via eRezept
- Outcome tracking for reimbursement

**Technical Requirements:**
- TI connector (Konnetktor) integration
- HBA (Health Professional Card) / SMC-B certificates
- Gematik specification compliance
- eRezept Fachdienst API integration
- FHIR-based (eRezept uses FHIR)

**Certificate Management:**
- HBA (Heilberufeausweis): Healthcare professional ID
- SMC-B (Security Module Card Type B): Institution ID
- QES (Qualified Electronic Signature): For prescriptions
- CVC (Card Verifiable Certificate): Smart card authentication

**Strategic Notes:**
- TI mandatory for all statutory healthcare providers
- DiGA market offers fastest path to German market
- eRezept integration unlocks prescription workflows
- Certification process is complex (allow 6-12 months)

---

### 2.4 France (DMP / MSSanté)

**Key Organizations:**
- **ANS (Agence du Numérique en Santé):** National digital health agency
- **Assurance Maladie:** Health insurance fund
- **HAS:** High Authority for Health

**Core Services:**

| Service | Description | Status |
|---------|-------------|--------|
| **DMP** | Dossier Médical Partagé (Shared Medical Record) | Relaunched 2024 |
| **MSSanté** | Messagerie Sécurisée de Santé (Secure messaging) | Operational |
| **SESAM-Vitale** | Healthcare professional smart card | Ongoing |
| **Carte Vitale** | Patient health insurance card | Operational |
| **CI-SIS** | Cadre d'Interopérabilité des SI de Santé | Interoperability framework |

**DMP Integration:**
- Relaunch in 2024 with improved UX
- Target: widespread patient enrollment by end of 2025
- FHIR adoption increasing (CI-SIS framework)
- Mandatory for healthcare providers (with opt-out)

**Technical Requirements:**
- SESAM-Vitale card reader for professional access
- MSSanté for secure messaging
- CI-SIS compliance for interoperability
- DMP API integration

**CI-SIS Framework:**
- Defines standards for health IT interoperability
- Includes FHIR implementation guides
- Certification requirements for software
- Regular updates (check ANS website)

---

## 3. Technical Components Required

### 3.1 FHIR Server / Client

**Options:**

| Server | Type | License | Notes |
|--------|------|---------|-------|
| **HAPI FHIR** | Java | Open Source (Apache) | Most mature open source; JPA server |
| **Firely Server** | .NET | Commercial | Enterprise features; .NET ecosystem |
| **Smile CDR** | Java | Commercial | Enterprise grade; CDN for FHIR |
| **Aidbox** | Clojure | Commercial | Developer-friendly; flexible |
| **Azure Health Data Services** | Cloud | Commercial | Managed Azure FHIR service |
| **Google Cloud Healthcare API** | Cloud | Commercial | Managed GCP FHIR + DICOM |
| **AWS HealthLake** | Cloud | Commercial | Managed AWS FHIR service |

**Selection Criteria:**
- R4 / R4B / R5 support
- Bulk Data Export ($export)
- SMART on FHIR support
- National profile support
- Performance and scalability
- Support for terminology (SNOMED, LOINC, ICD)

---

### 3.2 OAuth 2.0 / SMART on FHIR

**What it is:** Authorization framework for healthcare apps, combining OAuth2 with FHIR scopes.

**SMART on FHIR Components:**
- **SMART App Launch:** Standalone and EHR launch modes
- **SMART Scopes:** Granular FHIR resource permissions
- **SMART Backend Services:** System-to-system auth
- **SMART Health Cards:** Verifiable clinical info

**Implementation Requirements:**
```
Authorization Server
├── OAuth2 endpoints (authorize, token, introspect)
├── OIDC support (id_token, userinfo)
├── SMART scopes (patient/*.read, user/*.write)
└── PKCE support (public clients)
```

**Token Claims:**
- `patient`: FHIR Patient ID
- `encounter`: Current encounter context
- `fhirUser`: User resource reference
- `scope`: Granted permissions

**National Variations:**
- **NHS login:** UK patient authentication
- **France Connect:** French national ID
- **BankID:** Swedish national ID
- **TI certificates:** German professional auth

---

### 3.3 Certificate Management

**German TI Requirements:**
- HBA (healthcare professional) certificates
- SMC-B (institution) certificates
- Konnektor certificate enrollment
- CVC (Card Verifiable Certificate) handling
- QES (Qualified Electronic Signature) for prescriptions

**General PKI Requirements:**
- TLS client certificates for HIE connections
- Code signing for application distribution
- S/MIME for secure messaging
- Certificate revocation checking (OCSP/CRL)

**Certificate Lifecycle:**
1. Certificate enrollment
2. Certificate renewal (typically 1-3 years)
3. Certificate revocation handling
4. Key/certificate backup

---

### 3.4 Message Transformation Layer

**Required Transformations:**

| From | To | Use Case |
|------|-----|----------|
| HL7 v2.x | FHIR R4 | Legacy hospital integration |
| C-CDA | FHIR | Document import/export |
| FHIR R4 | National Profiles | Country-specific mapping |
| Proprietary | FHIR | EHR vendor integration |

**Key Capabilities:**
- Message parsing/serialization
- Terminology mapping (ICD-10 → SNOMED)
- Code system transformations
- Structure mapping (v2 segments → FHIR resources)
- Validation against profiles

**Tools:**
- HAPI FHIR converters
- Firely SDK
- Rhapsody transformation engine
- Mirth Connect
- Custom mapping layers

---

### 3.5 Error Handling and Retry Logic

**Key Patterns:**
- Circuit breaker for external dependencies
- Exponential backoff for retries
- Dead letter queues for failed messages
- Compensating transactions
- Idempotency for message processing

**Monitoring Requirements:**
- Message queue depth
- Transformation error rates
- External system latency
- Certificate expiration alerts
- Audit log integrity

---

## 4. Build vs Buy Analysis

### 4.1 FHIR Servers

| Approach | Pros | Cons | Recommendation |
|----------|------|------|----------------|
| **HAPI FHIR (OSS)** | Free, mature, customizable | Self-managed, operational overhead | Good for: Technical teams, custom needs |
| **Firely Server** | Enterprise support, .NET | Licensing cost | Good for: .NET shops, enterprise needs |
| **Smile CDR** | Battle-tested, CDN features | Higher cost | Good for: Large scale, CDN features |
| **Cloud Managed** | No ops, scales automatically | Vendor lock-in, cost at scale | Good for: Fast start, cloud-native |

**Recommendation:**
- Early stage: HAPI FHIR JPA Server (open source)
- Scale: Evaluate Smile CDR or cloud managed
- Consider total cost: infrastructure + operations vs. license

---

### 4.2 Integration Platforms

| Platform | Strengths | Considerations |
|----------|-----------|----------------|
| **Rhapsody** | Healthcare-native, FHIR + HL7 v2 | Commercial license, learning curve |
| **Corepoint (Rhapsody)** | Simpler, US-focused | Less enterprise features |
| **MuleSoft** | General purpose, API management | Not healthcare-native |
| **Mirth Connect** | Open source, HL7-focused | Basic FHIR support |
| **NextGen Connect** | Open source, mature | Requires technical expertise |

**Recommendation:**
- Hospital integrations: Rhapsody/Corepoint
- Budget constrained: Mirth/NextGen Connect
- API-first: MuleSoft + FHIR server

---

### 4.3 National Adapter Services

**Emerging Options:**
- National HIE gateway services
- FHIR facade for national systems
- Pre-built adapters (consultants/vendors)

**Considerations:**
- Time-to-market vs. control
- Certification requirements
- Ongoing maintenance burden
- Customization needs

---

## 5. Ongoing Maintenance

### 5.1 Keeping Up with Spec Changes

**FHIR Version Lifecycle:**
- R4 (2019): Current production standard
- R4B (2021): Bug fixes, backward compatible
- R5 (2023): New features, some breaking changes
- R6 (expected): Under development

**Maintenance Activities:**
1. Monitor HL7 ballot cycles
2. Test against new FHIR versions
3. Update Implementation Guides
4. Adapt to national profile changes
5. Deprecation planning

---

### 5.2 Testing and Certification

**Testing Requirements:**
- FHIR validation (resource structure)
- Profile conformance (national IGs)
- Integration testing (external systems)
- Security testing (penetration testing)
- Performance testing (load testing)

**Certification Programs:**
- **US:** ONC Health IT Certification
- **UK:** DTAC compliance
- **Germany:** Gematik certification (TI)
- **France:** CI-SIS certification
- **IHE:** Connectathon testing

---

### 5.3 Support for Multiple Versions

**Version Support Matrix:**

| Component | Versions to Support | Effort |
|-----------|---------------------|--------|
| FHIR | R4, R4B, R5 | High |
| HL7 v2 | 2.3, 2.4, 2.5, 2.5.1 | Medium |
| CDA | CDA R2, C-CDA 1.1, 2.1 | Medium |
| IHE | ITI TF v7, v8 | Medium |

**Strategies:**
- Version-aware routing
- Transformation layers
- Gradual deprecation
- Customer communication plans

---

## 6. Competitive Moat

### 6.1 Why Integration Depth is Hard to Replicate

**Factors:**

1. **Cumulative Knowledge**
   - Each integration teaches edge cases
   - National profiles have subtle requirements
   - Error handling patterns emerge from experience

2. **Trust Building**
   - Healthcare organizations are risk-averse
   - Reference customers matter
   - Sales cycles are 12-24 months

3. **Regulatory Relationships**
   - Participation in standards bodies
   - Early access to spec changes
   - Influence on national profiles

4. **Operational Expertise**
   - Monitoring and debugging complex
   - On-call for critical integrations
   - Customer success stories

---

### 6.2 Certification Barriers

**Time Investment:**
- ONC certification: 3-6 months
- DTAC compliance: 2-4 months
- Gematik (TI) certification: 6-12 months
- CI-SIS certification: 3-6 months

**Ongoing Costs:**
- Annual renewal fees
- Recertification for major changes
- Audit preparation
- Compliance documentation

---

### 6.3 Trust Relationships with National Bodies

**Key Relationships:**
- HL7 International (standards)
- IHE International (profiles)
- National eHealth authorities
- Regional health systems

**Building Trust:**
- Active participation in working groups
- Contributing to open source FHIR tools
- Publishing implementation guides
- Speaking at conferences
- Case study publications

---

## 7. Implementation Roadmap

### Phase 1: Foundation (0-6 months)
- [ ] FHIR server deployment (HAPI recommended)
- [ ] SMART on FHIR authentication
- [ ] Basic HL7 v2 parsing capability
- [ ] Internal testing infrastructure

### Phase 2: First Market (6-12 months)
- [ ] National profile implementation (choose primary market)
- [ ] First HIE/EHR integration
- [ ] Certification pathway initiation
- [ ] Error handling and monitoring

### Phase 3: Multi-Market (12-24 months)
- [ ] Additional national profiles
- [ ] Message transformation layer
- [ ] Legacy system connectors
- [ ] Managed integration platform

### Phase 4: Scale (24+ months)
- [ ] API marketplace/partner ecosystem
- [ ] Self-service integration tools
- [ ] Multi-region deployment
- [ ] Integration analytics and optimization

---

## 8. Key Resources

### Standards Bodies
- [HL7 International](https://www.hl7.org/) - FHIR, CDA, v2 standards
- [IHE International](https://www.ihe.net/) - Integration profiles
- [DICOM Standards](https://www.dicomstandard.org/) - Medical imaging

### National Resources
- [Inera (Sweden)](https://www.inera.se/) - Swedish eHealth services
- [NHS Digital (UK)](https://digital.nhs.uk/) - NHS APIs and standards
- [Gematik (Germany)](https://www.gematik.de/) - TI specifications
- [ANS (France)](https://esante.gouv.fr/) - French digital health

### Open Source Tools
- [HAPI FHIR](https://hapifhir.io/) - Java FHIR implementation
- [Mirth Connect](https://www.nextgen.com/products/mirth-connect) - Integration engine
- [LinuxForHealth FHIR Server](https://github.com/LinuxForHealth/FHIR) - IBM-originated FHIR server

---

## Summary

EHR integration capability is a strategic investment that creates significant barriers to entry. Key success factors:

1. **Start with FHIR-first architecture** - FHIR is the future; design for it from day one
2. **Choose primary market carefully** - Deep integration in one market beats shallow in many
3. **Invest in transformation layers** - Legacy systems (v2, CDA) won't disappear soon
4. **Build certification into roadmap** - Plan for 6-12 month certification cycles
5. **Treat integration as product** - Not a one-time project but ongoing capability

The complexity of healthcare interoperability means that companies with established integration depth have significant competitive advantages that are difficult and time-consuming to replicate.