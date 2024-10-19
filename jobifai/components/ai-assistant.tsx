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
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const PDFViewer = dynamic(() => import('./PDFViewer'), { ssr: false });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Chat {
  id: string;
  title: string;
  messages: Message[]; // Change this line
  timestamp?: string;
  bucket_path?: string;
  user_id?: string;
}

type Message = {
  role: 'user' | 'assistant';
  content: string;
  id: string;
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
  const [isUserDataLoaded, setIsUserDataLoaded] = useState<boolean>(false);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [userData, setUserData] = useState<Record<string, any> | null>(null);
  const [resumeContent, setResumeContent] = useState<string>('');
  const [extractedText, setExtractedText] = useState<string>('');
  const router = useRouter();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [isTyping, setIsTyping] = useState(false);
  const [currentlyTypingId, setCurrentlyTypingId] = useState<string | null>(null);

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
          chat.id === chatId ? {
            ...chat,
            messages: chatData.messages.map(msg => ({
              role: msg.role as 'user' | 'assistant',
              content: msg.content,
              id: msg.id || uuidv4()
            }))
          } : chat
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
    const initialChat: Chat = {
      id: uuidv4(),
      title: "New Chat",
      messages: [{ role: "assistant", content: "Hello! How can I assist you with your job search today?", id: uuidv4() }]
    };
    setChats([initialChat]);
    setActiveChat(initialChat.id);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats]);

  const handleSend = async () => {
    if (input.trim() && !isLoading && supabaseUserId && activeChat) {
      setIsLoading(true);
      const userMessage: Message = { role: "user", content: input, id: uuidv4() };
      const aiMessage: Message = { role: "assistant", content: "", id: uuidv4() };
      
      setChats(prevChats => prevChats.map(chat => 
        chat.id === activeChat 
          ? { ...chat, messages: [...chat.messages, userMessage, aiMessage] }
          : chat
      ));
      
      setCurrentlyTypingId(aiMessage.id);
      setInput("");

      let timeoutId: NodeJS.Timeout | undefined;

      try {
        const controller = new AbortController();
        
        setIsTyping(true);
        setStreamingMessage("");
        
        timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout

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
            resumeContent: isUserDataLoaded ? extractedText : null
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

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = new TextDecoder().decode(value);
          
          setChats(prevChats => prevChats.map(chat => 
            chat.id === activeChat 
              ? {
                  ...chat,
                  messages: chat.messages.map(msg => 
                    'id' in msg && msg.id === aiMessage.id 
                      ? { ...msg, content: msg.content + chunk }
                      : msg
                  )
                }
              : chat
          ));
        }
      } catch (error) {
        console.error('Error in AI chat:', error);
        // Handle error...
      } finally {
        setIsLoading(false);
        setIsTyping(false);
        setCurrentlyTypingId(null);
        if (timeoutId) clearTimeout(timeoutId);
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
    const newChat: Chat = {
      id: uuidv4(),
      title: "New Chat",
      messages: [{ role: "assistant", content: "Hello! How can I assist you with your job search today?", id: uuidv4() }]
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

  const handleTextExtracted = (text: string) => {
    setExtractedText(prevText => prevText + ' ' + text);
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

      setResumeUrl(URL.createObjectURL(fileData));
      // The text content will be set by the PDFViewer component
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
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">
      <ChatSidebar
        chats={chats.map(chat => ({
          ...chat,
          timestamp: chat.timestamp || new Date().toISOString(),
          user_id: chat.user_id || 'default_user_id',
          bucket_path: chat.bucket_path || ''
        }))}
        activeChat={activeChat}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
      />
      <div className="flex-grow flex flex-col h-full overflow-hidden">
        <div className="p-4 border-b bg-white shadow-sm flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            {chats.find(chat => chat.id === activeChat)?.title || "Chat"}
          </h2>
          <div className="flex items-center space-x-2">
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
              className="bg-blue-100 data-[state=on]:bg-blue-500 data-[state=on]:text-white"
            >
              View Resume
            </Toggle>
            <Button
              onClick={() => router.push('/profile')}
              variant="outline"
            >
              Edit Resume
            </Button>
          </div>
        </div>
        <div className="flex-grow flex overflow-hidden">
          <div className={cn(
            "flex-grow overflow-y-auto p-4 space-y-4",
            isUserDataLoaded ? 'max-w-[66%]' : 'w-full'
          )}>
            {activeChat && chats.find(chat => chat.id === activeChat)?.messages.map((message: Message) => (
              <div
                key={message.id}
                className={cn(
                  "p-4 rounded-lg flex items-start shadow-sm",
                  message.role === "assistant" ? "bg-blue-50" : "bg-white"
                )}
              >
                {message.role === "assistant" ? (
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white mr-3 flex-shrink-0">
                    AI
                  </div>
                ) : (
                  <User className="w-8 h-8 p-1 rounded-full bg-gray-200 mr-3 flex-shrink-0" />
                )}
                <div className="flex-grow overflow-hidden">
                  <ReactMarkdown
                    components={{
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      code({node, inline, className, children, ...props}: any) {
                        const match = /language-(\w+)/.exec(className || '')
                        return !inline && match ? (
                          <SyntaxHighlighter
                            {...props}
                            style={tomorrow}
                            language={match[1]}
                            PreTag="div"
                            className="max-w-full overflow-x-auto"
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        ) : (
                          <code {...props} className={className}>
                            {children}
                          </code>
                        )
                      }
                    }}
                    className="prose max-w-none text-gray-800"
                  >
                    {message.content}
                  </ReactMarkdown>
                  {currentlyTypingId === message.id && (
                    <motion.span
                      className="inline-block w-2 h-4 bg-blue-500 ml-1"
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                    />
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          {isUserDataLoaded && resumeUrl && (
            <div className="w-1/3 border-l p-4 overflow-y-auto bg-white">
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Resume</h3>
              <PDFViewer pdfUrl={resumeUrl} onTextExtracted={handleTextExtracted} />
            </div>
          )}
        </div>
        <div className="p-4 border-t bg-white shadow-sm flex gap-2">
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
            className="flex-grow rounded-full bg-gray-100 border-none focus:ring-2 focus:ring-blue-500"
          />
          <Button onClick={handleSend} disabled={isLoading} className="rounded-full">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
