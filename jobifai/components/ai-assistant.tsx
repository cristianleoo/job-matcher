"use client";

import { useState, useEffect } from "react";
// import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

export function AIAssistant() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load chat history from local storage on component mount
    const savedMessages = localStorage.getItem('chatHistory');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      setMessages([{ role: "assistant", content: "Hello! How can I assist you with your job search today?" }]);
    }
  }, []);

  useEffect(() => {
    // Save chat history to local storage whenever it changes
    localStorage.setItem('chatHistory', JSON.stringify(messages));
  }, [messages]);

  const handleSend = async () => {
    if (input.trim() && !isLoading) {
      setIsLoading(true);
      const userMessage = { role: "user", content: input };
      setMessages(prev => [...prev, userMessage]);
      setInput("");

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: input,
            chatHistory: messages,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to get AI response');
        }

        const data = await response.json();
        setMessages(prev => [...prev, { role: "assistant", content: data.aiResponse }]);
      } catch (error) {
        console.error('Error in AI chat:', error);
        setMessages(prev => [...prev, { role: "assistant", content: "I'm sorry, I encountered an error. Please try again." }]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`p-2 rounded-lg ${
              message.role === "assistant" ? "bg-blue-100" : "bg-gray-100"
            }`}
          >
            {message.content}
          </div>
        ))}
      </div>
      <div className="p-4 border-t flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything..."
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          disabled={isLoading}
        />
        <Button onClick={handleSend} disabled={isLoading}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}