"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, User } from "lucide-react";
import { useAuth } from '@clerk/nextjs';
import { useUserStore } from '@/lib/userStore';
import { ChatSidebar } from "@/components/chat-sidebar";
import { v4 as uuidv4 } from 'uuid';
import React from "react";
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Chat {
  id: string;
  title: string;
  messages: { role: string; content: string }[];
}

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export function AIAssistant() {
  const { userId } = useAuth();
  const setSupabaseUserId = useUserStore((state) => state.setSupabaseUserId);
  const supabaseUserId = useUserStore((state) => state.supabaseUserId);

  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (userId) {
      console.log("Fetching user data for userId:", userId);
      fetch('/api/auth', { method: 'POST' })
        .then(res => res.json())
        .then(data => {
          console.log("Received user data:", data);
          if (data.user && data.user.id) {
            setSupabaseUserId(data.user.id);
            console.log("Set supabaseUserId to:", data.user.id);
          } else {
            console.log("No user id found in response");
          }
        })
        .catch(error => console.error('Error fetching user data:', error));
    } else {
      console.log("No userId available");
    }
  }, [userId, setSupabaseUserId]);

  useEffect(() => {
    const savedChats = localStorage.getItem('chats');
    if (savedChats) {
      const parsedChats = JSON.parse(savedChats);
      setChats(parsedChats);
      if (parsedChats.length > 0) {
        setActiveChat(parsedChats[0].id);
        console.log("Loaded chats from localStorage, set activeChat to:", parsedChats[0].id);
      } else {
        createInitialChat();
      }
    } else {
      createInitialChat();
    }
  }, []);

  const createInitialChat = () => {
    const initialChat = {
      id: uuidv4(),
      title: "New Chat",
      messages: [{ role: "assistant", content: "Hello! How can I assist you with your job search today?" }]
    };
    setChats([initialChat]);
    setActiveChat(initialChat.id);
    console.log("Created initial chat, set activeChat to:", initialChat.id);
  };

  useEffect(() => {
    console.log("Saving chats to localStorage:", chats);
    localStorage.setItem('chats', JSON.stringify(chats));
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats]);

  useEffect(() => {
    console.log("activeChat changed:", activeChat);
    if (activeChat) {
      console.log("Current chat messages:", chats.find(chat => chat.id === activeChat)?.messages);
    }
  }, [activeChat, chats]);

  useEffect(() => {
    console.log("Chats state updated:", chats);
  }, [chats]);

  const handleSend = async () => {
    console.log("handleSend called", { input, isLoading, supabaseUserId, activeChat });
    if (input.trim() && !isLoading && supabaseUserId && activeChat) {
      console.log("Conditions met, proceeding with send");
      setIsLoading(true);
      const userMessage = { role: "user", content: input };
      setChats(prevChats => prevChats.map(chat => 
        chat.id === activeChat 
          ? { ...chat, messages: [...chat.messages, userMessage] }
          : chat
      ));
      setInput("");
      setStreamingMessage("");

      try {
        console.log("Sending request to /api/chat");
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: input,
            supabaseUserId: supabaseUserId,
          }),
        });

        if (!response.ok) {
          console.error("API response not ok", response.status, response.statusText);
          throw new Error('Failed to get AI response');
        }

        console.log("API response received");
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('Failed to get response reader');
        }

        let fullResponse = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = new TextDecoder().decode(value);
          fullResponse += chunk;
          setStreamingMessage(fullResponse);
        }

        console.log("Full response received:", fullResponse);
        console.log("Updating chats with new message");
        setChats(prevChats => {
          const newChats = prevChats.map(chat => 
            chat.id === activeChat 
              ? { ...chat, messages: [...chat.messages, { role: "assistant", content: fullResponse }] }
              : chat
          );
          console.log("Updated chats:", newChats);
          return newChats;
        });
        setStreamingMessage("");
      } catch (error) {
        console.error('Error in AI chat:', error);
        setChats(prevChats => prevChats.map(chat => 
          chat.id === activeChat 
            ? { ...chat, messages: [...chat.messages, { role: "assistant", content: "I'm sorry, I encountered an error. Please try again." }] }
            : chat
        ));
      } finally {
        setIsLoading(false);
      }
    } else {
      console.log("Conditions not met", { 
        inputEmpty: !input.trim(), 
        isLoading, 
        noSupabaseUserId: !supabaseUserId, 
        noActiveChat: !activeChat 
      });
    }
  };

  const handleNewChat = () => {
    const newChat = {
      id: uuidv4(),
      title: "New Chat",
      messages: [{ role: "assistant", content: "Hello! How can I assist you with your job search today?" }]
    };
    setChats(prevChats => [...prevChats, newChat]);
    setActiveChat(newChat.id);
    console.log("Created new chat, set activeChat to:", newChat.id);
  };

  const handleDeleteChat = (chatId: string) => {
    setChats(prevChats => {
      const updatedChats = prevChats.filter(chat => chat.id !== chatId);
      if (activeChat === chatId) {
        if (updatedChats.length > 0) {
          setActiveChat(updatedChats[0].id);
          console.log("Deleted active chat, set new activeChat to:", updatedChats[0].id);
        } else {
          createInitialChat();
        }
      }
      return updatedChats;
    });
  };

  const activeMessages = chats.find(chat => chat.id === activeChat)?.messages || [];

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <div className="w-64 bg-gray-100 p-4 overflow-y-auto">
        <ChatSidebar
          chats={chats}
          activeChat={activeChat}
          onSelectChat={setActiveChat}
          onNewChat={handleNewChat}
          onDeleteChat={handleDeleteChat}
        />
      </div>
      <div className="flex-grow flex flex-col h-full overflow-hidden">
        {activeChat ? (
          <>
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
              {activeMessages.map((message, index) => (
                <div
                  key={`${activeChat}-${index}`}
                  className={`p-2 rounded-lg flex items-start ${
                    message.role === "assistant" ? "bg-blue-100" : "bg-gray-100"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white mr-2 flex-shrink-0">
                      AI
                    </div>
                  ) : (
                    <User className="w-8 h-8 p-1 rounded-full bg-gray-300 mr-2 flex-shrink-0" />
                  )}
                  <div className="flex-grow">
                    <ReactMarkdown
                      components={{
                        code({node, inline, className, children, ...props}: any) {
                          const match = /language-(\w+)/.exec(className || '')
                          return !inline && match ? (
                            <SyntaxHighlighter
                              {...props}
                              children={String(children).replace(/\n$/, '')}
                              style={tomorrow}
                              language={match[1]}
                              PreTag="div"
                            />
                          ) : (
                            <code {...props} className={className}>
                              {children}
                            </code>
                          )
                        }
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}
              {streamingMessage && (
                <div className="p-2 rounded-lg bg-blue-100 flex items-start">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white mr-2 flex-shrink-0">
                    AI
                  </div>
                  <div className="flex-grow">
                    <ReactMarkdown
                      components={{
                        code({node, inline, className, children, ...props}: any) {
                          const match = /language-(\w+)/.exec(className || '')
                          return !inline && match ? (
                            <SyntaxHighlighter
                              {...props}
                              children={String(children).replace(/\n$/, '')}
                              style={tomorrow}
                              language={match[1]}
                              PreTag="div"
                            />
                          ) : (
                            <code {...props} className={className}>
                              {children}
                            </code>
                          )
                        }
                      }}
                    >
                      {streamingMessage}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                disabled={isLoading}
                className="flex-grow"
              />
              <Button onClick={handleSend} disabled={isLoading}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-grow flex items-center justify-center">
            <p>No active chat. Please create a new chat or select an existing one.</p>
          </div>
        )}
      </div>
    </div>
  );
}