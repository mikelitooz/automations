# Workflow Diagrams - AgencyFlow Automation Suite

Visual representations of all automation flows using Mermaid diagrams.

---

## 1. Slack → Trello Task Pipeline

```mermaid
flowchart TD
    A[📱 New Slack Message] --> B{Contains Keywords?}
    B -->|confirmed/approved| C[Extract Details]
    B -->|No match| X[❌ Skip]

    C --> D[Parse Title]
    C --> E[Parse Due Date]
    C --> F[Parse Labels]

    D --> G{Project Type?}
    E --> G
    F --> G

    G -->|Development| H1[🔧 Dev Board]
    G -->|Design| H2[🎨 Design Board]
    G -->|Other| H3[📋 General Board]

    H1 --> I[Create Trello Card]
    H2 --> I
    H3 --> I

    I --> J[Apply Labels]
    J --> K[Set Due Date]
    K --> L[✅ Send Slack Confirmation]

    style A fill:#4A154B
    style L fill:#2eb886
    style X fill:#ff6b6b
```

---

## 2. Stripe → Client Onboarding Flow

```mermaid
flowchart TD
    A[💳 Stripe Payment Success] --> B[Extract Client Info]

    B --> C[Format Client Name]

    C --> D{Plan Type?}

    D -->|Premium| E1[Premium Onboarding]
    D -->|Standard| E2[Standard Onboarding]
    D -->|Basic| E3[Basic Onboarding]

    subgraph Slack Setup
        S1[Create Channel] --> S2[Set Topic]
        S2 --> S3[Post Welcome]
        S3 --> S4[Pin Message]
    end

    subgraph Trello Setup
        T1[Clone Template Board] --> T2[Rename Board]
        T2 --> T3[Update Labels]
    end

    subgraph Toggl Setup
        G1[Create Project] --> G2[Set Tags]
    end

    E1 --> S1
    E2 --> S1
    E3 --> S1

    S4 --> T1
    T3 --> G1

    G2 --> N[📢 Notify Team]
    N --> L[📊 Log to Sheet]
    L --> Z[✅ Onboarding Complete]

    style A fill:#635bff
    style Z fill:#2eb886
```

---

## 3. Bi-Directional Trello ↔ Slack Sync

```mermaid
flowchart LR
    subgraph Slack
        SL1[New Message]
        SL2[Notification]
    end

    subgraph Trello
        TR1[Create Card]
        TR2[Card Moved]
        TR3[Card Updated]
    end

    SL1 -->|Task confirmed| TR1
    TR2 -->|Status change| SL2
    TR3 -->|Due date/comment| SL2

    style SL1 fill:#4A154B
    style SL2 fill:#4A154B
    style TR1 fill:#0079bf
    style TR2 fill:#0079bf
    style TR3 fill:#0079bf
```

---

## 4. Admin Automation Hub

```mermaid
flowchart TD
    subgraph Daily Automations
        D1[⏰ 5pm Daily] --> D2{Hours Logged?}
        D2 -->|< 1 hour| D3[📩 Reminder DM]
        D2 -->|>= 1 hour| D4[✅ No Action]
    end

    subgraph Weekly Automations
        W1[⏰ Monday 9am] --> W2[Pull Trello Done]
        W2 --> W3[Pull Toggl Hours]
        W3 --> W4[📊 Compile Report]
        W4 --> W5[Post to #updates]
    end

    subgraph Alert Automations
        A1[⏰ Daily Check] --> A2[Get In-Progress Cards]
        A2 --> A3{Card Age > 5 days?}
        A3 -->|Yes| A4[🚨 Alert Team]
        A3 -->|No| A5[✅ No Action]
    end

    style D3 fill:#ffcc00
    style W5 fill:#2eb886
    style A4 fill:#ff6b6b
```

---

## 5. Complete System Overview

```mermaid
flowchart TD
    subgraph External
        ST[💳 Stripe]
        CL[👤 Client]
    end

    subgraph Core Platforms
        SL[📱 Slack]
        TR[📋 Trello]
        TG[⏱️ Toggl]
    end

    subgraph Automation Layer
        ZP[⚡ Zapier]
    end

    subgraph Logging
        GS[📊 Google Sheets]
    end

    CL -->|Payment| ST
    ST -->|Webhook| ZP

    ZP -->|Create Channel| SL
    ZP -->|Clone Board| TR
    ZP -->|Create Project| TG
    ZP -->|Log Event| GS

    SL <-->|Task Sync| ZP
    TR <-->|Updates| ZP
    TG -->|Reports| ZP

    ZP -->|Notifications| SL

    style ZP fill:#ff4a00
    style SL fill:#4A154B
    style TR fill:#0079bf
    style TG fill:#E57CD8
    style ST fill:#635bff
```

---

## 6. Error Handling Flow

```mermaid
flowchart TD
    A[🔄 Zap Triggered] --> B{API Call Success?}

    B -->|Yes| C[Continue Flow]
    B -->|No| D[Capture Error]

    D --> E{Retry Attempt?}
    E -->|< 3 attempts| F[Wait 30 sec]
    F --> A

    E -->|>= 3 attempts| G[Log Error]
    G --> H[Alert Admin via Slack]
    H --> I[Create Error Card in Trello]

    C --> J[✅ Complete]
    I --> K[❌ Manual Review Needed]

    style J fill:#2eb886
    style K fill:#ff6b6b
    style H fill:#ffcc00
```

---

## Diagram Legend

| Symbol | Meaning           |
| ------ | ----------------- |
| 📱     | Slack             |
| 📋     | Trello            |
| ⏱️     | Toggl             |
| 💳     | Stripe            |
| ⚡     | Zapier/Automation |
| ✅     | Success/Complete  |
| ❌     | Error/Skip        |
| 🚨     | Alert             |
| 📊     | Reporting/Logging |

---

_These diagrams can be rendered using any Mermaid-compatible viewer (GitHub, Notion, VS Code extension)._
