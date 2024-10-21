"use client";

import React, { useEffect, useState } from 'react';
import { useUserStore } from '@/lib/userStore';
import { PlusCircle, FolderPlus, MoreVertical, File, Folder, ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Note {
  id: number;
  title: string;
  content: string;
  path: string;
}

interface TreeNode {
  name: string;
  children: TreeNode[];
  isFolder: boolean;
  isOpen: boolean;
  note?: Note;
}

interface NotesListSidebarProps {
  onNoteSelect: (note: Note) => void;
}

const NotesListSidebar: React.FC<NotesListSidebarProps> = ({ onNoteSelect }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [treeStructure, setTreeStructure] = useState<TreeNode>({ name: '/', children: [], isFolder: true, isOpen: true });
  const supabaseUserId = useUserStore((state) => state.supabaseUserId);
  const [newItemName, setNewItemName] = useState('');
  const [creatingItemAt, setCreatingItemAt] = useState<string | null>(null);
  const [creatingItemType, setCreatingItemType] = useState<'note' | 'folder' | null>(null);
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (supabaseUserId) {
      fetchNotes();
    }
  }, [supabaseUserId]);

  const fetchNotes = async () => {
    if (!supabaseUserId) return;

    const response = await fetch(`/api/notes?userId=${supabaseUserId}`);
    if (response.ok) {
      const data = await response.json();
      setNotes(data);
      setTreeStructure(buildTreeStructure(data));
    } else {
      console.error('Error fetching notes:', await response.text());
    }
  };

  const buildTreeStructure = (notes: Note[]): TreeNode => {
    const root: TreeNode = { name: '/', children: [], isFolder: true, isOpen: true };

    notes.forEach(note => {
      const parts = note.path.split('/').filter(Boolean);
      let currentNode = root;

      parts.forEach((part, index) => {
        let child = currentNode.children.find(c => c.name === part && c.isFolder);
        if (!child) {
          child = { name: part, children: [], isFolder: true, isOpen: openFolders.has(currentNode.name + '/' + part) };
          currentNode.children.push(child);
        }
        currentNode = child;

        if (index === parts.length - 1) {
          currentNode.children.push({ name: note.title, children: [], note, isFolder: false, isOpen: false });
        }
      });
    });

    return root;
  };

  const createNote = async (title: string, path: string) => {
    const response = await fetch('/api/notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, content: '', userId: supabaseUserId, path }),
    });

    if (!response.ok) {
      throw new Error('Failed to create note');
    }

    await fetchNotes();
  };

  const createFolder = (path: string) => {
    // In this implementation, folders are implicit and don't need to be created in the database
    // We just need to refresh the tree structure
    fetchNotes();
  };

  const handleCreateItem = (type: 'note' | 'folder', path: string) => {
    setCreatingItemAt(path);
    setCreatingItemType(type);
    setNewItemName('');
  };

  const handleSubmitNewItem = async () => {
    if (!newItemName || !creatingItemAt || !creatingItemType) return;

    const fullPath = creatingItemAt === '/' ? `/${newItemName}` : `${creatingItemAt}/${newItemName}`;

    if (creatingItemType === 'note') {
      await createNote(newItemName, fullPath);
    } else {
      createFolder(fullPath);
    }

    setCreatingItemAt(null);
    setCreatingItemType(null);
    setNewItemName('');
  };

  const toggleFolder = (path: string) => {
    setOpenFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  const renderTree = (node: TreeNode, path: string = '', level: number = 0) => (
    <div key={path + node.name} className={`${level > 0 ? 'ml-4' : ''}`}>
      <div className="flex items-center py-1 px-2 rounded-md hover:bg-gray-200 transition-colors duration-150">
        {node.isFolder && (
          <Button variant="ghost" size="sm" className="p-0 h-auto mr-1" onClick={() => toggleFolder(path + node.name)}>
            {node.isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </Button>
        )}
        {node.isFolder ? <Folder className="w-4 h-4 mr-2 text-blue-500" /> : <File className="w-4 h-4 mr-2 text-gray-500" />}
        <span className="text-sm font-medium text-gray-700">{node.name}</span>
        {node.isFolder && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="ml-auto p-0 h-auto">
                <MoreVertical className="w-4 h-4 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => handleCreateItem('note', path + node.name)}>
                <File className="w-4 h-4 mr-2" />
                New Note
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCreateItem('folder', path + node.name)}>
                <Folder className="w-4 h-4 mr-2" />
                New Folder
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      {node.isFolder && node.isOpen && (
        <div className="mt-1">
          {node.children.map(child => renderTree(child, path + node.name + '/', level + 1))}
          {creatingItemAt === path + node.name && (
            <div className="flex items-center mt-2 ml-6">
              <Input
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder={`New ${creatingItemType}`}
                className="mr-2 h-8 text-sm"
              />
              <Button onClick={handleSubmitNewItem} size="sm" className="h-8">Create</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="w-64 bg-gray-50 p-4 overflow-y-auto border-r border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Notes</h2>
        <div className="flex space-x-2">
          <Button onClick={() => handleCreateItem('note', '/')} size="sm" variant="outline" className="h-8">
            <PlusCircle className="w-4 h-4 mr-1" />
            Note
          </Button>
          <Button onClick={() => handleCreateItem('folder', '/')} size="sm" variant="outline" className="h-8">
            <FolderPlus className="w-4 h-4 mr-1" />
            Folder
          </Button>
        </div>
      </div>
      <div className="space-y-1">
        {renderTree(treeStructure)}
      </div>
    </div>
  );
};

export default NotesListSidebar;
