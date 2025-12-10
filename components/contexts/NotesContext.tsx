'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

type User = 'Wendy' | 'Daniel';

interface Note {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  expiresAt: string | null;
  createdAt: string;
}

interface NotesContextType {
  notes: Note[];
  addNote: (content: string, expiresAt?: Date | null) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  getFormattedContext: () => string;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export function NotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotes = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/notes');
      if (response.ok) {
        const data = await response.json();
        setNotes(data.notes || []);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const addNote = useCallback(async (content: string, expiresAt?: Date | null) => {
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content,
          expiresAt: expiresAt ? expiresAt.toISOString() : null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setNotes(prev => [data.note, ...prev]);
      }
    } catch (error) {
      console.error('Error adding note:', error);
      throw error;
    }
  }, []);

  const deleteNote = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/notes?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setNotes(prev => prev.filter(n => n.id !== id));
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  }, []);

  const getFormattedContext = useCallback(() => {
    return notes
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .map(note => `${note.authorName} - "${note.content}"`)
      .join('\n');
  }, [notes]);

  return (
    <NotesContext.Provider value={{ notes, addNote, deleteNote, getFormattedContext, isLoading, refetch: fetchNotes }}>
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
