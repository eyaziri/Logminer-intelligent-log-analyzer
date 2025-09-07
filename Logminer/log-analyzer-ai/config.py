import os
from dotenv import load_dotenv
from pathlib import Path

load_dotenv()

class Config:
    # API Keys
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
    HF_TOKEN = os.getenv('HF_TOKEN')
    
    # Paths
   # LOG_PATH = Path(os.getenv('LOG_PATH'))
   # OUTPUT_PATH = Path(os.getenv('OUTPUT_PATH'))
   # EMBEDDINGS_PATH = Path(os.getenv('EMBEDDINGS_PATH'))
   # METADATA_PATH = Path(os.getenv('METADATA_PATH'))
    
    # Model Config
    EMBEDDING_MODEL = 'all-MiniLM-L6-v2'
    GEMINI_MODEL = "gemini-1.5-flash"
    
    # Processing Config
    MAX_CHUNK_SIZE = 2048
    OVERLAP_SIZE = 300
    MAX_RETRIES = 3

    # API DeepSeek
    DEEPSEEK_API_KEY= os.getenv('DEEPSEEK_API_KEY')
    OPENROUTER_API_KEY= os.getenv('OPENROUTER_API_KEY')