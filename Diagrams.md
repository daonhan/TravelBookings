### 1. High-Level Architecture Diagram

```mermaid
graph TB
    subgraph Clients
        ReactSPA["React 18 SPA<br/>(Shared Design System)"]
        MobileApps["Mobile Apps"]
        ThirdParty["3rd Party"]
    end

    subgraph Gateway["Azure Front Door (CDN + WAF)"]
        FrontDoor["Global Load Balancing<br/>CDN + WAF"]
    end

    subgraph APIM["Azure API Management (Gateway)"]
        APIMCore["Rate Limiting | Auth (JWT/OAuth2)<br/>Routing | Versioning"]
    end

    subgraph Services["Microservices (.NET 8 on Azure App Service)"]
        TravelSvc["Travel Booking<br/>Service<br/>(.NET 8)"]
        EventSvc["Event Management<br/>Service<br/>(.NET 8)"]
        PaymentSvc["Payment Service<br/>(.NET 8)<br/>[LEGACY WRAPPER<br/>Phase 1]"]
        ReportingSvc["Reporting<br/>Service<br/>(.NET 8)"]
        NotificationSvc["Notification<br/>Service<br/>(.NET 8)"]
    end

    subgraph Databases["Per-Service Azure SQL Databases"]
        TravelDB[("Azure SQL DB<br/>(Travel)")]
        EventDB[("Azure SQL DB<br/>(Event)")]
        PaymentDB[("Azure SQL DB<br/>(Payment)")]
        ReportingDB[("Azure SQL DB<br/>(Read Replicas)")]
        NotificationDB[("Azure SQL DB<br/>(Notification)")]
    end

    subgraph ServiceBus["Azure Service Bus (Topics & Queues)"]
        BookingTopics["BookingConfirmed<br/>BookingCancelled<br/>AllocationDone"]
        EventTopics["EventCreated<br/>EventUpdated<br/>AttendeeRegistered"]
        PaymentTopics["PaymentProcessed<br/>PaymentFailed"]
    end

    subgraph Observability["Observability Layer"]
        Monitor["Azure Monitor"]
        AppInsights["Application Insights"]
        LogAnalytics["Log Analytics"]
        DistTracing["Distributed Tracing"]
    end

    subgraph Infra["Infrastructure (IaC - Bicep/Terraform)"]
        Pipelines["Azure DevOps Pipelines"]
        KeyVault["Azure Key Vault"]
        ACR["Azure Container Registry"]
    end

    ReactSPA & MobileApps & ThirdParty -->|HTTPS| FrontDoor
    FrontDoor --> APIMCore

    APIMCore --> TravelSvc
    APIMCore --> EventSvc
    APIMCore --> PaymentSvc
    APIMCore --> ReportingSvc
    APIMCore --> NotificationSvc

    TravelSvc --> TravelDB
    EventSvc --> EventDB
    PaymentSvc --> PaymentDB
    ReportingSvc --> ReportingDB
    NotificationSvc --> NotificationDB

    TravelSvc <--> BookingTopics
    EventSvc <--> EventTopics
    PaymentSvc <--> PaymentTopics
    ReportingSvc -.->|subscribes| BookingTopics & EventTopics & PaymentTopics
    NotificationSvc -.->|subscribes| BookingTopics & EventTopics & PaymentTopics

    Services --> Observability
    Databases --> Observability
    ServiceBus --> Observability
    Observability --> Infra
```

---

### 2. Strangler Fig Pattern – Before & After

```mermaid
graph LR
    subgraph BEFORE
        ClientBefore["Client"] --> Monolith["Monolith"]
    end

    subgraph AFTER["AFTER (Progressive Migration)"]
        ClientAfter["Client"] --> APIMGateway["APIM Gateway"]
        APIMGateway -->|"/api/reports/*"| ReportingSvc["Reporting Service"]
        APIMGateway -->|"/api/events/*"| EventSvc["Event Mgmt Service"]
        APIMGateway -->|"/api/bookings/*"| TravelSvc["Travel Service"]
        APIMGateway -->|"/api/payments/*"| PaymentWrapper["Payment Wrapper"]
        APIMGateway -->|"/api/legacy/*"| MonolithRemaining["Monolith<br/>(remaining)"]
    end
```

---

### 3. Migration Phases (Gantt-style Timeline)

