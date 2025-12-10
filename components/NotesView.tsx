'use client';

import React, { useState } from 'react';
import { useAuth } from '@/components/contexts/AuthContext';
import { useNotes } from '@/components/contexts/NotesContext';
import { Plus, Trash2, Calendar, Loader2, Clock, Infinity, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';

type ExpirationPreset = '1d' | '1w' | '1m' | 'forever' | 'custom';

const EXPIRATION_PRESETS: { value: ExpirationPreset; label: string; icon: React.ReactNode }[] = [
  { value: '1d', label: '1 jour', icon: <Clock className="w-3 h-3" /> },
  { value: '1w', label: '1 semaine', icon: <Clock className="w-3 h-3" /> },
  { value: '1m', label: '1 mois', icon: <Clock className="w-3 h-3" /> },
  { value: 'forever', label: 'Toujours', icon: <Infinity className="w-3 h-3" /> },
  { value: 'custom', label: 'Personnalisé', icon: <CalendarDays className="w-3 h-3" /> },
];

function getExpirationDate(preset: ExpirationPreset, customDate?: string): Date | null {
  const now = new Date();
  switch (preset) {
    case '1d':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    case '1w':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case '1m':
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    case 'forever':
      return null;
    case 'custom':
      if (customDate) {
        const date = new Date(customDate);
        // Set to end of day
        date.setHours(23, 59, 59, 999);
        return date;
      }
      return null;
  }
}

export function NotesView() {
  const { user } = useAuth();
  const { notes, addNote, deleteNote, isLoading } = useNotes();
  const [newNote, setNewNote] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<ExpirationPreset>('forever');
  const [customDate, setCustomDate] = useState('');

  const handleAddNote = async () => {
    if (!newNote.trim() || !user) return;
    if (selectedPreset === 'custom' && !customDate) {
      toast({
        title: "Date requise",
        description: "Sélectionne une date d'expiration",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const expiresAt = getExpirationDate(selectedPreset, customDate);
      await addNote(newNote.trim(), expiresAt);
      setNewNote('');
      setIsAdding(false);
      setSelectedPreset('forever');
      setCustomDate('');
      
      const presetLabel = EXPIRATION_PRESETS.find(p => p.value === selectedPreset)?.label;
      toast({
        title: "Note ajoutée ✨",
        description: selectedPreset === 'forever' 
          ? "Ta note a été enregistrée pour toujours"
          : selectedPreset === 'custom'
            ? `Ta note expirera le ${new Date(customDate).toLocaleDateString('fr-FR')}`
            : `Ta note expirera dans ${presetLabel}`,
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

  const formatExpiresAt = (expiresAt: string | null) => {
    if (!expiresAt) return null;
    const date = new Date(expiresAt);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return 'Expire bientôt';
    if (diffDays === 1) return 'Expire demain';
    if (diffDays <= 7) return `Expire dans ${diffDays}j`;
    return `Expire le ${formatDate(expiresAt)}`;
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
            
            {/* Expiration Presets */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Durée de validité :</p>
              <div className="flex flex-wrap gap-2">
                {EXPIRATION_PRESETS.map((preset) => (
                  <Button
                    key={preset.value}
                    variant={selectedPreset === preset.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedPreset(preset.value)}
                    className="gap-1"
                  >
                    {preset.icon}
                    {preset.label}
                  </Button>
                ))}
              </div>
              
              {/* Custom date picker */}
              {selectedPreset === 'custom' && (
                <div className="pt-2">
                  <Input
                    type="date"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                    className="bg-muted border-0 rounded-lg"
                  />
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => { setIsAdding(false); setNewNote(''); setSelectedPreset('forever'); setCustomDate(''); }}
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
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
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
                    {note.expiresAt ? (
                      <span className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400">
                        <Clock className="w-3 h-3" />
                        {formatExpiresAt(note.expiresAt)}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                        <Infinity className="w-3 h-3" />
                        Permanent
                      </span>
                    )}
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

