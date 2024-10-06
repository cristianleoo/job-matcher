import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { useUserStore } from '@/lib/userStore';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type ChatHistory = {
  id: string;
  title: string;
  timestamp: string;
  bucket_path: string;
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
        .select('id, title, timestamp, bucket_path')
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

  const handleDeleteChat = async (chatId: string, bucketPath: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!supabaseUserId) return;

    // Delete the JSON file from the bucket
    const { error: bucketError } = await supabase.storage
      .from('chat-histories')
      .remove([bucketPath]);

    if (bucketError) {
      console.error('Error deleting chat file from bucket:', bucketError);
      return;
    }

    // Delete the chat entry from the database
    const { error: dbError } = await supabase
      .from('chat_histories')
      .delete()
      .eq('id', chatId)
      .eq('user_id', supabaseUserId);

    if (dbError) {
      console.error('Error deleting chat from database:', dbError);
    } else {
      setChatHistory(chatHistory.filter(chat => chat.id !== chatId));
    }
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

  const truncateTitle = (title: string, maxLength: number = 20) => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + '...';
  };

  return (
    <div className="w-64 bg-gray-100 p-4 h-screen overflow-y-auto">
      <Button onClick={handleNewChat} className="w-full mb-4">
        <PlusCircle className="mr-2 h-4 w-4" /> New Chat
      </Button>
      <div className="space-y-2">
        {chatHistory.map((chat) => (
          <div key={chat.id} className="flex items-center space-x-2">
            <Button
              onClick={() => handleChatSelect(chat.id)}
              variant="ghost"
              className="flex-grow min-w-0 h-auto py-2 px-3 justify-start"
            >
              <div className="w-full overflow-hidden">
                <div className="text-sm font-medium truncate">
                  {truncateTitle(chat.title)}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {formatTimestamp(chat.timestamp)}
                </div>
              </div>
            </Button>
            <Button
              onClick={(e) => handleDeleteChat(chat.id, chat.bucket_path, e)}
              variant="ghost"
              size="icon"
              className="flex-shrink-0 h-auto py-2"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}