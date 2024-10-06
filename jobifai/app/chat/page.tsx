"use client";

import { useSearchParams } from 'next/navigation';
import { AIAssistant } from '@/components/ai-assistant';

export default function ChatPage() {
  const searchParams = useSearchParams();
  const chatId = searchParams.get('id');

  return (
    <div className="flex flex-col h-screen">
      <AIAssistant chatId={chatId} />
    </div>
  );
}