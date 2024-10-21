import React from 'react';
import NotesEditor from '../../components/NotesEditor';
import NotesListSidebar from '../../components/NotesListSidebar';

const NotesPage: React.FC = () => {
  return (
    <div className="flex h-screen">
      <NotesListSidebar />
      <NotesEditor />
    </div>
  );
};

export default NotesPage;