```mermaid
gantt
    title Phase 1 Modernization – 9 Month Timeline
    dateFormat YYYY-MM
    axisFormat %b

    section Phase 0 – Foundation
    IaC, CI/CD, APIM Façade, Observability     :p0, 2025-07, 2M
    DB Analysis, Shared Libraries, Test Harness :p0b, 2025-07, 2M

    section Phase 1 – Reporting
    Create Reporting_DB (Read Replicas/CDC)     :p1a, 2025-08, 1M
    Build Reporting Service (.NET 8)            :p1b, 2025-09, 2M
    APIM Route Migration & Cutover             :p1c, 2025-10, 1M

    section Phase 2 – Notifications + Events
    Notification Service + Service Bus Setup    :p2a, 2025-09, 2M
    Event Management Service Extraction         :p2b, 2025-10, 3M
    DB Decomposition (Event Tables)             :p2c, 2025-11, 2M

    section Phase 3 – Travel Booking
    Travel Booking Service                      :p3a, 2025-11, 4M
    Payment ACL Integration                     :p3b, 2025-12, 2M
    DB Decomposition (Travel Tables)            :p3c, 2026-01, 2M

    section Phase 4 – Payment Wrapper + Stabilize
    Payment Service Wrapper                     :p4a, 2026-01, 2M
    E2E Integration & Performance Testing       :p4b, 2026-02, 2M
    Documentation & Runbooks                    :p4c, 2026-03, 1M
```

---

### 4. Retry and Dead-Letter Handling Flow

```mermaid
flowchart TD
    Publish["Service Publishes Event"] --> SB["Azure Service Bus<br/>Topic/Queue<br/>(MaxDelivery: 5, TTL: 24h)"]
    SB --> Consumer["Consumer (Subscriber)<br/>Polly Retry Policy:<br/>3 retries, Exp Backoff<br/>2s → 4s → 8s"]

    Consumer -->|Success| Complete["Complete()"]
    Consumer -->|Failure after<br/>app retries| Abandon["Abandon()<br/>→ Redelivery"]

    Abandon -->|"MaxDeliveryCount<br/>NOT exceeded"| SB
    Abandon -->|"MaxDeliveryCount<br/>exceeded"| DLQ["Dead-Letter Queue (DLQ)"]

    DLQ --> DLQProcessor["DLQ Processor<br/>(Azure Function)<br/>• Log details<br/>• Classify error<br/>• Retry or park"]
    DLQProcessor --> Alert["Alert via<br/>Azure Monitor<br/>+ PagerDuty"]

    style DLQ fill:#f96,stroke:#333,stroke-width:2px
    style Complete fill:#6f6,stroke:#333,stroke-width:2px
    style Alert fill:#f66,stroke:#333,stroke-width:2px
```

---

### 5. Communication Model Decision Flow

```mermaid
flowchart TD
    Start["Inter-Service<br/>Communication Needed"] --> Q1{"User waiting<br/>for immediate<br/>response?"}

    Q1 -->|Yes| Q2{"Single target<br/>service?"}
    Q1 -->|No| Q3{"State change<br/>notification?"}

    Q2 -->|Yes| Sync["Synchronous REST<br/>via APIM<br/>(e.g., GET booking details)"]
    Q2 -->|No| Sync

    Q3 -->|Yes| Q4{"Multiple<br/>subscribers?"}
    Q3 -->|No| Queue["Azure Service Bus<br/>Queue (1:1 Command)<br/>(e.g., process allocation)"]

    Q4 -->|Yes| Topic["Azure Service Bus<br/>Topic/Subscription (Pub/Sub)<br/>(e.g., BookingConfirmed)"]
    Q4 -->|No| Queue

    Sync --> CB["+ Polly Circuit Breaker<br/>+ Timeout Policy<br/>+ Bulkhead Isolation"]
    Topic --> Idem["+ Idempotent Consumers<br/>+ DLQ Monitoring<br/>+ CorrelationId Propagation"]
    Queue --> Idem

    style Sync fill:#4da6ff,stroke:#333,color:#fff
    style Topic fill:#66cc66,stroke:#333,color:#fff
    style Queue fill:#ffcc66,stroke:#333
```

---

### 6. Phased Database Decomposition

