import { createClient } from '@supabase/supabase-js';
import { ChatHistory } from './types'; // Add this import

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type ChatData = {
  messages: { role: string; content: string }[];
};

export async function saveChatHistory(userId: string, chatId: string, title: string, chatData: ChatData) {
  const bucketPath = `public/${userId}/${chatId}.json`;
  console.log("Saving chat history to:", bucketPath);
  const { error: uploadError } = await supabase.storage
    .from('chat-histories')
    .upload(bucketPath, JSON.stringify(chatData), {
      contentType: 'application/json',
    });

  if (uploadError) {
    console.error('Error uploading chat history:', uploadError);
    return null;
  }

  const { data, error: insertError } = await supabase
    .from('chat_histories')
    .insert({
      id: chatId,
      user_id: userId,
      title: title,
      bucket_path: bucketPath,
      timestamp: new Date().toISOString(),
    })
    .select()
    .single();

  if (insertError) {
    console.error('Error inserting chat history:', insertError);
    return null;
  }

  return data;
}

export async function getChatHistory(userId: string, chatId: string): Promise<ChatData | null> {
  console.log(`Fetching chat history for user ${userId} and chat ${chatId}`);
  
  const { data, error } = await supabase
    .from('chat_histories')
    .select('bucket_path')
    .eq('user_id', userId)
    .eq('id', chatId)
    .single();

  if (error) {
    console.error('Error fetching chat history from database:', error);
    return null;
  }

  if (!data || !data.bucket_path) {
    console.error('No bucket path found for chat history');
    return null;
  }

  console.log(`Downloading chat history from bucket path: ${data.bucket_path}`);

  const { data: fileData, error: downloadError } = await supabase.storage
    .from('chat-histories')
    .download(data.bucket_path);

  if (downloadError) {
    console.error('Error downloading chat history from storage:', downloadError);
    return null;
  }

  try {
    const textContent = await fileData.text();
    console.log('Chat history file content:', textContent.substring(0, 100) + '...');
    const chatData = JSON.parse(textContent);
    return chatData;
  } catch (parseError) {
    console.error('Error parsing chat history JSON:', parseError);
    return null;
  }
}

export async function getAllChatHistories(userId: string): Promise<ChatHistory[] | null> {
  const { data, error } = await supabase
    .from('chat_histories')
    .select('id, title, timestamp, bucket_path')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false });

  if (error) {
    console.error('Error fetching all chat histories:', error);
    return null;
  }

  return data;
}

export async function deleteChatHistory(userId: string, chatId: string): Promise<boolean> {
  // Delete from chat_histories table
  const { error: deleteError } = await supabase
    .from('chat_histories')
    .delete()
    .eq('user_id', userId)
    .eq('id', chatId);

  if (deleteError) {
    console.error('Error deleting chat history from database:', deleteError);
    return false;
  }

  // Delete from storage bucket
  const bucketPath = `public/${userId}/${chatId}.json`;
  const { error: storageError } = await supabase.storage
    .from('chat-histories')
    .remove([bucketPath]);

  if (storageError) {
    console.error('Error deleting chat history from storage:', storageError);
    return false;
  }

  return true;
}