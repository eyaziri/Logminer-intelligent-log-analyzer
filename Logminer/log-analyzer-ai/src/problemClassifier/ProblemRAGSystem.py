import os
import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Any, Optional
import uuid
import re


class ProblemRAGSystem:
    """Separate RAG system for comprehensive problem detection"""

    def __init__(self, chroma_path: str = "./problem_chroma_db"):
        # Initialize ChromaDB for problems
        self.chroma_client = chromadb.PersistentClient(
            path=chroma_path,
            settings=Settings(allow_reset=True)
        )

        # Create collection for problem patterns
        self.problem_collection = self._get_or_create_collection(
            "comprehensive_problems",
            "Comprehensive problem patterns and descriptions"
        )

        # Initialize embedding model
        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')

        # Initialize the comprehensive problem knowledge base
        self._initialize_comprehensive_problems()

    def _get_or_create_collection(self, name: str, description: str):
        """Get or create a ChromaDB collection"""
        try:
            return self.chroma_client.get_collection(name)
        except:
            return self.chroma_client.create_collection(
                name=name,
                metadata={"description": description}
            )

    def _initialize_comprehensive_problems(self):
        """Initialize comprehensive problem patterns from your document"""

        # Check if already populated
        try:
            existing_count = self.problem_collection.count()
            if existing_count > 0:
                print(f"✅ Problem collection already contains {existing_count} entries")
                return
        except:
            pass

        # Comprehensive problem patterns from your document
        problem_patterns = [
            # Authentication & Access Issues
            {
                "category": "Authentication & Access",
                "title": "Authentication Failure",
                "patterns": ["authentication failed", "login failed", "invalid password", "expired token",
                             "unknown user", "denied login", "échec d'authentification", "connexion échouée"],
                "description": "Login or credential validation errors (invalid password, expired token, unknown user)",
                "severity": "medium",
                "keywords": ["auth", "login", "credential", "password", "token"]
            },
            {
                "category": "Authentication & Access",
                "title": "Authorization Denied / Permission Error",
                "patterns": ["access denied", "permission denied", "permission refusée", "insufficient privileges",
                             "EACCES", "authorization failed"],
                "description": "User or process lacked needed privileges for the requested operation",
                "severity": "medium",
                "keywords": ["permission", "access", "denied", "privileges", "authorization"]
            },
            {
                "category": "Authentication & Access",
                "title": "Account Locked / Disabled",
                "patterns": ["account locked", "user disabled", "account suspended", "too many failed attempts"],
                "description": "Repeated failed logins resulted in account lockout or user account is disabled",
                "severity": "high",
                "keywords": ["account", "locked", "disabled", "suspended"]
            },
            {
                "category": "Authentication & Access",
                "title": "Certificate/SSL Error",
                "patterns": ["certificate expired", "ssl handshake failed", "tls handshake failure", "untrusted ca",
                             "certificate invalid", "ssl error"],
                "description": "TLS/SSL certificate problems preventing secure connections",
                "severity": "high",
                "keywords": ["certificate", "ssl", "tls", "handshake", "ca"]
            },

            # Connectivity & Networking Problems
            {
                "category": "Connectivity & Networking",
                "title": "Connection Reset / Refused",
                "patterns": ["connection reset", "connection refused", "connexion refusée", "connection reset by peer",
                             "tcp rst"],
                "description": "Network connections unexpectedly closed or refused by remote service",
                "severity": "high",
                "keywords": ["connection", "reset", "refused", "peer", "tcp"]
            },
            {
                "category": "Connectivity & Networking",
                "title": "Timeout / Unreachable",
                "patterns": ["connection timeout", "connection timed out", "host unreachable", "timeout",
                             "délai dépassé", "no response"],
                "description": "Network timeouts or destination unreachable errors",
                "severity": "medium",
                "keywords": ["timeout", "unreachable", "timed out", "délai"]
            },
            {
                "category": "Connectivity & Networking",
                "title": "Network Interface Issues",
                "patterns": ["interface down", "link down", "network interface", "interface gi0/1 changed state"],
                "description": "Network interface or link state changes indicating connectivity problems",
                "severity": "high",
                "keywords": ["interface", "link", "down", "network"]
            },
            {
                "category": "Connectivity & Networking",
                "title": "DNS Resolution Failure",
                "patterns": ["dns resolution failed", "name resolution", "host not found", "nxdomain"],
                "description": "DNS lookup failures preventing hostname resolution",
                "severity": "medium",
                "keywords": ["dns", "resolution", "hostname", "nxdomain"]
            },

            # Resource Exhaustion & Performance
            {
                "category": "Resource Exhaustion",
                "title": "Out of Memory (OOM)",
                "patterns": ["out of memory", "oom killed", "oomkilled", "memory exhausted", "killed process",
                             "manque de mémoire"],
                "description": "Process terminated due to memory exhaustion",
                "severity": "critical",
                "keywords": ["memory", "oom", "killed", "exhausted"]
            },
            {
                "category": "Resource Exhaustion",
                "title": "CPU/Load Spike",
                "patterns": ["high cpu", "cpu saturation", "load average", "process thrashing", "cpu spike"],
                "description": "High CPU utilization or system load causing performance issues",
                "severity": "medium",
                "keywords": ["cpu", "load", "performance", "saturation"]
            },
            {
                "category": "Resource Exhaustion",
                "title": "Disk Full (ENOSPC)",
                "patterns": ["no space left", "disk full", "enospc", "espace disque insuffisant", "device full"],
                "description": "Storage exhaustion preventing write operations",
                "severity": "critical",
                "keywords": ["disk", "space", "full", "enospc", "storage"]
            },
            {
                "category": "Resource Exhaustion",
                "title": "File Handle/Process Limits",
                "patterns": ["too many open files", "emfile", "process limit", "file handle", "resource limit"],
                "description": "System limits reached for file handles or processes",
                "severity": "high",
                "keywords": ["files", "handles", "limit", "emfile", "process"]
            },

            # Hardware & System Failures
            {
                "category": "Hardware & System",
                "title": "Kernel Panic / System Crash",
                "patterns": ["kernel panic", "system crash", "blue screen", "panic", "fatal error", "system halt"],
                "description": "Fatal system error causing complete system failure",
                "severity": "critical",
                "keywords": ["kernel", "panic", "crash", "fatal", "system"]
            },
            {
                "category": "Hardware & System",
                "title": "Disk/Storage Failure",
                "patterns": ["disk failure", "i/o error", "read failed", "smart error", "storage failure",
                             "disk error"],
                "description": "Hard drive or storage system failure",
                "severity": "critical",
                "keywords": ["disk", "storage", "smart", "i/o", "failure"]
            },
            {
                "category": "Hardware & System",
                "title": "Memory Hardware Error",
                "patterns": ["memory error", "ecc error", "memory parity", "machine check exception", "memory failure"],
                "description": "Hardware memory errors detected",
                "severity": "critical",
                "keywords": ["memory", "ecc", "parity", "hardware", "error"]
            },

            # Application & Process Errors
            {
                "category": "Application Error",
                "title": "Unhandled Exception",
                "patterns": ["unhandled exception", "nullpointerexception", "segmentation fault", "stack trace",
                             "traceback", "exception non gérée"],
                "description": "Application crashed due to unhandled exception",
                "severity": "high",
                "keywords": ["exception", "crash", "traceback", "segmentation", "null"]
            },
            {
                "category": "Application Error",
                "title": "Division by Zero Error",
                "patterns": ["division by zero", "zerodivisionerror", "arithmetic error", "division par zéro"],
                "description": "Mathematical error - division by zero operation",
                "severity": "medium",
                "keywords": ["division", "zero", "arithmetic", "math"]
            },
            {
                "category": "Application Error",
                "title": "Configuration Error",
                "patterns": ["invalid configuration", "config error", "missing environment", "yaml error",
                             "json parse error"],
                "description": "Application startup or runtime configuration errors",
                "severity": "medium",
                "keywords": ["config", "configuration", "environment", "yaml", "json"]
            },
            {
                "category": "Application Error",
                "title": "Process Termination",
                "patterns": ["process exited", "service died", "unexpected exit", "daemon crashed", "service stopped"],
                "description": "Process or service terminated unexpectedly",
                "severity": "high",
                "keywords": ["process", "service", "exit", "died", "terminated"]
            },

            # Web Server / HTTP Errors
            {
                "category": "Web Server Error",
                "title": "HTTP 4xx Client Error",
                "patterns": ["404 not found", "403 forbidden", "401 unauthorized", "400 bad request",
                             "429 too many requests"],
                "description": "HTTP client error responses",
                "severity": "medium",
                "keywords": ["404", "403", "401", "400", "429", "client error"]
            },
            {
                "category": "Web Server Error",
                "title": "HTTP 5xx Server Error",
                "patterns": ["500 internal server error", "502 bad gateway", "503 service unavailable",
                             "504 gateway timeout"],
                "description": "HTTP server error responses",
                "severity": "high",
                "keywords": ["500", "502", "503", "504", "server error"]
            },
            {
                "category": "Web Server Error",
                "title": "Request Timeout",
                "patterns": ["request timeout", "request timed out", "slow request", "délai d'attente dépassé"],
                "description": "HTTP requests taking too long or timing out",
                "severity": "medium",
                "keywords": ["request", "timeout", "slow", "délai"]
            },

            # Database Errors
            {
                "category": "Database Error",
                "title": "Database Connection Error",
                "patterns": ["could not connect", "connection refused", "database unavailable", "db connection failed",
                             "connexion base échouée"],
                "description": "Database connectivity issues",
                "severity": "high",
                "keywords": ["database", "connection", "db", "mysql", "postgres"]
            },
            {
                "category": "Database Error",
                "title": "Database Authentication Error",
                "patterns": ["access denied for user", "authentication failed", "invalid credentials", "login failed"],
                "description": "Database authentication or authorization failures",
                "severity": "medium",
                "keywords": ["database", "auth", "user", "credentials", "login"]
            },
            {
                "category": "Database Error",
                "title": "SQL Syntax Error",
                "patterns": ["syntax error", "sql error", "invalid sql", "parse error", "erreur syntaxe sql"],
                "description": "SQL query syntax or parsing errors",
                "severity": "medium",
                "keywords": ["sql", "syntax", "query", "parse"]
            },
            {
                "category": "Database Error",
                "title": "Database Deadlock",
                "patterns": ["deadlock", "lock wait timeout", "transaction deadlock", "verrou en attente"],
                "description": "Database deadlock or lock timeout issues",
                "severity": "medium",
                "keywords": ["deadlock", "lock", "transaction", "timeout"]
            },
            {
                "category": "Database Error",
                "title": "Database Resource Limit",
                "patterns": ["too many connections", "out of shared memory", "table is full", "max connections"],
                "description": "Database resource limits exceeded",
                "severity": "high",
                "keywords": ["connections", "memory", "limit", "max", "resource"]
            },

            # Container & Orchestration Issues
            {
                "category": "Container Error",
                "title": "Container OOMKilled",
                "patterns": ["oomkilled", "exit code 137", "container killed", "memory limit exceeded"],
                "description": "Container terminated due to memory limit exceeded",
                "severity": "high",
                "keywords": ["container", "oom", "killed", "memory", "limit"]
            },
            {
                "category": "Container Error",
                "title": "CrashLoopBackOff",
                "patterns": ["crashloopbackoff", "back-off restarting", "container crash loop", "restart limit"],
                "description": "Container repeatedly crashing and restarting",
                "severity": "high",
                "keywords": ["crash", "loop", "backoff", "restart", "container"]
            },
            {
                "category": "Container Error",
                "title": "Image Pull Error",
                "patterns": ["imagepullbackoff", "failed to pull image", "image not found", "registry error"],
                "description": "Failed to pull container image from registry",
                "severity": "medium",
                "keywords": ["image", "pull", "registry", "docker", "container"]
            },
            {
                "category": "Container Error",
                "title": "Probe Failure",
                "patterns": ["readiness probe failed", "liveness probe failed", "health check failed", "probe timeout"],
                "description": "Container health check or probe failures",
                "severity": "medium",
                "keywords": ["probe", "readiness", "liveness", "health", "check"]
            },

            # Performance Issues
            {
                "category": "Performance Issue",
                "title": "High Latency Detected",
                "patterns": ["latence détectée", "high latency", "latency detected", "slow response",
                             "performance degradation"],
                "description": "Performance issue with increased response times",
                "severity": "medium",
                "keywords": ["latency", "latence", "slow", "performance", "response"]
            },
            {
                "category": "Performance Issue",
                "title": "Service Overload",
                "patterns": ["service overload", "too many requests", "rate limit exceeded", "service unavailable"],
                "description": "Service overwhelmed with requests or traffic",
                "severity": "high",
                "keywords": ["overload", "requests", "rate", "limit", "traffic"]
            },

            # Security Issues
            {
                "category": "Security Issue",
                "title": "Brute Force Attack",
                "patterns": ["brute force", "repeated login attempts", "multiple failed logins", "attaque par force"],
                "description": "Multiple failed authentication attempts indicating potential attack",
                "severity": "high",
                "keywords": ["brute", "force", "attack", "failed", "attempts"]
            },
            {
                "category": "Security Issue",
                "title": "Firewall Block",
                "patterns": ["firewall blocked", "traffic denied", "connection blocked", "security rule"],
                "description": "Network traffic blocked by firewall rules",
                "severity": "medium",
                "keywords": ["firewall", "blocked", "denied", "security", "rule"]
            },

            # File System Issues
            {
                "category": "File System Error",
                "title": "File Not Found",
                "patterns": ["file not found", "no such file", "fichier introuvable", "missing file"],
                "description": "Required file or resource not found",
                "severity": "medium",
                "keywords": ["file", "not found", "missing", "fichier"]
            },
            {
                "category": "File System Error",
                "title": "File System Corruption",
                "patterns": ["file system corruption", "ext4-fs error", "filesystem error", "corruption détectée"],
                "description": "File system integrity issues or corruption detected",
                "severity": "critical",
                "keywords": ["filesystem", "corruption", "ext4", "integrity"]
            }
        ]

        # Prepare data for embedding
        texts = []
        metadatas = []
        ids = []

        for i, problem in enumerate(problem_patterns):
            # Create searchable text combining patterns and description
            search_text = f"{problem['title']} {' '.join(problem['patterns'])} {problem['description']}"
            texts.append(search_text)

            metadata = {
                "title": problem["title"],
                "category": problem["category"],
                "description": problem["description"],
                "severity": problem["severity"],
                "patterns": ", ".join(problem["patterns"]),
                "keywords": ", ".join(problem["keywords"])
            }
            metadatas.append(metadata)
            ids.append(f"problem_{i}")

        # Generate embeddings and add to collection
        if texts:
            embeddings = self.embedding_model.encode(texts)
            self.problem_collection.add(
                embeddings=embeddings.tolist(),
                documents=texts,
                metadatas=metadatas,
                ids=ids
            )
            print(f"✅ Initialized {len(texts)} comprehensive problem patterns")

    def find_closest_problem(self, log_content: str, confidence_threshold: float = 0.3) -> Dict[str, Any]:
        """
        Find the closest matching problem for the given log content

        Args:
            log_content: The log message/content to analyze
            confidence_threshold: Minimum confidence score to return a match

        Returns:
            Dict with problem title, category, description, confidence, and reasoning
        """
        try:
            # Create query embedding
            query_embedding = self.embedding_model.encode([log_content])

            # Query the collection for best matches
            results = self.problem_collection.query(
                query_embeddings=query_embedding.tolist(),
                n_results=3  # Get top 3 matches for better analysis
            )

            if not results['documents'][0]:
                return {
                    "title": "Unknown Issue",
                    "category": "Unclassified",
                    "description": "No matching problem pattern found",
                    "confidence": 0.0,
                    "severity": "unknown",
                    "reasoning": "No similar patterns in knowledge base"
                }

            # Get the best match
            best_metadata = results['metadatas'][0][0]
            distance = results['distances'][0][0] if 'distances' in results else 0.5
            confidence = max(0.0, 1.0 - distance)  # Convert distance to confidence

            # Additional pattern matching for better accuracy
            log_lower = log_content.lower()
            pattern_bonus = 0.0

            # Check if any specific patterns from the best match appear in the log
            patterns_str = best_metadata.get('patterns', '')
            patterns = [p.strip() for p in patterns_str.split(',') if p.strip()]

            keywords_str = best_metadata.get('keywords', '')
            keywords = [k.strip() for k in keywords_str.split(',') if k.strip()]

            keyword_matches = sum(1 for keyword in keywords if keyword.lower() in log_lower)
            keyword_bonus = min(0.3, keyword_matches * 0.1)

            final_confidence = min(1.0, confidence + pattern_bonus + keyword_bonus)

            if final_confidence < confidence_threshold:
                return {
                    "title": "Unspecified Issue",
                    "category": "Low Confidence",
                    "description": f"Potential match: {best_metadata['title']} (low confidence)",
                    "confidence": final_confidence,
                    "severity": "unknown",
                    "reasoning": f"Best match confidence {final_confidence:.2f} below threshold {confidence_threshold}"
                }

            return {
                "title": best_metadata["title"],
                "category": best_metadata["category"],
                "description": best_metadata["description"],
                "confidence": final_confidence,
                "severity": best_metadata["severity"],
                "reasoning": f"Matched with confidence {final_confidence:.2f}, found patterns: {patterns[:2]}"
            }

        except Exception as e:
            return {
                "title": "Analysis Error",
                "category": "System Error",
                "description": f"Error during problem analysis: {str(e)}",
                "confidence": 0.0,
                "severity": "unknown",
                "reasoning": f"Exception during analysis: {str(e)}"
            }

    def get_problem_statistics(self) -> Dict[str, Any]:
        """Get statistics about the problem knowledge base"""
        try:
            total_count = self.problem_collection.count()

            # Get all problems to analyze categories
            all_problems = self.problem_collection.get()
            categories = {}
            severities = {}

            for metadata in all_problems['metadatas']:
                cat = metadata.get('category', 'Unknown')
                sev = metadata.get('severity', 'unknown')

                categories[cat] = categories.get(cat, 0) + 1
                severities[sev] = severities.get(sev, 0) + 1

            return {
                "total_problems": total_count,
                "categories": categories,
                "severities": severities,
                "status": "healthy"
            }
        except Exception as e:
            return {
                "status": "error",
                "error": str(e)
            }

    def search_problems_by_category(self, category: str) -> List[Dict[str, Any]]:
        """Search problems by category"""
        try:
            all_problems = self.problem_collection.get()
            matching_problems = []

            for i, metadata in enumerate(all_problems['metadatas']):
                if metadata.get('category', '').lower() == category.lower():
                    matching_problems.append({
                        "title": metadata.get('title'),
                        "description": metadata.get('description'),
                        "severity": metadata.get('severity'),
                        "patterns": metadata.get('patterns', [])[:3]  # Show first 3 patterns
                    })

            return matching_problems
        except Exception as e:
            return [{"error": str(e)}]