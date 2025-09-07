import chainlit as cl
import httpx
import json
from typing import List, Dict
import asyncio
import hashlib
import os

# Use a file-based persistence to survive server restarts
CHAT_HISTORY_FILE = "chat_history.json"


def load_chat_history():
    """Load chat history from file"""
    try:
        if os.path.exists(CHAT_HISTORY_FILE):
            with open(CHAT_HISTORY_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
    except Exception as e:
        print(f"Error loading chat history: {e}")
    return {}


def save_chat_history(chat_sessions):
    """Save chat history to file"""
    try:
        with open(CHAT_HISTORY_FILE, 'w', encoding='utf-8') as f:
            json.dump(chat_sessions, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"Error saving chat history: {e}")


# Load existing chat history
chat_sessions = load_chat_history()


def get_user_id():
    """Generate a consistent user ID based on some unique factors"""
    # You can modify this to use actual user authentication if available
    # For now, we'll use a simple approach
    user_key = "default_user"  # In a real app, use actual user ID
    return hashlib.md5(user_key.encode()).hexdigest()[:8]


@cl.on_chat_start
async def start():
    """Initialize chat session with welcome message and logo"""

    user_id = get_user_id()
    cl.user_session.set("user_id", user_id)

    # Initialize session storage
    if user_id not in chat_sessions:
        chat_sessions[user_id] = []
        # First time user
        await cl.Message(
            content="🤖 **Welcome to AI Assistant!** \n\nHello! I'm your AI assistant powered by Llama 3.2. How can I help you today?",
            author="Assistant"
        ).send()
    else:
        # Returning user - show welcome back message
        await cl.Message(
            content="🤖 **Welcome back!** \n\nYour conversation history has been restored. What would you like to discuss?",
            author="Assistant"
        ).send()

        # Show last few messages from history for context
        if chat_sessions[user_id]:
            recent_messages = chat_sessions[user_id][-4:]  # Show last 4 messages
            history_content = "📜 **Recent conversation:**\n\n"
            for i, msg in enumerate(recent_messages):
                if msg["role"] == "user":
                    history_content += f"**You:** {msg['content'][:100]}{'...' if len(msg['content']) > 100 else ''}\n\n"
                else:
                    history_content += f"**Assistant:** {msg['content'][:100]}{'...' if len(msg['content']) > 100 else ''}\n\n"

            await cl.Message(
                content=history_content,
                author="System"
            ).send()


@cl.on_message
async def on_message(message: cl.Message):
    """Handle incoming messages with streaming response"""

    user_id = cl.user_session.get("user_id", get_user_id())

    # Ensure user exists in chat_sessions
    if user_id not in chat_sessions:
        chat_sessions[user_id] = []

    # Add user message to history
    chat_sessions[user_id].append({
        "role": "user",
        "content": message.content,
        "timestamp": asyncio.get_event_loop().time()
    })

    # Save immediately after adding user message
    save_chat_history(chat_sessions)

    # Create a new client for each request to avoid connection issues
    async with httpx.AsyncClient(timeout=30.0) as temp_client:
        try:
            # Build context from chat history
            context = ""
            if chat_sessions[user_id]:
                recent_history = chat_sessions[user_id][-6:]  # Last 6 messages for context
                for msg_history in recent_history[:-1]:  # Exclude current message
                    if msg_history["role"] == "user":
                        context += f"Human: {msg_history['content']}\n"
                    else:
                        context += f"Assistant: {msg_history['content']}\n"

            # Create prompt with context
            full_prompt = f"{context}Human: {message.content}\nAssistant:" if context else message.content

            collected_text = ""

            # Use POST request without streaming first to avoid connection issues
            try:
                response = await temp_client.post(
                    "http://localhost:11434/api/generate",
                    json={
                        "model": "llama3.2",
                        "prompt": full_prompt,
                        "stream": False  # Use non-streaming for stability
                    },
                    timeout=30.0
                )
                response.raise_for_status()

                data = response.json()
                collected_text = data.get("response", "")

            except Exception:
                # Fallback to streaming if non-streaming fails
                async with temp_client.stream(
                        "POST",
                        "http://localhost:11434/api/generate",
                        json={
                            "model": "llama3.2",
                            "prompt": full_prompt,
                            "stream": True
                        },
                ) as stream_response:
                    stream_response.raise_for_status()

                    async for line in stream_response.aiter_lines():
                        if not line.strip():
                            continue

                        try:
                            data = json.loads(line)
                            chunk = data.get("response", "")
                            collected_text += chunk

                            if data.get("done", False):
                                break
                        except json.JSONDecodeError:
                            continue

            # Send the complete response
            if collected_text:
                await cl.Message(content=collected_text, author="Assistant").send()

                # Add assistant response to history
                chat_sessions[user_id].append({
                    "role": "assistant",
                    "content": collected_text,
                    "timestamp": asyncio.get_event_loop().time()
                })

                # Keep only last 50 messages to prevent memory issues
                if len(chat_sessions[user_id]) > 50:
                    chat_sessions[user_id] = chat_sessions[user_id][-50:]

                # Save after each interaction
                save_chat_history(chat_sessions)
            else:
                await cl.Message(
                    content="🤔 I didn't receive a response. Please try again.",
                    author="System"
                ).send()

        except httpx.ReadTimeout:
            await cl.Message(
                content="⏰ **Request timed out!** \n\nPlease check if Ollama is running and try again.",
                author="System"
            ).send()

        except httpx.HTTPStatusError as e:
            await cl.Message(
                content=f"🚫 **HTTP Error {e.response.status_code}** \n\nThere was an issue connecting to the model.",
                author="System"
            ).send()

        except httpx.ConnectError:
            await cl.Message(
                content="🔌 **Connection Error!** \n\nCan't connect to Ollama. Make sure it's running on localhost:11434",
                author="System"
            ).send()

        except Exception as e:
            await cl.Message(
                content=f"❌ **Unexpected Error** \n\n```\n{str(e)}\n```",
                author="System"
            ).send()


@cl.on_chat_end
async def end():
    """Clean up when chat ends"""
    # Save chat history one final time
    save_chat_history(chat_sessions)