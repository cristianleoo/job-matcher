import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";

interface Chat {
  id: string;
  title: string;
}

interface ChatSidebarProps {
  chats: Chat[];
  activeChat: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
}

export function ChatSidebar({ chats, activeChat, onSelectChat, onNewChat, onDeleteChat }: ChatSidebarProps) {
  return (
    <div className="bg-gray-100 h-full flex flex-col">
      <div className="p-4">
        <Button onClick={onNewChat} className="w-full">
          <PlusCircle className="mr-2 h-4 w-4" /> New Chat
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto px-2">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={`p-2 mb-2 rounded cursor-pointer flex justify-between items-center ${
              chat.id === activeChat ? "bg-blue-200" : "hover:bg-gray-200"
            }`}
            onClick={() => onSelectChat(chat.id)}
          >
            <span className="truncate flex-1">{chat.title}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteChat(chat.id);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}