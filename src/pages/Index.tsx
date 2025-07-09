import { useAuth } from "@/contexts/AuthContext";
import { AuthPage } from "@/components/AuthPage";
import { TaskManager } from "@/components/TaskManager";
import { NotesSection } from "@/components/NotesSection";
import { Dashboard } from "@/components/Dashboard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Monitor, ClipboardList, StickyNote, BarChart3, LogOut, Loader2 } from "lucide-react";
import { useState, useRef } from "react";

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const taskManagerRef = useRef<{ applyFilter: (filter: { status?: string; priority?: string }) => void }>(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const handleNavigateToTasks = () => {
    setActiveTab("tasks");
  };

  const handleNavigateToNotes = () => {
    setActiveTab("notes");
  };

  const handleNavigateToTasksWithFilter = (filter: { status?: string; priority?: string }) => {
    setActiveTab("tasks");
    // Aplicar filtro após um pequeno delay para garantir que o componente foi renderizado
    setTimeout(() => {
      taskManagerRef.current?.applyFilter(filter);
    }, 100);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Monitor className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">IT Manager Pro</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground">
                Olá, {user.email}
              </span>
              <Button variant="outline" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Tarefas
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex items-center gap-2">
              <StickyNote className="h-4 w-4" />
              Anotações
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Relatórios
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Dashboard 
              onNavigateToTasks={handleNavigateToTasks}
              onNavigateToNotes={handleNavigateToNotes}
              onNavigateToTasksWithFilter={handleNavigateToTasksWithFilter}
            />
          </TabsContent>

          <TabsContent value="tasks">
            <TaskManager ref={taskManagerRef} />
          </TabsContent>

          <TabsContent value="notes">
            <NotesSection />
          </TabsContent>

          <TabsContent value="reports">
            <div className="text-center py-12">
              <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Relatórios em Desenvolvimento</h3>
              <p className="text-muted-foreground">Esta seção estará disponível em breve.</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
