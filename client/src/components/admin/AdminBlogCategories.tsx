import { useState } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";

export function AdminBlogCategories() {
  const { t } = useI18n();
  const utils = trpc.useUtils();
  const { data: categories, isLoading } = trpc.blog.getCategories.useQuery();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);

  const createMutation = trpc.blog.createCategory.useMutation({
    onSuccess: () => {
      utils.blog.getCategories.invalidate();
      toast.success(t("common.success"));
      setDialogOpen(false);
      setEditingCategory(null);
    },
  });

  const updateMutation = trpc.blog.updateCategory.useMutation({
    onSuccess: () => {
      utils.blog.getCategories.invalidate();
      toast.success(t("common.success"));
      setDialogOpen(false);
      setEditingCategory(null);
    },
  });

  const deleteMutation = trpc.blog.deleteCategory.useMutation({
    onSuccess: () => {
      utils.blog.getCategories.invalidate();
      toast.success(t("common.success"));
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data = {
      namePt: formData.get("namePt") as string,
      nameEn: formData.get("nameEn") as string,
      slug: formData.get("slug") as string,
    };

    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id: number) => {
    setCategoryToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (categoryToDelete) {
      deleteMutation.mutate({ id: categoryToDelete });
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Categorias do Blog</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingCategory(null)}>
              <Plus className="mr-2 h-4 w-4" />
              {t("admin.create")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? t("admin.edit") : t("admin.create")} Categoria
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="namePt">Nome (PT)</Label>
                <Input
                  id="namePt"
                  name="namePt"
                  defaultValue={editingCategory?.namePt}
                  required
                />
              </div>
              <div>
                <Label htmlFor="nameEn">Name (EN)</Label>
                <Input
                  id="nameEn"
                  name="nameEn"
                  defaultValue={editingCategory?.nameEn}
                  required
                />
              </div>
              <div>
                <Label htmlFor="slug">Slug (URL)</Label>
                <Input
                  id="slug"
                  name="slug"
                  defaultValue={editingCategory?.slug}
                  placeholder="categoria-exemplo"
                  required
                />
              </div>
              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  {t("admin.cancel")}
                </Button>
                <Button type="submit">
                  {t("admin.save")}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">{t("common.loading")}</p>
      ) : categories && categories.length > 0 ? (
        <div className="grid gap-4">
          {categories.map((category) => (
            <Card key={category.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle>{category.namePt}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {category.nameEn}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Slug: {category.slug}
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingCategory(category);
                        setDialogOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(category.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">Nenhuma categoria encontrada</p>
      )}

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Deletar Categoria"
        description="Tem certeza que deseja deletar esta categoria? Esta ação não pode ser desfeita."
      />
    </div>
  );
}
