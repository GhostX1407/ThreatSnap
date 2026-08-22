# ThreatSnap

# ThreatSnap

Title:
ThreatSnap

Background:
A mobile-first threat intelligence platform is needed to help security analysts quickly assess and validate emerging cyber threats. Analysts often receive fragmented, unverified reports from multiple sources, requiring manual correlation and risk scoring before any action can be taken.

Problem Statement:
Cybersecurity teams face a deluge of suspicious activity alerts from diverse sources—some legitimate, others false positives. With only 6 hours to build, your team must create a mobile application that ingests raw threat data, applies AI-driven risk scoring, and generates a real-time, explainable verdict using GenAI. The system must also enforce strict security policies to prevent unauthorized access or tampering during the analysis process.

Scope:
Develop a mobile application that ingests threat data, applies AI/GenAI models for risk assessment, and enforces cybersecurity policies. The system must support threat validation with explainable outputs and secure data handling.

MVP Scope:
- Mobile app interface for threat ingestion and verdict display
- Backend API endpoint to receive threat data (mocked or via form)
- GenAI component to generate a risk explanation (e.g., 'This alert is likely a phishing attempt because...')
- AI/ML model to score the threat likelihood (e.g., 0–100 score)
- Cybersecurity layer to validate user identity and prevent tampering
- Secure storage of threat data with audit trail
- Real-time display of verdict and explanation on mobile

Advanced/Bonus Scope:
- Integrate live threat feed (e.g., VirusTotal API) for real-time validation
- Add role-based access control (RBAC) for different analyst tiers
- Implement a model drift detection mechanism for AI scoring
- Add a 'threat confidence' metric based on source reliability

Functional Requirements:
- Mobile app must allow input of threat details (e.g., URL, IP, file hash)
- Backend must accept threat data via secure API with authentication
- AI/ML model must output a risk score between 0 and 100
- GenAI must generate a human-readable explanation of the risk
- Cybersecurity module must enforce user authentication and prevent unauthorized data modification
- System must log all user actions and data changes for auditability
- Mobile app must display verdict and explanation in real time

Non-Functional Requirements:
- All components must respond within 2 seconds under load
- System must be secure against injection attacks and unauthorized access
- AI/GenAI outputs must be explainable and traceable to inputs
- Mobile app must be responsive on both Android and iOS
- All data must be encrypted in transit and at rest

Constraints:
- MVP must be fully functional within 6 hours
- No external cloud services beyond Firebase or AWS Amplify
- All AI/ML models must be pre-trained and hosted locally or via API
- No third-party authentication systems beyond basic JWT
- All GenAI prompts must be pre-defined and not require training
- Team size is fixed at 3 members

Deliverables:
- Running mobile app with threat ingestion and verdict display
- Backend API endpoint accepting threat data
- AI/ML model scoring and GenAI explanation pipeline
- Cybersecurity audit log of user actions
- Live demo video showing threat input → verdict output
