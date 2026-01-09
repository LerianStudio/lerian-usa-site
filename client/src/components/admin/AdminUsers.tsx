import { useState } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Pencil, Trash2, Download, ExternalLink } from "lucide-react";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { Pagination } from "@/components/Pagination";
import { format } from "date-fns";

export function AdminUsers() {
  const { t } = useI18n();
  const utils = trpc.useUtils();
  const { data: users, isLoading } = trpc.users.getAll.useQuery();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [jobTitleFilter, setJobTitleFilter] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const updateMutation = trpc.users.update.useMutation({
    onSuccess: () => {
      utils.users.getAll.invalidate();
      toast.success(t("common.success"));
      setDialogOpen(false);
      setEditingUser(null);
    },
  });

  const deleteMutation = trpc.users.delete.useMutation({
    onSuccess: () => {
      utils.users.getAll.invalidate();
      toast.success(t("common.success"));
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    updateMutation.mutate({
      id: editingUser.id,
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      jobTitle: formData.get("jobTitle") as string,
      company: formData.get("company") as string || undefined,
      linkedin: formData.get("linkedin") as string || undefined,
      role: formData.get("role") as "user" | "admin",
    });
  };

  const handleDelete = (id: number, name: string) => {
    setUserToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (userToDelete !== null) {
      deleteMutation.mutate({ id: userToDelete });
      setUserToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const handleExportExcel = () => {
    if (!users || users.length === 0) {
      toast.error("Nenhum usuário para exportar");
      return;
    }

    // Create CSV content
    const headers = ["ID", "Nome", "Email", "Cargo", "Empresa", "LinkedIn", "Função", "Data de Cadastro"];
    const rows = users.map(user => [
      user.id,
      user.name || "",
      user.email || "",
      user.jobTitle || "",
      user.company || "",
      user.linkedin || "",
      user.role,
      format(new Date(user.createdAt), "dd/MM/yyyy HH:mm"),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(",")),
    ].join("\\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `usuarios_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    
    toast.success("Arquivo exportado com sucesso!");
  };

  // Filter and search logic
  const filteredUsers = users?.filter((user) => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.company?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesJobTitle = jobTitleFilter === "all" || user.jobTitle === jobTitleFilter;
    
    return matchesSearch && matchesRole && matchesJobTitle;
  }) || [];

  // Get unique job titles for filter
  const uniqueJobTitles = Array.from(
    new Set(users?.map((u) => u.jobTitle).filter(Boolean))
  ).sort();

  const handleClearFilters = () => {
    setSearchTerm("");
    setRoleFilter("all");
    setJobTitleFilter("all");
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciar Usuários</h2>
        <Button onClick={handleExportExcel} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Exportar Excel
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuários Cadastrados ({filteredUsers.length} de {users?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Input
                  placeholder="Buscar por nome, email ou empresa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por função" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as funções</SelectItem>
                    <SelectItem value="user">Usuário</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={jobTitleFilter} onValueChange={setJobTitleFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os cargos</SelectItem>
                    {uniqueJobTitles.map((title) => (
                      <SelectItem key={title} value={title!}>
                        {title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {(searchTerm || roleFilter !== "all" || jobTitleFilter !== "all") && (
              <Button variant="outline" size="sm" onClick={handleClearFilters}>
                Limpar filtros
              </Button>
            )}
          </div>


          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Nome</th>
                  <th className="text-left p-2">Email</th>
                  <th className="text-left p-2">Cargo</th>
                  <th className="text-left p-2">Empresa</th>
                  <th className="text-left p-2">LinkedIn</th>
                  <th className="text-left p-2">Função</th>
                  <th className="text-left p-2">Cadastro</th>
                  <th className="text-right p-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers
                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                  .map((user) => (
                  <tr key={user.id} className="border-b hover:bg-muted/50">
                    <td className="p-2">{user.name}</td>
                    <td className="p-2">{user.email}</td>
                    <td className="p-2">{user.jobTitle || "-"}</td>
                    <td className="p-2">{user.company || "-"}</td>
                    <td className="p-2">
                      {user.linkedin ? (
                        <a
                          href={user.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline inline-flex items-center gap-1"
                        >
                          Ver perfil
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        user.role === "admin" ? "bg-primary/20 text-primary" : "bg-muted"
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-2 text-sm text-muted-foreground">
                      {format(new Date(user.createdAt), "dd/MM/yyyy")}
                    </td>
                    <td className="p-2 text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingUser(user);
                          setDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(user.id, user.name || "este usuário")}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredUsers.length > itemsPerPage && (
            <div className="mt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(filteredUsers.length / itemsPerPage)}
                onPageChange={setCurrentPage}
                isLoading={isLoading}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={editingUser?.name || ""}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={editingUser?.email || ""}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Cargo</Label>
                <Input
                  id="jobTitle"
                  name="jobTitle"
                  defaultValue={editingUser?.jobTitle || ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Empresa</Label>
                <Input
                  id="company"
                  name="company"
                  defaultValue={editingUser?.company || ""}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                name="linkedin"
                type="url"
                defaultValue={editingUser?.linkedin || ""}
                placeholder="https://www.linkedin.com/in/..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Função</Label>
              <Select name="role" defaultValue={editingUser?.role || "user"}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Usuário</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                Salvar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Excluir usuário?"
        description="Esta ação não pode ser desfeita. O usuário será permanentemente excluído do sistema."
      />
    </div>
  );
}
