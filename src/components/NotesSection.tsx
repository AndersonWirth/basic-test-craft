
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Calendar, Edit, Trash2, FileText, Loader2 } from "lucide-react";
import { useNotes } from "@/hooks/useNotes";

export const NotesSection = () => {
  const { notes, loading, addNote, updateNote, deleteNote } = useNotes();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [editingNote, setEditingNote] = useState<any>(null);
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    tags: "",
  });

  const filteredNotes = notes.filter((note) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      note.title.toLowerCase().includes(searchLower) ||
      (note.content && note.content.toLowerCase().includes(searchLower)) ||
      note.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  });

  const handleAddNote = async () => {
    if (!newNote.title.trim()) {
      return;
    }

    const result = await addNote({
      title: newNote.title,
      content: newNote.content,
      tags: newNote.tags.split(",").map(tag => tag.trim()).filter(tag => tag),
    });

    if (result) {
      setNewNote({ title: "", content: "", tags: "" });
      setIsAddingNote(false);
    }
  };

  const handleUpdateNote = async () => {
    if (!editingNote || !newNote.title.trim()) {
      return;
    }

    await updateNote(editingNote.id, {
      title: newNote.title,
      content: newNote.content,
      tags: newNote.tags.split(",").map(tag => tag.trim()).filter(tag => tag),
    });

    setEditingNote(null);
    setNewNote({ title: "", content: "", tags: "" });
  };

  const startEditing = (note: any) => {
    setEditingNote(note);
    setNewNote({
      title: note.title,
      content: note.content || "",
      tags: note.tags.join(", "),
    });
  };

  const cancelEditing = () => {
    setEditingNote(null);
    setNewNote({ title: "", content: "", tags: "" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando anotações...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar anotações..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Dialog open={isAddingNote || !!editingNote} onOpenChange={(open) => {
          if (!open) {
            setIsAddingNote(false);
            cancelEditing();
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsAddingNote(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Anotação
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingNote ? "Editar Anotação" : "Adicionar Nova Anotação"}
              </DialogTitle>
              <DialogDescription>
                {editingNote 
                  ? "Modifique as informações da anotação."
                  : "Crie uma nova anotação para suas atividades de TI."
                }
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input
                placeholder="Título da anotação *"
                value={newNote.title}
                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
              />
              <Textarea
                placeholder="Conteúdo da anotação..."
                value={newNote.content}
                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                rows={8}
              />
              <Input
                placeholder="Tags (separadas por vírgula)"
                value={newNote.tags}
                onChange={(e) => setNewNote({ ...newNote, tags: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsAddingNote(false);
                cancelEditing();
              }}>
                Cancelar
              </Button>
              <Button onClick={editingNote ? handleUpdateNote : handleAddNote}>
                {editingNote ? "Salvar Alterações" : "Adicionar Anotação"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredNotes.map((note) => (
          <Card key={note.id} className="relative group">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg line-clamp-2">{note.title}</CardTitle>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEditing(note)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteNote(note.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{new Date(note.created_at).toLocaleDateString('pt-BR')}</span>
                {new Date(note.updated_at) > new Date(note.created_at) && (
                  <span className="text-xs">(editado)</span>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="mb-4 line-clamp-4 whitespace-pre-wrap">
                {note.content || "Sem conteúdo"}
              </CardDescription>
              {note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {note.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredNotes.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma anotação encontrada</h3>
          <p className="text-muted-foreground">
            {searchTerm 
              ? "Tente ajustar o termo de busca" 
              : "Adicione sua primeira anotação para começar"
            }
          </p>
        </div>
      )}
    </div>
  );
};
