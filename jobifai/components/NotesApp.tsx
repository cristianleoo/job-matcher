"use client";

import React, { useState, useEffect } from 'react';
import NotesListSidebar from './NotesListSidebar';
import NotesEditor from './NotesEditor';
import { Note } from '../types/Note';

const NotesApp: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  useEffect(() => {
    // Fetch notes from an API or local storage
    const fetchNotes = async () => {
      // Replace this with actual API call
      const response = await fetch('/api/notes');
      if (response.ok) {
        const fetchedNotes = await response.json();
        setNotes(fetchedNotes);
      }
    };

    fetchNotes();
  }, []);

  const handleNoteSelect = (note: Note) => {
    setSelectedNote(note);
  };

  const handleNoteCreate = async () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'New Note',
      content: '',
      path: `/notes/${Date.now()}`,
    };
    // Add API call to create note
    setNotes(prevNotes => [...prevNotes, newNote]);
    setSelectedNote(newNote);
  };

  const handleBack = () => {
    setSelectedNote(null);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <NotesListSidebar 
        notes={notes}
        selectedNoteId={selectedNote?.id || null}
        onNoteSelect={handleNoteSelect}
        onNoteCreate={handleNoteCreate}
      />
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
