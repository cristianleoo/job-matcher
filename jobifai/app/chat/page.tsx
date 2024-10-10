"use client";

import React, { useState } from 'react';
import { ChatSidebar } from '@/components/chat-sidebar';
import { AIAssistant } from '@/components/ai-assistant';
import { ChatHistory } from '@/lib/types';

const ChatPage = () => {
  const [chats, setChats] = useState<ChatHistory[]>([]); // Initialize chats state

  // Function to add a new chat
  const addNewChat = (newChat: ChatHistory & { user_id: string }) => {
    setChats((prevChats) => [...prevChats, newChat]);
  };

  // Filter chats to only include those started in this chat page
  const filteredChats = chats.filter(chat => chat.bucket_path === 'chat_page'); // Adjust the condition as needed

  return (
    <div className="flex">
      <ChatSidebar 
        chats={filteredChats} 
        activeChat={filteredChats.length > 0 ? filteredChats[0].id : null} 
        onSelectChat={(chatId) => setChats((prevChats) => prevChats.map(chat => chat.id === chatId ? { ...chat, active: true } : { ...chat, active: false }))} 
        onNewChat={(newChat: ChatHistory & { user_id: string }) => addNewChat(newChat)} // Ensure this matches the expected signature
        onDeleteChat={(chatId) => setChats((prevChats) => prevChats.filter(chat => chat.id !== chatId))} 
      />
      <AIAssistant chatId={filteredChats.length > 0 ? filteredChats[0].id : null} />
    </div>
  );
};

export default ChatPage;