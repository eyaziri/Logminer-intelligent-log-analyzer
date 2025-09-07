'use client';

import React, { useState } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';

interface Message {
  sender: 'user' | 'bot';
  content: string;
}


export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'bot', content: 'Bonjour ! Comment puis-je vous aider ?' },
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = { sender: 'user', content: input.trim() };
    const botMessage: Message = {
      sender: 'bot',
      content: "Merci pour votre message. Je vous répondrai bientôt !",
    };

    setMessages((prev) => [...prev, userMessage, botMessage]);
    setInput('');
  };

  return (
    <div className="p-6 border border-gray-200 rounded-2xl bg-white shadow-md dark:border-gray-800 dark:bg-white/[0.03] max-w-3xl mx-auto mt-10 flex flex-col h-[80vh]">
      <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">💬 Chatbot</h3>

      <div className="flex-1 overflow-y-auto px-2 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-xl text-sm ${
                msg.sender === 'user'
                  ? 'bg-blue-500 text-white rounded-br-none'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-bl-none'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <input
          type="text"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
          placeholder="Écrivez un message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button
          className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition"
          onClick={handleSend}
        >
          <PaperAirplaneIcon className="w-5 h-5 rotate-45" />
        </button>
      </div>
    </div>
  );
}
