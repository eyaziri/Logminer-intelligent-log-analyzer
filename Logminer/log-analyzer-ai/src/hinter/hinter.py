import os
import json
import re
import hashlib
from datetime import datetime
from typing import List, Dict, Any, Optional
from pathlib import Path

from fastapi import APIRouter, FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import uvicorn
from pydantic import BaseModel

import requests
import chardet
import redis
import pickle


class LogEntry(BaseModel):
    timestamp: str
    level: str
    source: str
    message: str
    problem: str


class Recommendation(BaseModel):
    content: str
    relevanceScore: float
    generatedBy: str
    creationDate: datetime


class HintCacheConfig:
    """Redis cache configuration for hint service"""

    def __init__(self,
                 host: str = "localhost",
                 port: int = 6379,
                 db: int = 1,  # Different DB from parser
                 ttl_seconds: int = 3600 * 24 * 30):  # 30 days for hints
        self.host = host
        self.port = port
        self.db = db
        self.ttl_seconds = ttl_seconds


class HintRedisCache:
    """Redis caching utility for hint/recommendation results"""

    def __init__(self, config: HintCacheConfig):
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
            print(f"✅ Hint Redis connected: {self.config.host}:{self.config.port} DB:{self.config.db}")
        except Exception as e:
            print(f"⚠️ Hint Redis connection failed: {e}. Operating without cache.")
            self.connected = False
            self.client = None

    def _generate_cache_key(self, log_entry: LogEntry) -> str:
        """Generate cache key from log entry hash"""
        # Create a consistent hash from the core log data
        log_data = f"{log_entry.level}:{log_entry.source}:{log_entry.message}:{log_entry.problem}"
        content_hash = hashlib.sha256(log_data.encode('utf-8')).hexdigest()[:16]
        return f"hint:{content_hash}"

    def _generate_batch_cache_key(self, log_entries: List[LogEntry]) -> str:
        """Generate cache key for batch processing"""
        combined_data = "|".join([
            f"{entry.level}:{entry.source}:{entry.message[:100]}:{entry.problem[:50]}"
            for entry in log_entries
        ])
        content_hash = hashlib.sha256(combined_data.encode('utf-8')).hexdigest()[:16]
        return f"hint_batch:{content_hash}"

    def get_single(self, log_entry: LogEntry) -> Optional[Recommendation]:
        """Get cached recommendation for single log entry"""
        if not self.connected:
            return None

        try:
            cache_key = self._generate_cache_key(log_entry)
            cached_data = self.client.get(cache_key)

            if cached_data:
                # Deserialize the cached data
                recommendation_data = pickle.loads(cached_data)
                recommendation = Recommendation(**recommendation_data)
                print(f"🎯 Hint Cache HIT: {cache_key[:25]}...")
                return recommendation

            print(f"❌ Hint Cache MISS: {cache_key[:25]}...")
            return None

        except Exception as e:
            print(f"⚠️ Hint cache read error: {e}")
            return None

    def set_single(self, log_entry: LogEntry, recommendation: Recommendation):
        """Cache recommendation for single log entry"""
        if not self.connected:
            return

        try:
            cache_key = self._generate_cache_key(log_entry)
            recommendation_data = recommendation.dict()
            serialized_data = pickle.dumps(recommendation_data)

            self.client.setex(
                cache_key,
                self.config.ttl_seconds,
                serialized_data
            )
            print(f"💾 Hint Cached: {cache_key[:25]}... (TTL: {self.config.ttl_seconds}s)")

        except Exception as e:
            print(f"⚠️ Hint cache write error: {e}")

    def get_batch(self, log_entries: List[LogEntry]) -> Optional[List[Recommendation]]:
        """Get cached recommendations for batch of log entries"""
        if not self.connected:
            return None

        try:
            cache_key = self._generate_batch_cache_key(log_entries)
            cached_data = self.client.get(cache_key)

            if cached_data:
                # Deserialize the cached data
                recommendations_data = pickle.loads(cached_data)
                recommendations = [Recommendation(**rec_data) for rec_data in recommendations_data]
                print(f"🎯 Hint Batch Cache HIT: {cache_key[:25]}... ({len(recommendations)} items)")
                return recommendations

            print(f"❌ Hint Batch Cache MISS: {cache_key[:25]}...")
            return None

        except Exception as e:
            print(f"⚠️ Hint batch cache read error: {e}")
            return None

    def set_batch(self, log_entries: List[LogEntry], recommendations: List[Recommendation]):
        """Cache recommendations for batch of log entries"""
        if not self.connected:
            return

        try:
            cache_key = self._generate_batch_cache_key(log_entries)
            recommendations_data = [rec.dict() for rec in recommendations]
            serialized_data = pickle.dumps(recommendations_data)

            self.client.setex(
                cache_key,
                self.config.ttl_seconds,
                serialized_data
            )
            print(
                f"💾 Hint Batch Cached: {cache_key[:25]}... ({len(recommendations)} items, TTL: {self.config.ttl_seconds}s)")

        except Exception as e:
            print(f"⚠️ Hint batch cache write error: {e}")

    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        if not self.connected:
            return {"status": "disconnected"}

        try:
            info = self.client.info()
            hint_keys = len(self.client.keys("hint:*"))
            batch_keys = len(self.client.keys("hint_batch:*"))

            return {
                "status": "connected",
                "db": self.config.db,
                "used_memory": info.get('used_memory_human', 'N/A'),
                "total_keys": self.client.dbsize(),
                "hint_keys": hint_keys,
                "batch_keys": batch_keys,
                "hits": info.get('keyspace_hits', 0),
                "misses": info.get('keyspace_misses', 0),
                "hit_rate": round(info.get('keyspace_hits', 0) /
                                  max(info.get('keyspace_hits', 0) + info.get('keyspace_misses', 0), 1) * 100, 2),
                "ttl_seconds": self.config.ttl_seconds
            }
        except Exception as e:
            return {"status": "error", "error": str(e)}

    def clear_cache(self, pattern: str = "hint*") -> int:
        """Clear cache entries matching pattern"""
        if not self.connected:
            return 0

        try:
            keys = self.client.keys(pattern)
            if keys:
                deleted = self.client.delete(*keys)
                print(f"🗑️ Cleared {deleted} hint cache entries")
                return deleted
            return 0
        except Exception as e:
            print(f"⚠️ Hint cache clear error: {e}")
            return 0


