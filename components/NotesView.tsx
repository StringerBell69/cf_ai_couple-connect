'use client';

import React, { useState } from 'react';
import { useAuth } from '@/components/contexts/AuthContext';
import { useNotes } from '@/components/contexts/NotesContext';
import { Plus, Trash2, Calendar, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

export function NotesView() {
  const { user } = useAuth();
  const { notes, addNote, deleteNote, isLoading } = useNotes();
  const [newNote, setNewNote] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddNote = async () => {
    if (!newNote.trim() || !user) return;
    
    setIsSubmitting(true);
    try {
      await addNote(newNote.trim());
      setNewNote('');
      setIsAdding(false);
      
      toast({
        title: "Note ajoutée ✨",
        description: "Ta note a été enregistrée",
      });
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la note",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNote = async (id: string, authorName: string) => {
    if (authorName !== user) {
      toast({
        title: "Action non autorisée",
        description: "Tu ne peux supprimer que tes propres notes",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await deleteNote(id);
      toast({
        title: "Note supprimée",
        description: "La note a été retirée",
      });
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la note",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full pt-14 pb-20 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground mt-2">Chargement des notes...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full pt-14 pb-20">
      {/* Add Note Section */}
      <div className="px-4 py-4 bg-card border-b border-border">
        {isAdding ? (
          <div className="space-y-3 animate-slide-up">
            <Textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Écris ta note ici... (préférence, demande, souhait...)"
              className="min-h-[100px] bg-muted border-0 rounded-xl resize-none"
              autoFocus
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => { setIsAdding(false); setNewNote(''); }}
                className="flex-1"
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button
                onClick={handleAddNote}
                disabled={!newNote.trim() || isSubmitting}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Ajouter'
                )}
              </Button>
            </div>
          </div>
        ) : (
          <Button
            onClick={() => setIsAdding(true)}
            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
          >
            <Plus className="w-5 h-5" />
            Ajouter une note
          </Button>
        )}
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-hide">
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6 animate-fade-in">
            <p className="text-muted-foreground">
              Aucune note pour le moment.
              <br />
              Commence par ajouter une préférence ou une demande !
            </p>
          </div>
        ) : (
          notes.map((note, index) => (
            <div
              key={note.id}
              className={`
                p-4 rounded-xl border-2 animate-slide-up
                ${note.authorName === 'Wendy' 
                  ? 'bg-wendy-light border-wendy/20' 
                  : 'bg-daniel-light border-daniel/20'}
              `}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`
                      px-2 py-0.5 rounded-full text-xs font-medium
                      ${note.authorName === 'Wendy' 
                        ? 'bg-wendy text-wendy-foreground' 
                        : 'bg-daniel text-daniel-foreground'}
                    `}>
                      {note.authorName}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {formatDate(note.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">
                    {note.content}
                  </p>
                </div>
                
                {note.authorName === user && (
                  <button
                    onClick={() => handleDeleteNote(note.id, note.authorName)}
                    className="p-2 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    aria-label="Supprimer la note"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
