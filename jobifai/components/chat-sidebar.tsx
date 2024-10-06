import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

type ChatHistory = {
  id: string;
  title: string;
  timestamp: string;
  bucket_path: string;
};

interface ChatSidebarProps {
  chats: ChatHistory[];
  activeChat: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
}

export function ChatSidebar({ chats, activeChat, onSelectChat, onNewChat, onDeleteChat }: ChatSidebarProps) {
  const router = useRouter();

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

  // Sort chats by timestamp, most recent first
  const sortedChats = [...chats].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="w-64 bg-gray-100 h-screen flex flex-col">
      <div className="p-4">
        <Button onClick={onNewChat} className="w-full mb-4">
          <PlusCircle className="mr-2 h-4 w-4" /> New Chat
        </Button>
      </div>
      <div className="flex-grow overflow-y-auto overflow-x-hidden">
        {sortedChats.map((chat) => (
          <div 
            key={chat.id} 
            className={`flex items-center p-2 hover:bg-gray-200 cursor-pointer ${activeChat === chat.id ? 'bg-gray-200' : ''}`}
          >
            <Button
              onClick={() => onSelectChat(chat.id)}
              variant="ghost"
              className="flex-grow h-auto py-2 px-3 justify-start text-left"
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
              onClick={(e) => {
                e.stopPropagation();
                onDeleteChat(chat.id);
              }}
              variant="ghost"
              size="icon"
              className="flex-shrink-0 h-8 w-8 ml-2"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}