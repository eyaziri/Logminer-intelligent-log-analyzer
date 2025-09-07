import os
import re
import hashlib
from datetime import datetime
from typing import List, Dict, Any, Optional
from pathlib import Path

from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel

import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
import requests
import chardet
import uuid
import redis
import pickle

from src.problemClassifier.ProblemRAGSystem import ProblemRAGSystem


class LogEntry(BaseModel):
    timestamp: str
    level: str
    source: str
    message: str
    problem: str


class CacheConfig:
    """Redis cache configuration"""

    def __init__(self,
                 host: str = "localhost",
                 port: int = 6379,
                 db: int = 0,
                 ttl_seconds: int = 3600 * 24 * 30):
        self.host = host
        self.port = port
        self.db = db
        self.ttl_seconds = ttl_seconds


class RedisCache:
    """Redis caching utility for log parsing results"""

    def __init__(self, config: CacheConfig):
        self.config = config
        self.client = None
        self.connected = False
        self._connect()

    def _connect(self):
        """Establish Redis connection with fallback"""
        try:
            self.client = redis.Redis(
                host=self.config.host,
                port=self.config.port,
                db=self.config.db,
                decode_responses=False,  # Keep binary for pickle
                socket_connect_timeout=5,
                socket_timeout=5,
                health_check_interval=30
            )
            # Test connection
            self.client.ping()
            self.connected = True
            print(f"✅ Redis connected: {self.config.host}:{self.config.port}")
        except Exception as e:
            print(f"⚠️ Redis connection failed: {e}. Operating without cache.")
            self.connected = False
            self.client = None

    def _generate_cache_key(self, content: str, prefix: str = "log_parse") -> str:
        """Generate cache key from content hash"""
        content_hash = hashlib.sha256(content.encode('utf-8')).hexdigest()[:16]
        return f"{prefix}:{content_hash}"

    def get(self, content: str, prefix: str = "log_parse") -> Optional[List[LogEntry]]:
        """Get cached parsed results"""
        if not self.connected:
            return None

        try:
            cache_key = self._generate_cache_key(content, prefix)
            cached_data = self.client.get(cache_key)

            if cached_data:
                # Deserialize the cached data
                log_entries_data = pickle.loads(cached_data)
                # Convert back to LogEntry objects
                log_entries = [LogEntry(**entry) for entry in log_entries_data]
                print(f"🎯 Cache HIT: {cache_key[:20]}...")
                return log_entries

            print(f"❌ Cache MISS: {cache_key[:20]}...")
            return None

        except Exception as e:
            print(f"⚠️ Cache read error: {e}")
            return None

    def set(self, content: str, log_entries: List[LogEntry], prefix: str = "log_parse"):
        """Cache parsed results"""
        if not self.connected:
            return

        try:
            cache_key = self._generate_cache_key(content, prefix)
            # Convert LogEntry objects to dict for serialization
            log_entries_data = [entry.dict() for entry in log_entries]
            serialized_data = pickle.dumps(log_entries_data)

            self.client.setex(
                cache_key,
                self.config.ttl_seconds,
                serialized_data
            )
            print(f"💾 Cached: {cache_key[:20]}... (TTL: {self.config.ttl_seconds}s)")

        except Exception as e:
            print(f"⚠️ Cache write error: {e}")

    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        if not self.connected:
            return {"status": "disconnected"}

        try:
            info = self.client.info()
            return {
                "status": "connected",
                "used_memory": info.get('used_memory_human', 'N/A'),
                "keys": self.client.dbsize(),
                "hits": info.get('keyspace_hits', 0),
                "misses": info.get('keyspace_misses', 0),
                "hit_rate": round(info.get('keyspace_hits', 0) /
                                  max(info.get('keyspace_hits', 0) + info.get('keyspace_misses', 0), 1) * 100, 2)
            }
        except Exception as e:
            return {"status": "error", "error": str(e)}

    def clear_cache(self, pattern: str = "log_parse:*") -> int:
        """Clear cache entries matching pattern"""
        if not self.connected:
            return 0

        try:
            keys = self.client.keys(pattern)
            if keys:
                deleted = self.client.delete(*keys)
                print(f"🗑️ Cleared {deleted} cache entries")
                return deleted
            return 0
        except Exception as e:
            print(f"⚠️ Cache clear error: {e}")
            return 0


