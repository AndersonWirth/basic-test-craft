
import { useEffect, useCallback, useRef } from 'react';
import { Task } from '@/hooks/useTasks';
import { useToast } from '@/hooks/use-toast';

export const useTaskAlerts = (tasks: Task[]) => {
  const { toast } = useToast();
  const alertIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const notifiedTasksRef = useRef<Set<string>>(new Set());
  const audioContextRef = useRef<AudioContext | null>(null);

  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (error) {
        console.log('AudioContext não suportado:', error);
      }
    }
    return audioContextRef.current;
  }, []);

  const playAlertSound = useCallback(() => {
    try {
      const audioContext = initAudioContext();
      if (!audioContext) return;

      // Garantir que o contexto esteja ativo
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
      
      // Sequência de tons para alerta crítico
      const playTone = (frequency: number, duration: number, delay: number = 0) => {
        setTimeout(() => {
          if (!audioContext) return;
          
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
          oscillator.type = 'sine';
          
          gainNode.gain.setValueAtTime(0, audioContext.currentTime);
          gainNode.gain.linearRampToValueAtTime(0.4, audioContext.currentTime + 0.01);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + duration);
        }, delay);
      };

      // Sequência de alerta mais intensa: 5 bips rápidos
      playTone(1000, 0.2, 0);
      playTone(800, 0.2, 300);
      playTone(1200, 0.2, 600);
      playTone(900, 0.2, 900);
      playTone(1400, 0.3, 1200);
      
    } catch (error) {
      console.log('Erro ao reproduzir som de alerta:', error);
    }
  }, [initAudioContext]);

  const showNotification = useCallback((title: string, body: string) => {
    // Tentar usar Web Notifications API
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: 'task-alert',
        requireInteraction: true
      });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
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

  const checkCriticalTasks = useCallback(() => {
    // Verificar tarefas críticas que não foram notificadas
    const criticalTasks = tasks.filter(task => {
      const isCritical = task.priority === 'Crítica';
      const isPending = task.status === 'Pendente' || task.status === 'Agendada';
      const notNotified = !notifiedTasksRef.current.has(`critical-${task.id}`);
      
      return isCritical && isPending && notNotified;
    });

    if (criticalTasks.length > 0) {
      criticalTasks.forEach(task => {
        // Marcar como notificada para tarefas críticas
        notifiedTasksRef.current.add(`critical-${task.id}`);
        
        // Reproduzir som
        playAlertSound();
        
        // Mostrar toast
        toast({
          title: "🚨 ALERTA CRÍTICO",
          description: `Tarefa crítica detectada: ${task.title}`,
          variant: "destructive",
        });
        
        // Mostrar notificação do navegador
        showNotification(
          "🚨 ALERTA CRÍTICO",
          `Tarefa crítica: ${task.title}`
        );

        console.log('Alerta crítico disparado para:', task.title);
      });
    }
  }, [tasks, playAlertSound, toast, showNotification]);

  const checkScheduledAlerts = useCallback(() => {
    const now = new Date();
    
    // Filtrar tarefas que têm horário de alerta definido
    const tasksToAlert = tasks.filter(task => {
      if (!task.alert_time) return false;
      
      const alertTime = new Date(task.alert_time);
      const timeDiff = alertTime.getTime() - now.getTime();
      
      // Verificar se está no horário do alerta (dentro de 1 minuto de margem)
      const isAlertTime = timeDiff <= 60000 && timeDiff >= -60000;
      const isPending = task.status === 'Pendente' || task.status === 'Agendada';
      const alreadyNotified = notifiedTasksRef.current.has(`scheduled-${task.id}`);
      
      return isAlertTime && isPending && !alreadyNotified;
    });

    if (tasksToAlert.length > 0) {
      tasksToAlert.forEach(task => {
        // Marcar como notificada para alertas agendados
        notifiedTasksRef.current.add(`scheduled-${task.id}`);
        
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

        console.log('Alerta agendado disparado para:', task.title);
      });
    }
  }, [tasks, playAlertSound, toast, showNotification]);

  // Efeito para solicitar permissões e configurar intervalos
  useEffect(() => {
    // Solicitar permissão para notificações
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Inicializar contexto de áudio no primeiro clique do usuário
    const initAudio = () => {
      initAudioContext();
      document.removeEventListener('click', initAudio);
    };
    document.addEventListener('click', initAudio);

    // Verificar alertas críticos imediatamente e depois a cada 30 segundos
    checkCriticalTasks();
    checkScheduledAlerts();

    const criticalInterval = setInterval(checkCriticalTasks, 30000);
    const scheduledInterval = setInterval(checkScheduledAlerts, 30000);

    return () => {
      clearInterval(criticalInterval);
      clearInterval(scheduledInterval);
      document.removeEventListener('click', initAudio);
    };
  }, [checkCriticalTasks, checkScheduledAlerts, initAudioContext]);

  // Limpar notificações quando as tarefas são concluídas
  useEffect(() => {
    const completedTasks = tasks.filter(task => task.status === 'Concluída');
    completedTasks.forEach(task => {
      notifiedTasksRef.current.delete(`critical-${task.id}`);
      notifiedTasksRef.current.delete(`scheduled-${task.id}`);
    });
  }, [tasks]);

  return { playAlertSound, checkScheduledAlerts, checkCriticalTasks };
};