class LogHintService:
    def __init__(self, cache_config: Optional[HintCacheConfig] = None):
        # Initialize Redis cache
        self.cache = HintRedisCache(cache_config or HintCacheConfig())

        # Ollama API endpoint (free local LLM)
        self.llm_endpoint = "http://localhost:11434/api/generate"
        self.model_name = "llama3.2:1b"
        self.service_name = "LogHintService"

    def detect_encoding(self, file_bytes: bytes) -> str:
        """Detect file encoding"""
        result = chardet.detect(file_bytes)
        return result['encoding'] or 'utf-8'

    def _clean_content(self, content: str) -> str:
        """Clean content by removing special characters and formatting"""
        # Remove markdown formatting
        content = re.sub(r'\*\*([^*]+)\*\*', r'\1', content)  # Remove **bold**
        content = re.sub(r'\*([^*]+)\*', r'\1', content)  # Remove *italic*
        content = re.sub(r'`([^`]+)`', r'\1', content)  # Remove `code`

        # Remove special characters and formatting
        content = re.sub(r'[#*_`~\[\](){}]', '', content)  # Remove markdown chars
        content = re.sub(r'[-=]{2,}', '', content)  # Remove horizontal lines
        content = re.sub(r'\n{3,}', '\n\n', content)  # Reduce multiple newlines

        # Clean up spacing
        content = re.sub(r'[ \t]+', ' ', content)  # Multiple spaces to single
        content = content.strip()

        return content

    def call_llm_for_analysis(self, log_entry: LogEntry) -> Dict[str, Any]:
        """Call Llama 3.2 for detailed log analysis and recommendations"""

        prompt = f"""You are an expert system administrator. Analyze this log entry and provide a concise, actionable recommendation in plain text.

Log Details:
- Level: {log_entry.level}
- Source: {log_entry.source}  
- Message: {log_entry.message}
- Problem: {log_entry.problem}

Provide a brief paragraph that includes:
1. What the problem is
2. Why it happened
3. How to fix it immediately
4. One prevention tip

Keep the response under 200 words, use plain text only, no special formatting or characters.

Also rate your confidence from 0.0 to 1.0 based on how certain you are about this diagnosis.

Respond in JSON format:
{{
    "content": "Your concise recommendation here...",
    "relevance_score": 0.85
}}"""

        try:
            payload = {
                "model": self.model_name,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.1,  # Lower temperature for more consistent responses
                    "num_predict": 300,  # Shorter responses
                    "top_p": 0.8
                }
            }

            response = requests.post(self.llm_endpoint, json=payload, timeout=30)
            if response.status_code == 200:
                llm_response = response.json()['response'].strip()

                # Try to extract JSON from the response
                try:
                    # Find JSON in response
                    json_start = llm_response.find('{')
                    json_end = llm_response.rfind('}') + 1
                    if json_start >= 0 and json_end > json_start:
                        json_str = llm_response[json_start:json_end]
                        parsed_response = json.loads(json_str)

                        # Clean the content
                        clean_content = self._clean_content(parsed_response.get("content", ""))

                        return {
                            "content": clean_content,
                            "relevance_score": parsed_response.get("relevance_score", 0.5)
                        }
                except json.JSONDecodeError:
                    pass

                # If JSON parsing fails, clean the raw response
                clean_content = self._clean_content(llm_response)
                return {
                    "content": clean_content,
                    "relevance_score": 0.6
                }
            else:
                return self._fallback_analysis(log_entry)

        except Exception as e:
            print(f"LLM call failed: {e}")
            return self._fallback_analysis(log_entry)

    def _fallback_analysis(self, log_entry: LogEntry) -> Dict[str, Any]:
        """Simplified fallback analysis when LLM is not available"""

        message_lower = log_entry.message.lower()
        problem_lower = log_entry.problem.lower()
        combined = f"{message_lower} {problem_lower}"

        if any(word in combined for word in ["connection", "refused", "timeout", "network"]):
            content = f"Network connectivity issue detected in {log_entry.source}. The service or network connection is unavailable. Check if the target service is running with 'systemctl status servicename', verify network connectivity with ping, and check firewall rules. To prevent this, implement connection pooling and monitoring alerts for service availability."
            return {"content": content, "relevance_score": 0.8}

        elif any(word in combined for word in ["memory", "out of memory", "oom"]):
            content = f"Memory issue detected in {log_entry.source}. The system is running out of available memory. Check current memory usage with 'free -h' and 'top', identify memory-heavy processes, and restart the affected service. To prevent this, monitor memory usage and consider increasing allocated memory or optimizing the application."
            return {"content": content, "relevance_score": 0.85}

        elif any(word in combined for word in ["file", "not found", "no such file", "missing"]):
            content = f"File system issue in {log_entry.source}. Required files are missing or inaccessible. Check if the file exists with 'ls -la filepath', verify permissions with 'stat filepath', and restore from backup if needed. To prevent this, implement regular backups and file integrity monitoring."
            return {"content": content, "relevance_score": 0.75}

        elif any(word in combined for word in ["auth", "permission", "denied", "forbidden", "unauthorized"]):
            content = f"Authentication or permission issue in {log_entry.source}. Access is being denied due to insufficient privileges or invalid credentials. Check user permissions with 'id username', verify file permissions with 'ls -la', and update access controls as needed. To prevent this, regularly audit permissions and implement proper role-based access control."
            return {"content": content, "relevance_score": 0.7}

        else:
            content = f"System issue detected in {log_entry.source} with {log_entry.level} severity. Check system logs with 'journalctl -xe', verify service status with 'systemctl status', and monitor system resources with 'top' and 'df -h'. To prevent similar issues, implement comprehensive monitoring and regular health checks."
            return {"content": content, "relevance_score": 0.5}

    def generate_recommendation(self, log_entry: LogEntry) -> Recommendation:
        """Generate comprehensive recommendation for a log entry with caching"""

        # 🎯 CHECK CACHE FIRST
        cached_recommendation = self.cache.get_single(log_entry)
        if cached_recommendation:
            return cached_recommendation

        # Get analysis from LLM or fallback
        analysis = self.call_llm_for_analysis(log_entry)

        recommendation = Recommendation(
            content=analysis.get("content", "No analysis available"),
            relevanceScore=analysis.get("relevance_score", 0.5),
            generatedBy=self.service_name,
            creationDate=datetime.now()
        )

        # 💾 CACHE THE RESULT
        self.cache.set_single(log_entry, recommendation)

        return recommendation

    def generate_batch_recommendations(self, log_entries: List[LogEntry]) -> List[Recommendation]:
        """Generate recommendations for multiple log entries with batch caching"""

        # 🎯 CHECK BATCH CACHE FIRST
        cached_recommendations = self.cache.get_batch(log_entries)
        if cached_recommendations:
            return cached_recommendations

        # Process each entry individually
        recommendations = []
        for log_entry in log_entries:
            try:
                # Check individual cache first
                cached_single = self.cache.get_single(log_entry)
                if cached_single:
                    recommendations.append(cached_single)
                else:
                    # Generate new recommendation
                    recommendation = self.generate_recommendation(log_entry)
                    recommendations.append(recommendation)
            except Exception as e:
                # Create a basic recommendation for failed entries
                recommendations.append(Recommendation(
                    content=f"Failed to analyze log entry: {str(e)}. Manual investigation required. Please check the log format and try again.",
                    relevanceScore=0.0,
                    generatedBy=f"{self.service_name} (Error Handler)",
                    creationDate=datetime.now()
                ))

        # 💾 CACHE THE BATCH RESULT
        self.cache.set_batch(log_entries, recommendations)

        return recommendations

    def process_log_json(self, file_bytes: bytes, filename: str) -> List[Recommendation]:
        """Process JSON file containing parsed log entries with caching"""
        try:
            # Detect encoding and decode content
            encoding = self.detect_encoding(file_bytes)
            content = file_bytes.decode(encoding)

            # Parse JSON
            try:
                log_data = json.loads(content)
            except json.JSONDecodeError as e:
                raise HTTPException(status_code=400, detail=f"Invalid JSON format: {str(e)}")

            # Handle both single object and array of objects
            if isinstance(log_data, dict):
                log_entries = [LogEntry(**log_data)]
            elif isinstance(log_data, list):
                log_entries = [LogEntry(**entry) for entry in log_data]
            else:
                raise HTTPException(status_code=400, detail="JSON must contain log entry object(s)")

            # Generate recommendations using batch processing with caching
            recommendations = self.generate_batch_recommendations(log_entries)

            return recommendations

        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error processing file: {str(e)}")