```mermaid
flowchart LR
    subgraph "Phase 0–1"
        LegacyDB1[("Legacy SQL Server<br/>~600 tables")] -->|"CDC / Read Replica"| ReportDB1[("Reporting_DB<br/>(read-only)")]
        LegacyDB1 ---|"All services<br/>read/write"| Monolith1["Monolith +<br/>New Reporting Svc"]
    end

    subgraph "Phase 2"
        LegacyDB2[("Legacy SQL Server<br/>~480 tables")] -->|CDC| EventDB2[("Event_DB<br/>~120 tables")]
        LegacyDB2 -->|CDC| ReportDB2[("Reporting_DB")]
        LegacyDB2 ---|"Single writer<br/>per table"| Monolith2["Monolith<br/>(shrinking)"]
        EventDB2 --- EventSvc2["Event Mgmt Svc"]
    end

    subgraph "Phase 3–4"
        LegacyDB3[("Legacy SQL Server<br/>~280 tables<br/>(orphaned)")] -->|Views| Compat["Backward<br/>Compatibility<br/>Views"]
        TravelDB3[("Travel_DB<br/>~200 tables")]
        EventDB3[("Event_DB<br/>~120 tables")]
        PaymentDB3[("Payment_DB<br/>(logically isolated)")]
        ReportDB3[("Reporting_DB")]
        NotifDB3[("Notification_DB")]
    end

    style LegacyDB1 fill:#f96,stroke:#333
    style LegacyDB2 fill:#fc6,stroke:#333
    style LegacyDB3 fill:#ccc,stroke:#333
```

---

### 7. Risk & Failure – Cascading Failure (Circuit Breaker)

```mermaid
sequenceDiagram
    participant User
    participant APIM as APIM Gateway
    participant Travel as Travel Booking Svc
    participant CB as Polly Circuit Breaker
    participant Payment as Payment Svc (Legacy)

    User->>APIM: POST /api/bookings
    APIM->>Travel: Forward request
    Travel->>CB: Call Payment Service

    rect rgb(144, 238, 144)
        Note over CB: Circuit CLOSED (healthy)
        CB->>Payment: POST /api/payments
        Payment-->>CB: 200 OK
        CB-->>Travel: Payment confirmed
        Travel-->>APIM: 201 Created
        APIM-->>User: Booking confirmed
    end

    rect rgb(255, 200, 200)
        Note over CB: Payment Svc degrades...
        User->>APIM: POST /api/bookings
        APIM->>Travel: Forward request
        Travel->>CB: Call Payment Service
        CB->>Payment: POST /api/payments
        Payment--xCB: Timeout (5s)
        CB->>Payment: Retry 1 (2s backoff)
        Payment--xCB: Timeout
        CB->>Payment: Retry 2 (4s backoff)
        Payment--xCB: Timeout
        Note over CB: 5 failures in 30s → Circuit OPEN
        CB-->>Travel: Circuit open exception
        Travel-->>APIM: 503 + fallback: provisional booking
        APIM-->>User: Booking provisional – payment pending
    end

    rect rgb(255, 255, 200)
        Note over CB: After 60s → Circuit HALF-OPEN
        CB->>Payment: Test request
        Payment-->>CB: 200 OK
        Note over CB: Circuit CLOSED again
    end
```

---

### 8. Event Flow Example – Booking Confirmation

```mermaid
flowchart TD
    User["User submits booking"] --> TravelSvc["Travel Booking Service"]
    TravelSvc -->|"Sync REST"| PaymentSvc["Payment Service<br/>(Legacy Wrapper)"]
    PaymentSvc -->|"PaymentProcessed"| SB["Azure Service Bus"]
    TravelSvc -->|"BookingConfirmed"| SB

    SB -->|"Subscription 1"| NotifSvc["Notification Service<br/>→ Send confirmation email"]
    SB -->|"Subscription 2"| ReportSvc["Reporting Service<br/>→ Update dashboards"]
    SB -->|"Subscription 3"| EventSvc["Event Mgmt Service<br/>→ Update attendee status"]

    NotifSvc --> NotifDB[("Notification_DB<br/>Delivery logs")]
    ReportSvc --> ReportDB[("Reporting_DB<br/>Materialized views")]
    EventSvc --> EventDB[("Event_DB<br/>Attendee records")]

    SB -.->|"Failed after<br/>max retries"| DLQ["Dead-Letter Queue"]
    DLQ --> AlertFunc["Azure Function<br/>→ Alert on-call"]

    style SB fill:#0078d4,stroke:#333,color:#fff
    style DLQ fill:#f96,stroke:#333
    style User fill:#e6f3ff,stroke:#333
```
