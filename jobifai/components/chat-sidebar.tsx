import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { useUserStore } from '@/lib/userStore';
import ReactMarkdown from 'react-markdown';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type ChatHistory = {
  id: string;
  message: string;
  timestamp: string;
};

export function ChatSidebar() {
  const router = useRouter();
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const supabaseUserId = useUserStore((state) => state.supabaseUserId);

  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!supabaseUserId) return;

      const { data, error } = await supabase
        .from('chat_histories')
        .select('id, message, timestamp')
        .eq('user_id', supabaseUserId)
        .order('timestamp', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching chat history:', error);
      } else {
        setChatHistory(data);
      }
    };

    fetchChatHistory();
  }, [supabaseUserId]);

  const handleNewChat = () => {
    router.push('/chat');
  };

  const handleChatSelect = (chatId: string) => {
    router.push(`/chat?id=${chatId}`);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const truncateMessage = (message: string, maxLength: number = 30) => {
    // Remove markdown syntax before truncating
    const plainText = message.replace(/[#*_`~]/g, '');
    if (plainText.length <= maxLength) return plainText;
    return plainText.substring(0, maxLength) + '...';
  };

  return (
    <div className="w-64 bg-gray-100 p-4 h-screen overflow-y-auto">
      <Button onClick={handleNewChat} className="w-full mb-4">
        <PlusCircle className="mr-2 h-4 w-4" /> New Chat
      </Button>
      <div className="space-y-2">
        {chatHistory.map((chat) => (
          <Button
            key={chat.id}
            onClick={() => handleChatSelect(chat.id)}
            variant="ghost"
            className="w-full justify-start text-left flex flex-col items-start"
          >
            <span className="text-sm font-medium">{truncateMessage(chat.message)}</span>
            <span className="text-xs text-gray-500">{formatTimestamp(chat.timestamp)}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}