# FastAPI application
router = APIRouter()

# Initialize with custom cache config
hint_cache_config = HintCacheConfig(
    host=os.getenv("REDIS_HOST", "localhost"),
    port=int(os.getenv("REDIS_PORT", 6379)),
    db=int(os.getenv("REDIS_HINT_DB", 1)),  # Different DB from parser
    ttl_seconds=int(os.getenv("HINT_CACHE_TTL", 7200))  # 2 hours default
)

hint_service = LogHintService(hint_cache_config)


@router.post("/hint/gen", response_model=List[Recommendation])
async def generate_hints(file: UploadFile = File(...)):
    """
    Generate hints and recommendations for parsed log entries with Redis caching
    Expects JSON file with log entries in the specified format
    """
    try:
        file_bytes = await file.read()
        recommendations = hint_service.process_log_json(file_bytes, file.filename)
        return recommendations

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating hints: {str(e)}")


@router.post("/analyze-single-log", response_model=Recommendation)
async def analyze_single_log(log_entry: LogEntry):
    """
    Analyze a single log entry and return recommendation with caching
    """
    try:
        recommendation = hint_service.generate_recommendation(log_entry)
        return recommendation

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing log: {str(e)}")


@router.post("/analyze-batch-logs", response_model=List[Recommendation])
async def analyze_batch_logs(log_entries: List[LogEntry]):
    """
    Analyze multiple log entries and return recommendations with batch caching
    """
    try:
        recommendations = hint_service.generate_batch_recommendations(log_entries)
        return recommendations

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing logs: {str(e)}")


