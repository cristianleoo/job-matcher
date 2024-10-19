import React, { useState } from 'react'; // Import useState
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react'; // Import icons for toggling
import { useRouter } from 'next/navigation';

type ChatHistory = {
  id: string;
  title: string;
  timestamp: string;
  bucket_path: string;
  user_id: string; // Ensure user_id is included in the type
};

interface ChatSidebarProps {
  chats: ChatHistory[];
  activeChat: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: (newChat: ChatHistory & { user_id: string }) => void; // Update to accept user_id
  onDeleteChat: (chatId: string) => void;
}

export function ChatSidebar({ chats, activeChat, onSelectChat, onNewChat, onDeleteChat }: ChatSidebarProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true); // State to manage sidebar visibility

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

  const toggleSidebar = () => {
    setIsOpen(!isOpen); // Toggle the sidebar state
  };

  return (
    <div className={`flex ${isOpen ? 'w-72' : 'w-16'} bg-gray-50 h-screen flex-col transition-all duration-300 border-r border-gray-200`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {isOpen && <h2 className="text-lg font-semibold">Chats</h2>}
        <Button onClick={toggleSidebar} variant="ghost" size="icon" className="ml-auto">
          {isOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </Button>
      </div>
      {isOpen && (
        <Button 
          onClick={() => onNewChat({ id: '', title: '', timestamp: new Date().toISOString(), bucket_path: 'chat_page', user_id: '' })} 
          className="m-4 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <PlusCircle className="mr-2 h-4 w-4" /> New Chat
        </Button>
      )}
      {isOpen && (
        <div className="flex-grow overflow-y-auto overflow-x-hidden px-2">
          {sortedChats.map((chat) => (
            <div 
              key={chat.id} 
              className={`flex items-center p-2 my-1 rounded-lg hover:bg-gray-200 cursor-pointer ${activeChat === chat.id ? 'bg-gray-200' : ''}`}
            >
              <Button
                onClick={() => onSelectChat(chat.id)}
                variant="ghost"
                className="flex-grow h-auto py-2 px-3 justify-start text-left"
              >
                <MessageSquare className="h-4 w-4 mr-3 text-gray-500" />
                <div className="flex-grow overflow-hidden">
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
                className="flex-shrink-0 h-8 w-8 ml-2 text-gray-500 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
