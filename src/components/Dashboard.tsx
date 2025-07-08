
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, AlertTriangle, Server, Users, Zap } from "lucide-react";

export const Dashboard = () => {
  const stats = [
    {
      title: "Tarefas Pendentes",
      value: "12",
      description: "Aguardando execução",
      icon: Clock,
      color: "text-yellow-500",
    },
    {
      title: "Concluídas Hoje",
      value: "8",
      description: "Finalizadas nas últimas 24h",
      icon: CheckCircle,
      color: "text-green-500",
    },
    {
      title: "Críticas",
      value: "3",
      description: "Requerem atenção imediata",
      icon: AlertTriangle,
      color: "text-red-500",
    },
    {
      title: "Sistemas Ativos",
      value: "24",
      description: "Monitoramento em tempo real",
      icon: Server,
      color: "text-blue-500",
    },
  ];

  const recentTasks = [
    { id: 1, title: "Atualizar servidor de backup", priority: "Alta", status: "Em andamento" },
    { id: 2, title: "Configurar nova VPN", priority: "Média", status: "Pendente" },
    { id: 3, title: "Auditoria de segurança mensal", priority: "Alta", status: "Concluída" },
    { id: 4, title: "Backup dos bancos de dados", priority: "Crítica", status: "Agendada" },
  ];

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
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
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
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Tarefas Recentes
            </CardTitle>
            <CardDescription>
              Últimas atividades registradas no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium">{task.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`}></div>
                      <span className="text-xs text-muted-foreground">{task.priority}</span>
                    </div>
                  </div>
                  <Badge className={getStatusColor(task.status)}>
                    {task.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Alertas do Sistema
            </CardTitle>
            <CardDescription>
              Monitoramento e notificações importantes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium">Espaço em disco baixo</p>
                  <p className="text-xs text-muted-foreground">Servidor principal: 85% utilizado</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Server className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Backup concluído</p>
                  <p className="text-xs text-muted-foreground">Último backup: há 2 horas</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <Users className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Sistema estável</p>
                  <p className="text-xs text-muted-foreground">Todos os serviços funcionando</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
