import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, AlertTriangle, Server, Users, Zap, Plus, Bell } from "lucide-react";
import { useTasks } from "@/hooks/useTasks";
import { useNotes } from "@/hooks/useNotes";
import { useTaskAlerts } from "@/hooks/useTaskAlerts";
import { useMemo } from "react";

interface DashboardProps {
  onNavigateToTasks?: () => void;
  onNavigateToNotes?: () => void;
  onNavigateToTasksWithFilter?: (filter: { status?: string; priority?: string }) => void;
}

export const Dashboard = ({ onNavigateToTasks, onNavigateToNotes, onNavigateToTasksWithFilter }: DashboardProps) => {
  const { tasks } = useTasks();
  const { notes } = useNotes();
  
  // Ativar sistema de alertas sonoros
  useTaskAlerts(tasks);

  const stats = useMemo(() => {
    const pendingTasks = tasks.filter(task => task.status === 'Pendente').length;
    const completedToday = tasks.filter(task => {
      const today = new Date();
      const taskDate = new Date(task.updated_at);
      return task.status === 'Concluída' && 
             taskDate.toDateString() === today.toDateString();
    }).length;
    const criticalTasks = tasks.filter(task => task.priority === 'Crítica').length;
    const totalNotes = notes.length;

    return [
      {
        title: "Tarefas Pendentes",
        value: pendingTasks.toString(),
        description: "Aguardando execução",
        icon: Clock,
        color: "text-yellow-500",
        onClick: () => onNavigateToTasksWithFilter?.({ status: 'Pendente' }),
      },
      {
        title: "Concluídas Hoje",
        value: completedToday.toString(),
        description: "Finalizadas nas últimas 24h",
        icon: CheckCircle,
        color: "text-green-500",
        onClick: () => onNavigateToTasksWithFilter?.({ status: 'Concluída' }),
      },
      {
        title: "Críticas",
        value: criticalTasks.toString(),
        description: "Requerem atenção imediata",
        icon: AlertTriangle,
        color: "text-red-500",
        onClick: () => onNavigateToTasksWithFilter?.({ priority: 'Crítica' }),
      },
      {
        title: "Anotações",
        value: totalNotes.toString(),
        description: "Documentação disponível",
        icon: Users,
        color: "text-blue-500",
        onClick: () => onNavigateToNotes?.(),
      },
    ];
  }, [tasks, notes, onNavigateToTasksWithFilter, onNavigateToNotes]);

  // Ordenar tarefas por prioridade (Crítica primeiro)
  const recentTasks = useMemo(() => {
    const priorityOrder = { 'Crítica': 1, 'Alta': 2, 'Média': 3, 'Baixa': 4 };
    
    return tasks
      .sort((a, b) => {
        // Primeiro por prioridade
        const priorityA = priorityOrder[a.priority as keyof typeof priorityOrder] || 5;
        const priorityB = priorityOrder[b.priority as keyof typeof priorityOrder] || 5;
        
        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }
        
        // Depois por data de criação (mais recente primeiro)
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      })
      .slice(0, 5);
  }, [tasks]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Crítica": return "bg-red-500";
      case "Alta": return "bg-orange-500";
      case "Média": return "bg-yellow-500";
      default: return "bg-green-500";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Concluída": return "bg-green-100 text-green-800";
      case "Em andamento": return "bg-blue-100 text-blue-800";
      case "Pendente": return "bg-yellow-100 text-yellow-800";
      case "Agendada": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card 
            key={index} 
            className={`cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${
              stat.title === "Críticas" && parseInt(stat.value) > 0 ? "border-red-500 bg-red-50 shadow-lg" : "hover:bg-muted/50"
            }`}
            onClick={stat.onClick}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className="flex items-center gap-2">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                {stat.title === "Críticas" && parseInt(stat.value) > 0 && (
                  <Bell className="h-4 w-4 text-red-500 animate-pulse" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Tarefas Recentes
                </CardTitle>
                <CardDescription>
                  Ordenadas por prioridade - críticas primeiro
                </CardDescription>
              </div>
              {onNavigateToTasks && (
                <Button variant="outline" size="sm" onClick={onNavigateToTasks}>
                  Ver Todas
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {recentTasks.length > 0 ? (
              <div className="space-y-4">
                {recentTasks.map((task) => (
                  <div 
                    key={task.id} 
                    className={`flex items-center justify-between p-3 border rounded-lg transition-all ${
                      task.priority === 'Crítica' 
                        ? 'border-red-500 bg-red-50 shadow-md hover:shadow-lg' 
                        : 'hover:shadow-sm'
                    }`}
                  >
                    <div className="flex-1">
                      <h4 className={`text-sm font-medium ${
                        task.priority === 'Crítica' ? 'text-red-800 font-bold' : ''
                      }`}>
                        {task.priority === 'Crítica' && '🚨 '}
                        {task.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)} ${
                          task.priority === 'Crítica' ? 'animate-pulse' : ''
                        }`}></div>
                        <span className={`text-xs ${
                          task.priority === 'Crítica' ? 'text-red-700 font-semibold' : 'text-muted-foreground'
                        }`}>
                          {task.priority}
                        </span>
                        <Badge variant="secondary" className="text-xs">{task.category}</Badge>
                        {task.priority === 'Crítica' && (
                          <AlertTriangle className="h-3 w-3 text-red-500 animate-pulse" />
                        )}
                      </div>
                    </div>
                    <Badge className={getStatusColor(task.status)}>
                      {task.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-4">
                  Nenhuma tarefa cadastrada ainda
                </p>
                {onNavigateToTasks && (
                  <Button onClick={onNavigateToTasks}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeira Tarefa
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Resumo do Sistema
                </CardTitle>
                <CardDescription>
                  Status geral da plataforma
                </CardDescription>
              </div>
              {notes.length === 0 && onNavigateToNotes && (
                <Button variant="outline" size="sm" onClick={onNavigateToNotes}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Anotação
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <Server className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Sistema operacional</p>
                  <p className="text-xs text-muted-foreground">
                    {tasks.length} tarefas • {notes.length} anotações
                  </p>
                </div>
              </div>
              
              {stats[0].value !== "0" && (
                <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium">Tarefas pendentes</p>
                    <p className="text-xs text-muted-foreground">
                      {stats[0].value} tarefa(s) aguardando execução
                    </p>
                  </div>
                </div>
              )}

              {stats[2].value !== "0" && (
                <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg shadow-md">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600 animate-pulse" />
                    <Bell className="h-4 w-4 text-red-600 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-800">⚠️ Atenção crítica necessária</p>
                    <p className="text-xs text-red-600">
                      {stats[2].value} tarefa(s) com prioridade crítica - Alertas sonoros ativos
                    </p>
                  </div>
                </div>
              )}

              {tasks.length === 0 && notes.length === 0 && (
                <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <Users className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Bem-vindo!</p>
                    <p className="text-xs text-muted-foreground">
                      Comece criando suas primeiras tarefas e anotações
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