class SemanticLogParser:
    def __init__(self, cache_config: Optional[CacheConfig] = None):
        # Initialize Redis cache
        self.cache = RedisCache(cache_config or CacheConfig())

        # Initialize ChromaDB
        self.chroma_client = chromadb.PersistentClient(
            path="./chroma_db",
            settings=Settings(allow_reset=True)
        )

        # Create collections for different components
        self.log_collection = self._get_or_create_collection("log_entries", "Raw log entries")
        self.timestamp_collection = self._get_or_create_collection("timestamps", "Timestamp patterns and examples")
        self.level_collection = self._get_or_create_collection("levels", "Log levels and indicators")
        self.source_collection = self._get_or_create_collection("sources", "Source identifiers and patterns")
        self.message_collection = self._get_or_create_collection("messages", "Core message content")
        # self.problem_collection = self._get_or_create_collection("problems", "Problem indicators and descriptions")

        # Initialize the enhanced problem RAG system
        self.problem_rag = ProblemRAGSystem(chroma_path="./problem_chroma_db")

        # Initialize free embedding model
        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')

        # Initialize component knowledge base
        self._initialize_component_knowledge()

        # Ollama API endpoint (free local LLM)
        self.llm_endpoint = "http://localhost:11434/api/generate"

        # Multi-line patterns
        self.multiline_indicators = [
            r'^Traceback \(most recent call last\):',
            r'^\s+File ".*", line \d+',
            r'^\s+.*Error:',
            r'^\s+at ',
            r'^\s+\.\.\.',
            r'^\s{4,}',  # Heavy indentation
            r'^Caused by:',
            r'^Exception in thread',
            r'^\s*\^',  # Error pointer
        ]

    def _get_or_create_collection(self, name: str, description: str):
        """Get or create a ChromaDB collection"""
        try:
            return self.chroma_client.get_collection(name)
        except:
            return self.chroma_client.create_collection(
                name=name,
                metadata={"description": description}
            )

    def _initialize_component_knowledge(self):
        """Initialize knowledge base for each component type"""

        # Timestamp patterns and examples
        timestamp_examples = [
            {"text": "2023-10-09 14:32:40", "type": "iso_date", "description": "ISO format datetime"},
            {"text": "2025-07-22T08:17:05Z", "type": "iso_z", "description": "ISO format with Z timezone"},
            {"text": "Oct 09 14:32:40", "type": "syslog", "description": "Syslog format timestamp"},
            {"text": "[Mon Oct 09 14:32:40 2023]", "type": "apache", "description": "Apache format timestamp"},
            {"text": "09/Oct/2023:14:32:40 +0000", "type": "nginx", "description": "Nginx format timestamp"},
            {"text": "2023-10-09T14:32:40.123Z", "type": "iso_ms", "description": "ISO format with milliseconds"},
            {"text": "1696854760", "type": "unix", "description": "Unix timestamp"},
            {"text": "14:32:40", "type": "time_only", "description": "Time only format"}
        ]

        # Log levels and indicators
        level_examples = [
            {"text": "ERROR", "level": "ERROR", "description": "Error level indicator"},
            {"text": "WARN", "level": "WARNING", "description": "Warning level indicator"},
            {"text": "WARNING", "level": "WARNING", "description": "Warning level indicator"},
            {"text": "INFO", "level": "INFO", "description": "Information level indicator"},
            {"text": "DEBUG", "level": "DEBUG", "description": "Debug level indicator"},
            {"text": "FATAL", "level": "FATAL", "description": "Fatal error indicator"},
            {"text": "TRACE", "level": "TRACE", "description": "Trace level indicator"},
            {"text": "[error]", "level": "ERROR", "description": "Bracketed error indicator"},
            {"text": "failed", "level": "ERROR", "description": "Failure keyword indicating error"},
            {"text": "exception", "level": "ERROR", "description": "Exception keyword indicating error"},
            {"text": "timeout", "level": "ERROR", "description": "Timeout indicating error"},
            {"text": "connection refused", "level": "ERROR", "description": "Connection error"},
            {"text": "permission denied", "level": "ERROR", "description": "Permission error"},
            {"text": "échec", "level": "ERROR", "description": "French failure indicator"},
            {"text": "erreur", "level": "ERROR", "description": "French error indicator"},
            {"text": "warning", "level": "WARNING", "description": "Warning keyword"},
            {"text": "latence", "level": "WARNING", "description": "French latency warning"},
            {"text": "success", "level": "INFO", "description": "Success keyword indicating info"}
        ]

        # Source identifiers (enhanced for structured logs)
        source_examples = [
            {"text": "apache", "source": "apache", "description": "Apache web server"},
            {"text": "nginx", "source": "nginx", "description": "Nginx web server"},
            {"text": "kernel", "source": "kernel", "description": "Linux kernel"},
            {"text": "sshd", "source": "sshd", "description": "SSH daemon"},
            {"text": "mysql", "source": "mysql", "description": "MySQL database"},
            {"text": "payment_ddd", "source": "payment_ddd", "description": "Payment service component"},
            {"text": "database_connector", "source": "database_connector", "description": "Database connector service"},
            {"text": "file_uploader", "source": "file_uploader", "description": "File upload service"},
            {"text": "com.example.App", "source": "application", "description": "Java application class"},
            {"text": "app.module", "source": "application", "description": "Python application module"},
            {"text": "httpd", "source": "apache", "description": "Apache HTTP daemon"},
            {"text": "postgres", "source": "postgresql", "description": "PostgreSQL database"},
            {"text": "redis", "source": "redis", "description": "Redis cache server"},
            {"text": "example.py", "source": "python_app", "description": "Python application file"}
        ]

        # Problem indicators (enhanced with French terms)
        problem_examples = [
            {"text": "connection refused", "problem": "Network connectivity issue - service unavailable",
             "severity": "high"},
            {"text": "échec de la connexion", "problem": "Connection failure detected", "severity": "high"},
            {"text": "timeout", "problem": "Operation timeout - performance or connectivity issue",
             "severity": "medium"},
            {"text": "out of memory", "problem": "System resource exhaustion - insufficient memory",
             "severity": "critical"},
            {"text": "file not found", "problem": "Missing resource - file system issue", "severity": "medium"},
            {"text": "permission denied", "problem": "Access control issue - insufficient permissions",
             "severity": "medium"},
            {"text": "permission refusée", "problem": "Access denied - insufficient permissions", "severity": "medium"},
            {"text": "disk full", "problem": "Storage capacity exceeded - disk space issue", "severity": "high"},
            {"text": "authentication failed", "problem": "Security issue - invalid credentials", "severity": "medium"},
            {"text": "database error", "problem": "Database connectivity or query issue", "severity": "high"},
            {"text": "ssl handshake failed", "problem": "SSL/TLS certificate or configuration issue",
             "severity": "medium"},
            {"text": "service unavailable", "problem": "Service outage or overload condition", "severity": "high"},
            {"text": "latence détectée", "problem": "Performance issue - high latency detected", "severity": "medium"},
            {"text": "division by zero", "problem": "Mathematical error - division by zero exception",
             "severity": "medium"},
            {"text": "ZeroDivisionError", "problem": "Python division by zero error", "severity": "medium"},
            {"text": "Traceback", "problem": "Python exception with stack trace", "severity": "high"}
        ]

        # Add examples to collections if not already present
        self._populate_collection(self.timestamp_collection, timestamp_examples, "timestamp")
        self._populate_collection(self.level_collection, level_examples, "level")
        self._populate_collection(self.source_collection, source_examples, "source")
        #self._populate_collection(self.problem_collection, problem_examples, "problem")

    def _populate_collection(self, collection, examples, component_type):
        """Populate a collection with examples if not already present"""
        try:
            existing_count = collection.count()
            if existing_count > 0:
                return  # Already populated
        except:
            pass

        texts = []
        metadatas = []
        ids = []

        for i, example in enumerate(examples):
            texts.append(example["text"])
            metadata = {k: v for k, v in example.items() if k != "text"}
            metadata["component_type"] = component_type
            metadatas.append(metadata)
            ids.append(f"{component_type}_{i}")

        if texts:
            embeddings = self.embedding_model.encode(texts)
            collection.add(
                embeddings=embeddings.tolist(),
                documents=texts,
                metadatas=metadatas,
                ids=ids
            )

    def detect_encoding(self, file_bytes: bytes) -> str:
        """Detect file encoding"""
        result = chardet.detect(file_bytes)
        return result['encoding'] or 'utf-8'

    def is_multiline_continuation(self, line: str) -> bool:
        """Check if a line is part of a multi-line log entry"""
        for pattern in self.multiline_indicators:
            if re.match(pattern, line):
                return True
        return False

    def group_log_lines(self, lines: List[str]) -> List[List[str]]:
        """Group related log lines together (e.g., stack traces)"""
        grouped_lines = []
        current_group = []

        for line in lines:
            line = line.strip()
            if not line or line.startswith('#'):
                continue

            # Check if this line starts a new log entry (has timestamp)
            has_timestamp = self.has_timestamp_pattern(line)
            is_continuation = self.is_multiline_continuation(line)

            if has_timestamp and not is_continuation:
                # Start new group
                if current_group:
                    grouped_lines.append(current_group)
                current_group = [line]
            elif is_continuation or (current_group and not has_timestamp):
                # Continue current group
                if current_group:
                    current_group.append(line)
                else:
                    # Orphaned continuation line, start new group
                    current_group = [line]
            else:
                # New standalone entry
                if current_group:
                    grouped_lines.append(current_group)
                current_group = [line]

        # Add final group
        if current_group:
            grouped_lines.append(current_group)

        return grouped_lines

    def has_timestamp_pattern(self, line: str) -> bool:
        """Check if line contains a timestamp pattern"""
        timestamp_patterns = [
            r'\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}Z?',  # ISO format
            r'[A-Za-z]{3}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2}',  # Syslog format
            r'\[\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}',  # Bracketed timestamp
            r'\d{2}/[A-Za-z]{3}/\d{4}:\d{2}:\d{2}:\d{2}',  # Nginx format
            r'\d{10}',  # Unix timestamp
        ]

        for pattern in timestamp_patterns:
            if re.search(pattern, line):
                return True
        return False

    def extract_log_lines(self, content: str) -> List[List[str]]:
        """Extract and group log lines from content"""
        lines = content.split('\n')
        return self.group_log_lines(lines)

    def embed_log_content(self, log_groups: List[List[str]]) -> str:
        """Embed log content into ChromaDB and return collection ID"""
        collection_id = f"log_session_{uuid.uuid4().hex[:8]}"

        # Create temporary collection for this log session
        session_collection = self.chroma_client.create_collection(
            name=collection_id,
            metadata={"description": f"Log session {collection_id}"}
        )

        # Embed each log group as a single document
        documents = []
        for group in log_groups:
            documents.append(" ".join(group))

        embeddings = self.embedding_model.encode(documents)

        session_collection.add(
            embeddings=embeddings.tolist(),
            documents=documents,
            metadatas=[{"group_number": i, "line_count": len(group)} for i, group in enumerate(log_groups)],
            ids=[f"log_group_{i}" for i in range(len(log_groups))]
        )

        return collection_id

    def semantic_query_component(self, collection, log_content: str, component_name: str) -> Dict[str, Any]:
        """Query a specific component collection for the log content"""
        # Create query embedding
        query_embedding = self.embedding_model.encode([log_content])

        # Query the collection
        results = collection.query(
            query_embeddings=query_embedding.tolist(),
            n_results=3
        )

        if not results['documents'][0]:
            return {"value": "", "confidence": 0.0, "reasoning": f"No {component_name} patterns found"}

        # Get the best match
        best_match = results['documents'][0][0]
        best_metadata = results['metadatas'][0][0]
        confidence = 1.0 - results['distances'][0][0] if 'distances' in results else 0.8

        return {
            "value": best_metadata.get(component_name, ""),
            "confidence": confidence,
            "reasoning": f"Matched with '{best_match}' - {best_metadata.get('description', '')}",
            "metadata": best_metadata
        }

    def extract_timestamp_from_line(self, line: str) -> Optional[str]:
        """Extract timestamp from a log line using improved regex patterns"""
        # Enhanced timestamp patterns that preserve the original timestamp
        timestamp_patterns = [
            # ISO format with Z (2025-07-22T08:17:05Z)
            r'(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z?)',
            # ISO format with space (2025-07-22 08:17:05)
            r'(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})',
            # Syslog format (Oct 09 14:32:40)
            r'([A-Za-z]{3}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2})',
            # Bracketed timestamp
            r'\[([^\]]+)\]',
            # Nginx format
            r'(\d{2}/[A-Za-z]{3}/\d{4}:\d{2}:\d{2}:\d{2}\s+[+-]\d{4})',
            # Unix timestamp
            r'(\d{10})',
            # Time only
            r'^(\d{2}:\d{2}:\d{2})',
        ]

        for pattern in timestamp_patterns:
            match = re.search(pattern, line)
            if match:
                return match.group(1)

        return None

    def normalize_timestamp_for_java(self, timestamp_str: str) -> str:
        """Convert various timestamp formats to Java LocalDateTime compatible format"""
        if not timestamp_str:
            return datetime.now().strftime('%Y-%m-%dT%H:%M:%S')

        try:
            original_timestamp = timestamp_str.strip()

            # Handle ISO format with Z (remove Z and return as-is if valid)
            if original_timestamp.endswith('Z'):
                clean_timestamp = original_timestamp[:-1]
                if re.match(r'\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$', clean_timestamp):
                    return clean_timestamp

            # Handle ISO format with T (already Java compatible)
            if re.match(r'\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$', original_timestamp):
                return original_timestamp

            # Handle ISO format with space (convert space to T)
            space_match = re.match(r'(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})', original_timestamp)
            if space_match:
                return f"{space_match.group(1)}T{space_match.group(2)}"

            # Handle syslog format (Oct 09 14:32:40)
            syslog_match = re.match(r'([A-Za-z]{3})\s+(\d{1,2})\s+(\d{2}:\d{2}:\d{2})', original_timestamp)
            if syslog_match:
                month_map = {
                    'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
                    'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
                    'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
                }
                month_str = syslog_match.group(1)
                day = syslog_match.group(2).zfill(2)
                time = syslog_match.group(3)
                year = datetime.now().year
                month = month_map.get(month_str, '01')
                return f"{year}-{month}-{day}T{time}"

            # Handle nginx format (09/Oct/2023:14:32:40 +0000)
            nginx_match = re.match(r'(\d{2})/([A-Za-z]{3})/(\d{4}):(\d{2}:\d{2}:\d{2})', original_timestamp)
            if nginx_match:
                month_map = {
                    'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
                    'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
                    'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
                }
                day = nginx_match.group(1)
                month_str = nginx_match.group(2)
                year = nginx_match.group(3)
                time = nginx_match.group(4)
                month = month_map.get(month_str, '01')
                return f"{year}-{month}-{day}T{time}"

            # Handle unix timestamp
            if re.match(r'^\d{10}$', original_timestamp):
                unix_time = int(original_timestamp)
                dt = datetime.fromtimestamp(unix_time)
                return dt.strftime('%Y-%m-%dT%H:%M:%S')

            # Handle time only (assume today's date)
            if re.match(r'^\d{2}:\d{2}:\d{2}$', original_timestamp):
                today = datetime.now()
                return f"{today.strftime('%Y-%m-%d')}T{original_timestamp}"

        except Exception as e:
            pass

        # Fallback: current time in correct format
        return datetime.now().strftime('%Y-%m-%dT%H:%M:%S')

    def extract_timestamp_semantic(self, log_content: str) -> str:
        """Extract timestamp preserving original date/time"""
        # Use the first line for timestamp extraction
        first_line = log_content.split('\n')[0] if '\n' in log_content else log_content

        # First try direct extraction
        extracted_timestamp = self.extract_timestamp_from_line(first_line)

        if extracted_timestamp:
            return self.normalize_timestamp_for_java(extracted_timestamp)

        # Fallback to semantic search
        result = self.semantic_query_component(self.timestamp_collection, first_line, "type")

        if result["confidence"] > 0.3:
            # Use regex to extract actual timestamp based on identified pattern
            timestamp_patterns = {
                "iso_date": r"(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})",
                "iso_z": r"(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z?)",
                "syslog": r"([A-Za-z]{3}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2})",
                "apache": r"\[([^\]]+)\]",
                "nginx": r"(\d{2}/[A-Za-z]{3}/\d{4}:\d{2}:\d{2}:\d{2}\s+[+-]\d{4})",
                "iso_ms": r"(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z?)",
                "unix": r"(\d{10})",
                "time_only": r"(\d{2}:\d{2}:\d{2})"
            }

            pattern_type = result["value"]
            if pattern_type in timestamp_patterns:
                match = re.search(timestamp_patterns[pattern_type], first_line)
                if match:
                    extracted_timestamp = match.group(1)

        # If still no timestamp found, use current time
        if not extracted_timestamp:
            extracted_timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

        # Normalize to Java LocalDateTime format
        return self.normalize_timestamp_for_java(extracted_timestamp)

    def extract_level_from_line(self, line: str) -> Optional[str]:
        """Extract log level from a line using direct pattern matching"""
        line_upper = line.upper()

        # Direct level indicators (case insensitive)
        level_patterns = [
            (r'\bERROR\b', 'ERROR'),
            (r'\bFATAL\b', 'FATAL'),
            (r'\bCRITICAL\b', 'CRITICAL'),
            (r'\bWARN(?:ING)?\b', 'WARNING'),
            (r'\bINFO\b', 'INFO'),
            (r'\bDEBUG\b', 'DEBUG'),
            (r'\bTRACE\b', 'TRACE'),
        ]

        for pattern, level in level_patterns:
            if re.search(pattern, line_upper):
                return level

        # French error indicators
        line_lower = line.lower()
        if any(word in line_lower for word in
               ['échec', 'erreur', 'failed', 'failure', 'timeout', 'refused', 'refusée', 'permission denied',
                'permission refusée']):
            return 'ERROR'

        # French warning indicators
        if any(word in line_lower for word in ['latence', 'warning', 'avertissement']):
            return 'WARNING'

        return None

    def extract_level_semantic(self, log_content: str) -> str:
        """Extract log level with improved accuracy"""
        # Check first line first
        first_line = log_content.split('\n')[0] if '\n' in log_content else log_content

        # Try direct extraction first
        direct_level = self.extract_level_from_line(first_line)
        if direct_level:
            return direct_level

        # Use semantic search
        result = self.semantic_query_component(self.level_collection, first_line, "level")

        if result["confidence"] > 0.3:
            return result["value"]

        # Check full content for multi-line entries
        log_lower = log_content.lower()
        if any(word in log_lower for word in
               ['traceback', 'exception', 'error:', 'zerodivisionerror', 'failed', 'failure', 'fatal', 'échec',
                'erreur', 'timeout', 'refused', 'refusée']):
            return "ERROR"
        elif any(word in log_lower for word in ['warn', 'warning', 'latence', 'avertissement']):
            return "WARNING"
        elif any(word in log_lower for word in ['debug', 'trace']):
            return "DEBUG"

        return "INFO"

    def extract_source_from_line(self, line: str) -> Optional[str]:
        """Extract source component from structured log line"""
        # Pattern for structured logs: timestamp LEVEL source message
        # Example: 2025-07-22T08:17:05Z WARNING payment_ddd Latence eee détectée

        # Remove timestamp first
        line_clean = line
        timestamp = self.extract_timestamp_from_line(line)
        if timestamp:
            line_clean = line.replace(timestamp, "").strip()

        # Remove common prefixes and level indicators
        line_clean = re.sub(r'^[A-Z]+\s+', '', line_clean.strip())  # Remove level
        line_clean = re.sub(r'^\w{3}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2}\s+\w+\s+', '', line_clean)  # Remove syslog prefix

        # Extract first word/identifier that looks like a component name
        words = line_clean.split()
        if words:
            first_word = words[0].strip()
            # Check if it looks like a component name (contains letters/numbers/underscores)
            if re.match(r'^[a-zA-Z][a-zA-Z0-9_-]*', first_word):
                return first_word

        return None

    def extract_source_semantic(self, log_content: str, filename: str = "") -> str:
        """Extract source using improved detection"""
        first_line = log_content.split('\n')[0] if '\n' in log_content else log_content

        # Try direct extraction from structured log format first
        direct_source = self.extract_source_from_line(first_line)
        if direct_source:
            return direct_source

        # Use semantic search
        result = self.semantic_query_component(self.source_collection, log_content, "source")

        if result["confidence"] > 0.4:
            return result["value"]

        # Look for file references in stack traces
        file_pattern = r'File "([^"]+)"'
        file_matches = re.findall(file_pattern, log_content)
        if file_matches:
            source_file = file_matches[0]
            if source_file.endswith('.py'):
                return "python_app"
            elif source_file.endswith('.java'):
                return "java_app"
            elif source_file.endswith('.js'):
                return "javascript_app"
            else:
                return Path(source_file).stem

        # Fallback: extract from filename or log content
        if filename:
            filename_lower = filename.lower()
            if "apache" in filename_lower or "httpd" in filename_lower:
                return "apache"
            elif "nginx" in filename_lower:
                return "nginx"
            elif "mysql" in filename_lower:
                return "mysql"
            elif any(app in filename_lower for app in ["app", "application", "service"]):
                return "application"

        # Extract from log content
        log_lower = log_content.lower()
        for source_word in ["apache", "nginx", "mysql", "postgres", "redis", "kernel", "sshd"]:
            if source_word in log_lower:
                return source_word

        return "system"

    def clean_message_content(self, line: str, timestamp: str, level: str, source: str) -> str:
        """Clean message by removing timestamp, level, and source"""
        message = line

        # Remove original timestamp
        if timestamp:
            # Try to find and remove the original timestamp format
            original_timestamp = self.extract_timestamp_from_line(line)
            if original_timestamp:
                message = message.replace(original_timestamp, "").strip()

        # Remove level indicators (case insensitive)
        level_patterns = [
            level.upper(), level.lower(),
            f"[{level.upper()}]", f"[{level.lower()}]",
            f"{level.upper()}:", f"{level.lower()}:"
        ]

        for pattern in level_patterns:
            message = message.replace(pattern, "").strip()

        # Remove source component
        if source and source != "system":
            # Remove exact source name
            message = message.replace(source, "").strip()
            # Remove source with common separators
            message = re.sub(rf'\b{re.escape(source)}\b[\s:-]*', '', message).strip()

        # Clean up remaining formatting
        message = re.sub(r'^\s*[-:]+\s*', '', message)  # Remove leading separators
        message = re.sub(r'\s+', ' ', message)  # Normalize whitespace

        return message.strip()

    def extract_message_semantic(self, log_content: str, timestamp: str, level: str, source: str,
                                 is_multiline: bool = False, stack_trace: Optional[List[str]] = None) -> str:
        """Extract core message with improved cleaning"""
        lines = log_content.split('\n')
        first_line = lines[0]

        # Clean the first line to get the main message
        message = self.clean_message_content(first_line, timestamp, level, source)

        # If message is empty or too short, try to extract from remaining content
        if len(message) < 5:
            # Look for meaningful content after the structured parts
            words = first_line.split()
            if len(words) > 3:  # Skip timestamp, level, source
                message = " ".join(words[3:])

        base_message = message or first_line

        # If there's a stack trace, integrate it cleverly into the message
        if is_multiline and stack_trace:
            # Extract key information from stack trace
            exception_line = None
            file_info = None

            for line in stack_trace:
                # Find the actual exception (usually the last line)
                if ':' in line and any(err in line.lower() for err in ['error', 'exception']):
                    exception_line = line.strip()
                # Find file information
                elif 'File "' in line:
                    file_match = re.search(r'File "([^"]+)", line (\d+)', line)
                    if file_match:
                        filename = file_match.group(1)
                        line_num = file_match.group(2)
                        file_info = f"{filename}:{line_num}"

            # Construct enhanced message
            if exception_line and file_info:
                return f"{base_message} → {exception_line} (at {file_info})"
            elif exception_line:
                return f"{base_message} → {exception_line}"
            elif file_info:
                return f"{base_message} (error at {file_info})"
            else:
                # Include first few lines of stack trace as context
                stack_preview = " | ".join([line.strip() for line in stack_trace[:2] if line.strip()])
                return f"{base_message} | {stack_preview}"

        return base_message

    def extract_problem_semantic(self, log_content: str, level: str) -> str:
        """🚀 UPDATED: Extract problem description using the enhanced RAG system"""

        # Use the new problem RAG system to find the closest matching problem
        problem_result = self.problem_rag.find_closest_problem(log_content, confidence_threshold=0.3)

        # If we found a good match, return the detailed description
        if problem_result["confidence"] > 0.3:
            # Format the problem with additional context
            problem_title = problem_result["title"]
            problem_desc = problem_result["description"]
            confidence = problem_result["confidence"]
            category = problem_result.get("category", "Unknown")
            severity = problem_result.get("severity", "unknown")

            # Return enhanced problem description
            return f"{problem_title}: {problem_desc}"

        # Fallback to basic rule-based detection for very low confidence
        return self._fallback_problem_detection(log_content, level)

    def _fallback_problem_detection(self, log_content: str, level: str) -> str:
        """Fallback problem detection when RAG confidence is too low"""
        log_lower = log_content.lower()

        if level == "ERROR":
            if "connection" in log_lower or "connexion" in log_lower:
                return "Connection Error: Network connectivity issue detected"
            elif "file" in log_lower and ("not found" in log_lower or "missing" in log_lower):
                return "File Not Found: Required file or resource missing"
            elif "memory" in log_lower or "mémoire" in log_lower:
                return "Memory Error: Memory-related issue detected"
            elif "timeout" in log_lower or "délai" in log_lower:
                return "Timeout Error: Operation timeout detected"
            elif "division" in log_lower and "zero" in log_lower:
                return "Division by Zero Error: Mathematical error in calculation"
            else:
                return "General Error: Error condition detected"
        elif level == "WARNING":
            if "latence" in log_lower or "latency" in log_lower:
                return "Performance Warning: High latency detected"
            else:
                return "Warning: Warning condition detected"
        elif level == "FATAL" or level == "CRITICAL":
            return "Critical Issue: Fatal error requiring immediate attention"

        return "No Specific Issue: Normal operation or informational entry"

    def call_llm(self, prompt: str) -> str:
        """Call local Ollama LLM for analysis"""
        try:
            payload = {
                "model": "llama3.2:1b",
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.1,
                    "num_predict": 80
                }
            }

            response = requests.post(self.llm_endpoint, json=payload, timeout=15)
            if response.status_code == 200:
                return response.json()['response'].strip()
        except:
            pass
        return "Analysis not available"

    def parse_log_group_semantic(self, log_lines: List[str], filename: str = "") -> LogEntry:
        """Parse a group of related log lines as a single entry (UPDATED)"""

        # Combine all lines for analysis
        log_content = '\n'.join(log_lines)
        is_multiline = len(log_lines) > 1

        # Extract each component using semantic search
        timestamp = self.extract_timestamp_semantic(log_content)
        level = self.extract_level_semantic(log_content)
        source = self.extract_source_semantic(log_content, filename)

        # For multi-line entries, separate main message from stack trace
        stack_trace = log_lines[1:] if is_multiline else None
        message = self.extract_message_semantic(log_content, timestamp, level, source, is_multiline, stack_trace)

        # 🚀 NEW: Use enhanced problem detection
        problem = self.extract_problem_semantic(log_content, level)

        return LogEntry(
            timestamp=timestamp,
            level=level.upper(),
            source=source,
            message=message,
            problem=problem
        )

    def get_problem_rag_stats(self) -> Dict[str, Any]:
        """Get statistics from the problem RAG system"""
        return self.problem_rag.get_problem_statistics()

    def search_problems_by_category(self, category: str) -> List[Dict[str, Any]]:
        """Search problems by category using the RAG system"""
        return self.problem_rag.search_problems_by_category(category)

    def test_problem_detection(self, log_content: str) -> Dict[str, Any]:
        """Test endpoint to see what problem would be detected"""
        problem_result = self.problem_rag.find_closest_problem(log_content)
        return {
            "log_content": log_content,
            "detected_problem": problem_result,
            "formatted_problem": self.extract_problem_semantic(log_content, "ERROR")
        }

    def process_log_file(self, file_bytes: bytes, filename: str) -> List[LogEntry]:
        """Process entire log file using semantic approach with multi-line support and caching"""
        try:
            # Detect encoding and decode content
            encoding = self.detect_encoding(file_bytes)
            content = file_bytes.decode(encoding)

            # 🎯 CHECK CACHE FIRST
            cached_result = self.cache.get(content, "log_parse")
            if cached_result:
                return cached_result

            # Extract and group log lines
            log_groups = self.extract_log_lines(content)

            if not log_groups:
                return []

            # Embed log content for semantic analysis
            collection_id = self.embed_log_content(log_groups)

            # Parse each log group
            parsed_logs = []
            for group in log_groups:
                if group and any(line.strip() for line in group):
                    try:
                        log_entry = self.parse_log_group_semantic(group, filename)
                        parsed_logs.append(log_entry)
                    except Exception as e:
                        # Create a basic entry for unparseable groups
                        parsed_logs.append(LogEntry(
                            timestamp=datetime.now().strftime('%Y-%m-%dT%H:%M:%S'),
                            level="UNKNOWN",
                            source=filename,
                            message=' '.join(group),
                            problem=f"Parsing error: {str(e)}"
                        ))

            # 💾 CACHE THE RESULT
            self.cache.set(content, parsed_logs, "log_parse")

            # Clean up temporary collection
            try:
                self.chroma_client.delete_collection(collection_id)
            except:
                pass

            return parsed_logs

        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error processing file: {str(e)}")


