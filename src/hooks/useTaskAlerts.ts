
import { useEffect, useCallback } from 'react';
import { Task } from '@/hooks/useTasks';
import { useToast } from '@/hooks/use-toast';

export const useTaskAlerts = (tasks: Task[]) => {
  const { toast } = useToast();

  const playAlertSound = useCallback(() => {
    try {
      // Criar contexto de áudio
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Sequência de tons para alerta crítico
      const playTone = (frequency: number, duration: number, delay: number = 0) => {
        setTimeout(() => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
          oscillator.type = 'sine';
          
          gainNode.gain.setValueAtTime(0, audioContext.currentTime);
          gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.01);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + duration);
        }, delay);
      };

      // Sequência de alerta: 3 bips
      playTone(800, 0.2, 0);
      playTone(1000, 0.2, 300);
      playTone(800, 0.3, 600);
      
    } catch (error) {
      console.log('Não foi possível reproduzir o som de alerta:', error);
    }
  }, []);

  const checkCriticalTasks = useCallback(() => {
    const criticalPendingTasks = tasks.filter(task => 
      task.priority === 'Crítica' && 
      (task.status === 'Pendente' || task.status === 'Agendada')
    );

    if (criticalPendingTasks.length > 0) {
      playAlertSound();
      
      toast({
        title: "🚨 Alerta de Tarefa Crítica",
        description: `${criticalPendingTasks.length} tarefa(s) crítica(s) precisam de atenção imediata!`,
        variant: "destructive",
      });
    }
  }, [tasks, playAlertSound, toast]);

  useEffect(() => {
    // Verificar alertas a cada 5 minutos
    const alertInterval = setInterval(checkCriticalTasks, 5 * 60 * 1000);
    
    // Verificar imediatamente ao carregar
    const timeoutId = setTimeout(checkCriticalTasks, 2000);

    return () => {
      clearInterval(alertInterval);
      clearTimeout(timeoutId);
    };
  }, [checkCriticalTasks]);

  return { playAlertSound, checkCriticalTasks };
};
