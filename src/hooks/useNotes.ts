
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Note {
  id: string;
  title: string;
  content: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchNotes = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar as anotações",
        variant: "destructive",
      });
    } else {
      setNotes(data || []);
    }
    setLoading(false);
  };

  const addNote = async (noteData: {
    title: string;
    content: string;
    tags: string[];
  }) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('notes')
      .insert({
        ...noteData,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a anotação",
        variant: "destructive",
      });
      return null;
    } else {
      setNotes(prev => [data, ...prev]);
      toast({
        title: "Sucesso",
        description: "Anotação adicionada com sucesso!",
      });
      return data;
    }
  };

  const updateNote = async (id: string, noteData: {
    title: string;
    content: string;
    tags: string[];
  }) => {
    const { error } = await supabase
      .from('notes')
      .update(noteData)
      .eq('id', id);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a anotação",
        variant: "destructive",
      });
    } else {
      setNotes(prev => prev.map(note => 
        note.id === id ? { ...note, ...noteData, updated_at: new Date().toISOString() } : note
      ));
      toast({
        title: "Sucesso",
        description: "Anotação atualizada com sucesso!",
      });
    }
  };

  const deleteNote = async (id: string) => {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover a anotação",
        variant: "destructive",
      });
    } else {
      setNotes(prev => prev.filter(note => note.id !== id));
      toast({
        title: "Removido",
        description: "Anotação removida com sucesso",
      });
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [user]);

  return {
    notes,
    loading,
    addNote,
    updateNote,
    deleteNote,
    refetch: fetchNotes,
  };
};
