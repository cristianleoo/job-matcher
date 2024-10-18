import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from 'axios';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatInterfaceProps {
  onClose: () => void;
  onApply: (content: string) => void;
  section: string;
}

export function ChatInterface({ onClose, onApply, section }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to the bottom of the chat when messages change
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Initial message from the assistant
    setMessages([
      {
        role: 'assistant',
        content: `Let's work on improving the ${section} section of your resume. What specific aspects would you like to focus on or improve?`
      }
    ]);
  }, [section]);

  const handleSendMessage = async () => {
    if (input.trim() === '') return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const response = await axios.post('/api/chat', {
        messages: [...messages, userMessage],
        section
      });

      const assistantMessage: Message = { role: 'assistant', content: response.data.message };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleApply = async () => {
    try {
      const response = await axios.post('/api/generate-content', {
        messages,
        section
      });
      onApply(response.data.generatedContent);
    } catch (error) {
      console.error('Error generating content:', error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-xl font-semibold">Improving {section}</h2>
        <Button onClick={onClose} variant="outline">Close</Button>
      </div>
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-3/4 p-3 rounded-lg ${message.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'}`}>
              {message.content}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message..."
            className="flex-grow"
          />
          <Button onClick={handleSendMessage}>Send</Button>
        </div>
        <Button onClick={handleApply} className="mt-2 w-full bg-green-500 hover:bg-green-600 text-white">
          Apply Changes
        </Button>
      </div>
    </div>
  );
}
