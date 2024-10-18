"use client";

import React, { useState, useEffect } from 'react';
import { ChatSidebar } from '@/components/chat-sidebar';
import { AIAssistant } from '@/components/ai-assistant';
import { v4 as uuidv4 } from 'uuid';

type ChatHistory = {
  id: string;
  title: string;
  timestamp: string;
  bucket_path: string;
  user_id: string;
};

const ChatPage = () => {
  const [chats, setChats] = useState<ChatHistory[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);

  useEffect(() => {
    // Create a default chat if none exists
    if (chats.length === 0) {
      const newChat = {
        id: uuidv4(),
        title: 'New Chat',
        timestamp: new Date().toISOString(),
        bucket_path: 'chat_page',
        user_id: 'default_user' // Replace with actual user ID when available
      };
      setChats([newChat]);
      setActiveChat(newChat.id);
    }
  }, []);

  const addNewChat = (newChat: ChatHistory) => {
    const chatWithId = { ...newChat, id: uuidv4() };
    setChats((prevChats) => [...prevChats, chatWithId]);
    setActiveChat(chatWithId.id);
  };

  const handleDeleteChat = (chatId: string) => {
    setChats((prevChats) => prevChats.filter(chat => chat.id !== chatId));
    if (activeChat === chatId) {
      setActiveChat(chats.length > 1 ? chats[0].id : null);
    }
  };

  return (
    <div className="flex h-screen">
      {/* <ChatSidebar 
        chats={chats}
        activeChat={activeChat}
        onSelectChat={setActiveChat}
        onNewChat={addNewChat}
        onDeleteChat={handleDeleteChat}
      /> */}
      <div className="flex-grow">
        {activeChat ? (
          <AIAssistant chatId={activeChat} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p>Select a chat or start a new one</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
