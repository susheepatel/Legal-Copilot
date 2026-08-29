# ⚖️ Legal Copilot — AI-Powered Law Practice & Research System

> **A modern, privacy-first legal practice management and statutory AI research studio tailored for Indian advocates, chambers, and law firms.**

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38B2AC?logo=tailwind-css)
![AI Engine](https://img.shields.io/badge/AI-Qwen%202.5%20Coder%20%7C%20Local-10B981)
![Jurisdiction](https://img.shields.io/badge/Jurisdiction-India%20(BNS%202023)-F59E0B)

---

## 🌟 Key Capabilities

### 1. 🤖 AI Legal Copilot & Research Studio
- **BNS 2023 Transition Matrix**: Instant cross-mapping between legacy criminal laws (**IPC 1860, CrPC 1973, IEA 1872**) and the new criminal laws (**Bharatiya Nyaya Sanhita 2023, BNSS 2023, BSA 2023**) with penalty variations and procedural impacts.
- **Court Pleadings & Notice Drafting**: Court-ready draft generation for:
  - Anticipatory Bail Applications (*Section 482 BNSS 2023*)
  - Statutory Legal Notices for Cheque Dishonour (*Section 138 NI Act*)
  - Interim Injunction Applications (*Order XXXIX Rules 1 & 2 CPC*)
  - Written Statements, Caveats, and Pre-Hearing Synopses
- **Limitation Act Calculator**: Exact statutory limitation calculations under Limitation Act 1963 Schedules, with grounds for delay condonation under Section 5.
- **Pre-Hearing Synopsis**: Structured talking points, arguable legal propositions, and precedents for the Bench.

### 2. ⚡ Dual Local AI Architecture (100% Private, 0 API Cost)
- **Primary Engine**: **Qwen 2.5 Coder** (1.5B / 7B) running locally on your hardware via Ollama with **Real-Time Word-by-Word Token Streaming (SSE)**.
- **Zero-Latency Fallback**: Built-in **Legal-Copilot-Native-v1.0** pre-compiled statutory engine executing lookups in **0.2 milliseconds**.
- **Privacy First**: Case details and prompts never leave your local machine.

### 3. 📂 Litigation Docket Management
- Comprehensive case filing management (CNR number, Court name, Bench, Case Type, Opposing Counsel).
- Complete hearing timeline tracking with historical bench orders and interim directions.

### 4. 📅 Hearing Calendar & Daily Cause List
- Automatic 3-day and 7-day urgent listing alerts.
- Filter listings by Courtroom, Purpose (Admission, Evidence, Final Arguments), and Assigned Associate.

### 5. 👥 Client CRM & KYC
- Client directory with linked litigation matters, fee history, and KYC tracking.

### 6. 💼 Billing, Fee Memos & Invoices
- Generate itemized legal fee memos, court appearance billings, and retainer tracking with one-click export.

### 7. 💾 Local Chamber Vault & Data Backup
- Local persistent storage with full JSON data export & backup.

---

## 🚀 Quick Start & Installation

### Prerequisites
- **Node.js** (v18 or higher)
- **Ollama** *(Optional for Qwen local LLM inference — [Download Ollama](https://ollama.com))*

### 1. Clone the Repository
```bash
git clone https://github.com/susheepatel/Legal-Copilot.git
cd Legal-Copilot
```

### 2. Install Dependencies
```bash
npm install
```

### 3. (Optional) Run Local AI Engine
To enable the high-speed local Qwen model:
```bash
# Pull the lightweight ~1.5s model (Ryzen / Intel / Apple Silicon)
ollama pull qwen2.5-coder:1.5b

# Or pull the 7B model for deep multi-page legal pleadings
ollama pull qwen2.5-coder:7b
```

### 4. Start the Application
```bash
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🎛️ AI Speed & Engine Modes

In the **AI Copilot** tab, switch between 3 speed modes:

| Mode | Engine | Latency | Recommended Use |
|---|---|---|---|
| ⚡ **Fast** | `qwen2.5-coder:1.5b` | `~1.5s` (Streaming) | Daily legal queries, Section 138 notices, quick statutory checks |
| 🧠 **Deep** | `qwen2.5-coder:7b` | `~30-45s` | Complex bail grounds, extensive appellate synopses |
| ⚡ **Instant** | `Legal-Copilot-Native-v1.0` | `0.2ms` | Instant statutory lookups (IPC ↔ BNS mapping, limitation periods) |

---

## 🏗️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Vite
- **Backend**: Express.js, Node.js (with SSE stream proxying)
- **AI Framework**: Qwen 2.5 Coder (OpenAI-compatible local endpoint) + Native Statutory Hash Engine
- **Storage**: Local Storage Chamber Vault + Supabase Client

---

## ⚖️ Statutory & Ethical Disclaimer

*Legal Copilot is an AI-assisted practice management and legal research system designed to aid practicing advocates and legal researchers. AI-generated drafts, section cross-mappings, and limitation computations must be independently verified against official statutory gazettes and authoritative law reports before court filing or client reliance.*

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
