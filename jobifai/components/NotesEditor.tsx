"use client";

import React, { useState, useEffect } from 'react';
import { useUserStore } from '@/lib/userStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Note } from '../types/Note';

const NotesEditor: React.FC<{ selectedNote: Note | null; onBack: () => void }> = ({ selectedNote, onBack }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const supabaseUserId = useUserStore((state) => state.supabaseUserId);

  useEffect(() => {
    if (selectedNote) {
      setTitle(selectedNote.title);
      setContent(selectedNote.content);
    } else {
      setTitle('');
      setContent('');
    }
  }, [selectedNote]);

  const handleSave = async () => {
    if (!supabaseUserId) return;

    const endpoint = selectedNote ? `/api/notes/${selectedNote.id}` : '/api/notes';
    const method = selectedNote ? 'PUT' : 'POST';

    const response = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        title, 
        content, 
        userId: supabaseUserId,
        path: selectedNote ? selectedNote.path : '/'
      }),
    });

    if (response.ok) {
      // TODO: Update the sidebar with the new or updated note
      onBack(); // Go back to the sidebar after saving
    } else {
      console.error('Failed to save note');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex-1 p-6 bg-white rounded-lg shadow-lg"
    >
      <div className="flex items-center mb-6">
        <Button onClick={onBack} variant="ghost" size="sm" className="mr-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title"
          className="flex-1 text-2xl font-bold border-none shadow-none focus:ring-0"
        />
        <Button onClick={handleSave} className="ml-4">
          <Save className="w-4 h-4 mr-2" />
          Save
        </Button>
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full h-[calc(100vh-200px)] p-4 text-lg leading-relaxed border-none rounded-md bg-gray-50 focus:ring-2 focus:ring-blue-500 resize-none"
        placeholder="Start typing your note..."
      />
    </motion.div>
  );
};

export default NotesEditor;
