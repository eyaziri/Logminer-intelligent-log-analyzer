import os
from huggingface_hub import InferenceClient
from config import Config

client = InferenceClient(
    provider="auto",
    api_key=Config.HF_TOKEN,
)

completion = client.chat.completions.create(
    model="deepseek-ai/DeepSeek-R1-0528",
    messages=[
        {
            "role": "user",
            "content": "What is the capital of France?"
        }
    ],
)

print(completion.choices[0].message)