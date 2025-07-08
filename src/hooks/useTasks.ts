
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  category: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchTasks = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar as tarefas",
        variant: "destructive",
      });
    } else {
      setTasks(data || []);
    }
    setLoading(false);
  };

  const addTask = async (taskData: {
    title: string;
    description: string;
    category: string;
    priority: string;
  }) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        ...taskData,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a tarefa",
        variant: "destructive",
      });
      return null;
    } else {
      setTasks(prev => [data, ...prev]);
      toast({
        title: "Sucesso",
        description: "Tarefa adicionada com sucesso!",
      });
      return data;
    }
  };

  const updateTaskStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('tasks')
      .update({ status })
      .eq('id', id);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a tarefa",
        variant: "destructive",
      });
    } else {
      setTasks(prev => prev.map(task => 
        task.id === id ? { ...task, status } : task
      ));
      toast({
        title: "Atualizado",
        description: `Status atualizado para: ${status}`,
      });
    }
  };

  const deleteTask = async (id: string) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover a tarefa",
        variant: "destructive",
      });
    } else {
      setTasks(prev => prev.filter(task => task.id !== id));
      toast({
        title: "Removido",
        description: "Tarefa removida com sucesso",
      });
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  return {
    tasks,
    loading,
    addTask,
    updateTaskStatus,
    deleteTask,
    refetch: fetchTasks,
  };
};