# FastAPI application
router = APIRouter()

# Initialize with custom cache config
cache_config = CacheConfig(
    host=os.getenv("REDIS_HOST", "localhost"),
    port=int(os.getenv("REDIS_PORT", 6379)),
    db=int(os.getenv("REDIS_DB", 0)),
    ttl_seconds=int(os.getenv("CACHE_TTL", 3600))  # 1 hour default
)

semantic_parser = SemanticLogParser(cache_config)


@router.post("/rag/parse", response_model=List[LogEntry])
async def parse_logs(file: UploadFile = File(...)):
    """
    Parse log file using semantic search approach with multi-line support and Redis caching
    Returns timestamps in Java LocalDateTime compatible format (YYYY-MM-DDTHH:MM:SS)
    """
    try:
        file_bytes = await file.read()
        parsed_logs = semantic_parser.process_log_file(file_bytes, file.filename)
        return parsed_logs

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing log file: {str(e)}")


@router.get("/health")
async def health_check():
    """Health check endpoint with cache status"""
    cache_stats = semantic_parser.cache.get_stats()
    return {
        "status": "healthy",
        "service": "Enhanced Semantic RAG Log Parser with Redis Cache",
        "cache": cache_stats
    }


@router.get("/cache/stats")
async def get_cache_stats():
    """Get detailed cache statistics"""
    return semantic_parser.cache.get_stats()


