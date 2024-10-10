import React, { useState } from 'react'; // Import useState
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'; // Import icons for toggling
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
    <div className={`flex ${isOpen ? 'w-64' : 'w-16'} bg-gray-100 h-screen flex-col transition-width duration-300`}>
      <div className="flex flex-col items-center justify-center p-4"> {/* Center the button */}
        <Button onClick={toggleSidebar} className="mb-4">
          {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />} {/* Toggle icon */}
        </Button>
        {isOpen && ( // Only show the new chat button when the sidebar is open
          <Button onClick={onNewChat} className="w-full mb-4">
            <PlusCircle className="mr-2 h-4 w-4" /> New Chat
          </Button>
        )}
      </div>
      {isOpen && ( // Only show the chat list when the sidebar is open
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
                <div className="w-[150px] overflow-hidden"> {/* Set a fixed width for the title */}
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
      )}
    </div>
  );
}