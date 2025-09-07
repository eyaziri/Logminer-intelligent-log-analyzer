# log-analyzer-ai IA Module (Log Parsing, RAG-Based Anomaly Detection & Explanation)

The IA (Intelligence Artificielle) module is the core AI engine of the LogAI platform. It processes **raw semi-structured logs** by parsing them, detecting anomalies using **Retrieval-Augmented Generation (RAG)**, and generating clear explanations and fix suggestions using large language models (LLMs).

---

## 📌 Responsibilities

- **Parse raw logs** into structured format (timestamp, log level, message, etc.) using the **Drain parser**  
- **Embed logs** and search known anomaly cases using **RAG** (LangChain + ChromaDB)  
- **Detect anomalies** by matching new logs against a vector store of known issues  
- **Generate human-readable explanations** for anomalies using **LLaMA ** 
- **Suggest fixes or next steps** based on retrieved knowledge  
- **Answer interactive user questions** in “Ask-Why” mode (optional)

---

---
## How to run

  # host rag and hint endpoint
  uvicorn controller:app --reload

  # host chat bot 
  chainlit /src/chatbot/chatbot.py -w
---

## 🧠 AI Pipeline

### 1. Log Parsing  
- Clean and parse raw logs using **Drain**  
- Extract structured fields for easier processing

### 2. Embedding & Vector Search  
- Generate embeddings of parsed logs with **OpenAI’s text-embedding-3-small**  
- Store embeddings in **ChromaDB** vector database  
- Retrieve top similar logs via **LangChain RAG** for context

### 3. Anomaly Detection  
- Compare incoming logs to known normal and anomaly embeddings  
- Flag logs as anomalous if similarity indicates a known issue or if no close normal match

### 4. Explanation & Fix Suggestion  
- Use retrieved logs and LLMs to generate:  
  - Clear, technical explanation  
  - Suggested fix commands or configuration changes

### 5. Ask-Why Assistant (Optional)  
- Accept natural language queries about errors  
- Generate detailed, context-aware answers

---
## 📌 Detailed Explanation on Demand

The IA module supports **multi-level explanations** for errors:

- When an anomaly is first detected, a **concise explanation and quick fix hint** is generated for fast user feedback.
- If the user requests **more details** (e.g., clicks "Learn More"), the IA module:
  - Sends an **expanded prompt** to the same LLM (GPT-4 / LLaMA), including:
    - The original log message
    - Previously retrieved similar cases (via RAG)
    - The initial explanation
    - A request for **in-depth explanation, step-by-step fix instructions, best practices, and troubleshooting tips**
  - Retrieves **more contextual documents/logs** (higher `top_k`) from the vector store to enrich the LLM prompt.
  - Optionally uses a **multi-turn conversational chain** (via LangChain) to allow further user Q&A.
  
This approach leverages the existing LLM and RAG infrastructure without needing separate or specialized models.

---

## 🔧 How It Works

1. **User clicks “Explain”** on an anomalous log → concise explanation is generated.
2. **User clicks “Learn More”** for deeper understanding → IA module:
   - Expands the RAG retrieval to get more related cases.
   - Crafts a detailed prompt requesting extended explanations, diagnostics, and step-by-step fixes.
   - Returns a richer, comprehensive answer.
3. Users can continue asking follow-up questions handled by the Ask-Why conversational assistant.

---

Create a venv (put it in .gitignore !!) :

```bash
python -m venv venv
```
Activate it :

```bash
.\venv\Scripts\Activate
```
Deactivate it :

```bash
deactivate
```

```bash
pip install -r requirements.txt
```



