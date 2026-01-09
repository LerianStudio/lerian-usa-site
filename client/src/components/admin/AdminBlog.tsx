import { useState } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { CategoryMultiSelect } from "@/components/CategoryMultiSelect";
import { AdminBlogCategories } from "./AdminBlogCategories";
import { FormError } from "@/components/FormError";
import { useFormValidation } from "@/hooks/useFormValidation";
import { Pagination } from "@/components/Pagination";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function AdminBlog() {
  const { t } = useI18n();
  const utils = trpc.useUtils();
  const { data: posts, isLoading } = trpc.blog.getAllPosts.useQuery();
  const { data: categories } = trpc.blog.getCategories.useQuery();
  const [activeTab, setActiveTab] = useState("posts");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [contentPt, setContentPt] = useState("");
  const [contentEn, setContentEn] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { errors, validateField, validateForm, clearAllErrors } = useFormValidation({
    rules: {
      titlePt: [
        {
          validate: (v) => v && v.trim().length > 0,
          message: "Título em português é obrigatório",
        },
        {
          validate: (v) => !v || v.length <= 500,
          message: "Título não pode exceder 500 caracteres",
        },
      ],
      titleEn: [
        {
          validate: (v) => v && v.trim().length > 0,
          message: "Title in English is required",
        },
        {
          validate: (v) => !v || v.length <= 500,
          message: "Title cannot exceed 500 characters",
        },
      ],
      contentPt: [
        {
          validate: (v) => v && v.trim().length > 0,
          message: "Conteúdo em português é obrigatório",
        },
      ],
      contentEn: [
        {
          validate: (v) => v && v.trim().length > 0,
          message: "Content in English is required",
        },
      ],
      slug: [
        {
          validate: (v) => v && v.trim().length > 0,
          message: "Slug é obrigatório",
        },
        {
          validate: (v) => !v || /^[a-z0-9-]+$/.test(v),
          message: "Slug deve conter apenas letras minúsculas, números e hífens",
        },
      ],
      categoryId: [
        {
          validate: (v) => v && !isNaN(parseInt(v)),
          message: "Categoria é obrigatória",
        },
      ],
    },
  });

  const addCategoriesMutation = trpc.blog.addBlogPostCategories.useMutation();

  const createMutation = trpc.blog.createPost.useMutation({
    onSuccess: async (result) => {
      // Add categories if any selected
      if (selectedCategories.length > 0 && result.id) {
        await addCategoriesMutation.mutateAsync({
          postId: result.id,
          categoryIds: selectedCategories,
        });
      }
      utils.blog.getAllPosts.invalidate();
      utils.blog.getPosts.invalidate();
      toast.success(t("common.success"));
      setDialogOpen(false);
      setEditingPost(null);
      setSelectedCategories([]);
    },
  });

  const updateMutation = trpc.blog.updatePost.useMutation({
    onSuccess: async () => {
      // Update categories if any selected
      if (editingPost && selectedCategories.length >= 0) {
        await addCategoriesMutation.mutateAsync({
          postId: editingPost.id,
          categoryIds: selectedCategories,
        });
      }
      utils.blog.getAllPosts.invalidate();
      utils.blog.getPosts.invalidate();
      toast.success(t("common.success"));
      setDialogOpen(false);
      setEditingPost(null);
      setSelectedCategories([]);
    },
  });

  const deleteMutation = trpc.blog.deletePost.useMutation({
    onSuccess: () => {
      utils.blog.getAllPosts.invalidate();
      utils.blog.getPosts.invalidate();
      toast.success(t("common.success"));
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const formValues = {
      titlePt: formData.get("titlePt") as string,
      titleEn: formData.get("titleEn") as string,
      contentPt: contentPt || (formData.get("contentPt") as string),
      contentEn: contentEn || (formData.get("contentEn") as string),
      slug: formData.get("slug") as string,
      categoryId: formData.get("categoryId") as string,
    };

    // Validate form
    if (!validateForm(formValues)) {
      toast.error("Por favor, corrija os erros no formulário");
      return;
    }

    const published = formData.get("published") === "on";
    const data = {
      titlePt: formValues.titlePt,
      titleEn: formValues.titleEn,
      contentPt: formValues.contentPt,
      contentEn: formValues.contentEn,
      excerptPt: formData.get("excerptPt") as string,
      excerptEn: formData.get("excerptEn") as string,
      slug: formValues.slug,
      categoryId: parseInt(formValues.categoryId),
      coverImageUrl: imagePreview || (formData.get("coverImageUrl") as string) || undefined,
      authorName: formData.get("authorName") as string || undefined,
      authorLinkedIn: formData.get("authorLinkedIn") as string || undefined,
      published,
      publishedAt: published ? new Date() : undefined,
    };

    if (editingPost) {
      const postId = parseInt(editingPost.id);
      if (isNaN(postId)) {
        toast.error("Erro: ID do post inválido");
        return;
      }
      updateMutation.mutate({ id: postId, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem válida");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB");
      return;
    }

    setUploadingImage(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      setImagePreview(data.url);
      toast.success("Imagem enviada com sucesso!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Erro ao enviar imagem");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDelete = (id: number) => {
    setPostToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (postToDelete) {
      deleteMutation.mutate({ id: postToDelete });
      setDeleteDialogOpen(false);
      setPostToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">{t("admin.blog")}</h2>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="categories">Categorias</TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts" className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Gerenciar Posts</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingPost(null);
              setSelectedCategories([]);
              clearAllErrors();
            }}>
              <Plus className="mr-2 h-4 w-4" />
              {t("admin.create")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPost ? t("admin.edit") : t("admin.create")} Post
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="titlePt">Título (PT)</Label>
                  <Input
                    id="titlePt"
                    name="titlePt"
                    defaultValue={editingPost?.titlePt}
                    required
                    onBlur={(e) => validateField("titlePt", e.target.value)}
                    className={errors.titlePt ? "border-red-500" : ""}
                  />
                  <FormError message={errors.titlePt} />
                </div>
                <div>
                  <Label htmlFor="titleEn">Title (EN)</Label>
                  <Input
                    id="titleEn"
                    name="titleEn"
                    defaultValue={editingPost?.titleEn}
                    required
                    onBlur={(e) => validateField("titleEn", e.target.value)}
                    className={errors.titleEn ? "border-red-500" : ""}
                  />
                  <FormError message={errors.titleEn} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="excerptPt">Resumo (PT)</Label>
                  <Textarea
                    id="excerptPt"
                    name="excerptPt"
                    defaultValue={editingPost?.excerptPt}
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="excerptEn">Excerpt (EN)</Label>
                  <Textarea
                    id="excerptEn"
                    name="excerptEn"
                    defaultValue={editingPost?.excerptEn}
                    rows={2}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Conteúdo (PT) - Markdown</Label>
                  <Tabs defaultValue="edit" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="edit">Editar</TabsTrigger>
                      <TabsTrigger value="preview">Preview</TabsTrigger>
                    </TabsList>
                    <TabsContent value="edit">
                      <Textarea
                        id="contentPt"
                        name="contentPt"
                        value={contentPt || editingPost?.contentPt || ""}
                        onChange={(e) => setContentPt(e.target.value)}
                        rows={8}
                        required
                        placeholder="Use Markdown para formatar o texto...\n\n**Negrito** _Itálico_ [Link](url)\n- Lista\n\`código\`"
                      />
                    </TabsContent>
                    <TabsContent value="preview">
                      <div className="border rounded-md p-4 min-h-[200px] prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {contentPt || editingPost?.contentPt || "*Nenhum conteúdo para visualizar*"}
                        </ReactMarkdown>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>

                <div>
                  <Label>Content (EN) - Markdown</Label>
                  <Tabs defaultValue="edit" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="edit">Edit</TabsTrigger>
                      <TabsTrigger value="preview">Preview</TabsTrigger>
                    </TabsList>
                    <TabsContent value="edit">
                      <Textarea
                        id="contentEn"
                        name="contentEn"
                        value={contentEn || editingPost?.contentEn || ""}
                        onChange={(e) => setContentEn(e.target.value)}
                        rows={8}
                        required
                        placeholder="Use Markdown to format text...\n\n**Bold** _Italic_ [Link](url)\n- List\n\`code\`"
                      />
                    </TabsContent>
                    <TabsContent value="preview">
                      <div className="border rounded-md p-4 min-h-[200px] prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {contentEn || editingPost?.contentEn || "*No content to preview*"}
                        </ReactMarkdown>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="slug">Slug (URL)</Label>
                  <Input
                    id="slug"
                    name="slug"
                    defaultValue={editingPost?.slug}
                    placeholder="meu-post-exemplo"
                    required
                    onBlur={(e) => validateField("slug", e.target.value)}
                    className={errors.slug ? "border-red-500" : ""}
                  />
                  <FormError message={errors.slug} />
                </div>
                <div>
                  <Label htmlFor="categoryId">Categoria</Label>
                  <Select name="categoryId" defaultValue={editingPost?.categoryId?.toString()} required onValueChange={(v) => validateField("categoryId", v)}>
                    <SelectTrigger className={errors.categoryId ? "border-red-500" : ""}>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.namePt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormError message={errors.categoryId} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="authorName">Nome do Autor</Label>
                  <Input
                    id="authorName"
                    name="authorName"
                    defaultValue={editingPost?.authorName}
                    placeholder="João Silva"
                  />
                </div>
                <div>
                  <Label htmlFor="authorLinkedIn">LinkedIn do Autor</Label>
                  <Input
                    id="authorLinkedIn"
                    name="authorLinkedIn"
                    defaultValue={editingPost?.authorLinkedIn}
                    placeholder="https://linkedin.com/in/joao-silva"
                    type="url"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-3">
                  <Label htmlFor="coverImage">Imagem de Capa</Label>
                  <Input
                    id="coverImage"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="cursor-pointer"
                  />
                  {uploadingImage && (
                    <p className="text-sm text-muted-foreground mt-2">Enviando imagem...</p>
                  )}
                  {(imagePreview || editingPost?.coverImageUrl) && (
                    <div className="mt-4">
                      <img
                        src={imagePreview || editingPost?.coverImageUrl}
                        alt="Preview"
                        className="max-w-xs h-32 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Switch id="published" name="published" defaultChecked={editingPost?.published} />
                <Label htmlFor="published">{t("admin.published")}</Label>
              </div>

              <CategoryMultiSelect
                type="blog"
                selectedIds={selectedCategories}
                onChange={setSelectedCategories}
              />

              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={createMutation.isPending || updateMutation.isPending}>
                  {t("admin.cancel")}
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {createMutation.isPending || updateMutation.isPending ? (
                    <>
                      <span className="inline-block animate-spin mr-2">⏳</span>
                      {editingPost ? "Atualizando..." : "Criando..."}
                    </>
                  ) : (
                    t("admin.save")
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">{t("common.loading")}</p>
      ) : posts && posts.length > 0 ? (
        <div className="space-y-4">
          <div className="grid gap-4">
            {posts
              .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
              .map((post) => (
            <Card key={post.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <CardTitle>{post.titlePt}</CardTitle>
                      {post.published ? (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          {t("admin.published")}
                        </span>
                      ) : (
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                          {t("admin.draft")}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {post.publishedAt && format(new Date(post.publishedAt), "PPP")}
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingPost(post);
                        setSelectedCategories([]);
                        setDialogOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(post.id)}
                      disabled={deleteMutation.isPending}
                    >
                      {deleteMutation.isPending ? (
                        <span className="inline-block animate-spin">⏳</span>
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {post.excerptPt && (
                <CardContent>
                  <p className="text-sm text-muted-foreground">{post.excerptPt}</p>
                </CardContent>
              )}
            </Card>
            ))}
          </div>
          {posts.length > itemsPerPage && (
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(posts.length / itemsPerPage)}
              onPageChange={setCurrentPage}
              isLoading={isLoading}
            />
          )}
        </div>
      ) : (
        <p className="text-muted-foreground">Nenhum post cadastrado.</p>
      )}

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Excluir post do blog?"
        description="Esta ação não pode ser desfeita. O post será permanentemente excluído."
      />
          </TabsContent>
          
          <TabsContent value="categories">
            <AdminBlogCategories />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
