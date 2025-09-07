FROM python:3.10-slim
WORKDIR /app

COPY requirements.txt .
RUN python -m venv venv && \
    . venv/bin/activate && \
    pip install --upgrade pip setuptools wheel && \
    pip install -r requirements.txt && \
    pip install chromadb sentence-transformers python-multipart redis chardet requests fastapi uvicorn

COPY . .

EXPOSE 8000

CMD ["venv/bin/uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
