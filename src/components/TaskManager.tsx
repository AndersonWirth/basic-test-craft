import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Filter, CheckCircle, Clock, AlertTriangle, Trash2, Loader2, Bell } from "lucide-react";
import { useTasks } from "@/hooks/useTasks";

export const TaskManager = () => {
  const { tasks, loading, addTask, updateTaskStatus, deleteTask } = useTasks();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("Todas");
  const [filterStatus, setFilterStatus] = useState("Todas");
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    category: "",
    priority: "",
    alert_time: "",
  });

  const categories = ["Infraestrutura", "Segurança", "Desenvolvimento", "Suporte", "Monitoramento"];
  const priorities = ["Baixa", "Média", "Alta", "Crítica"];
  const statuses = ["Pendente", "Em andamento", "Concluída", "Cancelada"];

  // Ordenar tarefas por prioridade (Crítica primeiro)
  const priorityOrder = { 'Crítica': 1, 'Alta': 2, 'Média': 3, 'Baixa': 4 };
  
  const filteredTasks = tasks
    .filter((task) => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = filterCategory === "Todas" || task.category === filterCategory;
      const matchesStatus = filterStatus === "Todas" || task.status === filterStatus;
      
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      // Primeiro por prioridade
      const priorityA = priorityOrder[a.priority as keyof typeof priorityOrder] || 5;
      const priorityB = priorityOrder[b.priority as keyof typeof priorityOrder] || 5;
      
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      
      // Depois por data de criação (mais recente primeiro)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const handleAddTask = async () => {
    if (!newTask.title || !newTask.category || !newTask.priority) {
      return;
    }

    // Salvar o datetime-local diretamente como string ISO
    let alertTimeISO = null;
    if (newTask.alert_time) {
      // Apenas adicionar os segundos e timezone para formar um ISO válido
      alertTimeISO = newTask.alert_time + ':00.000Z';
    }

    const taskData = {
      title: newTask.title,
      description: newTask.description,
      category: newTask.category,
      priority: newTask.priority,
      alert_time: alertTimeISO,
    };

    const result = await addTask(taskData as any);
    if (result) {
      setNewTask({ title: "", description: "", category: "", priority: "", alert_time: "" });
      setIsAddingTask(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Crítica": return "bg-red-500";
      case "Alta": return "bg-orange-500";
      case "Média": return "bg-yellow-500";
      case "Baixa": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Concluída": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "Em andamento": return <Clock className="h-4 w-4 text-blue-500" />;
      case "Pendente": return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDateTime = (dateTime: string) => {
    // Extrair apenas a parte da data e hora, ignorando timezone
    const isoString = dateTime.replace('Z', '');
    const [datePart, timePart] = isoString.split('T');
    const [year, month, day] = datePart.split('-');
    const [hour, minute] = timePart.split(':');
    
    return `${day}/${month}/${year} ${hour}:${minute}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando tarefas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex flex-1 gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar tarefas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todas">Todas Categorias</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todas">Todos Status</SelectItem>
              {statuses.map((status) => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Dialog open={isAddingTask} onOpenChange={setIsAddingTask}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Tarefa
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Adicionar Nova Tarefa</DialogTitle>
              <DialogDescription>
                Preencha os detalhes da nova tarefa de TI.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input
                placeholder="Título da tarefa *"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              />
              <Textarea
                placeholder="Descrição detalhada"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              />
              <Select value={newTask.category} onValueChange={(value) => setNewTask({ ...newTask, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria *" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={newTask.priority} onValueChange={(value) => setNewTask({ ...newTask, priority: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a prioridade *" />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((priority) => (
                    <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Horário do Alerta (opcional)
                </label>
                <Input
                  type="datetime-local"
                  value={newTask.alert_time}
                  onChange={(e) => setNewTask({ ...newTask, alert_time: e.target.value })}
                  placeholder="Defina quando deve ser alertado"
                />
                <p className="text-xs text-muted-foreground">
                  O alerta será disparado no horário local definido
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddingTask(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddTask}>Adicionar Tarefa</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTasks.map((task) => (
          <Card 
            key={task.id} 
            className={`relative ${
              task.priority === 'Crítica' 
                ? 'border-red-500 bg-red-50 shadow-lg ring-2 ring-red-200' 
                : ''
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(task.status)}
                  <CardTitle className={`text-lg ${
                    task.priority === 'Crítica' ? 'text-red-800 font-bold' : ''
                  }`}>
                    {task.priority === 'Crítica' && '🚨 '}
                    {task.title}
                  </CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteTask(task.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)} ${
                  task.priority === 'Crítica' ? 'animate-pulse' : ''
                }`}></div>
                <Badge variant="secondary">{task.category}</Badge>
                <Badge 
                  variant="outline" 
                  className={task.priority === 'Crítica' ? 'border-red-500 text-red-700 font-semibold' : ''}
                >
                  {task.priority}
                </Badge>
                {task.alert_time && (
                  <Badge variant="outline" className="text-blue-600 border-blue-300">
                    <Bell className="h-3 w-3 mr-1" />
                    Alerta
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="mb-4">
                {task.description || "Sem descrição"}
              </CardDescription>
              
              {task.alert_time && (
                <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                  <div className="flex items-center gap-1">
                    <Bell className="h-3 w-3 text-blue-600" />
                    <span className="font-medium text-blue-800">Alerta programado:</span>
                  </div>
                  <span className="text-blue-700">
                    {formatDateTime(task.alert_time)}
                  </span>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {new Date(task.created_at).toLocaleDateString('pt-BR')}
                </span>
                <Select 
                  value={task.status} 
                  onValueChange={(value) => updateTaskStatus(task.id, value)}
                >
                  <SelectTrigger className="w-32 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <CheckCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma tarefa encontrada</h3>
          <p className="text-muted-foreground">
            {searchTerm || filterCategory !== "Todas" || filterStatus !== "Todas" 
              ? "Tente ajustar os filtros de busca" 
              : "Adicione sua primeira tarefa para começar"
            }
          </p>
        </div>
      )}
    </div>
  );
};
