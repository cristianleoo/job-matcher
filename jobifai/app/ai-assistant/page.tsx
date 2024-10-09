"use client";

import { AIAssistant } from "@/components/ai-assistant";
import { useState } from 'react'; // Add this import if not already present

export default function AIAssistantPage() {
  const [chatId, setChatId] = useState<string>(''); // Define chatId here

  return (
    <div className="min-h-screen p-8 font-sans">
      <h1 className="text-3xl font-bold mb-8">AI Assistant</h1>
      <div className="max-w-3xl mx-auto">
        <AIAssistant chatId={chatId} />  
      </div>
    </div>
  );
}