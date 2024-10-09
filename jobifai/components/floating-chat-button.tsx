"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, X } from "lucide-react";
import Link from "next/link";
import { AIAssistant } from "@/components/ai-assistant";
import React from "react";

export function FloatingChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const chatId = "your-chat-id"; // Ensure chatId is defined in your component

  return (
    <>
      <Button
        className="fixed bottom-4 right-4 rounded-full p-3 shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </Button>

      {isOpen && (
        <div className="fixed bottom-20 right-4 w-80 h-96 bg-white rounded-lg shadow-xl overflow-hidden flex flex-col">
          <div className="p-4 bg-gray-100 flex justify-between items-center">
            <h3 className="font-semibold">AI Assistant</h3>
            <Link href="/ai-assistant" className="text-sm text-blue-600 hover:underline">
              Open in full page
            </Link>
          </div>
          <div className="flex-grow overflow-hidden">
            <AIAssistant chatId={chatId} />
          </div>
        </div>
      )}
    </>
  );
}