@router.get("/health")
async def health_check():
    """Health check endpoint with cache status"""
    cache_stats = hint_service.cache.get_stats()
    return {
        "status": "healthy",
        "service": "Log Hint & Recommendation Service v2.0 with Redis Cache",
        "cache": cache_stats
    }


@router.get("/cache/stats")
async def get_hint_cache_stats():
    """Get detailed hint cache statistics"""
    return hint_service.cache.get_stats()


@router.post("/cache/clear")
async def clear_hint_cache():
    """Clear all cached hint results"""
    cleared_count = hint_service.cache.clear_cache("hint*")
    return {
        "message": f"Cleared {cleared_count} hint cache entries",
        "cleared_count": cleared_count
    }


@router.get("/test-llm")
async def test_llm():
    """Test LLM connectivity"""
    try:
        payload = {
            "model": hint_service.model_name,
            "prompt": "Hello, are you working?",
            "stream": False,
            "options": {"num_predict": 10}
        }

        response = requests.post(hint_service.llm_endpoint, json=payload, timeout=10)
        if response.status_code == 200:
            return {"status": "LLM connected", "model": hint_service.model_name}
        else:
            return {"status": "LLM connection failed", "error": response.text}
    except Exception as e:
        return {"status": "LLM connection failed", "error": str(e)}


