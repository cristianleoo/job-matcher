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
  const { data, error } = await supabase
    .from('chat_histories')
    .select('bucket_path')
    .eq('user_id', userId)
    .eq('id', chatId)
    .single();

  if (error) {
    console.error('Error fetching chat history:', error);
    return null;
  }

  const { data: fileData, error: downloadError } = await supabase.storage
    .from('chat-histories')
    .download(data.bucket_path);

  if (downloadError) {
    console.error('Error downloading chat history:', downloadError);
    return null;
  }

  const chatData = JSON.parse(await fileData.text());
  return chatData;
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