@router.post("/cache/clear")
async def clear_cache():
    """Clear all cached parsing results"""
    cleared_count = semantic_parser.cache.clear_cache("log_parse:*")
    return {
        "message": f"Cleared {cleared_count} cache entries",
        "cleared_count": cleared_count
    }


@router.get("/component-knowledge")
async def get_component_knowledge():
    """Get knowledge base for each component"""
    try:
        knowledge = {}

        collections = [
            ("timestamps", semantic_parser.timestamp_collection),
            ("levels", semantic_parser.level_collection),
            ("sources", semantic_parser.source_collection),
            ("problems", semantic_parser.problem_collection)
        ]

        for name, collection in collections:
            try:
                results = collection.get()
                knowledge[name] = {
                    "count": len(results['ids']),
                    "examples": [
                        {
                            "text": doc,
                            "metadata": meta
                        }
                        for doc, meta in zip(results['documents'][:5], results['metadatas'][:5])
                    ]
                }
            except Exception as e:
                knowledge[name] = {"error": str(e)}

        return knowledge

    except Exception as e:
        return {"error": str(e)}


@router.post("/query-component")
async def query_component(component: str, query: str):
    """Query a specific component for semantic similarity"""
    try:
        collections = {
            "timestamp": semantic_parser.timestamp_collection,
            "level": semantic_parser.level_collection,
            "source": semantic_parser.source_collection,
            "problem": semantic_parser.problem_collection
        }

        if component not in collections:
            raise HTTPException(status_code=400, detail=f"Invalid component. Choose from: {list(collections.keys())}")

        result = semantic_parser.semantic_query_component(collections[component], query, component)
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error querying component: {str(e)}")


