import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Note, User } from '@/types';

interface NotesContextType {
  notes: Note[];
  addNote: (author: User, content: string) => void;
  deleteNote: (id: string) => void;
  getFormattedContext: () => string;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

// Demo notes - will be replaced with Lovable Cloud database
const INITIAL_NOTES: Note[] = [
  {
    id: '1',
    author: 'Wendy',
    content: "J'aimerais qu'on fasse plus de balades le dimanche matin",
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    author: 'Daniel',
    content: "Je préfère qu'on me prévienne à l'avance quand on a des invités",
    createdAt: new Date('2024-01-20'),
  },
  {
    id: '3',
    author: 'Wendy',
    content: "Je n'aime pas quand la vaisselle traîne plus d'une journée",
    createdAt: new Date('2024-02-05'),
  },
  {
    id: '4',
    author: 'Daniel',
    content: "J'apprécie quand tu me fais des petits mots doux le matin",
    createdAt: new Date('2024-02-10'),
  },
];

export function NotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('coupleMemory_notes');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((n: any) => ({ ...n, createdAt: new Date(n.createdAt) }));
    }
    return INITIAL_NOTES;
  });

  const saveNotes = (newNotes: Note[]) => {
    localStorage.setItem('coupleMemory_notes', JSON.stringify(newNotes));
    setNotes(newNotes);
  };

  const addNote = useCallback((author: User, content: string) => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      author,
      content,
      createdAt: new Date(),
    };
    saveNotes([newNote, ...notes]);
  }, [notes]);

  const deleteNote = useCallback((id: string) => {
    saveNotes(notes.filter(n => n.id !== id));
  }, [notes]);

  const getFormattedContext = useCallback(() => {
    return notes
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .map(note => `${note.author} - "${note.content}"`)
      .join('\n');
  }, [notes]);

  return (
    <NotesContext.Provider value={{ notes, addNote, deleteNote, getFormattedContext }}>
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
}
