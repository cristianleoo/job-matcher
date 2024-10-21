"use client";

import React, { useState } from 'react';
import NotesListSidebar from './NotesListSidebar';
import NotesEditor from './NotesEditor';

interface Note {
  id: number;
  title: string;
  content: string;
  path: string;
}

// Add this interface
interface NotesListSidebarProps {
  onNoteSelect: (note: Note) => void;
}

const NotesApp: React.FC = () => {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const handleNoteSelect = (note: Note) => {
    setSelectedNote(note);
  };

  const handleBack = () => {
    setSelectedNote(null);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <NotesListSidebar onNoteSelect={handleNoteSelect} />
      <div className="flex-1 p-6">
        {selectedNote ? (
          <NotesEditor selectedNote={selectedNote} onBack={handleBack} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a note or create a new one
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesApp;
