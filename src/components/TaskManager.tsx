
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Filter, CheckCircle, Clock, AlertTriangle, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Task {
  id: number;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  createdAt: Date;
}

export const TaskManager = () => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      title: "Atualizar servidor de backup principal",
      description: "Aplicar patches de segurança e atualizar sistema operacional",
      category: "Infraestrutura",
      priority: "Alta",
      status: "Em andamento",
      createdAt: new Date(2024, 0, 15),
    },
    {
      id: 2,
      title: "Configurar nova VPN corporativa",
      description: "Implementar solução VPN para trabalho remoto seguro",
      category: "Segurança",
      priority: "Média",
      status: "Pendente",
      createdAt: new Date(2024, 0, 14),
    },
    {
      id: 3,
      title: "Auditoria de segurança mensal",
      description: "Revisar logs de segurança e verificar vulnerabilidades",
      category: "Segurança",
      priority: "Alta",
      status: "Concluída",
      createdAt: new Date(2024, 0, 13),
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("Todas");
  const [filterStatus, setFilterStatus] = useState("Todas");
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    category: "",
    priority: "",
  });

  const { toast } = useToast();

  const categories = ["Infraestrutura", "Segurança", "Desenvolvimento", "Suporte", "Monitoramento"];
  const priorities = ["Baixa", "Média", "Alta", "Crítica"];
  const statuses = ["Pendente", "Em andamento", "Concluída", "Cancelada"];

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "Todas" || task.category === filterCategory;
    const matchesStatus = filterStatus === "Todas" || task.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const addTask = () => {
    if (!newTask.title || !newTask.category || !newTask.priority) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    const task: Task = {
      id: Date.now(),
      title: newTask.title,
      description: newTask.description,
      category: newTask.category,
      priority: newTask.priority,
      status: "Pendente",
      createdAt: new Date(),
    };

    setTasks([...tasks, task]);
    setNewTask({ title: "", description: "", category: "", priority: "" });
    setIsAddingTask(false);
    
    toast({
      title: "Sucesso",
      description: "Tarefa adicionada com sucesso!",
    });
  };

  const updateTaskStatus = (id: number, status: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, status } : task
    ));
    
    toast({
      title: "Atualizado",
      description: `Status da tarefa atualizado para: ${status}`,
    });
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
    toast({
      title: "Removido",
      description: "Tarefa removida com sucesso",
    });
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
          <DialogContent className="sm:max-w-[425px]">
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
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddingTask(false)}>
                Cancelar
              </Button>
              <Button onClick={addTask}>Adicionar Tarefa</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTasks.map((task) => (
          <Card key={task.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(task.status)}
                  <CardTitle className="text-lg">{task.title}</CardTitle>
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
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`}></div>
                <Badge variant="secondary">{task.category}</Badge>
                <Badge variant="outline">{task.priority}</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="mb-4">
                {task.description || "Sem descrição"}
              </CardDescription>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {task.createdAt.toLocaleDateString('pt-BR')}
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
