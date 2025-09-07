# 🛠️ LogMiner – Backend (Spring Boot)

This repository contains the **backend service** of the LogMiner platform, built using **Spring Boot**. It provides RESTful APIs for log ingestion, querying, and coordination with the AI and frontend modules.

---

## 📦 Overview

The backend acts as the **central orchestrator** of the system. Its responsibilities include:

- 📤 Receiving and storing log data
- 📊 Offering REST APIs for log search, upload, and metadata access
- 🤖 Communicating with the AI module (LangChain + Ollama) for analysis
- 🧠 Handling natural language questions and returning answers from logs
- 🌐 Serving data to the Next.js frontend

---

## 🔌 API Features

### 🔹 Log Management
- Upload structured or unstructured logs via REST
- Timestamping, normalization, and ID assignment

### 🔹 Log Search & Filtering
- Filter by:
  - Time range
  - Log level
  - Keywords
  - Source/module
- Optional: pagination & sorting

### 🔹 AI Integration (via HTTP)
- Send log entries to the AI service for:
  - RAG-based question answering
  - Anomaly or error detection
  - Solution extraction from previous logs

### 🔹 NLQ Endpoint
- Accepts natural language questions (e.g. _"Why is the login failing?"_)
- Sends context + question to AI module, returns answer

---

## ⚙️ Tech Stack

| Layer         | Technology              |
|---------------|--------------------------|
| Backend       | Spring Boot              |
| Build Tool    | Maven or Gradle          |
| Database      | PostgreSQL or MongoDB    |
| Integration   | REST (to AI + Frontend)  |
| AI Module     | LangChain + Ollama       |
| Frontend      | Next.js                  |
| Auth (opt.)   | JWT / OAuth2             |

---

## 📁 Project Structure

```bash
logminer-backend/
├── src/
│   ├── main/
│   │   ├── java/com/logminer/
│   │   │   ├── controller/     # REST APIs
│   │   │   ├── service/        # Business logic
│   │   │   ├── model/          # DTOs / Entities
│   │   │   ├── repository/     # DB access
│   │   │   └── config/         # CORS, API config
│   │   └── resources/
│   │       ├── application.yml
│   │       └── logback.xml
└── pom.xml
