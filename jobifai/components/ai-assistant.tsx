"use client";

import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, User } from "lucide-react";
import { useAuth } from '@clerk/nextjs';
import { useUserStore } from '@/lib/userStore';
import { ChatSidebar } from "@/components/chat-sidebar";
import { v4 as uuidv4 } from 'uuid';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { getChatHistory, getAllChatHistories, deleteChatHistory } from '@/lib/chatOperations';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import dynamic from 'next/dynamic';
import { Toggle } from "@/components/ui/toggle";
import { fetchUserData } from '@/lib/userDataOperations';

const PDFViewer = dynamic(() => import('./PDFViewer'), { ssr: false });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Chat {
  id: string;
  title: string;
  messages: { role: string; content: string }[];
  timestamp?: string;
  bucket_path?: string;
}

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

interface AIAssistantProps {
  chatId: string | null;
}

export function AIAssistant({ chatId }: AIAssistantProps) {
  const { userId } = useAuth();
  const setSupabaseUserId = useUserStore((state) => state.setSupabaseUserId);
  const supabaseUserId = useUserStore((state) => state.supabaseUserId);

  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [isUserDataLoaded, setIsUserDataLoaded] = useState(false);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [resumeContent, setResumeContent] = useState<string>('');
  const router = useRouter();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (userId) {
      fetch('/api/auth', { method: 'POST' })
        .then(res => res.json())
        .then(data => {
          if (data.user && data.user.id) {
            setSupabaseUserId(data.user.id);
          }
        })
        .catch(error => console.error('Error fetching user data:', error));
    }
  }, [userId, setSupabaseUserId]);

  const loadChatMessages = async (chatId: string) => {
    if (supabaseUserId) {
      const chatData = await getChatHistory(supabaseUserId, chatId);
      if (chatData) {
        setChats(prevChats => prevChats.map(chat => 
          chat.id === chatId ? { ...chat, messages: chatData.messages } : chat
        ));
      }
    }
  };

  useEffect(() => {
    const loadChats = async () => {
      if (supabaseUserId) {
        const allChats = await getAllChatHistories(supabaseUserId);
        if (allChats) {
          setChats(allChats.map(chat => ({ ...chat, messages: [] })));
          if (chatId) {
            setActiveChat(chatId);
            await loadChatMessages(chatId);
          } else if (allChats.length > 0) {
            setActiveChat(allChats[0].id);
            await loadChatMessages(allChats[0].id);
          } else {
            createInitialChat();
          }
        } else {
          createInitialChat();
        }
      }
    };

    loadChats();
  }, [chatId, supabaseUserId]);

  const createInitialChat = () => {
    const initialChat = {
      id: uuidv4(),
      title: "New Chat",
      messages: [{ role: "assistant", content: "Hello! How can I assist you with your job search today?" }]
    };
    setChats([initialChat]);
    setActiveChat(initialChat.id);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats]);

  const handleSend = async () => {
    console.log("handleSend called", { input, isLoading, supabaseUserId, activeChat, isUserDataLoaded });
    if (input.trim() && !isLoading && supabaseUserId && activeChat) {
      setIsLoading(true);
      const userMessage = { role: "user", content: input };
      setChats(prevChats => prevChats.map(chat => 
        chat.id === activeChat 
          ? { ...chat, messages: [...chat.messages, userMessage] }
          : chat
      ));
      setInput("");
      setStreamingMessage("");

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: input,
            supabaseUserId: supabaseUserId,
            chatId: activeChat,
            context: isUserDataLoaded ? 'resume' : 'general',
            userData: isUserDataLoaded ? userData : null,
            resumeContent: isUserDataLoaded ? resumeContent : null
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

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
        if (error instanceof Error && error.name === 'AbortError') {
          console.error('Request timed out');
          // Handle timeout error
        } else {
          console.error('Error in AI chat:', error);
        }
        setChats(prevChats => prevChats.map(chat => 
          chat.id === activeChat 
            ? { ...chat, messages: [...chat.messages, { role: "assistant", content: "I'm sorry, I encountered an error. Please try again." }] }
            : chat
        ));
      } finally {
        setIsLoading(false);
        setStreamingMessage("");
        clearTimeout(timeoutId);
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

  const handleSelectChat = async (selectedChatId: string) => {
    setActiveChat(selectedChatId);
    await loadChatMessages(selectedChatId);
  };

  const handleDeleteChat = async (chatId: string) => {
    if (supabaseUserId) {
      const success = await deleteChatHistory(supabaseUserId, chatId);
      if (success) {
        setChats(prevChats => {
          const updatedChats = prevChats.filter(chat => chat.id !== chatId);
          if (activeChat === chatId) {
            if (updatedChats.length > 0) {
              setActiveChat(updatedChats[0].id);
              loadChatMessages(updatedChats[0].id);
            } else {
              createInitialChat();
            }
          }
          return updatedChats;
        });
      } else {
        console.error('Failed to delete chat');
      }
    }
  };

  const fetchResumeContent = async () => {
    if (supabaseUserId) {
      // Fetch resume path from the resumes table
      const { data: resumeData, error: resumeError } = await supabase
        .from('resumes')
        .select('title')
        .eq('user_id', supabaseUserId)
        .single();

      if (resumeError) {
        console.error('Error fetching resume path:', resumeError);
        return;
      }

      if (!resumeData || !resumeData.title) {
        console.error('No resume found for this user');
        return;
      }

      // Fetch the actual resume content from the user_resumes bucket
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('user_resumes')
        .download(resumeData.title);

      if (downloadError) {
        console.error('Error downloading resume:', downloadError);
        return;
      }

      // Convert the file data to text
      const text = await fileData.text();
      setResumeContent(text);
      setResumeUrl(URL.createObjectURL(fileData));
    }
  };

  const loadUserData = async () => {
    if (supabaseUserId) {
      setIsLoading(true);
      try {
        await fetchResumeContent();
        const data = await fetchUserData(supabaseUserId);
        setUserData(data);
        setIsUserDataLoaded(true);
      } catch (error) {
        console.error('Error loading user data:', error);
        // Add user feedback here, e.g., a toast notification
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <ChatSidebar
        chats={chats.map(chat => ({
          ...chat,
          timestamp: chat.timestamp || new Date().toISOString(),
          bucket_path: chat.bucket_path || ''
        }))}
        activeChat={activeChat}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
      />
      <div className="flex-grow flex flex-col h-full overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">
            {chats.find(chat => chat.id === activeChat)?.title || "Chat"}
          </h2>
          <div className="flex items-center">
            <Toggle
              pressed={isUserDataLoaded}
              onPressedChange={(pressed) => {
                if (pressed) {
                  loadUserData();
                } else {
                  setIsUserDataLoaded(false);
                  setResumeUrl(null);
                }
              }}
            >
              View Resume
            </Toggle>
            <Button
              onClick={() => router.push('/profile')}
              className="ml-4"
            >
              Edit Resume
            </Button>
          </div>
        </div>
        <div className="flex-grow flex overflow-hidden">
          <div className="flex-grow overflow-y-auto p-4 space-y-4">
            {chats.find(chat => chat.id === activeChat)?.messages?.map((message, index) => (
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
          {isUserDataLoaded && resumeUrl && (
            <div className="w-1/3 border-l p-4 overflow-y-auto">
              <h3 className="text-lg font-semibold mb-2">Resume</h3>
              <PDFViewer pdfUrl={resumeUrl} />
            </div>
          )}
        </div>
        <div className="p-4 border-t flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isUserDataLoaded ? "Ask about your resume..." : "Ask me anything..."}
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
      </div>
    </div>
  );
}