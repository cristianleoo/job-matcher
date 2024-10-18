import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatInterfaceProps {
  onClose: () => void;
  onApply: (content: string) => void;
  section: string;
  supabaseUserId: string;
  resumeContent: string;
}

export function ChatInterface({ onClose, onApply, section, supabaseUserId, resumeContent }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content: `Let's work on improving the ${section} section of your resume. What specific aspects would you like to focus on or improve?`
      }
    ]);
  }, [section]);

  const handleSendMessage = async () => {
    if (input.trim() === '' || isLoading || !supabaseUserId) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post('/api/chat', {
        message: input,
        supabaseUserId,
        context: 'resume',
        resumeContent,
      }, {
        responseType: 'text',
        onDownloadProgress: (progressEvent) => {
          const data = progressEvent.event.target.responseText;
          const lines = data.split('\n').filter((line: string) => line.trim() !== '');
          const lastLine = lines[lines.length - 1];
          
          setMessages(prev => [
            ...prev.slice(0, -1),
            { role: 'assistant', content: lastLine }
          ]);
        }
      });

      // After the stream is complete, update with the full response
      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: response.data }
      ]);

    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, there was an error processing your request. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const getFinalOutput = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post('/api/chat', {
        message: `Based on our conversation, please provide a final, polished version of the ${section} section for the resume. Format it consistently and professionally, ready to be inserted directly into the resume. Do not include any explanations or comments, just the formatted content for the ${section} section.`,
        supabaseUserId,
        context: 'resume',
        resumeContent,
        chatHistory: messages,
      });

      return response.data;
    } catch (error) {
      console.error('Error getting final output:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = async () => {
    const finalOutput = await getFinalOutput();
    if (finalOutput) {
      onApply(finalOutput);
      onClose();
    } else {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, there was an error generating the final output. Please try again.' }]);
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
              {message.role === 'user' ? (
                message.content
              ) : (
                <ReactMarkdown>{message.content}</ReactMarkdown>
              )}
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
            disabled={isLoading}
          />
          <Button onClick={handleSendMessage} disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send'}
          </Button>
        </div>
        <Button onClick={handleApply} className="mt-2 w-full bg-green-500 hover:bg-green-600 text-white" disabled={isLoading}>
          Apply Changes
        </Button>
      </div>
    </div>
  );
}