# Additional utility endpoints for cache management
@router.get("/cache/keys")
async def get_cache_keys():
    """Get sample cache keys for debugging"""
    if not hint_service.cache.connected:
        return {"error": "Cache not connected"}

    try:
        hint_keys = hint_service.cache.client.keys("hint:*")[:10]  # Sample first 10
        batch_keys = hint_service.cache.client.keys("hint_batch:*")[:10]

        return {
            "sample_hint_keys": [key.decode() if isinstance(key, bytes) else key for key in hint_keys],
            "sample_batch_keys": [key.decode() if isinstance(key, bytes) else key for key in batch_keys],
            "total_hint_keys": len(hint_service.cache.client.keys("hint:*")),
            "total_batch_keys": len(hint_service.cache.client.keys("hint_batch:*"))
        }
    except Exception as e:
        return {"error": str(e)}


@router.post("/cache/clear-expired")
async def clear_expired_cache():
    """Manually trigger cleanup of expired keys (Redis handles this automatically)"""
    if not hint_service.cache.connected:
        return {"error": "Cache not connected"}

    try:
        # Redis automatically handles TTL expiration, but we can get info about it
        info = hint_service.cache.client.info()
        return {
            "message": "Redis handles TTL expiration automatically",
            "expired_keys": info.get('expired_keys', 'N/A'),
            "evicted_keys": info.get('evicted_keys', 'N/A')
        }
    except Exception as e:
        return {"error": str(e)}