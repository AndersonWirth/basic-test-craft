
-- Adicionar campo para horário de alerta nas tarefas
ALTER TABLE public.tasks 
ADD COLUMN alert_time TIMESTAMP WITH TIME ZONE;

-- Adicionar campo para controlar se o alerta já foi enviado
ALTER TABLE public.tasks 
ADD COLUMN alert_sent BOOLEAN DEFAULT false;