@router.post("/test-timestamp-normalization")
async def test_timestamp_normalization(timestamp: str):
    """Test endpoint to verify timestamp normalization for Java compatibility"""
    try:
        normalized = semantic_parser.normalize_timestamp_for_java(timestamp)
        return {
            "original": timestamp,
            "normalized": normalized,
            "java_compatible": bool(re.match(r'\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}', normalized))
        }
    except Exception as e:
        return {"error": str(e)}


@router.post("/test-line-parsing")
async def test_line_parsing(log_line: str):
    """Test endpoint to verify parsing of individual log lines"""
    try:
        # Extract components individually for testing
        timestamp = semantic_parser.extract_timestamp_from_line(log_line)
        normalized_timestamp = semantic_parser.normalize_timestamp_for_java(timestamp) if timestamp else None
        level = semantic_parser.extract_level_from_line(log_line)
        source = semantic_parser.extract_source_from_line(log_line)

        # Clean message
        message = semantic_parser.clean_message_content(
            log_line,
            normalized_timestamp or "",
            level or "",
            source or ""
        )

        return {
            "original_line": log_line,
            "extracted_timestamp": timestamp,
            "normalized_timestamp": normalized_timestamp,
            "extracted_level": level,
            "extracted_source": source,
            "cleaned_message": message
        }
    except Exception as e:
        return {"error": str(e)}