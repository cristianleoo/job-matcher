"use client";

import React, { useState, useEffect } from 'react';
import NotesEditor from '../../components/NotesEditor';
import NotesListSidebar from '../../components/NotesListSidebar';
import { Note } from '../../types/Note';

const NotesPage: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  useEffect(() => {
    // Fetch notes from an API or local storage
    const fetchNotes = async () => {
      // Replace this with actual API call or local storage retrieval
      const mockNotes: Note[] = [
        { id: '1', title: 'Note 1', content: 'Content 1', path: '/notes/1' },
        { id: '2', title: 'Note 2', content: 'Content 2', path: '/notes/2' },
      ];
      setNotes(mockNotes);
    };

    fetchNotes();
  }, []);

  const handleNoteSelect = (note: Note) => {
    setSelectedNoteId(note.id);
  };

  const handleNoteUpdate = (updatedNote: Note) => {
    setNotes(prevNotes =>
      prevNotes.map(note => note.id === updatedNote.id ? updatedNote : note)
    );
  };

  const handleNoteCreate = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'New Note',
      content: '',
      path: `/notes/${Date.now()}`,
    };
    setNotes(prevNotes => [...prevNotes, newNote]);
    setSelectedNoteId(newNote.id);
  };

  const selectedNote = notes.find(note => note.id === selectedNoteId);

  return (
    <div className="flex h-screen">
      <NotesListSidebar
        notes={notes}
        selectedNoteId={selectedNoteId}
        onNoteSelect={handleNoteSelect}
        onNoteCreate={handleNoteCreate}
      />
      <NotesEditor
        selectedNote={selectedNote || null}
        onBack={() => setSelectedNoteId(null)}
      />
    </div>
  );
};

export default NotesPage;
