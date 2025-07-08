
import { useEffect, useCallback, useRef } from 'react';
import { Task } from '@/hooks/useTasks';
import { useToast } from '@/hooks/use-toast';

export const useTaskAlerts = (tasks: Task[]) => {
  const { toast } = useToast();
  const alertIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const notifiedTasksRef = useRef<Set<string>>(new Set());

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
          gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + duration);
        }, delay);
      };

      // Sequência de alerta mais intensa: 5 bips
      playTone(1000, 0.3, 0);
      playTone(800, 0.3, 400);
      playTone(1000, 0.3, 800);
      playTone(800, 0.3, 1200);
      playTone(1200, 0.5, 1600);
      
    } catch (error) {
      console.log('Não foi possível reproduzir o som de alerta:', error);
    }
  }, []);

  const showNotification = useCallback((title: string, body: string) => {
    // Tentar usar Web Notifications API para alertas mesmo com aba não focada
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: 'task-alert',
        requireInteraction: true
      });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      // Solicitar permissão para notificações
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          new Notification(title, {
            body,
            icon: '/favicon.ico',
            tag: 'task-alert',
            requireInteraction: true
          });
        }
      });
    }
  }, []);

  const checkScheduledAlerts = useCallback(() => {
    const now = new Date();
    
    // Filtrar APENAS tarefas que têm horário de alerta definido
    const tasksToAlert = tasks.filter(task => {
      // Só processar tarefas que têm alert_time definido
      if (!task.alert_time) return false;
      
      const alertTime = new Date(task.alert_time);
      const timeDiff = alertTime.getTime() - now.getTime();
      
      // Verificar se está no horário do alerta (dentro de 1 minuto de margem)
      const isAlertTime = timeDiff <= 60000 && timeDiff >= -60000;
      
      // Verificar se a tarefa ainda está pendente ou agendada
      const isPending = task.status === 'Pendente' || task.status === 'Agendada';
      
      // Verificar se já foi notificada
      const alreadyNotified = notifiedTasksRef.current.has(task.id);
      
      return isAlertTime && isPending && !alreadyNotified;
    });

    if (tasksToAlert.length > 0) {
      tasksToAlert.forEach(task => {
        // Marcar como notificada
        notifiedTasksRef.current.add(task.id);
        
        // Reproduzir som
        playAlertSound();
        
        // Mostrar toast
        toast({
          title: "⏰ Alerta de Tarefa Agendada",
          description: `${task.title} - Horário: ${new Date(task.alert_time!).toLocaleTimeString('pt-BR')}`,
          variant: "destructive",
        });
        
        // Mostrar notificação do navegador
        showNotification(
          "⏰ Alerta de Tarefa",
          `${task.title} - ${task.priority === 'Crítica' ? '🚨 CRÍTICA' : task.priority}`
        );
      });
    }
  }, [tasks, playAlertSound, toast, showNotification]);

  useEffect(() => {
    // Solicitar permissão para notificações quando o hook é inicializado
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Limpar alertas notificados quando as tarefas mudam
    notifiedTasksRef.current.clear();

    // Verificar alertas agendados a cada 30 segundos
    const alertInterval = setInterval(() => {
      checkScheduledAlerts();
    }, 30000);

    // Verificar imediatamente ao carregar (aguardar 2 segundos para evitar alertas na criação)
    const timeoutId = setTimeout(() => {
      checkScheduledAlerts();
    }, 2000);

    alertIntervalRef.current = alertInterval;

    return () => {
      clearInterval(alertInterval);
      clearTimeout(timeoutId);
    };
  }, [checkScheduledAlerts]);

  // Limpar notificações quando as tarefas são concluídas
  useEffect(() => {
    const completedTasks = tasks.filter(task => task.status === 'Concluída');
    completedTasks.forEach(task => {
      notifiedTasksRef.current.delete(task.id);
    });
  }, [tasks]);

  return { playAlertSound, checkScheduledAlerts };
};
