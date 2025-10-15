# 🧠 LogMiner AI Platform
### Intelligent Log Analysis, Anomaly Detection & Explanation

LogMiner is an **end-to-end AI-powered platform** for log analysis and anomaly detection.  
It combines log parsing, RAG-based reasoning, and LLM explanations through three main components:
- **Frontend (Next.js)** — User interface for visualization and queries  
- **Backend (Spring Boot)** — API and orchestration layer  
- **AI Module (Python)** — Core engine for parsing, embedding, and explaining logs  

---

## 🚀 Overview
- Parse and structure raw logs automatically (Drain parser)  
- Detect anomalies using **Retrieval-Augmented Generation (LangChain + ChromaDB)**  
- Generate **human-readable explanations & fix suggestions** using LLaMA / GPT  
- Visualize KPIs and anomalies through an intuitive dashboard  
- Ask natural language questions like *“Why did this error occur?”*

---

## 🧠 Architecture

Frontend (Next.js)
↓ REST API
Backend (Spring Boot)
↓ HTTP / JSON
AI Module (Python)
↓ LLM (LLaMA / GPT)
---

## ⚙️ Tech Stack
| Layer | Technology |
|--------|-------------|
| Frontend | Next.js, Tailwind, Chart.js |
| Backend | Spring Boot, PostgreSQL |
| AI Module | Python, LangChain, ChromaDB, LLaMA |
| Auth (opt.) | Azure / JWT |

---

## 🧩 Modules Summary

### 🔹 AI Module
- Parse logs → Drain parser  
- Embed & retrieve via LangChain + ChromaDB  
- Detect anomalies and suggest fixes  
- Generate explanations using LLaMA  
- Optional “Ask-Why” conversational mode  

**Run locally:**
```bash
uvicorn controller:app --reload
chainlit src/chatbot/chatbot.py -w
```
**Setup:**
```bash
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

### 🔹 Backend (Spring Boot)

REST APIs for log upload, search, and filtering

Sends logs to AI module for analysis

Handles Natural Language Queries (NLQ)

Stores and manages structured logs

**Run locally:**

mvn spring-boot:run


**Structure:**

controller/  → REST APIs  
service/     → Business logic  
model/       → Entities & DTOs  
repository/  → Database access  

### 🔹 Frontend (Next.js)

Upload and visualize logs

View anomalies and AI explanations

Interactive filters and charts

Secure login via Azure OAuth

**Run locally:**
``` bash
git clone https://github.com/mohamed-ayedi/log-analyzer-frontend.git
cd log-analyzer-frontend
cp .env.example .env
npm install
npm run dev
```

App available at → http://localhost:3000

### 🔗 Communication Flow
From	To	Protocol	Purpose
Frontend	Backend	REST API	Upload logs, query data
Backend	AI Module	HTTP	Send logs for analysis
AI Module	LLM	API	Generate explanations

### 🌟 Features

- Automatic log parsing & anomaly detection

- AI-based error explanations and fixes

- Natural language “Ask-Why” assistant

- Visual dashboards with real-time KPIs

### 👥 Authors

- AI & NLP: LogAI Team

- Backend: LogMiner Team

- Frontend: LogAnalyzer Team

